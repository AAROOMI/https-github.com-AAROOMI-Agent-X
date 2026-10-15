/**
 * Comprehensive Knowledge Base of Local (Saudi Arabia) & International GRC Frameworks
 * Embedded directly for Air-Gapped Network RAG retrieval & Compliance Automation.
 */

export interface ControlItem {
  id: string;
  name: string;
  domain: string;
  description: string;
  evidenceRequired: string;
  testingProcedure: string;
  citations: string[];
}

export interface Framework {
  id: string;
  code: string;
  name: string;
  category: 'Saudi National' | 'International ISO' | 'US / Global' | 'Industry Specific';
  version: string;
  authority: string;
  jurisdiction: string;
  coveragePercent: number;
  passingControls: number;
  totalControls: number;
  status: 'Compliant' | 'In Progress' | 'Under Review' | 'Gap Analysis';
  lastUpdated: string;
  officialSourceUrl: string;
  updateStatus: 'Up to Date' | 'Update Available' | 'Syncing' | 'Air-Gap Verified';
  description: string;
  domains: string[];
  controls: ControlItem[];
}

export const FRAMEWORKS_DATA: Framework[] = [
  // 1. NCA ECC (Essential Cybersecurity Controls)
  {
    id: 'nca-ecc',
    code: 'NCA ECC-1:2018',
    name: 'National Cybersecurity Authority - Essential Cybersecurity Controls',
    category: 'Saudi National',
    version: '1:2018',
    authority: 'National Cybersecurity Authority (NCA) - Kingdom of Saudi Arabia',
    jurisdiction: 'Kingdom of Saudi Arabia (Mandatory for Government & Critical Infrastructure)',
    coveragePercent: 88,
    passingControls: 100,
    totalControls: 114,
    status: 'In Progress',
    lastUpdated: '2026-09-15',
    officialSourceUrl: 'https://nca.gov.sa/en/regulations/ecc/',
    updateStatus: 'Air-Gap Verified',
    description:
      'Mandatory cybersecurity requirements for all Saudi government entities and private organizations owning or operating Critical National Infrastructures (CNI). Consists of 5 main domains, 29 subdomains, and 114 controls.',
    domains: [
      '1. Cybersecurity Governance',
      '2. Cybersecurity Defense',
      '3. Cybersecurity Resilience',
      '4. Third-Party and Cloud Computing Cybersecurity',
      '5. Industrial Control Systems (ICS) Cybersecurity',
    ],
    controls: [
      {
        id: 'ECC-1-1-1',
        name: 'Cybersecurity Strategy',
        domain: '1. Cybersecurity Governance',
        description: 'A cybersecurity strategy must be developed, approved by the head of the entity, communicated, and reviewed periodically.',
        evidenceRequired: 'Approved Cybersecurity Strategy document, Board/Steering Committee sign-off, Annual review logs.',
        testingProcedure: 'Verify approved strategy aligns with organizational objectives and Royal Decree mandates.',
        citations: ['NCA ECC-1:2018 §1.1.1', 'Royal Decree No. 37140', 'ISO 27001:2022 A.5.1'],
      },
      {
        id: 'ECC-1-2-1',
        name: 'Cybersecurity Management Structure',
        domain: '1. Cybersecurity Governance',
        description: 'A dedicated cybersecurity department must be established, reporting directly to the head of the entity, independent of IT.',
        evidenceRequired: 'Organizational chart, charter of the Cybersecurity General Directorate, independence audit.',
        testingProcedure: 'Validate organizational reporting hierarchy to ensure zero conflict of interest with CIO/IT operations.',
        citations: ['NCA ECC-1:2018 §1.2.1', 'NCA Governance Guidelines'],
      },
      {
        id: 'ECC-2-1-1',
        name: 'Identity & Access Management (IAM)',
        domain: '2. Cybersecurity Defense',
        description: 'Multi-factor authentication (MFA) must be strictly enforced for all administrative and remote access to all networks and critical systems.',
        evidenceRequired: 'IdP MFA policy configuration, RADIUS/SAML audit logs, conditional access rules.',
        testingProcedure: 'Perform sample verification of privileged accounts to confirm hardware token or authenticator app enforcement.',
        citations: ['NCA ECC-1:2018 §2.1.1', 'SAMA CSF §3.2.1', 'NIST CSF PR.AA-01'],
      },
      {
        id: 'ECC-2-3-1',
        name: 'Network Security & Segmentation',
        domain: '2. Cybersecurity Defense',
        description: 'Internal networks must be logically or physically segmented based on security classification and criticality.',
        evidenceRequired: 'Network topology diagrams, firewall rule sets, VLAN / micro-segmentation configurations.',
        testingProcedure: 'Inspect firewall ACLs and run penetration testing across trust boundaries to ensure isolation.',
        citations: ['NCA ECC-1:2018 §2.3.1', 'ISO 27001:2022 A.8.20'],
      },
      {
        id: 'ECC-3-1-1',
        name: 'Cybersecurity Incident Management',
        domain: '3. Cybersecurity Resilience',
        description: 'Formal incident management plan must be documented, tested annually, and integrated with NCA National Computer Emergency Response Center (Cert.gov.sa).',
        evidenceRequired: 'Incident response playbook, table-top exercise reports, NCA notification escalation matrix.',
        testingProcedure: 'Confirm simulated notification test to NCA within mandatory 4-hour window for Severity 1 incidents.',
        citations: ['NCA ECC-1:2018 §3.1.1', 'Saudi Royal Order 43015'],
      },
      {
        id: 'ECC-4-1-1',
        name: 'Third-Party & Cloud Computing Security',
        domain: '4. Third-Party and Cloud Computing Cybersecurity',
        description: 'Cybersecurity requirements must be embedded in all third-party and vendor contracts, including Right-to-Audit clauses.',
        evidenceRequired: 'Vendor risk assessment reports, signed NDA and cybersecurity appendices, cloud sovereignty verification.',
        testingProcedure: 'Sample top 10 vendor contracts for mandatory SLA, data localization in KSA, and audit rights.',
        citations: ['NCA ECC-1:2018 §4.1.1', 'NCA CSCC §2.1', 'CITC Cloud Regulatory Framework'],
      },
    ],
  },

  // 2. NCA CSCC (Cloud Cybersecurity Controls)
  {
    id: 'nca-cscc',
    code: 'NCA CSCC-1:2019',
    name: 'Cloud Cybersecurity Controls',
    category: 'Saudi National',
    version: '1:2019',
    authority: 'National Cybersecurity Authority (NCA)',
    jurisdiction: 'Kingdom of Saudi Arabia (Cloud Service Providers & Cloud Tenants)',
    coveragePercent: 91,
    passingControls: 32,
    totalControls: 35,
    status: 'Compliant',
    lastUpdated: '2026-08-20',
    officialSourceUrl: 'https://nca.gov.sa/en/regulations/cscc/',
    updateStatus: 'Air-Gap Verified',
    description:
      'Provides cybersecurity requirements for Cloud Service Providers (CSPs) and Cloud Service Tenants (CSTs) operating in or providing services to the Kingdom of Saudi Arabia, emphasizing data sovereignty.',
    domains: [
      'Cloud Cybersecurity Governance',
      'Cloud Defense & Multi-Tenancy Isolation',
      'Data Residency & Sovereignty in KSA',
      'Tenant Encryption Key Management (BYOK)',
    ],
    controls: [
      {
        id: 'CSCC-1-1',
        name: 'Data Sovereignty & Localization',
        domain: 'Data Residency & Sovereignty in KSA',
        description: 'All customer data, metadata, and backup snapshots must reside within data centers located physically inside Saudi borders.',
        evidenceRequired: 'Data center hosting contracts, AWS/Azure/GCP Saudi cloud region validation letters, geo-blocking logs.',
        testingProcedure: 'Verify IP subnet geolocations and storage replication boundaries are strictly restricted to sa-central-1 or equivalent.',
        citations: ['NCA CSCC-1:2019 §1.1', 'Saudi Cloud Computing Regulatory Framework CST'],
      },
      {
        id: 'CSCC-2-4',
        name: 'Tenant Encryption Key Isolation (BYOK / HYOK)',
        domain: 'Tenant Encryption Key Management (BYOK)',
        description: 'Tenants must maintain exclusive ownership of encryption keys using Dedicated Cloud HSMs with zero CSP provider access.',
        evidenceRequired: 'HSM attestation reports, KMS key policy JSON, automated key rotation schedule.',
        testingProcedure: 'Review AWS KMS / Azure Key Vault policies to ensure IAM trust blocks root cloud provider service roles.',
        citations: ['NCA CSCC-1:2019 §2.4', 'ISO 27017:2015 Clause 9.5'],
      },
    ],
  },

  // 3. NCA DCC (Data Cybersecurity Controls)
  {
    id: 'nca-dcc',
    code: 'NCA DCC-1:2022',
    name: 'Data Cybersecurity Controls',
    category: 'Saudi National',
    version: '1:2022',
    authority: 'National Cybersecurity Authority (NCA)',
    jurisdiction: 'Kingdom of Saudi Arabia',
    coveragePercent: 86,
    passingControls: 43,
    totalControls: 50,
    status: 'In Progress',
    lastUpdated: '2026-09-01',
    officialSourceUrl: 'https://nca.gov.sa/en/regulations/dcc/',
    updateStatus: 'Air-Gap Verified',
    description:
      'Dedicated controls designed to safeguard critical organizational data assets throughout their entire lifecycle: creation, storage, transit, processing, sharing, and disposal.',
    domains: [
      'Data Governance & Classification',
      'Data Protection in Transit & At Rest',
      'Data Masking, Tokenization & Leakage Prevention',
      'Cryptographic Sanitization & Disposal',
    ],
    controls: [
      {
        id: 'DCC-1-2',
        name: 'Data Classification Scheme',
        domain: 'Data Governance & Classification',
        description: 'All enterprise data assets must be tagged into 4 levels: Top Secret, Secret, Restricted, and Public.',
        evidenceRequired: 'Data Classification Policy, automated DLP tagging logs, database metadata catalogs.',
        testingProcedure: 'Validate endpoint agent DLP enforcement on file metadata tags matching "Secret" or "Top Secret".',
        citations: ['NCA DCC-1:2022 §1.2', 'Saudi National Data Management Office (NDMO) Standards'],
      },
      {
        id: 'DCC-2-3',
        name: 'Database Column-Level Encryption',
        domain: 'Data Protection in Transit & At Rest',
        description: 'Personally Identifiable Information (PII) and national identity numbers must be encrypted using AES-256 at the column or token level.',
        evidenceRequired: 'Database schema encryption configs, tokenization vault architecture, TLS 1.3 audit logs.',
        testingProcedure: 'Attempt direct SQL SELECT on production tables to confirm National ID and IBAN fields return ciphertext.',
        citations: ['NCA DCC-1:2022 §2.3', 'Saudi PDPL Art. 19'],
      },
    ],
  },

  // 4. SAMA CSF (Saudi Central Bank Cybersecurity Framework)
  {
    id: 'sama-csf',
    code: 'SAMA CSF v1.0',
    name: 'Saudi Central Bank (SAMA) Cybersecurity Framework',
    category: 'Saudi National',
    version: '1.0',
    authority: 'Saudi Central Bank (SAMA)',
    jurisdiction: 'Kingdom of Saudi Arabia (Banks, FinTechs, Insurance, Finance Companies)',
    coveragePercent: 92,
    passingControls: 147,
    totalControls: 160,
    status: 'Compliant',
    lastUpdated: '2026-07-10',
    officialSourceUrl: 'https://www.sama.gov.sa/en-US/CyberSecurity/',
    updateStatus: 'Air-Gap Verified',
    description:
      'The comprehensive regulatory cybersecurity standard established by SAMA to ensure the resilience of the Saudi banking and financial sector.',
    domains: [
      '1. Cybersecurity Leadership and Governance',
      '2. Cybersecurity Risk Management and Compliance',
      '3. Cybersecurity Operations and Technology',
      '4. Third-Party Cybersecurity',
    ],
    controls: [
      {
        id: 'SAMA-3-1-4',
        name: 'Security Operations Center (SOC) 24x7x365',
        domain: '3. Cybersecurity Operations and Technology',
        description: 'Financial institutions must operate a continuous 24/7 Security Operations Center with SIEM, SOAR, and threat hunting capabilities.',
        evidenceRequired: 'SOC shift rosters, SIEM ingestion rate metrics, mean-time-to-detect (MTTD) reports.',
        testingProcedure: 'Audit SOC alert triage SLAs for high-severity behavioral anomalies within 15 minutes.',
        citations: ['SAMA CSF §3.1.4', 'PCI-DSS v4.0 Req 10.4', 'ISO 27001:2022 A.8.16'],
      },
      {
        id: 'SAMA-4-2-1',
        name: 'FinTech Third-Party API Security',
        domain: '4. Third-Party Cybersecurity',
        description: 'All Open Banking and payment APIs exposed to third-party providers must enforce mutual TLS (mTLS), OAuth 2.0 FAPI, and rate-limiting.',
        evidenceRequired: 'API gateway configuration, mTLS client certificate logs, SAMA Open Banking sandbox conformance test.',
        testingProcedure: 'Simulate API penetration testing against payment endpoints without valid client certificates.',
        citations: ['SAMA CSF §4.2.1', 'SAMA Open Banking Framework v2.1'],
      },
    ],
  },

  // 5. Saudi PDPL (Personal Data Protection Law)
  {
    id: 'saudi-pdpl',
    code: 'Saudi PDPL (SDAIA)',
    name: 'Personal Data Protection Law & Executive Regulations',
    category: 'Saudi National',
    version: 'Royal Decree M/19 & Amended Regulations 2024',
    authority: 'Saudi Data & AI Authority (SDAIA)',
    jurisdiction: 'Kingdom of Saudi Arabia (All entities processing personal data of KSA residents)',
    coveragePercent: 87,
    passingControls: 26,
    totalControls: 30,
    status: 'In Progress',
    lastUpdated: '2026-09-28',
    officialSourceUrl: 'https://sdaia.gov.sa/en/SDAIA/about/Pages/PDPL.aspx',
    updateStatus: 'Air-Gap Verified',
    description:
      'The Kingdom’s overarching data privacy statute enacted by Royal Decree M/19, governing consent, processing, cross-border transfers, data subject rights, and statutory breach notifications within 72 hours.',
    domains: [
      'Legal Basis & Explicit Consent',
      'Data Subject Rights (Access, Correction, Erasure)',
      'Cross-Border Data Transfer Regulations',
      '72-Hour Breach Notification to SDAIA',
      'Data Protection Officer (DPO) Appointment',
    ],
    controls: [
      {
        id: 'PDPL-Art-12',
        name: 'Data Subject Right to Erasure & Destruction',
        domain: 'Data Subject Rights (Access, Correction, Erasure)',
        description: 'Data controllers must delete personal data as soon as the purpose for its collection ceases, unless statutory retention applies.',
        evidenceRequired: 'Data retention schedules, automated purge jobs in CRM/ERP, customer deletion request workflow.',
        testingProcedure: 'Execute sample customer account closure request and verify database and backup sanitization.',
        citations: ['Saudi PDPL Art. 12', 'SDAIA Executive Regulations Art. 8', 'ISO 27701:2019 §7.4.7'],
      },
      {
        id: 'PDPL-Art-29',
        name: 'Cross-Border Personal Data Transfer Authorization',
        domain: 'Cross-Border Data Transfer Regulations',
        description: 'Personal data cannot be transferred outside the Kingdom without explicit SDAIA exemption or an approved Standard Contractual Clause (SCC).',
        evidenceRequired: 'SDAIA transfer exemption approval, adequacy assessment, binding corporate rules.',
        testingProcedure: 'Inspect egress network traffic and cloud service locations to ensure no PII leaves Saudi territory without formal approval.',
        citations: ['Saudi PDPL Art. 29', 'SDAIA Transfer Regulations 1445H'],
      },
    ],
  },

  // 6. ISO 27001:2022 (Information Security Management System)
  {
    id: 'iso-27001',
    code: 'ISO/IEC 27001:2022',
    name: 'Information Security Management System (ISMS)',
    category: 'International ISO',
    version: '2022 Edition',
    authority: 'International Organization for Standardization (ISO)',
    jurisdiction: 'Global International Standard',
    coveragePercent: 96,
    passingControls: 89,
    totalControls: 93,
    status: 'Compliant',
    lastUpdated: '2026-06-15',
    officialSourceUrl: 'https://www.iso.org/standard/27001',
    updateStatus: 'Air-Gap Verified',
    description:
      'The premier global standard specifying the requirements for establishing, implementing, maintaining, and continually improving an Information Security Management System (ISMS). Includes Annex A with 93 controls in 4 themes.',
    domains: [
      'Clause 4-10: ISMS Core Requirements',
      'Theme 5: Organizational Controls (37 controls)',
      'Theme 6: People Controls (8 controls)',
      'Theme 7: Physical Controls (14 controls)',
      'Theme 8: Technological Controls (34 controls)',
    ],
    controls: [
      {
        id: 'A.5.1',
        name: 'Policies for Information Security',
        domain: 'Theme 5: Organizational Controls',
        description: 'Information security policy and topic-specific policies must be defined, approved by management, published, and communicated.',
        evidenceRequired: 'Approved Master Information Security Policy, annual re-certification records.',
        testingProcedure: 'Check employee acknowledgement logs in LMS and executive committee approval timestamps.',
        citations: ['ISO/IEC 27001:2022 A.5.1', 'NCA ECC-1:2018 §1.1.2', 'NIST CSF GV.PO-01'],
      },
      {
        id: 'A.8.8',
        name: 'Management of Technical Vulnerabilities',
        domain: 'Theme 8: Technological Controls',
        description: 'Information about technical vulnerabilities must be obtained in a timely fashion, exposure evaluated, and appropriate measures taken.',
        evidenceRequired: 'Monthly vulnerability scan reports, patch management policy, SLA remediation tracker.',
        testingProcedure: 'Verify Critical CVSS >= 9.0 patches deployed within 7 business days across external-facing assets.',
        citations: ['ISO/IEC 27001:2022 A.8.8', 'NCA ECC-2-5-1', 'CIS Control 7'],
      },
    ],
  },

  // 7. ISO 27017 & 27018 (Cloud Security & Privacy)
  {
    id: 'iso-27017-27018',
    code: 'ISO/IEC 27017 / 27018',
    name: 'Cloud Security & Protection of PII in Public Clouds',
    category: 'International ISO',
    version: '2015 / 2019',
    authority: 'ISO / IEC JTC 1/SC 27',
    jurisdiction: 'Global Cloud Computing Environments',
    coveragePercent: 94,
    passingControls: 44,
    totalControls: 47,
    status: 'Compliant',
    lastUpdated: '2026-05-18',
    officialSourceUrl: 'https://www.iso.org/standard/43757.html',
    updateStatus: 'Air-Gap Verified',
    description:
      'Codes of practice for information security controls based on ISO/IEC 27002 for cloud services and protection of Personally Identifiable Information (PII) in public clouds.',
    domains: [
      'Shared Responsibility Model Architecture',
      'Virtual Machine Hardening & Hypervisor Isolation',
      'Cloud Customer Data Segregation & Cryptographic Separation',
      'Cloud Service Decommissioning & Data Return',
    ],
    controls: [
      {
        id: 'CLD-8.1',
        name: 'Cloud Multi-Tenancy Segregation',
        domain: 'Cloud Customer Data Segregation & Cryptographic Separation',
        description: 'Tenant storage and compute workloads must be logically separated with zero possibility of cross-tenant memory leakage.',
        evidenceRequired: 'SOC 2 Type II CSP audit workpaper, hypervisor security whitepaper, container namespace audits.',
        testingProcedure: 'Review third-party auditor penetration testing results specifically addressing side-channel attacks.',
        citations: ['ISO/IEC 27017:2015 §8.1', 'NCA CSCC-2-1'],
      },
    ],
  },

  // 8. ISO 27701 (Privacy Information Management System - PIMS)
  {
    id: 'iso-27701',
    code: 'ISO/IEC 27701:2019',
    name: 'Privacy Information Management System (PIMS)',
    category: 'International ISO',
    version: '2019 Edition',
    authority: 'International Organization for Standardization (ISO)',
    jurisdiction: 'Global Privacy Standard',
    coveragePercent: 90,
    passingControls: 45,
    totalControls: 50,
    status: 'Compliant',
    lastUpdated: '2026-04-12',
    officialSourceUrl: 'https://www.iso.org/standard/71670.html',
    updateStatus: 'Air-Gap Verified',
    description:
      'Extension to ISO/IEC 27001 and ISO/IEC 27002 for privacy management within an organization, bridging technical security controls with international privacy regulations.',
    domains: [
      'PIMS Requirements Related to ISO 27001',
      'Specific Guidance for PII Controllers',
      'Specific Guidance for PII Processors',
    ],
    controls: [
      {
        id: 'PIMS-7.2.1',
        name: 'Privacy Impact Assessment (PIA / DPIA)',
        domain: 'Specific Guidance for PII Controllers',
        description: 'Organizations must conduct and document a Privacy Impact Assessment prior to deploying any high-risk data processing systems.',
        evidenceRequired: 'DPIA register, risk scoring matrix, DPO sign-off documentation.',
        testingProcedure: 'Examine new feature releases in production and confirm corresponding DPIA completed prior to launch.',
        citations: ['ISO/IEC 27701:2019 §7.2.1', 'Saudi PDPL Art. 22', 'GDPR Art. 35'],
      },
    ],
  },

  // 9. ISO 22301:2019 (Business Continuity Management System)
  {
    id: 'iso-22301',
    code: 'ISO 22301:2019',
    name: 'Business Continuity Management Systems (BCMS)',
    category: 'International ISO',
    version: '2019 Edition',
    authority: 'International Organization for Standardization (ISO)',
    jurisdiction: 'Global Resiliency Standard',
    coveragePercent: 93,
    passingControls: 38,
    totalControls: 41,
    status: 'Compliant',
    lastUpdated: '2026-06-22',
    officialSourceUrl: 'https://www.iso.org/standard/75106.html',
    updateStatus: 'Air-Gap Verified',
    description:
      'Specifies requirements to implement, maintain, and improve a management system to protect against, reduce the likelihood of the occurrence of, prepare for, respond to and recover from disruptions.',
    domains: [
      'Business Impact Analysis (BIA) & Risk Assessment',
      'Business Continuity Strategies & Recovery Plans',
      'Disaster Recovery Testing & Simulation Exercises',
      'Crisis Communication & Incident Command',
    ],
    controls: [
      {
        id: 'BCM-8.2.2',
        name: 'Business Impact Analysis (BIA)',
        domain: 'Business Impact Analysis (BIA) & Risk Assessment',
        description: 'A formal BIA must determine Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO) for all critical business functions.',
        evidenceRequired: 'BIA report, executive approved RTO/RPO matrix, dependency map.',
        testingProcedure: 'Verify tier-1 critical systems have RTO <= 4 hours and RPO <= 15 minutes validated in DR drill.',
        citations: ['ISO 22301:2019 §8.2.2', 'NCA ECC-3-2', 'SAMA CSF §3.3'],
      },
    ],
  },

  // 10. ISO 31000:2018 (Enterprise Risk Management Guidelines)
  {
    id: 'iso-31000',
    code: 'ISO 31000:2018',
    name: 'Risk Management — Guidelines',
    category: 'International ISO',
    version: '2018 Edition',
    authority: 'International Organization for Standardization (ISO)',
    jurisdiction: 'Global Risk Framework',
    coveragePercent: 95,
    passingControls: 20,
    totalControls: 21,
    status: 'Compliant',
    lastUpdated: '2026-07-04',
    officialSourceUrl: 'https://www.iso.org/standard/65694.html',
    updateStatus: 'Air-Gap Verified',
    description:
      'Provides principles, a framework, and a process for managing risk. Can be used by any organization regardless of its size, activity, or sector.',
    domains: [
      'Risk Management Principles & Leadership',
      'Risk Assessment (Identification, Analysis, Evaluation)',
      'Risk Treatment & Continual Monitoring',
    ],
    controls: [
      {
        id: 'RM-6.4',
        name: 'Quantitative & Qualitative Risk Assessment',
        domain: 'Risk Assessment (Identification, Analysis, Evaluation)',
        description: 'Risks must be evaluated against defined organizational risk appetite and tolerance thresholds.',
        evidenceRequired: 'Enterprise Risk Register, Heatmap matrix criteria, Board risk appetite statement.',
        testingProcedure: 'Check that all risks with residual score >= 8.0 have active Board-approved mitigation plans.',
        citations: ['ISO 31000:2018 §6.4', 'COSO ERM 2017', 'NIST SP 800-30'],
      },
    ],
  },

  // 11. NIST CSF 2.0
  {
    id: 'nist-csf',
    code: 'NIST CSF 2.0',
    name: 'NIST Cybersecurity Framework 2.0',
    category: 'US / Global',
    version: '2.0 (2024 Edition)',
    authority: 'National Institute of Standards and Technology (NIST)',
    jurisdiction: 'Global / United States Federal & Private Sectors',
    coveragePercent: 92,
    passingControls: 98,
    totalControls: 106,
    status: 'Compliant',
    lastUpdated: '2026-08-11',
    officialSourceUrl: 'https://www.nist.gov/cyberframework',
    updateStatus: 'Air-Gap Verified',
    description:
      'The landmark 2024 revision of the NIST Cybersecurity Framework, expanding its scope beyond critical infrastructure to all organizations and officially adding the new GOVERN function.',
    domains: ['1. GOVERN (GV)', '2. IDENTIFY (ID)', '3. PROTECT (PR)', '4. DETECT (DE)', '5. RESPOND (RS)', '6. RECOVER (RC)'],
    controls: [
      {
        id: 'GV.OC-01',
        name: 'Organizational Context & Governance',
        domain: '1. GOVERN (GV)',
        description: 'The organizational mission, stakeholder expectations, dependencies, and legal requirements are understood and inform cybersecurity risk management.',
        evidenceRequired: 'Governance charter, legal regulatory obligation register, steering committee minutes.',
        testingProcedure: 'Confirm cybersecurity posture is reviewed by the Board of Directors at least quarterly.',
        citations: ['NIST CSF 2.0 GV.OC-01', 'ISO 27001:2022 Clause 4.1'],
      },
      {
        id: 'DE.CM-01',
        name: 'Continuous Network & Asset Monitoring',
        domain: '4. DETECT (DE)',
        description: 'Networks and computing environments are monitored continuously to detect potentially adverse cybersecurity events.',
        evidenceRequired: 'NDR / EDR deployment dashboards, packet capture retention logs, automated detection alerts.',
        testingProcedure: 'Perform benign atomic red team simulation and measure time to detection across endpoints.',
        citations: ['NIST CSF 2.0 DE.CM-01', 'CIS Control 13', 'NCA ECC-2-8'],
      },
    ],
  },

  // 12. CIS Controls v8
  {
    id: 'cis-v8',
    code: 'CIS Controls v8',
    name: 'Center for Internet Security (CIS) Critical Security Controls',
    category: 'US / Global',
    version: 'v8.0',
    authority: 'Center for Internet Security (CIS)',
    jurisdiction: 'Global Technical Baselines',
    coveragePercent: 94,
    passingControls: 144,
    totalControls: 153,
    status: 'Compliant',
    lastUpdated: '2026-05-30',
    officialSourceUrl: 'https://www.cisecurity.org/controls',
    updateStatus: 'Air-Gap Verified',
    description:
      'A prioritized set of 18 critical security safeguards that mitigate the vast majority of prevalent cyber attacks against enterprise networks and cloud environments.',
    domains: [
      'Inventory and Control of Enterprise Assets (CIS 1)',
      'Data Protection (CIS 3)',
      'Secure Configuration of Hardware and Software (CIS 4)',
      'Access Control Management (CIS 6)',
      'Vulnerability Management (CIS 7)',
      'Application Software Security (CIS 16)',
    ],
    controls: [
      {
        id: 'CIS-1.1',
        name: 'Establish and Maintain Detailed Enterprise Asset Inventory',
        domain: 'Inventory and Control of Enterprise Assets (CIS 1)',
        description: 'Utilize active discovery tools to maintain an accurate, up-to-date inventory of all network-connected devices.',
        evidenceRequired: 'Automated CMDB sync logs, IP scanner daily reports, unauthorized device quarantine logs.',
        testingProcedure: 'Connect an unmanaged test VM to internal network and confirm 802.1X port security containment within 60 seconds.',
        citations: ['CIS Control 1.1', 'NCA ECC-2-2', 'ISO 27001:2022 A.8.1'],
      },
    ],
  },

  // 13. CMA Cybersecurity Regulations
  {
    id: 'cma-ksa',
    code: 'CMA Cybersecurity Guidelines',
    name: 'Capital Market Authority (CMA) Cybersecurity Regulations',
    category: 'Saudi National',
    version: 'Circular 2023/2024',
    authority: 'Capital Market Authority (CMA)',
    jurisdiction: 'Kingdom of Saudi Arabia (Capital Market Institutions, Tadawul Brokers, FinTechs)',
    coveragePercent: 89,
    passingControls: 57,
    totalControls: 64,
    status: 'Compliant',
    lastUpdated: '2026-08-05',
    officialSourceUrl: 'https://cma.org.sa/',
    updateStatus: 'Air-Gap Verified',
    description:
      'Mandatory cybersecurity requirements issued by the CMA to safeguard electronic securities trading platforms, market data integrity, and investor assets.',
    domains: [
      'Electronic Trading System Security',
      'Market Manipulation & DDoS Protection',
      'Dual-Key Authorization for Large Asset Transfers',
      'CMA Mandatory Security Audit Certification',
    ],
    controls: [
      {
        id: 'CMA-ET-02',
        name: 'Algorithmic Trading & High-Frequency Integrity',
        domain: 'Electronic Trading System Security',
        description: 'Automated trading algorithms must undergo rigorous pre-trade risk controls and circuit-breaker code reviews.',
        evidenceRequired: 'Pre-trade risk limit configs, static code analysis (SAST) reports, penetration test sign-offs.',
        testingProcedure: 'Inject synthetic erroneous order burst into staging broker engine and verify auto-throttle trigger.',
        citations: ['CMA Guidelines §4.2', 'SAMA CSF §3.4.1'],
      },
    ],
  },

  // 14. CITC / CST Cybersecurity & Cloud Regulations
  {
    id: 'citc-cst',
    code: 'CST Cloud Regulations 2024',
    name: 'Communications, Space & Technology Commission (CST) Cloud Framework',
    category: 'Saudi National',
    version: 'Edition 4',
    authority: 'Communications, Space & Technology Commission (CST / formerly CITC)',
    jurisdiction: 'Kingdom of Saudi Arabia (Telecommunications & Cloud Computing)',
    coveragePercent: 91,
    passingControls: 31,
    totalControls: 34,
    status: 'Compliant',
    lastUpdated: '2026-09-12',
    officialSourceUrl: 'https://cst.gov.sa/',
    updateStatus: 'Air-Gap Verified',
    description:
      'Regulates cloud service licensing, Class A / B / C data classifications, telecommunications network interception safeguards, and IoT cybersecurity standards in the Kingdom.',
    domains: [
      'Cloud Service License Categories (Class A, B, C)',
      'Subscriber Privacy & Lawful Intercept Standards',
      'Subsea Cable & Telecommunication Infrastructure Security',
    ],
    controls: [
      {
        id: 'CST-CLD-3',
        name: 'Cloud Service Classification Registration',
        domain: 'Cloud Service License Categories (Class A, B, C)',
        description: 'Entities storing government or critical customer data must exclusively procure services from CST Class C registered providers.',
        evidenceRequired: 'CST Class C provider certificate, procurement validation check, architecture diagrams.',
        testingProcedure: 'Cross-reference provider registration number against official CST Public Registry.',
        citations: ['CST Cloud Framework v4 §3.1', 'NCA CSCC §1.3'],
      },
    ],
  },
];

