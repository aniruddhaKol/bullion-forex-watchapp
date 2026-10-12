# Bullion Forex v1.0.14

Author: **Aniruddha DuttaChowdhury**. Developer brand: **ADChowdhury**.
Project package identifier: `app.adc.bullionforex`.
Zepp registered application ID: **1130321** (unchanged).

Gold 999 and silver 999 are **IBJA via TrackLivePrice** Indian benchmark rates.
Credit: [TrackLivePrice methodology and data terms](https://trackliveprice.com/methodology/).
Feeds: [gold 999](https://trackliveprice.com/api/gold/999.json), [silver 999](https://trackliveprice.com/api/silver.json).
The feed reports INR per gram. The watch displays gold per10g and silver per100g.
Select the latest valid, non-future publication date, preferring PM over AM on that date.
Do not use `close`. Persist quote date/session separately from collection time.
Each metal's collection cache expires after one hour, including within the same day.
These benchmark prices exclude GST and making charges. This is a third-party feed;
the underlying data remains subject to the original source's terms. TrackLivePrice's
published reuse terms require attribution with a link; see the methodology page above.

Platinum is an **international spot estimate**, not an IBJA rate.
[Gold API XPT](https://api.gold-api.com/price/XPT) USD per troy ounce is converted as:
USD/oz × USD/INR ×10 ÷31.1034768. Forex uses [Frankfurter daily reference rates](https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR,EUR,GBP).
The last saved USD/INR may be used for platinum when the forex provider is unavailable.
Gold/silver do not depend on this conversion or on platinum/forex availability.

Tap the clock for on-watch source/author information. Tap the date to cycle the
gold/silver quote dates with AM/PM, platinum quote date marked EST, and forex quote date.

Identity migration: Zepp uses a numeric registered app ID, not Android-style package
identifiers. Retain1130321 to upgrade the existing installed app. The textual name
above is used in package.json and release documentation; it does not change the
Zepp identity. Previous release packages are preserved in releases/.
Cache migration uses `rates-ibja-999-v1`. Legacy international gold/silver are never
copied into this cache; forex/platinum can be retained with their original timestamps.
No replacement or withdrawal of any existing store-review submission was performed.

Bundled Zepp sample bridge attribution and existing third-party licence notices remain intact.
