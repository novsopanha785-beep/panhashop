export const FALLBACK_IMAGE = 'https://dummyjson.com/image/400x400?text=No+Image';

/**
 * Shared `(error)` handler for <img> elements. Swaps a broken image for a
 * placeholder once, and never loops if the placeholder itself fails to load.
 */
export function handleImageError(event: Event): void {
  const img = event.target as HTMLImageElement | null;

  if (!img || img.dataset['fallback'] === 'true') {
    return;
  }

  img.dataset['fallback'] = 'true';
  img.src = FALLBACK_IMAGE;
}
