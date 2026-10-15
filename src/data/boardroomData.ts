/**
 * Virtual Boardroom Configuration & Dialogue Engine
 * Supports Voice-Enabled Multi-Agent Meetings, Turn-Taking, Live Transcripts,
 * Human Approvals, and Meeting Minutes Generation.
 */

export interface BoardroomExecutive {
  id: string;
  name: string;
  role: string;
  title: string;
  avatarColor: string;
  voiceGender: 'male';
  voicePitch: number;
  voiceRate: number;
  voiceName:
    | 'ar-XA-Chirp3-HD-Achernar'
    | 'ar-XA-Chirp3-HD-Achird'
    | 'en-US-Chirp3-HD-Fenrir'
    | 'en-US-Chirp3-HD-Charon'
    | string;
  initials: string;
  expertise: string;
  personality: string;
}

export const BOARDROOM_EXECUTIVES: BoardroomExecutive[] = [
  {
    id: 'ceo',
    name: 'Dr. Tariq Al-Ghamdi',
    role: 'CEO',
    title: 'Chief Executive Officer & Board Chair',
    avatarColor: '#0a78ff',
    voiceGender: 'male',
    voicePitch: 0.92,
    voiceRate: 0.98,
    voiceName: 'ar-XA-Chirp3-HD-Achernar',
    initials: 'TG',
    expertise: 'Corporate Strategy, Enterprise Governance, Stakeholder Accountability',
    personality: 'Decisive, strategic, focused on business impact and regulatory reputation.',
  },
  {
    id: 'ciso',
    name: 'Fahad Al-Otaibi',
    role: 'CISO',
    title: 'Chief Information Security Officer',
    avatarColor: '#ff426d',
    voiceGender: 'male',
    voicePitch: 0.95,
    voiceRate: 1.0,
    voiceName: 'ar-XA-Chirp3-HD-Achird',
    initials: 'FA',
    expertise: 'Threat Defense, NCA ECC & SAMA Compliance, Zero Trust Architecture',
    personality: 'Vigilant, technical, uncompromising on cyber controls and critical infrastructure defense.',
  },
  {
    id: 'dpo',
    name: 'Dr. Saud Al-Mansoor',
    role: 'DPO',
    title: 'Data Protection Officer',
    avatarColor: '#00d5ad',
    voiceGender: 'male',
    voicePitch: 0.94,
    voiceRate: 0.98,
    voiceName: 'ar-XA-Chirp3-HD-Achernar',
    initials: 'SM',
    expertise: 'Saudi PDPL, SDAIA Cross-Border Transfers, ISO 27701 PIMS',
    personality: 'Analytical, legal-minded, protective of citizen data privacy and statutory boundaries.',
  },
  {
    id: 'risk',
    name: 'Mansour Al-Harbi',
    role: 'RISK',
    title: 'Chief Risk Officer & Quantitative Lead',
    avatarColor: '#ffb43d',
    voiceGender: 'male',
    voicePitch: 0.9,
    voiceRate: 0.98,
    voiceName: 'ar-XA-Chirp3-HD-Achird',
    initials: 'MH',
    expertise: 'FAIR Quantitative Risk, Loss Event Frequency, Capital Allocation',
    personality: 'Pragmatic, mathematically rigorous, balances risk reduction against budget expenditure.',
  },
  {
    id: 'compliance',
    name: 'Naif Al-Zahrani',
    role: 'COMPLIANCE',
    title: 'Head of Regulatory Compliance',
    avatarColor: '#8d39ff',
    voiceGender: 'male',
    voicePitch: 0.93,
    voiceRate: 0.98,
    voiceName: 'ar-XA-Chirp3-HD-Achernar',
    initials: 'NZ',
    expertise: 'Multi-Framework Harmonization, NCA CSCC, CMA, ISO 27001 Mapping',
    personality: 'Methodical, detail-oriented, vigilant against regulatory reporting deadlines and audits.',
  },
  {
    id: 'audit',
    name: 'Khalid Al-Dosari',
    role: 'AUDIT',
    title: 'Chief Audit Executive (Internal Audit)',
    avatarColor: '#00d5f2',
    voiceGender: 'male',
    voicePitch: 0.92,
    voiceRate: 0.98,
    voiceName: 'ar-XA-Chirp3-HD-Achird',
    initials: 'KD',
    expertise: 'Independent Evidence Validation, IIA Standards, Control Effectiveness Workpapers',
    personality: 'Independent, objective, questions claims until supported by verifiable evidentiary artifacts.',
  },
  {
    id: 'cto',
    name: 'Omar Al-Khatib',
    role: 'CTO',
    title: 'Chief Technology Officer',
    avatarColor: '#e942a4',
    voiceGender: 'male',
    voicePitch: 0.96,
    voiceRate: 1.02,
    voiceName: 'ar-XA-Chirp3-HD-Achernar',
    initials: 'OK',
    expertise: 'Cloud Engineering, API Architecture, DevSecOps, Resiliency (ISO 22301)',
    personality: 'Innovative, rapid executor, emphasizes uptime, scalability, and automated testing.',
  },
  {
    id: 'cio',
    name: 'Hassan Al-Shehri',
    role: 'CIO',
    title: 'Chief Information Officer',
    avatarColor: '#368bd6',
    voiceGender: 'male',
    voicePitch: 0.92,
    voiceRate: 0.98,
    voiceName: 'ar-XA-Chirp3-HD-Achird',
    initials: 'HS',
    expertise: 'IT Operations, ERP Systems, Enterprise Data Centers, Vendor SLAs',
    personality: 'Operational realist, focuses on budget delivery, legacy modernization, and business continuity.',
  },
];

