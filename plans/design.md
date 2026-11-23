# niimbot — design

Status: draft, 2026-11-23. Revision 2, after review.

This driver is a thin [thermal-label](https://github.com/thermal-label)
adapter around [niimbluelib](https://github.com/MultiMote/niimbluelib)
(`@mmote/niimbluelib`, MIT). niimbluelib owns the NIIMBOT wire protocol:
packet framing, per-model print tasks, image encoding, heartbeat and RFID
parsing, and the model table. This repo owns the thermal-label parts: the
`PrinterAdapter` / `PrinterDiscovery` / `requestPrinters` surface, the
device registry the docs site and harness read, a small media catalog,
preview, and docs.

Places where this design leaves the path the other drivers follow are
marked **⤴ Off-path** and collected in [§10](#10-off-path-summary).

Constraint: no new release of `@thermal-label/contracts` or
`@thermal-label/transport`. The driver builds against what's on npm today
(contracts 0.6.3, transport 0.6.1).

---

## 1. Goals and non-goals

**Goals (v1)**

- Print mono and red/black labels on the models niimbluelib can drive,
  from the browser (Web Bluetooth, Web Serial) and Node (USB serial).
- Same public shape as brother-ql / labelwriter / marklife: the same
  exports, docs pages, data files, hooks and CI. The docs site and harness
  can then add it like any other driver.
- Keep the NIIMBOT protocol code in one place, upstream.

**Non-goals (v1)**

- Our own protocol code. If niimbluelib gets something wrong, fix it
  upstream.
- CLI support. The CLI only loads drivers on a fixed list and can't open a
  serial printer that `listPrinters()` didn't return. marklife has the same
  gap; both get fixed together in the CLI later.
- Grayscale (`0x8d`) printing. Not bench-verified, and contracts has no way
  to ask for it ([§7.5](#75-grayscale)).
- Heat-shrink tube printing (`tubeType` / `tubeWidthMm`). Tube media is left
  out of the catalog for v1.
- Node BLE. `@thermal-label/transport` has no Node BLE transport.
- A faster LZO print path for Pro chassis. Classic `0x8a` rows print colour
  correctly.

## 2. Package layout

Same three packages as the other drivers. pnpm workspace, ESM,
vitest, typedoc. All packages share one version number, bumped by hand
for now (no changesets).

```
packages/
  core/  @thermal-label/niimbot-core  registry, media, preview, NiimbotPrinter,
                                      TransportNiimbotClient. No platform APIs.
  node/  @thermal-label/niimbot-node  `discovery` (NiimbotDiscovery), serial only
  web/   @thermal-label/niimbot-web   requestPrinters(): Web Bluetooth + Web Serial
```

| package | runtime dependencies |
|---|---|
| core | `@thermal-label/contracts` `^0.6.3`, `@mmote/niimbluelib` **exact**, `@mbtech-nl/bitmap` |
| node | core, `@thermal-label/transport` `^0.6.1`, `serialport` (transport only declares it as an optional peer) |
| web | core, `@thermal-label/transport` `^0.6.1` |

> **⤴ Off-path: exact pin on a third-party runtime dependency.** Siblings
> use caret ranges and have no third-party protocol dependency. niimbluelib's
> README says the API can change at any time and asks for exact versions.
> Upgrades are deliberate PRs that re-run the bench checklist.

> **⤴ Off-path: core is not a pure encoder.** In the other drivers `*-core`
> holds the protocol encoder. Here `core` holds no protocol code. It holds
> the adapter, which in the siblings lives in `node`/`web`. One adapter class
> serves both platforms, because niimbluelib's client is platform-neutral.
> `node` and `web` only differ in how they open a `Transport`.

Known side effects of the niimbluelib dependency:

- It pulls in `@capacitor/core`. On import, that package sets
  `globalThis.Capacitor` and registers plugins, in Node too. We can't avoid
  this until upstream makes the Capacitor packages optional ([§9](#9-upstream-niimbluelib-asks)).
- Its `.d.ts` files need DOM, Web Bluetooth and Web Serial types, and
  TS ≥ 5.7 (`Uint8Array<ArrayBuffer>`). The family's TS 5.5 config only
  compiles against them because `skipLibCheck` is on. Keep it on, and add
  `@types/web-bluetooth` / `@types/w3c-web-serial` as dev deps where needed.

## 3. Architecture

```
            PrinterAdapter (contracts)
                    │
              NiimbotPrinter            core: print/status mapping, serializer, preview
                    │  uses
           NiimbotAbstractClient        niimbluelib: packets, print tasks, encoder
                    │  subclass
          TransportNiimbotClient        core: our shim
                    │
          Transport (contracts)
          ├─ SerialTransport          (node)
          ├─ WebSerialTransport       (web)
          └─ WebBluetoothTransport    (web, via fromCharacteristics)
```

One `NiimbotAbstractClient` subclass on a thermal-label `Transport` covers
every link, as proposed in
[thermal-label/.github#3](https://github.com/thermal-label/.github/issues/3).
We don't use niimbluelib's own `NiimbotBluetoothClient` /
`NiimbotSerialClient`. So we don't get their reconnect and retry handling;
we accept that for v1.

`NiimbotPrinter` is built from a connected `TransportNiimbotClient` and a
resolved `DeviceEntry`.

### 3.1 `TransportNiimbotClient`

Implements `connect`, `disconnect`, `isConnected`, `sendRaw` and `getType`
on a contracts `Transport`.

**RX: the shim hands niimbluelib only complete, valid frames.** It can't
pass raw chunks through, for two reasons:

- `processRawPacket` throws its whole buffer away if the buffer doesn't
  start with `55 55`.
- If a frame starts with `55 55` but fails to parse (bad tail, bad
  checksum), niimbluelib **keeps** it at the head of its buffer. Every later
  packet then fails behind it until disconnect. This is reproduced on 0.49.1:
  good, bad-tail, good, good delivers one packet, not three.

So the read loop:

1. reads until it sees the `55 55` preamble, discarding anything before it;
2. reads `CMD LEN`. Commands in niimbluelib's exported `twoByteLengthPackets`
   / `crc32Packets` lists get the right header size;
3. reads the body, checksum and `aa aa` tail;
4. checks the tail and checksum. A bad frame is dropped and logged, and the
   loop resyncs. A good frame goes to `processRawPacket()`.

A head-read timeout is normal while the printer is idle; the loop retries.
The loop exits when the transport closes.

> **⤴ Off-path: the shim knows NIIMBOT framing.** niimbluelib expects data
> pushed in as it arrives. A contracts `Transport` only offers
> `read(length)`. On top of that, niimbluelib can't recover from a bad frame
> by itself. So the shim validates frames, which is a thin slice of protocol
> knowledge on our side. Way back: an optional `Transport.onData` in
> contracts, plus an upstream fix so the parser resyncs after a bad frame.

**TX.** `sendRaw` sleeps `packetIntervalMs` (default 10 ms), writes, and emits
`rawpacketsent`. This all runs inside the client's mutex unless `force` is
set, the same as niimbluelib's own clients.

- **The sleep is required.** Without it, B1-class chassis print the first
  row and drop the rest.
- Sleep with niimbluelib's `Utils.sleep`. It runs in a Worker, so browsers
  don't throttle it in background tabs.

**Lifecycle**

- `connect()` starts the read loop, then calls `negotiateAndGetPrinterInfo()`.
- `disconnect()` stops the read loop, then closes the transport.

**niimbluelib settings, applied in the constructor.** Without these,
niimbluelib sends packets by itself, outside our serializer:

- `setHeartbeatAutoStart(false)`: no heartbeat timer.
- `setFetchRfidOnPrintEnd(false)`: no RFID read after each print.
- `setHeartbeatMaxFails(0)`: niimbluelib never disconnects by itself.

`fetchHeartbeatData()` also starts an RFID read on its own when the lid or
RFID state changes. So the adapter never calls it, and calls `client.protocol.*`
directly instead ([§7.3](#73-status)).

**Forced model.** When the caller passes a `deviceKey` and the printer
can't be identified, the shim sets the protected `printerInfo.modelId` from
the registry entry. Otherwise niimbluelib doesn't know `printDirection` or
the head width, and sends a head width of `0` in every row packet.

### 3.2 Web

Web Bluetooth is the main path: most NIIMBOT printers are Bluetooth-first,
and the main use case is printing from the browser.

| `ConnectOptions.transport` | transport | picker |
|---|---|---|
| `bluetooth-gatt` | `WebBluetoothTransport.fromCharacteristics()` | ours, see below |
| `serial` | `WebSerialTransport` | Web Serial port picker |
| `usb`, `bluetooth-spp` | — | throws `UnsupportedOperationError` |

Bluetooth connect:

1. `navigator.bluetooth.requestDevice`, with `optionalServices` set to the
   NIIMBOT service `e7810a71-73ae-499d-8c15-faa9aef0c3f2`.
   - Filters are name prefixes, because the B1's 2024+ firmware doesn't
     advertise that service.
   - We compute the prefixes from niimbluelib's `modelsLibrary`.
     niimbluelib's own helper (`getAllModelFirstLetters`) isn't exported,
     and model enum names don't match advertised names anyway (`B21_PRO`
     vs `B2 Pro-…`).
   - The result is 15 single letters, so the picker also shows unrelated
     nearby devices. We accept that for v1. Hand-checked advertised
     prefixes in the registry overlay ([§4.2](#42-overlay)) can tighten the
     filter later.
2. `gatt.connect()`. Search the primary services for a characteristic with
   notify + write-without-response, as niimbluelib's own client does.
3. `startNotifications()`, then
   `WebBluetoothTransport.fromCharacteristics(device, char, undefined, mtu)`.
   One characteristic carries TX and RX (transport DECISIONS D6).
   - **Pass `mtu` explicitly.** The default is 20 bytes, with a
     `setTimeout(0)` between chunks. niimbluelib writes each packet in one
     write. A 576-dot row packet is about 80 bytes. Whether the firmware
     reassembles packets split into 20-byte chunks is unverified. Bench
     this ([§8](#8-testing)).
4. `TransportNiimbotClient` → identify ([§4.3](#43-identification)) →
   `NiimbotPrinter`.

> **⤴ Off-path (has precedent): the driver owns the Bluetooth picker.**
> `WebBluetoothTransport.request(config)` takes a single `namePrefix`.
> marklife and letratag already call `requestDevice` themselves.
> `fromCharacteristics` exists for exactly this.

`requestPrinters(opts)` returns a `PrinterAdapterMap` keyed by role
(`{ primary }`). `devicesForTransport` is exported as in marklife.

### 3.3 Node

`export const discovery = new NiimbotDiscovery()`, which implements
`PrinterDiscovery`. Same as the siblings.

- `listPrinters()` returns `[]` in v1, as marklife's does. (CLI support is a
  non-goal, see §1.) Later: `SerialPort.list()` filtered by VID, then a
  short open of each port to read `modelId`. VID:PID alone doesn't tell the
  chassis apart: B1 and B2 Pro both report `3513:0002`.
- `openPrinter({ serialPath, deviceKey?, baudRate? })` opens a
  `SerialTransport` at 115200, then the shim, then identification, then a
  `NiimbotPrinter`. With no `serialPath` it throws `DeviceNotFoundError`.
- `listMedia()` returns the catalog.

## 4. Device registry

### 4.1 Generated from niimbluelib

The registry is **generated at build time from niimbluelib's
`modelsLibrary`**, with a small hand-kept overlay on top. We don't
hand-curate a model list. Every niimbluelib model gets a `DeviceEntry`,
and upgrading niimbluelib brings in its new models.

We still need a registry file at all because:

- the docs site's compatibility matrix and hardware pages read
  `packages/core/data/devices.json`;
- the harness and `verifications` key on registry entries;
- `PrinterAdapter.device` is a `DeviceEntry`.

From niimbluelib (`PrinterModelMeta`) per model:

- `key` = the `PrinterModel` name (`B1`, `D110_M`, `B2_PRO`, …) and
  `name` = `NIIMBOT <model>`;
- `dpi`, `headDots` (`printheadPixels`), `printDirection`;
- the density range and default;
- `id[]`, used for identification.

**Protocol tag.** Each engine's `protocol` is set from niimbluelib's static
`modelPrintTasks` mapping, e.g. `niimbot-b1`, `niimbot-d110`,
`niimbot-d110m-v4`. In 0.49.1, **only 19 of the 77 models have a static
print task**. The other 58 can only print if their firmware reports
protocol ≥ 4, where niimbluelib falls back to `D110M_V4` (B2 Pro works this
way).

- Those 58 get a per-model tag, `niimbot-auto-<key>`. That way contracts'
  `expandVerifications` never treats them as siblings of each other.
- **Why per-task tags matter:** contracts marks a device "expected to work"
  on a transport when another device with the same protocol tag is verified
  there. With one shared tag, a single verified B2 Pro would mark every
  NIIMBOT model as expected.

> **⤴ Off-path: generated registry.** Siblings hand-write one json5 file per
> model. We generate the entries and hand-write only the overlay. Model
> specs then live in one place (niimbluelib), and so do the protocol details.

Docs say plainly: *model support follows niimbluelib; a model counts as
verified only once someone has tested it on real hardware.* Unverified
models are listed, but every cell is empty (unverified).

### 4.2 Overlay

`data/overlay.json5`, keyed by model. It holds only what niimbluelib
doesn't have, or gets wrong:

- `verifications` and `support` (required by contracts);
- `colors`: `['black', 'red']` for red/black chassis. niimbluelib's model
  metadata has no colour field;
- `transports`: hand-checked advertised Bluetooth `namePrefix`, and
  whether `serial` is offered. USB VID:PID is documentation only. Contracts'
  `serial` transport config has no USB IDs, and a `usb` key would advertise
  a transport we don't support;
- `mediaCompatibility`, so media is matched per chassis family. Without it
  an entry accepts all media;
- `printTask`: an override for when niimbluelib's pick is wrong;
- corrections to niimbluelib data: B2 Pro `headDots` 576, not 567. Each
  correction is also reported upstream.

Engine capabilities get a typed `NiimbotEngineCapabilities` (colors,
printTask, mediaDetection) in core.

Seed the overlay from the six legacy entries (D11, D110, D110_M, B1,
B21_PRO, B2_PRO). Migrate their `support: { status }` into contracts
`verifications`. Cells only hold verified / partial / unsupported; an absent
cell means unverified. Legacy `recipe` and packet-shape fields are dropped.

### 4.3 Identification

After connect, the reported `modelId` is matched against each entry's `id[]`.
We don't need our own `printerCode` field.

1. An explicit `deviceKey` wins. The shim forces `modelId` from it
   ([§3.1](#31-transportniimbotclient)).
2. Otherwise, the identified model.
3. Otherwise:
   - Web throws `DeviceIdentificationRequiredError(devices, continueWith)`.
     `continueWith(key)` reuses the client that's already connected; it
     doesn't open a second picker.
   - Node throws `DeviceNotFoundError`.

## 5. Media catalog

A small starting set of common roll sizes per chassis family, with
`labelTypeId`, carried over from the legacy catalog. It grows as rolls get
tested.

Matching:

- `findMediaByBarcode` (RFID barcode) first, then `findMediaByDimensions`.
- `labelTypeId` maps to niimbluelib's `PrintOptions.labelType`. Without it,
  print tasks default to `WithGaps`. That gives wrong paper sensing on
  continuous, transparent and black-mark rolls.
- Red/black stock carries a `palette` with black and red.

To check: whether some chassis report roll dimensions over RFID. If they
do, size matching works with no catalog entry for that roll.

## 6. Exports

The same surface as the siblings, so the docs site, the harness and (later)
the CLI find what they expect:

- **core:** `REGISTRY_NIIMBOT`, `DEVICES`, `MEDIA`, `DEFAULT_MEDIA`,
  `ROTATE_DIRECTION`, `PROTOCOLS`, `findDevice*` / `findMedia*`,
  `createPreviewOffline`, `NiimbotPrinter`, `TransportNiimbotClient`, types.
  `files` ships `data/devices.json` and `data/media.json`.
- **node:** `discovery`, `NiimbotDiscovery`, plus re-exports of core.
- **web:** `requestPrinters`, `devicesForTransport`,
  `DeviceIdentificationRequiredError`, plus re-exports of core.

## 7. `NiimbotPrinter` (core)

`implements PrinterAdapter`, `family: 'niimbot'`.

### 7.1 Serialisation

Every client-touching method runs through one `WriteSerializer`, as
contracts require. niimbluelib's mutex covers one request/response pair, not
a whole job. The settings in §3.1 make sure nothing else talks to the
printer.

> **⤴ Off-path (niimbluelib usage):** niimbluelib's own apps run its
> heartbeat timer and automatic RFID reads. We turn both off and do all I/O
> through our serializer.

### 7.2 Print

`print(image, media?, options?)`:

1. Resolve the media: argument → last detected → `MediaNotSpecifiedError`.
2. Rotate with `pickRotation`. Render planes with `@mbtech-nl/bitmap`:
   `renderImage` for mono media, `renderMultiPlaneImage` for palette media.
3. Wrap the planes in an `ImageSource`:
   - `getPixelColor` returns only `0xffffff`, `0x000000` or `0xff0000`.
     niimbluelib treats anything not exactly white as black.
   - Out-of-range coordinates return white. The encoder asks for padding
     columns before its bounds check.
   - The source does the head rotation itself. `ImageEncoder` passes
     `printDirection` (`left` / `top`) into `getPixelColor` and expects the
     source to map coordinates. `left` = 90° clockwise.
4. Choose `PageColorType`. `DoubleColor` only if all of these hold:
   - the media palette has red;
   - `printerInfo.supportColor` is true. The printer reports it at connect;
     this is the real per-device signal;
   - the print task supports double colour;
   - the overlay's `colors` agree, where an entry has them.
   The `B1` task claims double colour but also drives mono printers, so the
   task check alone isn't enough. Red media on a mono printer throws a clear
   error; it doesn't silently print in black.
5. Create the task with `totalPages = copies`, `labelType` from the media
   and `density`. Then `printInit` → `printPage(image, copies)` →
   `waitForPageFinished` → `waitForFinished`, with **`task.printEnd()`** in
   `finally`. Call the task's `printEnd`, not `client.protocol.printEnd()`:
   `D110M_V4` overrides it to send the extra packet the B21 Pro needs.
6. Density follows the contracts rules:
   - `'light'` / `'normal'` / `'dark'` map to the model's `densityMin` /
     `densityDefault` / `densityMax`;
   - any other string throws `UnsupportedOperationError`;
   - `NiimbotPrintOptions.densityLevel` (number, clamped) is the escape
     hatch, as in marklife;
   - default is `densityDefault`, not the task's flat default of 2.

> **⤴ Off-path (minor): two rotation steps.** `pickRotation` decides how
> the picture sits on the label. Our `ImageSource` separately rotates for
> the head direction. Cover both with an orientation test per direction.

### 7.3 Status

- `getStatus()`, inside the serializer:
  - heartbeat via `client.protocol.heartbeat()`;
  - RFID via `client.protocol.*` calls, only when the heartbeat shows a
    roll change or there's no detected media yet. A full RFID read is 3
    requests.
  - The result maps to `PrinterStatus`: `ready`, `mediaLoaded`, lid/paper →
    `errors`, battery, `detectedMedia`.
  - `rawBytes` comes from a `packetreceived` listener. The fetch methods
    return parsed objects only.
  - Errors propagate. Don't copy `fetchHeartbeatData`'s swallow-and-return-
    `undefined` behaviour.
- `onStatus()`: `pollingOnStatus()` (4 s default) on top of `getStatus()`.
  NIIMBOT printers don't push status.
- `createPreview()` / `createPreviewOffline()`: ported from legacy
  `preview.ts`.

### 7.4 Media detection timing

The RFID timeout went up to 5.5 s after 0.49.1 (upstream `35110a7`). On
0.49.1, slow chassis may time out on the RFID read. Treat that as "no
detected media", not an error.

### 7.5 Grayscale

Not in v1, and no separate `printGrayscale()` method. Once the `0x8d` bench
run passes, decide in contracts how a job asks for grayscale, then add it.

## 8. Testing

Coverage floors as in the siblings: 90% lines in core; marklife's 90/85
split where branches are hard to reach.

- **Unit:** registry generation and overlay merge, media lookups, `ImageSource`
  (quantisation, out-of-range, both directions), `PageColorType` selection,
  density mapping, status mapping.
- **Shim:** fake `Transport`. Cover:
  - framing and chunked RX;
  - resync after garbage;
  - a frame that starts with `55 55` but has a garbage body or bad tail;
  - long-header commands;
  - pacing, with fake timers;
  - clean shutdown.
- **Adapter:** over niimbluelib's `NiimbotVirtualClient`. It answers any
  unmatched packet with NotSupported, so fixtures need wildcard entries for
  row packets.
- **Fixtures:** recorded packet dumps contain the printer's serial and MAC.
  Scrub both before committing.
- **Bench checklist** (`docs/verification-checklist.md`), per model and
  transport:
  - mono, red/black where supported, copies > 1;
  - continuous / black-mark rolls;
  - RFID detection;
  - Web Bluetooth at the chosen MTU;
  - B1 over USB serial, to confirm decision 2 in §11.

  The only result so far is B2 Pro mono + red/black over USB serial, from a
  standalone script. That isn't our shim and isn't Bluetooth, so no cell is
  marked verified yet.

Legacy golden-byte tests are not ported. They tested our own encoder.

## 9. Upstream (niimbluelib) asks

Not blockers.

1. Make the Capacitor packages optional peer deps. Today every install and
   bundle gets them, and importing sets `globalThis.Capacitor`.
2. Make the packet parser resync after a bad frame, instead of keeping it at
   the head of the buffer.
3. Add an explicit `B2_PRO` print-task mapping, and fix B2 Pro
   `printheadPixels` (567 → 576).
4. Export `getAllModelFirstLetters`, or better, advertised name prefixes
   per model.
5. Ship an ESM build (today: CJS + UMD only).
6. `isHeartbeatStarted()` returns the inverse.

## 10. Off-path summary

| # | Where | Departure | Why | Way back |
|---|---|---|---|---|
| 1 | deps | Exact pin on `@mmote/niimbluelib` | Upstream API isn't stable | Caret range once upstream hits 1.0 |
| 2 | core | Adapter lives in core; no protocol code | One platform-neutral client serves both platforms | — |
| 3 | shim | Shim validates NIIMBOT frames before handing them over | Pull-only `Transport`; niimbluelib stalls on a bad frame | `Transport.onData` + upstream parser resync |
| 4 | web | Driver runs its own Bluetooth picker, then `fromCharacteristics` | `request()` takes one `namePrefix` | Precedent: marklife, letratag |
| 5 | registry | Entries generated from niimbluelib + a hand-kept overlay | Model specs and protocol stay upstream; all models listed | — |
| 6 | niimbluelib usage | Heartbeat, auto-RFID and auto-disconnect off; all I/O through our serializer | Contracts' serialisation guarantee | — |
| 7 | print | Two rotation steps (`pickRotation` + `ImageSource` head mapping) | Picture orientation vs head orientation | — (test it) |

Still on the path:

- three-package layout and lockstep versions;
- `devices.json` / `media.json` data files;
- standard exports, `PrinterAdapter` / `PrinterDiscovery` / `requestPrinters`;
- `DeviceIdentificationRequiredError`, `@mbtech-nl/bitmap` rendering,
  `WriteSerializer`, `pollingOnStatus`;
- contracts density semantics;
- pacing kept in the driver (transport D7);
- docs, hooks and CI as in [§12](#12-scaffold).

## 11. Decisions

Decided (2026-11-23):

1. All niimbluelib models get a registry entry, unverified until tested
   (§4.1).
2. The B1's USB is treated as a serial (CDC-ACM) port, with no WebUSB path.
   Older notes said 2024+ B1 firmware only talks on USB Printer Class; this
   gets confirmed on the bench (§8).
3. No porting of niimbluelib's BLE/serial reconnect and retry handling for
   v1.
4. The media catalog starts with a small set of common sizes (§5).
5. CLI support waits for a joint CLI fix with marklife (§1).

## 12. Scaffold

Lands together with this plan, in the repo's initial commit. It holds no
driver code, but it gets `pnpm build`, `pnpm test`, `pnpm lint`, the hooks
and CI green, and makes the repo ready for the docs site. It is modelled on
labelwriter (root tooling, CI) and marklife (package layout).

**Root**

- `package.json`:
  - the sibling scripts: build, test, test:coverage, lint, format,
    typecheck, docs:api, docs:hardware;
  - `prepare`, which installs `.githooks`;
  - `author: MBTech`.
- `pnpm-workspace.yaml`, `tsconfig.base.json`, `eslint.config.js`
  (`@mbtech-nl/eslint-config`), prettier config, `typedoc.json`.
- `.gitignore` (including `research/`).
- `.githooks/pre-push`: regenerates typedoc and fails if `docs/api` changed.
- `README.md`, `LICENSE`, `DECISIONS.md` (seeded from §10/§11),
  `PROGRESS.md`, `HARDWARE.md`.

**CI**

- `.github/workflows/ci.yml`: Node 20/22/24 matrix; lint, format check,
  typecheck, test with coverage, codecov on 24.
- `.github/workflows/release.yml`: `pnpm publish` on a `v*` tag, with a check that
  the package version matches the tag.

**Packages**

- `packages/{core,node,web}`: `package.json` (exports, `files`, lockstep
  version), `tsconfig.json`, `vitest.config.ts` with coverage floors, and
  `src/index.ts` stubs.
- `packages/core/scripts/compile-data.mjs`:
  - `modelsLibrary` + `data/overlay.json5` → `data/devices.json` and
    `src/devices.generated.ts`;
  - `data/media.json5` → `data/media.json` and `src/media.generated.ts`.
  - Runs as `prebuild`, `pretest` and `pretypecheck`.
- `scripts/build-hardware-table.mjs` → `HARDWARE.md`.

**Docs**

- `docs/index.md` and `docs/getting-started.md` (the docs site requires
  both), plus `core.md`, `node.md`, `web.md`, `hardware.md`,
  `verification-checklist.md`, `troubleshooting.md`.
- `docs/protocol/` says the protocol is niimbluelib's and links its docs
  and the community wiki.

**Data seed**

- `data/overlay.json5` with the six legacy models, migrated per §4.2.
- `data/media.json5` with the seed set from §5.

**Follow-ups in other repos** (not part of the scaffold PR):

- docs site: set `enabled: true` in `drivers.json` after the first npm
  publish, and map the `niimbot-*` protocol tags in
  `build-hardware-page.mjs`;
- harness: a niimbot app with a mock built on `NiimbotVirtualClient`. The
  existing harness-niimbot branch targets the old
  `(device, transport)` constructor;
- CLI: together with marklife (§1).
