#!/usr/bin/env node
// Compiles the niimbot device registry and media catalog into runtime
// artifacts:
//
//   - data/devices.json         rich DeviceRegistry (with verificationGrid +
//                               supportStatus) for the docs site and other
//                               non-TS consumers
//   - data/media.json           flat media list, same role
//   - src/devices.generated.ts  typed registry consumed by src/devices.ts
//   - src/media.generated.ts    typed media map consumed by src/media.ts
//
// Unlike the other drivers, device entries are not hand-written. Every
// model in niimbluelib's `modelsLibrary` becomes an entry, and
// data/overlay.json5 adds what niimbluelib doesn't carry (verifications,
// colours, BLE name prefixes, media compatibility, corrections). See
// plans/design.md § 4.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSON5 from 'json5';
import { expandVerifications } from '@thermal-label/contracts';
import niimbluelib from '@mmote/niimbluelib';

const { modelsLibrary, modelPrintTasks, printTaskNames } = niimbluelib;

const DRIVER = 'niimbot';
const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OVERLAY_JSON5 = resolve(PACKAGE_ROOT, 'data/overlay.json5');
const MEDIA_JSON5 = resolve(PACKAGE_ROOT, 'data/media.json5');
const DEVICES_JSON = resolve(PACKAGE_ROOT, 'data/devices.json');
const MEDIA_JSON = resolve(PACKAGE_ROOT, 'data/media.json');
const DEVICES_TS = resolve(PACKAGE_ROOT, 'src/devices.generated.ts');
const MEDIA_TS = resolve(PACKAGE_ROOT, 'src/media.generated.ts');

// NIIMBOT GATT service and the characteristic niimbluelib finds by its
// properties (notify + write-without-response). The UUID is a fallback
// for docs and for chassis that only expose this one.
const BLE_SERVICE = 'e7810a71-73ae-499d-8c15-faa9aef0c3f2';
const BLE_CHARACTERISTIC = 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f';
const SERIAL_BAUD = 115200;

const MEDIA_FAMILIES = new Set(['niimbot-d-series', 'niimbot-b-series', 'niimbot-b-pro-series']);
const LABEL_TYPES = new Set([1, 2, 3, 4, 5, 10]);
const COLORS = new Set(['black', 'red']);
const OVERLAY_FIELDS = new Set([
  'name',
  'colors',
  'bluetoothPrefix',
  'serial',
  'mediaCompatibility',
  'printTask',
  'headDots',
  'support',
  'verifications',
]);

const errors = [];
const fail = msg => errors.push(msg);

// ---------------------------------------------------------------------------
// Protocol tags
//
// contracts' expandVerifications lifts a device to "expected" when another
// device with the same engine protocol is verified on the same transport.
// So the tag must mean "same print task": niimbot-<task>. Models without a
// static task in niimbluelib only print through the protocol >= 4 fallback
// and get a per-model tag, so they never lift each other.

const taskSlug = task => task.toLowerCase().replace(/_/g, '-');
const keySlug = key => key.toLowerCase().replace(/_/g, '-');

function staticTaskFor(model) {
  let versioned;
  for (const [task, entries] of Object.entries(modelPrintTasks)) {
    for (const e of entries ?? []) {
      if (e === model) return task;
      if (typeof e === 'object' && e.m === model) versioned ??= task;
    }
  }
  return versioned;
}

function protocolFor(model, override) {
  if (override !== undefined) return `niimbot-${taskSlug(override)}`;
  const task = staticTaskFor(model);
  return task ? `niimbot-${taskSlug(task)}` : `niimbot-auto-${keySlug(model)}`;
}

// ---------------------------------------------------------------------------
// Devices

const overlay = JSON5.parse(readFileSync(OVERLAY_JSON5, 'utf8'));
const modelNames = new Set(modelsLibrary.map(m => m.model));

for (const [key, o] of Object.entries(overlay)) {
  if (!modelNames.has(key)) fail(`overlay: "${key}" is not a niimbluelib PrinterModel`);
  for (const field of Object.keys(o)) {
    if (!OVERLAY_FIELDS.has(field)) fail(`overlay.${key}: unknown field "${field}"`);
  }
  if (o.colors && !o.colors.every(c => COLORS.has(c))) fail(`overlay.${key}: bad colors`);
  if (o.printTask && !printTaskNames.includes(o.printTask)) {
    fail(`overlay.${key}: unknown printTask "${o.printTask}"`);
  }
  for (const tag of o.mediaCompatibility ?? []) {
    if (!MEDIA_FAMILIES.has(tag)) fail(`overlay.${key}: unknown mediaCompatibility "${tag}"`);
  }
}

