# Troubleshooting

::: warning Pre-alpha
The driver isn't written yet. This page collects known issues as they
come up.
:::

## The Bluetooth picker shows unrelated devices

The picker filters on the first letters of every NIIMBOT model name,
because advertised names don't follow niimbluelib's model names. Pick
the device whose name matches your printer's label.

## Linux: no permission on `/dev/ttyACM0`

Add your user to the `dialout` group (or your distribution's
equivalent) and log in again.
