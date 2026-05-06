// Google Analytics Data API (GA4) client
// Uses OAuth 2.0 refresh token — no service account needed

interface RunReportRequest {
  dateRanges: { startDate: string; endDate: string }[];
  metrics: { name: string }[];
  dimensions?: { name: string }[];
  orderBys?: { dimension?: { dimensionName: string }; metric?: { metricName: string }; desc: boolean }[];
  limit?: number;
}

interface RunReportResponse {
  rows?: {
    dimensionValues?: { value: string }[];
    metricValues?: { value: string }[];
  }[];
  totals?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[];
  rowCount?: number;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(env: Record<string, unknown>): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token;
  }

  const clientId = env.GA_CLIENT_ID as string | undefined;
  const clientSecret = env.GA_CLIENT_SECRET as string | undefined;
  const refreshToken = env.GA_REFRESH_TOKEN as string | undefined;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('GA_CLIENT_ID, GA_CLIENT_SECRET, or GA_REFRESH_TOKEN not configured');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GA token refresh failed: ${res.status} ${err}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

export async function runGAReport(
  env: Record<string, unknown>,
  propertyId: string,
  report: RunReportRequest,
): Promise<RunReportResponse> {
  const token = await getAccessToken(env);

  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(report),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GA API error: ${res.status} ${err}`);
  }

  return res.json() as Promise<RunReportResponse>;
}

export function buildOverviewReport(): RunReportRequest {
  return {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
    ],
  };
}

export function buildPageviewReport(): RunReportRequest {
  return {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [{ name: 'screenPageViews' }],
    dimensions: [{ name: 'date' }],
    orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
  };
}

export function buildTopPagesReport(limit = 10): RunReportRequest {
  return {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [{ name: 'screenPageViews' }],
    dimensions: [{ name: 'pagePath' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit,
  };
}

// Build country report for world map
export function buildCountryReport(): RunReportRequest {
  return {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [{ name: 'activeUsers' }],
    dimensions: [{ name: 'country' }],
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    limit: 50,
  };
}

// Build device category report
export function buildDeviceReport(): RunReportRequest {
  return {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [{ name: 'activeUsers' }],
    dimensions: [{ name: 'deviceCategory' }],
  };
}

// Build traffic source report
export function buildTrafficSourceReport(): RunReportRequest {
  return {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [{ name: 'activeUsers' }],
    dimensions: [{ name: 'sessionSource' }],
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    limit: 10,
  };
}
