# niimbot — Hardware reference

The consumer-facing hardware page is [`docs/hardware.md`](./docs/hardware.md);
the generated device table lives there and in the README. This file holds
the facts a maintainer reaches for when a new unit arrives.

## Family in one paragraph

Mostly Bluetooth LE first; many models also expose USB CDC-ACM serial at
115200 baud (VID:PID `3513:0002` on the B1 and B2 Pro). One GATT
characteristic carries both directions, under service
`e7810a71-73ae-499d-8c15-faa9aef0c3f2`. 203 or 300 dpi, 1 bpp, with
red/black on some Pro chassis. All protocol work happens in niimbluelib.

## What a real unit has confirmed through this driver

Nothing yet. The driver isn't written.

Earlier results from outside this driver, for orientation only:

| Unit | Path | Result |
| --- | --- | --- |
| B2 Pro (fw 2.09) | niimbluelib 0.49.1 `D110M_V4` task, standalone script, USB serial | mono and red/black print correctly |

## Adding a model

1. Make sure niimbluelib knows it (`modelsLibrary`). If it doesn't,
   that's an upstream PR first.
2. Add an entry to `packages/core/data/overlay.json5` for what you
   checked: advertised BLE name prefix, serial, colours, media families.
3. Run the verification checklist and record the results in
   `verifications`.
