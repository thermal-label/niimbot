# Protocol

This driver has no NIIMBOT protocol code of its own.
[niimbluelib](https://github.com/MultiMote/niimbluelib) implements it:
packet framing, per-model print tasks, image encoding, heartbeat and
RFID. The [NIIMBOT community wiki](https://printers.niim.blue/)
documents the protocol and the models.

The one piece of protocol knowledge here is in the transport shim: it
validates each incoming frame (`55 55` head, checksum, `aa aa` tail)
before handing it to niimbluelib. See
[the design](https://github.com/thermal-label/niimbot/blob/main/plans/design.md).
