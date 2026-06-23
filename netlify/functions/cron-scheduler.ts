import type { Config } from "@netlify/functions";

// Runs every 30 minutes — replaces Vercel cron /api/cron/scheduler
export default async () => {
  const baseUrl = process.env.URL || process.env.DEPLOY_URL;
  if (!baseUrl) { console.error("[cron-scheduler] URL env not set"); return; }

  const secret = process.env.CRON_SECRET ? `?key=${process.env.CRON_SECRET}` : "";
  const res = await fetch(`${baseUrl}/api/cron?action=scheduler${secret}`);
  const data = await res.json();
  console.log("[cron-scheduler]", JSON.stringify(data));
};

export const config: Config = {
  schedule: "*/30 * * * *",
};
