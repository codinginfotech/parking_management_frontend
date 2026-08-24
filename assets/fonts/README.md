# Gilroy font files

This folder contains five weights of **Gilroy** (Radomir Tinkov), copied from
the project owner's locally installed fonts:

```
Gilroy-Regular.ttf
Gilroy-Medium.ttf
Gilroy-SemiBold.ttf
Gilroy-Bold.ttf
Gilroy-ExtraBold.ttf
```

> Gilroy is a **commercial** typeface. Keep these files only if you hold a
> license covering app embedding, and treat this repository as private.
> To ship without them, delete the files, set `GILROY_ENABLED = false` in
> `src/theme/fonts.ts`, and remove the `Object.assign(fontMap, …)` block —
> the app falls back to system fonts with matching weights.

Every text style resolves its family through `src/theme/fonts.ts`, so no other
code references the font files directly.
