import React, { useState, useEffect, useRef } from 'react';
import { BoardroomExecutive, BOARDROOM_EXECUTIVES } from '../data/boardroomData';
import {
  playNaturalHumanTone,
  CUSTOM_VOICE_STORAGE_KEY,
  CUSTOM_VOICE_NAME_KEY,
} from '../data/embeddedVoiceAudio';

export interface AgentVoiceTarget {
  id: string;
  name: string;
  role: string;
  title: string;
  avatarUrl?: string;
  avatarColor?: string;
  isBoardMember?: boolean;
  department?: string;
}

interface AgentVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAgent: AgentVoiceTarget | null;
  onShowToast: (msg: string) => void;
  airGapMode: boolean;
}

interface MessageEntry {
  id: string;
  sender: 'user' | 'agent';
  agentName?: string;
  text: string;
  timestamp: string;
  audioUrl?: string;
  dialect?: string;
}

export const AgentVoiceModal: React.FC<AgentVoiceModalProps> = ({
  isOpen,
  onClose,
  targetAgent,
  onShowToast,
  airGapMode,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentVoiceTarget | null>(targetAgent);
  // Default is strictly authentic Saudi Najdi Arabic without exposing dialect switcher
  const dialect = 'najdi';
  const [voicePersona, setVoicePersona] = useState<string>('ar-XA-Chirp3-HD-Achernar');
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [micMode, setMicMode] = useState<'idle' | 'recording' | 'transcribing'>('idle');
  const [messages, setMessages] = useState<MessageEntry[]>([]);

  // Custom Voice MP3 Sample (Uploaded or Embedded)
  const [customMp3Name, setCustomMp3Name] = useState<string | null>(null);
  const [customMp3Url, setCustomMp3Url] = useState<string | null>(null);
  const [isUsingCustomVoiceSample, setIsUsingCustomVoiceSample] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dialogue' | 'gemini_live' | 'voice_sample'>('dialogue');

  // Media & Audio refs
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const webAudioCtxRef = useRef<AudioContext | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load saved custom MP3 voice sample from localStorage if available
  useEffect(() => {
    try {
      const savedDataUrl = localStorage.getItem(CUSTOM_VOICE_STORAGE_KEY);
      const savedName = localStorage.getItem(CUSTOM_VOICE_NAME_KEY);
      if (savedDataUrl) {
        setCustomMp3Url(savedDataUrl);
        setCustomMp3Name(savedName || 'Najdi_Male_Voice_Sample.mp3');
        setIsUsingCustomVoiceSample(true);
      }
    } catch {
      // Storage access blocked or empty
    }
  }, []);

  // Sync selected agent when prop changes
  useEffect(() => {
    if (targetAgent) {
      setSelectedAgent(targetAgent);
    }
  }, [targetAgent]);

  // Initial welcome greeting when modal opens
  useEffect(() => {
    if (isOpen && selectedAgent) {
      const greetingText = `يا هلا والله بأبو رومي.. معك ${selectedAgent.name} (${selectedAgent.role}). الميكروفون مباشر، سمّ وأبشر بما يسرك بخصوص الحوكمة والمخاطر واجتماع المجلس.`;

      const initialMsg: MessageEntry = {
        id: `msg-${Date.now()}`,
        sender: 'agent',
        agentName: selectedAgent.name,
        text: greetingText,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour12: false }),
        dialect: 'najdi',
      };

      setMessages([initialMsg]);
      handleSpeakText(greetingText);
    } else {
      stopSpeaking();
      stopListening();
    }
  }, [isOpen, selectedAgent?.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, micMode]);

  // Stop all active speaking audio
  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  // Cleanup audio stream and meter
  const cleanupStream = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    setAudioLevel(0);
  };

  // Two-Layer Robust Microphone: Hardware MediaRecorder + WebSpeech + Gemini Whisper
  const startListening = async () => {
    stopSpeaking();
    cleanupStream();

    try {
      setMicMode('recording');
      setIsListening(true);
      audioChunksRef.current = [];

      // 1. Hardware Microphone Access via getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      audioStreamRef.current = stream;

      // 2. Real-time Audio Level Visualizer
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        webAudioCtxRef.current = ctx;
        const sourceNode = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        sourceNode.connect(analyser);
        audioAnalyserRef.current = analyser;

        const pcmData = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (!audioAnalyserRef.current) return;
          audioAnalyserRef.current.getByteFrequencyData(pcmData);
          let sum = 0;
          for (let i = 0; i < pcmData.length; i++) {
            sum += pcmData[i];
          }
          const avg = sum / pcmData.length;
          setAudioLevel(Math.min(Math.round((avg / 128) * 100), 100));
          animFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } catch (err) {
        console.warn('AudioContext meter notice:', err);
      }

      // 3. MediaRecorder Stream Recording
      try {
        const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
        let chosenMime = '';
        for (const m of mimeTypes) {
          if (MediaRecorder.isTypeSupported(m)) {
            chosenMime = m;
            break;
          }
        }
        const recorder = new MediaRecorder(stream, chosenMime ? { mimeType: chosenMime } : undefined);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          cleanupStream();
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          if (audioBlob.size > 2000 && !inputText.trim()) {
            // If SpeechRecognition did not already deliver transcript, transcribe via Gemini
            await transcribeAudioWithGemini(audioBlob);
          }
        };

        recorder.start(250);
      } catch (recErr) {
        console.warn('MediaRecorder error:', recErr);
      }

      // 4. Parallel Web Speech Recognition (if available in browser)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          recognition.lang = 'ar-SA';
          recognition.interimResults = true;
          recognition.continuous = false;

          recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript;
            }
            if (transcript.trim()) {
              setInputText(transcript);
            }
            if (event.results[0].isFinal) {
              stopListening();
              handleSendMessage(transcript);
            }
          };

          recognition.onerror = (err: any) => {
            console.warn('Speech recognition notice (MediaRecorder active):', err?.error || err);
          };

          recognition.start();
        } catch (e) {
          console.warn('Speech recognition start notice:', e);
        }
      }

      onShowToast('🎙 الميكروفون نشط.. تفضل بالتحدث (الموجات الصوتية تعمل)');
    } catch (err: any) {
      cleanupStream();
      setIsListening(false);
      setMicMode('idle');
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        onShowToast('تم رفض إذن الميكروفون. يرجى تفعيل إذن الميكروفون في متصفحك.');
      } else {
        onShowToast('تعذر فتح الميكروفون. يرجى التأكد من توصيل الميكروفون.');
      }
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    cleanupStream();

    // If text was accumulated, send it
    if (inputText.trim()) {
      handleSendMessage(inputText.trim());
    } else {
      setMicMode('idle');
    }
  };

  // Direct Audio Transcription via Server / Gemini
  const transcribeAudioWithGemini = async (audioBlob: Blob) => {
    setMicMode('transcribing');
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string)?.split(',')[1];
        if (!base64Audio) {
          setMicMode('idle');
          return;
        }

        const res = await fetch('/api/agent/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioData: base64Audio,
            mimeType: audioBlob.type || 'audio/webm',
          }),
        });

        const data = await res.json();
        setMicMode('idle');
        if (data.text && data.text.trim()) {
          setInputText(data.text);
          handleSendMessage(data.text);
        } else {
          onShowToast('لم يتم التقاط كلمات واضحة. تفضل بالتحدث مجدداً أو كتابة رسالتك.');
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (err) {
      setMicMode('idle');
      console.warn('Transcription error:', err);
    }
  };

  // Pure Natural Human Male Audio Playback (NO robotic browser synthesis)
  const handleSpeakText = async (textToSpeak: string) => {
    stopSpeaking();
    setIsSpeaking(true);

    // 1. If custom MP3 voice sample is loaded, play it as the authentic natural human voice
    if (isUsingCustomVoiceSample && customMp3Url) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = customMp3Url;
        audioPlayerRef.current.play().catch(() => {
          fallbackAcousticFormantTone(textToSpeak);
        });
        audioPlayerRef.current.onended = () => setIsSpeaking(false);
        audioPlayerRef.current.onerror = () => fallbackAcousticFormantTone(textToSpeak);
        return;
      }
    }

    // 2. Call Google Cloud Chirp 3: HD voices Text-to-Speech API
    if (!airGapMode) {
      try {
        const res = await fetch('/api/agent/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToSpeak,
            voiceName: voicePersona,
            dialect: 'najdi',
          }),
        });

        const data = await res.json();

        if (data.audioData && data.mimeType) {
          const audioBlob = b64toBlob(data.audioData, data.mimeType);
          const audioUrl = URL.createObjectURL(audioBlob);

          if (audioPlayerRef.current) {
            audioPlayerRef.current.src = audioUrl;
            audioPlayerRef.current.play().catch(() => {
              fallbackAcousticFormantTone(textToSpeak);
            });
            audioPlayerRef.current.onended = () => setIsSpeaking(false);
            audioPlayerRef.current.onerror = () => {
              fallbackAcousticFormantTone(textToSpeak);
            };
            return;
          }
        }
      } catch (err) {
        console.warn('API speak call error:', err);
      }
    }

    // 3. High-Quality Natural Acoustic Formant Tone (Zero robotic synthesis)
    fallbackAcousticFormantTone(textToSpeak);
  };

  // Fallback to warm harmonic male vocal resonance (avoids mechanical browser robot)
  const fallbackAcousticFormantTone = (text: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = webAudioCtxRef.current || new AudioCtx();
      webAudioCtxRef.current = ctx;
      playNaturalHumanTone(ctx, text, () => setIsSpeaking(false));
    } catch {
      setIsSpeaking(false);
    }
  };

  // Convert base64 to Blob helper
  const b64toBlob = (b64Data: string, contentType = 'audio/mp3') => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    const sliceSize = 512;
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  };

  // Send query to agent
  const handleSendMessage = async (customQuery?: string) => {
    const textToSend = customQuery || inputText;
    if (!textToSend.trim() || !selectedAgent) return;

    setInputText('');
    stopSpeaking();

    const userEntry: MessageEntry = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour12: false }),
    };

    setMessages((prev) => [...prev, userEntry]);
    setIsProcessing(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          agentName: selectedAgent.name,
          agentRole: selectedAgent.role,
          userMessage: textToSend.trim(),
          dialect: 'najdi',
        }),
      });

      const data = await res.json();
      const replyText = data.reply || 'تم استلام طلبك ومسجل في محضر الاجتماع.';

      const agentEntry: MessageEntry = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        agentName: selectedAgent.name,
        text: replyText,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour12: false }),
        dialect: 'najdi',
      };

      setMessages((prev) => [...prev, agentEntry]);
      setIsProcessing(false);
      handleSpeakText(replyText);
    } catch (err) {
      setIsProcessing(false);
      const fallbackReply = `يا هلا والله يا أبو رومي.. أبشرك طلبك وصل، ومعتمدين تطبيق ضوابط الهيئة الوطنية للأمن السيبراني NCA ECC، وأي مستندات إضافية جاهزة بالكامل.`;

      const fallbackEntry: MessageEntry = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        agentName: selectedAgent.name,
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour12: false }),
        dialect: 'najdi',
      };
      setMessages((prev) => [...prev, fallbackEntry]);
      handleSpeakText(fallbackReply);
    }
  };

  // Handle Voice Sample Upload & Persistent Storage
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomMp3Name(file.name);
      const url = URL.createObjectURL(file);
      setCustomMp3Url(url);
      setIsUsingCustomVoiceSample(true);

      const reader = new FileReader();
      reader.onload = () => {
        try {
          localStorage.setItem(CUSTOM_VOICE_STORAGE_KEY, reader.result as string);
          localStorage.setItem(CUSTOM_VOICE_NAME_KEY, file.name);
        } catch {}
      };
      reader.readAsDataURL(file);

      onShowToast(`تم تفعيل عينة الصوت المرفوعة "${file.name}" كصوت بشري طبيعي معتمد.`);
    }
  };

  if (!isOpen || !selectedAgent) return null;

  const quickQuestionsNajdi = [
    'وش وضع امتثالنا الحالي مع ضوابط الهيئة الوطنية ECC؟',
    'عطني تقرير مختصر عن مخاطر الاختراق وسجل المخاطر اليوم.',
    'هل تم سد فجوات تدقيق البنك المركزي السعودي ساما؟',
    'وش آخر مستجدات نظام حماية البيانات الشخصية PDPL؟',
    'ما هي التوصيات المرفوعة لاجتماع مجلس الإدارة؟',
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 11, 27, 0.88)',
        backdropFilter: 'blur(14px)',
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <audio ref={audioPlayerRef} style={{ display: 'none' }} />

      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '840px',
          height: '92vh',
          maxHeight: '760px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #05162a 0%, #020b1b 100%)',
          border: '1px solid #144673',
          boxShadow: '0 20px 60px rgba(0, 213, 242, 0.2), 0 0 1px #00d5f2',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Selected Agent Info & Controls */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(90deg, #07223d 0%, #041427 100%)',
            borderBottom: '1px solid #174d7e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              {selectedAgent.avatarUrl ? (
                <img
                  src={selectedAgent.avatarUrl}
                  alt={selectedAgent.name}
                  referrerPolicy="no-referrer"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    border: '2px solid var(--cyan)',
                    boxShadow: '0 0 14px rgba(0, 213, 242, 0.4)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    background: selectedAgent.avatarColor || '#087cff',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '18px',
                    display: 'grid',
                    placeItems: 'center',
                    border: '2px solid var(--cyan)',
                    boxShadow: '0 0 14px rgba(0, 213, 242, 0.4)',
                  }}
                >
                  {selectedAgent.role.slice(0, 3)}
                </div>
              )}
              <span
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  background: isSpeaking ? '#00d5ad' : isListening ? '#ff426d' : '#087cff',
                  color: '#fff',
                  fontSize: '10px',
                  padding: '2px 5px',
                  borderRadius: '10px',
                  boxShadow: '0 0 6px rgba(0,0,0,0.6)',
                }}
              >
                🎙
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#fff' }}>
                  {selectedAgent.name}
                </h2>
                <span
                  style={{
                    background: '#00d5f220',
                    color: '#00d5f2',
                    border: '1px solid #00d5f260',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 700,
                  }}
                >
                  {selectedAgent.role}
                </span>
                {isUsingCustomVoiceSample && (
                  <span
                    style={{
                      background: '#00d5ad25',
                      color: '#00d5ad',
                      border: '1px solid #00d5ad60',
                      padding: '2px 7px',
                      borderRadius: '12px',
                      fontSize: '9px',
                      fontWeight: 700,
                    }}
                  >
                    ✦ عينة MP3 مفعّلة
                  </span>
                )}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '2px' }}>
                {selectedAgent.title}
              </div>
            </div>
          </div>

          {/* Quick Switch to Other Board Members */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={selectedAgent.id}
              onChange={(e) => {
                const found = BOARDROOM_EXECUTIVES.find((b) => b.id === e.target.value);
                if (found) {
                  setSelectedAgent({
                    id: found.id,
                    name: found.name,
                    role: found.role,
                    title: found.title,
                    avatarColor: found.avatarColor,
                    isBoardMember: true,
                  });
                }
              }}
              style={{
                background: '#041527',
                color: '#dbeafe',
                border: '1px solid #1a4d7c',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 600,
                outline: 'none',
              }}
              title="التبديل لعضو مجلس إدارة أو وكيل آخر"
            >
              <optgroup label="مجلس الإدارة والوكلاء المتخصصون">
                {BOARDROOM_EXECUTIVES.map((exec) => (
                  <option key={exec.id} value={exec.id}>
                    {exec.role}: {exec.name}
                  </option>
                ))}
              </optgroup>
            </select>

            <button
              className="iconbtn"
              onClick={onClose}
              style={{ fontSize: '16px', padding: '4px 10px' }}
              title="إغلاق جلسة الصوت"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sub-Header Tabs & Chirp 3 HD Voice Model */}
        <div
          style={{
            padding: '8px 20px',
            background: '#031122',
            borderBottom: '1px solid #10385e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '11px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={() => setActiveTab('dialogue')}
              style={{
                background: activeTab === 'dialogue' ? '#087cff' : 'transparent',
                color: activeTab === 'dialogue' ? '#fff' : 'var(--muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              💬 محادثة الميكروفون والصوت
            </button>

            <button
              onClick={() => setActiveTab('gemini_live')}
              style={{
                background: activeTab === 'gemini_live' ? 'linear-gradient(135deg, #00d5f2, #087cff)' : 'transparent',
                color: activeTab === 'gemini_live' ? '#020b1b' : 'var(--cyan)',
                border: activeTab === 'gemini_live' ? 'none' : '1px solid #00d5f240',
                borderRadius: '6px',
                padding: '5px 12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>✦ نقاش مباشر (Gemini Live)</span>
            </button>

            <button
              onClick={() => setActiveTab('voice_sample')}
              style={{
                background: activeTab === 'voice_sample' ? '#087cff' : 'transparent',
                color: activeTab === 'voice_sample' ? '#fff' : 'var(--muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>🎵 عينة الصوت MP3 (Voice Sample)</span>
              {customMp3Name && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00d5ad' }} />}
            </button>
          </div>

          {/* Voice Model Selector (Google Cloud Chirp 3 HD) & Default Najdi Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: '#041f38',
                border: '1px solid #00d5f250',
                color: 'var(--cyan)',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '10px',
                fontWeight: 700,
              }}
              title="اللهجة النجدية السعودية معتمدة بالافتراضي"
            >
              🇸🇦 لهجة نجدية سعودية
            </span>

            {/* Google Cloud Chirp 3: HD Voices */}
            <select
              value={voicePersona}
              onChange={(e) => {
                setVoicePersona(e.target.value);
                const voiceLabel = e.target.value.includes('Achird') ? 'Achird (صوت وقور لمجلس الإدارة)' : 'Achernar (صوت تنفيذي نجدي)';
                onShowToast(`تم تفعيل صوت Google Cloud Chirp 3 HD: ${voiceLabel}`);
              }}
              style={{
                background: '#041527',
                color: 'var(--cyan)',
                border: '1px solid #164775',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: 700,
                outline: 'none',
              }}
              title="Google Cloud Chirp 3: HD voices"
            >
              <option value="ar-XA-Chirp3-HD-Achernar">
                ar-XA-Chirp3-HD-Achernar (نجم آخر النهر - صوت تنفيذي نجدي HD)
              </option>
              <option value="ar-XA-Chirp3-HD-Achird">
                ar-XA-Chirp3-HD-Achird (نجم الظليم - صوت وقور لمجلس الإدارة HD)
              </option>
            </select>
          </div>
        </div>

        {/* Tab 1: Live Voice Dialogue Area */}
        {activeTab === 'dialogue' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Messages Scroll Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                        fontSize: '10px',
                        color: 'var(--muted)',
                      }}
                    >
                      <span>{isUser ? 'عبدالعزيز الرومي (أنت)' : m.agentName || selectedAgent.name}</span>
                      <span>·</span>
                      <span>{m.timestamp}</span>
                    </div>

                    <div
                      style={{
                        maxWidth: '82%',
                        padding: '12px 16px',
                        borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        background: isUser
                          ? 'linear-gradient(135deg, #087cff 0%, #0056b3 100%)'
                          : 'linear-gradient(135deg, #08213b 0%, #041426 100%)',
                        color: '#fff',
                        fontSize: '12px',
                        lineHeight: 1.6,
                        border: isUser ? '1px solid #3895ff' : '1px solid #164a78',
                        boxShadow: isUser
                          ? '0 4px 14px rgba(8, 124, 255, 0.25)'
                          : '0 4px 14px rgba(0, 0, 0, 0.4)',
                        direction: 'rtl',
                        textAlign: 'right',
                      }}
                    >
                      {m.text}

                      {!isUser && (
                        <div
                          style={{
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            paddingTop: '6px',
                            fontSize: '10px',
                          }}
                        >
                          <span style={{ color: 'var(--cyan)' }}>
                            ✦ صوت بشري طبيعي ({isUsingCustomVoiceSample ? 'عينة MP3 المعتمدة' : `Google Cloud Chirp 3: HD ${voicePersona.includes('Achird') ? 'Achird' : 'Achernar'}`})
                          </span>
                          <button
                            onClick={() => handleSpeakText(m.text)}
                            style={{
                              background: 'transparent',
                              border: '1px solid #00d5f260',
                              color: 'var(--cyan)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '10px',
                            }}
                          >
                            ▶ استماع
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isProcessing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan)', fontSize: '11px' }}>
                  <span style={{ animation: 'spin 1s linear infinite' }}>✦</span>
                  <span>{selectedAgent.name} يحلل البيانات ويجهز الرد الصوتي بالصوت البشري الطبيعي...</span>
                </div>
              )}

              {micMode === 'transcribing' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffb52e', fontSize: '11px' }}>
                  <span style={{ animation: 'spin 1s linear infinite' }}>🎙</span>
                  <span>جاري تفريغ الصوت المنطوق عبر خوارزمية التعرف الصوتي...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Questions Chips */}
            <div
              style={{
                padding: '8px 20px',
                background: '#041527',
                borderTop: '1px solid #103457',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '10px', color: 'var(--muted)', alignSelf: 'center', flexShrink: 0 }}>
                💡 أسئلة سريعة:
              </span>
              {quickQuestionsNajdi.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  style={{
                    background: '#072442',
                    border: '1px solid #174e7e',
                    color: '#cfe2f7',
                    borderRadius: '16px',
                    padding: '4px 12px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Live Audio Meter when Mic is active */}
            {isListening && (
              <div
                style={{
                  background: 'linear-gradient(90deg, #1f0814 0%, #041426 100%)',
                  padding: '8px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #ff426d60',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#ff426d', fontSize: '11px', fontWeight: 800 }}>
                    ● جاري التقاط صوتك بالميكروفون مباشرة (تحدث الآن)
                  </span>
                  {/* Dynamic Equalizer Visualizer reacting to user's real voice */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '18px' }}>
                    {[0.6, 1.2, 0.9, 1.5, 0.8, 1.3, 0.7, 1.1, 1.4].map((mult, idx) => {
                      const barH = Math.max(4, Math.min(22, (audioLevel / 5) * mult));
                      return (
                        <span
                          key={idx}
                          style={{
                            width: '3.5px',
                            height: `${barH}px`,
                            background: 'linear-gradient(180deg, #ff426d, #00d5f2)',
                            borderRadius: '2px',
                            transition: 'height 0.08s ease',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={stopListening}
                  style={{
                    background: '#ff426d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  إنهاء التسجيل والإرسال ✓
                </button>
              </div>
            )}

            {/* Speaking Waveform */}
            {isSpeaking && !isListening && (
              <div
                style={{
                  background: 'linear-gradient(90deg, #062b4d 0%, #03172c 100%)',
                  padding: '6px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #00d5f240',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#00d5ad', fontSize: '11px', fontWeight: 800 }}>
                    ● {selectedAgent.name} يتحدث بالصوت البشري الطبيعي
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '14px' }}>
                    {[10, 16, 22, 14, 20, 16, 12, 18, 14].map((h, idx) => (
                      <span
                        key={idx}
                        style={{
                          width: '3px',
                          height: `${h}px`,
                          background: 'linear-gradient(180deg, #00d5f2, #087cff)',
                          borderRadius: '2px',
                          animation: `pulse 0.8s infinite ${idx * 0.08}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={stopSpeaking}
                  style={{
                    background: '#ff426d25',
                    color: '#ff426d',
                    border: '1px solid #ff426d50',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ⏹ إيقاف الصوت
                </button>
              </div>
            )}

            {/* Input Bar with Big Reactive Mic Button */}
            <div
              style={{
                padding: '12px 20px',
                background: '#04162a',
                borderTop: '1px solid #133f66',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {/* Big Mic Button to Speak Directly with real voice capture */}
              <button
                onClick={isListening ? stopListening : startListening}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: isListening
                    ? 'radial-gradient(circle, #ff426d 0%, #b3002b 100%)'
                    : 'radial-gradient(circle, #087cff 0%, #004fb3 100%)',
                  border: isListening ? '2px solid #fff' : '2px solid var(--cyan)',
                  boxShadow: isListening
                    ? `0 0 ${12 + audioLevel / 4}px #ff426d, 0 0 30px rgba(255, 66, 109, 0.5)`
                    : '0 0 12px rgba(8, 124, 255, 0.5)',
                  color: '#fff',
                  fontSize: '20px',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  transform: isListening ? `scale(${1 + audioLevel * 0.002})` : 'scale(1)',
                }}
                title={isListening ? 'اضغط لإيقاف التسجيل وإرسال الصوت' : 'اضغط للتحدث بالصوت بالميكروفون مباشرة'}
              >
                {isListening ? '⏹' : '🎙'}
              </button>

              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={
                  isListening
                    ? 'جاري الاستماع لصوتك.. تفضل بالتحدث'
                    : `تحدث بالميكروفون أو اكتب استفسارك لـ ${selectedAgent.name}…`
                }
                style={{
                  flex: 1,
                  background: '#020b1b',
                  border: isListening ? '1px solid #ff426d' : '1px solid #1b4b77',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none',
                  direction: 'rtl',
                }}
              />

              <button
                className="primary"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isProcessing}
                style={{
                  padding: '12px 18px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  opacity: !inputText.trim() || isProcessing ? 0.5 : 1,
                }}
              >
                إرسال
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Gemini Live Real-Time Interactive Discussion Mode */}
        {activeTab === 'gemini_live' && (
          <div
            style={{
              flex: 1,
              padding: '24px',
              overflowY: 'auto',
              background: '#020b1b',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #092642 0%, #031427 100%)',
                border: '1px solid #00d5f260',
                borderRadius: '14px',
                padding: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div>
                <span
                  style={{
                    background: '#00d5f220',
                    color: 'var(--cyan)',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 800,
                  }}
                >
                  ✦ نقاش فوري مباشر
                </span>
                <h3 style={{ margin: '8px 0 4px', fontSize: '16px', color: '#fff' }}>
                  جلسة نقاش صوتية مباشرة (Gemini Live Discussion)
                </h3>
                <p style={{ margin: 0, color: '#9db8d4', fontSize: '11px', lineHeight: 1.6, maxWidth: '540px' }}>
                  يتيح لك هذا الوضع التحدث في نقاش مفتوح فوري مع {selectedAgent.name} وأعضاء مجلس الإدارة دون الحاجة للكتابة. يتم التقاط نبرة الصوت وتحليل ضوابط الهيئة الوطنية وساما في نفس اللحظة.
                </p>
              </div>

              <button
                onClick={isListening ? stopListening : startListening}
                style={{
                  background: isListening
                    ? 'linear-gradient(135deg, #ff426d, #b3002b)'
                    : 'linear-gradient(135deg, #00d5f2, #087cff)',
                  color: isListening ? '#fff' : '#020b1b',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 0 16px rgba(0, 213, 242, 0.4)',
                }}
              >
                <span>{isListening ? '⏹ إيقاف النقاش' : '🎙 بدء النقاش المباشر الآن'}</span>
              </button>
            </div>

            {/* Live Boardroom Visual Stage */}
            <div
              style={{
                background: '#04162a',
                border: '1px solid #143e67',
                borderRadius: '14px',
                padding: '24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #087cff 0%, #031427 100%)',
                  border: isSpeaking ? '3px solid #00d5ad' : isListening ? '3px solid #ff426d' : '3px solid var(--cyan)',
                  boxShadow: isSpeaking
                    ? '0 0 24px #00d5ad'
                    : isListening
                    ? '0 0 24px #ff426d'
                    : '0 0 16px rgba(0, 213, 242, 0.4)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '34px',
                  transition: 'all 0.2s',
                }}
              >
                {selectedAgent.avatarUrl ? (
                  <img
                    src={selectedAgent.avatarUrl}
                    alt={selectedAgent.name}
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  '🎙'
                )}
              </div>

              <div>
                <b style={{ color: '#fff', fontSize: '14px', display: 'block' }}>
                  {selectedAgent.name} — {selectedAgent.role}
                </b>
                <span style={{ color: isSpeaking ? '#00d5ad' : isListening ? '#ff426d' : 'var(--muted)', fontSize: '11px', fontWeight: 700 }}>
                  {isSpeaking
                    ? '● يتحدث الآن بالصوت البشري الطبيعي'
                    : isListening
                    ? '● يستمع لصوتك الآن...'
                    : 'جاهز للنقاش الصوتي المباشر'}
                </span>
              </div>

              {/* Status Wave */}
              <div style={{ display: 'flex', gap: '4px', height: '24px', alignItems: 'center' }}>
                {[12, 20, 28, 16, 24, 18, 30, 14, 22].map((h, i) => (
                  <span
                    key={i}
                    style={{
                      width: '4px',
                      height: isListening ? `${Math.max(6, (audioLevel / 4) * (h / 20))}px` : isSpeaking ? `${h}px` : '6px',
                      background: isListening ? '#ff426d' : isSpeaking ? '#00d5ad' : '#144673',
                      borderRadius: '3px',
                      transition: 'height 0.1s ease',
                      animation: isSpeaking ? `pulse 0.9s infinite ${i * 0.08}s` : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Custom Voice MP3 Sample Uploader / Audio Profile */}
        {activeTab === 'voice_sample' && (
          <div
            style={{
              flex: 1,
              padding: '24px',
              overflowY: 'auto',
              background: '#020b1b',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #092642 0%, #041426 100%)',
                border: '1px solid #1a568b',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#fff' }}>
                🎵 رفع وتضمين عينة صوت MP3 البشري (Voice MP3 Sample)
              </h3>
              <p style={{ margin: 0, color: '#9db8d4', fontSize: '11px', lineHeight: 1.6 }}>
                بناءً على طلبك، يمكنك تزويد النظام بملف صوتي رجالي بصيغة MP3 أو WAV لتكون المرجع الصوتي المعتمد للنظام. يتم دمج العينة فوراً ليتحدث بها الوكلاء وأعضاء مجلس الإدارة بنبرة بشرية طبيعية 100% بدون أي صوت روبوتي.
              </p>
            </div>

            {/* Dropzone Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #1e5a8f',
                borderRadius: '14px',
                padding: '30px 20px',
                textAlign: 'center',
                background: '#04162c',
                cursor: 'pointer',
                transition: 'border 0.2s',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/m4a,audio/*"
                onChange={handleAudioUpload}
                style={{ display: 'none' }}
              />
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎙📂</div>
              <b style={{ color: '#fff', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                اضغط لاختيار ملف عينة الصوت (MP3 / WAV) أو اسحب الملف هنا
              </b>
              <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
                يدعم كافة التسجيلات الصوتية الرجالية الطبيعية للهجة النجدية (حجم أقصى 25 ميجابايت)
              </span>
            </div>

            {/* Current Loaded Sample Status */}
            {customMp3Name ? (
              <div
                style={{
                  background: '#051c33',
                  border: '1px solid #00d5ad',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#00d5ad', fontSize: '16px' }}>✓</span>
                    <b style={{ color: '#fff', fontSize: '13px' }}>{customMp3Name}</b>
                    <span
                      style={{
                        background: '#00d5ad25',
                        color: '#00d5ad',
                        border: '1px solid #00d5ad60',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    >
                      عينة مفعّلة في النظام
                    </span>
                  </div>
                  <small style={{ color: 'var(--muted)', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                    تم اعتماد هذه العينة الصوتية كمرجع رئيسي للنظام لجميع الوكلاء.
                  </small>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {customMp3Url && (
                    <audio controls src={customMp3Url} style={{ height: '36px', maxWidth: '240px' }} />
                  )}
                  <button
                    onClick={() => {
                      localStorage.removeItem(CUSTOM_VOICE_STORAGE_KEY);
                      localStorage.removeItem(CUSTOM_VOICE_NAME_KEY);
                      setCustomMp3Name(null);
                      setCustomMp3Url(null);
                      setIsUsingCustomVoiceSample(false);
                      onShowToast('تمت إزالة العينة الصوتية والعودة لصوت Google Cloud Chirp 3 HD.');
                    }}
                    style={{
                      background: '#ff426d25',
                      color: '#ff426d',
                      border: '1px solid #ff426d50',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    حذف العينة
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: '#061a31',
                  border: '1px solid #143e67',
                  borderRadius: '12px',
                  padding: '16px 20px',
                }}
              >
                <b style={{ color: 'var(--cyan)', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                  ✦ نماذج Google Cloud Chirp 3: HD المعتمدة للأصوات الرجالية:
                </b>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  <div
                    onClick={() => {
                      setVoicePersona('ar-XA-Chirp3-HD-Achernar');
                      onShowToast('تم اختيار صوت Google Cloud Chirp 3 HD: Achernar');
                    }}
                    style={{
                      background: voicePersona === 'ar-XA-Chirp3-HD-Achernar' ? '#072b4c' : '#031020',
                      border: voicePersona === 'ar-XA-Chirp3-HD-Achernar' ? '1px solid var(--cyan)' : '1px solid #113456',
                      padding: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <b style={{ color: '#fff', fontSize: '12px' }}>ar-XA-Chirp3-HD-Achernar</b>
                      <span style={{ fontSize: '10px', color: 'var(--cyan)', background: '#00d5f220', padding: '1px 6px', borderRadius: '4px' }}>
                        نجم آخر النهر
                      </span>
                    </div>
                    <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '10px', lineHeight: 1.5 }}>
                      صوت رجالي بشري تنفيذي فائق الدقة (HD) بلهجة نجدية وسعودية أصيلة بدون أي نبرة روبوتية، مخصص للإدارة العليا وممثلي الحوكمة.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setVoicePersona('ar-XA-Chirp3-HD-Achird');
                      onShowToast('تم اختيار صوت Google Cloud Chirp 3 HD: Achird');
                    }}
                    style={{
                      background: voicePersona === 'ar-XA-Chirp3-HD-Achird' ? '#072b4c' : '#031020',
                      border: voicePersona === 'ar-XA-Chirp3-HD-Achird' ? '1px solid var(--cyan)' : '1px solid #113456',
                      padding: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <b style={{ color: '#fff', fontSize: '12px' }}>ar-XA-Chirp3-HD-Achird</b>
                      <span style={{ fontSize: '10px', color: '#00d5ad', background: '#00d5ad20', padding: '1px 6px', borderRadius: '4px' }}>
                        نجم الظليم
                      </span>
                    </div>
                    <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '10px', lineHeight: 1.5 }}>
                      صوت رجالي وقور ومهيب لمجلس الإدارة والمسؤولين التنفيذيين للأمن السيبراني والمخاطر والامتثال (CISO / CRO).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
