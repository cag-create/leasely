/**
 * Biometric unlock (Face ID / Touch ID / Android fingerprint or face).
 *
 * Sessions persist on the phone (secure cookie / tenant token), so "biometric
 * login" works like a banking app: when it's turned on, opening the app or
 * returning to it after LOCK_AFTER_MS asks for Face ID before showing data.
 */
import { Preferences } from "@capacitor/preferences";
import { BiometricAuth, BiometryType } from "@aparajita/capacitor-biometric-auth";

const ENABLED_KEY = "kc_biometric_lock";
export const LOCK_AFTER_MS = 2 * 60 * 1000;

export async function biometricLockEnabled(): Promise<boolean> {
  const { value } = await Preferences.get({ key: ENABLED_KEY });
  return value === "1";
}

export async function setBiometricLockEnabled(on: boolean): Promise<void> {
  await Preferences.set({ key: ENABLED_KEY, value: on ? "1" : "0" });
}

export type BiometryInfo = { available: boolean; label: string };

export async function biometryInfo(): Promise<BiometryInfo> {
  try {
    const r = await BiometricAuth.checkBiometry();
    const label =
      r.biometryType === BiometryType.faceId ? "Face ID"
        : r.biometryType === BiometryType.touchId ? "Touch ID"
          : r.biometryType === BiometryType.faceAuthentication ? "Face unlock"
            : r.biometryType === BiometryType.fingerprintAuthentication ? "Fingerprint"
              : "Biometric unlock";
    // Device passcode is accepted as a fallback, so a set passcode is enough.
    return { available: r.isAvailable || r.deviceIsSecure, label };
  } catch {
    return { available: false, label: "Biometric unlock" };
  }
}

/** Resolves true when the person passes Face ID / fingerprint / passcode. */
export async function authenticate(reason = "Unlock Keycove"): Promise<boolean> {
  try {
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: "Cancel",
      allowDeviceCredential: true,
      iosFallbackTitle: "Use passcode",
      androidTitle: "Unlock Keycove",
      androidSubtitle: "Confirm it's you",
      androidConfirmationRequired: false,
    });
    return true;
  } catch {
    return false;
  }
}
