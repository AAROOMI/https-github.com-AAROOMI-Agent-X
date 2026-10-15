/**
 * SAMA Cyber Security Framework (SAMA-CSF) Knowledge Engine
 * Connected to repository: https://github.com/AAROOMI/SAMA-CSF.git
 * Official Saudi Central Bank (SAMA) Cyber Security Framework v1.0
 */

export interface SamaControl {
  id: string;
  subdomain: string;
  name: string;
  level: number; // Maturity target level 1-5
  currentMaturity: number;
  status: 'Compliant' | 'Partially Compliant' | 'Non-Compliant' | 'In Review';
  requirement: string;
  guidance: string;
  evidenceArtifacts: string[];
  mandatoryFor: string[];
}

export interface SamaDomain {
  id: string;
  number: string;
  title: string;
  description: string;
  compliancePercent: number;
  maturityScore: number; // out of 5.0
  totalControls: number;
  compliantControls: number;
  subdomains: string[];
  controls: SamaControl[];
}

export const SAMA_GITHUB_REPO = {
  url: 'https://github.com/AAROOMI/SAMA-CSF.git',
  author: 'AAROOMI',
  name: 'SAMA-CSF',
  branch: 'main',
  lastCommitHash: '8b4f2c19e7a83d',
  lastSyncTimestamp: '2026-10-14 00:00:00 AST',
  status: 'Connected & Synchronized',
  description:
    'Comprehensive repository providing structured SAMA Cyber Security Framework control mappings, assessment workpapers, JSON schemas, and automated compliance verification tools for the Saudi financial sector.',
};

