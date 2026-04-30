import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export async function handleScheduledPublish(env: Env) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date().toISOString();
  const tables = [
    { name: 'products', idCol: 'id' },
    { name: 'news_articles', idCol: 'id' },
    { name: 'pages', idCol: 'id' },
  ];

  const results: string[] = [];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table.name)
      .select(table.idCol)
      .eq('is_published', false)
      .not('scheduled_publish_at', 'is', null)
      .lte('scheduled_publish_at', now);

    if (error) {
      console.error(`Scheduled publish check failed for ${table.name}:`, error.message);
      continue;
    }

    if (data && data.length > 0) {
      const ids = data.map((r: any) => r[table.idCol]);
      const { error: updateErr } = await supabase
        .from(table.name)
        .update({ is_published: true, updated_at: now })
        .in(table.idCol, ids);

      if (updateErr) {
        console.error(`Failed to publish ${table.name}:`, updateErr.message);
      } else {
        results.push(`Published ${ids.length} ${table.name}`);
      }
    }
  }

  return results.length > 0 ? results.join(', ') : 'Nothing to publish';
}
