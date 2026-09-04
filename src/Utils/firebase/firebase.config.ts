import admin from "firebase-admin";
import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { env } from "./../../config/config";

let messaging: any = null;

export const intializeFirebase = (): void => {
  const keyPath = resolve(env.FIREBASE_SERVICE_ACCOUNT);
  if (!existsSync(keyPath))
    throw new Error(
      `Firebase service account key file not found at path:${keyPath}`,
    );
  try {
    const serviceAccount = JSON.parse(
      readFileSync(keyPath, "utf-8"),
    ) as admin.ServiceAccount;
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    messaging = admin.messaging();
    console.log("[Firebase] Admin SDK intialized successfully");
  } catch (error) {
    console.log("[Firebase] Error intializing Admin SDK ", error);
  }
};

export const getMessaging = (): admin.messaging.Messaging | null => messaging;
export { admin };