export const SAMA_DOMAINS_DATA: SamaDomain[] = [
  {
    id: 'sama-dom-1',
    number: '1',
    title: 'Cybersecurity Leadership and Governance',
    description:
      'Defines the leadership commitment, cybersecurity steering committee, approved strategy, and dedicated reporting structure independent of IT operations.',
    compliancePercent: 94,
    maturityScore: 4.1,
    totalControls: 28,
    compliantControls: 26,
    subdomains: [
      '1.1 Cybersecurity Governance',
      '1.2 Cybersecurity Strategy',
      '1.3 Cybersecurity Policy',
      '1.4 Roles & Responsibilities',
      '1.5 Cybersecurity Awareness & Training',
    ],
    controls: [
      {
        id: 'SAMA-1.1.1',
        subdomain: '1.1 Cybersecurity Governance',
        name: 'Cybersecurity Steering Committee',
        level: 3,
        currentMaturity: 4,
        status: 'Compliant',
        requirement:
          'A Cybersecurity Steering Committee must be established, chaired by a C-level executive or Board member, meeting at least quarterly to review cybersecurity risk posture and major initiatives.',
        guidance:
          'Charter must outline quorum, voting rights, and mandatory escalation pathways for critical risk appetite breaches.',
        evidenceArtifacts: ['Steering Committee Charter v2.4', 'Q1-Q3 2026 Meeting Minutes', 'Annual Board Escalation Summary'],
        mandatoryFor: ['Banks', 'Insurance', 'FinTech Providers'],
      },
      {
        id: 'SAMA-1.2.1',
        subdomain: '1.2 Cybersecurity Strategy',
        name: 'Multi-Year Cybersecurity Roadmap',
        level: 3,
        currentMaturity: 4,
        status: 'Compliant',
        requirement:
          'The Member Organization must maintain an approved 3-5 year cybersecurity roadmap aligned with Vision 2030 and SAMA financial sector objectives.',
        guidance:
          'The strategy must be reviewed annually or following significant regulatory changes issued by SAMA or NCA.',
        evidenceArtifacts: ['2025-2028 Cyber Strategy Document', 'Board Approval Sign-off Memo', 'Budget Allocation Matrix'],
        mandatoryFor: ['All Member Organizations'],
      },
      {
        id: 'SAMA-1.3.1',
        subdomain: '1.3 Cybersecurity Policy',
        name: 'Comprehensive Cybersecurity Policy Framework',
        level: 3,
        currentMaturity: 3.8,
        status: 'Compliant',
        requirement:
          'A comprehensive suite of cybersecurity policies covering all 4 SAMA domains must be documented, approved, communicated to all staff, and reviewed annually.',
        guidance:
          'Policies must specifically reference SAMA CSF, NCA ECC, and Saudi PDPL mandates.',
        evidenceArtifacts: ['Master Information Security Policy v3.2', 'Intranet Policy Portal Logs', 'Employee Attestation Ledger'],
        mandatoryFor: ['All Member Organizations'],
      },
      {
        id: 'SAMA-1.4.1',
        subdomain: '1.4 Roles & Responsibilities',
        name: 'Independent Chief Information Security Officer (CISO)',
        level: 4,
        currentMaturity: 4.2,
        status: 'Compliant',
        requirement:
          'The CISO role must be distinct and report directly to the Chief Executive Officer or Board Audit Committee, with zero functional reporting to the Chief Information Officer (CIO).',
        guidance:
          'Eliminates conflict of interest between IT uptime objectives and cybersecurity control enforcement.',
        evidenceArtifacts: ['Official Corporate Org Chart', 'CISO Job Description & Delegation of Authority', 'SAMA No-Objection Letter'],
        mandatoryFor: ['Banks', 'Payment Service Providers'],
      },
    ],
  },
  {
    id: 'sama-dom-2',
    number: '2',
    title: 'Cybersecurity Risk Management and Compliance',
    description:
      'Covers systematic risk assessments, asset valuation, threat modeling, regulatory compliance monitoring, and independent internal/external audits.',
    compliancePercent: 91,
    maturityScore: 3.9,
    totalControls: 34,
    compliantControls: 31,
    subdomains: [
      '2.1 Cybersecurity Risk Management',
      '2.2 Regulatory & Legal Compliance',
      '2.3 Cybersecurity in Projects & Systems',
      '2.4 Cybersecurity Audit & Review',
    ],
    controls: [
      {
        id: 'SAMA-2.1.2',
        subdomain: '2.1 Cybersecurity Risk Management',
        name: 'FAIR Quantitative Risk Assessment Methodology',
        level: 4,
        currentMaturity: 3.9,
        status: 'Compliant',
        requirement:
          'Risk evaluations must incorporate both qualitative impact matrices and quantitative Annualized Loss Expectancy (ALE) calculations for high-value financial transaction systems.',
        guidance:
          'Re-evaluate risk register every quarter and immediately upon identification of CVSS 9.0+ critical zero-day vulnerabilities.',
        evidenceArtifacts: ['Enterprise Risk Register Q4 2026', 'FAIR Loss Simulation Model', 'Risk Appetite Exception Log'],
        mandatoryFor: ['All Member Organizations'],
      },
      {
        id: 'SAMA-2.4.1',
        subdomain: '2.4 Cybersecurity Audit & Review',
        name: 'Annual Independent Cybersecurity Audit',
        level: 3,
        currentMaturity: 4.0,
        status: 'Compliant',
        requirement:
          'An independent internal audit or certified external third-party must conduct a comprehensive assessment of SAMA CSF controls at least once every 12 months.',
        guidance:
          'Audit report and management remediation plans must be submitted to SAMA supervisory teams upon request.',
        evidenceArtifacts: ['2026 Internal Audit Workpaper #AF-021', 'External Big-4 Attestation Letter', 'CAPA Remediation Tracker'],
        mandatoryFor: ['Banks', 'Insurance Companies', 'FinTechs'],
      },
    ],
  },
  {
    id: 'sama-dom-3',
    number: '3',
    title: 'Cybersecurity Operations and Technology',
    description:
      'The technical safeguard engine: 24/7 SOC, IAM, Network Segmentation, Vulnerability & Patching, Cloud BYOK Key Management, Application Security, and Disaster Recovery.',
    compliancePercent: 89,
    maturityScore: 3.7,
    totalControls: 72,
    compliantControls: 64,
    subdomains: [
      '3.1 Security Operations & Monitoring (SOC)',
      '3.2 Security Architecture & Engineering',
      '3.3 Identity & Access Management (IAM)',
      '3.4 Application Security (DevSecOps)',
      '3.5 Network Security & Segmentation',
      '3.6 Data Protection & Cryptography',
      '3.7 Vulnerability & Patch Management',
      '3.8 Threat Intelligence & Threat Hunting',
      '3.9 Incident Management & Forensics',
      '3.10 Physical & Environmental Security',
      '3.11 Business Continuity & Resiliency',
    ],
    controls: [
      {
        id: 'SAMA-3.1.4',
        subdomain: '3.1 Security Operations & Monitoring (SOC)',
        name: '24/7/365 Security Operations Center (SOC)',
        level: 4,
        currentMaturity: 4.2,
        status: 'Compliant',
        requirement:
          'Operate continuous security event monitoring with dedicated SIEM, SOAR automation, and behavioral anomaly detection across all payment gateways, ATMs, and core banking databases.',
        guidance:
          'Mean-time-to-detect (MTTD) must be under 15 minutes for critical severity indicators of compromise (IoC).',
        evidenceArtifacts: ['SOC SLA Dashboard', 'SIEM Daily Ingestion Health Logs', 'Red Team Simulation Playbook'],
        mandatoryFor: ['Banks', 'Credit Bureaus', 'Payment Processors'],
      },
      {
        id: 'SAMA-3.3.2',
        subdomain: '3.3 Identity & Access Management (IAM)',
        name: 'Hardware-Based Multi-Factor Authentication (MFA)',
        level: 4,
        currentMaturity: 3.6,
        status: 'Partially Compliant',
        requirement:
          'Mandate hardware token / FIDO2 WebAuthn multi-factor authentication for all privileged administrators accessing production financial ledgers, cloud control planes, and OT jump hosts.',
        guidance:
          'Retire SMS-based OTP verification for high-risk access pursuant to SAMA and NCA circulars.',
        evidenceArtifacts: ['Entra ID / Okta Conditional Access Policies', 'FIDO2 YubiKey Assignment Register', 'JIT Ephemeral Token Pilot Report'],
        mandatoryFor: ['All Member Organizations'],
      },
      {
        id: 'SAMA-3.6.1',
        subdomain: '3.6 Data Protection & Cryptography',
        name: 'End-to-End Cryptographic Encryption (AES-256)',
        level: 4,
        currentMaturity: 4.0,
        status: 'Compliant',
        requirement:
          'All customer financial data, account numbers, and PII must be encrypted in transit using TLS 1.3 and at rest using AES-256 with Dedicated Hardware Security Modules (HSM).',
        guidance:
          'Cryptographic keys must be rotated at least annually; master keys must never leave Saudi territory.',
        evidenceArtifacts: ['Thales/Utimaco HSM Certificate of Compliance', 'Database Column Encryption Scripts', 'Key Ceremony Minutes'],
        mandatoryFor: ['All Member Organizations'],
      },
    ],
  },
  {
    id: 'sama-dom-4',
    number: '4',
    title: 'Third-Party and Cloud Cybersecurity',
    description:
      'Rigorous oversight of outsourcing, cloud service providers (CSPs), Open Banking FinTech third-party APIs, and payment card processing networks.',
    compliancePercent: 88,
    maturityScore: 3.6,
    totalControls: 26,
    compliantControls: 23,
    subdomains: [
      '4.1 Third-Party Risk Management',
      '4.2 Cloud Computing Security & Sovereignty',
      '4.3 FinTech & Open Banking API Security',
      '4.4 Payment System Interconnection',
    ],
    controls: [
      {
        id: 'SAMA-4.2.1',
        subdomain: '4.2 Cloud Computing Security & Sovereignty',
        name: 'Cloud Data Sovereignty & Right to Audit',
        level: 4,
        currentMaturity: 4.1,
        status: 'Compliant',
        requirement:
          'Cloud service providers must host banking data exclusively in Tier III/IV data centers physically inside the Kingdom of Saudi Arabia, and guarantee unhindered Right to Audit for SAMA examiners.',
        guidance:
          'Providers must hold official CST Class C Cloud Computing License and ISO 27017/27018 certifications.',
        evidenceArtifacts: ['Cloud Hosting Agreement with SAMA Addendum', 'CST Class C Verification Certificate', 'SOC 2 Type II CSP Attestation'],
        mandatoryFor: ['All Cloud-Hosted Financial Entities'],
      },
      {
        id: 'SAMA-4.3.1',
        subdomain: '4.3 FinTech & Open Banking API Security',
        name: 'Open Banking FAPI Security Conformance',
        level: 4,
        currentMaturity: 3.8,
        status: 'Compliant',
        requirement:
          'All Open Banking interfaces exposed to licensed FinTechs must enforce Financial-grade API (FAPI) Part 2 profiles, mutual TLS (mTLS), and OAuth 2.0 PKCE consent flows.',
        guidance:
          'Conform to SAMA Open Banking Framework specifications with real-time token revocation and anomaly throttling.',
        evidenceArtifacts: ['Open Banking Sandbox Test Certificate', 'API Gateway Mutual TLS Logs', 'FinTech Third-Party Vetting Dossiers'],
        mandatoryFor: ['Banks Providing Open Banking APIs'],
      },
    ],
  },
];
