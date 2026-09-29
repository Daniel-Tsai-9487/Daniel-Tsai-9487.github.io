export const siteConfig = {
  origin: "https://daniel-tsai-9487.github.io",
  siteName: "蔡旻佑 | Systems Portfolio",
  defaultDescription: "蔡旻佑的個人作品集：以生醫 AI、邊緣運算、智慧工作流與跨領域系統整合為主軸。",
  defaultSocialImage: "/social/portfolio.png",
  profileTitle: "蔡旻佑 | 公開專業概要",
  profileDescription: "蔡旻佑的公開專業概要：聚焦生醫 AI、邊緣運算、智慧工作流與跨領域系統整合。",
} as const;

export function projectPath(projectId: string) {
  return `/projects/${encodeURIComponent(projectId)}/`;
}

export function profilePath() {
  return "/profile/";
}

export function absoluteSiteUrl(path = "/") {
  return new URL(path.startsWith("/") ? path : `/${path}`, `${siteConfig.origin}/`).toString();
}
