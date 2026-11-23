[**niimbot**](../../../README.md)

***

[niimbot](../../../README.md) / [node/src](../README.md) / NiimbotEngineCapabilities

# Interface: NiimbotEngineCapabilities

Driver-specific engine capabilities. Most fields come from
niimbluelib's model library at build time; `colors` and `printTask`
come from `data/overlay.json5`.

## Extends

- [`PrintEngineCapabilities`](/contracts/api/interfaces/PrintEngineCapabilities)

## Indexable

> \[`k`: `string`\]: `unknown`

Driver-specific capability keys land here. Examples today:
`twoColor` (Brother-only, two-colour ribbon path) and
`genuineMediaRequired` (Dymo-only). Promote to a named key when
a second active driver implements with compatible semantics.

## Properties

### colors?

> `optional` **colors?**: readonly [`NiimbotColor`](../type-aliases/NiimbotColor.md)[]

Inks the chassis prints. Absent when nobody has checked.

***

### densityDefault

> **densityDefault**: `number`

***

### densityMax

> **densityMax**: `number`

***

### densityMin

> **densityMin**: `number`

***

### modelIds

> **modelIds**: readonly `number`[]

Model IDs the printer reports in `PrinterInfo`.

***

### niimbluelibModel

> **niimbluelibModel**: `string`

niimbluelib `PrinterModel` name. Equal to the registry key.

***

### printDirection

> **printDirection**: `"left"` \| `"top"`

Head orientation niimbluelib encodes rows for.

***

### printTask?

> `optional` **printTask?**: `string`

niimbluelib `PrintTaskName` override.
