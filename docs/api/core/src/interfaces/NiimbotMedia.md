[**niimbot**](../../../README.md)

***

[niimbot](../../../README.md) / [core/src](../README.md) / NiimbotMedia

# Interface: NiimbotMedia

A media catalog entry.

## Extends

- [`MediaDescriptor`](/contracts/api/interfaces/MediaDescriptor)

## Properties

### key

> **key**: `string`

Stable UPPER_SNAKE key, as in `MEDIA.B_LABEL_50X80_GAP`.

***

### labelTypeId

> **labelTypeId**: [`NiimbotLabelTypeId`](../type-aliases/NiimbotLabelTypeId.md)

***

### targetModels

> **targetModels**: readonly `string`[]

Chassis-family tags matched against a device's `mediaCompatibility`.

#### Overrides

`MediaDescriptor.targetModels`
