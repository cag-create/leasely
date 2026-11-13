# Keycove iOS + Android: how to submit

This is your checklist, Chad. Everything in code is done. What's left needs your
accounts, your passwords and your signature, so only you can do it. Work top to
bottom; each step says where to click and what to paste.

**What the apps are:** one native shell (Capacitor 8) per platform that loads
https://keycove.net. Push notifications, camera, Face ID / fingerprint unlock,
deep links and the offline screen are native. Code: `mobile/` (native projects),
`client/src/native/` (app-only web code), `server/push/` (push + deep-link files).

| | iOS | Android |
|---|---|---|
| Bundle ID / package | `net.keycove.app` | `net.keycove.app` |
| Version | 1.0 (build 1) | 1.0 (versionCode 1) |
| Minimum OS | iOS 15 | Android 7.0 (API 24) |
| Devices | iPhone only (runs on iPad in iPhone mode) | Phones |

---

## 0. Before anything: three decisions

1. **Enroll as the company, not as yourself.** Enroll as **Keycove LLC** on both stores, so each store page reads "Keycove LLC". This depends on the LLC rename, so do these in order:
   - **a. File the LLC name change first.** You're renaming Leasely LLC → Keycove LLC with the NC Secretary of State (Articles of Amendment, **form L-17**). Do this before the store enrollments — Apple and Google verify the legal entity name, and it must read "Keycove LLC".
   - **b. Get or update the free D-U-N-S number under "Keycove LLC".** Apple checks the enrollment name against the Dun & Bradstreet D-U-N-S record, so the D-U-N-S must show **Keycove LLC** (not Leasely LLC). Look up / request it at https://developer.apple.com/enroll/duns-lookup/. If Leasely LLC already has a D-U-N-S, update the business name with D&B after the amendment; a new number can take up to 5 business days, and a name update can take a few days to propagate.
   - **c. Then enroll** (section 1). On Google Play, an **organization** account skips the rule that new personal accounts must run a 14-day closed test with 12+ testers before going public.
   - Note: Stripe still shows "Leasely" today (launch to-do U3). Rename the Stripe business/descriptor to Keycove too, so charges, the stores and your bank all read the same name.
2. **Demo account for reviewers.** Both stores need a login that works. On keycove.net, create `review@keycove.net` (or similar) as a **landlord with Pro** and fill it with a fake property, tenant, application and work order. Use fake names and addresses only. You'll paste the email and password into both review forms.
3. **Pro is never sold in the apps.** The apps hide every price, "Upgrade" button and Pro checkout. (App Store rule 3.1.3(f): free companion app to a paid web service. Google treats it the same way.) Existing Pro members just sign in. Rent, deposit and HOA payments still work in the app: they pay for real-world services, which both stores allow. **Don't add "subscribe at keycove.net" text inside the apps.**

---

## 1. Accounts (you)

1. **Apple Developer Program**, $99/yr: https://developer.apple.com/programs/enroll/ → Enroll → Organization → Keycove LLC + D-U-N-S. Approval takes 1–3 days. Turn on two-factor auth on your Apple ID first.
2. **Google Play Console**, $25 one-time: https://play.google.com/console/signup → Organization → Keycove LLC. Google verifies the organization (ID + D-U-N-S), which takes 1–7 days.
3. **Firebase** (free, any Google account): https://console.firebase.google.com → Add project → name it `keycove` → skip Google Analytics. This sends Android push.

## 2. Install the tools on this Mac (you, about 1 hour, mostly download)

Xcode needs about 40 GB. Free up space first (`df -h ~` showed about 30 GB free on Nov 8).

```bash
# 1. Install Xcode from the Mac App Store (needs your Apple ID), then:
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
xcodebuild -downloadPlatform iOS
```

Android tooling is already installed: JDK 21 (Homebrew `openjdk@21`), the Android SDK at `/opt/homebrew/share/android-commandlinetools`, and the `keycove_pixel` emulator. Add this to `~/.zshrc`:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

Android Studio is optional (`brew install --cask android-studio`). Everything below works from the terminal.

## 3. Push notification keys → Railway (you)

### iOS (APNs)
1. https://developer.apple.com/account/resources/authkeys/list → **+** → name "Keycove Push" → tick **Apple Push Notifications service (APNs)** → Continue → Register → **Download** the `AuthKey_XXXXXXXXXX.p8`. You can only download it once, so keep it in your password manager.
2. Note the **Key ID** (10 characters) and your **Team ID** (top right of the developer site, 10 characters).

### Android (FCM)
1. Firebase console → project `keycove` → **Add app → Android** → package name `net.keycove.app` → Register → **download `google-services.json`** → put it at `mobile/android/app/google-services.json`. It's safe to commit; it's client config, not a secret.
2. Firebase → ⚙ Project settings → **Service accounts** → **Generate new private key** → downloads a JSON file. This one IS a secret. Don't commit it.

