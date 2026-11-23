import { describe, expect, it } from 'vitest';
import {
  ALL_MEDIA,
  DEVICES,
  PROTOCOLS,
  REGISTRY_NIIMBOT,
  engineCapabilities,
  findDevice,
  findDeviceByModelId,
  findDeviceByName,
  findMediaByBarcode,
  findMediaByDimensions,
} from '../index.js';

describe('device registry', () => {
  it('has one entry per niimbluelib model', () => {
    expect(REGISTRY_NIIMBOT.devices.length).toBeGreaterThan(50);
    for (const d of REGISTRY_NIIMBOT.devices) {
      expect(d.family).toBe('niimbot');
      expect(engineCapabilities(d).niimbluelibModel).toBe(d.key);
    }
  });

  it('applies overlay corrections', () => {
    expect(DEVICES.B2_PRO.engines[0]?.headDots).toBe(576);
    expect(engineCapabilities(DEVICES.B2_PRO).colors).toEqual(['black', 'red']);
    expect(DEVICES.B2_PRO.transports.serial?.defaultBaud).toBe(115200);
  });

  it('tags engines by print task', () => {
    expect(DEVICES.B1.engines[0]?.protocol).toBe('niimbot-b1');
    expect(DEVICES.D110.engines[0]?.protocol).toBe('niimbot-d110');
    expect(DEVICES.B2_PRO.engines[0]?.protocol).toBe('niimbot-auto-b2-pro');
    for (const d of REGISTRY_NIIMBOT.devices) {
      expect(PROTOCOLS.has(d.engines[0]?.protocol ?? '')).toBe(true);
    }
  });

  it('looks devices up by key, model ID and advertised name', () => {
    expect(findDevice('B1')?.key).toBe('B1');
    expect(findDevice('NOPE')).toBeUndefined();
    expect(findDeviceByModelId(6912)?.key).toBe('B2_PRO');
    expect(findDeviceByModelId(-1)).toBeUndefined();
    expect(findDeviceByName('B2 Pro-H123')?.key).toBe('B2_PRO');
    expect(findDeviceByName('D110_M-1234')?.key).toBe('D110_M');
    expect(findDeviceByName('D110-1234')?.key).toBe('D110');
    expect(findDeviceByName('Unrelated')).toBeUndefined();
  });
});

describe('media catalog', () => {
  it('gives every entry a label type and a chassis family', () => {
    for (const m of ALL_MEDIA) {
      expect(m.labelTypeId).toBeGreaterThan(0);
      expect(m.targetModels.length).toBeGreaterThan(0);
    }
  });

  it('looks media up by size and device', () => {
    expect(findMediaByDimensions(50, 80)?.key).toBe('B_LABEL_50X80_GAP');
    expect(findMediaByDimensions(50)?.key).toBe('B_LABEL_50_CONTINUOUS');
    expect(findMediaByDimensions(50, 80, DEVICES.D110)).toBeUndefined();
    expect(findMediaByDimensions(14, 30, DEVICES.D110)?.key).toBe('D_LABEL_14X30_GAP');
    expect(findMediaByDimensions(99, 99)).toBeUndefined();
  });

  it('returns undefined for unknown barcodes', () => {
    expect(findMediaByBarcode('000000000')).toBeUndefined();
  });
});
