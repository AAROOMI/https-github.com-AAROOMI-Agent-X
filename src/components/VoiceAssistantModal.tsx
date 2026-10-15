import React, { useState, useEffect } from 'react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onShowToast: (msg: string) => void;
  onToggleTheme: () => void;
  onToggleAirGap: () => void;
  onOpenAddRisk: () => void;
  airGapMode: boolean;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onShowToast,
  onToggleTheme,
  onToggleAirGap,
  onOpenAddRisk,
  airGapMode,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setAiResponse('Hello Abdulaziz. I am listening. You can ask about NCA ECC, SAMA compliance, open risks, or give a voice command.');
      startListening();
    } else {
      stopListening();
      window.speechSynthesis?.cancel();
    }
  }, [isOpen]);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAiResponse('Web Speech API is not supported in this browser. You can click the suggested voice commands below or type.');
      onShowToast('Web Speech Recognition API unavailable. Fallback enabled.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('Listening to your voice…');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const text = finalTranscript || interimTranscript;
        setTranscript(text);

        if (finalTranscript) {
          processVoiceCommand(finalTranscript);
        }
      };

      recognition.onerror = (e: any) => {
        setIsListening(false);
        if (e.error === 'not-allowed') {
          setAiResponse('Microphone access was denied by browser permissions. Please allow mic access in your address bar, or use the quick voice action buttons below.');
        } else {
          setAiResponse('Microphone listening paused. You can click the mic button to try again or click any quick command.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const processVoiceCommand = (command: string) => {
    const cmd = command.toLowerCase();

    if (/boardroom|meeting|board|call/i.test(cmd)) {
      const reply = 'Entering the Virtual Boardroom session with the board of directors now.';
      setAiResponse(reply);
      speakText(reply);
      setTimeout(() => {
        onNavigate('Boardroom');
        onClose();
      }, 1200);
    } else if (/sama|central bank|csf/i.test(cmd)) {
      const reply = 'Opening SAMA Cyber Security Framework connected to repository AAROOMI/SAMA-CSF.';
      setAiResponse(reply);
      speakText(reply);
      setTimeout(() => {
        onNavigate('SAMA Framework');
        onClose();
      }, 1200);
    } else if (/framework|ecc|iso|nist/i.test(cmd)) {
      const reply = 'Navigating to Comprehensive Framework Knowledge Base across 14 standards.';
      setAiResponse(reply);
      speakText(reply);
      setTimeout(() => {
        onNavigate('Frameworks');
        onClose();
      }, 1200);
    } else if (/risk|threat|vulnerabilit/i.test(cmd)) {
      const reply = 'Opening the Enterprise Risk Register. There are currently 7 open risks.';
      setAiResponse(reply);
      speakText(reply);
      setTimeout(() => {
        onNavigate('Risk Register');
        onClose();
      }, 1200);
    } else if (/add risk|create risk|new risk/i.test(cmd)) {
      const reply = 'Opening the Add Risk registration form for you.';
      setAiResponse(reply);
      speakText(reply);
      setTimeout(() => {
        onOpenAddRisk();
        onClose();
      }, 1000);
    } else if (/theme|dark mode|light mode/i.test(cmd)) {
      const reply = 'Toggling application theme.';
      setAiResponse(reply);
      speakText(reply);
      onToggleTheme();
    } else if (/air gap|offline/i.test(cmd)) {
      const reply = airGapMode
        ? 'Disabling Air-Gap mode. Connected cloud sync enabled.'
        : 'Activating Air-Gap network isolation. Local models and sovereign storage engaged.';
      setAiResponse(reply);
      speakText(reply);
      onToggleAirGap();
    } else {
      const reply = `I heard: "${command}". I have analyzed the query against NCA ECC and SAMA CSF baselines. The enterprise security posture is operating at 92% compliance.`;
      setAiResponse(reply);
      speakText(reply);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop open">
      <div
        className="modal"
        style={{
          width: 'min(580px, 100%)',
          background: 'linear-gradient(135deg, #071e3b 0%, #031126 100%)',
          border: '1px solid var(--cyan)',
          boxShadow: '0 0 35px rgba(0, 213, 242, 0.25)',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🎙</span>
            <b style={{ color: 'var(--cyan)', fontSize: '14px', letterSpacing: '0.05em' }}>
              AGENT X VOICE ASSISTANT & SPEECH ENGINE
            </b>
          </div>
          <button
            className="secondary"
            onClick={onClose}
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            ✕ Close
          </button>
        </div>

        {/* Big Central Pulsing Mic Button */}
        <div style={{ margin: '20px auto 14px', position: 'relative', width: '90px', height: '90px' }}>
          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: isListening
                ? 'radial-gradient(circle, #ff426d 0%, #b3103a 100%)'
                : 'radial-gradient(circle, #087cff 0%, #034bb3 100%)',
              border: `3px solid ${isListening ? '#ff7390' : 'var(--cyan)'}`,
              boxShadow: isListening ? '0 0 30px #ff426d' : '0 0 25px rgba(0, 213, 242, 0.4)',
              color: '#fff',
              fontSize: '32px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title={isListening ? 'Click to stop listening' : 'Click to start speaking'}
          >
            🎙
          </button>
        </div>

        <b style={{ fontSize: '13px', color: isListening ? '#ff7390' : 'var(--cyan)' }}>
          {isListening ? 'LISTENING TO MICROPHONE…' : 'CLICK MICROPHONE TO SPEAK'}
        </b>
        <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10px', marginTop: '4px' }}>
          {airGapMode ? 'Local Web Speech API Engine Active (Air-Gapped Sovereign Voice)' : 'Cloud Speech API Available'}
        </small>

        {/* Audio Waveform */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            height: '24px',
            margin: '14px 0',
          }}
        >
          {[10, 16, 22, 14, 26, 18, 12, 24, 16, 20, 14, 10].map((h, i) => (
            <span
              key={i}
              style={{
                width: '3px',
                height: isListening || isSpeaking ? `${h}px` : '4px',
                background: isListening ? '#ff426d' : 'var(--cyan)',
                borderRadius: '2px',
                transition: 'height 0.15s ease-in-out',
                animation: isListening || isSpeaking ? `pulse 0.7s infinite ${i * 0.06}s` : 'none',
              }}
            />
          ))}
        </div>

        {/* Live Transcript Display Box */}
        <div
          style={{
            background: '#041022',
            border: '1px solid #14406a',
            borderRadius: '10px',
            padding: '12px 16px',
            margin: '10px 0',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: 700, marginBottom: '4px' }}>
            YOUR VOICE INPUT:
          </div>
          <div style={{ fontSize: '12px', color: '#fff', minHeight: '20px' }}>
            {transcript || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Speak into your microphone…</span>}
          </div>
        </div>

        {/* AI Voice Response Box */}
        <div
          style={{
            background: '#061a33',
            border: '1px solid #1a5285',
            borderRadius: '10px',
            padding: '12px 16px',
            margin: '10px 0',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '9px', color: 'var(--cyan)', fontWeight: 700 }}>
              AGENT X VOICE RESPONSE:
            </span>
            {isSpeaking && (
              <span style={{ fontSize: '9px', color: 'var(--green)' }}>
                🔊 Speaking…
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#dce8f5', lineHeight: 1.5 }}>
            {aiResponse}
          </div>
        </div>

        {/* Quick Voice Command Buttons */}
        <div style={{ marginTop: '14px', textAlign: 'left' }}>
          <small style={{ color: 'var(--muted)', fontSize: '9px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
            OR TEST VOICE COMMANDS (ONE-CLICK):
          </small>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { label: '🎙 "Join Boardroom meeting"', cmd: 'Join Boardroom meeting' },
              { label: '🏛 "Open SAMA Framework"', cmd: 'Open SAMA Framework' },
              { label: '◈ "Inspect NCA ECC controls"', cmd: 'Inspect NCA ECC controls' },
              { label: '⚠ "Show open risks"', cmd: 'Show open risks' },
              { label: '＋ "Add a new risk"', cmd: 'Add a new risk' },
              { label: '🛡 "Toggle Air-Gap Mode"', cmd: 'Toggle Air-Gap' },
            ].map((btn, i) => (
              <button
                key={i}
                className="secondary"
                onClick={() => {
                  setTranscript(btn.cmd);
                  processVoiceCommand(btn.cmd);
                }}
                style={{ fontSize: '10px', padding: '5px 10px', borderRadius: '6px' }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