### Railway → Keycove service → Variables
| Variable | Value |
|---|---|
| `APNS_KEY_P8` | full contents of the .p8 file, including the BEGIN/END lines |
| `APNS_KEY_ID` | the 10-character Key ID |
| `APNS_TEAM_ID` | your Team ID |
| `APPLE_TEAM_ID` | your Team ID again (used for Universal Links) |
| `APNS_PRODUCTION` | `true` (TestFlight and App Store both use production APNs) |
| `FCM_SERVICE_ACCOUNT_JSON` | the whole service-account JSON, pasted as one line |
| `ANDROID_SHA256_CERT_FINGERPRINTS` | filled in at step 6.5 |

Railway redeploys on its own. The `push_devices` table is created on deploy, because `pnpm start` runs `drizzle-kit push`.

Check: https://keycove.net/.well-known/apple-app-site-association should return JSON with `<TEAMID>.net.keycove.app`.

## 4. Sync the native projects (every time you pull new code)

```bash
cd leasely-src/leasely        # your main clone, after the mobile-apps code is merged
pnpm install
cd mobile
npx cap sync                  # copies config + plugins into ios/ and android/
```

`cap sync` regenerates plugin paths (pnpm puts versions in them), so always run it after `pnpm install`. **Never** run a release build with `CAP_SERVER_URL` set. That variable is only for pointing a debug build at a local dev server.

## 5. iOS: build, TestFlight, submit

1. `cd mobile && npx cap open ios` (opens Xcode).
2. Click **App** (blue icon) → target **App** → **Signing & Capabilities** → Team = **Keycove LLC**, and leave "Automatically manage signing" ticked. Xcode registers `net.keycove.app` for you. Check that the **Push Notifications** and **Associated Domains** capabilities show up; they come from `App/App.entitlements`. If Xcode offers to add them, accept.
3. Top bar: pick **Any iOS Device (arm64)** → menu **Product → Archive** → in the Organizer click **Distribute App → App Store Connect → Upload**.
4. https://appstoreconnect.apple.com → **Apps → + → New App**: Platform iOS · Name `Keycove: Rent & Lease Manager` · Language English (U.S.) · Bundle ID `net.keycove.app` · SKU `keycove-ios-1` · Full access.
5. **TestFlight** tab: the build appears 5–30 minutes after upload. Answer the export-compliance question if asked ("None of the algorithms mentioned"; the Info.plist already sets `ITSAppUsesNonExemptEncryption = NO`). Add yourself as an internal tester, install TestFlight on your iPhone, and check:
   - sign in, allow notifications, then Settings tab → **Send a test notification** → it arrives
   - work order photo: **Take photo** opens the camera
   - Settings → **Unlock with Face ID** → close the app, wait 2+ minutes, reopen → Face ID prompt
   - Notes app: type `https://keycove.net/work-orders`, tap the link → it opens in Keycove
6. **App Store** tab, version 1.0:
   - Text, keywords, URLs and age rating: copy from `mobile/store/listing.md`.
   - Screenshots: 6.9" iPhone set (`mobile/store/screenshots/`, see listing.md).
   - **App Privacy** → fill in the table in section 7 below. Privacy Policy URL `https://keycove.net/privacy`.
   - **App Review Information** → sign-in required: yes → demo email + password. Notes (paste):
     > Keycove is a free companion app for landlords, property managers and tenants who have a Keycove account. Pro subscriptions are sold only on our website; the app has no purchase flow or links to one (guideline 3.1.3(f)). Rent, deposit and HOA payments in the app are for real-world rental services and run through Stripe (3.1.5). Native features: push notifications (rent, applications, work orders, leases, HOA dues), camera/photo library for work-order and listing photos, Face ID unlock (Settings tab), Universal Links for keycove.net, and an offline screen. Account deletion: Settings tab → Delete account.
   - **Pricing**: Free. **Availability**: United States (start there).
7. **Add for Review → Submit**. Review usually takes 1–3 days.

## 6. Android: build, test, submit

