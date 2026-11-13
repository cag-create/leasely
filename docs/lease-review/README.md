# Keycove state lease review packets

Every state lease is generated from a data file (`server/leases/states/data/<code>.ts`) by one shared builder (`server/leases/states/builder.ts`). A state is offered to landlords only after it is approved here **and** its text hash still matches.

## How to approve a batch

1. Read the state's packet (below) and its sample leases (`samples/`), ideally with a licensed attorney in that state. The "Open questions" section lists the judgment calls to check first.
2. If anything is wrong, note the change and ask Claude (or a developer) to update that state's data file; the hash changes, so re-review the new sample.
3. When satisfied, approve: `pnpm lease:approve SC VA GA --by "Jane Doe, Esq. (SC Bar #12345)"`, then commit and push. Railway redeploys and the states appear in the lease wizard, in auto-drafted leases, and in marketing copy.
4. To withdraw a state: `pnpm lease:approve --revoke SC`, commit, push.
5. `pnpm lease:approve --status` shows every state's status.

Approval is tied to the exact text. Any later change to a state's data or the shared wording takes it out of the app until it's re-approved, and the test suite fails until then so it can't ship unnoticed.

Every lease includes: the lease-break option (default fee 2 months' rent, default notice 30 days, both editable by the landlord, worded as liquidated damages the tenant may elect); otherwise liability for rent until re-rented, offset by mitigation; and the non-waivable carve-outs (federal SCRA plus that state's military, domestic-violence and other statutory termination rights, and any state cap on termination fees). Keycove's "not legal advice" notice is in every lease.

## Status

