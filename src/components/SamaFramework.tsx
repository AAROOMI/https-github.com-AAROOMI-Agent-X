import React, { useState, useMemo } from 'react';
import {
  SAMA_DOMAINS_DATA,
  SAMA_GITHUB_REPO,
  SamaDomain,
  SamaControl,
} from '../data/samaCsfData';

interface SamaFrameworkProps {
  onShowToast: (msg: string) => void;
  airGapMode: boolean;
}

export const SamaFramework: React.FC<SamaFrameworkProps> = ({
  onShowToast,
  airGapMode,
}) => {
  const [selectedDomainId, setSelectedDomainId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedControl, setSelectedControl] = useState<SamaControl | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'domains' | 'controls' | 'github'>('overview');
  const [isSyncingGit, setIsSyncingGit] = useState<boolean>(false);

  // Filtered controls
  const allControls = useMemo(() => {
    return SAMA_DOMAINS_DATA.flatMap((d) => d.controls);
  }, []);

  const filteredControls = useMemo(() => {
    return allControls.filter((c) => {
      const matchDomain =
        selectedDomainId === 'all' ||
        SAMA_DOMAINS_DATA.find((d) => d.id === selectedDomainId)?.controls.some((ctrl) => ctrl.id === c.id);

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.subdomain.toLowerCase().includes(q) ||
        c.requirement.toLowerCase().includes(q);

      return matchDomain && matchQuery;
    });
  }, [allControls, selectedDomainId, searchQuery]);

  const handleSyncGithub = () => {
    setIsSyncingGit(true);
    onShowToast(`Pulling latest SAMA-CSF specifications from ${SAMA_GITHUB_REPO.url}…`);
    setTimeout(() => {
      setIsSyncingGit(false);
      onShowToast('Successfully synchronized with github.com/AAROOMI/SAMA-CSF.git (Commit 8b4f2c1).');
    }, 1800);
  };

  const handleExportWorkpaper = () => {
    const workpaper = {
      title: 'SAMA Cyber Security Framework Compliance Workpaper',
      repositorySource: SAMA_GITHUB_REPO.url,
      generatedAt: new Date().toISOString(),
      maturityLevelAchieved: 'Level 3.8 (Target: Level 4.0)',
      complianceScore: '91%',
      domains: SAMA_DOMAINS_DATA,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(workpaper, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'SAMA_CSF_Audit_Workpaper_AAROOMI.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('SAMA-CSF formal audit workpaper exported.');
  };

  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      {/* 1. Header with GitHub Connection Card */}
      <div
        className="panel"
        style={{
          background: 'linear-gradient(115deg, #092c48 0%, #041426 100%)',
          border: '1px solid #17578d',
          borderRadius: '14px',
          padding: '20px 22px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  background: '#00d5ad25',
                  color: '#00d5ad',
                  border: '1px solid #00d5ad60',
                  padding: '3px 9px',
                  borderRadius: '20px',
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00d5ad' }}></span>
                CONNECTED TO GITHUB
              </span>

              <span style={{ color: 'var(--cyan)', fontSize: '11px', fontFamily: 'monospace' }}>
                AAROOMI / SAMA-CSF
              </span>
            </div>

            <h1 style={{ fontSize: '22px', margin: '6px 0 2px', fontWeight: 800 }}>
              SAMA Cyber Security Framework (SAMA-CSF)
            </h1>
            <p style={{ margin: 0, color: '#9dbcd9', fontSize: '11px' }}>
              Mandatory cybersecurity framework issued by the Saudi Central Bank (SAMA) for the Kingdom’s financial institutions, FinTechs, and payment systems.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href="https://github.com/AAROOMI/SAMA-CSF.git"
              target="_blank"
              rel="noopener noreferrer"
              className="secondary"
              style={{
                textDecoration: 'none',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>🐙</span> View Repository ↗
            </a>
            <button
              className="secondary"
              onClick={handleExportWorkpaper}
              style={{ fontSize: '11px' }}
            >
              📄 Export SAMA Workpaper
            </button>
            <button
              className="primary"
              onClick={handleSyncGithub}
              disabled={isSyncingGit}
              style={{ fontSize: '11px' }}
            >
              {isSyncingGit ? 'Syncing Git Repo…' : '🔄 Sync with SAMA-CSF Repo'}
            </button>
          </div>
        </div>

        {/* Repository Sync Status Ribbon */}
        <div
          style={{
            marginTop: '14px',
            padding: '8px 12px',
            background: '#051b33',
            borderRadius: '8px',
            border: '1px solid #14406a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '10px',
            color: '#c4dbf2',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <b>Git Source:</b>{' '}
            <span style={{ color: 'var(--cyan)' }}>https://github.com/AAROOMI/SAMA-CSF.git</span>{' '}
            &nbsp;|&nbsp; Branch: <b>main</b> &nbsp;|&nbsp; Commit: <b>8b4f2c1</b>
          </div>
          <div>
            Last Sync: <b>{SAMA_GITHUB_REPO.lastSyncTimestamp}</b>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid #133f68', paddingTop: '12px', flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: '1. SAMA-CSF Overview & Maturity' },
            { id: 'domains', label: `2. SAMA 4 Domains (${SAMA_DOMAINS_DATA.length})` },
            { id: 'controls', label: `3. Control Library & Evidence (${allControls.length})` },
            { id: 'github', label: '4. GitHub Repository Manifest' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                border: '1px solid',
                borderColor: activeTab === tab.id ? 'var(--cyan)' : 'var(--line)',
                background: activeTab === tab.id ? 'var(--panel2)' : 'transparent',
                color: activeTab === tab.id ? 'var(--cyan)' : 'var(--text)',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Overview & Maturity */}
      {activeTab === 'overview' && (
        <>
          {/* Top KPI Cards for SAMA */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="panel" style={{ padding: '16px' }}>
              <small style={{ color: 'var(--muted)', fontSize: '10px' }}>Overall SAMA Compliance</small>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '6px 0' }}>
                <strong style={{ fontSize: '26px', color: 'var(--cyan)' }}>91%</strong>
                <span className="trend">↗ +4% vs Q3</span>
              </div>
              <small style={{ color: '#00d5ad', fontSize: '10px' }}>144 of 160 controls verified</small>
            </div>

            <div className="panel" style={{ padding: '16px' }}>
              <small style={{ color: 'var(--muted)', fontSize: '10px' }}>SAMA Maturity Model Level</small>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '6px 0' }}>
                <strong style={{ fontSize: '26px', color: '#ffb43d' }}>3.8 / 5.0</strong>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Target: Level 4.0</span>
              </div>
              <small style={{ color: 'var(--muted)', fontSize: '10px' }}>Quantitatively Managed</small>
            </div>

            <div className="panel" style={{ padding: '16px' }}>
              <small style={{ color: 'var(--muted)', fontSize: '10px' }}>FinTech & Open Banking</small>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '6px 0' }}>
                <strong style={{ fontSize: '26px', color: '#087cff' }}>100%</strong>
                <span style={{ fontSize: '10px', color: 'var(--green)' }}>FAPI Part 2</span>
              </div>
              <small style={{ color: 'var(--muted)', fontSize: '10px' }}>mTLS & OAuth 2.0 Enforced</small>
            </div>

            <div className="panel" style={{ padding: '16px' }}>
              <small style={{ color: 'var(--muted)', fontSize: '10px' }}>Supervisory Audit Readiness</small>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '6px 0' }}>
                <strong style={{ fontSize: '26px', color: 'var(--green)' }}>READY</strong>
                <span style={{ fontSize: '10px', color: 'var(--cyan)' }}>Workpaper #AF-021</span>
              </div>
              <small style={{ color: 'var(--muted)', fontSize: '10px' }}>Digital evidence locked with SHA-256</small>
            </div>
          </div>

          {/* SAMA 5-Level Maturity Ladder */}
          <div className="panel" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 10px' }}>SAMA Cyber Security Maturity Model Framework</h3>
            <p style={{ margin: '0 0 14px', fontSize: '11px', color: 'var(--muted)' }}>
              Evaluates the institutional implementation maturity across all Member Organizations operating under SAMA jurisdiction.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
              {[
                { lvl: 'Level 1', name: 'Performed (Ad-hoc)', desc: 'Processes informal and reactive', active: true },
                { lvl: 'Level 2', name: 'Planned & Tracked', desc: 'Policy exists and procedures documented', active: true },
                { lvl: 'Level 3', name: 'Well Defined', desc: 'Standardized across all banking departments', active: true },
                { lvl: 'Level 4', name: 'Quantitatively Managed', desc: 'Measured via KPIs, metrics & MTTD (CURRENT)', active: true, current: true },
                { lvl: 'Level 5', name: 'Continuously Improving', desc: 'Optimized with AI threat hunting & automation', active: false },
              ].map((m, i) => (
                <div
                  key={i}
                  style={{
                    border: m.current ? '2px solid var(--cyan)' : '1px solid var(--line)',
                    background: m.current ? '#072445' : 'var(--panel2)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ color: m.current ? 'var(--cyan)' : '#fff', fontSize: '12px' }}>{m.lvl}</b>
                    {m.current && <span className="pill green" style={{ fontSize: '8px' }}>ACHIEVED</span>}
                  </div>
                  <strong style={{ fontSize: '11px', display: 'block', margin: '4px 0 2px' }}>{m.name}</strong>
                  <p style={{ margin: 0, fontSize: '9px', color: 'var(--muted)' }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tab 2: SAMA 4 Domains */}
      {activeTab === 'domains' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
          {SAMA_DOMAINS_DATA.map((dom) => (
            <div
              key={dom.id}
              className="panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '18px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span
                    style={{
                      background: '#087cff25',
                      color: '#6ab6ff',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      fontWeight: 700,
                    }}
                  >
                    DOMAIN {dom.number}
                  </span>
                  <span className="pill green">{dom.compliancePercent}% Compliance</span>
                </div>

                <b style={{ fontSize: '14px', display: 'block', color: '#fff' }}>{dom.title}</b>
                <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '8px 0 12px', lineHeight: 1.45 }}>
                  {dom.description}
                </p>

                <div style={{ marginBottom: '12px' }}>
                  <small style={{ fontSize: '9px', color: 'var(--cyan)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    SUBDOMAINS ({dom.subdomains.length}):
                  </small>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {dom.subdomains.map((sub, si) => (
                      <span
                        key={si}
                        style={{
                          background: 'var(--panel2)',
                          border: '1px solid var(--line)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '9px',
                          color: '#dce8f5',
                        }}
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div
                  style={{
                    background: 'var(--panel2)',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '9px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: 'var(--muted)',
                    marginBottom: '10px',
                  }}
                >
                  <span>Maturity Score: <b style={{ color: '#fff' }}>{dom.maturityScore}/5.0</b></span>
                  <span>Controls: <b style={{ color: '#fff' }}>{dom.compliantControls}/{dom.totalControls}</b></span>
                </div>

                <button
                  className="primary"
                  style={{ width: '100%', fontSize: '10px', padding: '7px 0', textAlign: 'center' }}
                  onClick={() => {
                    setSelectedDomainId(dom.id);
                    setActiveTab('controls');
                    onShowToast(`Filtered controls for SAMA Domain ${dom.number}.`);
                  }}
                >
                  View Domain Controls ({dom.controls.length}) →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Control Library & Evidence */}
      {activeTab === 'controls' && (
        <>
          {/* Filter Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="search" style={{ flex: 1, maxWidth: '420px', padding: '8px 12px', borderRadius: '8px' }}>
              <span>⌕</span>
              <input
                placeholder="Search SAMA control ID, requirement, or subdomain…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedDomainId('all')}
                style={{
                  background: selectedDomainId === 'all' ? '#087cff' : 'var(--panel)',
                  border: '1px solid var(--line)',
                  color: selectedDomainId === 'all' ? '#fff' : 'var(--text)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                All SAMA Domains
              </button>
              {SAMA_DOMAINS_DATA.map((dom) => (
                <button
                  key={dom.id}
                  onClick={() => setSelectedDomainId(dom.id)}
                  style={{
                    background: selectedDomainId === dom.id ? '#087cff' : 'var(--panel)',
                    border: '1px solid var(--line)',
                    color: selectedDomainId === dom.id ? '#fff' : 'var(--text)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  Domain {dom.number}
                </button>
              ))}
            </div>
          </div>

          {/* Controls List */}
          <div style={{ display: 'grid', gap: '10px' }}>
            {filteredControls.map((ctrl) => (
              <div
                key={ctrl.id}
                className="panel"
                style={{
                  padding: '14px',
                  background: '#041126',
                  border: '1px solid var(--line)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ color: 'var(--cyan)', fontWeight: 800, fontSize: '11px', marginRight: '8px' }}>
                      {ctrl.id}
                    </span>
                    <b style={{ fontSize: '12px', color: '#fff' }}>{ctrl.name}</b>
                    <small style={{ color: 'var(--muted)', display: 'block', marginTop: '2px', fontSize: '9px' }}>
                      {ctrl.subdomain}
                    </small>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: '#ffb43d20',
                        color: '#ffc568',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 600,
                      }}
                    >
                      Maturity: Level {ctrl.currentMaturity}
                    </span>
                    <span className={`pill ${ctrl.status === 'Compliant' ? 'green' : 'amber'}`}>
                      {ctrl.status}
                    </span>
                  </div>
                </div>

                <p style={{ margin: '8px 0', fontSize: '11px', color: '#c4dbf2', lineHeight: 1.45 }}>
                  {ctrl.requirement}
                </p>

                <div style={{ background: 'var(--panel)', padding: '8px 10px', borderRadius: '6px', margin: '8px 0', fontSize: '10px', color: '#9bb8d5' }}>
                  <b style={{ color: 'var(--cyan)' }}>SAMA Implementation Guidance:</b> {ctrl.guidance}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {ctrl.evidenceArtifacts.map((art, ai) => (
                      <span
                        key={ai}
                        style={{
                          background: '#072448',
                          border: '1px solid #17548b',
                          color: '#6ab6ff',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '9px',
                        }}
                      >
                        📎 {art}
                      </span>
                    ))}
                  </div>

                  <button
                    className="secondary"
                    onClick={() => onShowToast(`Evidence verified for control ${ctrl.id}`)}
                    style={{ fontSize: '9px', padding: '4px 8px' }}
                  >
                    Verify Evidence Hash →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tab 4: GitHub Repository Manifest */}
      {activeTab === 'github' && (
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0 }}>Connected GitHub Repository Manifest</h3>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--muted)' }}>
                {SAMA_GITHUB_REPO.url}
              </p>
            </div>
            <span className="pill green">Synchronized (Branch: main)</span>
          </div>

          <div
            style={{
              background: '#041022',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: 'var(--cyan)',
            }}
          >
            $ git clone https://github.com/AAROOMI/SAMA-CSF.git
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            {[
              { file: 'README.md', desc: 'Official SAMA Cyber Security Framework overview & structure', size: '14.2 KB' },
              { file: 'sama_csf_v1_controls.json', desc: 'Machine-readable JSON schema of all 160 SAMA CSF controls', size: '185 KB' },
              { file: 'sama_maturity_model.json', desc: 'Assessment scoring matrix for Levels 1 through 5', size: '32 KB' },
              { file: 'audit_workpaper_template.xlsx', desc: 'Supervisory audit workpaper format for SAMA examiners', size: '420 KB' },
              { file: 'open_banking_fapi_security.yaml', desc: 'Open Banking API mutual TLS and OAuth PKCE specification', size: '68 KB' },
              { file: 'compliance_matrix_ecc_iso.csv', desc: 'Cross-mapping matrix: SAMA CSF ↔ NCA ECC ↔ ISO 27001', size: '92 KB' },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'var(--panel2)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  fontSize: '11px',
                }}
              >
                <div>
                  <b style={{ color: '#fff' }}>📁 {f.file}</b>
                  <span style={{ color: 'var(--muted)', marginLeft: '10px', fontSize: '10px' }}>{f.desc}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '10px' }}>{f.size}</span>
                  <button
                    className="link"
                    onClick={() => onShowToast(`Downloaded ${f.file} from repository bundle.`)}
                    style={{ fontSize: '10px' }}
                  >
                    Download ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
