export const siteConfig = {
  origin: "https://daniel-tsai-9487.github.io",
  email: "d940512@gmail.com",
  siteName: "蔡旻佑 | Systems Portfolio",
  defaultDescription: "蔡旻佑的個人作品集：以生醫 AI、邊緣運算、智慧工作流與跨領域系統整合為主軸。",
  defaultSocialImage: "/social/portfolio.png",
  profileTitle: "蔡旻佑 | 一頁履歷與專業概要",
  profileDescription: "蔡旻佑的一頁履歷與專業概要：聚焦生醫 AI、邊緣運算、智慧工作流、跨領域系統整合與 2027 實習／研究合作方向。",
  evidenceTitle: "公開證明與 Demo 索引 | 蔡旻佑",
  evidenceDescription: "蔡旻佑作品集的公開證明與 Demo 索引：分開呈現獎項、參與／決賽紀錄、課程證書、公開原型與受限證據邊界。",
  englishSiteName: "Min-Yu Tsai | Systems Portfolio",
  englishTitle: "Min-Yu Tsai | Selected Systems Portfolio",
  englishDescription: "Six selected case studies by Min-Yu Tsai across biomedical AI, edge systems, semiconductor workflows, enterprise AI, and fintech risk education.",
} as const;

export function projectPath(projectId: string) {
  return `/projects/${encodeURIComponent(projectId)}/`;
}

export function profilePath() {
  return "/profile/";
}

export function englishPath() {
  return "/en/";
}

export function evidencePath() {
  return "/evidence/";
}

export function absoluteSiteUrl(path = "/") {
  return new URL(path.startsWith("/") ? path : `/${path}`, `${siteConfig.origin}/`).toString();
}
