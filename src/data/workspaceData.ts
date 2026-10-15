export interface WorkspaceSection {
  subtitle: string;
  stats: [string, string][];
  title: string;
  headers: string[];
  rows: string[][];
  actionLabel?: string;
}

export const WORKSPACE_DATA: Record<string, WorkspaceSection> = {
  "Risk Management": {
    subtitle: "Identify, assess, and treat enterprise risks with continuous AI monitoring.",
    stats: [
      ["Open risks", "7"],
      ["High risks", "3"],
      ["Treatment plans", "12"],
    ],
    title: "Risk Register & Threat Assessment",
    headers: ["Risk ID", "Risk title", "Category", "Owner", "Score", "Status"],
    rows: [
      ["R-001", "Phishing campaign", "Cybersecurity", "IT Security", "8.5", "Open"],
      ["R-002", "Unpatched systems", "Technology", "IT Operations", "7.8", "Open"],
      ["R-003", "Third-party access", "Third Party", "Vendor Mgmt", "6.2", "In progress"],
      ["R-004", "Data leakage", "Data Privacy", "DPO", "5.9", "Open"],
      ["R-005", "Cloud misconfiguration", "Cloud Ops", "DevOps Lead", "7.1", "In progress"],
      ["R-006", "Ransomware resiliency gap", "Cybersecurity", "CISO Office", "8.1", "Open"],
      ["R-007", "Insider data exfiltration", "People", "HR & Security", "3.4", "Closed"],
    ],
    actionLabel: "＋ Add Risk",
  },

  "Compliance": {
    subtitle: "Monitor your posture across local regulations and international standards.",
    stats: [
      ["Overall compliance", "92%"],
      ["Controls passing", "44 / 49"],
      ["Evidence overdue", "5"],
    ],
    title: "Framework Compliance Posture",
    headers: ["Framework", "Scope", "Coverage", "Evidence", "Status"],
    rows: [
      ["NCA ECC", "Saudi Arabia Critical Inf.", "88%", "10 / 12 controls", "In review"],
      ["ISO 27001:2022", "ISMS Core Operations", "96%", "12 / 13 controls", "On track"],
      ["NIST CSF 2.0", "Enterprise Cybersecurity", "92%", "11 / 12 controls", "On track"],
      ["SOC 2 Type II", "Trust Services Criteria", "94%", "11 / 12 controls", "On track"],
      ["SAMA CSF", "Financial Sector Mandate", "90%", "9 / 10 controls", "On track"],
      ["Saudi PDPL", "Personal Data Protection", "87%", "7 / 8 controls", "In review"],
    ],
    actionLabel: "＋ Add Framework",
  },

  "Controls": {
    subtitle: "Review control design, continuous testing effectiveness, and audit evidence.",
    stats: [
      ["Total controls", "49"],
      ["Effective", "44"],
      ["Needs review", "5"],
    ],
    title: "Enterprise Control Library",
    headers: ["Control ID", "Control name", "Framework", "Effectiveness", "Last reviewed"],
    rows: [
      ["ECC-2-1", "Access control policy & enforcement", "NCA ECC", "Effective", "Oct 10, 2026"],
      ["A.5.1.1", "Information security policies management", "ISO 27001", "Effective", "Oct 09, 2026"],
      ["PR.AA-01", "Identity management & MFA authentication", "NIST CSF", "Needs review", "Oct 04, 2026"],
      ["CC7.2", "Security event monitoring & SIEM feeds", "SOC 2", "Effective", "Oct 08, 2026"],
      ["ECC-3-4", "Vulnerability management & scanning", "NCA ECC", "Effective", "Oct 11, 2026"],
      ["A.8.20", "Network security & segmentation controls", "ISO 27001", "Needs review", "Oct 07, 2026"],
      ["PR.DS-02", "Data protection in transit and at rest", "NIST CSF", "Effective", "Oct 12, 2026"],
    ],
    actionLabel: "＋ Add Control",
  },

  "Incidents": {
    subtitle: "Triage, investigate, and coordinate rapid response for cybersecurity incidents.",
    stats: [
      ["Active incidents", "2"],
      ["Under investigation", "1"],
      ["Resolved this month", "14"],
    ],
    title: "Incident Response Queue",
    headers: ["Incident ID", "Incident", "Severity", "Owner", "Updated", "Status"],
    rows: [
      ["INC-001", "Suspicious login attempt via Tor exit node", "High", "SOC Team", "10 min ago", "Investigating"],
      ["INC-002", "Endpoint malware blocked by EDR", "Medium", "IR Team", "1 hr ago", "Contained"],
      ["INC-003", "Data exfiltration alert on staging database", "High", "Security Ops", "Yesterday", "Resolved"],
      ["INC-004", "Credential harvesting phishing email reported", "Low", "Service Desk", "Yesterday", "Closed"],
      ["INC-005", "DDoS mitigation trigger on public API", "Medium", "Network Ops", "3 days ago", "Closed"],
    ],
    actionLabel: "＋ Report Incident",
  },

  "Assessments": {
    subtitle: "Coordinate internal & external control assessments, evidence audits, and remediation.",
    stats: [
      ["In progress", "6"],
      ["Completed", "18"],
      ["Due this week", "3"],
    ],
    title: "Assessment Schedule & Maturity Reviews",
    headers: ["Assessment", "Framework", "Lead", "Due date", "Progress"],
    rows: [
      ["Access control & privileged account review", "ISO 27001", "IT Security", "Oct 16, 2026", "75%"],
      ["NCA ECC annual compliance audit", "NCA ECC", "GRC Team", "Oct 18, 2026", "60%"],
      ["Incident response tabletop exercise", "NIST CSF", "SOC Team", "Oct 20, 2026", "35%"],
      ["Third-party cloud vendor risk assessment", "SOC 2", "Vendor Risk", "Oct 22, 2026", "90%"],
      ["Cryptography & key management validation", "ISO 27001", "CISO Office", "Oct 25, 2026", "45%"],
    ],
    actionLabel: "＋ Schedule Assessment",
  },

  "Audit & Findings": {
    subtitle: "Track audit observations, non-conformities, remediation owners, and corrective actions.",
    stats: [
      ["Open findings", "8"],
      ["Critical findings", "1"],
      ["Actions overdue", "2"],
    ],
    title: "Audit Findings & Remediation Ledger",
    headers: ["Finding ID", "Finding", "Risk", "Owner", "Due date", "Status"],
    rows: [
      ["AF-021", "Access review evidence gap in Active Directory", "High", "IT Security", "Oct 18, 2026", "Open"],
      ["AF-022", "Supplier security review cadence irregularity", "Medium", "Procurement", "Oct 24, 2026", "In progress"],
      ["AF-023", "Logging retention period under 365-day threshold", "Low", "SOC Team", "Oct 30, 2026", "Open"],
      ["AF-024", "Disaster recovery failover test documentation gap", "Medium", "Infrastructure", "Nov 04, 2026", "In progress"],
      ["AF-025", "Lack of automated DLP alerting on endpoint export", "High", "Data Protection", "Oct 15, 2026", "Open"],
    ],
    actionLabel: "＋ New Finding",
  },

  "Policies & Procedures": {
    subtitle: "Maintain enterprise policy lifecycles, approval matrix, review cadences, and versioning.",
    stats: [
      ["Published policies", "26"],
      ["Awaiting approval", "3"],
      ["Review due", "4"],
    ],
    title: "Enterprise Policy & Standard Library",
    headers: ["Policy", "Owner", "Version", "Review date", "Status"],
    rows: [
      ["Information Security Master Policy", "CISO", "v3.2", "Nov 01, 2026", "Published"],
      ["Identity & Access Management Standard", "IT Security", "v2.1", "Oct 22, 2026", "Review due"],
      ["Cyber Incident Response Playbook", "SOC Lead", "v1.8", "Nov 15, 2026", "Published"],
      ["Cloud Security & Architecture Standard", "Cloud Lead", "v2.0", "Oct 28, 2026", "Awaiting approval"],
      ["Vendor & Third-Party Risk Policy", "Procurement", "v1.4", "Dec 05, 2026", "Published"],
      ["Data Classification & Handling Guideline", "DPO", "v2.2", "Nov 10, 2026", "Published"],
    ],
    actionLabel: "＋ Draft Policy",
  },

  "Reports": {
    subtitle: "Build executive briefs, regulatory filings, audit workpapers, and risk dashboards.",
    stats: [
      ["Saved reports", "12"],
      ["Scheduled", "4"],
      ["Generated this month", "28"],
    ],
    title: "Generated Reports & Executive Briefs",
    headers: ["Report", "Type", "Owner", "Last generated", "Action"],
    rows: [
      ["Executive GRC Summary", "Executive", "GRC Admin", "Oct 12, 2026", "View"],
      ["NCA ECC Readiness & Gap Assessment", "Compliance", "Compliance Lead", "Oct 11, 2026", "View"],
      ["Open Risk Heatmap & Residual Exposure", "Risk", "Risk Manager", "Oct 10, 2026", "View"],
      ["SOC 2 Type II Readiness Workpaper", "Audit", "External Auditor", "Oct 08, 2026", "View"],
      ["Quarterly Cyber Incident & Threat Summary", "Cybersecurity", "SOC Lead", "Oct 06, 2026", "View"],
    ],
    actionLabel: "＋ Generate Report",
  },

  "Configuration": {
    subtitle: "Manage workspace roles, integrations, audit log retention, and AI agent permissions.",
    stats: [
      ["Users", "24"],
      ["Connected frameworks", "4"],
      ["Active integrations", "6"],
    ],
    title: "Workspace Configuration & System Setup",
    headers: ["Setting", "Current value", "Status"],
    rows: [
      ["Identity provider (SSO)", "Microsoft Entra ID (OIDC / SAML)", "Connected"],
      ["Audit log retention policy", "365 days immutable WORM storage", "Enabled"],
      ["Evidence storage repository", "Secure local GRC encrypted vault", "Connected"],
      ["Automated alert notifications", "Enterprise Email + Webhook + In-app", "Enabled"],
      ["SIEM & EDR telemetry integration", "Splunk + CrowdStrike API connector", "Connected"],
      ["Multi-factor authentication (MFA)", "Enforced for all admin & auditor roles", "Enabled"],
    ],
    actionLabel: "⚙ Configure Integrations",
  },
};

