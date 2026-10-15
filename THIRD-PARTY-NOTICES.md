# Third-party licensing and provenance

The project license applies only to original material that Aniruddha DuttaChowdhury is authorized to license. Third-party rights and notices remain applicable; the project's Required Notices do not replace them. A source URL or attribution alone is not a redistribution license.

## Zepp OS sample components — Apache License 2.0

The bundled Zepp sample bridge/helper components under `shared/` (including the message, event, deferred, data and device helper code) retain their applicable upstream Apache 2.0 licensing. Preserve [LICENSE-zeppos-samples.txt](LICENSE-zeppos-samples.txt), existing upstream notices, and any applicable upstream NOTICE content. Apache 2.0 redistribution conditions, including applicable notice and modification statements, continue to apply. This documentation does not relicense those components under PolyForm.

## es6-promise — MIT License

`shared/es6-promise.js` identifies es6-promise v4.2.8 and retains its original copyright and MIT license header. The complete upstream permission notice is supplied in [LICENSE-es6-promise.txt](LICENSE-es6-promise.txt), obtained from [the v4.2.8 upstream license](https://github.com/stefanpenner/es6-promise/blob/v4.2.8/LICENSE). Preserve both the copyright and permission notice when redistributing covered copies.

## Provider data

Preserve [source notices](docs/SOURCE-NOTICES.md) and all versioned `SOURCE-NOTICES.md` files in `releases/`. These distinguish IBJA via TrackLivePrice, Gold API platinum estimates and Frankfurter forex data. Data, provider marks and associated terms are not relicensed by PolyForm.

## Unresolved font and artwork permissions — manual review required

- `assets/432x514-amazfit-bip-max/fonts/date-bold.ttf` has embedded metadata identifying **Arial Bold**, The Monotype Corporation, and Microsoft-supplied font terms restricting redistribution. No separate app/device redistribution license was found in this repository. The font is not covered by PolyForm; confirm a suitable license or arrange a separately reviewed replacement before further distribution.
- `scripts/make-forex-digits.ps1` uses Arial to generate individual digit sprites. [Microsoft's font redistribution FAQ](https://learn.microsoft.com/en-us/typography/fonts/font-faq) distinguishes permitted text images from converting fonts into individual glyph bitmap fonts, and states that document embedding rights do not authorize app/device embedding. Confirm rights for these sprites as well; a permissive embedding flag alone is insufficient.
- No independent provenance or redistribution license was found for the supplied artwork in `artwork/` and the source store icon in `previews/`. Confirm ownership or permission.

All flagged assets and historical release packages remain unchanged by this documentation update. Their presence is not a claim that PolyForm authorizes their redistribution. The MIT terms embedded for Arial's Hebrew layout logic apply to that logic, not to the entire Arial font.
