export const flagshipProjectIds = [
  "vap-early-warning",
  "swallow-eit",
  "biopulse-soc",
  "yieldsentry",
  "erp-ai-quote",
  "tradepilot",
] as const;

export type FlagshipProjectId = (typeof flagshipProjectIds)[number];

export type CaseStudyStep = {
  label: string;
  detail: string;
};

export type CaseStudyChapter = {
  index: string;
  eyebrow: string;
  title: string;
  copy: string;
};

export type CaseStudyMilestone = {
  stage: string;
  title: string;
  copy: string;
};

export type CaseStudyOutcome = {
  label: string;
  value: string;
  copy: string;
};

export type CaseStudyMediaKind = "signal" | "workflow" | "record";

export type CaseStudyMediaStatus =
  | "PUBLIC SYNTHETIC DEMO"
  | "PUBLIC ENGINEERING VISUAL"
  | "PUBLIC RESEARCH PROTOTYPE"
  | "PUBLIC SYNTHESIS"
  | "RECORD ONLY";

type CaseStudyMediaBase = {
  id: string;
  label: string;
  title: string;
  caption: string;
  kind: CaseStudyMediaKind;
};

type CaseStudyMediaWithSource = CaseStudyMediaBase & {
  status: "PUBLIC SYNTHETIC DEMO" | "PUBLIC ENGINEERING VISUAL" | "PUBLIC RESEARCH PROTOTYPE";
  src: string;
  alt: string;
  provenance: string;
};

type CaseStudyMediaWithoutSource = CaseStudyMediaBase & {
  status: "PUBLIC SYNTHESIS" | "RECORD ONLY";
  src?: never;
  alt?: never;
  provenance?: never;
};

export type CaseStudyMedia = CaseStudyMediaWithSource | CaseStudyMediaWithoutSource;

export function hasPublicMediaAsset(media: CaseStudyMedia): media is CaseStudyMediaWithSource {
  return media.src !== undefined;
}

export type CaseStudyEvidence = {
  label: string;
  value: string;
  detail: string;
  source: string;
};

export type CaseStudyLink = {
  label: string;
  title: string;
  detail: string;
  availability: "PUBLIC" | "RESTRICTED";
  href?: string;
};

export type CaseStudyPublicScope = {
  summary: string;
  exclusions: string[];
};

export type CaseStudy = {
  projectId: FlagshipProjectId;
  label: string;
  headline: string;
  lead: string;
  focus: string;
  contribution: string[];
  system: CaseStudyStep[];
  chapters: CaseStudyChapter[];
  milestones: CaseStudyMilestone[];
  outcomes: CaseStudyOutcome[];
  media: CaseStudyMedia[];
  evidence: CaseStudyEvidence[];
  links: CaseStudyLink[];
  publicScope: CaseStudyPublicScope;
};