export const INITIAL_RISKS = [
  { id: "GR-001", title: "Phishing Campaign", category: "Cybersecurity", score: 8.5, status: "Open" },
  { id: "GR-002", title: "Unpatched Systems", category: "Technology", score: 7.8, status: "Open" },
  { id: "GR-003", title: "Third-Party Access", category: "Third Party", score: 6.2, status: "In Progress" },
  { id: "GR-004", title: "Data Leakage", category: "Data", score: 5.9, status: "Open" },
  { id: "GR-005", title: "Insider Threat", category: "People", score: 3.4, status: "Closed" },
];

export const INITIAL_TOP_RISKS = [
  { icon: "◎", name: "Phishing Campaign", level: "High", score: "8.5", bg: "#ff426d26", color: "#ff7390", pillClass: "" },
  { icon: "⚠", name: "Unpatched Systems", level: "High", score: "7.8", bg: "#ffb43d22", color: "#ffb43d", pillClass: "amber" },
  { icon: "♙", name: "Third-Party Access", level: "Medium", score: "6.2", bg: "#ffb43d22", color: "#ffb43d", pillClass: "amber" },
  { icon: "▣", name: "Data Leakage", level: "Medium", score: "5.9", bg: "#087cff22", color: "#6ab6ff", pillClass: "amber" },
  { icon: "⌁", name: "Insider Threat", level: "Low", score: "3.4", bg: "#00d5ad22", color: "#00d5ad", pillClass: "green" },
];

