# Node.js

::: warning Not implemented yet
:::

`@thermal-label/niimbot-node` will open NIIMBOT printers over USB serial
(115200 baud) through `@thermal-label/transport`'s `SerialTransport`:

```ts
import { discovery } from '@thermal-label/niimbot-node';

const printer = await discovery.openPrinter({ serialPath: '/dev/ttyACM0' });
```

Bluetooth from Node isn't planned until `@thermal-label/transport` has a
Node BLE transport. `listPrinters()` returns an empty list in v1.
