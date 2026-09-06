import { contentApi } from '../api/adminApi';

let cachedLogoUrl;
let inflight;
const listeners = new Set();

export function clearSiteLogoCache() {
  cachedLogoUrl = undefined;
  inflight = undefined;
}

export function notifySiteLogoChanged(logoUrl) {
  cachedLogoUrl = logoUrl || '';
  listeners.forEach((fn) => fn(cachedLogoUrl));
}

export function subscribeSiteLogo(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function getSiteLogoUrl() {
  if (cachedLogoUrl !== undefined) return cachedLogoUrl;
  if (!inflight) {
    inflight = contentApi
      .site()
      .then(({ data }) => {
        cachedLogoUrl = data.data.settings?.logoUrl || '';
        listeners.forEach((fn) => fn(cachedLogoUrl));
        return cachedLogoUrl;
      })
      .catch(() => {
        if (cachedLogoUrl === undefined) cachedLogoUrl = '';
        return cachedLogoUrl;
      })
      .finally(() => {
        inflight = undefined;
      });
  }
  return inflight;
}
