[**niimbot**](../../../README.md)

***

[niimbot](../../../README.md) / [core/src](../README.md) / findMediaByDimensions

# Function: findMediaByDimensions()

> **findMediaByDimensions**(`widthMm`, `heightMm?`, `device?`): [`NiimbotMedia`](../interfaces/NiimbotMedia.md) \| `undefined`

Find a media entry by size. Without `heightMm`, matches continuous
stock of that width. With `device`, only media the device accepts.

## Parameters

### widthMm

`number`

### heightMm?

`number`

### device?

[`DeviceEntry`](/contracts/api/interfaces/DeviceEntry)

## Returns

[`NiimbotMedia`](../interfaces/NiimbotMedia.md) \| `undefined`
