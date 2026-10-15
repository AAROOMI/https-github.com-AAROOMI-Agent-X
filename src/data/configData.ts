/**
 * Universal Application Configuration Center & Feature Registry Data
 * Supports dynamic dashboard designer, custom fields, configurable workflows,
 * multi-tenant security, and air-gap network settings.
 */

export interface OrganizationProfile {
  orgName: string;
  legalEntity: string;
  commercialRegistration: string;
  headquarters: string;
  industrySector: string;
  primaryRegulator: string;
  defaultFrameworks: string[];
  airGapMode: boolean;
  tamperEvidentLogging: boolean;
  dataLocalizationZone: string;
}

export const INITIAL_ORG_PROFILE: OrganizationProfile = {
  orgName: 'National Financial Technologies (Saudi FinTech Hub)',
  legalEntity: 'Saudi Joint Stock Enterprise LLC',
  commercialRegistration: 'CR-1010892415',
  headquarters: 'King Abdullah Financial District (KAFD), Riyadh, KSA',
  industrySector: 'Banking, FinTech & Critical Payment Infrastructure',
  primaryRegulator: 'Saudi Central Bank (SAMA) & National Cybersecurity Authority (NCA)',
  defaultFrameworks: ['NCA ECC-1:2018', 'SAMA CSF', 'Saudi PDPL', 'ISO 27001:2022', 'NIST CSF 2.0'],
  airGapMode: true,
  tamperEvidentLogging: true,
  dataLocalizationZone: 'sa-central-1 (Riyadh Sovereign Cloud Vault)',
};

export interface FeatureFlag {
  id: string;
  name: string;
  category: 'Core GRC' | 'AI & Automation' | 'Security & Air-Gap' | 'Collaboration';
  description: string;
  state: 'Enabled' | 'Disabled' | 'Restricted' | 'Pending configuration';
  entitled: boolean;
  requiredRole: string;
  lastChanged: string;
}

export const INITIAL_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'feat-boardroom',
    name: 'Voice-Enabled Virtual Boardroom',
    category: 'AI & Automation',
    description: 'Autonomous multi-agent virtual meetings with real-time speech, captions, and structured minutes.',
    state: 'Enabled',
    entitled: true,
    requiredRole: 'Boardroom Participant / Executive',
    lastChanged: '2026-10-10',
  },
  {
    id: 'feat-airgap',
    name: 'Air-Gapped Local Inference Engine',
    category: 'Security & Air-Gap',
    description: 'Enables 100% disconnected offline GRC operations with embedded local models and client-side vector search.',
    state: 'Enabled',
    entitled: true,
    requiredRole: 'GRC Administrator',
    lastChanged: '2026-10-12',
  },
  {
    id: 'feat-human-approval',
    name: 'Human-in-the-Loop Consequential Approval Gates',
    category: 'Security & Air-Gap',
    description: 'Blocks risk acceptance, regulatory filings, and policy publications until an authorized human digitally signs.',
    state: 'Enabled',
    entitled: true,
    requiredRole: 'GRC Administrator / CISO',
    lastChanged: '2026-10-11',
  },
  {
    id: 'feat-reg-sync',
    name: 'Intelligent Regulatory Web-Sync Monitor',
    category: 'Core GRC',
    description: 'Monitors NCA, SAMA, SDAIA, and ISO portals for circulars and amendments, surfacing automated RAG diffs.',
    state: 'Enabled',
    entitled: true,
    requiredRole: 'Compliance Lead',
    lastChanged: '2026-10-09',
  },
  {
    id: 'feat-dashboard-designer',
    name: 'Dynamic Drag-and-Drop Dashboard Designer',
    category: 'Core GRC',
    description: 'Allows administrators to configure visible widgets, density, charts, and save departmental default views.',
    state: 'Enabled',
    entitled: true,
    requiredRole: 'GRC Administrator',
    lastChanged: '2026-10-08',
  },
  {
    id: 'feat-multitenant-vault',
    name: 'Cryptographic WORM Audit Vault',
    category: 'Security & Air-Gap',
    description: 'Write-Once-Read-Many tamper-evident audit storage with SHA-256 chain verification for 365-day retention.',
    state: 'Enabled',
    entitled: true,
    requiredRole: 'Chief Audit Executive',
    lastChanged: '2026-10-07',
  },
];

export interface DashboardWidgetConfig {
  id: string;
  name: string;
  category: 'Metrics' | 'Charts' | 'Lists' | 'Boardroom';
  enabled: boolean;
  size: '1x1' | '2x1' | '3x1' | 'full';
  description: string;
}

