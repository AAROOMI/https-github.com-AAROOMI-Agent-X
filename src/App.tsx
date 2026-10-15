/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  PROFILE_IMAGE,
  AGENT_IMAGES,
} from './data/assets';
import {
  WORKSPACE_DATA,
  INITIAL_RISKS,
  INITIAL_TOP_RISKS,
  AGENT_DETAILS,
} from './data/workspaceData';
import { Boardroom } from './components/Boardroom';
import { FrameworkLibrary } from './components/FrameworkLibrary';
import { DashboardDesigner } from './components/DashboardDesigner';
import { ConfigurationCenter } from './components/ConfigurationCenter';
import { SamaFramework } from './components/SamaFramework';
import { AgentVoiceModal, AgentVoiceTarget } from './components/AgentVoiceModal';

export default function App() {
  // Navigation
  const [currentPage, setCurrentPage] = useState<string>('Dashboard');

  // Air-Gapped Network Mode state (Offline local models vs Cloud)
  const [airGapMode, setAirGapMode] = useState<boolean>(true);

  // Active Agent Voice Modal
  const [voiceTargetAgent, setVoiceTargetAgent] = useState<AgentVoiceTarget | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  const openVoiceSessionWithAgent = (target: AgentVoiceTarget) => {
    setVoiceTargetAgent(target);
    setIsVoiceModalOpen(true);
  };

  // Theme
  const [isLight, setIsLight] = useState<boolean>(() => {
    return localStorage.getItem('agentx_theme') === 'light';
  });

  // Search
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [riskSearch, setRiskSearch] = useState<string>('');
  const [workspaceSearch, setWorkspaceSearch] = useState<string>('');

  // Risk state
  const [risks, setRisks] = useState(INITIAL_RISKS);
  const [topRisks, setTopRisks] = useState(INITIAL_TOP_RISKS);
  const [nextRiskId, setNextRiskId] = useState<number>(6);

  // Modals & Panels
  const [isAddRiskOpen, setIsAddRiskOpen] = useState<boolean>(false);
  const [selectedAgent, setSelectedAgent] = useState<typeof AGENT_DETAILS[0] | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [previewReport, setPreviewReport] = useState<string | null>(null);

  // New Risk Form State
  const [newRiskTitle, setNewRiskTitle] = useState<string>('');
  const [newRiskCategory, setNewRiskCategory] = useState<string>('Cybersecurity');
  const [newRiskScore, setNewRiskScore] = useState<number>(6.0);

  // Period for chart
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6M');

  // Pagination
  const [riskPage, setRiskPage] = useState<number>(1);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Sync theme with document.body
  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light');
      localStorage.setItem('agentx_theme', 'light');
    } else {
      document.body.classList.remove('light');
      localStorage.setItem('agentx_theme', 'dark');
    }
  }, [isLight]);

  const toggleTheme = () => {
    setIsLight((prev) => {
      const next = !prev;
      showToast(next ? 'Light mode enabled' : 'Dark mode enabled');
      return next;
    });
  };

  const toggleAirGap = () => {
    setAirGapMode((prev) => {
      const next = !prev;
      showToast(
        next
          ? '🛡 Air-Gapped Mode Activated: External network egress blocked. Local RAG & offline models active.'
          : '☁ Connected Mode Activated: Real-time portal synchronization enabled.'
      );
      return next;
    });
  };

  // Filtered risks for bottom grid table
  const filteredRisks = useMemo(() => {
    if (!riskSearch.trim()) return risks;
    const q = riskSearch.toLowerCase();
    return risks.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [risks, riskSearch]);

  const handleAddRiskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRiskTitle.trim()) return;

    const id = `GR-${String(nextRiskId).padStart(3, '0')}`;
    const scoreVal = Number(newRiskScore) || 6.0;
    const sev = scoreVal >= 7.0 ? 'High' : scoreVal >= 4.0 ? 'Medium' : 'Low';
    const pillClass = sev === 'High' ? '' : sev === 'Medium' ? 'amber' : 'green';

    const newRiskEntry = {
      id,
      title: newRiskTitle.trim(),
      category: newRiskCategory,
      score: scoreVal,
      status: 'Open',
    };

    setRisks([newRiskEntry, ...risks]);

    const newTopEntry = {
      icon: '⚠',
      name: newRiskTitle.trim(),
      level: sev,
      score: scoreVal.toFixed(1),
      bg: sev === 'High' ? '#ff426d26' : sev === 'Medium' ? '#ffb43d22' : '#00d5ad22',
      color: sev === 'High' ? '#ff7390' : sev === 'Medium' ? '#ffb43d' : '#00d5ad',
      pillClass,
    };
    setTopRisks([newTopEntry, ...topRisks]);

    setNextRiskId(nextRiskId + 1);
    setIsAddRiskOpen(false);
    setNewRiskTitle('');
    setNewRiskCategory('Cybersecurity');
    setNewRiskScore(6.0);
    showToast(`Risk ${id} added to the register`);
  };

  // Navigation Items matching the comprehensive specifications
  const navItems = [
    { name: 'Dashboard', icon: '⌂' },
    { name: 'Boardroom', icon: '🎙', badge: 'LIVE' },
    { name: 'SAMA Framework', icon: '🏛', badge: 'v1.0' },
    { name: 'Agentic Force', icon: '✦' },
    { name: 'Frameworks', icon: '◈' },
    { name: 'Risk Register', icon: '♧' },
    { name: 'Controls', icon: '⛨' },
    { name: 'Evidence', icon: '📁' },
    { name: 'Incidents', icon: '⚠' },
    { name: 'Assessments', icon: '▣' },
    { name: 'Audit', icon: '▤' },
    { name: 'Meetings', icon: '👥' },
    { name: 'Minutes', icon: '📝' },
    { name: 'Policies & Procedures', icon: '▧' },
    { name: 'Reports', icon: '▥' },
    { name: 'Dashboard Designer', icon: '📐' },
    { name: 'Configuration', icon: '⚙' },
  ];

  // Workspace active data mapping
  const currentWorkspace =
    WORKSPACE_DATA[currentPage] ||
    (currentPage === 'Risk Register' ? WORKSPACE_DATA['Risk Management'] : null) ||
    (currentPage === 'Evidence' ? WORKSPACE_DATA['Controls'] : null) ||
    (currentPage === 'Audit' ? WORKSPACE_DATA['Audit & Findings'] : null) ||
    (currentPage === 'Meetings' ? WORKSPACE_DATA['Assessments'] : null) ||
    (currentPage === 'Minutes' ? WORKSPACE_DATA['Reports'] : null);

  // Global search dimming check
  const isPanelVisible = (content: string) => {
    if (!globalSearch.trim()) return 1;
    return content.toLowerCase().includes(globalSearch.toLowerCase()) ? 1 : 0.42;
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brandmark">X</div>
          <div>
            <div className="brandname">
              AGENT<span>X</span>
            </div>
            <div className="tagline">GRC | Cybersecurity | Compliance</div>
          </div>
        </div>

        <nav className="nav" id="nav" style={{ overflowY: 'auto', paddingRight: '4px' }}>
          {navItems.map((item) => (
            <button
              key={item.name}
              className={currentPage === item.name ? 'active' : ''}
              onClick={() => {
                setCurrentPage(item.name);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ position: 'relative' }}
            >
              <span className="ico">{item.icon}</span>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>{item.name}</span>
                {item.badge && (
                  <span
                    style={{
                      background: '#ff426d',
                      color: '#fff',
                      fontSize: '8px',
                      padding: '2px 5px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      boxShadow: '0 0 6px #ff426d',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </span>
            </button>
          ))}
        </nav>

        <div className="side-bottom">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <b>✦ Powered by Agent X</b>
            <span
              style={{
                fontSize: '9px',
                background: airGapMode ? '#00d5ad25' : '#087cff25',
                color: airGapMode ? '#00d5ad' : '#6ab6ff',
                padding: '1px 5px',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              {airGapMode ? 'AIR-GAP' : 'HYBRID'}
            </span>
          </div>
          <small>Autonomous Sovereign GRC Platform</small>
        </div>
      </aside>

      {/* Main Content Area */}
      <main>
        {/* Topbar */}
        <header className="topbar">
          <label className="search">
            ⌕{' '}
            <input
              id="globalSearch"
              placeholder="Search risks, controls, NCA ECC, ISO, SAMA, or boardroom dialog…"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </label>

          {/* Quick Status Badges in Topbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleAirGap}
              style={{
                background: airGapMode ? '#00d5ad20' : '#ffb43d20',
                color: airGapMode ? '#00d5ad' : '#ffc568',
                border: `1px solid ${airGapMode ? '#00d5ad60' : '#ffb43d60'}`,
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title="Click to toggle Air-Gapped Network Isolation"
            >
              <span>{airGapMode ? '🛡 AIR-GAP: ACTIVE' : '☁ HYBRID: ONLINE'}</span>
            </button>

            <button
              onClick={() => setCurrentPage('Boardroom')}
              style={{
                background: '#ff426d20',
                color: '#ff7390',
                border: '1px solid #ff426d60',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title="Jump into Live Virtual Boardroom Meeting"
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff426d' }}></span>
              <span>BOARDROOM LIVE</span>
            </button>
          </div>

          <div className="top-actions">
            <button
              className="iconbtn"
              id="themeToggle"
              title="Toggle light/dark mode"
              onClick={toggleTheme}
            >
              ☼ / ☾
            </button>

            <button
              className="iconbtn"
              id="notifyBtn"
              title="Notifications"
              onClick={() => setIsNotificationsOpen(true)}
            >
              ♧ <sup>3</sup>
            </button>

            <button
              className="iconbtn"
              id="settingsBtn"
              title="Settings"
              onClick={() => setCurrentPage('Configuration')}
            >
              ⚙
            </button>

            <div
              className="profile"
              onClick={() =>
                showToast('Signed in as Abdulaziz Roomi (GRC Administrator) — Saudi Sovereign Instance')
              }
              title="View profile"
            >
              <img
                className="mini"
                src={PROFILE_IMAGE}
                alt="Profile portrait"
              />
              <div>
                <b>Abdulaziz Roomi</b>
                <small>GRC Administrator</small>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>⌄</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="content">
          {currentPage === 'Dashboard' ? (
            <>
              {/* Boardroom Live Callout Banner on Dashboard */}
              <div
                style={{
                  background: 'linear-gradient(90deg, #183359 0%, #0c203b 100%)',
                  border: '1px solid #1c5f99',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>🎙</span>
                  <div>
                    <b style={{ color: '#fff', fontSize: '12px' }}>
                      Executive Risk Review is currently IN SESSION (8 AI Agents Participating)
                    </b>
                    <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10px' }}>
                      Topic: NCA ECC-2-1-1 MFA Enforcement & Cross-Border Sovereign Data Routing under Saudi PDPL
                    </small>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      openVoiceSessionWithAgent({
                        id: 'ceo',
                        name: 'Dr. Tariq Al-Ghamdi',
                        role: 'CEO & Board Chair',
                        title: 'Executive Risk Review & Board of Directors',
                        avatarColor: '#0a78ff',
                        isBoardMember: true,
                      });
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #00d5f2 0%, #087cff 100%)',
                      color: '#020b1b',
                      fontWeight: 800,
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 0 10px rgba(0, 213, 242, 0.4)',
                    }}
                    title="Speak directly with Board of Directors & Specialized AI Agents in Najdi Voice"
                  >
                    <span>🎙</span>
                    <span>Speak with Board & AI Force</span>
                  </button>
                  <button
                    className="primary"
                    onClick={() => setCurrentPage('Boardroom')}
                    style={{ fontSize: '11px', padding: '6px 14px' }}
                  >
                    Enter Virtual Boardroom →
                  </button>
                </div>
              </div>

              {/* Hero & Agents Row */}
              <section className="hero-row">
                <div className="hero">
                  <h1>
                    Good Morning, <span>Abdulaziz Roomi</span> 👋
                  </h1>
                  <p>Your GRC & Cybersecurity command center.</p>
                  <p className="quote">“Security is not a product, but a process.”</p>
                  <div className="cityline"></div>
                </div>

                <div className="agents-wrap">
                  <div className="agents-heading">
                    ✦ Agentic Workforce <small>Your specialized AI agents</small>
                  </div>
                  <div className="agents">
                    {/* Agent 1 */}
                    <div
                      className="agent"
                      onClick={() => setSelectedAgent(AGENT_DETAILS[0])}
                      title="Click to view GRC Orchestrator status"
                    >
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={AGENT_IMAGES.orchestrator} alt="GRC Orchestrator portrait" referrerPolicy="no-referrer" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openVoiceSessionWithAgent({
                              id: 'orchestrator',
                              name: 'GRC Orchestrator',
                              role: 'GRC Master Lead',
                              title: 'Policy · Risk · Compliance Orchestration',
                              avatarUrl: AGENT_IMAGES.orchestrator,
                            });
                          }}
                          style={{
                            position: 'absolute',
                            bottom: '0px',
                            right: '0px',
                            background: 'linear-gradient(135deg, #00d5f2 0%, #087cff 100%)',
                            color: '#020b1b',
                            border: '1.5px solid #fff',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '10px',
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: '0 0 8px rgba(0, 213, 242, 0.7)',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          title="تحدث مع GRC Orchestrator بالصوت البشري الطبيعي"
                        >
                          🎙
                        </button>
                      </div>
                      <div className="agent-info">
                        <b>GRC Orchestrator</b>
                        <div className="desc">Policy · Risk · Compliance</div>
                        <div className="status" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00d5ad' }} />
                          <span>Active · 🎙 Speak</span>
                        </div>
                      </div>
                    </div>

                    {/* Agent 2 */}
                    <div
                      className="agent"
                      onClick={() => setSelectedAgent(AGENT_DETAILS[1])}
                      title="Click to view Risk Intelligence Agent status"
                    >
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={AGENT_IMAGES.risk} alt="Risk Intelligence Agent portrait" referrerPolicy="no-referrer" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openVoiceSessionWithAgent({
                              id: 'risk',
                              name: 'Risk Intelligence Agent',
                              role: 'Threat Intelligence Lead',
                              title: 'Threats · FAIR Quantitative Risk Analysis',
                              avatarUrl: AGENT_IMAGES.risk,
                            });
                          }}
                          style={{
                            position: 'absolute',
                            bottom: '0px',
                            right: '0px',
                            background: 'linear-gradient(135deg, #00d5f2 0%, #087cff 100%)',
                            color: '#020b1b',
                            border: '1.5px solid #fff',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '10px',
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: '0 0 8px rgba(0, 213, 242, 0.7)',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          title="تحدث مع وكيل استخبارات المخاطر بالصوت الطبيعي"
                        >
                          🎙
                        </button>
                      </div>
                      <div className="agent-info">
                        <b>Risk Intelligence Agent</b>
                        <div className="desc">Threats · Risk Analysis</div>
                        <div className="status" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00d5ad' }} />
                          <span>Active · 🎙 Speak</span>
                        </div>
                      </div>
                    </div>

                    {/* Agent 3 */}
                    <div
                      className="agent"
                      onClick={() => setSelectedAgent(AGENT_DETAILS[2])}
                      title="Click to view Compliance Mapping Agent status"
                    >
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={AGENT_IMAGES.compliance} alt="Compliance Mapping Agent portrait" referrerPolicy="no-referrer" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openVoiceSessionWithAgent({
                              id: 'compliance',
                              name: 'Compliance Mapping Agent',
                              role: 'Regulatory Mapping Lead',
                              title: 'NCA ECC · SAMA CSF · ISO Controls',
                              avatarUrl: AGENT_IMAGES.compliance,
                            });
                          }}
                          style={{
                            position: 'absolute',
                            bottom: '0px',
                            right: '0px',
                            background: 'linear-gradient(135deg, #00d5f2 0%, #087cff 100%)',
                            color: '#020b1b',
                            border: '1.5px solid #fff',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '10px',
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: '0 0 8px rgba(0, 213, 242, 0.7)',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          title="تحدث مع وكيل مطابقة الالتزام بالصوت الطبيعي"
                        >
                          🎙
                        </button>
                      </div>
                      <div className="agent-info">
                        <b>Compliance Mapping Agent</b>
                        <div className="desc">Frameworks · Controls</div>
                        <div className="status" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00d5ad' }} />
                          <span>Active · 🎙 Speak</span>
                        </div>
                      </div>
                    </div>

                    {/* Agent 4 */}
                    <div
                      className="agent"
                      onClick={() => setSelectedAgent(AGENT_DETAILS[3])}
                      title="Click to view Control Testing Agent status"
                    >
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={AGENT_IMAGES.testing} alt="Control Testing Agent portrait" referrerPolicy="no-referrer" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openVoiceSessionWithAgent({
                              id: 'testing',
                              name: 'Control Testing Agent',
                              role: 'Automated Testing Lead',
                              title: 'Continuous Validation · Evidential Audit Trail',
                              avatarUrl: AGENT_IMAGES.testing,
                            });
                          }}
                          style={{
                            position: 'absolute',
                            bottom: '0px',
                            right: '0px',
                            background: 'linear-gradient(135deg, #00d5f2 0%, #087cff 100%)',
                            color: '#020b1b',
                            border: '1.5px solid #fff',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '10px',
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: '0 0 8px rgba(0, 213, 242, 0.7)',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          title="تحدث مع وكيل اختبار الضوابط بالصوت الطبيعي"
                        >
                          🎙
                        </button>
                      </div>
                      <div className="agent-info">
                        <b>Control Testing Agent</b>
                        <div className="desc">Validation · Evidence</div>
                        <div className="status" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00d5ad' }} />
                          <span>Active · 🎙 Speak</span>
                        </div>
                      </div>
                    </div>

                    {/* Agent 5 */}
                    <div
                      className="agent"
                      onClick={() => setSelectedAgent(AGENT_DETAILS[4])}
                      title="Click to view Incident Response Agent status"
                    >
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={AGENT_IMAGES.incident} alt="Incident Response Agent portrait" referrerPolicy="no-referrer" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openVoiceSessionWithAgent({
                              id: 'incident',
                              name: 'Incident Response Agent',
                              role: 'SOC & Triage Lead',
                              title: 'Detection · Containment · CSIRT Response',
                              avatarUrl: AGENT_IMAGES.incident,
                            });
                          }}
                          style={{
                            position: 'absolute',
                            bottom: '0px',
                            right: '0px',
                            background: 'linear-gradient(135deg, #00d5f2 0%, #087cff 100%)',
                            color: '#020b1b',
                            border: '1.5px solid #fff',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '10px',
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: '0 0 8px rgba(0, 213, 242, 0.7)',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          title="تحدث مع وكيل الاستجابة للحوادث بالصوت الطبيعي"
                        >
                          🎙
                        </button>
                      </div>
                      <div className="agent-info">
                        <b>Incident Response Agent</b>
                        <div className="desc">Detection · Response</div>
                        <div className="status" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00d5ad' }} />
                          <span>Active · 🎙 Speak</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* KPIs Row */}
              <section className="kpis">
                <div className="kpi">
                  <div className="kpi-icon teal">♢</div>
                  <div>
                    <div className="kpi-label">Overall Compliance</div>
                    <div className="kpi-value">92%</div>
                    <div className="trend">
                      ↗ +4% <span className="muted">vs. last quarter</span>
                    </div>
                  </div>
                </div>

                <div className="kpi">
                  <div className="kpi-icon red">⚠</div>
                  <div>
                    <div className="kpi-label">Open Risks</div>
                    <div className="kpi-value" id="openRiskCount">
                      {risks.filter((r) => r.status === 'Open').length}
                    </div>
                    <div className="trend" style={{ color: 'var(--red)' }}>
                      ↓ -2 <span className="muted">vs. last month</span>
                    </div>
                  </div>
                </div>

                <div className="kpi">
                  <div className="kpi-icon purple">♧</div>
                  <div>
                    <div className="kpi-label">Active Incidents</div>
                    <div className="kpi-value">2</div>
                    <div className="trend" style={{ color: '#c391ff' }}>
                      ↓ -1 <span className="muted">vs. last 7 days</span>
                    </div>
                  </div>
                </div>

                <div className="kpi">
                  <div className="kpi-icon">▣</div>
                  <div>
                    <div className="kpi-label">Policy Compliance</div>
                    <div className="kpi-value">89%</div>
                    <div className="trend">
                      ↗ +6% <span className="muted">vs. last quarter</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Grid Main */}
              <section className="grid-main">
                {/* 1. Framework Donut */}
                <article
                  className="panel framework"
                  style={{ opacity: isPanelVisible('Framework ISO 27001 NIST CSF ECC SOC 2') }}
                >
                  <div className="panel-head">
                    <h3>Compliance by Framework</h3>
                    <button className="link" onClick={() => setCurrentPage('Frameworks')}>
                      View details →
                    </button>
                  </div>
                  <div className="donut-row">
                    <div className="donut"></div>
                    <div className="legend">
                      <div>
                        <i className="dot" style={{ background: '#087cff' }}></i>
                        ISO 27001 <b>96%</b>
                      </div>
                      <div>
                        <i className="dot" style={{ background: '#ffb43d' }}></i>
                        NIST CSF <b>92%</b>
                      </div>
                      <div>
                        <i className="dot" style={{ background: '#e942a4' }}></i>
                        ECC <b>88%</b>
                      </div>
                      <div>
                        <i className="dot" style={{ background: '#8d39ff' }}></i>
                        SOC 2 <b>94%</b>
                      </div>
                      <div>
                        <i className="dot" style={{ background: '#8b98aa' }}></i>
                        Other <b>90%</b>
                      </div>
                    </div>
                  </div>
                </article>

                {/* 2. Risk Trend */}
                <article
                  className="panel risk-trend"
                  style={{ opacity: isPanelVisible('Risk Trend') }}
                >
                  <div className="panel-head">
                    <h3>Risk Trend</h3>
                    <div>
                      {['6M', '1Y', '2Y'].map((period) => (
                        <button
                          key={period}
                          className={`link period ${selectedPeriod === period ? 'active' : ''}`}
                          style={{
                            fontWeight: selectedPeriod === period ? 700 : 400,
                            textDecoration: selectedPeriod === period ? 'underline' : 'none',
                            marginRight: '6px',
                          }}
                          onClick={() => {
                            setSelectedPeriod(period);
                            showToast(`Risk trend updated to ${period} view`);
                          }}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  <svg className="chart" viewBox="0 0 260 145" preserveAspectRatio="none">
                    <g stroke="#173a5c" strokeWidth="1">
                      <path d="M24 15H250M24 45H250M24 75H250M24 105H250M24 135H250" />
                      <path d="M24 15V135M69 15V135M114 15V135M159 15V135M204 15V135M249 15V135" />
                    </g>
                    <g>
                      <text x="2" y="18">80</text>
                      <text x="2" y="48">60</text>
                      <text x="2" y="78">40</text>
                      <text x="2" y="108">20</text>
                      <text x="8" y="138">0</text>
                      <text x="23" y="144">Nov</text>
                      <text x="68" y="144">Dec</text>
                      <text x="112" y="144">Jan</text>
                      <text x="157" y="144">Feb</text>
                      <text x="202" y="144">Mar</text>
                      <text x="240" y="144">Apr</text>
                    </g>
                    <polyline
                      fill="none"
                      stroke="#ff426d"
                      strokeWidth="2.5"
                      points="24,83 48,91 69,88 92,76 114,87 137,64 159,70 182,67 204,71 226,55 249,30"
                    />
                    <polyline
                      fill="none"
                      stroke="#ffb43d"
                      strokeWidth="2.5"
                      points="24,104 48,110 69,105 92,112 114,105 137,100 159,106 182,102 204,107 226,97 249,90"
                    />
                    <polyline
                      fill="none"
                      stroke="#00d5f2"
                      strokeWidth="2.5"
                      points="24,122 48,121 69,124 92,119 114,122 137,116 159,120 182,117 204,119 226,115 249,110"
                    />
                  </svg>
                </article>

                {/* 3. Top Risks */}
                <article
                  className="panel"
                  style={{ opacity: isPanelVisible('Top Risks ' + topRisks.map((t) => t.name).join(' ')) }}
                >
                  <div className="panel-head">
                    <h3>Top Risks</h3>
                    <button className="link" onClick={() => setCurrentPage('Risk Register')}>
                      View all →
                    </button>
                  </div>
                  <div className="risk-list" id="topRisks">
                    {topRisks.slice(0, 5).map((risk, idx) => (
                      <div key={idx} className="risk-item">
                        <span
                          className="risk-ico"
                          style={{ background: risk.bg, color: risk.color }}
                        >
                          {risk.icon}
                        </span>
                        <span className="risk-name">{risk.name}</span>
                        <span className={`pill ${risk.pillClass}`}>{risk.level}</span>
                        <span className="muted">{risk.score}</span>
                      </div>
                    ))}
                  </div>
                </article>

                {/* 4. Recent Activity */}
                <article
                  className="panel"
                  style={{ opacity: isPanelVisible('Recent Activity') }}
                >
                  <div className="panel-head">
                    <h3>Recent Activity</h3>
                    <button className="link" onClick={() => setCurrentPage('Reports')}>
                      View all →
                    </button>
                  </div>
                  <div className="activity-list">
                    <div className="activity-item">
                      <span className="risk-ico">◎</span>
                      <div className="activity-copy">
                        <b>NCA circular synchronized</b>
                        <small>Passkey/FIDO2 MFA Mandate ECC-2-1-1</small>
                      </div>
                      <time>15m ago</time>
                    </div>

                    <div className="activity-item">
                      <span className="risk-ico" style={{ background: '#00d5ad22', color: '#00d5ad' }}>
                        ✓
                      </span>
                      <div className="activity-copy">
                        <b>Compliance assessment completed</b>
                        <small>ISO 27001:2022 · Access Control</small>
                      </div>
                      <time>4h ago</time>
                    </div>

                    <div className="activity-item">
                      <span className="risk-ico">▣</span>
                      <div className="activity-copy">
                        <b>Policy updated</b>
                        <small>Data Protection Policy v2.3</small>
                      </div>
                      <time>6h ago</time>
                    </div>

                    <div className="activity-item">
                      <span className="risk-ico" style={{ background: '#8d39ff22', color: '#c391ff' }}>
                        ♧
                      </span>
                      <div className="activity-copy">
                        <b>Incident reported</b>
                        <small>Suspicious Login Attempt</small>
                      </div>
                      <time>8h ago</time>
                    </div>
                  </div>
                </article>

                {/* 5. Upcoming Tasks */}
                <article
                  className="panel"
                  style={{ opacity: isPanelVisible('Upcoming Tasks') }}
                >
                  <div className="panel-head">
                    <h3>Upcoming Tasks</h3>
                    <button className="link" onClick={() => setCurrentPage('Assessments')}>
                      View all →
                    </button>
                  </div>
                  <div className="task-list">
                    <div className="task-item">
                      <span className="risk-ico">▣</span>
                      <div className="task-copy">
                        <b>Complete control assessment</b>
                        <small>NCA ECC-2-1-1 · Privilege Access</small>
                      </div>
                      <span className="task-time">in 2 days</span>
                    </div>

                    <div className="task-item">
                      <span className="risk-ico">✓</span>
                      <div className="task-copy">
                        <b>Review risk treatment plan</b>
                        <small>Risk #R-1023 (OT Jump Hosts)</small>
                      </div>
                      <span className="task-time">in 5 days</span>
                    </div>

                    <div className="task-item">
                      <span className="risk-ico" style={{ background: '#ffb43d22', color: '#ffb43d' }}>
                        ▤
                      </span>
                      <div className="task-copy">
                        <b>Prepare audit evidence</b>
                        <small>SOC 2 · CC7.2 SIEM telemetry</small>
                      </div>
                      <span className="task-time">in 6 days</span>
                    </div>

                    <div className="task-item">
                      <span className="risk-ico" style={{ background: '#8d39ff22', color: '#c391ff' }}>
                        ▣
                      </span>
                      <div className="task-copy">
                        <b>Update risk register</b>
                        <small>SAMA CSF Annual Filing</small>
                      </div>
                      <span className="task-time">in 7 days</span>
                    </div>
                  </div>
                </article>
              </section>

              {/* Bottom Grid */}
              <section className="bottom-grid">
                {/* 1. Risk Register */}
                <article className="panel">
                  <div className="panel-head">
                    <h3>Risk Register</h3>
                    <button className="primary" id="addRiskBtn" onClick={() => setIsAddRiskOpen(true)}>
                      ＋ Add Risk
                    </button>
                  </div>

                  <div className="search" style={{ maxWidth: 'none', borderRadius: '7px', padding: '8px', marginBottom: '8px' }}>
                    <span>⌕</span>
                    <input
                      id="riskSearch"
                      placeholder="Search risks…"
                      value={riskSearch}
                      onChange={(e) => setRiskSearch(e.target.value)}
                    />
                  </div>

                  <div className="table-wrap">
                    <table id="riskTable">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Risk title</th>
                          <th>Category</th>
                          <th>Score</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRisks.slice(0, 5).map((row) => {
                          const sev = row.score >= 7.0 ? 'High' : row.score >= 4.0 ? 'Medium' : 'Low';
                          const scoreClass = sev === 'High' ? 'pill' : sev === 'Medium' ? 'pill amber' : 'pill green';
                          const statusClass =
                            row.status === 'Closed' ? 'pill green' : row.status === 'In Progress' ? 'pill blue' : 'pill';
                          return (
                            <tr key={row.id}>
                              <td>{row.id}</td>
                              <td>{row.title}</td>
                              <td>{row.category}</td>
                              <td>
                                <span className={scoreClass}>{row.score.toFixed(1)}</span>
                              </td>
                              <td>
                                <span className={statusClass}>{row.status}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-foot">
                    <span id="riskTableCount">
                      Showing 1–{Math.min(5, filteredRisks.length)} of {risks.length} risks
                    </span>
                    <div className="pages">
                      <button
                        onClick={() => {
                          setRiskPage(Math.max(1, riskPage - 1));
                          showToast(`Page ${Math.max(1, riskPage - 1)} selected`);
                        }}
                      >
                        ‹
                      </button>
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          className={riskPage === num ? 'active' : ''}
                          onClick={() => {
                            setRiskPage(num);
                            showToast(`Register page ${num} selected`);
                          }}
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setRiskPage(Math.min(3, riskPage + 1));
                          showToast(`Page ${Math.min(3, riskPage + 1)} selected`);
                        }}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </article>

                {/* 2. Compliance Overview */}
                <article className="panel">
                  <div className="panel-head">
                    <h3>Compliance Overview</h3>
                    <button className="link" onClick={() => setCurrentPage('Frameworks')}>
                      View frameworks →
                    </button>
                  </div>
                  <p className="muted" style={{ fontSize: '10px', marginTop: '-5px' }}>
                    Track your compliance posture across national & global frameworks.
                  </p>

                  <div className="framework-cards">
                    <div className="framework-card">
                      <b>ISO 27001</b>
                      <strong>92%</strong>
                      <small>↗ +4%</small>
                    </div>
                    <div className="framework-card">
                      <b>NIST CSF</b>
                      <strong>92%</strong>
                      <small>↗ +3%</small>
                    </div>
                    <div className="framework-card">
                      <b>NCA ECC</b>
                      <strong>88%</strong>
                      <small>↗ +2%</small>
                    </div>
                    <div className="framework-card">
                      <b>SAMA CSF</b>
                      <strong>90%</strong>
                      <small>↗ +3%</small>
                    </div>
                  </div>

                  <div className="compliance-chart">
                    <div className="panel-head">
                      <h3>Compliance Trend</h3>
                      <span className="muted" style={{ fontSize: '9px' }}>
                        Nov — Apr
                      </span>
                    </div>
                    <svg className="chart" viewBox="0 0 360 130" preserveAspectRatio="none">
                      <g stroke="#173a5c">
                        <path d="M20 15H350M20 45H350M20 75H350M20 105H350" />
                      </g>
                      <polyline
                        fill="none"
                        stroke="#00d5f2"
                        strokeWidth="2.4"
                        points="20,94 70,78 120,74 170,61 220,58 270,45 320,38 350,29"
                      />
                      <polyline
                        fill="none"
                        stroke="#8d39ff"
                        strokeWidth="2.4"
                        points="20,105 70,87 120,83 170,72 220,67 270,61 320,49 350,45"
                      />
                      <polyline
                        fill="none"
                        stroke="#ffb43d"
                        strokeWidth="2.4"
                        points="20,113 70,100 120,92 170,87 220,77 270,75 320,67 350,59"
                      />
                      <g fill="#829bb6" fontSize="9">
                        <text x="20" y="126">Nov</text>
                        <text x="88" y="126">Dec</text>
                        <text x="155" y="126">Jan</text>
                        <text x="222" y="126">Feb</text>
                        <text x="285" y="126">Mar</text>
                        <text x="333" y="126">Apr</text>
                      </g>
                    </svg>
                  </div>
                </article>

                {/* 3. Framework Coverage */}
                <article className="panel">
                  <div className="panel-head">
                    <h3>Framework Coverage</h3>
                    <button className="link" onClick={() => setCurrentPage('Frameworks')}>
                      View details →
                    </button>
                  </div>
                  <div className="coverage">
                    <div className="coverage-row">
                      <div className="ring">
                        <span>96%</span>
                      </div>
                      <div>
                        <b>ISO 27001:2022</b>
                        <small>89/93 controls</small>
                      </div>
                      <strong>96%</strong>
                    </div>

                    <div className="coverage-row">
                      <div className="ring" style={{ background: 'conic-gradient(#087cff 0 92%, #153653 92%)' }}>
                        <span>92%</span>
                      </div>
                      <div>
                        <b>NIST CSF 2.0</b>
                        <small>98/106 controls</small>
                      </div>
                      <strong>92%</strong>
                    </div>

                    <div className="coverage-row">
                      <div className="ring" style={{ background: 'conic-gradient(#8d39ff 0 88%, #153653 88%)' }}>
                        <span>88%</span>
                      </div>
                      <div>
                        <b>NCA ECC-1:2018</b>
                        <small>100/114 controls</small>
                      </div>
                      <strong>88%</strong>
                    </div>

                    <div className="coverage-row">
                      <div className="ring" style={{ background: 'conic-gradient(#00d5ad 0 90%, #153653 90%)' }}>
                        <span>90%</span>
                      </div>
                      <div>
                        <b>SAMA CSF v1.0</b>
                        <small>147/160 controls</small>
                      </div>
                      <strong>90%</strong>
                    </div>
                  </div>
                </article>
              </section>

              {/* Footerline */}
              <div className="footerline">
                <span>
                  ✦ <b>Agent X</b> is working for you — <b>8 Boardroom Agents Active</b> &nbsp; | &nbsp; 14 Frameworks Monitored &nbsp; | &nbsp; Air-Gap Vault Active
                </span>
                <span>
                  <b>Sovereign GRC & Cybersecurity Partner — Kingdom of Saudi Arabia</b>
                </span>
              </div>
            </>
          ) : currentPage === 'Boardroom' ? (
            /* Voice-Enabled Virtual Boardroom */
            <Boardroom
              onShowToast={showToast}
              airGapMode={airGapMode}
              onOpenVoiceWithAgent={openVoiceSessionWithAgent}
            />
          ) : currentPage === 'SAMA Framework' ? (
            /* SAMA Cyber Security Framework Connected to GitHub */
            <SamaFramework onShowToast={showToast} airGapMode={airGapMode} />
          ) : currentPage === 'Frameworks' ? (
            /* Comprehensive RAG Framework Library */
            <FrameworkLibrary onShowToast={showToast} airGapMode={airGapMode} />
          ) : currentPage === 'Dashboard Designer' ? (
            /* Universal Dashboard Designer */
            <DashboardDesigner onShowToast={showToast} />
          ) : currentPage === 'Configuration' ? (
            /* Organization Configuration Center */
            <ConfigurationCenter
              onShowToast={showToast}
              airGapMode={airGapMode}
              onToggleAirGap={toggleAirGap}
            />
          ) : (
            /* Dedicated Workspace Subview */
            <section className="workspace-view active">
              {currentWorkspace ? (
                <>
                  <div className="workspace-banner">
                    <div>
                      <h1>{currentPage}</h1>
                      <p>{currentWorkspace.subtitle}</p>
                    </div>
                    <div className="workspace-actions">
                      <button
                        id="workspaceExport"
                        onClick={() => showToast(`Export prepared for ${currentPage} (JSON & CSV report)`)}
                      >
                        ↓ Export
                      </button>
                      <button
                        className="primary"
                        id="workspaceAction"
                        onClick={() => {
                          if (currentPage === 'Risk Management' || currentPage === 'Risk Register') {
                            setIsAddRiskOpen(true);
                          } else if (currentPage === 'Reports' || currentPage === 'Minutes') {
                            setPreviewReport('Executive Brief');
                          } else {
                            showToast(`${currentWorkspace.actionLabel || 'Action'} workflow ready`);
                          }
                        }}
                      >
                        {currentWorkspace.actionLabel || '＋ Create new'}
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="workspace-stats">
                    {currentWorkspace.stats.map(([label, val], idx) => (
                      <div key={idx} className="workspace-stat">
                        <small>{label}</small>
                        <strong>{val}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Workspace Table */}
                  <div className="workspace-table">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '14px',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <h2>{currentWorkspace.title}</h2>
                      <div
                        className="search"
                        style={{ maxWidth: '300px', padding: '6px 10px', borderRadius: '7px' }}
                      >
                        <span>⌕</span>
                        <input
                          placeholder={`Filter ${currentPage.toLowerCase()}…`}
                          value={workspaceSearch}
                          onChange={(e) => setWorkspaceSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            {currentWorkspace.headers.map((h, i) => (
                              <th key={i}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {currentWorkspace.rows
                            .filter((r) =>
                              !workspaceSearch.trim()
                                ? true
                                : r.some((c) => c.toLowerCase().includes(workspaceSearch.toLowerCase()))
                            )
                            .map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => {
                                  const isLast = cIdx === row.length - 1;
                                  if (isLast) {
                                    const isPositive = /resolved|closed|effective|published|connected|enabled|on track|9[0-9]%/i.test(
                                      cell
                                    );
                                    const isWarning = /progress|review|investigating|contained|8[0-9]%/i.test(
                                      cell
                                    );
                                    const isAction = cell === 'View';

                                    if (isAction) {
                                      return (
                                        <td key={cIdx}>
                                          <button
                                            className="link"
                                            onClick={() => setPreviewReport(row[0])}
                                          >
                                            View Report ↗
                                          </button>
                                        </td>
                                      );
                                    }

                                    return (
                                      <td key={cIdx}>
                                        <span
                                          className={`pill ${
                                            isPositive ? 'green' : isWarning ? 'amber' : ''
                                          }`}
                                        >
                                          {cell}
                                        </span>
                                      </td>
                                    );
                                  }
                                  return <td key={cIdx}>{cell}</td>;
                                })}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="panel" style={{ padding: '24px', textAlign: 'center' }}>
                  <h3>{currentPage} Workspace</h3>
                  <p style={{ color: 'var(--muted)' }}>Module active and synchronized with Agentic GRC OS.</p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Add Risk Modal */}
      <div className={`modal-backdrop ${isAddRiskOpen ? 'open' : ''}`} id="riskModal">
        <div className="modal">
          <h2>Add a risk</h2>
          <form id="riskForm" onSubmit={handleAddRiskSubmit}>
            <div className="field">
              <label htmlFor="riskTitle">Risk title</label>
              <input
                id="riskTitle"
                required
                placeholder="e.g. Unauthorized cloud bucket exposure"
                value={newRiskTitle}
                onChange={(e) => setNewRiskTitle(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="riskCategory">Category</label>
              <select
                id="riskCategory"
                value={newRiskCategory}
                onChange={(e) => setNewRiskCategory(e.target.value)}
              >
                <option>Cybersecurity</option>
                <option>Technology</option>
                <option>Third Party</option>
                <option>Data</option>
                <option>People</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="riskScore">Risk score (1–10)</label>
              <input
                id="riskScore"
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={newRiskScore}
                required
                onChange={(e) => setNewRiskScore(parseFloat(e.target.value) || 1)}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                id="cancelModal"
                onClick={() => setIsAddRiskOpen(false)}
              >
                Cancel
              </button>
              <button className="primary" type="submit">
                Save risk
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="modal-backdrop open">
          <div className="modal">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <img
                src={AGENT_IMAGES[selectedAgent.id as keyof typeof AGENT_IMAGES]}
                alt={selectedAgent.name}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '1px solid var(--cyan)',
                }}
              />
              <div>
                <h2 style={{ margin: 0 }}>{selectedAgent.name}</h2>
                <div style={{ color: 'var(--cyan)', fontSize: '11px', marginTop: '2px' }}>
                  {selectedAgent.role}
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--muted)', fontSize: '12px', lineHeight: 1.5 }}>
              {selectedAgent.desc}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                margin: '14px 0',
                padding: '12px',
                background: 'var(--panel)',
                borderRadius: '10px',
                border: '1px solid var(--line)',
              }}
            >
              <div>
                <small style={{ color: 'var(--muted)', display: 'block', fontSize: '9px' }}>Accuracy</small>
                <strong style={{ fontSize: '13px' }}>{selectedAgent.metrics.accuracy}</strong>
              </div>
              <div>
                <small style={{ color: 'var(--muted)', display: 'block', fontSize: '9px' }}>Latency</small>
                <strong style={{ fontSize: '13px' }}>{selectedAgent.metrics.latency}</strong>
              </div>
              <div>
                <small style={{ color: 'var(--muted)', display: 'block', fontSize: '9px' }}>Processed</small>
                <strong style={{ fontSize: '13px' }}>{selectedAgent.metrics.processed}</strong>
              </div>
            </div>

            <div style={{ margin: '14px 0' }}>
              <b style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>Active AI Workstreams:</b>
              <div style={{ display: 'grid', gap: '6px' }}>
                {selectedAgent.activeTasks.map((task, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '11px',
                      background: 'var(--panel2)',
                      padding: '7px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    <span style={{ color: 'var(--green)' }}>●</span>
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() => setSelectedAgent(null)}
              >
                Close
              </button>
              <button
                className="primary"
                onClick={() => {
                  showToast(`${selectedAgent.name} executed diagnostic check successfully.`);
                  setSelectedAgent(null);
                }}
              >
                Trigger Execution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer/Modal */}
      {isNotificationsOpen && (
        <div className="modal-backdrop open">
          <div className="modal">
            <h2>Notifications (3)</h2>
            <div style={{ display: 'grid', gap: '10px', margin: '14px 0' }}>
              {[
                { title: 'NCA ECC Domain 2 Review Overdue', time: '15m ago', sev: 'High' },
                { title: 'Simulated Phishing Campaign Completed (98.2% caught)', time: '2h ago', sev: 'Info' },
                { title: 'ISO 27001 Surveillance Audit evidence locked', time: 'Yesterday', sev: 'Medium' },
              ].map((n, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    background: 'var(--panel)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ fontSize: '11px' }}>{n.title}</b>
                    <span className={`pill ${n.sev === 'High' ? '' : n.sev === 'Medium' ? 'amber' : 'green'}`}>
                      {n.sev}
                    </span>
                  </div>
                  <small style={{ color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                    {n.time}
                  </small>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="secondary" onClick={() => setIsNotificationsOpen(false)}>
                Dismiss All
              </button>
              <button
                className="primary"
                onClick={() => {
                  showToast('All notifications marked as read.');
                  setIsNotificationsOpen(false);
                }}
              >
                Mark as read
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Template Preview Modal */}
      {previewReport && (
        <div className="modal-backdrop open">
          <div className="modal" style={{ width: 'min(760px, 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ margin: 0 }}>Report Preview: {previewReport}</h2>
              <span className="pill green">Verified Record</span>
            </div>

            <div
              style={{
                background: isLight ? '#fdfdfd' : '#040d1c',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                padding: '20px',
                color: isLight ? '#122944' : '#eaf2fc',
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                maxHeight: '60vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ borderBottom: '2px solid var(--line)', paddingBottom: '12px', marginBottom: '16px' }}>
                <small style={{ color: 'var(--muted)', letterSpacing: '0.1em', fontWeight: 700 }}>
                  AGENT X ASSURANCE REPORTING
                </small>
                <h1 style={{ fontSize: '18px', margin: '6px 0 2px' }}>
                  {previewReport}
                </h1>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '10px' }}>
                  Reporting Period: Q4 2026 · Target Organization: Saudi Enterprise Command · Signer: Abdulaziz Roomi
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ border: '1px solid var(--line)', padding: '10px', borderRadius: '8px' }}>
                  <small style={{ color: 'var(--muted)' }}>Compliance</small>
                  <strong style={{ fontSize: '16px', display: 'block', color: 'var(--cyan)' }}>92%</strong>
                </div>
                <div style={{ border: '1px solid var(--line)', padding: '10px', borderRadius: '8px' }}>
                  <small style={{ color: 'var(--muted)' }}>Controls Passing</small>
                  <strong style={{ fontSize: '16px', display: 'block' }}>44 / 49</strong>
                </div>
                <div style={{ border: '1px solid var(--line)', padding: '10px', borderRadius: '8px' }}>
                  <small style={{ color: 'var(--muted)' }}>Open Risks</small>
                  <strong style={{ fontSize: '16px', display: 'block', color: 'var(--red)' }}>7</strong>
                </div>
                <div style={{ border: '1px solid var(--line)', padding: '10px', borderRadius: '8px' }}>
                  <small style={{ color: 'var(--muted)' }}>Active Incidents</small>
                  <strong style={{ fontSize: '16px', display: 'block', color: '#c391ff' }}>2</strong>
                </div>
              </div>

              <h4 style={{ margin: '14px 0 6px', fontSize: '12px' }}>Executive Summary & Findings</h4>
              <p style={{ lineHeight: 1.6, color: isLight ? '#334e68' : '#b2c8e0' }}>
                Enterprise security controls align across <strong>NCA ECC (88%)</strong>, <strong>ISO 27001 (96%)</strong>, and <strong>SOC 2 Type II (94%)</strong>. Control testing agent validated 44 of 49 technical controls as operating effectively. High-priority risk treatment plans are underway for Phishing defense and critical system patch cadence.
              </p>

              <h4 style={{ margin: '14px 0 6px', fontSize: '12px' }}>Grounded Evidential References</h4>
              <table style={{ width: '100%', fontSize: '10px', margin: '8px 0' }}>
                <thead>
                  <tr>
                    <th>Control Ref</th>
                    <th>Requirement Title</th>
                    <th>Audit Status</th>
                    <th>Effective Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ECC-2-1-1</td>
                    <td>Access Control Governance & MFA</td>
                    <td><span className="pill green">Effective</span></td>
                    <td>98%</td>
                  </tr>
                  <tr>
                    <td>A.5.1.1</td>
                    <td>Information Security Master Policy</td>
                    <td><span className="pill green">Effective</span></td>
                    <td>100%</td>
                  </tr>
                  <tr>
                    <td>PR.AA-01</td>
                    <td>Privileged Identity Management</td>
                    <td><span className="pill amber">Needs review</span></td>
                    <td>82%</td>
                  </tr>
                  <tr>
                    <td>CC7.2</td>
                    <td>24/7 Security Event Monitoring</td>
                    <td><span className="pill green">Effective</span></td>
                    <td>96%</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ borderTop: '1px solid var(--line)', marginTop: '16px', paddingTop: '10px', fontSize: '9px', color: 'var(--muted)' }}>
                Approved by: Abdulaziz Roomi, GRC Administrator · Cryptographic Hash: SHA-256: 9b89fa5a...
              </div>
            </div>

            <div className="modal-actions">
              <button className="secondary" onClick={() => setPreviewReport(null)}>
                Close
              </button>
              <button
                className="primary"
                onClick={() => {
                  showToast(`Report '${previewReport}' exported as PDF.`);
                  setPreviewReport(null);
                }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Voice Session Modal (Natural Human Male Voice, Najdi Dialect, Custom MP3 Sample) */}
      <AgentVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        targetAgent={voiceTargetAgent}
        onShowToast={showToast}
        airGapMode={airGapMode}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast" style={{ display: 'flex' }}>
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
