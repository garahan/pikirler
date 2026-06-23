import type { Config } from "@netlify/functions";

// Runs every 3 hours — replaces Vercel cron /api/cron/news
export default async () => {
  const baseUrl = process.env.URL || process.env.DEPLOY_URL;
  if (!baseUrl) { console.error("[cron-news] URL env not set"); return; }

  const secret = process.env.CRON_SECRET ? `?key=${process.env.CRON_SECRET}` : "";
  const res = await fetch(`${baseUrl}/api/cron?action=news${secret}`);
  const data = await res.json();
  console.log("[cron-news]", JSON.stringify(data));
};

export const config: Config = {
  schedule: "0 */3 * * *",
};
