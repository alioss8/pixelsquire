import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!, // NEXT_PUBLIC olmayan, backend'deki
  process.env.VAPID_PRIVATE_KEY!,
);

export { webpush };
