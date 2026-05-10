import { useState, useMemo, useEffect, useRef } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const ROLE_LABELS = {
  foundational: { label: "Foundational", color: "#1a1814", text: "#f4f1eb", desc: "Bedrock — directly shapes research direction" },
  supportive:   { label: "Supportive",   color: "#4a7c59", text: "#f4f1eb", desc: "Corroborates and adds evidence weight" },
  background:   { label: "Background",   color: "#e0dbd0", text: "#6a6458", desc: "Context — peripheral but worth tracking" },
};

const SOURCE_TYPES = [
  "Official / Regulatory","Peer-Reviewed Journal","Peer-Reviewed / Working Paper",
  "Survey Research / Grey Lit","Think Tank / Grey Lit","Think Tank Report",
  "Think Tank / Policy Submission","Grey Literature / Policy Brief","Grey Literature / Policy Analysis",
  "Grey Lit / Legal Analysis","Grey Lit / Newsletter","Conference / Academic",
  "Press / News","Government Data","Government / Grey Lit","Clinical Study","Systematic Review","Reference",
];

const TYPE_COLORS = {
  "Official / Regulatory":"#A3C4E8","Peer-Reviewed Journal":"#A3E8B8",
  "Peer-Reviewed / Working Paper":"#A3E8B8","Survey Research / Grey Lit":"#D4A3E8",
  "Think Tank / Grey Lit":"#E8D5A3","Think Tank Report":"#E8D5A3",
  "Think Tank / Policy Submission":"#E8D5A3","Grey Literature / Policy Brief":"#E8C4A3",
  "Grey Literature / Policy Analysis":"#E8C4A3","Grey Lit / Legal Analysis":"#E8C4A3",
  "Grey Lit / Newsletter":"#E8E8A3","Conference / Academic":"#A3E8D4",
  "Press / News":"#E8A3A3","Government Data":"#A3C4E8","Government / Grey Lit":"#A3C4E8",
  "Clinical Study":"#c8f0d8","Systematic Review":"#a8e4c0","Reference":"#d0d0d0",
};

// ─── STREAMS ─────────────────────────────────────────────────────────────────

const STREAMS = [
  {
    id: "dma", label: "DMA Policy", code: "DMA", color: "#A3C4E8", dim: "#1e2d3a",
    scope: {
      statement: "Monitoring the Digital Markets Act's enforcement trajectory, global regulatory diffusion, and public/stakeholder attitudes across the EU, US, and key comparator jurisdictions.",
      inclusion: ["EC enforcement decisions and gatekeeper designations","Peer-reviewed competition law scholarship","Think tank and grey literature on DMA design and outcomes","Global DMA-inspired regulatory developments (UK DMCC, Japan, India, Korea)","Public opinion and consumer attitude research"],
      exclusion: ["General GDPR/DSA unless directly intersecting with DMA","Pre-2022 literature unless foundational","Industry lobbying materials without independent analysis"],
      searchTerms: "\"Digital Markets Act\" OR \"DMA\" AND (enforcement OR gatekeeper OR compliance OR \"ex ante\") AND (EU OR Europe OR global)",
      status: "Active",
      lastUpdated: "Apr 2026",
    },
    digest: {
      summary: "The DMA enforcement landscape is accelerating rapidly. Two themes dominate: first, the transatlantic tension between EC enforcement and US political pushback has sharpened significantly since Q1 2026, with the USTR formally designating DMA as an unfair trade barrier. Second, the global diffusion story is now well-evidenced — UK DMCC is live, Japan's smartphone act is signed, and India/Korea are in motion. The academic literature is catching up, with the first peer-reviewed assessments of Year 1 now available. Key gap: independent consumer welfare evidence remains thin — the ECIPE/Ipsos CEE survey is currently the best we have.",
      signals: [
        { tag: "#enforcement", note: "↑ surge — 5 sources updated in Apr 2026", hot: true },
        { tag: "#US-EU-relations", note: "↑ emerging — 3 sources flag transatlantic tension", hot: true },
        { tag: "#global-diffusion", note: "→ steady — consistent across 4 sources", hot: false },
        { tag: "#public-attitudes", note: "↓ thin — only 1 primary source, gap to fill", hot: false },
      ],
      generatedAt: "Apr 25 2026 · 09:14",
    },
  },
  {
    id: "labor", label: "Labor Markets", code: "LBR", color: "#E8D5A3", dim: "#3a3020",
    scope: {
      statement: "Tracking federal labor market indicators, regulatory shifts, and economic research relevant to workforce policy and DOL project work.",
      inclusion: ["BLS monthly releases (payroll, unemployment, JOLTS)","DOL regulatory and policy updates","Think tank research on wages, equity, and workforce development","Federal compliance and enforcement changes"],
      exclusion: ["State-level labor data unless comparative","International labor market data unless benchmarking","Pre-2020 data releases"],
      searchTerms: "\"labor market\" OR \"employment\" AND (federal OR DOL OR BLS) AND (policy OR regulation OR wages)",
      status: "Active",
      lastUpdated: "Apr 2026",
    },
    digest: {
      summary: "Labor market data through Q1 2026 is telling a consistent story: the soft landing narrative holds, but with increasing evidence of demand cooling. Payroll growth has decelerated over three consecutive months and JOLTS openings are trending down without a spike in separations. The DOL regulatory front is active — FLSA gig worker guidance and minimum wage indexing are both live issues with direct relevance to client project work. EPI's latest wage equity report is worth circulating.",
      signals: [
        { tag: "#jobs", note: "→ steady — monthly BLS releases tracking as expected", hot: false },
        { tag: "#federal-policy", note: "↑ active — FLSA guidance + wage indexing both in motion", hot: true },
        { tag: "#wages", note: "↑ watch — EPI April report flags indexing implications", hot: true },
        { tag: "#labor-demand", note: "↓ softening — JOLTS trend down 3 months consecutive", hot: false },
      ],
      generatedAt: "Apr 25 2026 · 09:14",
    },
  },
  {
    id: "pubmed", label: "SHEP Interventions", code: "PUB", color: "#a8e4c0", dim: "#1a3a28",
    scope: {
      statement: "PubMed scan of randomised controlled trials and systematic reviews of interventions targeting symptom information for SHEP (Symptom, Health Education & Prevention) toolkit development. US-based studies only. Publication cutoff: 2020.",
      inclusion: ["RCTs and systematic reviews only","US-based populations","Interventions targeting symptom recognition, health literacy, or prevention education","Published ≤2020","English language"],
      exclusion: ["Observational studies, qualitative research, case reports","Non-US populations","Studies focused on treatment outcomes rather than symptom/education interventions","Grey literature and non-peer-reviewed sources","Post-2020 publications"],
      searchTerms: "(\"symptom\" OR \"health education\" OR \"prevention\") AND (\"randomized controlled trial\" OR \"systematic review\") AND (\"intervention\") AND (\"United States\" OR \"US\") AND (\"2015\":\"2020\"[pdat])",
      status: "Active",
      lastUpdated: "Apr 2026",
    },
    digest: {
      summary: "The SHEP Toolkit scan (127 records screened, 27 flagged + 5 recommended additions) has produced a focused, toolkit-ready evidence base across four intervention types. The strongest signal is the convergence across Toolkits 1 and 3: teach-back and plain language are not competing interventions — they are complementary mechanisms addressing the same documented gap, where 81% of patients at discharge receive no red-flag symptom guidance (Kennel et al., 2023) and 81% of Epic discharge documents exceed the AMA's 6th-grade readability threshold (Davis et al., 2025). The equity evidence (Toolkit 4) is the most urgent gap: only 8% of NELP patients received discharge instructions in their preferred language (PMID 39980004), and the TIDE Pilot RCT (NCT05988229, completed June 2024) is the most directly relevant trial — results are pending peer-reviewed publication and should be tracked. Key structural note: HCAHPS Q20 only became a formal standalone measure January 1, 2025, so no peer-reviewed studies are yet explicitly tied to this composite. The evidence base is appropriately drawn from the broader discharge symptom education literature — standard practice for new HCAHPS composites.",
      signals: [
        { tag: "#teach-back", note: "↑ strong — 4 PubMed-flagged sources + 3 supplementary; Toolkit 1 anchor", hot: true },
        { tag: "#equity", note: "↑ urgent — NELP gap documented; TIDE RCT results pending", hot: true },
        { tag: "#plain-language", note: "↑ systemic — Epic readability failure = EHR-level intervention opportunity", hot: true },
        { tag: "#grey-lit-recommend-add", note: "→ 5 PubMed-indexed articles missed by search strings — recommend adding", hot: false },
      ],
      generatedAt: "Apr 27 2026 · 11:32",
    },
  },
];

// ─── SOURCES ─────────────────────────────────────────────────────────────────

