import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { flagshipProjectIds, getCaseStudy } from "./src/data/caseStudies";
import { englishCaseSummaries } from "./src/data/englishPortfolio";
import { portfolioProjects, type PortfolioProject } from "./src/data/portfolio";
import { absoluteSiteUrl, englishPath, profilePath, projectPath, siteConfig } from "./src/site";

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeRegularExpression(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceMeta(html: string, attribute: "name" | "property", key: string, content: string) {
  const pattern = new RegExp(`<meta\\s+${attribute}="${escapeRegularExpression(key)}"\\s+content="[^"]*"\\s*\\/?>`);
  const replacement = `<meta ${attribute}="${key}" content="${escapeHtmlAttribute(content)}" />`;
  if (!pattern.test(html)) throw new Error(`Missing ${attribute} metadata for ${key}.`);
  return html.replace(pattern, replacement);
}

function replaceCanonical(html: string, url: string) {
  const pattern = /<link rel="canonical" href="[^"]*"\s*\/?>/;
  if (!pattern.test(html)) throw new Error("Missing canonical metadata.");
  return html.replace(pattern, `<link rel="canonical" href="${escapeHtmlAttribute(url)}" />`);
}

function replaceHtmlLanguage(html: string, language: string) {
  const pattern = /<html lang="[^"]*">/;
  if (!pattern.test(html)) throw new Error("Missing html language attribute.");
  return html.replace(pattern, `<html lang="${escapeHtmlAttribute(language)}">`);
}

function replaceStructuredData(html: string, structuredData: object) {
  const json = JSON.stringify(structuredData, null, 2).replace(/</g, "\\u003c");
  const next = html.replace(
    /<script id="structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script id="structured-data" type="application/ld+json">\n${json}\n    </script>`,
  );

  if (next === html) throw new Error("Missing structured data block.");
  return next;
}

function projectMetadata(project: PortfolioProject) {
  const canonical = absoluteSiteUrl(projectPath(project.id));
  const socialImage = absoluteSiteUrl(getCaseStudy(project.id) ? `/social/${project.id}.png` : siteConfig.defaultSocialImage);
  const title = `${project.title} | 蔡旻佑作品檔案`;
  const description = project.summary;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    alternateName: project.english,
    description,
    url: canonical,
    inLanguage: "zh-Hant",
    author: {
      "@type": "Person",
      name: "蔡旻佑",
      alternateName: "Min-Yu Tsai",
      url: siteConfig.origin,
    },
    keywords: project.tags.join(", "),
  };

  return { canonical, description, socialImage, structuredData, title };
}

function renderHomePage(sourceHtml: string) {
  const canonical = absoluteSiteUrl();
  const socialImage = absoluteSiteUrl(siteConfig.defaultSocialImage);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "蔡旻佑",
    alternateName: "Min-Yu Tsai",
    url: canonical,
    sameAs: [
      "https://github.com/Daniel-Tsai-9487",
      "https://www.facebook.com/daniel.tsai.628090/",
      "https://www.instagram.com/daniel_tsai_0.0/",
    ],
    knowsAbout: ["Biomedical AI", "Edge Computing", "Intelligent Workflows"],
  };
  let html = sourceHtml.replace(/<title>[\s\S]*?<\/title>/, `<title>${siteConfig.siteName}</title>`);

  html = replaceMeta(html, "name", "description", siteConfig.defaultDescription);
  html = replaceCanonical(html, canonical);
  html = replaceMeta(html, "property", "og:title", siteConfig.siteName);
  html = replaceMeta(html, "property", "og:description", siteConfig.defaultDescription);
  html = replaceMeta(html, "property", "og:type", "website");
  html = replaceMeta(html, "property", "og:url", canonical);
  html = replaceMeta(html, "property", "og:image", socialImage);
  html = replaceMeta(html, "property", "og:image:alt", "蔡旻佑個人作品集的分享預覽圖");
  html = replaceMeta(html, "name", "twitter:card", "summary_large_image");
  html = replaceMeta(html, "name", "twitter:title", siteConfig.siteName);
  html = replaceMeta(html, "name", "twitter:description", siteConfig.defaultDescription);
  html = replaceMeta(html, "name", "twitter:image", socialImage);
  html = replaceMeta(html, "name", "twitter:image:alt", "蔡旻佑個人作品集的分享預覽圖");
  return replaceStructuredData(html, structuredData);
}

