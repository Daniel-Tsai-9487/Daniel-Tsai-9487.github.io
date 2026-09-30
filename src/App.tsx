import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, LazyMotion, MotionConfig, useReducedMotion, useScroll, useTransform } from "motion/react";
import * as m from "motion/react-m";
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  CircuitBoard,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  ExternalLink,
  Facebook,
  GraduationCap,
  Github,
  Instagram,
  Link2,
  Menu,
  Maximize2,
  MoveRight,
  Radar,
  Sparkles,
  X,
} from "lucide-react";
import {
  achievements,
  currentThreads,
  laneLabels,
  portfolioProjects,
  storyBeats,
  type PortfolioProject,
  type ProjectLane,
  type StatusTone,
} from "./data/portfolio";
import { flagshipProjectIds, getCaseStudy, hasPublicMediaAsset, type CaseStudy } from "./data/caseStudies";
import { englishCaseSummaries } from "./data/englishPortfolio";
import { englishPath, profilePath, projectPath, siteConfig } from "./site";

type ArchiveFilter = ProjectLane | "all" | "case-study" | "award" | "coursework";

type StatusPillProps = {
  tone: StatusTone;
  children: ReactNode;
};

type PageRoute =
  | { kind: "home" }
  | { kind: "profile" }
  | { kind: "english" }
  | { kind: "project"; projectId: string };

const localCharacterAssetKeys = ["hero", "profile", "nahida", "vodyanitsa", "juFufu", "huTao"] as const;

type LocalCharacterAsset = (typeof localCharacterAssetKeys)[number];
type LocalCharacterPreview = Partial<Record<LocalCharacterAsset, string>>;
type LocalCharacterPlacement = "featured" | "media" | "flow" | "evidence" | "archive";

// The local-only image map intentionally keeps character names out of the rendered UI.
const localCharacterBackdropAssets: Record<LocalCharacterPlacement, LocalCharacterAsset> = {
  featured: "nahida",
  media: "juFufu",
  flow: "vodyanitsa",
  evidence: "nahida",
  archive: "huTao",
};

const archiveLaneFilters: Array<ProjectLane | "all"> = ["all", "featured", "research", "proposal", "academic", "tool", "creative"];
const archiveQuickFilters: Array<{ id: Extract<ArchiveFilter, "case-study" | "award" | "coursework">; label: string; eyebrow: string }> = [
  { id: "case-study", label: "完整 Case Study", eyebrow: "六件可深入閱讀的旗艦案例，含公開素材、佐證與範圍說明" },
  { id: "award", label: "獲獎", eyebrow: "保留已明確列示獎項的作品，不把入圍、審查或原型混為獲獎" },
  { id: "coursework", label: "課程實作", eyebrow: "控制、半導體、訊號與軟硬整合的課程型實作紀錄" },
];
const archiveFilterInfo: Record<ArchiveFilter, { label: string; eyebrow: string }> = {
  all: laneLabels.all,
  featured: laneLabels.featured,
  research: laneLabels.research,
  proposal: laneLabels.proposal,
  academic: laneLabels.academic,
  tool: laneLabels.tool,
  creative: laneLabels.creative,
  "case-study": archiveQuickFilters[0],
  award: archiveQuickFilters[1],
  coursework: archiveQuickFilters[2],
};
const orderedPortfolioProjects = [...portfolioProjects].sort(
  (left, right) => Number.parseInt(left.sequence, 10) - Number.parseInt(right.sequence, 10),
);
const portfolioProjectById = new Map(portfolioProjects.map((project) => [project.id, project] as const));
const flagshipProjects = flagshipProjectIds.flatMap((projectId) => {
  const project = portfolioProjectById.get(projectId);
  return project ? [project] : [];
});
const loadMotionFeatures = () => import("./motionFeatures").then((module) => module.default);

function isLocalCharacterPreview(value: unknown): value is LocalCharacterPreview {
  if (!value || typeof value !== "object") return false;

  const preview = value as Record<string, unknown>;
  return localCharacterAssetKeys.some((key) => {
    const asset = preview[key];
    return typeof asset === "string" && asset.startsWith("https://");
  });
}

function useLocalCharacterPreview() {
  const [preview, setPreview] = useState<LocalCharacterPreview | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    let isCurrent = true;
    void fetch("/_local-preview/character", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((candidate: unknown) => {
        if (isCurrent) setPreview(isLocalCharacterPreview(candidate) ? candidate : null);
      })
      .catch(() => {
        if (isCurrent) setPreview(null);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return preview;
}

function LocalCharacterPreviewArtwork({ placement, src }: { placement: "hero" | "profile"; src?: string }) {
  if (!src) return null;

  return (
    <figure aria-hidden="true" className={`local-character-artwork local-character-artwork-${placement}`}>
      <img alt="" decoding="async" src={src} />
    </figure>
  );
}

function hasLocalCharacterBackdrop(placement: LocalCharacterPlacement, preview: LocalCharacterPreview | null) {
  if (!preview) return false;

  return Boolean(preview[localCharacterBackdropAssets[placement]]);
}

function LocalCharacterBackdrop({
  placement,
  preview,
}: {
  placement: LocalCharacterPlacement;
  preview: LocalCharacterPreview | null;
}) {
  const src = preview?.[localCharacterBackdropAssets[placement]];
  if (!src) return null;

  return (
    <figure aria-hidden="true" className={`local-character-backdrop local-character-backdrop-${placement}`}>
      <img
        alt=""
        decoding="async"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
        src={src}
      />
    </figure>
  );
}

function parseProjectHash(hash: string) {
  const match = /^#project\/([^/?#]+)$/.exec(hash);
  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function parseProjectPath(pathname: string) {
  const match = /^\/projects\/([^/?#]+)(?:\/|\/index\.html)?$/.exec(pathname);
  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function isProfilePath(pathname: string) {
  return /^\/profile(?:\/|\/index\.html)?$/.test(pathname);
}

function isEnglishPath(pathname: string) {
  return /^\/en(?:\/|\/index\.html)?$/.test(pathname);
}

function usePageRoute() {
  const readPageRoute = (): PageRoute => {
    const pathProjectId = parseProjectPath(window.location.pathname);
    if (pathProjectId) return { kind: "project", projectId: pathProjectId };
    if (isProfilePath(window.location.pathname)) return { kind: "profile" };
    if (isEnglishPath(window.location.pathname)) return { kind: "english" };

    const legacyProjectId = parseProjectHash(window.location.hash);
    return legacyProjectId ? { kind: "project", projectId: legacyProjectId } : { kind: "home" };
  };
  const [route, setRoute] = useState<PageRoute>(readPageRoute);

  useEffect(() => {
    const syncPageRoute = () => {
      const pathProjectId = parseProjectPath(window.location.pathname);
      if (pathProjectId) {
        setRoute({ kind: "project", projectId: pathProjectId });
        return;
      }

      if (isProfilePath(window.location.pathname)) {
        setRoute({ kind: "profile" });
        return;
      }

      if (isEnglishPath(window.location.pathname)) {
        setRoute({ kind: "english" });
        return;
      }

      const legacyProjectId = parseProjectHash(window.location.hash);
      if (legacyProjectId) {
        window.history.replaceState(null, "", projectPath(legacyProjectId));
        setRoute({ kind: "project", projectId: legacyProjectId });
        return;
      }

      setRoute({ kind: "home" });
    };

    syncPageRoute();
    window.addEventListener("popstate", syncPageRoute);
    window.addEventListener("hashchange", syncPageRoute);
    return () => {
      window.removeEventListener("popstate", syncPageRoute);
      window.removeEventListener("hashchange", syncPageRoute);
    };
  }, []);

  return route;
}

function useInitialSectionHash(isStandalonePage: boolean) {
  const hasAppliedInitialHash = useRef(false);

  useEffect(() => {
    if (hasAppliedInitialHash.current || isStandalonePage) return;

    const targetId = window.location.hash.slice(1);
    if (!targetId || targetId.startsWith("project/")) {
      hasAppliedInitialHash.current = true;
      return;
    }

    const target = document.getElementById(targetId);
    if (!target) return;

    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "auto", block: "start" });
      hasAppliedInitialHash.current = true;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isStandalonePage]);
}

const fieldNotes = [
  {
    period: "2026 / RESEARCH",
    title: "VAP x EIT",
    copy: "把早期預警、資料治理、視覺化與邊緣系統放在同一條研究脈絡裡。",
    icon: Sparkles,
  },
  {
    period: "2026 / INDUSTRY",
    title: "ERP AI Quote",
    copy: "以企業文件、需求媒合與報價流程為入口，練習把 AI 放進既有工作系統。",
    icon: Database,
  },
  {
    period: "2026 / EDGE",
    title: "BioPulse-SoC",
    copy: "從量化模型、資料搬運到 PYNQ-Z1 展示，持續處理模型走到裝置前的最後一哩。",
    icon: Cpu,
  },
  {
    period: "2026 / AGENTS",
    title: "YieldSentry",
    copy: "把資料分析、知識庫與 8D 報告放進可稽核的半導體良率工作流。",
    icon: CircuitBoard,
  },
  {
    period: "2026 / TEACHING",
    title: "實驗課程協作",
    copy: "協助數位訊號處理實驗 Lab01 的作業批改與成績簿核對；電子電路實驗（一）A 班則為已指派的虛擬教室助教。",
    icon: GraduationCap,
  },
  {
    period: "2023 / CLOUD",
    title: "AWS Academy Cloud Foundations",
    copy: "完成 20 小時雲端基礎課程，作為後續雲端服務、資料流程與系統整合學習的起點。",
    icon: Database,
  },
];

const capabilityModules = [
  {
    number: "01",
    title: "資料到模型",
    copy: "從問題定義、資料管線到校準與可解釋性，把模型放回它真正需要回答的情境。",
    tags: ["Python", "MATLAB", "SHAP", "RAG"],
    icon: BrainCircuit,
  },
  {
    number: "02",
    title: "模型到邊緣",
    copy: "處理量化、資料搬運、FPGA 介面與可重現展示，讓模型能面對裝置限制。",
    tags: ["PYNQ-Z1", "hls4ml", "QDense", "AXI DMA"],
    icon: Cpu,
  },
  {
    number: "03",
    title: "流程到產品",
    copy: "把文件、資料契約、人工核准與使用者工作流整理成可以被交接的產品系統。",
    tags: ["OCR", "FastAPI", "ERP", "Dashboard"],
    icon: ClipboardCheck,
  },
  {
    number: "04",
    title: "研究到表述",
    copy: "清楚標示已完成、正在驗證與尚未開始的部分，讓展示與證據維持同一個尺度。",
    tags: ["Traceability", "Evidence", "SBAR", "System Design"],
    icon: BookOpen,
  },
];

const recognitionNotes = [
  { year: "2026", title: "Taiwan MATLAB Expo", status: "優選", tone: "award" as StatusTone },
  { year: "2026", title: "AI UNIVERSITY 產學實習成果發表", status: "銅獎", tone: "award" as StatusTone },
  { year: "2026", title: "智創未來生成式 AI 創意設計競賽", status: "NightOwl ICU 佳作", tone: "award" as StatusTone },
  { year: "2026", title: "欣銓半導體書院 AI Agent 實作競賽", status: "YieldSentry 佳作", tone: "award" as StatusTone },
  { year: "2026", title: "FPGA 智慧運算與終端節點創意應用競賽", status: "A3D3 Track 優選獎", tone: "award" as StatusTone },
  { year: "2026", title: "ICBEI 2026", status: "VAP 研究摘要接受 / 待發表", tone: "accepted" as StatusTone },
  { year: "2026", title: "全國醫學工程創意競賽", status: "嚥域入圍決賽", tone: "review" as StatusTone },
];

function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <span className={`status-pill status-${tone}`}>
      <span className="status-pulse" aria-hidden="true" />
      {children}
    </span>
  );
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      frameRef.current = null;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setProgress(Math.min(Math.max(window.scrollY / maxScroll, 0), 1));
    };

    const onScroll = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return progress;
}

function useRevealOnScroll(renderKey: string | null) {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) observer.unobserve(entry.target);
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [renderKey]);
}

