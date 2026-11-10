import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jobhunti.space";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/profile/", "/share/"],
      disallow: ["/home", "/jobs/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