| State | Status | Confidence | Deposit cap (months) | Return (days) | Late fee cap | M-to-M notice (days) | Termination rights beyond SCRA | ET fee cap | Open questions |
|---|---|---|---|---|---|---|---|---|---|
| [AK](AK.md) | ⏳ pending | medium | 2 | 14 | none | 30 | state military, 6 other | no | 7 |
| [AL](AL.md) | ⏳ pending | high | 1 | 60 | none | 30 | state military, 4 other | no | 12 |
| [AR](AR.md) | ⏳ pending | high | 2 | 60 | none | 30 | state military, 1 other | no | 8 |
| [AZ](AZ.md) | ⏳ pending | high | 1.5 | 14 | reasonable | 30 | DV, 5 other | no | 11 |
| [CA](CA.md) | ⏳ pending | medium | 1 | 21 | reasonable | 60 | state military, DV, 3 other | yes | 14 |
| [CO](CO.md) | ⏳ pending | high | 2 | 30 | greater_of / 7d grace | 21 | DV, 5 other | no | 14 |
| [CT](CT.md) | ⏳ pending | high | 2 | 21 | lesser_of / 9d grace | 30 | state military, DV, 1 other | no | 11 |
| [DC](DC.md) | ⏳ pending | medium | 1 | 45 | percent / 5d grace | 30 | DV | no | 15 |
| [DE](DE.md) | ⏳ pending | high | 1 | 20 | percent / 5d grace | 60 | state military, DV, 6 other | no | 13 |
| [FL](FL.md) | ⏳ pending | high | none | 30 | none | 30 | state military, 3 other | yes | 15 |
| [GA](GA.md) | ⏳ pending | high | 2 | 30 | none | 60 | state military, DV, 1 other | no | 16 |
| [HI](HI.md) | ⏳ pending | high | 1 | 14 | percent | 45 | state military, DV, 6 other | yes | 9 |
| [IA](IA.md) | ⏳ pending | high | 2 | 30 | tiered | 30 | state military, 2 other | no | 7 |
| [ID](ID.md) | ⏳ pending | medium | none | 21 | reasonable | 30 | state military | no | 10 |
| [IL](IL.md) | ⏳ pending | medium | none | 30 | none | 30 | state military, DV, 3 other | no | 12 |
| [IN](IN.md) | ⏳ pending | high | none | 45 | none | 30 | state military, DV | no | 8 |
| [KS](KS.md) | ⏳ pending | high | 1 | 30 | none | 30 | state military, DV, 4 other | no | 10 |
| [KY](KY.md) | ⏳ pending | medium | none | 30 | none | 30 | state military, DV, 3 other | no | 11 |
| [LA](LA.md) | ⏳ pending | high | none | 30 | none | 10 | state military, DV, 1 other | no | 8 |
| [MA](MA.md) | ⏳ pending | medium | 1 | 30 | none / 30d grace | 30 | state military, DV, 1 other | no | 14 |
| [MD](MD.md) | ⏳ pending | high | 1 | 45 | percent | 60 | state military, DV, 3 other | no | 15 |
| [ME](ME.md) | ⏳ pending | high | 2 | 30 | percent / 15d grace | 30 | DV, 2 other | yes | 16 |
| [MI](MI.md) | ⏳ pending | high | 1.5 | 30 | none | 30 | DV, 1 other | no | 13 |
| [MN](MN.md) | ⏳ pending | medium | none | 21 | percent | 30 | state military, DV, 4 other | no | 13 |
| [MO](MO.md) | ⏳ pending | high | 2 | 30 | none | 30 | state military, DV | no | 8 |
| [MS](MS.md) | ⏳ pending | high | none | 45 | none | 30 | 2 other | no | 8 |
| [MT](MT.md) | ⏳ pending | high | none | 30 | none | 30 | state military, 5 other | yes | 9 |
| [NC](NC.md) | ✅ approved | high | 2 | 30 | greater_of / 5d grace | 7 | state military, DV, 3 other | no | 7 |
| [ND](ND.md) | ⏳ pending | high | 1 | 30 | none | 31 | state military, DV, 4 other | no | 10 |
| [NE](NE.md) | ⏳ pending | high | 1 | 14 | none | 30 | state military, DV, 4 other | no | 9 |
| [NH](NH.md) | ⏳ pending | high | 1 | 30 | none | 30 | state military, DV | no | 14 |
| [NJ](NJ.md) | ⏳ pending | medium | 1.5 | 30 | none | 30 | state military, DV, 3 other | no | 13 |
| [NM](NM.md) | ⏳ pending | high | 1 | 30 | percent | 30 | state military, 5 other | no | 11 |
| [NV](NV.md) | ⏳ pending | medium | 3 | 30 | percent / 3d grace | 30 | DV, 5 other | no | 11 |
| [NY](NY.md) | ⏳ pending | high | 1 | 14 | lesser_of / 5d grace | 30 | state military, DV, 4 other | no | 13 |
| [OH](OH.md) | ⏳ pending | high | none | 30 | none | 30 | state military, 3 other | no | 12 |
| [OK](OK.md) | ⏳ pending | medium | none | 45 | none | 30 | state military, DV, 6 other | no | 11 |
| [OR](OR.md) | ⏳ pending | high | none | 31 | reasonable / 4d grace | 30 | state military, DV, 7 other | yes | 11 |
| [PA](PA.md) | ⏳ pending | medium | 2 | 30 | none | 15 | state military, 2 other | no | 11 |
| [RI](RI.md) | ⏳ pending | medium | 1 | 20 | none | 30 | state military, DV, 2 other | no | 11 |
| [SC](SC.md) | ⏳ pending | high | none | 30 | none | 30 | state military, DV, 5 other | no | 10 |
| [SD](SD.md) | ⏳ pending | medium | 1 | 21 | none | 30 | state military, DV, 4 other | no | 12 |
| [TN](TN.md) | ✅ approved | medium | none | 30 | percent / 5d grace | 30 | DV, 4 other | no | 17 |
| [TX](TX.md) | ⏳ pending | high | none | 30 | percent / 2d grace | 30 | state military, DV, 8 other | no | 13 |
| [UT](UT.md) | ⏳ pending | medium | none | 30 | greater_of | 15 | state military, DV, 2 other | no | 11 |
| [VA](VA.md) | ⏳ pending | high | 2 | 45 | percent | 30 | state military, DV, 9 other | no | 15 |
| [VT](VT.md) | ⏳ pending | high | none | 14 | none | 60 | DV, 1 other | no | 13 |
| [WA](WA.md) | ⏳ pending | high | none | 30 | none / 5d grace | 20 | state military, DV, 7 other | no | 10 |
| [WI](WI.md) | ⏳ pending | high | none | 21 | none | 28 | state military, DV, 2 other | no | 11 |
| [WV](WV.md) | ⏳ pending | medium | none | 45 | reasonable | 30 | state military, 2 other | no | 11 |
| [WY](WY.md) | ⏳ pending | high | none | 30 | none | 30 | state military, DV, 1 other | no | 11 |