export interface TranscriptEntry {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerRole: string;
  timestamp: string;
  text: string;
  citations?: string[];
  requiresApproval?: boolean;
  approvalType?: 'Risk Acceptance' | 'Policy Approval' | 'Regulatory Submission' | 'Control Override';
  approvalId?: string;
}

export interface DecisionItem {
  id: string;
  title: string;
  proposedBy: string;
  status: 'Approved' | 'Pending Human Approval' | 'In Discussion' | 'Rejected';
  rationale: string;
  frameworkRef: string;
  timestamp: string;
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Completed';
  frameworkTarget: string;
}

export interface HumanApprovalRequest {
  id: string;
  type: 'Risk Acceptance' | 'Policy Approval' | 'Regulatory Submission' | 'Control Override';
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approver?: string;
  approvedAt?: string;
  hash: string;
  frameworkImpact: string;
}

export interface BoardroomMeetingSession {
  id: string;
  title: string;
  mode: string;
  scheduledDuration: string;
  startTime: string;
  status: 'LIVE' | 'PAUSED' | 'CONCLUDED';
  currentTopic: string;
  agenda: string[];
  initialTranscripts: TranscriptEntry[];
  initialDecisions: DecisionItem[];
  initialActions: ActionItem[];
  initialApprovals: HumanApprovalRequest[];
}

