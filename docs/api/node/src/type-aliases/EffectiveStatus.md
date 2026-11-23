[**niimbot**](../../../README.md)

***

[niimbot](../../../README.md) / [node/src](../README.md) / EffectiveStatus

# Type Alias: EffectiveStatus

> **EffectiveStatus** = `"verified"` \| `"partial"` \| `"unsupported"` \| `"expected"` \| `"unverified"`

Render-time effective status: the contracts' stored verification
rungs plus `'expected'` (propagated) and `'unverified'` (no claim).
Mirrors `EffectiveStatus` in `@thermal-label/contracts`.