const INITIAL_SOURCES = [
  // DMA
  { id:"d1",streamId:"dma",title:"EC Digital Markets Act — Official Portal",org:"European Commission",url:"https://digital-markets-act.ec.europa.eu/index_en",description:"Official EC portal for DMA implementation, gatekeeper designations, compliance reports, and enforcement actions. Primary source of record.",tags:["#regulation","#EU","#big-tech","#compliance","#official-source","#gatekeepers"],updates:[{date:"Mar 7 2026",note:"Six gatekeepers publish updated compliance reports and consumer profiling audits."},{date:"Apr 23 2025",note:"First non-compliance decisions: Apple fined €500M, Meta fined €200M."}],type:"Official / Regulatory",role:"foundational",cadence:"Ongoing"},
  { id:"d2",streamId:"dma",title:"EPRS — DMA Enforcement State of Play",org:"European Parliament (EPRS)",url:"https://epthinktank.eu/2025/04/24/digital-markets-act-enforcement-state-of-play/",description:"EPRS briefing on DMA enforcement as of April 2025. Covers non-compliance decisions and open questions on AI/cloud designation.",tags:["#regulation","#EU","#enforcement","#official-source","#parliament"],updates:[{date:"Apr 24 2025",note:"Apple €500M, Meta €200M confirmed. Alphabet preliminary findings issued Mar 19 2025."}],type:"Grey Literature / Policy Brief",role:"supportive",cadence:"Periodic"},
  { id:"d3",streamId:"dma",title:"German Marshall Fund — DMA & DSA Tracker",org:"German Marshall Fund",url:"https://www.gmfus.org/news/eus-digital-markets-act-and-digital-services-act",description:"Transatlantic policy analysis tracking DMA/DSA enforcement and US-EU tensions. Covers global DMA diffusion across Japan, Australia, Brazil, India, Nigeria.",tags:["#regulation","#EU","#US-EU-relations","#global-diffusion","#think-tank","#geopolitics"],updates:[{date:"Oct 29 2025",note:"US USTR identified DMA as unfair trade barrier in 2025 NTE Report. Transatlantic tech tensions intensifying."}],type:"Think Tank / Grey Lit",role:"foundational",cadence:"Ongoing"},
  { id:"d4",streamId:"dma",title:"TechPolicy.Press — DMA Enforcement Roundup",org:"Tech Policy Press",url:"https://www.techpolicy.press/what-europes-digital-markets-act-has-delivered-so-far-and-what-comes-next/",description:"Monthly DMA roundups + enforcement symposium outputs. Covers compliance challenges and malicious compliance.",tags:["#regulation","#EU","#enforcement","#compliance","#big-tech"],updates:[{date:"Dec 10 2025",note:"Symposium: regulatory dialogue is slow, malicious compliance is a real issue."},{date:"Feb 2025",note:"EP lawmakers urging Commission not to cave to US pressure."}],type:"Grey Literature / Policy Analysis",role:"supportive",cadence:"Monthly"},
  { id:"d5",streamId:"dma",title:"CSIS — Guarding the Gates: DMA and Ex Ante Regulation",org:"CSIS",url:"https://www.csis.org/blogs/charting-geoeconomics/guarding-gates-digital-markets-act-and-lessons-ex-ante-regulation",description:"CSIS geoeconomics analysis on DMA design philosophy, enforcement outcomes, and Draghi Report critique.",tags:["#regulation","#global-diffusion","#geopolitics","#US-EU-relations","#think-tank","#ex-ante"],updates:[{date:"Jan 5 2026",note:"Draghi Report: EU governed by 100 tech laws + 270 regulatory bodies. DMA prioritises constraining large firms over accelerating small ones."}],type:"Think Tank / Grey Lit",role:"supportive",cadence:"Periodic"},
  { id:"d6",streamId:"dma",title:"CNBC — Big Tech EU Fines Tracker",org:"CNBC",url:"https://www.cnbc.com/2026/04/10/google-meta-big-tech-6-billion-euros-eu-fine.html",description:"Running tracker of EU fines against Big Tech. Total exceeds €7B in 2 years.",tags:["#enforcement","#fines","#big-tech","#EU","#apple","#meta","#google"],updates:[{date:"Apr 10 2026",note:"Total EU Big Tech fines exceed €7B. Trump admin framing fines as targeting American companies."}],type:"Press / News",role:"background",cadence:"Ongoing"},
  { id:"d7",streamId:"dma",title:"Ingemarsson & Bichet — Survey on the DMA (Oxford Academic)",org:"Journal of European Competition Law & Practice",url:"https://academic.oup.com/jeclap/article-abstract/15/5/330/7732844",description:"Peer-reviewed survey (Vol 15, Issue 5, July 2024) from EC DG COMP authors. Reviews DMA's first year and global spillover effects.",tags:["#peer-reviewed","#academic","#EU","#competition-law","#global-diffusion"],updates:[{date:"Jul 2024",note:"DMA is 'spurring innovation beyond EU borders' — now informing remedies in competition proceedings globally."}],type:"Peer-Reviewed Journal",role:"foundational",cadence:"Periodic"},
  { id:"d8",streamId:"dma",title:"Andriychuk et al. — 2025 DMA Review Consultation (SSRN)",org:"Univ. of Exeter / Heinrich Heine Univ. Düsseldorf",url:"https://dx.doi.org/10.2139/ssrn.5528062",description:"Independent academic consultation response to EC's first DMA review (Sept 2025). Funded by DFG and AHRC.",tags:["#peer-reviewed","#academic","#EU","#DMA-review","#competition-law"],updates:[{date:"Sep 24 2025",note:"Multi-jurisdictional independent scholarly voice submitted to EC July 2025 consultation."}],type:"Peer-Reviewed / Working Paper",role:"foundational",cadence:"Periodic"},
  { id:"d9",streamId:"dma",title:"ECIPE — Consumer Response to the DMA",org:"ECIPE / Ipsos",url:"https://ecipe.org/publications/consumer-response-to-the-digital-markets-act/",description:"Survey of 3,500 consumers across 7 CEE countries (Oct 2025). Privacy paradox: 55% more concerned about privacy but DMA changes added friction.",tags:["#public-attitudes","#consumer-research","#CEE","#EU","#privacy","#survey"],updates:[{date:"Oct 21 2025",note:"Privacy paradox confirmed. Google's EU search adjustments raised search costs without boosting alternative discovery."}],type:"Survey Research / Grey Lit",role:"foundational",cadence:"Periodic"},
  { id:"d10",streamId:"dma",title:"Goodwin — Antitrust & Competition Tech Year in Review 2025",org:"Goodwin Law",url:"https://www.goodwinlaw.com/en/insights/publications/2026/02/insights-technology-antc-antitrust-competition-technology-yir-2025",description:"2025 year-in-review: EU DMA enforcement, UK DMCC Act, CMA's first SMS designations, US DOJ/FTC under Trump.",tags:["#competition-law","#UK","#EU","#US-antitrust","#global-diffusion","#CMA","#DMCC"],updates:[{date:"Feb 17 2026",note:"UK CMA issued first SMS designations Oct 2025: Google (search) + Google/Apple (mobile)."}],type:"Grey Lit / Legal Analysis",role:"supportive",cadence:"Annual"},
  { id:"d11",streamId:"dma",title:"A&O Shearman — Digital Antitrust Enforcement Global Report",org:"Allen & Overy Shearman",url:"https://www.aoshearman.com/en/insights/global-antitrust-enforcement-report/antitrust-authorities-intensify-digital-market-regulation-and-enforcement",description:"Global enforcement report tracking DMA, UK DMCC, Japan JFTC, Australia, India, Korea KFTC amendments.",tags:["#global-diffusion","#competition-law","#Japan","#UK","#Australia","#India","#Korea","#enforcement"],updates:[{date:"Oct 31 2025",note:"UK DMCC effective Jan 2025, Japan JFTC regime signed, Australia and India taking initial steps."}],type:"Grey Lit / Legal Analysis",role:"supportive",cadence:"Annual"},
  { id:"d12",streamId:"dma",title:"ITIF — Antitrust Undone",org:"ITIF",url:"https://itif.org/publications/2026/03/25/antitrust-undone-how-competition-enforcers-are-undermining-competition/",description:"March 2026 ITIF report arguing EU DMA reflects a structuralist 'big is bad' bias. Documents 60+ antitrust cases and $13.1B in fines.",tags:["#criticism","#US-perspective","#competition-law","#think-tank","#antitrust","#global-diffusion"],updates:[{date:"Mar 25 2026",note:"Strongest recent critique of Brussels Effect. DMA constrains innovation per ITIF."}],type:"Think Tank Report",role:"background",cadence:"Periodic"},

  // LABOR
  { id:"l1",streamId:"labor",title:"BLS Monthly Employment Situation",org:"Bureau of Labor Statistics",url:"https://www.bls.gov/news.release/empsit.toc.htm",description:"Primary federal source for nonfarm payroll, unemployment rate, and wage data. Released first Friday of each month.",tags:["#jobs","#federal-policy","#wages","#monthly-release","#BLS"],updates:[{date:"Apr 5 2026",note:"Payrolls +228k. Unemployment holds at 4.1%. Wage growth cooling MoM."},{date:"Mar 7 2026",note:"Payrolls +187k. Below consensus. Labor market softening signal."}],type:"Government Data",role:"foundational",cadence:"Monthly"},
  { id:"l2",streamId:"labor",title:"JOLTS — Job Openings & Labor Turnover",org:"Bureau of Labor Statistics",url:"https://www.bls.gov/jlt/",description:"Monthly BLS data on job openings, hires, and separations. Lagging indicator used to gauge labor market slack.",tags:["#jobs","#monthly-release","#labor-demand","#BLS"],updates:[{date:"Feb 2026",note:"Job openings fell to 8.7M. Quits rate stable. Soft landing narrative intact."}],type:"Government Data",role:"supportive",cadence:"Monthly"},
  { id:"l3",streamId:"labor",title:"DOL Policy & Regulations Hub",org:"Dept. of Labor",url:"https://www.dol.gov/general/topic/workhours",description:"Federal regulatory updates from DOL. Critical for federal labor compliance and workforce development project work.",tags:["#federal-policy","#regulation","#compliance","#jobs"],updates:[{date:"Mar 2026",note:"New FLSA guidance on gig worker classification published."}],type:"Government / Grey Lit",role:"foundational",cadence:"Ongoing"},
  { id:"l4",streamId:"labor",title:"Economic Policy Institute — Research Hub",org:"EPI",url:"https://www.epi.org/research/",description:"Left-leaning think tank producing high-quality labor research. Useful for counterpoint framing and wage equity data.",tags:["#wages","#equity","#think-tank","#federal-policy"],updates:[{date:"Apr 2026",note:"New report on minimum wage indexing. Relevant to DOL project scope."}],type:"Think Tank / Grey Lit",role:"supportive",cadence:"Ongoing"},

  // PUBMED / SHEP — Real sources from IP SHEP Toolkit Nominations document (127 screened, 27 flagged)
  // ── TOOLKIT 1: TEACH-BACK ──
  { id:"p1",streamId:"pubmed",title:"Evidence-Based QI Strategies to Reduce 30-Day Readmission in Heart Failure (PMID 40929703)",org:"Cardiology Reviews (2025)",url:"https://pubmed.ncbi.nlm.nih.gov/40929703/",description:"Narrative review identifying teach-back as a core evidence-based discharge education component for heart failure readmission reduction. Flagged via String 6 in formal PubMed search.",tags:["#teach-back","#heart-failure","#readmission","#discharge-education","#QI","#PubMed-flagged","#Toolkit-1"],updates:[{date:"Apr 2026",note:"Identifies teach-back as core evidence-based component. String 6 — directly supports Toolkit 1 rationale."}],type:"Peer-Reviewed Journal",role:"supportive",cadence:"Static (2025)"},
  { id:"p2",streamId:"pubmed",title:"Disentangling Organizational Levers in Transitional Care Programs (PMID 38195545)",org:"BMC Health Services Research (2024)",url:"https://pubmed.ncbi.nlm.nih.gov/38195545/",description:"Systematic review finding patient education is the most frequently investigated transitional care intervention type with high-strength evidence for readmission reduction. Flagged via String 2. Used across Toolkits 1 and 2.",tags:["#systematic-review","#transitional-care","#patient-education","#readmission","#PubMed-flagged","#Toolkit-1","#Toolkit-2"],updates:[{date:"Apr 2026",note:"Patient education = most investigated intervention type, high-strength evidence. Cross-toolkit evidence base for Toolkits 1 + 2."}],type:"Systematic Review",role:"foundational",cadence:"Static (2024)"},
  { id:"p3",streamId:"pubmed",title:"Caregiver Inclusion in IDEAL Discharge Teaching (PMID 35617533)",org:"Professional Case Management (2022)",url:"https://pubmed.ncbi.nlm.nih.gov/35617533/",description:"Study showing active caregiver inclusion in structured discharge teaching significantly improved home-based symptom monitoring readiness. Flagged via String 1. Also cited in Toolkit 4 equity evidence.",tags:["#caregivers","#discharge-education","#symptom-monitoring","#teach-back","#PubMed-flagged","#equity","#Toolkit-1","#Toolkit-4"],updates:[{date:"Apr 2026",note:"Caregiver inclusion in IDEAL discharge teaching significantly improves symptom monitoring readiness at home. Cited in both Toolkit 1 and Toolkit 4."}],type:"Clinical Study",role:"supportive",cadence:"Static (2022)"},
  { id:"p4",streamId:"pubmed",title:"Does Information Structuring Improve Recall of Discharge Information? Cluster RCT (PMID 34662341)",org:"PLOS ONE (2021)",url:"https://pubmed.ncbi.nlm.nih.gov/34662341/",description:"Cluster RCT finding that structuring discharge information significantly improved patient recall vs. unstructured delivery. Flagged via String 1. Key RCT evidence used across Toolkits 1 and 3.",tags:["#RCT","#discharge-education","#recall","#plain-language","#information-structuring","#PubMed-flagged","#Toolkit-1","#Toolkit-3"],updates:[{date:"Apr 2026",note:"Structuring discharge info significantly improves patient recall. Foundational RCT evidence for both Toolkit 1 (teach-back) and Toolkit 3 (plain language)."}],type:"Peer-Reviewed Journal",role:"foundational",cadence:"Static (2021)"},
  // ── TOOLKIT 2: SMART DISCHARGE ──
  { id:"p5",streamId:"pubmed",title:"Mapping the Discharge Process After Surgery (PMID 38381415)",org:"JAMA Surgery (2024)",url:"https://pubmed.ncbi.nlm.nih.gov/38381415/",description:"US academic medical center study mapping surgical discharge workflows. Identifies lack of structured discharge framework as primary driver of symptom education gaps. Flagged via String 1.",tags:["#discharge-process","#structured-framework","#symptom-education","#surgery","#US","#PubMed-flagged","#Toolkit-2"],updates:[{date:"Apr 2026",note:"Lack of structured framework = primary driver of symptom education gaps. Core problem statement for Toolkit 2 (SMART)."}],type:"Peer-Reviewed Journal",role:"foundational",cadence:"Static (2024)"},
  { id:"p6",streamId:"pubmed",title:"'Going Home Is Just a Feel-Good Idea With No Structure' — Patient Perspectives (PMID 33631330)",org:"Journal of Pain and Symptom Management (2021)",url:"https://pubmed.ncbi.nlm.nih.gov/33631330/",description:"Qualitative study in which patients and caregivers identified structured discharge frameworks as preferable to unstructured verbal instructions, particularly for symptom warning signs. Flagged via String 1.",tags:["#qualitative","#patient-perspectives","#structured-framework","#symptom-warning-signs","#PubMed-flagged","#Toolkit-2"],updates:[{date:"Apr 2026",note:"Patients explicitly prefer structured frameworks for symptom info. Strong patient-voice evidence for SMART Toolkit 2."}],type:"Peer-Reviewed Journal",role:"supportive",cadence:"Static (2021)"},
  { id:"p7",streamId:"pubmed",title:"Is Routine Discharge Enough? (PMID 39757413)",org:"American Journal of Hospice and Palliative Care (2026)",url:"https://pubmed.ncbi.nlm.nih.gov/39757413/",description:"Study examining adequacy of routine discharge education. Flagged via String 3. Supports the need for structured protocols like SMART beyond standard discharge practice.",tags:["#discharge-education","#structured-protocol","#palliative","#PubMed-flagged","#Toolkit-2"],updates:[{date:"Apr 2026",note:"Routine discharge insufficient for symptom education adequacy. Supports SMART intervention rationale. String 3."}],type:"Peer-Reviewed Journal",role:"supportive",cadence:"Static (2026)"},
  // ── TOOLKIT 3: PLAIN LANGUAGE ──
  { id:"p8",streamId:"pubmed",title:"Evaluating the Quality and Equity of Hospital Discharge Instructions (PMID 39980004)",org:"BMC Health Services Research (2025)",url:"https://pubmed.ncbi.nlm.nih.gov/39980004/",description:"US inpatient study (n=200) finding return precautions was the most poorly scored discharge quality domain. Only 8% of NELP patients received instructions in preferred language. Flagged via String 1. Central to Toolkits 3 and 4.",tags:["#discharge-instructions","#equity","#return-precautions","#NELP","#health-literacy","#PubMed-flagged","#US","#Toolkit-3","#Toolkit-4"],updates:[{date:"Apr 2026",note:"Return precautions = most poorly scored domain. Only 8% of NELP patients received preferred-language instructions. Critical for Toolkits 3 and 4."}],type:"Clinical Study",role:"foundational",cadence:"Static (2025)"},
  { id:"p9",streamId:"pubmed",title:"Influence of Written Medication Reminder on Older Adult Patient Experience (PMID 39112924)",org:"BMC Geriatrics (2024)",url:"https://pubmed.ncbi.nlm.nih.gov/39112924/",description:"Repeat cross-sectional study finding structured written reminders significantly improved older adult patient experience and understanding of post-discharge care. Flagged via String 1.",tags:["#written-instructions","#older-adults","#patient-experience","#structured-reminders","#PubMed-flagged","#Toolkit-3"],updates:[{date:"Apr 2026",note:"Structured written reminders improve older adult comprehension and patient experience. Supports plain language toolkit design for older populations."}],type:"Clinical Study",role:"supportive",cadence:"Static (2024)"},
  { id:"p10",streamId:"pubmed",title:"Patient Perspective of Same-Day Discharge Colectomy (PMID 35854124)",org:"Surgical Endoscopy (2023)",url:"https://pubmed.ncbi.nlm.nih.gov/35854124/",description:"Patient perspective study on same-day discharge experiences. Symptom information quality identified as key driver of patient confidence and safety at home. Flagged via String 1.",tags:["#patient-perspective","#same-day-discharge","#symptom-information","#surgery","#PubMed-flagged","#Toolkit-3"],updates:[{date:"Apr 2026",note:"Symptom information quality = key driver of patient confidence at home. Supports plain language content design rationale."}],type:"Clinical Study",role:"background",cadence:"Static (2023)"},
  // ── TOOLKIT 4: EQUITY-FOCUSED ──
  { id:"p11",streamId:"pubmed",title:"Disparity in Nurse Discharge Communication Based on English Proficiency (PMID 33531376)",org:"Hospital Pediatrics (2021)",url:"https://pubmed.ncbi.nlm.nih.gov/33531376/",description:"Study finding LEP families received measurably less thorough discharge education including symptom information than English-proficient families. Flagged via String 1.",tags:["#LEP","#health-equity","#discharge-communication","#language-access","#symptom-education","#PubMed-flagged","#Toolkit-4"],updates:[{date:"Apr 2026",note:"LEP families receive measurably less thorough symptom education. Core equity evidence for Toolkit 4."}],type:"Clinical Study",role:"foundational",cadence:"Static (2021)"},
  { id:"p12",streamId:"pubmed",title:"HEAR-VA Pilot: Hearing Assistance Intervention in the ED (PMID 33576037)",org:"Journal of the American Geriatrics Society (2021)",url:"https://pubmed.ncbi.nlm.nih.gov/33576037/",description:"Pilot RCT finding that addressing hearing impairment in older adults improved comprehension of discharge instructions including symptom content. Flagged via String 1. Supports accessibility accommodation component of Toolkit 4.",tags:["#RCT","#hearing-impairment","#older-adults","#discharge-comprehension","#accessibility","#PubMed-flagged","#Toolkit-4"],updates:[{date:"Apr 2026",note:"Addressing hearing impairment improves symptom comprehension at discharge. Supports COMPONENT D (accessibility) in Toolkit 4."}],type:"Clinical Study",role:"supportive",cadence:"Static (2021)"},
  { id:"p13",streamId:"pubmed",title:"Patient Educational Video for Maternal Mortality Warning Signs — RCT (PMID 37708502)",org:"Obstetrics & Gynecology (2023)",url:"https://pubmed.ncbi.nlm.nih.gov/37708502/",description:"RCT finding patient educational video significantly improved knowledge of maternal mortality warning signs vs. standard discharge education. Flagged via String 6. Supports video delivery component.",tags:["#RCT","#video-education","#warning-signs","#maternal-health","#symptom-knowledge","#PubMed-flagged","#Toolkit-4"],updates:[{date:"Apr 2026",note:"Video significantly improves warning sign knowledge vs. standard discharge. Strong RCT for COMPONENT C (video delivery) in Toolkit 4."}],type:"Peer-Reviewed Journal",role:"foundational",cadence:"Static (2023)"},
  { id:"p14",streamId:"pubmed",title:"Video Discharge Instructions for Pediatric Fever — Experimental Study (PMID 39531514)",org:"Emergency Department Study (2026)",url:"https://pubmed.ncbi.nlm.nih.gov/39531514/",description:"Experimental study finding video discharge instructions significantly improved caregiver warning sign knowledge vs. written instructions alone. Flagged via String 1.",tags:["#video-education","#pediatric","#caregivers","#warning-signs","#symptom-knowledge","#PubMed-flagged","#Toolkit-4"],updates:[{date:"Apr 2026",note:"Video outperforms written instructions alone for caregiver warning sign knowledge. Supports video delivery across equity toolkit."}],type:"Clinical Study",role:"supportive",cadence:"Static (2026)"},
  { id:"p15",streamId:"pubmed",title:"Rural Caregivers' Preparedness for Signs of Worsening Health Post-Discharge (PMID 38154900)",org:"BMJ Open (2023)",url:"https://pubmed.ncbi.nlm.nih.gov/38154900/",description:"Study finding significant unpreparedness among rural caregivers for detecting and responding to worsening health post-discharge. Adapted instruction formats identified as key gap. Flagged via String 1.",tags:["#rural","#caregivers","#symptom-recognition","#health-disparity","#adapted-formats","#PubMed-flagged","#Toolkit-4"],updates:[{date:"Apr 2026",note:"Rural caregivers significantly underprepared for symptom recognition. Adapted formats = identified gap. Supports rural equity framing in Toolkit 4."}],type:"Clinical Study",role:"supportive",cadence:"Static (2023)"},
  { id:"p16",streamId:"pubmed",title:"Family Caregivers' Perspectives on Transitional Care Interventions (PMID 36534678)",org:"PLOS ONE (2022)",url:"https://pubmed.ncbi.nlm.nih.gov/36534678/",description:"Study exploring caregiver perspectives on transitional care. Highlights gaps in symptom education continuity between hospital and home. Flagged via String 1.",tags:["#caregivers","#transitional-care","#symptom-education","#family","#PubMed-flagged","#Toolkit-4"],updates:[{date:"Apr 2026",note:"Caregiver perspectives confirm symptom education continuity gap between hospital and home."}],type:"Clinical Study",role:"background",cadence:"Static (2022)"},
  { id:"p17",streamId:"pubmed",title:"Symptom and Technology Management Intervention for Caregivers (PMID 38545957)",org:"Western Journal of Nursing Research (2024)",url:"https://pubmed.ncbi.nlm.nih.gov/38545957/",description:"Study of technology-assisted caregiver intervention for symptom management post-discharge. Supports technology delivery components in Toolkit 4. Flagged via String 1.",tags:["#caregivers","#technology","#symptom-management","#interventions","#PubMed-flagged","#Toolkit-4"],updates:[{date:"Apr 2026",note:"Technology-assisted caregiver interventions show promise for symptom management continuity. Supports video/digital delivery in Toolkit 4."}],type:"Clinical Study",role:"background",cadence:"Static (2024)"},
  // ── SUPPLEMENTARY / RECOMMEND ADD TO PUBMED ──
  { id:"p18",streamId:"pubmed",title:"Enhancing Patient Understanding Using Teach-Back — Barreto et al. (PMC12325820)",org:"Journal of General Internal Medicine (2025)",url:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12325820/",description:"US academic medical center QI study (n=120) using one-page written summary plus verbal teach-back. Significant improvements in patient understanding across all discharge domains. PubMed-indexed but not captured by original search strings — recommend adding.",tags:["#teach-back","#QI","#patient-understanding","#discharge-education","#US","#grey-lit-recommend-add","#Toolkit-1"],updates:[{date:"Apr 2026",note:"Written summary + teach-back improves understanding across all discharge domains. PMC12325820 — recommend adding to formal PubMed string."}],type:"Clinical Study",role:"supportive",cadence:"Static (2025)"},
  { id:"p19",streamId:"pubmed",title:"Language and Readability Barriers in Epic Discharge Instructions — Davis et al. (PMID 40158713)",org:"PMID 40158713 (2025)",url:"https://pubmed.ncbi.nlm.nih.gov/40158713/",description:"2025 analysis finding 81% of standard English Epic discharge documents exceeded the AMA's 6th-grade reading threshold. Epic instructions also infrequently available beyond English and Spanish. Recommend add to PubMed set.",tags:["#readability","#Epic","#EHR","#plain-language","#health-literacy","#grey-lit-recommend-add","#Toolkit-3"],updates:[{date:"Apr 2026",note:"81% of Epic discharge docs exceed 6th-grade AMA threshold. Systemic EHR-level intervention opportunity. Recommend add to PubMed set."}],type:"Grey Literature / Policy Brief",role:"foundational",cadence:"Static (2025)"},
  { id:"p20",streamId:"pubmed",title:"TIDE Pilot RCT — Tools to Improve Discharge Equity (NCT05988229)",org:"ClinicalTrials.gov (Completed June 2024)",url:"https://clinicaltrials.gov/study/NCT05988229",description:"Multilingual discharge toolkit RCT including pictographics illustrating return precautions and audio recording of nurse reviewing After Visit Summary in patient's preferred language. Most directly relevant US trial for HCAHPS Q20 equity. Results pending peer-reviewed publication.",tags:["#RCT","#multilingual","#equity","#pictographics","#return-precautions","#TIDE","#grey-literature","#US","#Toolkit-4"],updates:[{date:"Apr 2026",note:"Most directly relevant US trial for HCAHPS Q20 equity delivery. Completed June 2024 — results pending publication. Monitor for peer-reviewed output."}],type:"Grey Literature / Policy Brief",role:"foundational",cadence:"Static (2024)"},
];

// ─── URL PARSER ──────────────────────────────────────────────────────────────

function parseUrl(url) {
  try {
    const u = new URL(url.startsWith("http")?url:`https://${url}`);
    const host = u.hostname.replace("www.","");
    const map = {
      "bls.gov":{org:"Bureau of Labor Statistics",type:"Government Data"},
      "dol.gov":{org:"Dept. of Labor",type:"Government / Grey Lit"},
      "ec.europa.eu":{org:"European Commission",type:"Official / Regulatory"},
      "digital-markets-act.ec.europa.eu":{org:"European Commission",type:"Official / Regulatory"},
      "epthinktank.eu":{org:"European Parliament (EPRS)",type:"Grey Literature / Policy Brief"},
      "gmfus.org":{org:"German Marshall Fund",type:"Think Tank / Grey Lit"},
      "techpolicy.press":{org:"Tech Policy Press",type:"Grey Literature / Policy Analysis"},
      "csis.org":{org:"CSIS",type:"Think Tank / Grey Lit"},
      "cnbc.com":{org:"CNBC",type:"Press / News"},
      "reuters.com":{org:"Reuters",type:"Press / News"},
      "ft.com":{org:"Financial Times",type:"Press / News"},
      "academic.oup.com":{org:"Oxford Academic",type:"Peer-Reviewed Journal"},
      "ssrn.com":{org:"SSRN",type:"Peer-Reviewed / Working Paper"},
      "dx.doi.org":{org:"DOI / Academic",type:"Peer-Reviewed Journal"},
      "pubmed.ncbi.nlm.nih.gov":{org:"PubMed / NIH",type:"Peer-Reviewed Journal"},
      "ncbi.nlm.nih.gov":{org:"NIH / NCBI",type:"Peer-Reviewed Journal"},
      "ecipe.org":{org:"ECIPE",type:"Survey Research / Grey Lit"},
      "itif.org":{org:"ITIF",type:"Think Tank Report"},
      "goodwinlaw.com":{org:"Goodwin Law",type:"Grey Lit / Legal Analysis"},
      "aoshearman.com":{org:"Allen & Overy Shearman",type:"Grey Lit / Legal Analysis"},
      "brookings.edu":{org:"Brookings Institution",type:"Think Tank / Grey Lit"},
      "pewresearch.org":{org:"Pew Research Center",type:"Survey Research / Grey Lit"},
      "oecd.org":{org:"OECD",type:"Official / Regulatory"},
      "epi.org":{org:"Economic Policy Institute",type:"Think Tank / Grey Lit"},
    };
    const m = map[host];
    return {org:m?.org||host,type:m?.type||"Grey Literature / Policy Brief",cleanUrl:u.href};
  } catch { return {org:"",type:"Grey Literature / Policy Brief",cleanUrl:url}; }
}

// ─── EXPORT TO XLSX (SheetJS via CDN) ────────────────────────────────────────

async function exportToExcel(sources, stream) {
  const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs");
  const rows = sources.map(s => ({
    "Title": s.title,
    "Organisation": s.org,
    "URL": s.url,
    "Type": s.type,
    "Role": ROLE_LABELS[s.role]?.label || s.role,
    "Tags": s.tags.join(", "),
    "Cadence": s.cadence,
    "Latest Update Date": s.updates[0]?.date || "",
    "Latest Update Note": s.updates[0]?.note || "",
    "Description / Summary": s.description,
    "Total Updates Logged": s.updates.length,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [32,24,48,28,16,40,14,20,60,60,10].map(w=>({wch:w}));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, stream.label.slice(0,30));
  // Scope sheet
  const scopeRows = [
    ["Research Scope",""],
    ["Stream", stream.label],
    ["Statement", stream.scope.statement],
    ["Status", stream.scope.status],
    ["Last Updated", stream.scope.lastUpdated],
    ["Search Terms", stream.scope.searchTerms],
    ["",""],
    ["Inclusion Criteria",""],
    ...stream.scope.inclusion.map(i=>["•", i]),
    ["",""],
    ["Exclusion Criteria",""],
    ...stream.scope.exclusion.map(e=>["•", e]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(scopeRows);
  ws2["!cols"] = [{wch:22},{wch:80}];
  XLSX.utils.book_append_sheet(wb, ws2, "Research Scope");
  XLSX.writeFile(wb, `research-brain_${stream.code}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// ─── DRAWER ──────────────────────────────────────────────────────────────────

const EMPTY = {title:"",org:"",url:"",description:"",tags:"",note:"",type:"Grey Literature / Policy Brief",role:"supportive",cadence:"Ongoing"};

function Drawer({open,onClose,activeStream,streams,onSave,clock}) {
  const [step,setStep]=useState("url");
  const [urlInput,setUrlInput]=useState("");
  const [parsing,setParsing]=useState(false);
  const [form,setForm]=useState(EMPTY);
  const ref=useRef();
  useEffect(()=>{if(open){setStep("url");setUrlInput("");setForm(EMPTY);setTimeout(()=>ref.current?.focus(),120);}},[open]);
  const go=()=>{
    if(!urlInput.trim())return;
    setParsing(true);
    setTimeout(()=>{const{org,type,cleanUrl}=parseUrl(urlInput);setForm(f=>({...f,url:cleanUrl,org,type}));setParsing(false);setStep("form");},640);
  };
  const save=()=>{
    if(!form.title||!form.url)return;
    const tags=form.tags.split(",").map(t=>t.trim()).filter(Boolean).map(t=>t.startsWith("#")?t:`#${t}`);
    const date=clock.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
    onSave({id:`s${Date.now()}`,streamId:activeStream,title:form.title,org:form.org,url:form.url,description:form.description,tags,updates:[{date,note:form.note||"Source added to repository."}],type:form.type,role:form.role,cadence:form.cadence});
    onClose();
  };
  const stream=streams.find(s=>s.id===activeStream);
  if(!open)return null;
  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.38)",zIndex:40,backdropFilter:"blur(2px)"}}/>
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:480,background:"#f4f1eb",zIndex:50,display:"flex",flexDirection:"column",borderLeft:"1px solid #e0dbd0",boxShadow:"-8px 0 40px rgba(0,0,0,.14)",animation:"slideIn .2s ease"}}>
        <style>{`@keyframes slideIn{from{transform:translateX(36px);opacity:0}to{transform:none;opacity:1}}`}</style>
        <div style={{background:"#1a1814",padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"'Instrument Serif',serif",fontSize:16,color:"#f4f1eb"}}>Add Source</div>
            <div style={{fontSize:9,color:"#6a6458",letterSpacing:".12em",marginTop:2}}>→ {stream?.label?.toUpperCase()}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#6a6458",cursor:"pointer",fontSize:20,lineHeight:1,padding:4}}>×</button>
        </div>
        <div style={{display:"flex",borderBottom:"1px solid #e0dbd0"}}>
          {[["url","01 · Paste URL"],["form","02 · Fill Details"]].map(([s,l])=>(
            <div key={s} style={{flex:1,padding:"10px 0",textAlign:"center",fontSize:9,letterSpacing:".12em",color:step===s?"#1a1814":"#a09888",borderBottom:step===s?"2px solid #1a1814":"2px solid transparent",transition:"all .15s"}}>{l}</div>
          ))}
        </div>
        {step==="url"&&(
          <div style={{padding:24,flex:1,overflowY:"auto"}}>
            <p style={{fontSize:11,color:"#6a6458",lineHeight:1.7,marginBottom:20}}>Paste a URL — the tool auto-detects the organisation and source type from known domains.</p>
            <label style={{fontSize:9,color:"#a09888",letterSpacing:".14em",display:"block",marginBottom:6}}>SOURCE URL</label>
            <input ref={ref} value={urlInput} onChange={e=>setUrlInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="https://..." style={{fontSize:12,padding:"10px 12px",marginBottom:8}}/>
            <div style={{fontSize:9,color:"#c8c2b6",marginBottom:24}}>Known: BLS, DOL, EC, PubMed, Oxford Academic, SSRN, ITIF, Brookings, Reuters, FT + more</div>
            <button onClick={go} disabled={!urlInput.trim()||parsing} style={{width:"100%",padding:"12px",background:urlInput.trim()?"#1a1814":"#e0dbd0",color:urlInput.trim()?"#f4f1eb":"#a09888",border:"none",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,letterSpacing:".1em",cursor:urlInput.trim()?"pointer":"default",borderRadius:2,marginBottom:24}}>
              {parsing?"DETECTING…":"CONTINUE →"}
            </button>
            <div style={{fontSize:9,color:"#a09888",letterSpacing:".14em",marginBottom:10}}>QUICK EXAMPLES</div>
            {[["PubMed Article","https://pubmed.ncbi.nlm.nih.gov/17572902/"],["BLS Jobs Report","https://www.bls.gov/news.release/empsit.toc.htm"],["SSRN Paper","https://ssrn.com"],["EC DMA Portal","https://digital-markets-act.ec.europa.eu/index_en"]].map(([lbl,u])=>(
              <div key={lbl} onClick={()=>setUrlInput(u)} style={{padding:"8px 12px",background:"#faf8f3",border:"1px solid #e0dbd0",borderRadius:2,marginBottom:5,cursor:"pointer",fontSize:10,color:"#6a6458",display:"flex",justifyContent:"space-between"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#1a1814"} onMouseLeave={e=>e.currentTarget.style.borderColor="#e0dbd0"}>
                <span>{lbl}</span><span style={{fontSize:9,color:"#c8c2b6"}}>↙ use</span>
              </div>
            ))}
          </div>
        )}
        {step==="form"&&(
          <div style={{flex:1,overflowY:"auto",padding:24}}>
            <div style={{background:"#faf8f3",border:"1px solid #e0dbd0",borderRadius:2,padding:"10px 14px",marginBottom:18,display:"flex",gap:12,alignItems:"center"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:8,color:"#a09888",letterSpacing:".14em",marginBottom:3}}>DETECTED</div>
                <div style={{fontSize:10,color:"#1a1814"}}>{form.org} · <span style={{color:"#6a6458"}}>{form.type}</span></div>
                <div style={{fontSize:9,color:"#a09888",marginTop:2,wordBreak:"break-all"}}>{form.url}</div>
              </div>
              <button onClick={()=>setStep("url")} style={{background:"none",border:"1px solid #e0dbd0",color:"#a09888",fontFamily:"'IBM Plex Mono',monospace",fontSize:9,padding:"4px 10px",cursor:"pointer",borderRadius:2,flexShrink:0}}>← BACK</button>
            </div>
            {[["TITLE *","title","input","Source title or paper name"],["ORGANISATION","org","input","Publisher, institution, or author"],["DESCRIPTION","description","textarea","What this source covers and why it matters"]].map(([label,field,el,ph])=>(
              <div key={field} style={{marginBottom:14}}>
                <label style={{fontSize:9,color:"#a09888",letterSpacing:".14em",display:"block",marginBottom:5}}>{label}</label>
                {el==="textarea"?<textarea rows={3} placeholder={ph} value={form[field]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))}/>:<input placeholder={ph} value={form[field]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))}/>}
              </div>
            ))}
            <div style={{marginBottom:14}}>
              <label style={{fontSize:9,color:"#a09888",letterSpacing:".14em",display:"block",marginBottom:5}}>TAGS <span style={{color:"#c8c2b6"}}>(comma-separated)</span></label>
              <input placeholder="#regulation, #EU" value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
              <div>
                <label style={{fontSize:9,color:"#a09888",letterSpacing:".14em",display:"block",marginBottom:5}}>TYPE</label>
                <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{SOURCE_TYPES.map(t=><option key={t}>{t}</option>)}</select>
              </div>
              <div>
                <label style={{fontSize:9,color:"#a09888",letterSpacing:".14em",display:"block",marginBottom:5}}>ROLE</label>
                <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>{Object.entries(ROLE_LABELS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
              </div>
              <div>
                <label style={{fontSize:9,color:"#a09888",letterSpacing:".14em",display:"block",marginBottom:5}}>CADENCE</label>
                <input placeholder="Monthly…" value={form.cadence} onChange={e=>setForm(f=>({...f,cadence:e.target.value}))}/>
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:9,color:"#a09888",letterSpacing:".14em",display:"block",marginBottom:5}}>FIRST UPDATE NOTE</label>
              <textarea rows={3} placeholder="Key findings, relevance to your research…" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/>
            </div>
            <button onClick={save} disabled={!form.title} style={{width:"100%",padding:"13px",background:form.title?"#1a1814":"#e0dbd0",color:form.title?"#f4f1eb":"#a09888",border:"none",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,letterSpacing:".1em",cursor:form.title?"pointer":"default",borderRadius:2}}>
              ADD TO REPOSITORY ↗
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── SOURCES TABLE ───────────────────────────────────────────────────────────

function SourcesTable({ sources, setActiveTag, setView }) {
  const [tblSearch, setTblSearch] = useState("");
  const [tblStream, setTblStream] = useState("all");
  const [tblRole, setTblRole] = useState("all");
  const filtered = sources.filter(s =>
    (tblStream === "all" || s.streamId === tblStream) &&
    (tblRole === "all" || s.role === tblRole) &&
    (!tblSearch || s.title.toLowerCase().includes(tblSearch.toLowerCase()) || s.org.toLowerCase().includes(tblSearch.toLowerCase()) || s.tags.some(t => t.toLowerCase().includes(tblSearch.toLowerCase())))
  );
  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <input value={tblSearch} onChange={e=>setTblSearch(e.target.value)} placeholder="Search title, org, tag…" style={{maxWidth:200,flex:"none",fontSize:11,padding:"6px 10px",background:"#faf8f3",border:"1px solid #e0dbd0"}}/>
        <select value={tblStream} onChange={e=>setTblStream(e.target.value)} style={{width:"auto",fontSize:10,padding:"6px 10px"}}>
          <option value="all">All streams</option>
          {STREAMS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select value={tblRole} onChange={e=>setTblRole(e.target.value)} style={{width:"auto",fontSize:10,padding:"6px 10px"}}>
          <option value="all">All roles</option>
          {Object.entries(ROLE_LABELS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{fontSize:9,color:"#a09888",marginLeft:"auto"}}>{filtered.length} of {sources.length} sources</span>
      </div>

      {/* Table header */}
      <div style={{display:"grid",gridTemplateColumns:"24px 2fr 1.2fr 0.8fr 0.7fr 0.7fr 2.4fr",gap:"0 12px",padding:"6px 12px",background:"#1a1814",borderRadius:"2px 2px 0 0",marginBottom:1}}>
        {["","TITLE / ORGANISATION","STREAM","TYPE","ROLE","PUBLISHED","SUMMARY & RELEVANCE"].map((h,i)=>(
          <div key={i} style={{fontSize:8,color:"#6a6458",letterSpacing:".14em"}}>{h}</div>
        ))}
      </div>

      {/* Table rows */}
      {filtered.map((src,i)=>{
        const s=STREAMS.find(st=>st.id===src.streamId);
        const rl=ROLE_LABELS[src.role]||ROLE_LABELS.background;
        const tc=TYPE_COLORS[src.type]||"#e0dbd0";
        const pubDate=src.cadence?.startsWith("Static")?src.cadence.replace("Static ","").replace(/[()]/g,""):src.updates[0]?.date||"—";
        return(
          <div key={src.id} style={{display:"grid",gridTemplateColumns:"24px 2fr 1.2fr 0.8fr 0.7fr 0.7fr 2.4fr",gap:"0 12px",padding:"11px 12px",background:i%2===0?"#faf8f3":"#f4f1eb",borderBottom:"1px solid #e8e3d8",alignItems:"start"}}>
            {/* Dot */}
            <div style={{paddingTop:3}}><div style={{width:6,height:6,borderRadius:"50%",background:s?.color,border:`1px solid ${s?.dim}`}}/></div>
            {/* Title */}
            <div>
              <a href={src.url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:500,color:"#1a1814",lineHeight:1.4,display:"block",marginBottom:3,borderBottom:"1px solid #c8c2b6",textDecoration:"none"}}>{src.title}</a>
              <div style={{fontSize:9,color:"#8a8070"}}>{src.org}</div>
              <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:5}}>{src.tags.slice(0,4).map(t=><span key={t} className="chip" style={{fontSize:8}} onClick={()=>{setActiveTag(t);setView("tags");}}>{t}</span>)}{src.tags.length>4&&<span style={{fontSize:8,color:"#a09888"}}>+{src.tags.length-4}</span>}</div>
            </div>
            {/* Stream */}
            <div style={{fontSize:9,color:"#6a6458",paddingTop:2}}>{s?.label}</div>
            {/* Type */}
            <div style={{paddingTop:2}}><span className="tb" style={{background:tc+"44",color:"#4a4438",fontSize:8}}>{src.type}</span></div>
            {/* Role */}
            <div style={{paddingTop:2}}><span className="rb" style={{background:rl.color,color:rl.text,fontSize:8}}>{rl.label}</span></div>
            {/* Date */}
            <div style={{fontSize:9,color:"#8a8070",paddingTop:2}}>{pubDate}</div>
            {/* Summary */}
            <div>
              <div style={{fontSize:10,color:"#4a4438",lineHeight:1.6,fontStyle:"italic",marginBottom:4}}>{src.updates[0]?.note}</div>
              <div style={{fontSize:9,color:"#a09888",lineHeight:1.5}}>{src.description}</div>
            </div>
          </div>
        );
      })}

      {filtered.length===0&&(
        <div style={{textAlign:"center",padding:"40px 0",color:"#c8c2b6",fontSize:11}}>NO SOURCES MATCH YOUR FILTERS</div>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "research-repo-sources-v1";

function loadSources() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_SOURCES;
}

export default function ResearchBrain() {
  const [sources,setSources]         = useState(loadSources);
  const [activeStreamId,setActiveStreamId] = useState("dma");
  const [activeTag,setActiveTag]     = useState(null);
  const [activeType,setActiveType]   = useState(null);
  const [view,setView]               = useState("stream");
  const [expandedId,setExpandedId]   = useState(null);
  const [editingId,setEditingId]     = useState(null);
  const [editText,setEditText]       = useState("");
  const [drawerOpen,setDrawerOpen]   = useState(false);
  const [clock,setClock]             = useState(new Date());
  const [search,setSearch]           = useState("");
  const [toast,setToast]             = useState(null);
  const [scopeOpen,setScopeOpen]     = useState(false);
  const [digestVisible,setDigestVisible] = useState(true);
  const [digestTyping,setDigestTyping]   = useState(false);
  const [digestShown,setDigestShown]     = useState("");

  // Persist sources to localStorage on every change
  useEffect(()=>{
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sources)); } catch {}
  },[sources]);

  useEffect(()=>{const t=setInterval(()=>setClock(new Date()),1000);return()=>clearInterval(t);},[]);

  const stream = STREAMS.find(s=>s.id===activeStreamId);
  const ALL_TAGS = useMemo(()=>[...new Set(sources.flatMap(s=>s.tags))].sort(),[sources]);

  const streamSources = useMemo(()=>{
    let s=sources.filter(x=>x.streamId===activeStreamId);
    if(activeType)s=s.filter(x=>x.type===activeType);
    if(search)s=s.filter(x=>x.title.toLowerCase().includes(search.toLowerCase())||x.org.toLowerCase().includes(search.toLowerCase())||x.description.toLowerCase().includes(search.toLowerCase())||x.tags.some(t=>t.toLowerCase().includes(search.toLowerCase())));
    const order={foundational:0,supportive:1,background:2};
    return [...s].sort((a,b)=>(order[a.role]??3)-(order[b.role]??3));
  },[sources,activeStreamId,activeType,search]);

  const tagSources  = useMemo(()=>activeTag?sources.filter(s=>s.tags.includes(activeTag)):[],[sources,activeTag]);
  const feedSources = useMemo(()=>[...sources].sort((a,b)=>b.updates[0]?.date.localeCompare(a.updates[0]?.date)),[sources]);
  const tagCounts   = useMemo(()=>{const c={};ALL_TAGS.forEach(t=>{c[t]=sources.filter(s=>s.tags.includes(t)).length;});return c;},[sources,ALL_TAGS]);
  const streamTypes = useMemo(()=>[...new Set(sources.filter(s=>s.streamId===activeStreamId).map(s=>s.type))].sort(),[sources,activeStreamId]);

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(null),2800);};

  const runDigest=()=>{
    const full=stream.digest.summary;
    setDigestShown("");setDigestTyping(true);
    let i=0;
    const interval=setInterval(()=>{
      i+=3;setDigestShown(full.slice(0,i));
      if(i>=full.length){clearInterval(interval);setDigestTyping(false);}
    },18);
  };

  useEffect(()=>{setDigestShown(stream.digest.summary);setDigestTyping(false);},[activeStreamId]);

  const saveUpdate=id=>{
    if(!editText.trim())return;
    const date=clock.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
    setSources(prev=>prev.map(s=>s.id===id?{...s,updates:[{date,note:editText},...s.updates]}:s));
    setEditingId(null);setEditText("");showToast("Update logged ✓");
  };
  const addSource=src=>{setSources(prev=>[...prev,src]);showToast(`"${src.title}" added ✓`);};
  const resetToDefaults=()=>{
    if(window.confirm("Reset all sources to defaults? This will remove any sources you've added.")){
      setSources(INITIAL_SOURCES);
      showToast("Reset to default sources ✓");
    }
  };
  const statFor=sid=>{const s=sources.filter(x=>x.streamId===sid);return{total:s.length,foundational:s.filter(x=>x.role==="foundational").length};};

  const CSS=`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Instrument+Serif:ital@0;1&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:#ede9e1;}::-webkit-scrollbar-thumb{background:#c8c2b6;border-radius:2px;}
    a{color:inherit;text-decoration:none;}
    .card{background:#faf8f3;border:1px solid #e0dbd0;border-radius:2px;margin-bottom:6px;transition:border-color .15s,box-shadow .15s;}
    .card:hover{border-color:#c8c2b6;box-shadow:0 2px 12px rgba(0,0,0,.06);}
    .card.found{border-left:3px solid #1a1814;}
    .card.supp{border-left:3px solid #4a7c59;}
    .btn{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.1em;padding:6px 14px;border-radius:2px;cursor:pointer;border:1px solid #c8c2b6;background:transparent;color:#6a6458;transition:all .12s;}
    .btn:hover{border-color:#1a1814;color:#1a1814;}
    .btn.solid{background:#1a1814;color:#f4f1eb;border-color:#1a1814;}.btn.solid:hover{background:#2a2820;}
    input,textarea,select{font-family:'IBM Plex Mono',monospace;font-size:11px;background:#f4f1eb;border:1px solid #d8d3c8;color:#1a1814;padding:8px 10px;border-radius:2px;width:100%;outline:none;resize:vertical;}
    input:focus,textarea:focus,select:focus{border-color:#1a1814;}
    .chip{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;background:#e8e3d8;border-radius:2px;font-size:9px;letter-spacing:.08em;cursor:pointer;transition:all .12s;color:#6a6458;border:1px solid transparent;white-space:nowrap;}
    .chip:hover{background:#ddd8cc;color:#1a1814;}.chip.hi{background:#1a1814;color:#f4f1eb;}
    .sbox{background:#faf8f3;border:1px solid #e0dbd0;border-radius:2px;padding:12px 14px;}
    .hr{border:none;border-top:1px solid #e0dbd0;}
    .ue{padding:10px 0;border-bottom:1px solid #ede9e1;}.ue:last-child{border-bottom:none;}
    .fi{animation:fi .2s ease;}@keyframes fi{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
    .sb{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:2px;cursor:pointer;border:1px solid transparent;transition:all .15s;margin-bottom:3px;}
    .sb:hover{background:#eee9de;}.sb.on{background:#1a1814;border-color:#1a1814;}
    .tb{display:inline-block;font-size:8px;letter-spacing:.1em;padding:2px 7px;border-radius:2px;text-transform:uppercase;white-space:nowrap;}
    .rb{display:inline-block;font-size:8px;letter-spacing:.12em;padding:2px 8px;border-radius:2px;text-transform:uppercase;white-space:nowrap;}
    .nv{background:none;border:none;font-family:'IBM Plex Mono',monospace;cursor:pointer;padding:0 0 2px;transition:all .12s;font-size:9px;letter-spacing:.15em;}
    .ab{display:flex;align-items:center;gap:7px;padding:8px 16px;background:#1a1814;color:#f4f1eb;border:none;border-radius:2px;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.1em;cursor:pointer;transition:background .12s;}.ab:hover{background:#2e2a24;}
    .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1814;color:#f4f1eb;padding:10px 20px;border-radius:2px;font-size:11px;z-index:100;animation:ti .2s ease;pointer-events:none;}
    @keyframes ti{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%)}}
    .cursor::after{content:'|';animation:blink 1s infinite;}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  `;

  return(
    <div style={{fontFamily:"'IBM Plex Mono','Courier New',monospace",background:"#f4f1eb",minHeight:"100vh",color:"#1a1814",display:"flex",flexDirection:"column"}}>
      <style>{CSS}</style>
      {toast&&<div className="toast">{toast}</div>}
      <Drawer open={drawerOpen} onClose={()=>setDrawerOpen(false)} activeStream={activeStreamId} streams={STREAMS} onSave={addSource} clock={clock}/>

      {/* TOP BAR */}
      <div style={{background:"#1a1814",color:"#f4f1eb",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:44,flexShrink:0,zIndex:30}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <span style={{fontFamily:"'Instrument Serif',serif",fontSize:18,letterSpacing:".02em"}}>Research Repository</span>
          <span style={{fontSize:9,color:"#6a6458",letterSpacing:".12em",borderLeft:"1px solid #2a2820",paddingLeft:14}}>TEAM KNOWLEDGE BASE</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <div style={{display:"flex",gap:14}}>
            {[["stream","STREAMS"],["sources","ALL SOURCES"],["feed","FEED"],["tags","TAGS"]].map(([v,l])=>(
              <button key={v} className="nv" onClick={()=>setView(v)} style={{color:view===v?"#f4f1eb":"#6a6458",borderBottom:view===v?"1px solid #f4f1eb":"1px solid transparent"}}>{l}</button>
            ))}
          </div>
          <button className="ab" onClick={()=>setDrawerOpen(true)}><span style={{fontSize:15,lineHeight:1}}>+</span> ADD SOURCE</button>
          <span style={{fontSize:9,color:"#4a4438",fontVariantNumeric:"tabular-nums"}}>{clock.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span>
        </div>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>
        {/* SIDEBAR */}
        <div style={{width:226,background:"#eee9de",borderRight:"1px solid #e0dbd0",display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
          <div style={{padding:"18px 14px 12px"}}>
            <div style={{fontSize:8,color:"#a09888",letterSpacing:".2em",textTransform:"uppercase",marginBottom:10}}>Work Streams</div>
            {STREAMS.map(s=>{
              const st=statFor(s.id);const ia=activeStreamId===s.id&&view==="stream";
              return(
                <div key={s.id} className={`sb${ia?" on":""}`} onClick={()=>{setActiveStreamId(s.id);setView("stream");setExpandedId(null);setActiveType(null);setSearch("");setScopeOpen(false);}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:ia?s.color:s.dim,flexShrink:0,transition:"background .15s"}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:500,color:ia?"#f4f1eb":"#1a1814"}}>{s.label}</div>
                    <div style={{fontSize:9,color:"#a09888",marginTop:1}}>{st.foundational} foundational · {st.total} total</div>
                  </div>
                  <div style={{fontSize:8,color:ia?"#6a6458":"#c8c2b6"}}>{s.code}</div>
                </div>
              );
            })}
          </div>
          <hr className="hr"/>
          <div style={{padding:"12px 14px"}}>
            <div style={{fontSize:8,color:"#a09888",letterSpacing:".2em",textTransform:"uppercase",marginBottom:10}}>Views</div>
            {[["feed","↑ Latest Updates"],["tags","⊕ Tag Explorer"]].map(([v,l])=>(
              <div key={v} onClick={()=>setView(v)} style={{padding:"7px 10px",cursor:"pointer",borderRadius:2,background:view===v?"#1a1814":"transparent",color:view===v?"#f4f1eb":"#6a6458",fontSize:11,marginBottom:2,transition:"all .12s"}}>{l}</div>
            ))}
          </div>
          <hr className="hr"/>
          <div style={{padding:"12px 14px",flex:1}}>
            <div style={{fontSize:8,color:"#a09888",letterSpacing:".2em",textTransform:"uppercase",marginBottom:4}}>Stream Overview</div>
            <div style={{fontSize:8,color:"#c8c2b6",letterSpacing:".1em",marginBottom:10}}>{STREAMS.find(s=>s.id===activeStreamId)?.label?.toUpperCase()}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:10}}>
              {(()=>{
                const ss=sources.filter(s=>s.streamId===activeStreamId);
                const streamTags=[...new Set(ss.flatMap(s=>s.tags))];
                return[
                  ["Sources",ss.length],
                  ["Updates",ss.reduce((a,s)=>a+s.updates.length,0)],
                  ["Tags",streamTags.length],
                  ["Foundational",ss.filter(s=>s.role==="foundational").length],
                ].map(([l,v])=>(
                  <div key={l} className="sbox"><div style={{fontFamily:"'Instrument Serif',serif",fontSize:20,lineHeight:1}}>{v}</div><div style={{fontSize:8,color:"#a09888",letterSpacing:".1em",marginTop:2}}>{l.toUpperCase()}</div></div>
                ));
              })()}
            </div>
            <div style={{borderTop:"1px solid #e0dbd0",paddingTop:10,marginTop:2}}>
              <div style={{fontSize:8,color:"#a09888",letterSpacing:".15em",marginBottom:6}}>ALL STREAMS</div>
              {STREAMS.map(s=>{
                const n=sources.filter(x=>x.streamId===s.id).length;
                const isActive=s.id===activeStreamId;
                return(
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,cursor:"pointer"}} onClick={()=>{setActiveStreamId(s.id);setView("stream");}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:isActive?s.color:s.dim,flexShrink:0}}/>
                    <div style={{flex:1,fontSize:9,color:isActive?"#1a1814":"#8a8070"}}>{s.label}</div>
                    <div style={{fontSize:9,color:"#c8c2b6"}}>{n}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <hr className="hr"/>
          <div style={{padding:"14px"}}>
            <div onClick={()=>setDrawerOpen(true)} style={{background:"#faf8f3",border:"1px dashed #c8c2b6",borderRadius:2,padding:"12px 14px",cursor:"pointer",textAlign:"center"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#1a1814"} onMouseLeave={e=>e.currentTarget.style.borderColor="#c8c2b6"}>
              <div style={{fontSize:18,color:"#c8c2b6",marginBottom:3}}>+</div>
              <div style={{fontSize:9,color:"#a09888",letterSpacing:".12em"}}>ADD SOURCE</div>
              <div style={{fontSize:8,color:"#c8c2b6",marginTop:2}}>paste a URL to start adding</div>
            </div>
            <div style={{marginTop:8,textAlign:"center"}}>
              <button onClick={resetToDefaults} style={{background:"none",border:"none",fontSize:8,color:"#c8c2b6",cursor:"pointer",letterSpacing:".1em",padding:"4px 0"}}>↺ reset to defaults</button>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div style={{flex:1,overflowY:"auto",padding:"24px 28px",minWidth:0}}>

          {/* ALL SOURCES TABLE */}
          {view==="sources"&&(
            <div className="fi">
              <div style={{marginBottom:20,display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
                <div>
                  <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:24,fontWeight:400,marginBottom:3}}>All Sources</h2>
                  <div style={{fontSize:9,color:"#a09888",letterSpacing:".1em"}}>ALL STREAMS · {sources.length} SOURCES · COMPLETE EXTRACTION VIEW</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn" onClick={async()=>{
                    const XLSX=await import("https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs");
                    const rows=sources.map(s=>({
                      "Stream":STREAMS.find(st=>st.id===s.streamId)?.label||s.streamId,
                      "Title":s.title,"Organisation":s.org,"URL":s.url,
                      "Type":s.type,"Role":ROLE_LABELS[s.role]?.label||s.role,
                      "Cadence":s.cadence,
                      "Published / Date":s.cadence?.startsWith("Static")?s.cadence.replace("Static ","").replace(/[()]/g,""):s.updates[0]?.date||"",
                      "Tags":s.tags.join(", "),
                      "Latest Update Date":s.updates[0]?.date||"",
                      "Summary / Latest Note":s.updates[0]?.note||"",
                      "Full Description":s.description,
                      "Total Updates":s.updates.length,
                    }));
                    const ws=XLSX.utils.json_to_sheet(rows);
                    ws["!cols"]=[22,40,24,48,24,14,12,14,40,18,60,60,10].map(w=>({wch:w}));
                    const wb=XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb,ws,"All Sources");
                    XLSX.writeFile(wb,`research-repository_all-sources_${new Date().toISOString().slice(0,10)}.xlsx`);
                  }}>↓ EXPORT ALL XLSX</button>
                </div>
              </div>

              {/* Filter bar + table */}
              <SourcesTable sources={sources} setActiveTag={setActiveTag} setView={setView} />
            </div>
          )}

          {/* FEED */}
          {view==="feed"&&(
            <div className="fi">
              <div style={{marginBottom:20}}><h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:24,fontWeight:400,marginBottom:3}}>Latest Updates</h2><div style={{fontSize:9,color:"#a09888",letterSpacing:".1em"}}>ALL STREAMS · {feedSources.length} SOURCES</div></div>
              {feedSources.map(src=>{
                const s=STREAMS.find(st=>st.id===src.streamId);const tc=TYPE_COLORS[src.type]||"#e0dbd0";const rl=ROLE_LABELS[src.role];
                return(
                  <div key={src.id} style={{borderBottom:"1px solid #e0dbd0",padding:"14px 0",display:"grid",gridTemplateColumns:"76px 1fr",gap:14}}>
                    <div><div style={{fontSize:9,color:"#a09888",marginBottom:5}}>{src.updates[0]?.date}</div><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:6,height:6,borderRadius:"50%",background:s.color,border:`1px solid ${s.dim}`}}/><span style={{fontSize:8,color:"#a09888",letterSpacing:".1em"}}>{s.code}</span></div></div>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                        <span style={{fontSize:12,fontWeight:500}}>{src.title}</span>
                        {rl&&<span className="rb" style={{background:rl.color,color:rl.text}}>{rl.label}</span>}
                        <span className="tb" style={{background:(tc+"44"),color:"#4a4438"}}>{src.type}</span>
                      </div>
                      <div style={{fontSize:9,color:"#8a8070",marginBottom:5}}>{src.org}</div>
                      <div style={{fontSize:11,color:"#6a6458",lineHeight:1.65,fontStyle:"italic",marginBottom:8}}>{src.updates[0]?.note}</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{src.tags.map(t=><span key={t} className="chip" onClick={()=>{setActiveTag(t);setView("tags");}}>{t}</span>)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAGS */}
          {view==="tags"&&(
            <div className="fi">
              <div style={{marginBottom:20}}>
                <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:24,fontWeight:400,marginBottom:12}}>Tag Explorer</h2>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:16}}>{ALL_TAGS.map(t=><span key={t} className={`chip${activeTag===t?" hi":""}`} style={{fontSize:10,padding:"3px 10px"}} onClick={()=>setActiveTag(activeTag===t?null:t)}>{t} <span style={{opacity:.5}}>{tagCounts[t]}</span></span>)}</div>
                {activeTag?<div style={{fontFamily:"'Instrument Serif',serif",fontSize:20,fontWeight:400}}>Tagged <em>{activeTag}</em> <span style={{color:"#a09888",fontSize:13}}>({tagSources.length})</span></div>:<div style={{fontSize:11,color:"#a09888"}}>Select a tag to see sources across all streams.</div>}
              </div>
              {tagSources.map(src=>{
                const s=STREAMS.find(st=>st.id===src.streamId);const tc=TYPE_COLORS[src.type]||"#e0dbd0";const rl=ROLE_LABELS[src.role];
                return(
                  <div key={src.id} className="card" style={{padding:"13px 16px"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:5}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:s.color,border:`1px solid ${s.dim}`,flexShrink:0,marginTop:3}}/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3}}>
                          <span style={{fontSize:8,color:"#a09888",letterSpacing:".1em"}}>{s.label.toUpperCase()}</span>
                          {rl&&<span className="rb" style={{background:rl.color,color:rl.text}}>{rl.label}</span>}
                          <span className="tb" style={{background:(tc+"44"),color:"#4a4438"}}>{src.type}</span>
                        </div>
                        <div style={{fontSize:12,fontWeight:500}}>{src.title}</div><div style={{fontSize:9,color:"#8a8070",marginTop:1}}>{src.org}</div>
                      </div>
                      <a href={src.url} target="_blank" rel="noopener noreferrer" style={{fontSize:9,color:"#a09888",borderBottom:"1px solid #c8c2b6",flexShrink:0}}>↗ SOURCE</a>
                    </div>
                    <div style={{fontSize:11,color:"#6a6458",fontStyle:"italic",lineHeight:1.6}}>{src.updates[0]?.note}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STREAM */}
          {view==="stream"&&(
            <div className="fi">

              {/* Stream header */}
              <div style={{marginBottom:16,display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                    <div style={{width:9,height:9,borderRadius:"50%",background:stream.color,border:`2px solid ${stream.dim}`}}/>
                    <span style={{fontSize:9,letterSpacing:".18em",color:"#a09888"}}>{stream.code}</span>
                  </div>
                  <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:26,fontWeight:400,marginBottom:3}}>{stream.label}</h2>
                  <div style={{fontSize:9,color:"#a09888",letterSpacing:".08em"}}>
                    {sources.filter(s=>s.streamId===activeStreamId&&s.role==="foundational").length} FOUNDATIONAL · {sources.filter(s=>s.streamId===activeStreamId&&s.role==="supportive").length} SUPPORTIVE · {sources.filter(s=>s.streamId===activeStreamId&&s.role==="background").length} BACKGROUND
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexShrink:0}}>
                  <button className="btn" onClick={()=>exportToExcel(sources.filter(s=>s.streamId===activeStreamId),stream)}>↓ EXPORT XLSX</button>
                  <button className="ab" onClick={()=>setDrawerOpen(true)}><span style={{fontSize:15,lineHeight:1}}>+</span> ADD SOURCE</button>
                </div>
              </div>

              {/* ── RESEARCH SCOPE ── */}
              <div style={{marginBottom:14,background:"#faf8f3",border:"1px solid #e0dbd0",borderRadius:2}}>
                <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}} onClick={()=>setScopeOpen(o=>!o)}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:9,letterSpacing:".15em",color:"#a09888"}}>RESEARCH SCOPE</span>
                    <span style={{fontSize:8,padding:"2px 8px",background:stream.scope.status==="Active"?"#a8e4c0":"#e0dbd0",color:"#1a1814",borderRadius:2,letterSpacing:".1em"}}>{stream.scope.status.toUpperCase()}</span>
                    <span style={{fontSize:9,color:"#c8c2b6"}}>· Updated {stream.scope.lastUpdated}</span>
                  </div>
                  <span style={{fontSize:9,color:"#c8c2b6"}}>{scopeOpen?"▲":"▼"}</span>
                </div>
                {scopeOpen&&(
                  <div className="fi" style={{borderTop:"1px solid #e0dbd0",padding:"16px"}}>
                    <p style={{fontSize:11,color:"#1a1814",lineHeight:1.7,marginBottom:16,fontStyle:"italic"}}>{stream.scope.statement}</p>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:14}}>
                      <div>
                        <div style={{fontSize:8,color:"#a09888",letterSpacing:".15em",marginBottom:8}}>INCLUSION CRITERIA</div>
                        {stream.scope.inclusion.map((inc,i)=><div key={i} style={{fontSize:10,color:"#4a4438",lineHeight:1.6,marginBottom:4,paddingLeft:10,borderLeft:"2px solid #a8e4c0"}}>✓ {inc}</div>)}
                      </div>
                      <div>
                        <div style={{fontSize:8,color:"#a09888",letterSpacing:".15em",marginBottom:8}}>EXCLUSION CRITERIA</div>
                        {stream.scope.exclusion.map((exc,i)=><div key={i} style={{fontSize:10,color:"#4a4438",lineHeight:1.6,marginBottom:4,paddingLeft:10,borderLeft:"2px solid #E8A3A3"}}>✗ {exc}</div>)}
                      </div>
                    </div>
                    <div style={{background:"#f4f1eb",border:"1px solid #e0dbd0",borderRadius:2,padding:"10px 14px"}}>
                      <div style={{fontSize:8,color:"#a09888",letterSpacing:".15em",marginBottom:5}}>SEARCH STRING</div>
                      <div style={{fontSize:10,color:"#4a4438",fontFamily:"monospace",lineHeight:1.6,wordBreak:"break-all"}}>{stream.scope.searchTerms}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── AI DIGEST ── */}
              <div style={{marginBottom:14,background:"#1a1814",borderRadius:2,padding:"16px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:9,letterSpacing:".15em",color:"#a09888"}}>AI DIGEST</span>
                    <span style={{fontSize:8,padding:"2px 8px",background:"#2a2820",color:"#6a6458",borderRadius:2,letterSpacing:".1em"}}>GENERATED {stream.digest.generatedAt}</span>
                  </div>
                  <button onClick={runDigest} disabled={digestTyping} style={{background:"none",border:"1px solid #2a2820",color:digestTyping?"#4a4438":"#6a6458",fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:".1em",padding:"3px 10px",cursor:digestTyping?"default":"pointer",borderRadius:2,transition:"all .12s"}}>
                    {digestTyping?"generating…":"↻ regenerate"}
                  </button>
                </div>
                <p style={{fontSize:11,color:"#c8c2b6",lineHeight:1.75,marginBottom:14,fontStyle:"italic"}} className={digestTyping?"cursor":""}>{digestShown}</p>
                <div style={{borderTop:"1px solid #2a2820",paddingTop:12}}>
                  <div style={{fontSize:8,color:"#6a6458",letterSpacing:".15em",marginBottom:8}}>STREAM PULSE <span style={{color:"#4a4438",fontStyle:"normal"}}>· topic activity signals · live scraping in v2</span></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {stream.digest.signals.map((sig,i)=>(
                      <div key={i} style={{background:"#2a2820",borderRadius:2,padding:"8px 12px",display:"flex",gap:10,alignItems:"flex-start"}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:sig.hot?"#a8e4c0":"#4a4438",marginTop:3,flexShrink:0}}/>
                        <div>
                          <div style={{fontSize:10,color:"#e8e3d8",marginBottom:2}}>{sig.tag}</div>
                          <div style={{fontSize:9,color:"#6a6458",lineHeight:1.5}}>{sig.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search sources, orgs, tags…" style={{maxWidth:210,flex:"none",fontSize:11,padding:"6px 10px",background:"#faf8f3",border:"1px solid #e0dbd0"}}/>
                <span className={`chip${!activeType?" hi":""}`} onClick={()=>setActiveType(null)}>All types</span>
                {streamTypes.map(t=>{const tc=TYPE_COLORS[t]||"#e0dbd0";return(<span key={t} className={`chip${activeType===t?" hi":""}`} style={activeType===t?{}:{background:tc+"33",borderColor:tc+"88"}} onClick={()=>setActiveType(activeType===t?null:t)}>{t}</span>);})}
              </div>

              {/* Role legend */}
              <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                {Object.entries(ROLE_LABELS).map(([k,v])=>(
                  <div key={k} style={{display:"flex",alignItems:"center",gap:6,fontSize:9,color:"#8a8070"}}>
                    <span className="rb" style={{background:v.color,color:v.text}}>{v.label}</span>
                    <span>{v.desc}</span>
                  </div>
                ))}
              </div>

              {/* Source cards */}
              {streamSources.map(src=>{
                const io=expandedId===src.id;const rl=ROLE_LABELS[src.role]||ROLE_LABELS.background;const tc=TYPE_COLORS[src.type]||"#e0dbd0";
                const cardClass=`card ${src.role==="foundational"?"found":src.role==="supportive"?"supp":""}`;
                return(
                  <div key={src.id} className={cardClass}>
                    <div style={{padding:"13px 16px",cursor:"pointer",display:"grid",gridTemplateColumns:"1fr auto",gap:12}} onClick={()=>setExpandedId(io?null:src.id)}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"}}>
                          <span className="rb" style={{background:rl.color,color:rl.text}}>{rl.label}</span>
                          <span className="tb" style={{background:tc+"44",color:"#4a4438"}}>{src.type}</span>
                          <span style={{fontSize:9,color:"#a09888"}}>{src.cadence}</span>
                          <span style={{fontSize:9,color:"#c8c2b6"}}>·</span>
                          <span style={{fontSize:9,color:"#a09888"}}>{src.org}</span>
                        </div>
                        <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>{src.title}</div>
                        <div style={{fontSize:10,color:"#6a6458",fontStyle:"italic",lineHeight:1.55}}>{src.updates[0]?.note}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
                        <span style={{fontSize:9,color:"#a09888"}}>{src.updates[0]?.date}</span>
                        <div style={{display:"flex",gap:3,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:160}}>
                          {src.tags.slice(0,3).map(t=><span key={t} className="chip" style={{fontSize:8}} onClick={e=>{e.stopPropagation();setActiveTag(t);setView("tags");}}>{t}</span>)}
                          {src.tags.length>3&&<span style={{fontSize:8,color:"#a09888",padding:"2px 3px"}}>+{src.tags.length-3}</span>}
                        </div>
                        <span style={{fontSize:9,color:"#c8c2b6"}}>{io?"▲":"▼"}</span>
                      </div>
                    </div>
                    {io&&(
                      <div className="fi" style={{borderTop:"1px solid #e0dbd0"}}>
                        <div style={{display:"flex",borderBottom:"1px solid #e0dbd0"}}>
                          {[["URL",null,src.url],["Type",src.type,null],["Role",rl.label,null],["Updates",`${src.updates.length} logged`,null]].map(([l,v,lnk])=>(
                            <div key={l} style={{flex:1,padding:"9px 14px",borderRight:"1px solid #e0dbd0"}}>
                              <div style={{fontSize:8,color:"#a09888",letterSpacing:".14em",marginBottom:3}}>{l.toUpperCase()}</div>
                              {lnk?<a href={lnk} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:"#1a1814",borderBottom:"1px solid #c8c2b6"}}>↗ Open Source</a>:<div style={{fontSize:10,color:"#1a1814"}}>{v}</div>}
                            </div>
                          ))}
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
                          <div style={{padding:"14px 16px",borderRight:"1px solid #e0dbd0"}}>
                            <div style={{fontSize:8,color:"#a09888",letterSpacing:".14em",marginBottom:8}}>DESCRIPTION</div>
                            <div style={{fontSize:11,color:"#4a4438",lineHeight:1.7}}>{src.description}</div>
                            <div style={{marginTop:12}}>
                              <div style={{fontSize:8,color:"#a09888",letterSpacing:".14em",marginBottom:6}}>ALL TAGS</div>
                              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{src.tags.map(t=><span key={t} className="chip" onClick={()=>{setActiveTag(t);setView("tags");}}>{t}</span>)}</div>
                            </div>
                          </div>
                          <div style={{padding:"14px 16px"}}>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                              <div style={{fontSize:8,color:"#a09888",letterSpacing:".14em"}}>UPDATE LOG</div>
                              {editingId!==src.id&&<button className="btn" style={{fontSize:9,padding:"3px 10px"}} onClick={()=>{setEditingId(src.id);setEditText("");}}>+ LOG UPDATE</button>}
                            </div>
                            {editingId===src.id&&(
                              <div style={{marginBottom:10}}>
                                <textarea rows={3} placeholder="Add update note…" value={editText} onChange={e=>setEditText(e.target.value)} style={{marginBottom:7}}/>
                                <div style={{display:"flex",gap:6}}>
                                  <button className="btn solid" style={{fontSize:9,padding:"4px 12px"}} onClick={()=>saveUpdate(src.id)}>Save</button>
                                  <button className="btn" style={{fontSize:9,padding:"4px 12px"}} onClick={()=>setEditingId(null)}>Cancel</button>
                                </div>
                              </div>
                            )}
                            <div style={{maxHeight:200,overflowY:"auto"}}>
                              {src.updates.map((u,i)=>(
                                <div key={i} className="ue">
                                  <div style={{fontSize:8,color:"#a09888",letterSpacing:".1em",marginBottom:3}}>{u.date}</div>
                                  <div style={{fontSize:10,color:"#4a4438",lineHeight:1.65,fontStyle:"italic"}}>{u.note}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {streamSources.length===0&&<div style={{textAlign:"center",padding:"50px 0",color:"#c8c2b6",fontSize:11,letterSpacing:".1em"}}>NO SOURCES MATCH · TRY ADJUSTING YOUR FILTERS</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