export const INITIAL_DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'widget-kpis', name: 'Executive KPI Metric Cards', category: 'Metrics', enabled: true, size: 'full', description: 'Overall compliance, open risks, incidents, and policy compliance.' },
  { id: 'widget-agents', name: 'Agentic Workforce Roster', category: 'Boardroom', enabled: true, size: '2x1', description: 'Real-time specialized AI agent status badges and inspection hooks.' },
  { id: 'widget-donut', name: 'Multi-Framework Donut Breakdown', category: 'Charts', enabled: true, size: '1x1', description: 'Conic visualizer across ISO, NIST, NCA ECC, SOC 2.' },
  { id: 'widget-trend', name: 'Multi-Period Risk Trend Chart', category: 'Charts', enabled: true, size: '1x1', description: 'SVG trend lines for High, Medium, Low exposure across 6M/1Y/2Y.' },
  { id: 'widget-toprisks', name: 'Top Critical Risks Widget', category: 'Lists', enabled: true, size: '1x1', description: 'Prioritized list of top 5 vulnerabilities with FAIR severity scores.' },
  { id: 'widget-activity', name: 'Live Regulatory Activity Stream', category: 'Lists', enabled: true, size: '1x1', description: 'Real-time telemetry on risk, policy, and audit updates.' },
  { id: 'widget-tasks', name: 'Upcoming Audit & Compliance Tasks', category: 'Lists', enabled: true, size: '1x1', description: 'Deadlines for control evidence and regulatory filings.' },
  { id: 'widget-risk-table', name: 'Comprehensive Risk Register Table', category: 'Lists', enabled: true, size: 'full', description: 'Interactive risk register with dynamic filtering and Add Risk modal.' },
  { id: 'widget-coverage', name: 'Framework Coverage Percentage Rings', category: 'Metrics', enabled: true, size: '1x1', description: 'Radial progress indicators for NCA ECC, ISO, NIST, SOC 2.' },
];

export interface WorkflowRule {
  id: string;
  name: string;
  triggerEvent: string;
  steps: string[];
  mandatoryApprovalRole: string;
  slaHours: number;
  status: 'Active' | 'Draft' | 'Paused';
}

export const INITIAL_WORKFLOWS: WorkflowRule[] = [
  {
    id: 'WF-01',
    name: 'High/Critical Risk Acceptance Workflow',
    triggerEvent: 'Risk Score >= 7.0 evaluated by Risk Intelligence Agent',
    steps: ['1. Quantitative FAIR Impact Assessment', '2. CISO Technical Review', '3. Human Boardroom Sign-off'],
    mandatoryApprovalRole: 'Chief Risk Officer & GRC Admin',
    slaHours: 24,
    status: 'Active',
  },
  {
    id: 'WF-02',
    name: 'Regulatory Incident Escalation to NCA (Cert.gov.sa)',
    triggerEvent: 'Severity 1 Cyber Incident Confirmed by SOC / Incident Agent',
    steps: ['1. Node Isolation & Forensic Snapshot', '2. Evidence Hash Generation', '3. Formal NCA 4-Hour Escalation'],
    mandatoryApprovalRole: 'CISO / Legal Counsel',
    slaHours: 4,
    status: 'Active',
  },
  {
    id: 'WF-03',
    name: 'Policy Publication & Employee Attestation',
    triggerEvent: 'New policy draft created or major version incremented',
    steps: ['1. Compliance Mapping Validation', '2. Internal Audit Review', '3. GRC Admin Digital Signature'],
    mandatoryApprovalRole: 'GRC Administrator',
    slaHours: 72,
    status: 'Active',
  },
];

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorType: 'Human User' | 'AI Agent' | 'System Engine';
  category: 'Boardroom' | 'Risk' | 'Compliance' | 'Approval' | 'Air-Gap Security';
  action: string;
  outcome: 'Success' | 'Denied' | 'Pending Human Sign-off';
  correlationId: string;
}

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'EVT-9041',
    timestamp: '2026-10-13 10:10:55 UTC',
    actor: 'Dr. Tariq Al-Ghamdi (CEO)',
    actorType: 'AI Agent',
    category: 'Boardroom',
    action: 'Approved meeting decision DEC-01 (OT Ephemeral JIT Tokens)',
    outcome: 'Success',
    correlationId: 'MTG-2026-Q4-01',
  },
  {
    id: 'EVT-9040',
    timestamp: '2026-10-13 10:09:40 UTC',
    actor: 'Nouf Al-Zahrani (Compliance)',
    actorType: 'AI Agent',
    category: 'Approval',
    action: 'Submitted Human Approval Request APR-2026-001 for NCA ECC-2-1-1 Filing',
    outcome: 'Pending Human Sign-off',
    correlationId: 'APR-2026-001',
  },
  {
    id: 'EVT-9039',
    timestamp: '2026-10-13 10:02:15 UTC',
    actor: 'Abdulaziz Roomi (GRC Admin)',
    actorType: 'Human User',
    category: 'Boardroom',
    action: 'Initiated Live Voice Boardroom Session: Executive Risk Review',
    outcome: 'Success',
    correlationId: 'MTG-2026-Q4-01',
  },
  {
    id: 'EVT-9038',
    timestamp: '2026-10-13 09:45:10 UTC',
    actor: 'System Engine',
    actorType: 'System Engine',
    category: 'Air-Gap Security',
    action: 'Enforced Air-Gap Network Isolation: External API Egress Blocked',
    outcome: 'Success',
    correlationId: 'SYS-AIRGAP-ENF',
  },
  {
    id: 'EVT-9037',
    timestamp: '2026-10-13 08:30:22 UTC',
    actor: 'Control Testing Agent',
    actorType: 'AI Agent',
    category: 'Compliance',
    action: 'Automated CCM validation of 44 controls against ISO 27001 & NCA ECC',
    outcome: 'Success',
    correlationId: 'CCM-RUN-2026',
  },
];