/**
 * Intelligent Regulatory Update Monitor & Sync Log
 * Simulates external web monitoring when connected, or provides air-gapped immutable version locks.
 */
export interface RegulatoryUpdateEvent {
  id: string;
  frameworkCode: string;
  frameworkName: string;
  sourceUrl: string;
  detectedDate: string;
  severity: 'Critical' | 'Major' | 'Routine' | 'Advisory';
  summary: string;
  affectedControls: string[];
  actionRequired: string;
  syncState: 'Synced' | 'Pending Review' | 'Ingested to RAG' | 'Air-Gap Archived';
}

export const REGULATORY_UPDATES: RegulatoryUpdateEvent[] = [
  {
    id: 'UPD-2026-091',
    frameworkCode: 'NCA ECC-1:2018',
    frameworkName: 'National Cybersecurity Authority',
    sourceUrl: 'https://nca.gov.sa/news/ecc-telework-amendment-2026',
    detectedDate: '2026-10-08',
    severity: 'Major',
    summary: 'NCA issued regulatory circular updating remote administrative access controls (ECC-2-1-1) mandating passkey/FIDO2 hardware tokens.',
    affectedControls: ['ECC-2-1-1', 'ECC-2-3-1'],
    actionRequired: 'Update IAM conditional access policies to retire SMS/voice OTPs in favor of FIDO2 WebAuthn keys.',
    syncState: 'Ingested to RAG',
  },
  {
    id: 'UPD-2026-088',
    frameworkCode: 'Saudi PDPL',
    frameworkName: 'SDAIA Data Privacy Office',
    sourceUrl: 'https://sdaia.gov.sa/circulars/cross-border-transfers-clarification',
    detectedDate: '2026-10-02',
    severity: 'Critical',
    summary: 'SDAIA published standard contractual clauses (SCCs) for cross-border cloud telemetry and strict penalties for unauthorized telemetry export.',
    affectedControls: ['PDPL-Art-29', 'CSCC-1-1'],
    actionRequired: 'Verify that all SIEM / EDR cloud analytics retain raw event payloads within the Saudi national boundary.',
    syncState: 'Pending Review',
  },
  {
    id: 'UPD-2026-082',
    frameworkCode: 'SAMA CSF',
    frameworkName: 'Saudi Central Bank',
    sourceUrl: 'https://sama.gov.sa/circulars/fintech-quantum-resiliency',
    detectedDate: '2026-09-24',
    severity: 'Advisory',
    summary: 'SAMA guidance regarding Post-Quantum Cryptography (PQC) transition readiness for core transaction ledgers and financial message hashing.',
    affectedControls: ['SAMA-3-1-4', 'DCC-2-3'],
    actionRequired: 'Initiate inventory of legacy RSA-2048 keys and plan hybrid PQC algorithms for 2027 roadmap.',
    syncState: 'Air-Gap Archived',
  },
  {
    id: 'UPD-2026-079',
    frameworkCode: 'NIST CSF 2.0',
    frameworkName: 'NIST Computer Security Resource Center',
    sourceUrl: 'https://csrc.nist.gov/publications/detail/csf/2.0/final',
    detectedDate: '2026-09-18',
    severity: 'Routine',
    summary: 'NIST released updated implementation examples for the GOVERN function specifically tailored for AI Agent governance.',
    affectedControls: ['GV.OC-01'],
    actionRequired: 'Incorporate Agentic AI role boundaries and human-in-the-loop signoff matrix into enterprise governance documents.',
    syncState: 'Synced',
  },
];
