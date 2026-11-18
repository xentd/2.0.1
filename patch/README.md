# slither.io 2.0.2 menu fix

The original IPA's `H5Menu.html` redirected to `https://tabemaru-hage.github.io/2.0.1/`.
That account was renamed to YUPA-TT, and GitHub Pages doesn't redirect old usernames, so the menu showed a 404.

`slither.io_2.0.2_fixed.ipa` replaces only `H5Menu.html`. The new loader:

1. tries `https://xentd.github.io/2.0.1/` (this repo's `index.html` on the main branch)
2. falls back to `https://yupa-tt.github.io/2.0.1/` (Tabemaru's live copy)
3. shows a Retry button if neither is reachable

**Re-sign the IPA before installing** (Esign, Scarlet, etc.). Changing a file breaks the old signature.

Rebuild from an original IPA: `patch/build.sh original.ipa patch/slither.io_2.0.2_fixed.ipa`

## Closest to the original: `slither.io_2.0.2_yupa-tt.ipa`

The original IPA with one line changed in `H5Menu.html`:
`tabemaru-hage.github.io` → `yupa-tt.github.io` (same account, renamed).
It loads Tabemaru's live menu exactly as the old IPA did, with no loader or fallback.
Source: `H5Menu.original-renamed.html`.