function ScrollingSubtitle() {
  const subtitleRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: subtitleRef,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["-7%", "-46%"]);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="scrolling-subtitle" ref={subtitleRef} aria-hidden="true">
      <m.span style={shouldReduceMotion ? undefined : { x }}>
        OBSERVE / MODEL / TRANSFER / OBSERVE / MODEL / TRANSFER / OBSERVE / MODEL / TRANSFER /
      </m.span>
    </div>
  );
}

function SystemMap() {
  return (
    <section id="current-work" className="system-map" aria-labelledby="system-map-heading">
      <div className="system-map-header">
        <span><Radar size={18} aria-hidden="true" /> CURRENT WORK / PUBLIC STATUS</span>
        <span>{String(currentThreads.length).padStart(2, "0")} TRACKS / 2026</span>
      </div>
      <div className="system-map-intro">
        <div>
          <p>PUBLIC STATUS BOARD</p>
          <h2 id="system-map-heading">目前進行中工作</h2>
        </div>
        <span>代表成果以外，這些公開工作仍在持續推進。</span>
      </div>
      <ol className="system-thread-list">
        {currentThreads.map((thread, index) => (
          <li key={thread.id}>
            <a className="system-thread" href={projectPath(thread.id)}>
              <span className="thread-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="thread-copy">
                <span className="thread-meta">
                  <small className="thread-lane">{thread.lane}</small>
                  <span className={`thread-status thread-status-${thread.tone}`}><span aria-hidden="true" />{thread.status}</span>
                </span>
                <strong>{thread.label}</strong>
                <span className="thread-detail">{thread.detail}</span>
                <span className="thread-next"><em>下一步</em>{thread.next}</span>
              </span>
              <span className="thread-action">開啟公開頁面 <ArrowUpRight size={17} aria-hidden="true" /></span>
            </a>
          </li>
        ))}
      </ol>
      <div className="system-map-footer">
        <span><span className="signal-dot" /> 狀態與公開範圍均以各案頁面為準</span>
      </div>
    </section>
  );
}