1. **Create your upload key** (once). Pick your own password and keep the file AND the password safe; if you lose them you'll need Google support to reset.
   ```bash
   mkdir -p ~/keycove-keys && cd ~/keycove-keys
   keytool -genkeypair -v -keystore keycove-upload.jks -alias keycove-upload -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Create `mobile/android/keystore.properties` (gitignored):
   ```
   storeFile=/Users/chadglover/keycove-keys/keycove-upload.jks
   storePassword=YOUR_PASSWORD
   keyAlias=keycove-upload
   keyPassword=YOUR_PASSWORD
   ```
3. Build the release bundle (after step 4's `npx cap sync`, with `google-services.json` in place):
   ```bash
   cd mobile/android && ./gradlew bundleRelease
   # → mobile/android/app/build/outputs/bundle/release/app-release.aab
   ```
4. Play Console → **Create app**: name `Keycove: Rent & Lease Manager` · App · Free · accept the declarations.
5. **Test and release → Testing → Internal testing → Create release** → upload the `.aab` → accept **Play App Signing**. Then **Test and release → Setup → App signing** → copy the **SHA-256** of the *App signing key certificate* (also copy the upload key's SHA-256) → Railway `ANDROID_SHA256_CERT_FINGERPRINTS` = `AA:BB:...,CC:DD:...` (comma-separated). Check https://keycove.net/.well-known/assetlinks.json.
6. Add yourself as an internal tester, install from the opt-in link, and run the same checks as iOS step 5. For the deep link, tap a `https://keycove.net/...` link in Gmail.
7. **Grow → Store presence → Main store listing**: copy from `listing.md`; graphics `mobile/store/play-icon-512.png`, `mobile/store/play-feature-graphic.png`, phone screenshots.
8. **Policy → App content**: Privacy policy URL · **App access** → "All or some functionality is restricted" → demo login · Ads: No · Content rating questionnaire (see listing.md) · Target audience: 18+ · **Data safety**: section 7 · **Financial features**: the app helps tenants pay rent to landlords, processed by Stripe. Keycove isn't a bank or lender. · Government app: No · Health: No.
9. **Production → Create release** → same `.aab` (or promote from internal) → Countries: United States → **Send for review**. The first review can take up to 7 days.

Later builds: bump `versionCode` (+1) and `versionName` in `mobile/android/app/build.gradle`, and on iOS bump Build (and Version) in Xcode → General.

## 7. Privacy answers (App Store "App Privacy" and Play "Data safety")

Keycove does **not** track (no ads, no data brokers, no cross-app tracking). All data below is **linked to the user**, used for **App Functionality** only (plus Customer Support where noted), and **not** used for tracking. These match `mobile/ios/App/App/PrivacyInfo.xcprivacy`.

| Data | Apple category | Play category | Why |
|---|---|---|---|
| Name | Contact Info → Name | Personal info → Name | account, leases, applications |
| Email | Contact Info → Email Address | Personal info → Email address | sign-in, notices |
| Phone | Contact Info → Phone Number | Personal info → Phone number | applications, tenant contact |
| Property / mailing address | Contact Info → Physical Address | Personal info → Address | properties, leases |
| User ID | Identifiers → User ID | Personal info → User IDs | account |
| Push token | Identifiers → Device ID | Device or other IDs | sending notifications |
| Card / bank (via Stripe) | Financial Info → Payment Info | Financial info → User payment info | rent and deposit payments (Stripe collects it; Keycove never sees full numbers) |
| Rent amounts, income on applications | Financial Info → Other Financial Info | Financial info → Other financial info | rent ledger, screening |
| Photos | User Content → Photos or Videos | Photos and videos → Photos | work orders, listings |
| Messages, repair requests | User Content → Other User Content | App activity → Other user-generated content | work orders, support |
| Support tickets | User Content → Customer Support | App activity → Other actions | support |
| Date of birth, employer, references on applications | Other Data | Personal info → Other info | rental applications |

Play Data safety extras: data **is encrypted in transit** (HTTPS) → Yes. Users **can request deletion** → Yes (in-app Settings → Delete account, or support@keycove.net). Data is **shared** with service providers only (Stripe for payments, Brevo for email). Under Play's definitions, processors acting for you don't count as "sharing", so answer **No data shared**.

## 8. After launch

- Push: the server sends rent paid/failed, new applications, work-order updates, lease signing steps, rent reminders and HOA due reminders to the app automatically. It mirrors the matching emails and in-app notifications; see `server/push/service.ts` for the list.
- Push fails quietly until the Railway keys from step 3 are set. Devices still register, and sends are skipped and logged.
- Web deploys reach the apps right away (the app loads keycove.net). Rebuild and resubmit only when `mobile/` changes, a plugin is added, or you change icons or splash. Run `pnpm run assets` in `mobile/` after replacing `mobile/assets/*.png`.
- Nice to have: a crisp vector logo. The current icon is upscaled from the 512 px web icon. Drop a 1024 px+ version into `mobile/assets/icon-only.png` and `icon-foreground.png`, then run `pnpm run assets`.

## Local development

```bash
# terminal 1: run the web app on :3100 (or use the "keycove-mobile-dev" preview config)
PORT=3100 pnpm run dev
# terminal 2: point a debug build at it
cd mobile
CAP_SERVER_URL=http://10.0.2.2:3100 npx cap sync android && (cd android && ./gradlew installDebug)
CAP_SERVER_URL=http://localhost:3100 npx cap sync ios && npx cap run ios
# then run `npx cap sync` again (no CAP_SERVER_URL) before any release build
```

iOS simulator push test, no Apple keys needed:
```bash
xcrun simctl push booted net.keycove.app mobile/store/test-push.apns
```
