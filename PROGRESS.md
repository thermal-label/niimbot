# PROGRESS — niimbot

Implementation log against [`plans/design.md`](./plans/design.md).
Each step gates on `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.

## Step 1 — Scaffold

- [x] Root tooling: `package.json`, `pnpm-workspace.yaml`,
      `tsconfig.base.json`, eslint, prettier, typedoc
- [x] `.githooks/pre-push` (typedoc drift check)
- [x] `.github/workflows/{ci,release}.yml`, `FUNDING.yml`
- [x] `packages/{core,node,web}` with lockstep versions
- [x] `compile-data.mjs`: registry from niimbluelib `modelsLibrary` +
      `data/overlay.json5`; media from `data/media.json5`
- [x] Overlay seeded with D11, D110, D110_M, B1, B21_PRO, B2_PRO
- [x] Media seeded with 8 entries
- [x] `scripts/build-hardware-table.mjs`, `docs/`, `README.md`,
      `DECISIONS.md`, `HARDWARE.md`

## Step 2 — `TransportNiimbotClient` (design § 3.1)

- [ ] Frame-validating read loop with resync
- [ ] Paced `sendRaw`
- [ ] Connect / disconnect lifecycle, niimbluelib auto-behaviour off
- [ ] Tests against a fake `Transport`

## Step 3 — `NiimbotPrinter` (design § 7)

- [ ] `ImageSource` (quantised, out-of-range white, head rotation)
- [ ] Print: colour mode, label type, copies, density
- [ ] Status: heartbeat, RFID, `pollingOnStatus`
- [ ] Preview
- [ ] Tests over `NiimbotVirtualClient`

## Step 4 — node / web

- [ ] `discovery` with `openPrinter({ serialPath })`
- [ ] `requestPrinters` for `bluetooth-gatt` and `serial`
- [ ] `DeviceIdentificationRequiredError` with `continueWith`

## Step 5 — Bench

- [ ] Verification checklist runs per model and transport
- [ ] Overlay `verifications` updated from the results
