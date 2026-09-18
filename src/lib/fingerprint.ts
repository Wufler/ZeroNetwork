import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { createHash } from "crypto";

let fingerprintPromise: Promise<string> | null = null;

export async function getVisitorId(): Promise<string> {
  if (!fingerprintPromise) {
    fingerprintPromise = FingerprintJS.load()
      .then((fp) => fp.get())
      .then((result) => result.visitorId);
  }
  return fingerprintPromise;
}

export function hashIdentifier(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
