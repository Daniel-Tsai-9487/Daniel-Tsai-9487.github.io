import { type FlagshipProjectId } from "./caseStudies";

export type EnglishCaseSummary = {
  title: string;
  category: string;
  role: string;
  summary: string;
  outcome: string;
};

export const englishCaseSummaries: Record<FlagshipProjectId, EnglishCaseSummary> = {
  "vap-early-warning": {
    title: "VAP Early Warning Research",
    category: "BIOMEDICAL ML / RESEARCH",
    role: "First author: data preparation, model comparison, calibration, and research materials",
    summary: "A time-series research workflow for ventilator-associated pneumonia early-warning signals, designed around patient-level evaluation, probability calibration, and interpretable outputs.",
    outcome: "ICBEI 2026 abstract accepted. The public case intentionally excludes controlled clinical data and diagnostic claims.",
  },
  "swallow-eit": {
    title: "Swallowing EIT Concept",
    category: "BIOMEDICAL UX / CONCEPT PROTOTYPE",
    role: "Team lead: problem framing, interaction flow, and public-facing system narrative",
    summary: "A synthetic interaction prototype that frames how electrical impedance tomography could support swallowing-rehabilitation feedback without representing human measurements or clinical advice.",
    outcome: "Finalist in the 10th National Biomedical Engineering Creative Competition. The public demo uses synthetic scenarios only.",
  },
  "biopulse-soc": {
    title: "BioPulse-SoC",
    category: "FPGA / EDGE AI",
    role: "AXI DMA integration, batch alignment, and on-board verification records within a two-person team",
    summary: "An edge-inference handoff that connects a quantized VAP early-warning candidate, HLS IP, AXI DMA, and a PYNQ-Z1 demonstration environment.",
    outcome: "AMD Track finalist and A3D3 Track honorable recognition. The public case describes the handoff, not clinical performance or team-private engineering assets.",
  },
  yieldsentry: {
    title: "YieldSentry",
    category: "SEMICONDUCTOR / AGENT SYSTEM",
    role: "Competition topic, system, demo, and defense lead",
    summary: "A governed semiconductor-yield analysis agent that separates wafer-map, test-induced defect, sensor anomaly, and 8D reporting tasks behind trace and human-review guardrails.",
    outcome: "Honorable mention in the YZU Win Semiconductors AI Agent Competition. Production data, source code, and release decisions remain restricted.",
  },
  "erp-ai-quote": {
    title: "ERP AI Quote Workflow",
    category: "ENTERPRISE AI / INTERNSHIP",
    role: "URS, document extraction, requirement matching, and quotation-workflow core within a four-person team",
    summary: "A document-to-quote workflow that turns unstructured enterprise requests into a traceable review process while retaining human confirmation before any outward commitment.",
    outcome: "Bronze award at the AI UNIVERSITY internship showcase. Customer documents, prices, and ERP environments are not public.",
  },
  tradepilot: {
    title: "TradePilot",
    category: "FINTECH / RISK EDUCATION",
    role: "Requirements and integration lead in a two-person team",
    summary: "An independent fintech prototype that brings delayed market context, historical simulation, and risk education into one research-oriented experience without live trading.",
    outcome: "Completed as an independent prototype rather than a submitted competition entry. It does not provide investment advice, brokerage access, or performance promises.",
  },
};