export const SAMPLE_MEETING_SESSION: BoardroomMeetingSession = {
  id: 'MTG-2026-Q4-01',
  title: 'Executive Risk Review — NCA ECC & Cloud Sovereignty Audit',
  mode: 'Executive Board Meeting',
  scheduledDuration: '45 mins',
  startTime: '10:00 AM AST',
  status: 'LIVE',
  currentTopic: 'Agenda Item 2: Multi-Factor Authentication Compliance (NCA ECC-2-1-1) and Cloud Key Sovereignty',
  agenda: [
    '1. Opening Remarks & Risk Appetite Overview (CEO)',
    '2. NCA ECC-2-1-1 Identity & FIDO2 Passkey Mandate (CISO & CTO)',
    '3. Cross-Border Data Residency under Saudi PDPL (DPO)',
    '4. FAIR Quantitative Exposure for Unpatched Cloud DB (CRO/Risk)',
    '5. Independent Workpaper Review & Finding Closure (Internal Audit)',
    '6. Action Items & Formal Sign-offs',
  ],
  initialTranscripts: [
    {
      id: 'TR-01',
      speakerId: 'ceo',
      speakerName: 'Dr. Tariq Al-Ghamdi',
      speakerRole: 'CEO',
      timestamp: '10:02:15',
      text: 'Good morning everyone. We are opening our Q4 Executive Risk Review. Our overall compliance stands at 92%, but our latest NCA supervisory audit flagged two priority gaps in privileged remote access and cross-border telemetry. Fahad, please update the table on our NCA ECC-2-1-1 remediation.',
      citations: ['NCA ECC-1:2018 §1.1.1', 'Royal Decree 37140'],
    },
    {
      id: 'TR-02',
      speakerId: 'ciso',
      speakerName: 'Fahad Al-Otaibi',
      speakerRole: 'CISO',
      timestamp: '10:03:05',
      text: 'Thank you, Dr. Tariq. As of yesterday, we deployed mandatory FIDO2 hardware passkeys for 94% of our system administrators across the Riyadh and Jeddah hybrid nodes. However, 18 legacy industrial OT bridge servers are still relying on SMS-based OTPs due to outdated firmware. We need an immediate capital allocation of 220,000 SAR to replace those legacy jump hosts before the NCA surveillance inspection next month.',
      citations: ['NCA ECC-1:2018 §2.1.1', 'NCA DCC-1:2022 §2.1'],
    },
    {
      id: 'TR-03',
      speakerId: 'audit',
      speakerName: 'Khalid Al-Dosari',
      speakerRole: 'AUDIT',
      timestamp: '10:04:18',
      text: 'I must intervene from an audit independence perspective. Internal Audit inspected the jump host logs on Friday. The current exposure cannot be remediated solely by hardware replacement if root password sharing remains unaddressed. We documented finding AF-021: six shared engineering logins were active during the maintenance window without individualized accountability.',
      citations: ['ISO 27001:2022 A.5.15', 'NCA ECC-1:2018 §2.1.3'],
    },
    {
      id: 'TR-04',
      speakerId: 'cto',
      speakerName: 'Omar Al-Khatib',
      speakerRole: 'CTO',
      timestamp: '10:05:32',
      text: 'Khalid is correct on the credential sharing. In engineering, we have already piloted ephemeral Entra ID Just-In-Time (JIT) access tokens for those OT nodes. We can enforce zero-standing privileges and decommission the shared accounts within 72 hours, without waiting for the new server hardware delivery.',
      citations: ['NIST CSF PR.AA-01', 'CIS Control 6.4'],
    },
    {
      id: 'TR-05',
      speakerId: 'dpo',
      speakerName: 'Dr. Saud Al-Mansoor',
      speakerRole: 'DPO',
      timestamp: '10:06:45',
      text: 'On the data protection front, we must ensure any ephemeral token logging complies with Saudi PDPL Article 29. If our telemetry is collected by external SaaS monitoring tools whose servers reside outside the Kingdom, we face statutory non-compliance. I reviewed our SIEM provider contract; all event metadata must be locked to the local Saudi cloud region in accordance with CST Cloud Framework Class C regulations.',
      citations: ['Saudi PDPL Art. 29', 'CST Cloud Regulations v4 §3.1', 'NCA CSCC-1:2019 §1.1'],
    },
    {
      id: 'TR-06',
      speakerId: 'risk',
      speakerName: 'Mansour Al-Harbi',
      speakerRole: 'RISK',
      timestamp: '10:08:10',
      text: 'Looking at the numbers quantitatively: our FAIR model calculates the Annualized Loss Expectancy (ALE) for an OT compromise via credential stuffing at 4.2 Million SAR. Implementing Omar’s JIT access solution reduces our probable maximum loss to under 380,000 SAR—an 91% risk reduction for near-zero capital outlay. I recommend the Board approve this treatment plan immediately.',
      citations: ['ISO 31000:2018 §6.4', 'FAIR Quantitative Taxonomy v3'],
    },
    {
      id: 'TR-07',
      speakerId: 'compliance',
      speakerName: 'Naif Al-Zahrani',
      speakerRole: 'COMPLIANCE',
      timestamp: '10:09:40',
      text: 'From a compliance standpoint, adopting the JIT ephemeral access solution elevates our NCA ECC-2-1-1 status from "In Review" directly to "Compliant", and satisfies SAMA CSF §3.2.1. However, to formally update our submission to the NCA portal, this action requires formal human sign-off from Abdulaziz Roomi as GRC Administrator.',
      citations: ['NCA ECC-1:2018 §2.1.1', 'SAMA CSF §3.2.1'],
      requiresApproval: true,
      approvalType: 'Regulatory Submission',
      approvalId: 'APR-2026-001',
    },
    {
      id: 'TR-08',
      speakerId: 'ceo',
      speakerName: 'Dr. Tariq Al-Ghamdi',
      speakerRole: 'CEO',
      timestamp: '10:10:55',
      text: 'Excellent synthesis. We have consensus: we will implement the JIT token control within 72 hours, lock SIEM telemetry strictly to Saudi national borders, and submit the compliance evidence to NCA once approved. Abdulaziz, please review the approval card on your console to authorize the submission.',
      citations: ['NCA ECC-1:2018 §1.1.1', 'Saudi PDPL Art. 29'],
    },
  ],
  initialDecisions: [
    {
      id: 'DEC-01',
      title: 'Enforce Ephemeral JIT Tokens on OT Jump Hosts within 72 Hours',
      proposedBy: 'Omar Al-Khatib (CTO) & Fahad Al-Otaibi (CISO)',
      status: 'Approved',
      rationale: 'Mitigates 4.2M SAR credential stuffing exposure without waiting for physical server replacement.',
      frameworkRef: 'NCA ECC-2-1-1 / NIST CSF PR.AA-01',
      timestamp: '10:10:55 AST',
    },
    {
      id: 'DEC-02',
      title: 'Lock SIEM & EDR Event Telemetry Exclusively to KSA Cloud Region',
      proposedBy: 'Sarah Al-Mansoor (DPO)',
      status: 'Approved',
      rationale: 'Mandatory adherence to Saudi PDPL Article 29 cross-border transfer restriction.',
      frameworkRef: 'Saudi PDPL Art. 29 / NCA CSCC §1.1',
      timestamp: '10:08:45 AST',
    },
    {
      id: 'DEC-03',
      title: 'Formal NCA Supervisory Compliance Update Submission',
      proposedBy: 'Nouf Al-Zahrani (Compliance Director)',
      status: 'Pending Human Approval',
      rationale: 'Official notification to National Cybersecurity Authority regarding control ECC-2-1-1 closure.',
      frameworkRef: 'NCA ECC-1:2018 §2.1.1',
      timestamp: '10:09:40 AST',
    },
  ],
  initialActions: [
    {
      id: 'ACT-01',
      task: 'Deploy automated ephemeral JIT access scripts to 18 OT jump servers',
      owner: 'Omar Al-Khatib (CTO)',
      dueDate: 'Oct 16, 2026',
      priority: 'Critical',
      status: 'In Progress',
      frameworkTarget: 'NCA ECC-2-1-1',
    },
    {
      id: 'ACT-02',
      task: 'Verify data egress rules blocking SIEM telemetry outside Saudi Arabia IP ranges',
      owner: 'Sarah Al-Mansoor (DPO)',
      dueDate: 'Oct 17, 2026',
      priority: 'High',
      status: 'Open',
      frameworkTarget: 'Saudi PDPL Art. 29',
    },
    {
      id: 'ACT-03',
      task: 'Re-audit finding AF-021 and produce validated workpaper for external auditors',
      owner: 'Khalid Al-Dosari (Chief Audit Executive)',
      dueDate: 'Oct 19, 2026',
      priority: 'Medium',
      status: 'Open',
      frameworkTarget: 'ISO 27001:2022 A.5.15',
    },
  ],
  initialApprovals: [
    {
      id: 'APR-2026-001',
      type: 'Regulatory Submission',
      title: 'NCA ECC-2-1-1 Compliance Evidence Filing to National Cybersecurity Authority',
      description: 'Formal regulatory filing to NCA portal confirming full enforcement of Multi-Factor Authentication and Ephemeral JIT Access on critical infrastructure jump hosts.',
      submittedBy: 'Nouf Al-Zahrani (Compliance Director)',
      submittedAt: '2026-10-13 10:09:40 UTC',
      status: 'Pending',
      hash: 'SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      frameworkImpact: 'NCA ECC-1:2018 Domain 2 (Cybersecurity Defense) - Score moves from 88% to 91%',
    },
    {
      id: 'APR-2026-002',
      type: 'Risk Acceptance',
      title: 'Temporary Residual Risk Acceptance for Industrial SCADA Maintenance Window',
      description: 'Accept temporary risk window of 48 hours while JIT scripts are deployed across operational technology segment.',
      submittedBy: 'Mansour Al-Harbi (Chief Risk Officer)',
      submittedAt: '2026-10-13 10:08:10 UTC',
      status: 'Pending',
      hash: 'SHA-256: 9e8a719c21ef88421b069d35a8286a07f0f62b8813a0279a7bc67198a2119f01',
      frameworkImpact: 'ISO 31000 / NCA ECC §5.1 (Industrial Control Systems)',
    },
  ],
};
