import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/** Only production gets indexed; the dashboard, the API and the auth screens never do. */
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/", "/sign-in", "/sign-up"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