function FeaturedStage({
  project,
  localCharacterPreview,
}: {
  project: PortfolioProject;
  localCharacterPreview: LocalCharacterPreview | null;
}) {
  return (
    <m.article
      animate={{ opacity: 1, y: 0 }}
      aria-live="polite"
      className={`featured-stage accent-${project.accent}`}
      exit={{ opacity: 0, y: -14 }}
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="featured-copy">
        <p className="project-category">{project.category}</p>
        <div className="featured-title-row">
          <div>
            <h3>{project.title}</h3>
            <p className="project-english">{project.english}</p>
          </div>
          <StatusPill tone={project.statusTone}>{project.status}</StatusPill>
        </div>
        <p className="project-description">{project.summary}</p>
        <p className="project-detail">{project.detail}</p>
        <ul className="project-tags" aria-label={`${project.title} 技術標籤`}>
          {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
        <div className="project-meta-row">
          <span>{project.role}</span>
          <span>{project.team}</span>
        </div>
        <a className="text-action" href={projectPath(project.id)}>
          開啟完整檔案 <ArrowDownRight size={18} />
        </a>
      </div>
      <div className="featured-visual" aria-hidden="true">
        <LocalCharacterBackdrop placement="featured" preview={localCharacterPreview} />
        <span className="visual-number">{project.sequence}</span>
        <span className="visual-label">FLAGSHIP CASE</span>
        <div className="visual-orbit visual-orbit-a" />
        <div className="visual-orbit visual-orbit-b" />
        <div className="visual-module visual-module-a"><Cpu size={39} /></div>
        <div className="visual-module visual-module-b"><Database size={31} /></div>
        <div className="visual-module visual-module-c"><CircuitBoard size={35} /></div>
        <span className="visual-coordinate coordinate-a">{project.metric}</span>
        <span className="visual-coordinate coordinate-b">SYSTEM / PROFILE</span>
      </div>
    </m.article>
  );
}

function CaseStudyMediaGateway({
  project,
  localCharacterPreview,
}: {
  project: PortfolioProject;
  localCharacterPreview: LocalCharacterPreview | null;
}) {
  const caseStudy = getCaseStudy(project.id);
  const mediaCount = caseStudy?.media.length ?? 0;

  if (!caseStudy) return null;

  return (
    <section
      className={`case-media-gateway${hasLocalCharacterBackdrop("media", localCharacterPreview) ? " has-local-character-backdrop" : ""}`}
      aria-labelledby="case-media-gateway-heading"
    >
      <LocalCharacterBackdrop placement="media" preview={localCharacterPreview} />
      <div className="case-media-gateway-copy">
        <p className="case-media-gateway-kicker"><span className="signal-dot signal-dot-coral" /> CASE STUDY MEDIA</p>
        <h3 id="case-media-gateway-heading">從公開素材，進入完整案例。</h3>
        <p>目前焦點是「{project.title}」。先從可公開的媒體切面、系統流程與佐證索引開始，再進入完整 Case Study。</p>
        <a className="case-media-gateway-action" href={`${projectPath(project.id)}#media-${project.id}`}>
          開啟 {project.title} 的媒體導覽 <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </div>
      <dl className="case-media-gateway-meta" aria-label="案例媒體入口摘要">
        <div><dt>ACTIVE FILE</dt><dd>{project.sequence}</dd></div>
        <div><dt>PUBLIC VIEWS</dt><dd>{mediaCount.toString().padStart(2, "0")}</dd></div>
        <div><dt>ENTRY</dt><dd>MEDIA / EVIDENCE</dd></div>
      </dl>
    </section>
  );
}

function ProjectArchive({
  filter,
  onFilterChange,
  localCharacterPreview,
}: {
  filter: ArchiveFilter;
  onFilterChange: (filter: ArchiveFilter) => void;
  localCharacterPreview: LocalCharacterPreview | null;
}) {
  const visibleProjects = useMemo(
    () => {
      if (filter === "all") return portfolioProjects;
      if (filter === "case-study") return portfolioProjects.filter((project) => getCaseStudy(project.id));
      if (filter === "award") return portfolioProjects.filter((project) => project.statusTone === "award");
      if (filter === "coursework") return portfolioProjects.filter((project) => project.lane === "academic");
      return portfolioProjects.filter((project) => project.lane === filter);
    },
    [filter],
  );
  const activeFilter = archiveFilterInfo[filter];

  return (
    <section id="archive" className="archive-section" aria-labelledby="archive-heading">
      <div className="section-heading reveal">
        <p className="section-index">03 / COMPLETE ARCHIVE</p>
        <div>
          <h2 id="archive-heading">作品檔案庫</h2>
          <p>把已完成的成果、研究型原型、計畫、課程實作與創作企畫放在同一份索引中，但不讓不同狀態混在一起。</p>
        </div>
        <p className="archive-count">{visibleProjects.length.toString().padStart(2, "0")} / {portfolioProjects.length.toString().padStart(2, "0")} FILES<br />STATUS-BOUND</p>
      </div>

      <div className="archive-filter-wrap reveal" aria-label="作品分類篩選">
        <div className="archive-filter-groups">
          <div className="archive-filter-group">
            <p>分類</p>
            <div className="archive-filter-list" role="group" aria-label="作品分類">
              {archiveLaneFilters.map((lane) => (
                <button
                  className={lane === filter ? "archive-filter is-active" : "archive-filter"}
                  key={lane}
                  type="button"
                  aria-pressed={lane === filter}
                  onClick={() => onFilterChange(lane)}
                >
                  {archiveFilterInfo[lane].label}
                </button>
              ))}
            </div>
          </div>
          <div className="archive-filter-group">
            <p>快速篩選</p>
            <div className="archive-filter-list" role="group" aria-label="作品快速篩選">
              {archiveQuickFilters.map((quickFilter) => (
                <button
                  className={quickFilter.id === filter ? "archive-filter is-active" : "archive-filter"}
                  key={quickFilter.id}
                  type="button"
                  aria-pressed={quickFilter.id === filter}
                  onClick={() => onFilterChange(quickFilter.id)}
                >
                  {quickFilter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="archive-filter-copy">{activeFilter.eyebrow}</p>
      </div>

      {filter === "creative" && hasLocalCharacterBackdrop("archive", localCharacterPreview) && (
        <div className="archive-character-stage">
          <LocalCharacterBackdrop placement="archive" preview={localCharacterPreview} />
        </div>
      )}

      <m.ul className="archive-grid" aria-label="專案清單" layout transition={{ layout: { duration: 0.34, ease: "easeOut" } }}>
        <AnimatePresence initial={false}>
          {visibleProjects.map((project, index) => (
            <m.li
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -12 }}
              initial={{ opacity: 0, scale: 0.985, y: 14 }}
              key={project.id}
              layout="position"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
            <a
              aria-label={`查看 ${project.title} 的完整專案檔案`}
              className={`archive-card accent-${project.accent}`}
              href={projectPath(project.id)}
            >
              <span className="archive-card-top">
                <span>{project.sequence}</span>
                <span className="archive-card-statuses">
                  {getCaseStudy(project.id) && <span className="archive-card-flagship">FLAGSHIP CASE</span>}
                  <StatusPill tone={project.statusTone}>{project.status}</StatusPill>
                </span>
              </span>
              <span className="archive-card-title">{project.title}</span>
              <span className="archive-card-summary">{project.summary}</span>
              <span className="archive-card-meta">
                <span>{/^20\d{2}$/.test(project.year) ? `YEAR / ${project.year}` : `TYPE / ${project.year}`}</span>
                <span>ROLE / {project.role}</span>
              </span>
              <span className="archive-card-bottom">
                <span>{project.lane === "academic" ? "ACADEMIC LAB" : project.category}</span>
                <MoveRight size={17} />
              </span>
              <span className="archive-card-number" aria-hidden="true">{(index + 1).toString().padStart(2, "0")}</span>
            </a>
            </m.li>
          ))}
        </AnimatePresence>
      </m.ul>
    </section>
  );
}

function CaseStudyFlow({
  caseStudy,
  localCharacterPreview,
}: {
  caseStudy: CaseStudy;
  localCharacterPreview: LocalCharacterPreview | null;
}) {
  return (
    <section
      className={`case-study-flow${hasLocalCharacterBackdrop("flow", localCharacterPreview) ? " has-local-character-backdrop" : ""}`}
      aria-labelledby={`case-flow-${caseStudy.projectId}`}
    >
      <LocalCharacterBackdrop placement="flow" preview={localCharacterPreview} />
      <div className="case-study-section-heading">
          <p>03 / SYSTEM FLOW</p>
        <div>
          <h3 id={`case-flow-${caseStudy.projectId}`}>從問題到可交接的系統路徑</h3>
          <p>每一節點都對應實際工作中的資料、方法、介面或人工責任，不將流程圖當成裝飾。</p>
        </div>
      </div>
      <ol className="case-flow-list">
        {caseStudy.system.map((step, index) => (
          <m.li
            className="case-flow-step"
            initial={{ opacity: 0, x: -20 }}
            key={step.label}
            transition={{ delay: index * 0.06, duration: 0.36, ease: "easeOut" }}
            viewport={{ amount: 0.35, once: true }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <span className="case-flow-index">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{step.label}</strong>
              <p>{step.detail}</p>
            </div>
          </m.li>
        ))}
      </ol>
    </section>
  );
}

function CaseStudyMediaFrame({ media }: { media: CaseStudy["media"][number] }) {
  const hasAsset = hasPublicMediaAsset(media);

  return (
    <figure className="case-media-stage" aria-live="polite">
      {hasAsset ? (
        <div className="case-media-source-frame">
          <img
            className="case-media-source"
            decoding="async"
            height={900}
            loading="lazy"
            src={media.src}
            alt={media.alt}
            width={1600}
          />
        </div>
      ) : (
        <div className={`case-media-synthesis is-${media.kind}`}>
          <div className="case-media-synthesis-top">
            <span>{media.status}</span>
            <span>WEBSITE-NATIVE SUMMARY</span>
          </div>
          <div className="case-media-synthesis-grid" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span /><span />
          </div>
          <div className="case-media-synthesis-copy">
            <p>{media.kind.toUpperCase()} LAYER</p>
            <strong>{media.title}</strong>
          </div>
        </div>
      )}
      <figcaption>
        <span className="case-media-caption-status">{media.status}</span>
        <p className="case-media-provenance">
          {hasAsset
            ? media.provenance
            : "此切面以網站原生摘要視覺說明案例結構與公開範圍，並非產品或介面截圖。"}
        </p>
        <p className="case-media-caption-copy">{media.caption}</p>
      </figcaption>
    </figure>
  );
}

function CaseStudyMediaNavigator({
  caseStudy,
  localCharacterPreview,
}: {
  caseStudy: CaseStudy;
  localCharacterPreview: LocalCharacterPreview | null;
}) {
  const [activeMediaId, setActiveMediaId] = useState(() => caseStudy.media[0]?.id ?? "");
  const [isMediaExpanded, setIsMediaExpanded] = useState(false);
  const mediaDialogRef = useRef<HTMLDivElement>(null);
  const mediaExpandButtonRef = useRef<HTMLButtonElement>(null);
  const activeMedia = caseStudy.media.find((media) => media.id === activeMediaId) ?? caseStudy.media[0];
  const activeMediaIndex = Math.max(0, caseStudy.media.findIndex((media) => media.id === activeMedia?.id));

  useEffect(() => {
    setActiveMediaId(caseStudy.media[0]?.id ?? "");
    setIsMediaExpanded(false);
  }, [caseStudy.projectId, caseStudy.media]);

  useEffect(() => {
    if (!isMediaExpanded) return;

    const frame = window.requestAnimationFrame(() => mediaDialogRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isMediaExpanded]);

  if (!activeMedia) return null;

  const activeMediaHasAsset = hasPublicMediaAsset(activeMedia);

  const selectRelativeMedia = (offset: number) => {
    const nextIndex = (activeMediaIndex + offset + caseStudy.media.length) % caseStudy.media.length;
    setActiveMediaId(caseStudy.media[nextIndex]?.id ?? activeMedia.id);
  };

  const closeExpandedMedia = () => {
    setIsMediaExpanded(false);
    window.requestAnimationFrame(() => mediaExpandButtonRef.current?.focus());
  };

  return (
    <>
      <section
        id={`media-${caseStudy.projectId}`}
        className={`case-study-media${hasLocalCharacterBackdrop("media", localCharacterPreview) ? " has-local-character-backdrop" : ""}`}
        aria-labelledby={`case-media-${caseStudy.projectId}`}
      >
        <LocalCharacterBackdrop placement="media" preview={localCharacterPreview} />
        <div className="case-study-section-heading">
          <p>02 / PUBLIC MEDIA</p>
          <div>
            <h3 id={`case-media-${caseStudy.projectId}`}>公開素材與案例切面</h3>
            <p>
              {activeMediaHasAsset
                ? `目前顯示 ${activeMedia.status}：${activeMedia.provenance}`
                : "目前顯示網站原生摘要視覺，用於說明案例結構與公開範圍，不把它包裝成真實產品截圖。"}
            </p>
          </div>
        </div>
        <div className="case-media-workspace">
          <div className="case-media-stage-shell">
            <CaseStudyMediaFrame media={activeMedia} />
            <button
              aria-haspopup="dialog"
              aria-label={`展開檢視 ${activeMedia.title}`}
              className="case-media-expand"
              onClick={() => setIsMediaExpanded(true)}
              ref={mediaExpandButtonRef}
              title="展開檢視"
              type="button"
            >
              <Maximize2 size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="case-media-controls" aria-label="公開媒體導覽" role="group">
            {caseStudy.media.map((media) => {
              const isActive = media.id === activeMedia.id;
              return (
                <button
                  aria-pressed={isActive}
                  className={`case-media-control${isActive ? " is-active" : ""}`}
                  key={media.id}
                  onClick={() => setActiveMediaId(media.id)}
                  type="button"
                >
                  <span>{media.label}</span>
                  <strong>{media.title}</strong>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <AnimatePresence initial={false}>
        {isMediaExpanded ? (
          <m.div
            animate={{ opacity: 1 }}
            className="case-media-dialog-backdrop"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeExpandedMedia();
            }}
          >
            <m.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              aria-label={`檢視 ${activeMedia.title}`}
              aria-modal="true"
              className="case-media-dialog"
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              onKeyDown={(event) => {
                if (event.key === "Tab") {
                  const focusableButtons = Array.from(
                    mediaDialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [],
                  );
                  const firstButton = focusableButtons[0];
                  const lastButton = focusableButtons[focusableButtons.length - 1];

                  if (firstButton && lastButton) {
                    const activeElement = document.activeElement;
                    if (event.shiftKey && (activeElement === mediaDialogRef.current || activeElement === firstButton)) {
                      event.preventDefault();
                      lastButton.focus();
                    }
                    if (!event.shiftKey && activeElement === lastButton) {
                      event.preventDefault();
                      firstButton.focus();
                    }
                  }
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeExpandedMedia();
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  selectRelativeMedia(-1);
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  selectRelativeMedia(1);
                }
              }}
              ref={mediaDialogRef}
              role="dialog"
              tabIndex={-1}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <header className="case-media-dialog-header">
                <span>PUBLIC MEDIA / {String(activeMediaIndex + 1).padStart(2, "0")} OF {String(caseStudy.media.length).padStart(2, "0")}</span>
                <button aria-label="關閉展開檢視" className="case-media-dialog-close" onClick={closeExpandedMedia} title="關閉" type="button">
                  <X size={20} aria-hidden="true" />
                </button>
              </header>
              <div className="case-media-dialog-content">
                <button
                  aria-label="檢視上一項公開媒體"
                  className="case-media-dialog-nav"
                  disabled={caseStudy.media.length < 2}
                  onClick={() => selectRelativeMedia(-1)}
                  title="上一項"
                  type="button"
                >
                  <ChevronLeft size={26} aria-hidden="true" />
                </button>
                <div className="case-media-dialog-frame">
                  <CaseStudyMediaFrame media={activeMedia} />
                </div>
                <button
                  aria-label="檢視下一項公開媒體"
                  className="case-media-dialog-nav"
                  disabled={caseStudy.media.length < 2}
                  onClick={() => selectRelativeMedia(1)}
                  title="下一項"
                  type="button"
                >
                  <ChevronRight size={26} aria-hidden="true" />
                </button>
              </div>
              <footer className="case-media-dialog-footer">
                <span>{activeMedia.status}</span>
                <strong>{activeMedia.title}</strong>
              </footer>
            </m.div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function CaseStudyEvidenceIndex({
  caseStudy,
  localCharacterPreview,
}: {
  caseStudy: CaseStudy;
  localCharacterPreview: LocalCharacterPreview | null;
}) {
  if (!caseStudy.evidence.length && !caseStudy.links.length) return null;

  return (
    <section
      className={`case-study-evidence${hasLocalCharacterBackdrop("evidence", localCharacterPreview) ? " has-local-character-backdrop" : ""}`}
      aria-labelledby={`case-evidence-${caseStudy.projectId}`}
    >
      <LocalCharacterBackdrop placement="evidence" preview={localCharacterPreview} />
      <div className="case-study-section-heading">
        <p>07 / EVIDENCE INDEX</p>
        <div>
          <h3 id={`case-evidence-${caseStudy.projectId}`}>把可公開佐證與入口分開列示</h3>
          <p>每張卡末行的 SOURCE 說明來源類型；RESTRICTED 代表有對應紀錄，但原始佐證不在本站公開。</p>
        </div>
      </div>
      {caseStudy.evidence.length > 0 && (
        <div className="case-evidence-grid">
          {caseStudy.evidence.map((item) => (
            <article className="case-evidence-card" key={`${item.label}-${item.value}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
              <small className="case-evidence-source">SOURCE / {item.source}</small>
            </article>
          ))}
        </div>
      )}
      {caseStudy.links.length > 0 && (
        <div className="case-link-index">
          <div className="case-link-index-intro">
            <Link2 size={20} aria-hidden="true" />
            <div>
              <p>RESOURCE INDEX</p>
              <h4>公開資源入口</h4>
            </div>
          </div>
          <ul className="case-link-list">
            {caseStudy.links.map((link) => {
              const body = (
                <>
                  <span className="case-link-main">
                    <span>{link.label}</span>
                    <strong>{link.title}</strong>
                    <small>{link.detail}</small>
                  </span>
                  {link.href ? <ExternalLink size={18} aria-hidden="true" /> : <span className="case-link-status">{link.availability}</span>}
                </>
              );

              return (
                <li key={`${link.label}-${link.title}`}>
                  {link.href ? (
                    <a
                      aria-label={`在新分頁開啟 ${link.title}`}
                      className="case-link"
                      href={link.href}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="case-link is-restricted">
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function FlagshipCaseStudy({
  caseStudy,
  project,
  localCharacterPreview,
}: {
  caseStudy: CaseStudy;
  project: PortfolioProject;
  localCharacterPreview: LocalCharacterPreview | null;
}) {
  return (
    <section className={`case-study case-study-${project.accent}`} aria-labelledby={`case-heading-${project.id}`}>
      <m.div
        className="case-study-intro"
        initial={{ opacity: 0, y: 28 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ amount: 0.2, once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <div className="case-study-title-block">
          <p className="case-study-label">01 / {caseStudy.label}</p>
          <h2 id={`case-heading-${project.id}`}>{caseStudy.headline}</h2>
          <p className="case-study-lead">{caseStudy.lead}</p>
        </div>
        <aside className="case-study-brief" aria-label={`${project.title} 的案例重點`}>
          <div>
            <span>FOCUS</span>
            <strong>{caseStudy.focus}</strong>
          </div>
          <div>
            <span>MY CONTRIBUTION</span>
            <ul>
              {caseStudy.contribution.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </aside>
      </m.div>

      <CaseStudyMediaNavigator caseStudy={caseStudy} localCharacterPreview={localCharacterPreview} />

      <CaseStudyFlow caseStudy={caseStudy} localCharacterPreview={localCharacterPreview} />

      <section className="case-study-chapters" aria-labelledby={`case-chapters-${caseStudy.projectId}`}>
        <div className="case-study-section-heading">
          <p>04 / CASE NOTES</p>
          <div>
            <h3 id={`case-chapters-${caseStudy.projectId}`}>為什麼做、怎麼做、做到哪裡</h3>
            <p>以工作判斷與責任邊界為主，而不是只堆疊技術名稱。</p>
          </div>
        </div>
        <div className="case-chapter-list">
          {caseStudy.chapters.map((chapter, index) => (
            <m.article
              className="case-chapter"
              initial={{ opacity: 0, y: 24 }}
              key={chapter.index}
              transition={{ delay: index * 0.07, duration: 0.42, ease: "easeOut" }}
              viewport={{ amount: 0.24, once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="case-chapter-index"><span>{chapter.index}</span><span>{chapter.eyebrow}</span></div>
              <h4>{chapter.title}</h4>
              <p>{chapter.copy}</p>
            </m.article>
          ))}
        </div>
      </section>

      <section className="case-study-history" aria-labelledby={`case-history-${caseStudy.projectId}`}>
        <div className="case-study-section-heading">
          <p>05 / PROJECT RECORD</p>
          <div>
            <h3 id={`case-history-${caseStudy.projectId}`}>把進度寫成可回看的紀錄</h3>
            <p>每個節點標示工作階段與目前能公開陳述的狀態。</p>
          </div>
        </div>
        <ol className="case-milestone-list">
          {caseStudy.milestones.map((milestone, index) => (
            <li key={`${milestone.stage}-${milestone.title}`}>
              <span className="case-milestone-number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>{milestone.stage}</p>
                <h4>{milestone.title}</h4>
                <span>{milestone.copy}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="case-study-outcomes" aria-labelledby={`case-outcomes-${caseStudy.projectId}`}>
        <div className="case-study-section-heading">
          <p>06 / OUTCOMES</p>
          <div>
            <h3 id={`case-outcomes-${caseStudy.projectId}`}>留下的不是一張漂亮截圖</h3>
            <p>成果以競賽、角色、方法或系統狀態陳述，不把原型誇大成未完成的部署。</p>
          </div>
        </div>
        <div className="case-outcome-grid">
          {caseStudy.outcomes.map((outcome, index) => (
            <m.article
              className="case-outcome"
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              key={`${outcome.label}-${outcome.value}`}
              transition={{ delay: index * 0.06, duration: 0.34, ease: "easeOut" }}
              viewport={{ amount: 0.35, once: true }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
            >
              <span>{outcome.label}</span>
              <strong>{outcome.value}</strong>
              <p>{outcome.copy}</p>
            </m.article>
          ))}
        </div>
      </section>

      <CaseStudyEvidenceIndex caseStudy={caseStudy} localCharacterPreview={localCharacterPreview} />

      <section className="case-study-boundaries" aria-labelledby={`case-boundaries-${caseStudy.projectId}`}>
        <div>
          <p>08 / PUBLIC SCOPE</p>
          <h3 id={`case-boundaries-${caseStudy.projectId}`}>這個案例公開到哪裡</h3>
          <span className="case-public-scope-summary">{caseStudy.publicScope.summary}</span>
        </div>
        <ul>
          {caseStudy.publicScope.exclusions.map((boundary) => (
            <li key={boundary}><BadgeCheck size={20} aria-hidden="true" /><span>{boundary}</span></li>
          ))}
        </ul>
      </section>
    </section>
  );
}

function ProjectDetailPage({
  project,
  projectIndex,
  previousProject,
  nextProject,
  localCharacterPreview,
}: {
  project: PortfolioProject;
  projectIndex: number;
  previousProject?: PortfolioProject;
  nextProject?: PortfolioProject;
  localCharacterPreview: LocalCharacterPreview | null;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const caseStudy = getCaseStudy(project.id);

  useEffect(() => {
    if (window.location.hash) return;

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
      headingRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [project.id]);

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      className={`project-page accent-${project.accent}`}
      exit={{ opacity: 0, y: -18 }}
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.34, ease: "easeOut" }}
    >
      <a
        className="skip-link"
        href="#project-detail"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("project-detail")?.focus();
        }}
      >
        跳至主要內容
      </a>
      <header className="detail-topbar">
        <a className="detail-brand" href="/" aria-label="回到網站首頁">
          <span>MY</span>
          <span>01</span>
        </a>
        <p>PROJECT FILE / {project.sequence}</p>
        <a className="detail-back" href="/#archive" aria-label="返回作品檔案">
          <ArrowLeft size={18} /> <span>返回作品檔案</span>
        </a>
      </header>

      <main className="project-detail-page" id="project-detail" tabIndex={-1}>
        <section className="detail-hero">
          <div className="detail-hero-copy">
            <p className="detail-kicker">{project.category}</p>
            <h1 ref={headingRef} tabIndex={-1}>{project.title}</h1>
            <p className="detail-english">{project.english}</p>
            <div className="detail-status-row">
              <StatusPill tone={project.statusTone}>{project.status}</StatusPill>
              <span>{laneLabels[project.lane].label}</span>
            </div>
            <p className="detail-summary">{project.summary}</p>
          </div>

          <aside className="detail-signal-board" aria-hidden="true">
            <span className="detail-board-label">PROJECT INDEX</span>
            <strong>{project.sequence}</strong>
            <span className="detail-board-metric">{project.metric}</span>
            <span className="detail-board-line detail-board-line-a" />
            <span className="detail-board-line detail-board-line-b" />
            <span className="detail-board-node detail-board-node-a" />
            <span className="detail-board-node detail-board-node-b" />
          </aside>
        </section>

        <section className="detail-record" aria-labelledby="detail-record-heading">
          <div className="detail-record-heading">
            <p>CASE RECORD / {String(projectIndex + 1).padStart(2, "0")} OF {String(orderedPortfolioProjects.length).padStart(2, "0")}</p>
            <h2 id="detail-record-heading">專案摘要與公開範圍</h2>
          </div>
          <div className="detail-record-grid">
            <p className="detail-description">{project.detail}</p>
            <dl className="detail-facts">
              <div><dt>YEAR</dt><dd>{project.year}</dd></div>
              <div><dt>ROLE</dt><dd>{project.role}</dd></div>
              <div><dt>TEAM</dt><dd>{project.team}</dd></div>
              <div><dt>TRACK</dt><dd>{laneLabels[project.lane].label}</dd></div>
            </dl>
          </div>
          <div className="detail-record-footer">
            <div>
              <p>TOOLS / METHODS</p>
              <ul className="project-tags" aria-label={`${project.title} 技術標籤`}>
                {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            </div>
            <p className="detail-public-scope"><BadgeCheck size={18} /> {project.publicScope}</p>
          </div>
        </section>

        {caseStudy && <FlagshipCaseStudy caseStudy={caseStudy} localCharacterPreview={localCharacterPreview} project={project} />}

        <nav className="detail-pagination" aria-label="專案前後導覽">
          {previousProject ? (
            <a className="detail-pagination-link is-previous" href={projectPath(previousProject.id)}>
              <ArrowLeft size={20} />
              <span><small>PREVIOUS FILE</small>{previousProject.title}</span>
            </a>
          ) : (
            <span className="detail-pagination-link is-disabled"><ArrowLeft size={20} /><span><small>PREVIOUS FILE</small>已是第一個專案</span></span>
          )}
          <a className="detail-pagination-link detail-pagination-index" href="/#archive">
            <span>ALL</span>
            <span>{String(projectIndex + 1).padStart(2, "0")} / {String(orderedPortfolioProjects.length).padStart(2, "0")}</span>
          </a>
          {nextProject ? (
            <a className="detail-pagination-link is-next" href={projectPath(nextProject.id)}>
              <span><small>NEXT FILE</small>{nextProject.title}</span>
              <ArrowRight size={20} />
            </a>
          ) : (
            <span className="detail-pagination-link is-disabled"><span><small>NEXT FILE</small>已是最後一個專案</span><ArrowRight size={20} /></span>
          )}
        </nav>
      </main>
    </m.div>
  );
}

function ProfilePage({ localCharacterPreview }: { localCharacterPreview: LocalCharacterPreview | null }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
      headingRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      className="profile-page"
      exit={{ opacity: 0, y: -18 }}
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.34, ease: "easeOut" }}
    >
      <a
        className="skip-link"
        href="#profile-detail"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("profile-detail")?.focus();
        }}
      >
        跳至主要內容
      </a>
      <header className="detail-topbar">
        <a className="detail-brand" href="/" aria-label="回到網站首頁">
          <span>MY</span>
          <span>01</span>
        </a>
        <p>PUBLIC PROFILE / 2026</p>
        <a className="detail-back" href="/#contact" aria-label="返回合作與聯絡區塊">
          <ArrowLeft size={18} /> <span>返回作品集</span>
        </a>
      </header>

      <main className="profile-page-main" id="profile-detail" tabIndex={-1}>
        <section className="profile-page-hero">
          <LocalCharacterPreviewArtwork placement="profile" src={localCharacterPreview?.profile} />
          <div className="profile-page-hero-copy">
            <p className="detail-kicker">PUBLIC PROFESSIONAL SUMMARY</p>
            <h1 ref={headingRef} tabIndex={-1}>蔡旻佑</h1>
            <p className="profile-page-english">MIN-YU TSAI / BIOMEDICAL AI · EDGE SYSTEMS · INTELLIGENT WORKFLOWS</p>
            <p className="profile-page-lead">以生醫 AI、邊緣運算與智慧工作流為主軸，從問題定義、模型方法到系統交接，持續累積跨領域的實作經驗。</p>
            <div className="profile-page-actions">
              <a className="primary-action" href="/#featured">查看六件旗艦案例 <ArrowDownRight size={19} /></a>
              <a className="secondary-action" href="https://github.com/Daniel-Tsai-9487" rel="noopener noreferrer" target="_blank">前往 GitHub <ArrowUpRight size={19} /></a>
            </div>
          </div>
          <aside className="profile-page-signal-board" aria-hidden="true">
            <span>PUBLIC SNAPSHOT</span>
            <strong>06</strong>
            <span>FLAGSHIP CASES</span>
            <div><span>BASE</span><strong>EE / YZU</strong></div>
            <div><span>METHOD</span><strong>MODEL TO SYSTEM</strong></div>
          </aside>
        </section>

        <section className="profile-positioning-section" aria-labelledby="profile-positioning-heading">
          <div>
            <p className="section-index">00 / POSITIONING</p>
            <h2 id="profile-positioning-heading">把跨域問題，<br />收斂成可交接的系統。</h2>
          </div>
          <p>研究型問題需要謹慎地標示資料、驗證與使用邊界；產品型問題則需要讓流程、決策與交付能被看見。我的工作重點是讓這兩種要求在同一個系統設計中對齊。</p>
        </section>

        <section className="profile-flagship-section" aria-labelledby="profile-flagship-heading">
          <div className="profile-page-section-heading">
            <p>01 / FLAGSHIP CASE STUDIES</p>
            <div>
              <h2 id="profile-flagship-heading">六件可深入閱讀的案例</h2>
              <p>每一案都保留問題、角色、公開素材、可公開佐證與範圍說明，避免用單一成果標籤取代實際脈絡。</p>
            </div>
          </div>
          <div className="profile-case-grid">
            {flagshipProjects.map((project, index) => (
              <m.article
                className={`profile-case-card accent-${project.accent}`}
                initial={{ opacity: 0, y: 16 }}
                key={project.id}
                transition={{ delay: index * 0.04, duration: 0.3, ease: "easeOut" }}
                viewport={{ amount: 0.2, once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="profile-case-top">
                  <span>{project.sequence}</span>
                  <StatusPill tone={project.statusTone}>{project.status}</StatusPill>
                </div>
                <p>{project.category}</p>
                <h3>{project.title}</h3>
                <span className="profile-case-english">{project.english}</span>
                <p className="profile-case-summary">{project.summary}</p>
                <span className="profile-case-role">ROLE / {project.role}</span>
                <a href={projectPath(project.id)}>開啟完整 Case Study <ArrowUpRight size={18} aria-hidden="true" /></a>
              </m.article>
            ))}
          </div>
        </section>

        <section className="profile-method-section" aria-labelledby="profile-method-heading">
          <div className="profile-page-section-heading">
            <p>02 / WORKING METHOD</p>
            <div>
              <h2 id="profile-method-heading">能力要能落在工作流程裡。</h2>
              <p>不把工具名稱當成能力本身，而是說清楚它們各自在資料、裝置、流程與公開表述中解決的問題。</p>
            </div>
          </div>
          <div className="profile-method-grid">
            {capabilityModules.slice(0, 3).map((module) => {
              const ModuleIcon = module.icon;
              return (
                <article key={module.number}>
                  <div><span>{module.number}</span><ModuleIcon size={25} aria-hidden="true" /></div>
                  <h3>{module.title}</h3>
                  <p>{module.copy}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="profile-contact-section" aria-labelledby="profile-contact-heading">
          <div>
            <p className="section-index">03 / PUBLIC CONTACT ROUTES</p>
            <h2 id="profile-contact-heading">從公開資料開始對話。</h2>
            <p>合作、研究交流與系統原型討論，可先透過公開案例與 GitHub 了解目前可分享的工作內容；受限資料與合作內容不在本站揭露範圍內。</p>
          </div>
          <div className="profile-contact-links">
            <a className="profile-github-link" href="https://github.com/Daniel-Tsai-9487" rel="noopener noreferrer" target="_blank">
              <Github size={24} aria-hidden="true" />
              <span><small>PRIMARY PUBLIC ENTRY</small><strong>GitHub / Daniel-Tsai-9487</strong></span>
              <ArrowUpRight size={21} aria-hidden="true" />
            </a>
            <a className="profile-return-link" href="/">返回完整作品集 <ArrowLeft size={18} aria-hidden="true" /></a>
          </div>
        </section>
      </main>
    </m.div>
  );
}

function EnglishPage() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
      headingRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      className="english-page"
      exit={{ opacity: 0, y: -18 }}
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.34, ease: "easeOut" }}
    >
      <a
        className="skip-link"
        href="#english-main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("english-main")?.focus();
        }}
      >
        Skip to main content
      </a>
      <header className="detail-topbar english-topbar">
        <a className="detail-brand" href="/" aria-label="Return to the Chinese portfolio">
          <span>MY</span>
          <span>01</span>
        </a>
        <p>SELECTED CASES / EN</p>
        <a className="detail-back" href="/" aria-label="Open the Chinese portfolio">
          <ArrowLeft size={18} /> <span>中文版本</span>
        </a>
      </header>

      <main className="english-page-main" id="english-main" lang="en" tabIndex={-1}>
        <section className="english-hero" aria-labelledby="english-heading">
          <div>
            <p className="english-kicker">MIN-YU TSAI / SELECTED SYSTEMS PORTFOLIO</p>
            <h1 ref={headingRef} id="english-heading" tabIndex={-1}>Systems that carry research into usable work.</h1>
            <p className="english-lead">A concise selection of six projects across biomedical AI, edge systems, semiconductor workflows, enterprise AI, and fintech risk education. Each case stays within its public scope.</p>
            <div className="english-hero-actions">
              <a className="primary-action" href="#english-cases">Explore six cases <ArrowDownRight size={19} /></a>
              <a className="secondary-action" href="/">Open Chinese portfolio <ArrowUpRight size={19} /></a>
            </div>
          </div>
          <aside className="english-signal-board" aria-label="Portfolio summary">
            <span>SELECTED WORK</span>
            <strong>06</strong>
            <span>FLAGSHIP CASES</span>
            <div><span>BASE</span><strong>EE / YZU</strong></div>
            <div><span>METHOD</span><strong>MODEL TO SYSTEM</strong></div>
          </aside>
        </section>

        <section className="english-cases" id="english-cases" aria-labelledby="english-cases-heading">
          <div className="english-section-heading">
            <p>01 / SELECTED CASE STUDIES</p>
            <div>
              <h2 id="english-cases-heading">Six flagship projects, with public boundaries intact.</h2>
              <p>Each card includes a concise role and outcome statement. External resources appear only when they are publicly accessible and specific to that case.</p>
            </div>
          </div>
          <div className="english-case-grid">
            {flagshipProjectIds.map((projectId, index) => {
              const project = portfolioProjectById.get(projectId);
              const caseStudy = getCaseStudy(projectId);
              const summary = englishCaseSummaries[projectId];
              if (!project) return null;

              return (
                <article className={`english-case-card accent-${project.accent}`} key={projectId}>
                  <div className="english-case-top">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{summary.category}</span>
                  </div>
                  <h3>{summary.title}</h3>
                  <p>{summary.summary}</p>
                  <dl>
                    <div><dt>ROLE</dt><dd>{summary.role}</dd></div>
                    <div><dt>OUTCOME</dt><dd>{summary.outcome}</dd></div>
                  </dl>
                  <div className="english-case-actions">
                    <a href={projectPath(project.id)}>Read case study (ZH) <ArrowUpRight size={17} aria-hidden="true" /></a>
                    {caseStudy?.links.map((link) => link.availability === "PUBLIC" ? (
                      <a href={link.href} key={`${link.label}-${link.href}`} rel="noopener noreferrer" target="_blank">
                        {link.title} <ExternalLink size={16} aria-hidden="true" />
                      </a>
                    ) : null)}
                  </div>
                  <small>PUBLIC CASE SUMMARY / Restricted source material is not linked.</small>
                </article>
              );
            })}
          </div>
        </section>

        <section className="english-contact" aria-labelledby="english-contact-heading">
          <p>02 / PUBLIC CONTACT</p>
          <div>
            <h2 id="english-contact-heading">Start with the public record.</h2>
            <p>For research exchange, systems prototyping, competitions, or cross-disciplinary collaboration, begin with the public case summaries and clarify scope before discussing restricted data or partner material.</p>
          </div>
          <a href="https://github.com/Daniel-Tsai-9487" rel="noopener noreferrer" target="_blank">GitHub / Daniel-Tsai-9487 <ArrowUpRight size={19} aria-hidden="true" /></a>
        </section>
      </main>
    </m.div>
  );
}

function App() {
  const [activeFeatured, setActiveFeatured] = useState(0);
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const pageRoute = usePageRoute();
  const projectRouteId = pageRoute.kind === "project" ? pageRoute.projectId : null;
  const isProfileRoute = pageRoute.kind === "profile";
  const isEnglishRoute = pageRoute.kind === "english";
  useInitialSectionHash(projectRouteId !== null || isProfileRoute || isEnglishRoute);
  const previousProjectRouteRef = useRef<string | null>(projectRouteId);
  const pendingSectionIdRef = useRef<string | null>(null);
  const scrollProgress = useScrollProgress();
  const localCharacterPreview = useLocalCharacterPreview();
  useRevealOnScroll(projectRouteId);
  const routedProject = useMemo(
    () => orderedPortfolioProjects.find((project) => project.id === projectRouteId),
    [projectRouteId],
  );
  const activeProject = flagshipProjects[activeFeatured] ?? flagshipProjects[0];
  const shellStyle = { "--scroll-progress": scrollProgress } as CSSProperties;
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const wasOnProjectPage = previousProjectRouteRef.current !== null;

    if (routedProject) {
      pendingSectionIdRef.current = null;
      setArchiveFilter(routedProject.lane);
      setMenuOpen(false);
      document.title = `${routedProject.title} | 蔡旻佑作品檔案`;
      previousProjectRouteRef.current = routedProject.id;
      return;
    }

    if (isProfileRoute) {
      document.title = siteConfig.profileTitle;
      previousProjectRouteRef.current = null;
      return;
    }

    if (isEnglishRoute) {
      document.title = siteConfig.englishTitle;
      previousProjectRouteRef.current = null;
      return;
    }

    document.title = siteConfig.siteName;
    const targetId = window.location.hash.slice(1);
    if (wasOnProjectPage && targetId && !targetId.startsWith("project/")) {
      pendingSectionIdRef.current = targetId;
    }
    previousProjectRouteRef.current = null;
  }, [isEnglishRoute, isProfileRoute, routedProject]);

  const scrollToPendingSection = () => {
    const targetId = pendingSectionIdRef.current;
    if (!targetId) return;

    pendingSectionIdRef.current = null;
    window.requestAnimationFrame(() => {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      document.getElementById(targetId)?.scrollIntoView({ behavior, block: "start" });
    });
  };

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <AnimatePresence initial={false} mode="wait" onExitComplete={scrollToPendingSection}>
          {routedProject ? (
            <ProjectDetailPage
              key={routedProject.id}
              nextProject={orderedPortfolioProjects[orderedPortfolioProjects.findIndex((project) => project.id === routedProject.id) + 1]}
              previousProject={orderedPortfolioProjects[orderedPortfolioProjects.findIndex((project) => project.id === routedProject.id) - 1]}
              project={routedProject}
              projectIndex={orderedPortfolioProjects.findIndex((project) => project.id === routedProject.id)}
              localCharacterPreview={localCharacterPreview}
            />
          ) : isProfileRoute ? (
            <ProfilePage key="profile-page" localCharacterPreview={localCharacterPreview} />
          ) : isEnglishRoute ? (
            <EnglishPage key="english-page" />
          ) : (
            <m.div
              animate={{ opacity: 1, y: 0 }}
              className="site-shell is-ready"
              exit={{ opacity: 0, y: -12 }}
              initial={{ opacity: 0, y: 12 }}
              key="site-shell"
              style={shellStyle}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
      <a
        className="skip-link"
        href="#top"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("top")?.focus();
        }}
      >
        跳至主要內容
      </a>
      <header className="topbar">
        <a className="brand-mark" href="/" aria-label="回到首頁">
          <span>MY</span>
          <span>01</span>
        </a>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="主要導覽">
          <a href="#featured" onClick={closeMenu}>旗艦案例</a>
          <a href="#archive" onClick={closeMenu}>作品檔案</a>
          <a href={profilePath()} onClick={closeMenu}>公開概要</a>
          <a href={englishPath()} lang="en" onClick={closeMenu}>EN</a>
          <a href="#contact" onClick={closeMenu}>合作窗口</a>
        </nav>
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "關閉選單" : "開啟選單"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="scroll-meter" aria-hidden="true" />
      </header>

      <main id="top" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-heading">
          <LocalCharacterPreviewArtwork placement="hero" src={localCharacterPreview?.hero} />
          <div className="hero-copy entry-reveal">
            <p className="eyebrow"><span className="signal-dot" /> PERSONAL SYSTEMS PORTFOLIO / 2026</p>
            <h1 id="hero-heading">蔡旻佑</h1>
            <p className="hero-english">MIN-YU TSAI</p>
            <p className="hero-lead">在生醫 AI、邊緣運算與產品系統之間，把複雜問題轉成可以討論、驗證與交接的設計。</p>
            <div className="hero-actions">
              <a className="primary-action" href="#featured">從旗艦案例開始 <ArrowDownRight size={19} /></a>
              <a className="secondary-action" href="#archive">查看完整檔案 <ArrowDownRight size={19} /></a>
            </div>
          </div>

          <aside className="hero-meta entry-reveal" aria-label="個人資料摘要">
            <div><span>BASE</span><strong>元智大學<br />電機工程</strong></div>
            <div><span>FOCUS</span><strong>AI / EDGE<br />BIOMEDICAL</strong></div>
            <div><span>METHOD</span><strong>MODEL TO<br />SYSTEM</strong></div>
          </aside>
          <a className="hero-scroll-cue" href="#positioning"><span>SCROLL TO ENTER</span><ArrowDownRight size={18} /></a>
        </section>

        <section id="positioning" className="manifesto reveal" aria-labelledby="manifesto-heading">
          <p className="section-index">00 / POSITIONING</p>
          <div>
            <h2 id="manifesto-heading">不是只做模型。<br />我在做能被使用的系統。</h2>
            <p>從 ICU 決策支援、VAP 與 EIT 研究，到 FPGA 邊緣推論、半導體良率分析、企業 ERP 與金融科技原型，我用跨領域的方式處理資料、演算法、硬體限制與真實工作流程。</p>
          </div>
          <div className="manifesto-tags" aria-label="核心領域">
            <span>01 BIO-AI</span>
            <span>02 EDGE SYSTEMS</span>
            <span>03 INTELLIGENT WORKFLOWS</span>
          </div>
        </section>

        <section
          id="story"
          className={`story-section${hasLocalCharacterBackdrop("flow", localCharacterPreview) ? " has-local-character-backdrop" : ""}`}
          aria-labelledby="story-heading"
        >
          <LocalCharacterBackdrop placement="flow" preview={localCharacterPreview} />
          <div className="story-intro reveal">
            <p className="section-index">01 / SYSTEM NARRATIVE</p>
            <h2 id="story-heading">從現場訊號，<br />到可交接的系統。</h2>
          </div>
          <div className="story-rail">
            {storyBeats.map((beat) => (
              <article className="story-beat reveal" key={beat.index}>
                <div className="story-number">{beat.index}</div>
                <div>
                  <p>{beat.eyebrow}</p>
                  <h3>{beat.title}</h3>
                  <span>{beat.copy}</span>
                </div>
              </article>
            ))}
          </div>
          <ScrollingSubtitle />
        </section>

        <section id="featured" className="featured-section" aria-labelledby="featured-heading">
          <div className="section-heading reveal">
              <p className="section-index">02 / SIX FLAGSHIP CASE STUDIES</p>
            <div>
                <h2 id="featured-heading">六件旗艦案例</h2>
                <p>從可公開描述的核心系統開始。每一件都可開啟完整 Case Study，並保留各自的研究、合作與驗證邊界。</p>
            </div>
              <p className="section-side-note">06 FILES<br />OPEN THE CASE</p>
          </div>

          <div className="featured-selector reveal" role="group" aria-label="代表成果選擇">
            {flagshipProjects.map((project, index) => (
              <m.button
                className={index === activeFeatured ? "featured-tab is-active" : "featured-tab"}
                key={project.id}
                type="button"
                aria-pressed={index === activeFeatured}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveFeatured(index);
                }}
              >
                <span>{project.sequence}</span>
                <span>{project.title}</span>
              </m.button>
            ))}
          </div>
          <AnimatePresence initial={false} mode="wait">
            <FeaturedStage key={activeProject.id} localCharacterPreview={localCharacterPreview} project={activeProject} />
          </AnimatePresence>
          <CaseStudyMediaGateway localCharacterPreview={localCharacterPreview} project={activeProject} />
          <div className="featured-current-work reveal">
            <SystemMap />
          </div>
        </section>

        <ProjectArchive
          filter={archiveFilter}
          localCharacterPreview={localCharacterPreview}
          onFilterChange={setArchiveFilter}
        />

        <section id="profile" className="profile-section" aria-labelledby="profile-heading">
          <div className="section-heading reveal">
            <p className="section-index">04 / PROFILE & FIELD NOTES</p>
            <div>
              <h2 id="profile-heading">經歷不是清單，<br />是能力如何長出來。</h2>
              <p>用研究、競賽、產學合作與課程實作交叉累積，持續練習從資料問題走到系統設計。</p>
            </div>
            <p className="section-side-note">EE / AI<br />SYSTEMS</p>
          </div>

          <div className="profile-grid">
            <article className="profile-statement reveal">
              <span className="profile-icon"><GraduationCap size={26} /></span>
              <p className="section-index">EDUCATION</p>
              <h3>元智大學<br />電機工程</h3>
              <p>主軸是生醫 AI、邊緣運算、智慧工作流與跨域系統整合。</p>
            </article>
            <div className="achievement-strip reveal" aria-label="成果統計">
              {achievements.map((achievement) => (
                <div key={achievement.label}>
                  <strong>{achievement.value}</strong>
                  <span>{achievement.label}</span>
                </div>
              ))}
            </div>
          </div>

          <ol className="trajectory-list">
            {fieldNotes.map((note) => {
              const NoteIcon = note.icon;
              return (
                <li className="reveal" key={note.title}>
                  <time>{note.period}</time>
                  <div><strong>{note.title}</strong><p>{note.copy}</p></div>
                  <NoteIcon size={23} />
                </li>
              );
            })}
          </ol>
        </section>

        <section id="recognition" className="recognition-section" aria-labelledby="recognition-heading">
          <div className="section-heading reveal">
            <p className="section-index">05 / RECOGNITION LOG</p>
            <div>
              <h2 id="recognition-heading">認可與節點</h2>
              <p>把成果放在可追溯的時間軸上。獎項、摘要接受、入圍與審查中各自保留原本的意義。</p>
            </div>
            <p className="section-side-note">AWARD / ACCEPTED<br />FINALIST</p>
          </div>
          <div className="recognition-list">
            {recognitionNotes.map((note) => (
              <article className="recognition-row reveal" key={`${note.title}-${note.status}`}>
                <span className="recognition-year">{note.year}</span>
                <div><Award size={21} /><strong>{note.title}</strong></div>
                <StatusPill tone={note.tone}>{note.status}</StatusPill>
              </article>
            ))}
          </div>
        </section>

        <section id="capabilities" className="capabilities-section" aria-labelledby="capabilities-heading">
          <div className="section-heading reveal">
            <p className="section-index">06 / CAPABILITY MODULES</p>
            <div>
              <h2 id="capabilities-heading">能力模組</h2>
              <p>不是把工具堆在一起，而是理解每一個模組在系統裡需要承擔的角色。</p>
            </div>
            <p className="section-side-note">BUILD WITH<br />CONTEXT</p>
          </div>
          <div className="capability-grid">
            {capabilityModules.map((module) => {
              const ModuleIcon = module.icon;
              return (
                <article className="capability reveal" key={module.number}>
                  <div className="capability-top"><span>{module.number}</span><ModuleIcon size={26} /></div>
                  <h3>{module.title}</h3>
                  <p>{module.copy}</p>
                  <ul>{module.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                </article>
              );
            })}
          </div>
        </section>

        <section id="contact" className="contact-section reveal" aria-labelledby="contact-heading">
          <div className="contact-grid">
            <div>
              <p className="section-index">07 / CONTACT & COLLABORATION</p>
              <h2 id="contact-heading">從公開案例，<br />開始一段合作對話。</h2>
              <p>研究交流、系統原型、跨域競賽與產品實驗，都可以先從問題邊界、可公開資料與預期交付開始定義。</p>
              <div className="contact-actions">
                <a className="contact-action" href="https://github.com/Daniel-Tsai-9487" rel="noopener noreferrer" target="_blank">前往 GitHub <ArrowUpRight size={21} /></a>
                <a className="contact-secondary" href={profilePath()}>查看公開專業概要 <ArrowUpRight size={19} /></a>
              </div>
            </div>
            <aside className="contact-readiness" aria-label="公開個人頁面">
              <span>PUBLIC CONTACT ROUTES</span>
              <h3>公開入口</h3>
              <p>以下連結均由本人提供。研究、合作與未公開專案仍以各案例的公開範圍為準。</p>
              <nav className="contact-socials" aria-label="公開個人頁面">
                <ul className="contact-social-list">
                  <li>
                    <a className="contact-social-link" href={profilePath()} aria-label="查看公開專業概要">
                      <BookOpen size={20} aria-hidden="true" />
                      <span className="contact-social-meta"><span>PUBLIC PROFILE</span><span>專業概要與旗艦案例</span></span>
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a className="contact-social-link" href="https://github.com/Daniel-Tsai-9487" aria-label="在新分頁開啟 GitHub 個人頁面" rel="noopener noreferrer" target="_blank">
                      <Github size={20} aria-hidden="true" />
                      <span className="contact-social-meta"><span>GITHUB</span><span>Daniel-Tsai-9487</span></span>
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a className="contact-social-link" href="https://www.facebook.com/daniel.tsai.628090/" aria-label="在新分頁開啟 Facebook 個人頁面" rel="noopener noreferrer" target="_blank">
                      <Facebook size={20} aria-hidden="true" />
                      <span className="contact-social-meta"><span>FACEBOOK</span><span>daniel.tsai.628090</span></span>
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a className="contact-social-link" href="https://www.instagram.com/daniel_tsai_0.0/" aria-label="在新分頁開啟 Instagram 個人頁面" rel="noopener noreferrer" target="_blank">
                      <Instagram size={20} aria-hidden="true" />
                      <span className="contact-social-meta"><span>INSTAGRAM</span><span>daniel_tsai_0.0</span></span>
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </a>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>蔡旻佑 / PERSONAL SYSTEMS PORTFOLIO</p>
        <p>BUILD WITH CONTEXT. STATE WITH CARE.</p>
      </footer>
            </m.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>
  );
}

export default App;
