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
| [NC](NC.md) | ✅ approved | high | 2 | 30 | greater_of / 5d grace | 7 | state military, DV, 3 other | no | 7 |
| [TN](TN.md) | ✅ approved | medium | none | 30 | percent / 5d grace | 30 | DV, 4 other | no | 17 |
