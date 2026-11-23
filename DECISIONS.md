# DECISIONS — niimbot

Decision log. Each entry is a "we chose X over Y because Z" record. The
full reasoning lives in [`plans/design.md`](./plans/design.md); the
"Off-path" markers there are the places this driver departs from the
other thermal-label drivers.

## D1 — Wrap niimbluelib, no protocol code of our own

**Decision.** niimbluelib (`@mmote/niimbluelib`, MIT) owns the NIIMBOT
wire protocol: framing, per-model print tasks, image encoding,
heartbeat and RFID parsing, and the model table. This repo adds the
thermal-label surface on top.

**Why.** niimbluelib is the most complete open implementation and is
actively maintained. A second protocol stack would duplicate it and
drift from it.

**How to apply.** Protocol bugs get fixed upstream. The one piece of
protocol knowledge we keep is frame validation in the transport shim
(design § 3.1).

## D2 — Exact version pin on niimbluelib

**Decision.** `@mmote/niimbluelib` is pinned exactly, not with a caret.

**Why.** Its README says the API can change at any time and asks for
exact versions.

**How to apply.** Upgrades are deliberate PRs that re-run the bench
checklist.

## D3 — Registry generated from niimbluelib, plus an overlay

**Decision.** `scripts/compile-data.mjs` creates one registry entry per
model in niimbluelib's `modelsLibrary`. `data/overlay.json5` adds only
what niimbluelib doesn't carry (verifications, colours, BLE name
prefixes, media compatibility, corrections).

**Why.** Model specs stay in one place, and every niimbluelib model gets
an entry. The docs site and harness still need a registry file.

**How to apply.** Never hand-write a device entry. Add overlay fields
instead, and report data corrections upstream too.

## D4 — Protocol tags follow niimbluelib print tasks

**Decision.** `engines[0].protocol` is `niimbot-<task>` for models with
a static print task in niimbluelib, and `niimbot-auto-<key>` for models
that only print through its protocol ≥ 4 fallback.

**Why.** contracts' `expandVerifications` marks a device "expected" when
another device with the same protocol tag is verified on the same
transport. A single shared tag would mark every NIIMBOT model expected
after one verification.

## D5 — The B1's USB is a serial port

**Decision.** The B1 is treated as a USB CDC-ACM serial device like
every other chassis. No WebUSB path.

**Why.** Older notes said 2024+ B1 firmware only talks on USB Printer
Class. That's treated as an artefact of the old protocol stack until a
bench run says otherwise (verification checklist).

## D6 — CLI support waits

**Decision.** `listPrinters()` returns `[]` in v1 and the CLI can't reach
NIIMBOT printers yet.

**Why.** The CLI only loads drivers from a fixed list and has no
serial-path option. marklife has the same gap; both get fixed together
in the CLI.
