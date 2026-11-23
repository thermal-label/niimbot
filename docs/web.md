# Web

::: warning Not implemented yet
:::

`@thermal-label/niimbot-web` will connect over Web Bluetooth and Web
Serial:

```ts
import { requestPrinters } from '@thermal-label/niimbot-web';

// From a click handler — browser pickers need a user gesture.
const printers = await requestPrinters({ transport: 'bluetooth-gatt' });
const printer = printers.primary!;
```

The printer is identified from the model ID it reports after
connecting. If that matches nothing, `requestPrinters` throws
`DeviceIdentificationRequiredError`; resume with `continueWith(key)`.
