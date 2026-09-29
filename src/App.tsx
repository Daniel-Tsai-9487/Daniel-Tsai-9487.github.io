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
  featuredProjects,
  laneLabels,
  portfolioProjects,
  storyBeats,
  type PortfolioProject,
  type ProjectLane,
  type StatusTone,
} from "./data/portfolio";
import { getCaseStudy, hasPublicMediaAsset, type CaseStudy } from "./data/caseStudies";
import { projectPath, siteConfig } from "./site";

type ArchiveFilter = ProjectLane | "all";

type StatusPillProps = {
  tone: StatusTone;
  children: ReactNode;
};

const archiveFilters: ArchiveFilter[] = ["all", "featured", "research", "proposal", "academic", "tool", "creative"];
const orderedPortfolioProjects = [...portfolioProjects].sort(
  (left, right) => Number.parseInt(left.sequence, 10) - Number.parseInt(right.sequence, 10),
);
const loadMotionFeatures = () => import("./motionFeatures").then((module) => module.default);

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

function useProjectRoute() {
  const readProjectRoute = () => parseProjectPath(window.location.pathname) ?? parseProjectHash(window.location.hash);
  const [projectId, setProjectId] = useState<string | null>(readProjectRoute);

  useEffect(() => {
    const syncProjectRoute = () => {
      const pathProjectId = parseProjectPath(window.location.pathname);
      if (pathProjectId) {
        setProjectId(pathProjectId);
        return;
      }

      const legacyProjectId = parseProjectHash(window.location.hash);
      if (legacyProjectId) {
        window.history.replaceState(null, "", projectPath(legacyProjectId));
        setProjectId(legacyProjectId);
        return;
      }

      setProjectId(null);
    };

    syncProjectRoute();
    window.addEventListener("popstate", syncProjectRoute);
    window.addEventListener("hashchange", syncProjectRoute);
    return () => {
      window.removeEventListener("popstate", syncProjectRoute);
      window.removeEventListener("hashchange", syncProjectRoute);
    };
  }, []);

  return projectId;
}

