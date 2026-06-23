import type { Config } from "@netlify/functions";

// Runs every 2 hours — replaces Vercel cron /api/cron/gemini-bot
export default async () => {
  const baseUrl = process.env.URL || process.env.DEPLOY_URL;
  if (!baseUrl) { console.error("[cron-gemini] URL env not set"); return; }

  const secret = process.env.CRON_SECRET ? `?key=${process.env.CRON_SECRET}` : "";
  const res = await fetch(`${baseUrl}/api/cron?action=gemini-bot${secret}`);
  const data = await res.json();
  console.log("[cron-gemini]", JSON.stringify(data));
};

export const config: Config = {
  schedule: "0 */2 * * *",
};
