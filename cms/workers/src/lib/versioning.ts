import { getSupabase, type Env } from './supabase';

export async function saveVersion(
  env: Env,
  entityType: 'product' | 'news' | 'page',
  entityId: string,
  snapshot: Record<string, unknown>,
  userId?: string,
) {
  const supabase = getSupabase(env);

  // Get next version number
  const { data: last } = await supabase
    .from('content_versions')
    .select('version')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (last?.version || 0) + 1;

  const { error } = await supabase.from('content_versions').insert({
    entity_type: entityType,
    entity_id: entityId,
    version: nextVersion,
    snapshot,
    created_by: userId,
  });

  if (error) console.error('Version save error:', error.message);

  // Keep only last 20 versions per entity
  const { data: old } = await supabase
    .from('content_versions')
    .select('id')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('version', { ascending: false })
    .range(20, 99);

  if (old && old.length > 0) {
    await supabase.from('content_versions').delete().in('id', old.map((r) => r.id));
  }
}

export async function getVersions(env: Env, entityType: string, entityId: string, page = 1, limit = 20) {
  const supabase = getSupabase(env);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('content_versions')
    .select('id, version, created_at, entity_type, entity_id', { count: 'exact' })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('version', { ascending: false })
    .range(from, to);

  if (error) return { success: false, error: error.message };
  return { success: true, data: { items: data, total: count || 0, page, limit } };
}

export async function getVersionSnapshot(env: Env, versionId: string) {
  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from('content_versions')
    .select('*')
    .eq('id', versionId)
    .single();

  if (error) return { success: false, error: 'Version not found' };
  return { success: true, data };
}