export const caseStudies: Record<FlagshipProjectId, CaseStudy> = {
  "vap-early-warning": {
    projectId: "vap-early-warning",
    label: "FLAGSHIP RESEARCH CASE",
    headline: "把風險訊號留在研究流程裡，\n而不是過早推向臨床承諾。",
    lead: "VAP 的早期徵象分散在連續生命徵象與呼吸器參數中。這個研究把問題收斂為時間序列風險觀察，並將患者層級評估、機率校準與可解釋性放進同一個研究設計。",
    focus: "研究型早期預警 / 可解釋機器學習 / 狀態校準",
    contribution: ["資料處理與候選模型比較", "患者層級評估、校準與解釋", "第一作者與摘要、海報資料整理"],
    system: [
      { label: "RESEARCH DATA", detail: "受控資料在研究環境內處理；公開頁面只保留研究主題與狀態。" },
      { label: "TIME SERIES", detail: "以多個預警時間窗整理連續訊號，讓模型問題對齊臨床觀察時間。" },
      { label: "PATIENT-LEVEL EVAL", detail: "以患者為單位處理評估與切分，避免重疊視窗造成樂觀偏誤。" },
      { label: "CALIBRATE + EXPLAIN", detail: "把機率校準與特徵解釋納入比較，而非只留下單一分數。" },
      { label: "CONFERENCE RECORD", detail: "將可公開的研究摘要與會議狀態整理為可被追溯的成果記錄。" },
    ],
    chapters: [
      {
        index: "01",
        eyebrow: "FRAME THE QUESTION",
        title: "先處理評估單位，再談模型表現。",
        copy: "研究沒有把每一段時間視窗當成彼此獨立的樣本。先回到患者與時間的關係，才能討論預警模型是否真的在看未來風險，而不是記住已經見過的個案模式。",
      },
      {
        index: "02",
        eyebrow: "MAKE THE OUTPUT LEGIBLE",
        title: "分數不是風險語言的終點。",
        copy: "模型比較之外，同步處理機率校準與 SHAP 解釋，目標是讓研究輸出可被檢視、可被質疑，也清楚知道哪些訊號與推論有關。",
      },
      {
        index: "03",
        eyebrow: "KEEP THE BOUNDARY",
        title: "研究成果不等於臨床工具。",
        copy: "案例頁呈現的是研究設計、本人工作與會議進度；它不將回溯性研究包裝成診斷系統，也不把受控資料帶到公開網站。",
      },
    ],
    milestones: [
      { stage: "RESEARCH DESIGN", title: "定義時間序列風險問題", copy: "把連續生理訊號、預警時間窗與患者層級評估放進同一套研究框架。" },
      { stage: "METHOD WORK", title: "比較、校準與解釋", copy: "負責資料處理、候選模型比較、特徵篩選、SHAP 與機率校準等工作。" },
      { stage: "CONFERENCE", title: "ICBEI 2026 摘要接受", copy: "摘要已接受；正式發表與後續公開範圍仍以會議流程與權限為準。" },
    ],
    outcomes: [
      { label: "CONFERENCE", value: "ICBEI 2026", copy: "摘要接受，保留研究正在發表流程中的正確狀態。" },
      { label: "METHOD", value: "PATIENT-LEVEL", copy: "將患者層級切分、校準與解釋納入研究比較，而非只展示單一模型分數。" },
      { label: "ROLE", value: "FIRST AUTHOR", copy: "負責資料處理、模型比較與結果整理，並參與摘要及投稿資料撰寫。" },
    ],
    media: [
      { id: "risk-window", label: "01 / RESEARCH FRAME", title: "Time-window research map", caption: "以公開研究原型說明時間窗、患者層級與研究流程的關係；所有欄位與狀態均為方法敘事，不載入受控資料或個案畫面。", kind: "signal", status: "PUBLIC RESEARCH PROTOTYPE", src: "/case-media/vap-early-warning-prototype-dashboard.png", alt: "VAP 早期預警研究的公開方法原型，顯示研究問題、時間窗、患者層級評估與公開邊界。", provenance: "為公開作品集製作的原創研究視覺。所有流程、欄位與狀態均為方法敘事；不含受控資料、個案、效能數字、研究圖表、臨床建議或第三方資料。" },
      { id: "evaluation", label: "02 / EVALUATION", title: "Patient-level guardrail", caption: "把資料切分、校準與解釋放進同一個公開方法框架，讓模型比較的限制可被讀到。", kind: "workflow", status: "PUBLIC SYNTHESIS" },
      { id: "conference-record", label: "03 / RECORD", title: "Conference status record", caption: "保留 ICBEI 2026 摘要接受與待發表的狀態，不以未公開圖表替代正式研究材料。", kind: "record", status: "RECORD ONLY" },
    ],
    evidence: [
      { label: "CONFERENCE", value: "ABSTRACT ACCEPTED", detail: "ICBEI 2026 摘要接受；正式發表與公開範圍仍依會議流程處理。", source: "CONFERENCE RECORD / RESTRICTED" },
      { label: "MANUSCRIPT", value: "WA2611", detail: "稿號 WA2611 已完成註冊，主辦方安排現場海報發表。", source: "REGISTRATION RECORD / RESTRICTED" },
      { label: "ROLE", value: "FIRST AUTHOR", detail: "負責資料處理、候選模型比較與結果、摘要資料整理。", source: "CONFERENCE AUTHOR RECORD / RESTRICTED" },
    ],
    links: [
      { label: "CONFERENCE SITE", title: "ICBEI 2026", detail: "主辦方公開會議頁；不等於個別稿件的發表完成、期刊接受或公開授權。", availability: "PUBLIC", href: "https://imeti.org/ICBEI2026/" },
      { label: "RESEARCH MATERIAL", title: "研究素材受限", detail: "院內資料、個案圖表與研究附件不列為公開連結。", availability: "RESTRICTED" },
      { label: "CONFERENCE RECORD", title: "公開狀態待會議流程", detail: "目前只保留摘要接受與待發表的公開敘事。", availability: "RESTRICTED" },
    ],
    publicScope: {
      summary: "公開頁呈現研究設計、方法與會議狀態，不把受控研究素材帶到網站。",
      exclusions: [
        "不公開院內資料、個案圖表、原始特徵或可識別的研究材料。",
        "不宣稱外部、多中心、前瞻性或臨床驗證已完成。",
        "不把研究型風險觀察呈現成可直接使用的醫療診斷或決策工具。",
      ],
    },
  },
  "swallow-eit": {
    projectId: "swallow-eit",
    label: "FLAGSHIP CONCEPT CASE",
    headline: "先用合成資料校正回饋語言，\n再談感測是否值得被實作。",
    lead: "嚥域探索居家吞嚥復健中，如何將頸部 EIT 的空間回饋整理成治療師可判讀的資訊。現階段以合成資料互動展示檢驗使用情境與資訊層次，而非宣稱量測、人體或臨床效果。",
    focus: "吞嚥復健情境 / EIT 概念設計 / 合成資料互動展示",
    contribution: ["隊長與問題定義", "回饋流程與互動展示規劃", "公開邊界與競賽表述整合"],
    system: [
      { label: "BASELINE", detail: "以吞嚥前的參考狀態建立回饋情境，而不是只把一次訊號當成結論。" },
      { label: "EVENT CONTEXT", detail: "把吞嚥事件、可能的多模態輔助訊號與使用時機寫成可討論的流程。" },
      { label: "SYNTHETIC EIT FLOW", detail: "以合成資料呈現未來可能的區域回饋方式，不把它稱作真實量測結果。" },
      { label: "AREA FEEDBACK", detail: "將資訊整理為區域與側別的可讀回饋，避免直接輸出治療處方。" },
      { label: "THERAPIST REVIEW", detail: "讓治療師保有解讀與策略決定權，使用者端不承擔臨床判斷。" },
    ],
    chapters: [
      {
        index: "01",
        eyebrow: "LOCATE THE GAP",
        title: "創新不是把 EIT 放到頸部而已。",
        copy: "概念從既有感測與居家復健方法出發，將焦點移到回饋內容：若資訊無法對應到使用者需要理解的區域與情境，再多一個感測器也不會形成更好的復健體驗。",
      },
      {
        index: "02",
        eyebrow: "PROTOTYPE THE CONVERSATION",
        title: "用合成資料先測試資訊該怎麼被看見。",
        copy: "目前的互動展示是情境原型，不是假裝成儀器資料。它把吞嚥前後、區域回饋與治療師判讀拆開，讓未來硬體、重建與人體研究有明確的接續位置。",
      },
      {
        index: "03",
        eyebrow: "PRESERVE CLINICAL AGENCY",
        title: "系統回報狀態，不替人開處方。",
        copy: "案例刻意不將特定回饋連到特定治療手法。完整病因、病史與治療策略仍必須由具備臨床責任的專業人員判斷。",
      },
    ],
    milestones: [
      { stage: "CONCEPT", title: "從感測技術回到回饋內容", copy: "以居家復健中可理解、可遠距討論的資訊層次為概念中心。" },
      { stage: "INTERACTION", title: "建立合成資料展示", copy: "先用合成情境驗證畫面與流程，而不把原型假裝為真實儀器輸出。" },
      { stage: "COMPETITION", title: "進入全國醫學工程創意競賽決賽", copy: "保留決賽狀態，不提前宣稱後續結果或人體研究進度。" },
    ],
    outcomes: [
      { label: "STATUS", value: "FINALIST", copy: "第十屆全國醫學工程創意競賽入圍決賽。" },
      { label: "PROTOTYPE", value: "SYNTHETIC DEMO", copy: "用合成資料將資訊回饋流程具體化，作為後續技術驗證前的使用情境材料。" },
      { label: "ROLE", value: "TEAM LEAD", copy: "主導問題框架、系統敘事與公開表述，並與兩人團隊協作推進。" },
    ],
    media: [
      { id: "synthetic-flow", label: "01 / SYNTHETIC FLOW", title: "Synthetic EIT interaction", caption: "以合成資料展示未來可能的區域回饋流程，讓技術假設與使用情境可以先被討論。", kind: "workflow", status: "PUBLIC SYNTHETIC DEMO", src: "/case-media/swallow-eit-synthetic-prototype.png", alt: "嚥域專案的合成 EIT 居家吞嚥回饋原型畫面。", provenance: "為公開作品集擷取的原創合成情境展示；不公開競賽交付檔，且沒有人體資料、硬體量測、臨床輸出或治療建議。" },
      { id: "rehab-context", label: "02 / CONTEXT", title: "Rehabilitation feedback frame", caption: "以居家吞嚥復健的回饋節點組成公開情境視圖，不將其表示為臨床或人體資料。", kind: "signal", status: "PUBLIC SYNTHESIS" },
      { id: "finalist-record", label: "03 / RECORD", title: "Finalist status record", caption: "保留競賽入圍決賽的事實狀態，不放入尚未取得公開授權的競賽素材。", kind: "record", status: "RECORD ONLY" },
    ],
    evidence: [
      { label: "COMPETITION", value: "FINALIST", detail: "第十屆全國醫學工程創意競賽大專組入圍決賽。", source: "OFFICIAL FINALIST NOTICE" },
      { label: "TEAM", value: "2 MEMBERS", detail: "兩人團隊；本人擔任隊長，主導問題框架、回饋流程與公開敘事。", source: "COMPETITION TEAM RECORD" },
      { label: "PROTOTYPE", value: "SYNTHETIC DEMO", detail: "以合成資料檢視資訊層次與互動情境，不主張真實量測結果。", source: "PUBLIC SYNTHESIS" },
    ],
    links: [
      { label: "OFFICIAL EVENT", title: "第十屆全國醫學工程創意競賽", detail: "臺北醫學大學生物醫學工程學系公開競賽頁；不含未取得授權的決賽交付素材。", availability: "PUBLIC", href: "https://sbme.tmu.edu.tw/front/Events1/competition/2026sbme/pages.php?ID=77346b1d82056289f7496abbfe13dd63281f2ad3c3fb62468fd4fe50355dbf62" },
      { label: "COMPETITION MATERIAL", title: "決賽素材尚未公開", detail: "簡報、競賽附件與後續成果只會在取得授權後新增。", availability: "RESTRICTED" },
      { label: "DEMO ACCESS", title: "情境原型記錄", detail: "目前網站僅呈現合成資料與方法敘事，不提供醫療或硬體 demo 連結。", availability: "RESTRICTED" },
    ],
    publicScope: {
      summary: "公開頁只保留合成情境、設計方法與競賽狀態，避免讓概念原型被誤解為醫療成果。",
      exclusions: [
        "尚未完成硬體、人體、臨床或真實量測驗證。",
        "合成資料只用於互動與情境展示，不能被解讀為醫療資料或效能結果。",
        "不列任何教師為指導，也不把治療師判讀替換為自動處方。",
      ],
    },
  },
  "biopulse-soc": {
    projectId: "biopulse-soc",
    label: "FLAGSHIP EDGE CASE",
    headline: "在模型與板卡之間，\n守住一條可交接的資料路徑。",
    lead: "BioPulse-SoC 將量化後的 VAP 研究候選整合到 PYNQ-Z1 邊緣推論展示。案例關心的不只是把模型轉成 IP，而是如何讓資料介面、批次補齊、AXI DMA 與板端記錄彼此對得起來。",
    focus: "量化模型 / hls4ml / PYNQ-Z1 / 板端推論展示",
    contribution: ["AXI DMA 與資料批次補齊", "板端驗證紀錄與展示流程", "模型到系統的交接設計"],
    system: [
      { label: "STRICT TASK", detail: "先從明確的研究任務與資料切分出發，避免用硬體展示掩蓋資料邊界。" },
      { label: "QUANTIZED STUDENT", detail: "將可部署候選收斂為小型量化模型，處理輸入與參數規模的取捨。" },
      { label: "HLS IP", detail: "以 hls4ml 將量化流程轉成 HLS IP，保留轉換與資源取捨的脈絡。" },
      { label: "AXI DMA + PS", detail: "把主機端資料封包、DMA 傳輸與 Zynq PS 控制連成可重現的流程。" },
      { label: "PYNQ-Z1 RECORD", detail: "以板端展示與驗證紀錄確認模型輸出能在目標裝置鏈路中被讀取。" },
    ],
    chapters: [
      {
        index: "01",
        eyebrow: "CHOOSE THE CONSTRAINT",
        title: "先接受裝置限制，才有真正的 Edge AI。",
        copy: "案例從模型最大化轉向系統可交接性。輸入縮減、量化與 HLS 轉換不是附屬工作，而是讓研究模型進入裝置環境前必須被重新理解的一段工程。",
      },
      {
        index: "02",
        eyebrow: "MAKE THE BRIDGE EXPLICIT",
        title: "資料搬運是推論系統的一部分。",
        copy: "AXI DMA、實體封包與批次補齊被當成核心設計記錄，而不是藏在 Demo 背後。這讓軟體端與板端的輸入輸出關係可以被重看與交接。",
      },
      {
        index: "03",
        eyebrow: "STATE WHAT WAS BUILT",
        title: "板端原型有完成邊界。",
        copy: "這是一個可重現的硬體化研究展示，不是臨床裝置。案例保留團隊分工與功耗、部署、臨床驗證尚未完成的部分，避免把工程展示膨脹成產品宣稱。",
      },
    ],
    milestones: [
      { stage: "MODEL HANDOFF", title: "收斂可部署的量化候選", copy: "把研究任務、模型縮減與轉換流程整理成可進入 HLS 的系統路徑。" },
      { stage: "BOARD INTEGRATION", title: "串接 PYNQ-Z1 與 AXI DMA", copy: "處理 DMA、批次補齊與板端輸入輸出，使展示鏈路可被重複執行。" },
      { stage: "COMPETITION RECORD", title: "競賽展示與成果紀錄", copy: "保留 AMD Track 入圍決賽與 A3D3 Track 優選獎的狀態，不擴寫成產品部署。" },
    ],
    outcomes: [
      { label: "AWARD", value: "A3D3 TRACK", copy: "獲優選獎，成果聚焦於 hls4ml 轉換、整合與板端展示。" },
      { label: "SHOWCASE", value: "AMD FINALIST", copy: "AMD Track 入圍決賽；以實機 FPGA 展示作為競賽主線。" },
      { label: "SYSTEM", value: "PYNQ-Z1", copy: "建立量化模型、HLS IP、AXI DMA 與目標板卡之間的可追蹤交接流程。" },
    ],
    media: [
      { id: "edge-handoff", label: "01 / HANDOFF", title: "Model-to-board handoff", caption: "以公開工程視覺呈現量化模型、HLS IP 與目標板卡之間的交接，不呈現私有工程檔。", kind: "workflow", status: "PUBLIC ENGINEERING VISUAL", src: "/case-media/biopulse-public-engineering-demo.png", alt: "BioPulse-SoC 的公開工程視覺，顯示量化模型、HLS IP、AXI DMA 與 PYNQ-Z1 的交接流程。", provenance: "為公開作品集製作的原創工程版面；不含團隊 HLS、RTL、bitstream、板卡遙測或效能量測。" },
      { id: "dma-path", label: "02 / DATA PATH", title: "AXI DMA transfer path", caption: "聚焦本人負責的 DMA、批次補齊與驗證紀錄，讓資料搬運成為可讀的系統層。", kind: "signal", status: "PUBLIC SYNTHESIS" },
      { id: "competition-record", label: "03 / RECORD", title: "FPGA competition record", caption: "保留 AMD Track 決賽入圍與 A3D3 Track 優選獎的公開狀態，未加入團隊工程資產。", kind: "record", status: "RECORD ONLY" },
    ],
    evidence: [
      { label: "AWARD", value: "A3D3 TRACK", detail: "FPGA 智慧運算與終端節點創意應用競賽 A3D3 Track 優選獎。", source: "AWARD RECORD / RESTRICTED" },
      { label: "SHOWCASE", value: "AMD FINALIST", detail: "AMD Track 入圍決賽，展示量化模型與板端推論鏈路。", source: "OFFICIAL FINALIST RECORD" },
      { label: "TEAM", value: "2 MEMBERS", detail: "兩人團隊；本案例只列本人負責的 DMA、批次補齊與板端驗證紀錄。", source: "TEAM CONTRIBUTION RECORD" },
    ],
    links: [
      { label: "TECHNICAL MATERIAL", title: "工程資產受限", detail: "HLS、RTL、bitstream、工程設定與團隊檔案不列為公開下載。", availability: "RESTRICTED" },
      { label: "SHOWCASE RECORD", title: "公開成果待授權素材", detail: "可公開展示紀錄會在確認團隊與主辦授權後加入。", availability: "RESTRICTED" },
    ],
    publicScope: {
      summary: "公開頁聚焦模型到板卡的系統交接與本人負責範圍，不公開團隊工程資產或擴張硬體展示的結論。",
      exclusions: [
        "不宣稱臨床可用性、醫療效能或任何已完成的臨床部署。",
        "不把所有 HLS、RTL 或硬體工作歸為個人完成；案例只列本人負責的 DMA、批次與驗證工作。",
        "不把工具估計、壓力測試或展示鏈路改寫為未經界定的產品級效能宣稱。",
      ],
    },
  },
  yieldsentry: {
    projectId: "yieldsentry",
    label: "FLAGSHIP AGENT CASE",
    headline: "不是讓 Agent 自由決策，\n而是讓每次輸出留下可追蹤的理由。",
    lead: "YieldSentry 是面向半導體良率分析情境的離線 AI Agent 原型。它把缺陷、製程、報告與知識庫任務拆開，同時用 schema、拒判、追蹤與人工閘門限制系統能說什麼、不能說什麼。",
    focus: "半導體良率工作流 / 受治理 AI Agent / 8D 報告 / 可觀測性",
    contribution: ["題目、系統、Demo 與答辯主導", "任務線與 guardrail 設計", "Trace、知識庫與報告流程整合"],
    system: [
      { label: "TASK REQUEST", detail: "從明確任務與意圖白名單開始，讓請求先被分類而非直接交給語言模型。" },
      { label: "SPECIALIZED WORKERS", detail: "將晶圓圖、測試誘發缺陷、感測異常與報告生成拆成各自的任務線。" },
      { label: "SCHEMA + GATE", detail: "用結構化輸出、信心門檻與拒判邏輯限制不確定情況下的系統行為。" },
      { label: "TRACE + LEDGER", detail: "留下 JSONL trace 與 token 帳本，讓輸出不是一段無法回看的文字。" },
      { label: "HUMAN REVIEW", detail: "將結論、8D 報告與後續處置保留給人工審查，不讓原型取得產線放行權。" },
    ],
    chapters: [
      {
        index: "01",
        eyebrow: "MAKE THE WORKFLOW VISIBLE",
        title: "良率問題不是一個聊天框就能處理。",
        copy: "系統先把不同來源、不同責任的問題拆成四條任務線，再用 Orchestrator 讓工具、資料摘要與 worker 各自留在可辨識的位置。",
      },
      {
        index: "02",
        eyebrow: "TREAT ABSTENTION AS A FEATURE",
        title: "不知道時，系統要能拒絕。",
        copy: "信心門檻、open-set 拒判與人工審查不是展示時的例外畫面，而是案例的核心。對高風險製程決策而言，沒有根據的自信比拒答更危險。",
      },
      {
        index: "03",
        eyebrow: "KEEP THE TRACE",
        title: "報告必須能回到它的來源。",
        copy: "從工具結果、知識庫到 8D 敘事，YieldSentry 將可觀測性設成系統功能。這讓展示不只回答 Agent 能做什麼，也回答它如何留下被檢查的紀錄。",
      },
    ],
    milestones: [
      { stage: "SYSTEM DESIGN", title: "定義四條任務線與治理元件", copy: "將任務路由、記憶、工具權限、guardrail、trace 與評測設為明確元件。" },
      { stage: "DEMO BUILD", title: "完成離線 Agent 與 Dashboard 原型", copy: "整合資料摘要、工具、報告與單頁展示，並保留人工控制點。" },
      { stage: "COMPETITION", title: "欣銓 AI Agent 競賽佳作", copy: "以單人競賽作品完成系統、Demo 與答辯主導，成果已結案。" },
    ],
    outcomes: [
      { label: "AWARD", value: "HONORABLE MENTION", copy: "欣銓半導體書院 AI Agent 實作競賽佳作。" },
      { label: "WORKFLOW", value: "4 TASK LINES", copy: "將晶圓圖、測試、感測異常與報告任務分流，避免單一 Agent 承擔所有判斷。" },
      { label: "GOVERNANCE", value: "TRACEABLE", copy: "以 schema、trace、token ledger、拒判與人工閘門塑造可被稽核的輸出流程。" },
    ],
    media: [
      { id: "task-map", label: "01 / ORCHESTRATION", title: "Four-task-line map", caption: "以公開工程視覺整理晶圓圖、測試、感測與報告的分工，不載入產線或合作資料。", kind: "workflow", status: "PUBLIC ENGINEERING VISUAL", src: "/case-media/yieldsentry-public-engineering-visual.png", alt: "YieldSentry 的公開工程視覺，顯示四條任務線、trace 紀錄與人工審核閘門。", provenance: "為公開作品集製作的原創工程版面；所有資料與狀態皆為合成示例，不含產線、STDF、prober、retest 或合作方資料。" },
      { id: "trace-guardrail", label: "02 / GOVERNANCE", title: "Trace and abstention frame", caption: "將 schema、拒判、trace 與人工閘門編成可閱讀的治理圖層，讓原型的限制可以被看見。", kind: "signal", status: "PUBLIC SYNTHESIS" },
      { id: "competition-record", label: "03 / RECORD", title: "Competition record", caption: "保留競賽佳作與系統展示的可公開事實，不上傳私有原始碼或競賽資料包。", kind: "record", status: "RECORD ONLY" },
    ],
    evidence: [
      { label: "AWARD", value: "HONORABLE MENTION", detail: "元智大學欣銓半導體書院 AI Agent 實作競賽佳作。", source: "COMPETITION CLOSEOUT RECORD" },
      { label: "WORKFLOW", value: "4 TASK LINES", detail: "晶圓圖缺陷、測試誘發缺陷、製程感測異常與 8D 報告／知識庫任務分流。", source: "SYSTEM DESIGN RECORD" },
      { label: "TRACE", value: "4-STEP TRACE", detail: "每次處理保留 route、dispatch、tool、validate 四步 trace，並把不確定結果交由人工審查。", source: "TRACE CONTRACT / RESTRICTED" },
    ],
    links: [
      { label: "GITHUB PROFILE", title: "Daniel-Tsai-9487 / GitHub", detail: "公開個人程式作品入口；不代表本案例的私有 repository 已開放。", availability: "PUBLIC", href: "https://github.com/Daniel-Tsai-9487" },
      { label: "SOURCE ACCESS", title: "案例原始碼仍為私有", detail: "不公開產線資料、原始碼、機密設定或競賽提交包。", availability: "RESTRICTED" },
    ],
    publicScope: {
      summary: "公開頁只說明離線 Agent 的架構、治理邏輯與競賽成果，不接觸產線資料或放行決策。",
      exclusions: [
        "公開資料與合成驗證不等於產線可用性、實際良率回收或 production disposition。",
        "不公開產線、STDF、prober、retest 或合作方的原始資料與 ground truth。",
        "原型沒有產線放行權；不確定結果需拒判或交由人工審查。",
      ],
    },
  },
  "erp-ai-quote": {
    projectId: "erp-ai-quote",
    label: "FLAGSHIP PRODUCT CASE",
    headline: "文件不是資料庫，\n報價也不該靠手動記憶完成。",
    lead: "ERP AI 智慧報價系統將企業文件解析、需求條款抽取、語意媒合與報價流程串成一條可追蹤的產品原型。它從既有系統限制出發，將人員檢查留在關鍵節點，而不是把企業文件直接交給黑盒子。",
    focus: "企業文件解析 / URS / 條款媒合 / 報價工作流",
    contribution: ["URS、抽取、媒合與報價核心", "文件到結構化資料的流程設計", "人機核對節點與展示整合"],
    system: [
      { label: "SOURCE DOCUMENT", detail: "以 URS、型錄與既有文件為起點；原始內容留在受控企業脈絡，不在公開網站揭露。" },
      { label: "CLASSIFY + EXTRACT", detail: "把文件類型、文字與表格內容整理為可被後續流程使用的結構化欄位。" },
      { label: "TERMINOLOGY", detail: "以術語、需求條款與設備脈絡處理單純 OCR 無法解決的語意差異。" },
      { label: "MATCH + QUOTE", detail: "將需求與產品、規格或報價策略放進同一份可追蹤的工作流。" },
      { label: "HUMAN CHECK", detail: "讓人員在關鍵資料與報價決策前確認，而非讓原型自動承諾價格或交期。" },
    ],
    chapters: [
      {
        index: "01",
        eyebrow: "START WITH THE DOCUMENT",
        title: "先理解文件要讓誰做出什麼決定。",
        copy: "企業需求文件不只是一段可被 OCR 的文字，還帶著條款、術語、規格與後續責任。案例從 URS 與既有流程出發，先把文件理解的目的寫清楚。",
      },
      {
        index: "02",
        eyebrow: "BUILD THE HANDOFF",
        title: "抽取後，資料必須能走到報價。",
        copy: "系統把文件分類、結構化抽取、術語處理、需求媒合與報價流程分層，讓每一次轉換都有可理解的輸入與輸出，而不是只輸出一份看似完整的答案。",
      },
      {
        index: "03",
        eyebrow: "RESPECT THE BUSINESS CONTEXT",
        title: "原型不能越過企業責任。",
        copy: "客戶文件、牌價、庫存與正式 ERP 狀態都不屬於公開作品素材。案例展示的是方法與本人核心工作，不將團隊合作包裝成個人獨作或正式上線系統。",
      },
    ],
    milestones: [
      { stage: "DISCOVERY", title: "整理 URS 與文件工作流", copy: "以企業既有文件與報價情境定義抽取、術語與人工核對需求。" },
      { stage: "PROTOTYPE", title: "串接抽取、媒合與報價核心", copy: "建立文件到結構化資料、需求對照與可追蹤報價流程的原型。" },
      { stage: "SHOWCASE", title: "AI UNIVERSITY 產學實習成果發表", copy: "四人第二組獲銅獎；案例保留團隊共同完成的正確範圍。" },
    ],
    outcomes: [
      { label: "RECOGNITION", value: "BRONZE AWARD", copy: "AI UNIVERSITY 產學實習成果發表銅獎。" },
      { label: "FLOW", value: "DOCUMENT TO QUOTE", copy: "將企業文件、需求媒合與報價流程組成可追蹤的系統骨架。" },
      { label: "ROLE", value: "CORE WORKFLOW", copy: "負責 URS、抽取、媒合與報價核心，並與四人團隊共同完成展示。" },
    ],
    media: [
      { id: "quote-handoff", label: "01 / HANDOFF", title: "Quote review handoff", caption: "以虛構報價流程展示術語處理、需求媒合與人工核對，不使用真實牌價、ERP 畫面或客戶文件。", kind: "signal", status: "PUBLIC SYNTHETIC DEMO", src: "/case-media/erp-ai-quote-public-demo.png", alt: "ERP AI 智慧報價系統的公開合成展示，顯示文件到報價的人工審核流程與虛構報價工作區。", provenance: "為公開作品集製作的虛構報價示例；公司、產品、文件、客戶、條款、牌價與 ERP 狀態均非真實資料。" },
      { id: "document-intake", label: "02 / INTAKE", title: "Document-to-structure frame", caption: "以原生流程圖呈現文件分類與結構化抽取，避免公開企業文件、URS 原文或客戶內容。", kind: "workflow", status: "PUBLIC SYNTHESIS" },
      { id: "internship-record", label: "03 / RECORD", title: "Internship showcase record", caption: "保留 AI UNIVERSITY 產學實習成果發表銅獎的公開成果，不呈現合作方系統或資料。", kind: "record", status: "RECORD ONLY" },
    ],
    evidence: [
      { label: "RECOGNITION", value: "BRONZE AWARD", detail: "AI UNIVERSITY 產學實習成果發表銅獎。", source: "AWARD RECORD / RESTRICTED" },
      { label: "TEAM", value: "4 MEMBERS", detail: "四人團隊完成成果展示；本人負責 URS、抽取、媒合與報價核心。", source: "SHOWCASE TEAM RECORD" },
      { label: "FLOW", value: "DOCUMENT TO QUOTE", detail: "將文件理解、需求媒合與報價流程組成可追蹤的產品骨架。", source: "PUBLIC-SAFE PROCESS SYNTHESIS" },
    ],
    links: [
      { label: "CASE MATERIAL", title: "企業素材受限", detail: "客戶文件、URS、牌價、庫存與正式 ERP 內容不對外公開。", availability: "RESTRICTED" },
      { label: "SHOWCASE RECORD", title: "成果佐證不含企業資料", detail: "公開頁只保留成果發表與方法層級的說明。", availability: "RESTRICTED" },
    ],
    publicScope: {
      summary: "公開頁以文件到報價的方法與本人工作為核心，不公開企業、客戶或正式系統資訊。",
      exclusions: [
        "不公開客戶文件、URS 原文、牌價、庫存、帳號或正式 ERP 狀態。",
        "不宣稱正式上線、客戶採用、實際報價效益或個人獨立完成。",
        "任何自動抽取結果都需要在企業流程中由人員核對，不能直接形成對外承諾。",
      ],
    },
  },
  tradepilot: {
    projectId: "tradepilot",
    label: "FLAGSHIP FINTECH CASE",
    headline: "先把風險教育做成產品，\n再拒絕把模型寫成明牌。",
    lead: "TradePilot 是依競賽規格完成的自主金融科技系統原型，將市場資料、歷史回放、模擬撮合與爆倉風險教育整合在同一個工具中。它的產品定位是研究與風險教育，不提供真實下單、個別化買賣建議或獲利承諾。",
    focus: "金融資料工程 / 模擬交易 / 風險教育 / FastAPI 產品整合",
    contribution: ["需求與整合主導", "資料、模型驗證與產品定位", "台股與台指期模擬、風控與介面規劃"],
    system: [
      { label: "MARKET CONTEXT", detail: "聚合盤後與延遲市場資料，並保留資料日期、來源與使用範圍。" },
      { label: "HISTORICAL REPLAY", detail: "以歷史條件掃描與回放建立模擬情境，避免將回測視為即時交易指令。" },
      { label: "SIMULATION", detail: "將成本、保證金、逐日結算、追繳與強制平倉放進模擬撮合流程。" },
      { label: "RISK ESTIMATE", detail: "用波動率與壓力情境輔助理解風險，將弱方向訊號保留為研究資訊。" },
      { label: "EDUCATION", detail: "以風險提示、術語與下單前檢查回到新手教育，而不是提供個別投資建議。" },
    ],
    chapters: [
      {
        index: "01",
        eyebrow: "DESIGN FOR CONSEQUENCES",
        title: "投資系統的第一個產品功能是風險語言。",
        copy: "案例從散戶如何理解槓桿、保證金與極端情境開始，而不是先做買賣預測。市場羅盤、模擬交易與風險防護被設計成相互對照的教育工具。",
      },
      {
        index: "02",
        eyebrow: "PROTECT THE REPLAY",
        title: "歷史回放不能偷看未來。",
        copy: "資料管線、樣本外評估與歷史模擬被放進同一個工程脈絡。模型分數只對指定歷史任務負責，不能跳過資料日期與情境限制變成未來績效承諾。",
      },
      {
        index: "03",
        eyebrow: "KEEP IT A TOOL",
        title: "不下單，是產品邊界的一部分。",
        copy: "TradePilot 不連接券商、不代操，也不提供付費推薦。系統在可用性與法遵定位之間，選擇讓使用者理解風險而不是把決策外包給模型。",
      },
    ],
    milestones: [
      { stage: "PRODUCT SCOPE", title: "收斂六個產品模組", copy: "以市場羅盤、關注清單、選股雷達、模擬沙盒、風險防護與新手學院形成產品骨架。" },
      { stage: "SYSTEM BUILD", title: "建立資料、模擬與風控鏈路", copy: "整合資料管線、歷史回放、風險模型、FastAPI 與響應式產品介面。" },
      { stage: "STATUS", title: "完成自主原型，未完成投稿", copy: "原以 2026 台北金融科技獎規格開發，但未在截止前完成投稿。" },
    ],
    outcomes: [
      { label: "PRODUCT", value: "6 MODULES", copy: "將市場情境、模擬交易、風控與金融教育整合為一個研究型產品原型。" },
      { label: "ROLE", value: "INTEGRATION LEAD", copy: "主導需求、資料取得、模型驗證與產品整合；程式開發採協作方式完成。" },
      { label: "POSITION", value: "RISK EDUCATION", copy: "以模擬、延遲資料與風險提示為核心，不將弱方向訊號包裝成投資明牌。" },
    ],
    media: [
      { id: "simulation-flow", label: "01 / SIMULATION", title: "Risk simulation flow", caption: "以延遲、合成的情境回放與風險提示展示產品流程，不把回測當作獲利承諾。", kind: "workflow", status: "PUBLIC SYNTHETIC DEMO", src: "/case-media/tradepilot-public-sandbox-demo.png", alt: "TradePilot 的公開合成沙盒畫面，顯示延遲資料、情境回放與非投資建議的風險教育狀態。", provenance: "為公開作品集製作的合成金融研究沙盒；沒有真實帳戶、券商連線、交易、即時市場資料、投資建議或報酬承諾。" },
      { id: "market-frame", label: "02 / MARKET CONTEXT", title: "Market education frame", caption: "以產品原生視覺說明市場資料、情境回放與風險教育的關係，不展示受授權限制的資料來源。", kind: "signal", status: "PUBLIC SYNTHESIS" },
      { id: "prototype-record", label: "03 / RECORD", title: "Independent prototype record", caption: "保留以競賽規格自主開發、但未完成投稿的事實狀態。", kind: "record", status: "RECORD ONLY" },
    ],
    evidence: [
      { label: "PRODUCT", value: "6 MODULES", detail: "將市場情境、模擬交易、風控與金融教育整合為研究型產品原型。", source: "LOCAL PRODUCT BASELINE / RESTRICTED" },
      { label: "AUTOMATION", value: "94 TESTS", detail: "自主原型保留 94 項自動化測試；這是工程覆蓋記錄，不是投資績效或模型報酬。", source: "TEST BASELINE / RESTRICTED" },
      { label: "BASELINE", value: "160 TRACKED FILES", detail: "整合基準記錄 160 個受版控檔案與 141,309 行插入；它是專案規模快照，不代表產品效果。", source: "VERSION-CONTROL BASELINE / RESTRICTED" },
    ],
    links: [
      { label: "GITHUB PROFILE", title: "Daniel-Tsai-9487 / GitHub", detail: "公開個人程式作品入口；不代表受限資料、金流設定或私有 repository 已公開。", availability: "PUBLIC", href: "https://github.com/Daniel-Tsai-9487" },
      { label: "PRODUCT ACCESS", title: "公開 demo 待授權整理", detail: "目前不公開原始金融資料、資料庫、環境設定或真實交易功能。", availability: "RESTRICTED" },
    ],
    publicScope: {
      summary: "公開頁呈現研究與風險教育的產品架構，不提供真實下單、金融資料匯出或投資建議。",
      exclusions: [
        "不是 2026 台北金融科技獎的成功投稿、入圍、決賽或獲獎紀錄。",
        "不連接真實券商下單，不提供保證獲利、代操或個別化買賣建議。",
        "TEJ、原始金融資料、資料庫與環境設定不會被公開嵌入網站。",
      ],
    },
  },
};

export function getCaseStudy(projectId: string): CaseStudy | undefined {
  return caseStudies[projectId as FlagshipProjectId];
}