function renderProjectPage(sourceHtml: string, project: PortfolioProject) {
  const metadata = projectMetadata(project);
  let html = sourceHtml.replace(/<title>[\s\S]*?<\/title>/, `<title>${metadata.title}</title>`);

  html = replaceMeta(html, "name", "description", metadata.description);
  html = replaceCanonical(html, metadata.canonical);
  html = replaceMeta(html, "property", "og:title", metadata.title);
  html = replaceMeta(html, "property", "og:description", metadata.description);
  html = replaceMeta(html, "property", "og:type", "article");
  html = replaceMeta(html, "property", "og:url", metadata.canonical);
  html = replaceMeta(html, "property", "og:image", metadata.socialImage);
  html = replaceMeta(html, "property", "og:image:alt", `${project.title} 的分享預覽圖`);
  html = replaceMeta(html, "name", "twitter:card", "summary_large_image");
  html = replaceMeta(html, "name", "twitter:title", metadata.title);
  html = replaceMeta(html, "name", "twitter:description", metadata.description);
  html = replaceMeta(html, "name", "twitter:image", metadata.socialImage);
  html = replaceMeta(html, "name", "twitter:image:alt", `${project.title} 的分享預覽圖`);
  return replaceStructuredData(html, metadata.structuredData);
}

function renderProfilePage(sourceHtml: string) {
  const canonical = absoluteSiteUrl(profilePath());
  const socialImage = absoluteSiteUrl(siteConfig.defaultSocialImage);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "蔡旻佑",
    alternateName: "Min-Yu Tsai",
    url: canonical,
    sameAs: [
      "https://github.com/Daniel-Tsai-9487",
      "https://www.facebook.com/daniel.tsai.628090/",
      "https://www.instagram.com/daniel_tsai_0.0/",
    ],
    knowsAbout: ["Biomedical AI", "Edge Computing", "Intelligent Workflows"],
  };
  let html = sourceHtml.replace(/<title>[\s\S]*?<\/title>/, `<title>${siteConfig.profileTitle}</title>`);

  html = replaceMeta(html, "name", "description", siteConfig.profileDescription);
  html = replaceCanonical(html, canonical);
  html = replaceMeta(html, "property", "og:title", siteConfig.profileTitle);
  html = replaceMeta(html, "property", "og:description", siteConfig.profileDescription);
  html = replaceMeta(html, "property", "og:type", "profile");
  html = replaceMeta(html, "property", "og:url", canonical);
  html = replaceMeta(html, "property", "og:image", socialImage);
  html = replaceMeta(html, "property", "og:image:alt", "蔡旻佑公開專業概要的分享預覽圖");
  html = replaceMeta(html, "name", "twitter:card", "summary_large_image");
  html = replaceMeta(html, "name", "twitter:title", siteConfig.profileTitle);
  html = replaceMeta(html, "name", "twitter:description", siteConfig.profileDescription);
  html = replaceMeta(html, "name", "twitter:image", socialImage);
  html = replaceMeta(html, "name", "twitter:image:alt", "蔡旻佑公開專業概要的分享預覽圖");
  return replaceStructuredData(html, structuredData);
}

