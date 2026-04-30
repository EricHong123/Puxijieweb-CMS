import type { Context, Next } from 'hono';
import { getSupabase, type Env } from './supabase';
import type { AuthUser } from './auth';

interface AuditEntry {
  user_id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  changes: Record<string, any>;
}

function inferEntityType(path: string): string {
  if (path.includes('/products')) return 'product';
  if (path.includes('/news')) return 'news';
  if (path.includes('/pages')) return 'page';
  if (path.includes('/faq')) return 'faq';
  if (path.includes('/legal')) return 'legal';
  if (path.includes('/media')) return 'media';
  if (path.includes('/site-settings')) return 'site_setting';
  return 'unknown';
}

function inferAction(method: string, path: string): string {
  if (method === 'POST') return 'create';
  if (method === 'DELETE') return 'delete';
  if (method === 'PATCH' && path.includes('/publish')) return 'publish';
  if (method === 'PUT' || method === 'PATCH') return 'update';
  return method.toLowerCase();
}

export function auditLog(env: Env, user: AuthUser, method: string, path: string, body?: any) {
  const supabase = getSupabase(env);
  const entityType = inferEntityType(path);
  const action = inferAction(method, path);
  const parts = path.split('/').filter(Boolean);
  const entityId = parts[parts.length - 1];

  // Don't log analytics or health checks
  if (entityType === 'unknown') return;

  const entry: AuditEntry = {
    user_id: user.id,
    user_email: user.email,
    action,
    entity_type: entityType,
    entity_id: entityId.match(/^[0-9a-f-]{36}$/i) ? entityId : parts[parts.length - 2] || entityId,
    changes: body ? sanitizeChanges(body) : {},
  };

  // Fire and forget — don't block the response
  supabase.from('audit_logs').insert(entry).then(({ error }) => {
    if (error) console.error('Audit log error:', error.message);
  });
}

function sanitizeChanges(body: any): Record<string, any> {
  const safe = { ...body };
  // Never log passwords or tokens
  delete safe.password;
  delete safe.token;
  // Truncate large text fields for storage efficiency
  for (const key of Object.keys(safe)) {
    if (typeof safe[key] === 'string' && safe[key].length > 500) {
      safe[key] = safe[key].slice(0, 500) + '...';
    }
  }
  return safe;
}

export function auditMiddleware() {
  return async (c: Context<{ Bindings: Env; Variables: { user?: AuthUser } }>, next: Next) => {
    await next();

    const method = c.req.method;
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return;

    const user = c.get('user');
    if (!user) return;

    let body: any = undefined;
    try {
      if (method !== 'DELETE' && c.res.headers.get('content-type')?.includes('application/json')) {
        body = await c.req.json();
      }
    } catch {}

    auditLog(c.env, user, method, c.req.path, body);
  };
}
