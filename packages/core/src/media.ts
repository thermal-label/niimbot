import type { DeviceEntry } from '@thermal-label/contracts';
import { MEDIA, type MediaKey } from './media.generated.js';
import type { NiimbotMedia } from './types.js';

/** The niimbot media catalog, keyed by stable `key`. */
export { MEDIA, type MediaKey };

/** Every catalog entry. */
export const ALL_MEDIA: readonly NiimbotMedia[] = Object.values(MEDIA);

/** Default media when the caller doesn't specify one. */
export const DEFAULT_MEDIA: NiimbotMedia = MEDIA.B_LABEL_40X30_GAP;

/** Find a media entry by the RFID barcode of a roll. */
export function findMediaByBarcode(barcode: string): NiimbotMedia | undefined {
  return ALL_MEDIA.find(m => m.skus?.includes(barcode));
}

/**
 * Find a media entry by size. Without `heightMm`, matches continuous
 * stock of that width. With `device`, only media the device accepts.
 */
export function findMediaByDimensions(
  widthMm: number,
  heightMm?: number,
  device?: DeviceEntry,
): NiimbotMedia | undefined {
  const accepted = device?.engines[0]?.mediaCompatibility;
  return ALL_MEDIA.find(m => {
    if (m.widthMm !== widthMm) return false;
    if (heightMm === undefined ? m.heightMm !== undefined : m.heightMm !== heightMm) return false;
    return accepted === undefined || m.targetModels.some(t => accepted.includes(t));
  });
}
