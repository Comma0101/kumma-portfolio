# Local legacy UI fonts

These are the existing Space Grotesk, JetBrains Mono, and Cormorant Garamond
families, vendored to remove build-time Google Fonts requests. The paper site's
Sprat, Junicode, and Chinese fonts in `components/personal/fonts/` are separate
and unchanged.

Downloaded on 2026-11-02 from the official
[google/fonts repository](https://github.com/google/fonts/tree/2fe1e8c6b137fb13041a7cfca6fdcd8a910ea4dc),
pinned to commit `2fe1e8c6b137fb13041a7cfca6fdcd8a910ea4dc`.
The binaries and OFL license texts are unmodified. These are full variable TTFs,
without conversion or subsetting; fontTools/Brotli were unavailable in the
existing Python environments, and no packages were installed.

| Local file | Upstream path under the pinned commit | Style | Weight range | Version | Bytes |
| --- | --- | --- | --- | --- | ---: |
| `SpaceGrotesk.ttf` | `ofl/spacegrotesk/SpaceGrotesk[wght].ttf` | normal | 300–700 | 2.000 | 136676 |
| `JetBrainsMono.ttf` | `ofl/jetbrainsmono/JetBrainsMono[wght].ttf` | normal | 100–800 | 2.211 | 187208 |
| `CormorantGaramond-Regular.ttf` | `ofl/cormorantgaramond/CormorantGaramond[wght].ttf` | normal | 300–700 | 4.001 | 1195560 |
| `CormorantGaramond-Italic.ttf` | `ofl/cormorantgaramond/CormorantGaramond-Italic[wght].ttf` | italic | 300–700 | 4.001 | 715644 |

Ranges were checked against each binary's `fvar` table and the upstream
`METADATA.pb`. All four faces have only a `wght` axis. Their internal default
weights are 300 for Space Grotesk and both Cormorant faces, and 400 for JetBrains
Mono. Consumers declare the intended range rather than relying on that internal
default. `legacyFonts.ts` preserves the existing requests: 500–700 for Cormorant,
300–700 for root Space Grotesk, 400–700 for component Space Grotesk, and 100–800
for JetBrains Mono. Normal and italic Cormorant are separate files.

Each family is distributed under the SIL Open Font License 1.1. The adjacent
`SpaceGrotesk-OFL.txt`, `JetBrainsMono-OFL.txt`, and
`CormorantGaramond-OFL.txt` are copied from that family's upstream directory.
Preserve these notices when redistributing the fonts.

## SHA-256

```text
acad6de1fc93436f5c0f1f4137751ef04f1aea3063e7036535970ffcfbd79f72  SpaceGrotesk.ttf
48715a42ec242c21e9f02692891e147d022299a52e48d5e413e1a942193ffeda  JetBrainsMono.ttf
b20b7d9626dd956b2c5e558692ad328b1f19e3275e2782db4fa07670d83f35e0  CormorantGaramond-Regular.ttf
0f48ea6abb2084537854f7174c470991a463b13036309e3b50a81511611c530d  CormorantGaramond-Italic.ttf
564ce565c371c5e5bbf286006565a7c9aa55a9f56e7ca58d56e05d649dd61a72  SpaceGrotesk-OFL.txt
b2fe5e8987594e9ffd1d2ca52a2f5d73eb8335243893c5d6254b5ad69269591d  JetBrainsMono-OFL.txt
60700d351cac4650c51f3f9db318d2a420f8b45052dba2715eb5fec41f0f6956  CormorantGaramond-OFL.txt
```