function renderEnglishPage(sourceHtml: string) {
  const canonical = absoluteSiteUrl(englishPath());
  const socialImage = absoluteSiteUrl(siteConfig.defaultSocialImage);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: siteConfig.englishTitle,
    description: siteConfig.englishDescription,
    url: canonical,
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: "Min-Yu Tsai",
      alternateName: "蔡旻佑",
      url: siteConfig.origin,
    },
    hasPart: flagshipProjectIds.flatMap((projectId) => {
      const project = portfolioProjects.find((item) => item.id === projectId);
      const summary = englishCaseSummaries[projectId];
      if (!project) return [];

      return [{
        "@type": "CreativeWork",
        name: summary.title,
        alternateName: project.title,
        description: summary.summary,
        url: absoluteSiteUrl(projectPath(project.id)),
      }];
    }),
  };
  let html = sourceHtml.replace(/<title>[\s\S]*?<\/title>/, `<title>${siteConfig.englishTitle}</title>`);

  html = replaceHtmlLanguage(html, "en");
  html = replaceMeta(html, "name", "description", siteConfig.englishDescription);
  html = replaceCanonical(html, canonical);
  html = replaceMeta(html, "property", "og:locale", "en_US");
  html = replaceMeta(html, "property", "og:site_name", siteConfig.englishSiteName);
  html = replaceMeta(html, "property", "og:title", siteConfig.englishTitle);
  html = replaceMeta(html, "property", "og:description", siteConfig.englishDescription);
  html = replaceMeta(html, "property", "og:type", "website");
  html = replaceMeta(html, "property", "og:url", canonical);
  html = replaceMeta(html, "property", "og:image", socialImage);
  html = replaceMeta(html, "property", "og:image:alt", "Min-Yu Tsai selected systems portfolio preview");
  html = replaceMeta(html, "name", "twitter:card", "summary_large_image");
  html = replaceMeta(html, "name", "twitter:title", siteConfig.englishTitle);
  html = replaceMeta(html, "name", "twitter:description", siteConfig.englishDescription);
  html = replaceMeta(html, "name", "twitter:image", socialImage);
  html = replaceMeta(html, "name", "twitter:image:alt", "Min-Yu Tsai selected systems portfolio preview");
  return replaceStructuredData(html, structuredData);
}

function createSitemap() {
  const urls = ["/", profilePath(), englishPath(), ...portfolioProjects.map((project) => projectPath(project.id))];
  const entries = urls.map((path) => `  <url><loc>${absoluteSiteUrl(path)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function staticProjectPages(): Plugin {
  return {
    name: "static-project-pages",
    apply: "build",
    closeBundle() {
      const outDir = resolve(process.cwd(), "dist");
      const sourceHtml = readFileSync(resolve(outDir, "index.html"), "utf8");
      const homeHtml = renderHomePage(sourceHtml);

      writeFileSync(resolve(outDir, "index.html"), homeHtml, "utf8");

      const profileOutputPath = resolve(outDir, profilePath().replace(/^\//, ""), "index.html");
      mkdirSync(dirname(profileOutputPath), { recursive: true });
      writeFileSync(profileOutputPath, renderProfilePage(homeHtml), "utf8");

      const englishOutputPath = resolve(outDir, englishPath().replace(/^\//, ""), "index.html");
      mkdirSync(dirname(englishOutputPath), { recursive: true });
      writeFileSync(englishOutputPath, renderEnglishPage(homeHtml), "utf8");

      for (const project of portfolioProjects) {
        const outputPath = resolve(outDir, projectPath(project.id).replace(/^\//, ""), "index.html");
        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, renderProjectPage(homeHtml, project), "utf8");
      }

      writeFileSync(resolve(outDir, "404.html"), homeHtml, "utf8");
      writeFileSync(resolve(outDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${absoluteSiteUrl("/sitemap.xml")}\n`, "utf8");
      writeFileSync(resolve(outDir, "sitemap.xml"), createSitemap(), "utf8");
    },
  };
}

export default defineConfig({
  base: "/",
  plugins: [react(), staticProjectPages()],
  server: {
    watch: {
      ignored: ["**/artifacts/**", "**/graphify-out/**", "**/tools/**"],
    },
  },
});
