import { useLocation, useParams } from 'react-router-dom';
import { DEFAULT_LOCALE, isSupportedLocale } from '@/shared/lib/i18n.js';

export function useLocale() {
  const params = useParams();
  const location = useLocation();
  const fromParams = params?.locale;
  if (isSupportedLocale(fromParams)) return fromParams;

  const seg = (location.pathname || '/').split('/').filter(Boolean)[0];
  return isSupportedLocale(seg) ? seg : DEFAULT_LOCALE;
}

