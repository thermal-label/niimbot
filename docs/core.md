# Core

`@thermal-label/niimbot-core` holds the device registry and media catalog today, and will hold the printer adapter (`NiimbotPrinter`) and the niimbluelib transport shim. It has no platform APIs and runs in Node and the browser.

## Registry

- `DEVICES`, `REGISTRY_NIIMBOT`: one entry per niimbluelib model.
- `findDevice(key)`, `findDeviceByModelId(id)`, `findDeviceByName(name)`.
- `engineCapabilities(entry)`: model IDs, print direction, density range, colours.

## Media

- `MEDIA`, `ALL_MEDIA`, `DEFAULT_MEDIA`.
- `findMediaByBarcode(barcode)`, `findMediaByDimensions(widthMm, heightMm?, device?)`.