const devices = [...modelsLibrary]
  .sort((a, b) => a.model.localeCompare(b.model, 'en', { numeric: true }))
  .map(meta => {
    const key = meta.model;
    const o = overlay[key] ?? {};

    const transports = {
      'bluetooth-gatt': {
        serviceUuid: BLE_SERVICE,
        txCharacteristicUuid: BLE_CHARACTERISTIC,
        ...(o.bluetoothPrefix !== undefined && { namePrefix: o.bluetoothPrefix }),
      },
      ...(o.serial === true && { serial: { defaultBaud: SERIAL_BAUD } }),
    };

    const capabilities = {
      mediaDetection: true,
      niimbluelibModel: key,
      modelIds: meta.id,
      printDirection: meta.printDirection,
      densityMin: meta.densityMin,
      densityMax: meta.densityMax,
      densityDefault: meta.densityDefault,
      ...(o.colors && { colors: o.colors }),
      ...(o.printTask && { printTask: o.printTask }),
    };

    return {
      key,
      name: o.name ?? `NIIMBOT ${key.replace(/_/g, ' ')}`,
      family: DRIVER,
      transports,
      engines: [
        {
          role: 'primary',
          protocol: protocolFor(key, o.printTask),
          dpi: meta.dpi,
          headDots: o.headDots ?? meta.printheadPixels,
          ...(o.mediaCompatibility && { mediaCompatibility: o.mediaCompatibility }),
          capabilities,
        },
      ],
      support: o.support ?? { status: 'untested' },
      ...(o.verifications && { verifications: o.verifications }),
    };
  });

// ---------------------------------------------------------------------------
// Media

const media = JSON5.parse(readFileSync(MEDIA_JSON5, 'utf8'));
const mediaKeys = new Set();
for (const [i, m] of media.entries()) {
  const where = `media[${i}] (${m.key ?? '?'})`;
  if (typeof m.key !== 'string' || !/^[A-Z0-9_]+$/.test(m.key)) fail(`${where}: bad key`);
  if (mediaKeys.has(m.key)) fail(`${where}: duplicate key`);
  mediaKeys.add(m.key);
  for (const f of ['id', 'name', 'type']) {
    if (typeof m[f] !== 'string') fail(`${where}: missing ${f}`);
  }
  if (typeof m.widthMm !== 'number') fail(`${where}: missing widthMm`);
  if (!LABEL_TYPES.has(m.labelTypeId)) fail(`${where}: bad labelTypeId ${m.labelTypeId}`);
  if (!Array.isArray(m.targetModels) || m.targetModels.length === 0) {
    fail(`${where}: targetModels required`);
  } else {
    for (const tag of m.targetModels) {
      if (!MEDIA_FAMILIES.has(tag)) fail(`${where}: unknown targetModels tag "${tag}"`);
    }
  }
}

if (errors.length > 0) {
  console.error(`[compile-data] ${errors.length} error(s):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Emit

const expanded = expandVerifications({ schemaVersion: 1, driver: DRIVER, devices });

const richDevices = devices.map((d, i) => ({
  ...d,
  verificationGrid: expanded.devices[i].verificationGrid,
  supportStatus: expanded.devices[i].supportStatus,
}));
const leanDevices = devices.map((d, i) => {
  const { verifications: _v, ...rest } = d;
  return { ...rest, supportStatus: expanded.devices[i].supportStatus };
});

writeFileSync(
  DEVICES_JSON,
  JSON.stringify({ schemaVersion: 1, driver: DRIVER, devices: richDevices }, null, 2) + '\n',
);
writeFileSync(
  MEDIA_JSON,
  JSON.stringify({ schemaVersion: 1, driver: DRIVER, media }, null, 2) + '\n',
);

const header = sources => `// AUTO-GENERATED by scripts/compile-data.mjs from ${sources}.
// Edit those, not this file. Run \`pnpm run compile-data\`.
`;

const keyUnion = keys => (keys.length > 0 ? keys.map(k => `'${k}'`).join(' | ') : 'never');

writeFileSync(
  DEVICES_TS,
  `${header("niimbluelib's modelsLibrary and data/overlay.json5")}
import type { RegistryDeviceEntry, RegistryWithStatus } from './types.js';

export type DeviceKey = ${keyUnion(leanDevices.map(d => d.key))};

const DEVICE_LIST: readonly RegistryDeviceEntry[] = ${JSON.stringify(leanDevices, null, 2)};

export const REGISTRY: RegistryWithStatus = {
  schemaVersion: 1,
  driver: '${DRIVER}',
  devices: DEVICE_LIST,
};

export const DEVICES: Readonly<Record<DeviceKey, RegistryDeviceEntry>> = {
${leanDevices.map((d, i) => `  ${d.key}: DEVICE_LIST[${i}]!,`).join('\n')}
};

export const PROTOCOL_TAGS: readonly string[] = ${JSON.stringify(
    [...new Set(leanDevices.map(d => d.engines[0].protocol))].sort(),
  )};
`,
);

writeFileSync(
  MEDIA_TS,
  `${header('data/media.json5')}
import type { NiimbotMedia } from './types.js';

export type MediaKey = ${keyUnion(media.map(m => m.key))};

export const MEDIA: Readonly<Record<MediaKey, NiimbotMedia>> = {
${media.map(m => `  ${m.key}: ${JSON.stringify(m)},`).join('\n')}
};
`,
);

const staticCount = devices.filter(d => !d.engines[0].protocol.startsWith('niimbot-auto-')).length;
console.log(
  `[compile-data] ${devices.length} devices (${staticCount} with a static print task, ` +
    `${Object.keys(overlay).length} with overlay), ${media.length} media`,
);
