import webpush from "web-push";
import PushSubscription from "../models/PushSubscription.js";

let configured = false;

export function pushEnabled() {
  if (configured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();

  let subject = (
    process.env.VAPID_SUBJECT ||
    "2123200542@soy.utj.edu.mx"
  ).trim();

  // Corrige un correo configurado sin el prefijo mailto:
  if (!subject.includes(":") && subject.includes("@")) {
    subject = `mailto:${subject}`;
  }

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  // Solo queda configurado si setVapidDetails terminó correctamente.
  configured = true;
  return true;
}

export async function sendToUser(userId, payload) {
  const result = {
    sent: 0,
    removed: 0,
    failed: 0,
  };

  if (!pushEnabled()) return result;

  const subs = await PushSubscription.find({ user: userId });
  const body = JSON.stringify(payload);

  const outcomes = await Promise.allSettled(
    subs.map((subscription) =>
      webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        },
        body,
        { TTL: 60 * 60 }
      )
    )
  );

  const dead = [];

  outcomes.forEach((outcome, index) => {
    if (outcome.status === "fulfilled") {
      result.sent++;
      return;
    }

    const code = outcome.reason?.statusCode;

    if (code === 404 || code === 410) {
      dead.push(subs[index]._id);
    } else {
      result.failed++;

      console.error(
        "web-push error:",
        code,
        outcome.reason?.body || outcome.reason?.message
      );
    }
  });

  if (dead.length) {
    await PushSubscription.deleteMany({
      _id: { $in: dead },
    });

    result.removed = dead.length;
  }

  return result;
}