export const AGENT_DETAILS = [
  {
    id: "orchestrator",
    name: "GRC Orchestrator",
    role: "Policy · Risk · Compliance",
    desc: "Oversees the entire governance framework, synchronizes regulatory baselines across NCA ECC, ISO 27001, NIST CSF, and orchestrates secondary agents.",
    activeTasks: ["Auditing NCA ECC Domain 2 Controls", "Reviewing Quarterly Policy Exceptions", "Consolidating Residual Risk Ledger"],
    status: "Active",
    metrics: { accuracy: "99.4%", latency: "140ms", processed: "1,420 items" },
  },
  {
    id: "risk",
    name: "Risk Intelligence Agent",
    role: "Threats · Risk Analysis",
    desc: "Ingests cyber threat feeds, evaluates CVE vulnerabilities against enterprise assets, and computes quantitative FAIR risk probabilities.",
    activeTasks: ["Evaluating Zero-Day Advisory CVSS 9.8", "Correlating Threat Intel with DMZ Servers", "Updating Heatmap Matrix"],
    status: "Active",
    metrics: { accuracy: "98.7%", latency: "185ms", processed: "840 threats" },
  },
  {
    id: "compliance",
    name: "Compliance Mapping Agent",
    role: "Frameworks · Controls",
    desc: "Automatically maps existing technical and organizational controls to multiple standards simultaneously, eliminating duplicate audit effort.",
    activeTasks: ["Harmonizing NCA ECC to ISO 27001:2022", "Verifying SOC 2 Trust Services Mapping", "Generating Gap Analysis Matrix"],
    status: "Active",
    metrics: { accuracy: "99.1%", latency: "160ms", processed: "215 controls" },
  },
  {
    id: "testing",
    name: "Control Testing Agent",
    role: "Validation · Evidence",
    desc: "Performs continuous automated control testing (CCM), inspects system logs, user access lists, and verifies evidence artifacts against compliance mandates.",
    activeTasks: ["Validating MFA Configuration on Entra ID", "Sampling AWS S3 Bucket Encryption Keys", "Checking WORM Audit Retention"],
    status: "Active",
    metrics: { accuracy: "99.8%", latency: "210ms", processed: "3,110 tests" },
  },
  {
    id: "incident",
    name: "Incident Response Agent",
    role: "Detection · Response",
    desc: "Monitors real-time alerts from SIEM & EDR, recommends containment steps, isolates infected nodes, and tracks regulatory breach reporting windows.",
    activeTasks: ["Analyzing Suspicious Login from Tor IP", "Validating Endpoint Hash Containment", "Drafting Regulatory Breach Notice"],
    status: "Active",
    metrics: { accuracy: "98.9%", latency: "95ms", processed: "52 incidents" },
  },
];
