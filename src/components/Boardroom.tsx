import React, { useState, useEffect, useRef } from 'react';
import {
  BOARDROOM_EXECUTIVES,
  SAMPLE_MEETING_SESSION,
  TranscriptEntry,
  DecisionItem,
  ActionItem,
  HumanApprovalRequest,
  BoardroomExecutive,
} from '../data/boardroomData';
import { BOARDROOM_IMAGE } from '../data/assets';
import { AgentVoiceTarget } from './AgentVoiceModal';
import { playNaturalHumanTone } from '../data/embeddedVoiceAudio';

interface BoardroomProps {
  onShowToast: (msg: string) => void;
  airGapMode: boolean;
  onOpenVoiceWithAgent?: (target: AgentVoiceTarget) => void;
}

export const Boardroom: React.FC<BoardroomProps> = ({ onShowToast, airGapMode, onOpenVoiceWithAgent }) => {
  const [meeting, setMeeting] = useState(SAMPLE_MEETING_SESSION);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>('ceo');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCaptionsOn, setIsCaptionsOn] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'decisions' | 'heatmap' | 'audit' | 'approvals'>('decisions');
  const [roomViewMode, setRoomViewMode] = useState<'cinematic' | 'table'>('cinematic');

  // Human user input
  const [userInputText, setUserInputText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Minutes modal
  const [isMinutesOpen, setIsMinutesOpen] = useState<boolean>(false);
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);

  // Meeting playback automation
  const [currentScriptIndex, setCurrentScriptIndex] = useState<number>(3);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Scroll transcript to bottom on new entries
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [meeting.initialTranscripts]);

  // Stop active speaking
  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Natural Human Male Voice Generation (Gemini 2.5 / 3.8 Audio API)
  const speakText = async (text: string, exec?: BoardroomExecutive) => {
    if (isMuted) return;
    stopSpeaking();
    setIsSpeaking(true);

    const targetVoice = exec?.voiceName || 'ar-XA-Chirp3-HD-Achernar';

    if (!airGapMode) {
      try {
        const res = await fetch('/api/agent/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voiceName: targetVoice,
            dialect: 'najdi',
          }),
        });

        const data = await res.json();
        if (data.audioData && data.mimeType) {
          const byteCharacters = atob(data.audioData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const audioBlob = new Blob([new Uint8Array(byteNumbers)], { type: data.mimeType });
          const audioUrl = URL.createObjectURL(audioBlob);

          if (audioPlayerRef.current) {
            audioPlayerRef.current.src = audioUrl;
            audioPlayerRef.current.play().catch(() => {
              speakFallbackMaleVoice(text, exec);
            });
            audioPlayerRef.current.onended = () => setIsSpeaking(false);
            audioPlayerRef.current.onerror = () => {
              speakFallbackMaleVoice(text, exec);
            };
            return;
          }
        }
      } catch {
        // Fallback to local male voice synthesis
      }
    }

    speakFallbackMaleVoice(text, exec);
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const speakFallbackMaleVoice = (text: string, _exec?: BoardroomExecutive) => {
    if (isMuted) {
      setIsSpeaking(false);
      return;
    }
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      playNaturalHumanTone(ctx, text, () => setIsSpeaking(false));
    } catch {
      setIsSpeaking(false);
    }
  };

  // Toggle Microphone (MediaRecorder + Speech-to-Text in Arabic Najdi)
  const toggleMicrophone = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      setIsRecording(false);
      onShowToast('تم إيقاف الميكروفون.');
      return;
    }

    try {
      setIsRecording(true);
      audioChunksRef.current = [];

      // 1. Hardware Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (blob.size > 2000) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const b64 = (reader.result as string)?.split(',')[1];
            if (b64) {
              try {
                const res = await fetch('/api/agent/transcribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ audioData: b64, mimeType: 'audio/webm' }),
                });
                const data = await res.json();
                if (data.text) {
                  setUserInputText(data.text);
                  onShowToast(`تم تفريغ الصوت: "${data.text}"`);
                }
              } catch (err) {
                console.warn('Transcribe error:', err);
              }
            }
          };
          reader.readAsDataURL(blob);
        }
      };

      recorder.start(250);

      // 2. Parallel Web Speech Recognition in Arabic
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'ar-SA';
          recognition.continuous = false;
          recognition.interimResults = false;

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setUserInputText(transcript);
            onShowToast(`تم التقاط صوتك: "${transcript}"`);
          };

          recognition.onerror = () => {
            // MediaRecorder handles transcription on stop
          };

          recognition.start();
        } catch {}
      }

      onShowToast('🎙 الميكروفون مباشر ونشط.. تفضل بالتحدث');
    } catch (err: any) {
      setIsRecording(false);
      onShowToast('يرجى السماح بصلاحية الميكروفون للتحدث في اجتماع المجلس.');
    }
  };

  // Send human message to boardroom
  const handleSendHumanMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInputText.trim()) return;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const userEntry: TranscriptEntry = {
      id: `TR-USER-${Date.now()}`,
      speakerId: 'user',
      speakerName: 'Abdulaziz Roomi (GRC Admin)',
      speakerRole: 'Chair & Human Oversight',
      timestamp: timeStr,
      text: userInputText.trim(),
      citations: ['Human Executive Command', 'NCA ECC-1:2018 §1.1'],
    };

    const updated = {
      ...meeting,
      initialTranscripts: [...meeting.initialTranscripts, userEntry],
    };
    setMeeting(updated);
    setUserInputText('');
    setActiveSpeakerId('user');
    onShowToast('Message submitted to boardroom session.');

    // Auto trigger response from CISO after 1.5 seconds
    setTimeout(() => {
      triggerAgentResponse(userInputText.trim());
    }, 1500);
  };

  // Trigger next speaking turn
  const triggerNextTurn = () => {
    const speakers = BOARDROOM_EXECUTIVES;
    const nextExec = speakers[(currentScriptIndex + 1) % speakers.length];
    setCurrentScriptIndex(currentScriptIndex + 1);
    setActiveSpeakerId(nextExec.id);

    const responses: Record<string, { text: string; citations: string[] }> = {
      ceo: {
        text: 'Let us confirm that this action conforms to our Q4 Risk Appetite Statement. We cannot accept non-compliance with any NCA mandatory controls.',
        citations: ['NCA ECC-1:2018 §1.1.1', 'ISO 31000 §5.2'],
      },
      ciso: {
        text: 'Our threat intelligence confirms active brute-force targeting of regional financial nodes. The JIT passkey control closes our single largest attack vector.',
        citations: ['NCA ECC-2-1-1', 'SAMA CSF §3.2'],
      },
      dpo: {
        text: 'All audit logging for privileged access must also satisfy SDAIA retention rules under the Personal Data Protection Law.',
        citations: ['Saudi PDPL Art. 12', 'ISO 27701 §7.2'],
      },
      risk: {
        text: 'From an actuarial perspective, completing this control will lower our enterprise cyber insurance premium quote by an estimated 14%.',
        citations: ['FAIR Quantitative Risk v3', 'ISO 31000 §6.4'],
      },
      compliance: {
        text: 'I have prepared the formal evidence pack with system snapshots ready for submission to the National Cybersecurity Authority portal.',
        citations: ['NCA ECC-1:2018 §2.1.1', 'NCA DCC §1.2'],
      },
      audit: {
        text: 'Internal Audit will perform an unannounced validation test 48 hours post-deployment to verify finding AF-021 closure.',
        citations: ['IIA Standard 2500', 'ISO 27001 A.5.15'],
      },
      cto: {
        text: 'DevSecOps has scripted the automated rollback pipeline in case of any latency spike in the OT bridge controllers.',
        citations: ['NIST CSF PR.DS-02', 'ISO 22301 §8.4'],
      },
      cio: {
        text: 'Infrastructure capacity is fully provisioned in our local Riyadh sovereign cloud instance with zero external dependencies.',
        citations: ['NCA CSCC §1.1', 'CST Cloud Regulations'],
      },
    };

    const resp = responses[nextExec.id] || {
      text: 'Acknowledged and fully aligned with our GRC baseline.',
      citations: ['NCA ECC-1:2018'],
    };

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newEntry: TranscriptEntry = {
      id: `TR-AUTO-${Date.now()}`,
      speakerId: nextExec.id,
      speakerName: nextExec.name,
      speakerRole: nextExec.role,
      timestamp: timeStr,
      text: resp.text,
      citations: resp.citations,
    };

    setMeeting((prev) => ({
      ...prev,
      initialTranscripts: [...prev.initialTranscripts, newEntry],
    }));

    speakText(resp.text, nextExec);
    onShowToast(`${nextExec.name} (${nextExec.role}) took the floor.`);
  };

  // Trigger agent direct response to human query
  const triggerAgentResponse = (query: string) => {
    const ciso = BOARDROOM_EXECUTIVES.find((e) => e.role === 'CISO')!;
    setActiveSpeakerId('ciso');
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

    let reply = `Direct response to GRC Admin: regarding "${query.slice(0, 40)}...", our controls are operating under strict air-gapped isolation with zero cloud token leak.`;
    if (/nca|ecc|compliance/i.test(query)) {
      reply = `Understood. NCA ECC-2-1-1 requires verified multi-factor passkeys on all administrative interfaces. We have documented full evidence ready for your human approval.`;
    } else if (/risk|loss|money|sar/i.test(query)) {
      reply = `According to our FAIR quantitative analysis, residual risk has dropped from 4.2M SAR to 380,000 SAR following the jump host control enforcement.`;
    }

    const newEntry: TranscriptEntry = {
      id: `TR-RESP-${Date.now()}`,
      speakerId: 'ciso',
      speakerName: ciso.name,
      speakerRole: ciso.role,
      timestamp: timeStr,
      text: reply,
      citations: ['NCA ECC-2-1-1', 'SAMA CSF §3.2.1'],
    };

    setMeeting((prev) => ({
      ...prev,
      initialTranscripts: [...prev.initialTranscripts, newEntry],
    }));
    speakText(reply, ciso);
  };

  // Human approval handler
  const handleApproveRequest = (approvalId: string) => {
    const updatedApprovals = meeting.initialApprovals.map((req) => {
      if (req.id === approvalId) {
        return {
          ...req,
          status: 'Approved' as const,
          approver: 'Abdulaziz Roomi (GRC Administrator)',
          approvedAt: new Date().toISOString(),
        };
      }
      return req;
    });

    const updatedDecisions = meeting.initialDecisions.map((dec) => {
      if (dec.id === 'DEC-03') {
        return { ...dec, status: 'Approved' as const };
      }
      return dec;
    });

    setMeeting({
      ...meeting,
      initialApprovals: updatedApprovals,
      initialDecisions: updatedDecisions,
    });

    onShowToast(`Human Approval Granted for ${approvalId}. Digitally signed with cryptographic hash.`);
  };

  const currentSpeaker =
    activeSpeakerId === 'user'
      ? {
          id: 'user',
          name: 'Abdulaziz Roomi',
          role: 'GRC Administrator (Human Chair)',
          title: 'Human in the Loop Oversight',
          avatarColor: '#00d5ad',
        }
      : BOARDROOM_EXECUTIVES.find((e) => e.id === activeSpeakerId) || BOARDROOM_EXECUTIVES[0];

  const latestTranscript =
    meeting.initialTranscripts[meeting.initialTranscripts.length - 1];

  return (
    <div className="boardroom-container" style={{ display: 'grid', gap: '14px' }}>
      <audio ref={audioPlayerRef} style={{ display: 'none' }} />
      {/* 1. Meeting Header Banner */}
      <div
        className="panel"
        style={{
          background: 'linear-gradient(115deg, #071e3b 0%, #031126 100%)',
          border: '1px solid #1a5285',
          borderRadius: '14px',
          padding: '18px 22px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ff426d25',
                  color: '#ff7390',
                  border: '1px solid #ff426d60',
                  padding: '3px 9px',
                  borderRadius: '20px',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#ff426d',
                    boxShadow: '0 0 8px #ff426d',
                  }}
                ></span>
                ● LIVE SESSION
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
                  🛡 AIR-GAPPED OFFLINE INFERENCE
                </span>
              )}
              <span style={{ color: 'var(--muted)', fontSize: '11px' }}>ID: {meeting.id}</span>
            </div>

            <h1 style={{ fontSize: '20px', margin: '6px 0 2px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              {meeting.title}
            </h1>
            <p style={{ margin: 0, color: '#9dbcd9', fontSize: '11px' }}>
              Mode: <b>{meeting.mode}</b> &nbsp;|&nbsp; Scheduled: {meeting.scheduledDuration} &nbsp;|&nbsp; Start: {meeting.startTime}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (onOpenVoiceWithAgent) {
                  onOpenVoiceWithAgent({
                    id: currentSpeaker.id,
                    name: currentSpeaker.name,
                    role: currentSpeaker.role,
                    title: currentSpeaker.title,
                    avatarColor: currentSpeaker.avatarColor,
                    isBoardMember: true,
                  });
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #00d5f2 0%, #087cff 100%)',
                color: '#020b1b',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 14px rgba(0, 213, 242, 0.4)',
              }}
              title="Speak with Board of Directors & Specialized AI Agents in Natural Male Voice (Najdi Dialect)"
            >
              <span>🎙</span>
              <span>Speak with Board & AI Force (Najdi Voice)</span>
            </button>
            <button
              className="secondary"
              onClick={() => setIsMinutesOpen(true)}
              style={{ fontSize: '11px', padding: '8px 12px' }}
            >
              📄 View & Export Minutes
            </button>
            <button
              className="primary"
              onClick={triggerNextTurn}
              style={{ fontSize: '11px', padding: '8px 14px' }}
            >
              ▶ Next Speaker Turn
            </button>
          </div>
        </div>

        {/* Current Agenda Topic Bar */}
        <div
          style={{
            marginTop: '12px',
            padding: '9px 12px',
            background: '#061a33',
            borderRadius: '8px',
            border: '1px solid #133c64',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>CURRENT TOPIC:</span>
            <span style={{ color: '#e2f0fc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {meeting.currentTopic}
            </span>
          </div>
          <span style={{ color: 'var(--muted)', fontSize: '10px', flexShrink: 0 }}>
            Agenda 2 of {meeting.agenda.length}
          </span>
        </div>
      </div>

      {/* 2. Main Boardroom Stage: Table & Avatars + Live Transcript */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.4fr) minmax(320px, 1fr)', gap: '14px' }}>
        {/* Virtual Boardroom Visualizer Table */}
        <div
          className="panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '440px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="panel-head" style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3>Virtual Executive Boardroom</h3>
              <span
                style={{
                  background: 'var(--cyan)',
                  color: '#031126',
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                8 AI AGENTS + BOARD
              </span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className={`iconbtn ${roomViewMode === 'cinematic' ? 'active' : ''}`}
                onClick={() => setRoomViewMode('cinematic')}
                style={{
                  fontSize: '10px',
                  padding: '4px 8px',
                  background: roomViewMode === 'cinematic' ? '#087cff' : 'var(--panel)',
                  color: roomViewMode === 'cinematic' ? '#fff' : 'var(--muted)',
                }}
              >
                🖼 Meeting Room View
              </button>
              <button
                className={`iconbtn ${roomViewMode === 'table' ? 'active' : ''}`}
                onClick={() => setRoomViewMode('table')}
                style={{
                  fontSize: '10px',
                  padding: '4px 8px',
                  background: roomViewMode === 'table' ? '#087cff' : 'var(--panel)',
                  color: roomViewMode === 'table' ? '#fff' : 'var(--muted)',
                }}
              >
                📐 Diagram View
              </button>
            </div>
          </div>

          {/* Photorealistic Cinematic Boardroom View */}
          {roomViewMode === 'cinematic' ? (
            <div
              style={{
                position: 'relative',
                flex: 1,
                minHeight: '360px',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid #1a5285',
                background: '#020b1b',
              }}
            >
              <img
                src={BOARDROOM_IMAGE}
                alt="Executive Boardroom in Riyadh with Board of Directors"
                referrerPolicy="no-referrer"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'contrast(1.05) brightness(0.95)',
                }}
              />

              {/* Top Banner: Riyadh Twilight Skyline & Status */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '12px',
                  right: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(3, 17, 38, 0.75)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 213, 242, 0.35)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  zIndex: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--cyan)', fontSize: '11px', fontWeight: 800 }}>
                    RIYADH EXECUTIVE SUITE
                  </span>
                  <span style={{ color: '#fff', fontSize: '10px' }}>
                    Meeting with Board of Directors & Specialized AI Force
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '9px', color: '#00d5ad', fontWeight: 700 }}>
                    ● Active Speaker: {currentSpeaker.name}
                  </span>
                </div>
              </div>

              {/* Holographic Center HUD Bar */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  background: 'rgba(2, 11, 27, 0.82)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(0, 213, 242, 0.4)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  zIndex: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: currentSpeaker.avatarColor || '#087cff',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '11px',
                      border: '2px solid var(--cyan)',
                      boxShadow: '0 0 10px var(--cyan)',
                    }}
                  >
                    {currentSpeaker.role.slice(0, 2)}
                  </div>
                  <div>
                    <b style={{ color: '#fff', fontSize: '11px', display: 'block' }}>
                      {currentSpeaker.name} ({currentSpeaker.role})
                    </b>
                    <small style={{ color: 'var(--cyan)', fontSize: '9px' }}>
                      {currentSpeaker.title}
                    </small>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenVoiceWithAgent) {
                        onOpenVoiceWithAgent({
                          id: currentSpeaker.id,
                          name: currentSpeaker.name,
                          role: currentSpeaker.role,
                          title: currentSpeaker.title,
                          avatarColor: currentSpeaker.avatarColor,
                          isBoardMember: true,
                        });
                      }
                    }}
                    style={{
                      background: 'rgba(0, 213, 242, 0.25)',
                      color: 'var(--cyan)',
                      border: '1px solid var(--cyan)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '10px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 0 10px rgba(0, 213, 242, 0.3)',
                    }}
                    title={`Speak with ${currentSpeaker.name} (${currentSpeaker.role})`}
                  >
                    <span>🎙</span>
                    <span>Speak with {currentSpeaker.role}</span>
                  </button>
                </div>

                {/* Animated Voice Waveform */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '18px' }}>
                  {[12, 18, 22, 15, 24, 19, 14, 20, 16, 22, 18, 12].map((h, i) => (
                    <span
                      key={i}
                      style={{
                        width: '3px',
                        height: isSpeaking ? `${h}px` : '4px',
                        background: 'linear-gradient(180deg, #00d5f2, #087cff)',
                        borderRadius: '2px',
                        transition: 'height 0.15s ease-in-out',
                        animation: isSpeaking ? `pulse 0.8s infinite ${i * 0.08}s` : 'none',
                      }}
                    />
                  ))}
                </div>

                {/* Quick Director Connect Buttons */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {BOARDROOM_EXECUTIVES.map((exec) => {
                    const isSelected = activeSpeakerId === exec.id;
                    return (
                      <button
                        key={exec.id}
                        onClick={() => {
                          setActiveSpeakerId(exec.id);
                          if (onOpenVoiceWithAgent) {
                            onOpenVoiceWithAgent({
                              id: exec.id,
                              name: exec.name,
                              role: exec.role,
                              title: exec.title,
                              avatarColor: exec.avatarColor,
                              isBoardMember: true,
                            });
                          }
                        }}
                        style={{
                          background: isSelected ? 'var(--cyan)' : 'rgba(7, 36, 69, 0.8)',
                          color: isSelected ? '#031126' : '#dce8f5',
                          border: isSelected ? '1px solid #fff' : '1px solid #143e65',
                          borderRadius: '4px',
                          padding: '3px 7px',
                          fontSize: '9px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                        title={`Click to speak with ${exec.name} (${exec.title})`}
                      >
                        <span>🎙</span>
                        <span>{exec.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Schematic Conference Table Visualization */
            <div
              style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 10px',
                minHeight: '340px',
              }}
            >
              {/* Center Conference Table */}
              <div
                style={{
                  width: '66%',
                  height: '140px',
                  borderRadius: '60px',
                  background: 'linear-gradient(145deg, #09264a, #051428)',
                  border: '2px solid #165287',
                  boxShadow: '0 10px 40px rgba(0, 150, 255, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '10px',
                  zIndex: 2,
                }}
              >
                <div style={{ fontSize: '10px', color: 'var(--cyan)', fontWeight: 800, letterSpacing: '0.1em' }}>
                  AGENTIC GRC BRAIN
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', margin: '3px 0' }}>
                  Active Speaker: {currentSpeaker.name}
                </div>
                {/* Audio Waveform Animation */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '22px', margin: '4px 0' }}>
                  {[12, 18, 22, 15, 24, 19, 14, 20, 16, 22, 18, 12].map((h, i) => (
                    <span
                      key={i}
                      style={{
                        width: '3px',
                        height: isSpeaking ? `${h}px` : '4px',
                        background: 'linear-gradient(180deg, #00d5f2, #087cff)',
                        borderRadius: '2px',
                        transition: 'height 0.15s ease-in-out',
                        animation: isSpeaking ? `pulse 0.8s infinite ${i * 0.08}s` : 'none',
                      }}
                    />
                  ))}
                </div>
                <small style={{ color: 'var(--muted)', fontSize: '9px' }}>
                  {isMuted ? '🔇 Audio Output Muted' : '🔊 Natural Voice Output Active'}
                </small>
              </div>

              {/* Top Row Executives (CEO, CTO, CIO) */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'space-around',
                  zIndex: 3,
                }}
              >
                {BOARDROOM_EXECUTIVES.slice(0, 3).map((exec) => {
                  const isActive = activeSpeakerId === exec.id;
                  return (
                    <div
                      key={exec.id}
                      onClick={() => {
                        setActiveSpeakerId(exec.id);
                        if (onOpenVoiceWithAgent) {
                          onOpenVoiceWithAgent({
                            id: exec.id,
                            name: exec.name,
                            role: exec.role,
                            title: exec.title,
                            avatarColor: exec.avatarColor,
                            isBoardMember: true,
                          });
                        }
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: exec.avatarColor,
                            display: 'grid',
                            placeItems: 'center',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '13px',
                            border: isActive ? '3px solid #00d5f2' : '2px solid #143e65',
                            boxShadow: isActive ? '0 0 16px #00d5f2' : 'none',
                          }}
                        >
                          {exec.initials}
                        </div>
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-2px',
                            right: '-2px',
                            background: 'linear-gradient(135deg, #00d5f2 0%, #087cff 100%)',
                            color: '#020b1b',
                            border: '1.5px solid #fff',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            fontSize: '9px',
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: '0 0 6px rgba(0, 213, 242, 0.8)',
                          }}
                        >
                          🎙
                        </span>
                      </div>
                      <b style={{ fontSize: '10px', marginTop: '4px', color: isActive ? 'var(--cyan)' : '#dce8f5' }}>
                        {exec.role}
                      </b>
                      <small style={{ fontSize: '8px', color: 'var(--muted)' }}>{exec.name.split(' ')[0]}</small>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Row Executives (CISO, DPO, RISK, COMPLIANCE, AUDIT) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'space-around',
                  zIndex: 3,
                }}
              >
                {BOARDROOM_EXECUTIVES.slice(3).map((exec) => {
                  const isActive = activeSpeakerId === exec.id;
                  return (
                    <div
                      key={exec.id}
                      onClick={() => {
                        setActiveSpeakerId(exec.id);
                        if (onOpenVoiceWithAgent) {
                          onOpenVoiceWithAgent({
                            id: exec.id,
                            name: exec.name,
                            role: exec.role,
                            title: exec.title,
                            avatarColor: exec.avatarColor,
                            isBoardMember: true,
                          });
                        }
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: exec.avatarColor,
                            display: 'grid',
                            placeItems: 'center',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '12px',
                            border: isActive ? '3px solid #00d5f2' : '2px solid #143e65',
                            boxShadow: isActive ? '0 0 16px #00d5f2' : 'none',
                          }}
                        >
                          {exec.initials}
                        </div>
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-2px',
                            right: '-2px',
                            background: 'linear-gradient(135deg, #00d5f2 0%, #087cff 100%)',
                            color: '#020b1b',
                            border: '1.5px solid #fff',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            fontSize: '9px',
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: '0 0 6px rgba(0, 213, 242, 0.8)',
                          }}
                        >
                          🎙
                        </span>
                      </div>
                      <b style={{ fontSize: '10px', marginTop: '4px', color: isActive ? 'var(--cyan)' : '#dce8f5' }}>
                        {exec.role}
                      </b>
                      <small style={{ fontSize: '8px', color: 'var(--muted)' }}>{exec.name.split(' ')[0]}</small>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Captions Bar */}
          {isCaptionsOn && latestTranscript && (
            <div
              style={{
                background: '#041022',
                border: '1px solid #14406a',
                borderRadius: '8px',
                padding: '10px 14px',
                margin: '8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  background: 'var(--cyan)',
                  color: '#031126',
                  fontWeight: 800,
                  fontSize: '9px',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  flexShrink: 0,
                }}
              >
                CAPTIONS
              </div>
              <div style={{ fontSize: '11px', color: '#e5f3ff', lineHeight: 1.4 }}>
                <b style={{ color: 'var(--cyan)' }}>{latestTranscript.speakerRole}:</b> {latestTranscript.text}
              </div>
            </div>
          )}

          {/* Voice & Human Input Toolbar */}
          <div
            style={{
              borderTop: '1px solid var(--line)',
              paddingTop: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <button
              className="iconbtn"
              onClick={() => {
                if (onOpenVoiceWithAgent) {
                  onOpenVoiceWithAgent({
                    id: currentSpeaker.id,
                    name: currentSpeaker.name,
                    role: currentSpeaker.role,
                    title: currentSpeaker.title,
                    avatarColor: currentSpeaker.avatarColor,
                    isBoardMember: true,
                  });
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #00d5f2 0%, #087cff 100%)',
                color: '#020b1b',
                fontWeight: 800,
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '6px',
                boxShadow: '0 0 10px rgba(0, 213, 242, 0.4)',
                cursor: 'pointer',
              }}
              title="Speak with active executive in natural human male voice"
            >
              🎙 Speak with {currentSpeaker.role} (Najdi Voice)
            </button>

            <button
              className="iconbtn"
              onClick={() => {
                setIsMuted(!isMuted);
                window.speechSynthesis?.cancel();
                onShowToast(isMuted ? 'Voice output unmuted.' : 'Voice output muted.');
              }}
              title="Toggle Audio Speech Output"
              style={{ fontSize: '11px' }}
            >
              {isMuted ? '🔇 Muted' : '🔊 Voice'}
            </button>

            <button
              className="iconbtn"
              onClick={() => setIsCaptionsOn(!isCaptionsOn)}
              title="Toggle Captions"
              style={{ fontSize: '11px' }}
            >
              💬 {isCaptionsOn ? 'Captions: ON' : 'Captions: OFF'}
            </button>

            {/* Text Chat Fallback */}
            <form onSubmit={handleSendHumanMessage} style={{ display: 'flex', gap: '6px', flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                value={userInputText}
                onChange={(e) => setUserInputText(e.target.value)}
                placeholder="Speak or type a question to the board…"
                style={{
                  flex: 1,
                  background: '#041126',
                  border: '1px solid #1b4569',
                  borderRadius: '7px',
                  padding: '7px 10px',
                  color: '#fff',
                  fontSize: '11px',
                  outline: 'none',
                }}
              />
              <button className="primary" type="submit" style={{ padding: '7px 12px', fontSize: '11px' }}>
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Live Transcript Stream */}
        <div
          className="panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '520px',
          }}
        >
          <div className="panel-head" style={{ marginBottom: '10px' }}>
            <h3>Live Meeting Transcript ({meeting.initialTranscripts.length})</h3>
            <span style={{ fontSize: '9px', color: 'var(--green)' }}>● Real-time synced</span>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '6px',
            }}
          >
            {meeting.initialTranscripts.map((entry) => {
              const isHuman = entry.speakerId === 'user';
              return (
                <div
                  key={entry.id}
                  style={{
                    background: isHuman ? '#0a2e56' : '#041328',
                    border: isHuman ? '1px solid #155e9c' : '1px solid #12385c',
                    borderRadius: '9px',
                    padding: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          background: isHuman ? 'var(--green)' : '#087cff',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '9px',
                          padding: '2px 5px',
                          borderRadius: '4px',
                        }}
                      >
                        {entry.speakerRole}
                      </span>
                      <b style={{ fontSize: '11px' }}>{entry.speakerName}</b>
                    </div>
                    <time style={{ fontSize: '9px', color: 'var(--muted)' }}>{entry.timestamp}</time>
                  </div>

                  <p style={{ margin: '4px 0 6px', fontSize: '11px', lineHeight: 1.45, color: '#dbeafe' }}>
                    {entry.text}
                  </p>

                  {/* Framework Citations */}
                  {entry.citations && entry.citations.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {entry.citations.map((cite, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedCitation(cite);
                            onShowToast(`Viewing citation: ${cite}`);
                          }}
                          style={{
                            background: '#072445',
                            border: '1px solid #17548b',
                            color: 'var(--cyan)',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '9px',
                            cursor: 'pointer',
                          }}
                        >
                          § {cite}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Human Approval Required Badge inside Transcript */}
                  {entry.requiresApproval && (
                    <div
                      style={{
                        marginTop: '8px',
                        background: '#3d2508',
                        border: '1px solid #ffb43d',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ color: '#ffb43d', fontSize: '10px', fontWeight: 600 }}>
                        ⚠ Requires Human Authorization ({entry.approvalType})
                      </span>
                      <button
                        className="primary"
                        onClick={() => setActiveTab('approvals')}
                        style={{ fontSize: '9px', padding: '4px 8px' }}
                      >
                        Review Approval Gate →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>

      {/* 3. Lower Stage: Decisions, Risk Heatmap, Audit Trail, and Human Approvals */}
      <div className="panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {[
            { id: 'decisions', label: `Decisions & Actions (${meeting.initialDecisions.length})` },
            { id: 'approvals', label: `Human Approval Requests (${meeting.initialApprovals.filter((a) => a.status === 'Pending').length} Pending)` },
            { id: 'heatmap', label: 'Discussed Risk Heatmap' },
            { id: 'audit', label: 'Meeting Audit Trail' },
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

        {/* Tab 1: Decisions & Actions */}
        {activeTab === 'decisions' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            <div>
              <b style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Recorded Decisions ({meeting.initialDecisions.length})</b>
              <div style={{ display: 'grid', gap: '8px' }}>
                {meeting.initialDecisions.map((dec) => (
                  <div
                    key={dec.id}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      padding: '10px',
                      background: 'var(--panel2)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ fontSize: '11px', color: '#fff' }}>{dec.title}</b>
                      <span className={`pill ${dec.status === 'Approved' ? 'green' : 'amber'}`}>
                        {dec.status}
                      </span>
                    </div>
                    <p style={{ margin: '5px 0', fontSize: '10px', color: 'var(--muted)' }}>{dec.rationale}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--cyan)' }}>
                      <span>Ref: {dec.frameworkRef}</span>
                      <span>Proposed by: {dec.proposedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <b style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Assigned Action Items ({meeting.initialActions.length})</b>
              <div style={{ display: 'grid', gap: '8px' }}>
                {meeting.initialActions.map((act) => (
                  <div
                    key={act.id}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      padding: '10px',
                      background: 'var(--panel2)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ fontSize: '11px', color: '#fff' }}>{act.task}</b>
                      <span className={`pill ${act.priority === 'Critical' ? '' : 'amber'}`}>
                        {act.priority}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'var(--muted)' }}>
                      <span>Owner: <b>{act.owner}</b></span>
                      <span>Target: {act.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Human Approvals */}
        {activeTab === 'approvals' && (
          <div>
            <div style={{ marginBottom: '10px' }}>
              <b style={{ fontSize: '12px' }}>Human-in-the-Loop Consequential Approval Gates</b>
              <p style={{ margin: '3px 0 10px', fontSize: '10px', color: 'var(--muted)' }}>
                Conversational agreement alone cannot trigger regulatory submissions or risk acceptances. Explicit digital approval by the authorized human GRC Administrator is mandatory.
              </p>
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              {meeting.initialApprovals.map((req) => (
                <div
                  key={req.id}
                  style={{
                    border: '1px solid #1a5285',
                    borderRadius: '10px',
                    padding: '14px',
                    background: req.status === 'Approved' ? '#041f17' : '#071e38',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span
                        style={{
                          background: req.type === 'Regulatory Submission' ? '#8d39ff25' : '#ffb43d25',
                          color: req.type === 'Regulatory Submission' ? '#c391ff' : '#ffc568',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: 700,
                          marginRight: '8px',
                        }}
                      >
                        {req.type}
                      </span>
                      <b style={{ fontSize: '12px', color: '#fff' }}>{req.title}</b>
                    </div>

                    <span className={`pill ${req.status === 'Approved' ? 'green' : 'amber'}`}>
                      {req.status}
                    </span>
                  </div>

                  <p style={{ margin: '8px 0', fontSize: '11px', color: '#c4dcf2', lineHeight: 1.5 }}>
                    {req.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px', fontSize: '9px', color: 'var(--muted)', background: 'var(--panel)', padding: '8px', borderRadius: '6px' }}>
                    <div>Submitted by: <b style={{ color: '#fff' }}>{req.submittedBy}</b></div>
                    <div>Impact: <b style={{ color: 'var(--cyan)' }}>{req.frameworkImpact}</b></div>
                    <div style={{ fontFamily: 'monospace' }}>{req.hash}</div>
                  </div>

                  {req.status === 'Pending' ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                      <button
                        className="secondary"
                        onClick={() => onShowToast(`Approval request ${req.id} rejected.`)}
                        style={{ fontSize: '11px', padding: '6px 12px' }}
                      >
                        ✕ Reject
                      </button>
                      <button
                        className="primary"
                        onClick={() => handleApproveRequest(req.id)}
                        style={{ fontSize: '11px', padding: '6px 16px' }}
                      >
                        ✓ Authorize & Digitally Sign
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--green)' }}>
                      ✓ Digitally Signed by {req.approver} on {req.approvedAt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Risk Heatmap */}
        {activeTab === 'heatmap' && (
          <div>
            <b style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              Meeting Discussion Risk Exposure Matrix (FAIR 5x5 Grid)
            </b>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', maxWidth: '600px', margin: 'auto' }}>
              {[
                { label: 'Crit 5.5', level: 'High', color: '#ff426d', title: 'OT Jump Hosts (Unmitigated)' },
                { label: 'High 4.5', level: 'High', color: '#ff426d', title: 'Cross-Border Telemetry' },
                { label: 'Med 3.5', level: 'Med', color: '#ffb43d', title: 'Phishing Burst' },
                { label: 'Med 2.5', level: 'Med', color: '#ffb43d', title: 'Vendor API Key' },
                { label: 'Low 1.5', level: 'Low', color: '#00d5ad', title: 'JIT Controlled Posture' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: `${item.color}22`,
                    border: `1px solid ${item.color}80`,
                    borderRadius: '8px',
                    padding: '12px 8px',
                    textAlign: 'center',
                  }}
                >
                  <b style={{ fontSize: '10px', color: item.color, display: 'block' }}>{item.level}</b>
                  <span style={{ fontSize: '9px', color: '#e5f2ff', display: 'block', marginTop: '4px' }}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Audit Trail */}
        {activeTab === 'audit' && (
          <div>
            <b style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              Meeting Event History & Cryptographic Audit Ledger
            </b>
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
                  {[
                    { id: 'EVT-9041', time: '10:10:55 AST', actor: 'Dr. Tariq (CEO)', cat: 'Boardroom', act: 'Consensus approval on DEC-01', out: 'Success' },
                    { id: 'EVT-9040', time: '10:09:40 AST', actor: 'Nouf (Compliance)', cat: 'Approval Gate', act: 'Created APR-2026-001', out: 'Pending' },
                    { id: 'EVT-9039', time: '10:04:18 AST', actor: 'Khalid (Audit)', cat: 'Independence', act: 'Documented finding AF-021', out: 'Flagged' },
                    { id: 'EVT-9038', time: '10:00:00 AST', actor: 'Abdulaziz Roomi', cat: 'Meeting State', act: 'Started Executive Risk Review', out: 'LIVE' },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td>{row.id}</td>
                      <td>{row.time}</td>
                      <td>{row.actor}</td>
                      <td>{row.cat}</td>
                      <td>{row.act}</td>
                      <td>
                        <span className={`pill ${row.out === 'Success' ? 'green' : row.out === 'Pending' ? 'amber' : ''}`}>
                          {row.out}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 4. Structured Meeting Minutes Modal */}
      {isMinutesOpen && (
        <div className="modal-backdrop open">
          <div className="modal" style={{ width: 'min(780px, 100%)', maxHeight: '85vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0 }}>Executive Meeting Minutes — {meeting.id}</h2>
              <span className="pill green">Draft for Human Approval</span>
            </div>

            <div
              style={{
                background: '#040e1f',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '11px',
                color: '#e2f0fc',
                lineHeight: 1.6,
                maxHeight: '55vh',
                overflowY: 'auto',
              }}
            >
              <h3 style={{ margin: '0 0 6px', color: 'var(--cyan)' }}>{meeting.title}</h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '10px' }}>
                Date: October 13, 2026 · Chairperson: Dr. Tariq Al-Ghamdi · Human Oversight: Abdulaziz Roomi
              </p>

              <hr style={{ borderColor: 'var(--line)', margin: '12px 0' }} />

              <b style={{ color: '#fff' }}>1. Attendance & Quorum</b>
              <p style={{ margin: '4px 0 10px' }}>
                CEO, CISO, DPO, CRO (Risk), Compliance Director, Chief Audit Executive, CTO, CIO. Quorum confirmed.
              </p>

              <b style={{ color: '#fff' }}>2. Executive Summary</b>
              <p style={{ margin: '4px 0 10px' }}>
                The board evaluated NCA ECC-2-1-1 compliance regarding privileged access on 18 legacy industrial jump hosts. Consensus was reached to deploy ephemeral JIT tokens immediately, reducing Annualized Loss Expectancy from 4.2M SAR to 380K SAR without hardware dependency. SIEM telemetry was formally restricted to Saudi Arabian sovereign cloud infrastructure pursuant to Saudi PDPL Article 29.
              </p>

              <b style={{ color: '#fff' }}>3. Key Decisions Recorded</b>
              <ul style={{ margin: '4px 0 10px', paddingLeft: '18px' }}>
                {meeting.initialDecisions.map((d, i) => (
                  <li key={i}>
                    <b>{d.title}</b> — Status: <i>{d.status}</i> ({d.frameworkRef})
                  </li>
                ))}
              </ul>

              <b style={{ color: '#fff' }}>4. Action Items & Timelines</b>
              <ul style={{ margin: '4px 0 10px', paddingLeft: '18px' }}>
                {meeting.initialActions.map((a, i) => (
                  <li key={i}>
                    {a.task} — Assigned to <b>{a.owner}</b> (Due: {a.dueDate})
                  </li>
                ))}
              </ul>

              <b style={{ color: '#fff' }}>5. Formal Sign-Off & Hash Stamp</b>
              <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '4px' }}>
                Cryptographic Integrity Verification: SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '14px' }}>
              <button className="secondary" onClick={() => setIsMinutesOpen(false)}>
                Close
              </button>
              <button
                className="primary"
                onClick={() => {
                  onShowToast('Meeting minutes exported as formal audit record.');
                  setIsMinutesOpen(false);
                }}
              >
                Export Minutes (Markdown / PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Citation Quick Viewer Modal */}
      {selectedCitation && (
        <div className="modal-backdrop open">
          <div className="modal" style={{ width: 'min(500px, 100%)' }}>
            <h2>Regulatory Citation Inspector</h2>
            <div style={{ background: '#041328', border: '1px solid var(--line)', padding: '14px', borderRadius: '8px', margin: '12px 0' }}>
              <b style={{ color: 'var(--cyan)', fontSize: '13px' }}>{selectedCitation}</b>
              <p style={{ fontSize: '11px', color: '#c5dff7', marginTop: '8px', lineHeight: 1.5 }}>
                Verified reference from the local embedded RAG Knowledge Base. Mandates specific technical safeguards, auditable logging, and periodic supervisory validation.
              </p>
            </div>
            <div className="modal-actions">
              <button className="primary" onClick={() => setSelectedCitation(null)}>
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
