# Getting started

::: warning Pre-alpha
The device registry and media catalog are published. The printer driver
isn't written yet, so there is nothing to print with today. Follow
[the design](https://github.com/thermal-label/niimbot/blob/main/plans/design.md)
for progress.
:::

`niimbot` is the thermal-label driver for NIIMBOT label printers. It
wraps [niimbluelib](https://github.com/MultiMote/niimbluelib), which
speaks the NIIMBOT protocol, and ships in three packages:

| Package                       | When to use                                                                |
| ----------------------------- | -------------------------------------------------------------------------- |
| `@thermal-label/niimbot-core` | Device registry, media catalog, and the printer adapter. No platform APIs. |
| `@thermal-label/niimbot-node` | Node.js: USB serial.                                                       |
| `@thermal-label/niimbot-web`  | Browser: Web Bluetooth and Web Serial.                                     |

## Install

```bash
pnpm add @thermal-label/niimbot-web     # browser
pnpm add @thermal-label/niimbot-node    # Node.js
```

## Look up a model

```ts
import { DEVICES, findDeviceByModelId, findMediaByDimensions } from '@thermal-label/niimbot-core';

DEVICES.B2_PRO.engines[0].headDots; // 576
findDeviceByModelId(6912)?.key; // 'B2_PRO'
findMediaByDimensions(50, 80)?.key; // 'B_LABEL_50X80_GAP'
```

## Which models are supported?

Every model niimbluelib knows has a registry entry. A model counts as
verified only once someone has tested it through this driver; see
[Hardware](./hardware) and the [verification checklist](./verification-checklist).
