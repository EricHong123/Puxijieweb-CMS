export const MODEL_SLUG_TO_ID = {
  g31: 'qw-g31',
  g34: 'qw-g34',
  'c-01': 'qw-c-01',
  'c-01-cotton': 'qw-c-01-cotton',
  a5: 'qw-a5',
  f19: 'qw-f19',
  g29: 'qw-g29',
  g21: 'qw-g21',
  g23: 'qw-g23',
  g06: 'qw-g06',
  g14: 'qw-g14',
  'me-728': 'me-728',
  'me-136': 'me-136',
  'me-76': 'me-76',
  'me-88p': 'me-88p',
  'me-636': 'me-636',
  'me-176': 'me-176',
};

export const MODEL_ID_TO_SLUG = Object.fromEntries(
  Object.entries(MODEL_SLUG_TO_ID).map(([slug, id]) => [id, slug])
);

export function getModelSlugById(productId) {
  return MODEL_ID_TO_SLUG[productId] || null;
}

