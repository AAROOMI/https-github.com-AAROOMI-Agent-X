import React, { useState } from 'react';
import {
  INITIAL_ORG_PROFILE,
  INITIAL_FEATURE_FLAGS,
  INITIAL_WORKFLOWS,
  INITIAL_AUDIT_LOGS,
  OrganizationProfile,
  FeatureFlag,
  WorkflowRule,
} from '../data/configData';

interface ConfigurationCenterProps {
  onShowToast: (msg: string) => void;
  airGapMode: boolean;
  onToggleAirGap: () => void;
}

export const ConfigurationCenter: React.FC<ConfigurationCenterProps> = ({
  onShowToast,
  airGapMode,
  onToggleAirGap,
}) => {
  const [activeSection, setActiveSection] = useState<
    'profile' | 'features' | 'workflows' | 'roles' | 'security' | 'history'
  >('profile');

  const [profile, setProfile] = useState<OrganizationProfile>(INITIAL_ORG_PROFILE);
  const [features, setFeatures] = useState<FeatureFlag[]>(INITIAL_FEATURE_FLAGS);
  const [workflows, setWorkflows] = useState<WorkflowRule[]>(INITIAL_WORKFLOWS);

  const handleToggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextState = f.state === 'Enabled' ? 'Disabled' : 'Enabled';
          onShowToast(`Feature ${f.name} set to ${nextState}.`);
          return { ...f, state: nextState, lastChanged: new Date().toISOString().split('T')[0] };
        }
        return f;
      })
    );
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('Organization profile saved and validated.');
  };

  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      {/* Header Banner */}
      <div
        className="panel"
        style={{
          background: 'linear-gradient(115deg, #09264c 0%, #031126 100%)',
          border: '1px solid #144e80',
          borderRadius: '14px',
          padding: '20px 22px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: '#8d39ff25',
                  color: '#c391ff',
                  border: '1px solid #8d39ff60',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  fontSize: '10px',
                  fontWeight: 700,
                }}
              >
                ADMINISTRATION & CONFIGURATION CENTER
              </span>
              {airGapMode && (
                <span
                  style={{
                    background: '#00d5ad20',
                    color: '#00d5ad',
                    border: '1px solid #00d5ad50',
                    padding: '3px 8px',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: 600,
                  }}
                >
                  🛡 AIR-GAP ENFORCED
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '22px', margin: '6px 0 3px', fontWeight: 800 }}>
              Enterprise GRC OS Configuration
            </h1>
            <p style={{ margin: 0, color: '#a0c4e8', fontSize: '11px' }}>
              Multi-tenant settings, feature flags, approval workflows, role-based access control, and sovereign air-gap controls.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="secondary"
              onClick={() => onShowToast('Exported organization configuration manifest (JSON).')}
              style={{ fontSize: '11px' }}
            >
              📥 Export Config Manifest
            </button>
            <button
              className="primary"
              onClick={() => onShowToast('Configuration backup verified.')}
              style={{ fontSize: '11px' }}
            >
              ✓ Verify Schema
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '16px', borderTop: '1px solid #14436e', paddingTop: '12px', flexWrap: 'wrap' }}>
          {[
            { id: 'profile', label: '1. Organization Profile' },
            { id: 'features', label: `2. Feature Registry (${features.length})` },
            { id: 'workflows', label: `3. Workflows & Approvals (${workflows.length})` },
            { id: 'roles', label: '4. Roles & Permissions' },
            { id: 'security', label: '5. Air-Gap & Security' },
            { id: 'history', label: '6. Change Audit History' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              style={{
                border: '1px solid',
                borderColor: activeSection === sec.id ? 'var(--cyan)' : 'var(--line)',
                background: activeSection === sec.id ? 'var(--panel2)' : 'transparent',
                color: activeSection === sec.id ? 'var(--cyan)' : 'var(--text)',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Organization Profile */}
      {activeSection === 'profile' && (
        <div className="panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px' }}>Organization Profile & Sovereign Regulatory Anchors</h3>
          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div className="field">
              <label>Organization Name</label>
              <input
                value={profile.orgName}
                onChange={(e) => setProfile({ ...profile, orgName: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Legal Entity Type</label>
              <input
                value={profile.legalEntity}
                onChange={(e) => setProfile({ ...profile, legalEntity: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Commercial Registration (CR / Unified ID)</label>
              <input
                value={profile.commercialRegistration}
                onChange={(e) => setProfile({ ...profile, commercialRegistration: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Headquarters Location</label>
              <input
                value={profile.headquarters}
                onChange={(e) => setProfile({ ...profile, headquarters: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Primary Supervisory Authorities</label>
              <input
                value={profile.primaryRegulator}
                onChange={(e) => setProfile({ ...profile, primaryRegulator: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Sovereign Data Storage Zone</label>
              <input
                value={profile.dataLocalizationZone}
                onChange={(e) => setProfile({ ...profile, dataLocalizationZone: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="primary" type="submit">
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Section 2: Feature Registry */}
      {activeSection === 'features' && (
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0 }}>Feature Flag Enablement Registry</h3>
              <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--muted)' }}>
                Granular control over application capabilities without modifying source code.
              </p>
            </div>
            <span className="pill green">All Entitlements Active</span>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {features.map((feat) => (
              <div
                key={feat.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  background: 'var(--panel2)',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <b style={{ fontSize: '12px', color: '#fff' }}>{feat.name}</b>
                    <span
                      style={{
                        background: 'var(--panel)',
                        border: '1px solid var(--line)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        color: 'var(--cyan)',
                      }}
                    >
                      {feat.category}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 2px', fontSize: '10px', color: 'var(--muted)' }}>
                    {feat.description}
                  </p>
                  <small style={{ fontSize: '9px', color: 'var(--muted)' }}>
                    Requires: {feat.requiredRole} · Last Changed: {feat.lastChanged}
                  </small>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`pill ${feat.state === 'Enabled' ? 'green' : 'amber'}`}>
                    {feat.state}
                  </span>
                  <button
                    onClick={() => handleToggleFeature(feat.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid',
                      background: feat.state === 'Enabled' ? '#ff426d25' : '#00d5ad25',
                      color: feat.state === 'Enabled' ? '#ff7390' : '#49e5c5',
                      borderColor: feat.state === 'Enabled' ? '#ff426d60' : '#00d5ad60',
                    }}
                  >
                    {feat.state === 'Enabled' ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Workflows */}
      {activeSection === 'workflows' && (
        <div className="panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 10px' }}>Configurable Governance Workflows & SLA Rules</h3>
          <p style={{ margin: '0 0 14px', fontSize: '11px', color: 'var(--muted)' }}>
            Defines triggers, mandatory human sign-off boundaries, and statutory reporting response SLAs.
          </p>

          <div style={{ display: 'grid', gap: '10px' }}>
            {workflows.map((wf) => (
              <div
                key={wf.id}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  padding: '14px',
                  background: 'var(--panel2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: '12px', color: 'var(--cyan)' }}>
                    {wf.id}: {wf.name}
                  </b>
                  <span className="pill green">{wf.status}</span>
                </div>

                <div style={{ margin: '8px 0', fontSize: '11px', color: '#c4dbf2' }}>
                  Trigger: <b>{wf.triggerEvent}</b>
                </div>

                <div style={{ background: '#041126', padding: '8px 12px', borderRadius: '6px', margin: '8px 0' }}>
                  <small style={{ color: 'var(--muted)', display: 'block', fontSize: '9px', marginBottom: '4px' }}>
                    WORKFLOW STAGES:
                  </small>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '10px' }}>
                    {wf.steps.map((st, i) => (
                      <span key={i} style={{ color: '#fff' }}>
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)' }}>
                  <span>Mandatory Signer: <b style={{ color: '#fff' }}>{wf.mandatoryApprovalRole}</b></span>
                  <span>SLA Limit: <b style={{ color: '#ffb43d' }}>{wf.slaHours} Hours</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Roles */}
      {activeSection === 'roles' && (
        <div className="panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 10px' }}>Role-Based Access Control (RBAC) Matrix</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Boardroom Access</th>
                  <th>Can Approve Actions</th>
                  <th>Air-Gap Config</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'GRC Administrator', desc: 'Full enterprise oversight and configuration', br: 'Chair', app: 'Yes', ag: 'Yes' },
                  { name: 'CISO', desc: 'Chief Information Security Officer', br: 'Participant', app: 'Yes', ag: 'Yes' },
                  { name: 'DPO', desc: 'Data Protection Officer (SDAIA PDPL)', br: 'Participant', app: 'Yes (Privacy)', ag: 'No' },
                  { name: 'Chief Audit Executive', desc: 'Independent validation & workpapers', br: 'Participant', app: 'No (Independence)', ag: 'Audit Read' },
                  { name: 'Risk Analyst', desc: 'Threat modeling and FAIR score entry', br: 'Observer', app: 'No', ag: 'No' },
                  { name: 'External Auditor', desc: 'Third-party compliance verification', br: 'Read-only', app: 'No', ag: 'Read-only' },
                ].map((r, i) => (
                  <tr key={i}>
                    <td><b>{r.name}</b></td>
                    <td>{r.desc}</td>
                    <td><span className="pill blue">{r.br}</span></td>
                    <td><span className={`pill ${r.app.startsWith('Yes') ? 'green' : 'amber'}`}>{r.app}</span></td>
                    <td>{r.ag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 5: Security & Air-Gap */}
      {activeSection === 'security' && (
        <div className="panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 10px' }}>Air-Gap & Sovereign Cryptographic Controls</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', margin: '14px 0' }}>
            <div style={{ border: '1px solid var(--line)', borderRadius: '10px', padding: '14px', background: 'var(--panel2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: '12px' }}>Air-Gapped Network Mode</b>
                <button
                  className="primary"
                  onClick={onToggleAirGap}
                  style={{
                    fontSize: '10px',
                    padding: '6px 12px',
                    background: airGapMode ? '#00d5ad' : '#ff426d',
                    color: '#000',
                  }}
                >
                  {airGapMode ? 'ACTIVE (ISOLATED)' : 'DISABLED (CONNECTED)'}
                </button>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '10px', color: 'var(--muted)' }}>
                When active, all egress HTTP requests are blocked, and inference strictly defaults to embedded local RAG & browser speech models.
              </p>
            </div>

            <div style={{ border: '1px solid var(--line)', borderRadius: '10px', padding: '14px', background: 'var(--panel2)' }}>
              <b style={{ fontSize: '12px', color: 'var(--cyan)' }}>WORM Storage & Tamper-Proof Audit</b>
              <p style={{ margin: '8px 0 0', fontSize: '10px', color: 'var(--muted)' }}>
                Write-Once-Read-Many 365-day retention policy enforced with SHA-256 blockchain-style chaining for all boardroom minutes.
              </p>
              <span className="pill green" style={{ marginTop: '8px' }}>Active & Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* Section 6: History */}
      {activeSection === 'history' && (
        <div className="panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 10px' }}>Configuration Audit History & Rollback Logs</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Category</th>
                  <th>Action</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_AUDIT_LOGS.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.timestamp}</td>
                    <td>{log.actor}</td>
                    <td><span className="pill blue">{log.category}</span></td>
                    <td>{log.action}</td>
                    <td><span className="pill green">{log.outcome}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