function useInitialSectionHash(projectRouteId: string | null) {
  const hasAppliedInitialHash = useRef(false);

  useEffect(() => {
    if (hasAppliedInitialHash.current) return;

    const targetId = window.location.hash.slice(1);
    if (!targetId || targetId.startsWith("project/")) {
      hasAppliedInitialHash.current = true;
      return;
    }

    const target = document.getElementById(targetId);
    if (!target) return;

    hasAppliedInitialHash.current = true;
    const frame = window.requestAnimationFrame(() => target.scrollIntoView({ behavior: "auto", block: "start" }));
    return () => window.cancelAnimationFrame(frame);
  }, [projectRouteId]);
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
    <section className="system-map" aria-labelledby="system-map-heading">
      <div className="system-map-header">
        <span><Radar size={18} aria-hidden="true" /> PUBLIC CASE TRACKS</span>
        <span>{String(currentThreads.length).padStart(2, "0")} CASES / 2026</span>
      </div>
      <div className="system-map-intro">
        <div>
          <p>目前可公開追蹤</p>
          <h2 id="system-map-heading">進行中的公開案例</h2>
        </div>
        <span>點選各案例，可查看公開素材、佐證與目前狀態。</span>
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
              <span className="thread-action">查看個案 <ArrowUpRight size={17} aria-hidden="true" /></span>
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

function FeaturedStage({ project }: { project: PortfolioProject }) {
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
        <span className="visual-number">{project.sequence}</span>
        <span className="visual-label">REPRESENTATIVE FILE</span>
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

function ProjectArchive({
  filter,
  onFilterChange,
}: {
  filter: ArchiveFilter;
  onFilterChange: (filter: ArchiveFilter) => void;
}) {
  const visibleProjects = useMemo(
    () => (filter === "all" ? portfolioProjects : portfolioProjects.filter((project) => project.lane === filter)),
    [filter],
  );

  return (
    <section id="archive" className="archive-section" aria-labelledby="archive-heading">
      <div className="section-heading reveal">
        <p className="section-index">03 / COMPLETE ARCHIVE</p>
        <div>
          <h2 id="archive-heading">作品檔案庫</h2>
          <p>把已完成的成果、研究型原型、計畫、課程實作與創作企畫放在同一份索引中，但不讓不同狀態混在一起。</p>
        </div>
        <p className="archive-count">{portfolioProjects.length.toString().padStart(2, "0")} FILES<br />STATUS-BOUND</p>
      </div>

      <div className="archive-filter-wrap reveal" aria-label="作品分類篩選">
        <div className="archive-filter-list" role="group" aria-label="作品分類">
          {archiveFilters.map((lane) => (
            <button
              className={lane === filter ? "archive-filter is-active" : "archive-filter"}
              key={lane}
              type="button"
              aria-pressed={lane === filter}
              onClick={() => onFilterChange(lane)}
            >
              {laneLabels[lane].label}
            </button>
          ))}
        </div>
        <p>{laneLabels[filter].eyebrow}</p>
      </div>

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

function CaseStudyFlow({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <section className="case-study-flow" aria-labelledby={`case-flow-${caseStudy.projectId}`}>
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

function CaseStudyMediaNavigator({ caseStudy }: { caseStudy: CaseStudy }) {
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
      <section id={`media-${caseStudy.projectId}`} className="case-study-media" aria-labelledby={`case-media-${caseStudy.projectId}`}>
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

function CaseStudyEvidenceIndex({ caseStudy }: { caseStudy: CaseStudy }) {
  if (!caseStudy.evidence.length && !caseStudy.links.length) return null;

  return (
    <section className="case-study-evidence" aria-labelledby={`case-evidence-${caseStudy.projectId}`}>
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

function FlagshipCaseStudy({ caseStudy, project }: { caseStudy: CaseStudy; project: PortfolioProject }) {
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

      <CaseStudyMediaNavigator caseStudy={caseStudy} />

      <CaseStudyFlow caseStudy={caseStudy} />

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

      <CaseStudyEvidenceIndex caseStudy={caseStudy} />

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
}: {
  project: PortfolioProject;
  projectIndex: number;
  previousProject?: PortfolioProject;
  nextProject?: PortfolioProject;
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

        {caseStudy && <FlagshipCaseStudy caseStudy={caseStudy} project={project} />}

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

function App() {
  const [activeFeatured, setActiveFeatured] = useState(0);
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const projectRouteId = useProjectRoute();
  useInitialSectionHash(projectRouteId);
  const previousProjectRouteRef = useRef<string | null>(projectRouteId);
  const pendingSectionIdRef = useRef<string | null>(null);
  const scrollProgress = useScrollProgress();
  useRevealOnScroll(projectRouteId);
  const routedProject = useMemo(
    () => orderedPortfolioProjects.find((project) => project.id === projectRouteId),
    [projectRouteId],
  );
  const activeProject = featuredProjects[activeFeatured] ?? featuredProjects[0];
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

    document.title = siteConfig.siteName;
    const targetId = window.location.hash.slice(1);
    if (wasOnProjectPage && targetId && !targetId.startsWith("project/")) {
      pendingSectionIdRef.current = targetId;
    }
    previousProjectRouteRef.current = null;
  }, [routedProject]);

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
            />
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
          <a href="#featured" onClick={closeMenu}>代表成果</a>
          <a href="#archive" onClick={closeMenu}>作品檔案</a>
          <a href="#profile" onClick={closeMenu}>經歷與能力</a>
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
          <div className="hero-copy entry-reveal">
            <p className="eyebrow"><span className="signal-dot" /> PERSONAL SYSTEMS PORTFOLIO / 2026</p>
            <h1 id="hero-heading">蔡旻佑</h1>
            <p className="hero-english">MIN-YU TSAI</p>
            <p className="hero-lead">在生醫 AI、邊緣運算與產品系統之間，把複雜問題轉成可以討論、驗證與交接的設計。</p>
            <div className="hero-actions">
              <a className="primary-action" href="#featured">從代表成果開始 <ArrowDownRight size={19} /></a>
              <a className="secondary-action" href="#archive">查看完整檔案 <ArrowDownRight size={19} /></a>
            </div>
          </div>

          <div className="hero-system entry-reveal">
            <SystemMap />
          </div>

          <aside className="hero-meta entry-reveal" aria-label="個人資料摘要">
            <div><span>BASE</span><strong>元智大學<br />電機工程</strong></div>
            <div><span>FOCUS</span><strong>AI / EDGE<br />BIOMEDICAL</strong></div>
            <div><span>METHOD</span><strong>MODEL TO<br />SYSTEM</strong></div>
          </aside>
          <img
            alt=""
            aria-hidden="true"
            className="hero-companion"
            decoding="async"
            draggable={false}
            fetchPriority="high"
            height={960}
            src="/characters/field-companion-user-provided.png"
            width={768}
          />
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

        <section id="story" className="story-section" aria-labelledby="story-heading">
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
            <p className="section-index">02 / REPRESENTATIVE WORK</p>
            <div>
              <h2 id="featured-heading">代表成果</h2>
              <p>先從能公開描述的核心系統開始。細節仍維持它們各自的研究、合作與驗證邊界。</p>
            </div>
            <p className="section-side-note">SELECT ONE<br />OPEN THE CASE</p>
          </div>

          <div className="featured-selector reveal" role="group" aria-label="代表成果選擇">
            {featuredProjects.map((project, index) => (
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
            <FeaturedStage key={activeProject.id} project={activeProject} />
          </AnimatePresence>
        </section>

        <ProjectArchive
          filter={archiveFilter}
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
              <p className="section-index">07 / NEXT TRANSMISSION</p>
              <h2 id="contact-heading">下一個系統，<br />可以從一個問題開始。</h2>
              <p>研究合作、系統原型、跨域競賽與產品實驗，都可以先從問題邊界、可公開資料與預期交付開始定義。</p>
              <div className="contact-actions">
                <a className="contact-action" href="#archive">從作品檔案開始 <ArrowUpRight size={21} /></a>
                <a className="contact-secondary" href="#top">回到訊號起點 <ArrowUpRight size={19} /></a>
              </div>
            </div>
            <aside className="contact-readiness" aria-label="公開個人頁面">
              <span>PUBLIC PROFILES</span>
              <h3>公開個人頁面</h3>
              <p>以下連結均由本人提供。研究、合作與未公開專案仍以各案例的公開範圍為準。</p>
              <nav className="contact-socials" aria-label="公開個人頁面">
                <ul className="contact-social-list">
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
