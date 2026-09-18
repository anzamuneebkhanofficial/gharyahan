export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/tenant/"], // Prevent sensitive dashboards from being indexed
      },
      // Explicitly allow AI bots for Generative Engine Optimization
      {
        userAgent: ["Googlebot", "Bingbot", "PerplexityBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai", "GPTBot"],
        allow: "/",
        disallow: ["/admin/", "/tenant/"],
      }
    ],
    sitemap: "https://gharyahan.com/sitemap.xml",
  };
}
