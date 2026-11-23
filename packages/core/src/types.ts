import type {
  DeviceEntry,
  DeviceRegistry,
  MediaDescriptor,
  PrintEngineCapabilities,
} from '@thermal-label/contracts';

/**
 * Render-time effective status: the contracts' stored verification
 * rungs plus `'expected'` (propagated) and `'unverified'` (no claim).
 * Mirrors `EffectiveStatus` in `@thermal-label/contracts`.
 */
export type EffectiveStatus = 'verified' | 'partial' | 'unsupported' | 'expected' | 'unverified';

/** A registry entry with the rolled-up `supportStatus` stamped on by codegen. */
export type RegistryDeviceEntry = DeviceEntry & { supportStatus: EffectiveStatus };

/** Registry shape with `supportStatus` on each device. */
export type RegistryWithStatus = Omit<DeviceRegistry, 'devices'> & {
  devices: readonly RegistryDeviceEntry[];
};

/** Ink colours a chassis can print. */
export type NiimbotColor = 'black' | 'red';

/**
 * Driver-specific engine capabilities. Most fields come from
 * niimbluelib's model library at build time; `colors` and `printTask`
 * come from `data/overlay.json5`.
 */
export interface NiimbotEngineCapabilities extends PrintEngineCapabilities {
  /** niimbluelib `PrinterModel` name. Equal to the registry key. */
  niimbluelibModel: string;
  /** Model IDs the printer reports in `PrinterInfo`. */
  modelIds: readonly number[];
  /** Head orientation niimbluelib encodes rows for. */
  printDirection: 'left' | 'top';
  densityMin: number;
  densityMax: number;
  densityDefault: number;
  /** Inks the chassis prints. Absent when nobody has checked. */
  colors?: readonly NiimbotColor[];
  /** niimbluelib `PrintTaskName` override. */
  printTask?: string;
}

/**
 * niimbluelib `LabelType` values used by the catalog:
 * 1 = WithGaps, 2 = Black, 3 = Continuous, 4 = Perforated,
 * 5 = Transparent, 10 = BlackMarkGap.
 */
export type NiimbotLabelTypeId = 1 | 2 | 3 | 4 | 5 | 10;

/** A media catalog entry. */
export interface NiimbotMedia extends MediaDescriptor {
  /** Stable UPPER_SNAKE key, as in `MEDIA.B_LABEL_50X80_GAP`. */
  key: string;
  /** Chassis-family tags matched against a device's `mediaCompatibility`. */
  targetModels: readonly string[];
  labelTypeId: NiimbotLabelTypeId;
}
