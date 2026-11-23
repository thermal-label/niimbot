# Verification checklist — niimbot

A model counts as verified on a transport only after a run through this
driver. Results from other tools don't count.

Per model and transport (Web Bluetooth, Web Serial, Node serial):

1. Connect. The printer identifies as the right registry entry.
2. Print a mono label on die-cut gap stock.
3. Print with copies > 1.
4. Print on continuous or black-mark stock, if the model takes it.
5. Red/black models: print a red/black label on red/black stock.
6. RFID: the loaded roll is detected (`getStatus().detectedMedia`).
7. Web Bluetooth only: note the MTU used and whether long rows print
   cleanly.

Model-specific:

- **B1 over USB:** confirm it talks over USB serial (DECISIONS D5).

## Reporting

Open an issue at <https://github.com/thermal-label/niimbot/issues> with
the model, firmware version, registry key, transport, media, and what
the printer did. Scrub the printer's serial number and MAC address from
any logs.
