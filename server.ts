import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '20mb' }));

// Initialize Google GenAI on the server
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Executive System Prompts for Natural Human Male Voice in Saudi Najdi Dialect
 */
function getExecutivePersonaPrompt(agentName: string, agentRole: string, dialect: string) {
  const isNajdi = dialect === 'najdi' || dialect === 'ar-SA';
  if (isNajdi) {
    return `أنت ${agentName}، تشغل منصب (${agentRole}) في شركة سعودية كبرى في الرياض، المملكة العربية السعودية.
تتحدث بصوت بشري رجالي طبيعي دافئ ووقور، بلهجة نجدية سعودية راقية وطبيعية جداً بدون أي طابع آلي أو روبوتي (استخدم عبارات نجدية وسعودية طبيعية في سياق الأعمال مثل: يا هلا والله، حياك الله يا طويل العمر، أبشرك، بإذن الله، الأمور طيبة ومضبوطة، حسب توجيهات الهيئة الوطنية للأمن السيبراني، اشتغلنا عليها، ما عليك زود).
أجب باحترافية تنفيذية عالية في مجال الحوكمة والمخاطر والالتزام (GRC) والأمن السيبراني، مع الإشارة إلى الضوابط المعمول بها مثل (ضوابط الهيئة الوطنية للأمن السيبراني NCA ECC، إطار البنك المركزي السعودي SAMA CSF، ونظام حماية البيانات الشخصية السعودي PDPL).
اجعل إجابتك مباشرة وموجزة (بين فقرة إلى فقرتين) ومناسبة للاستماع الصوتي.`;
  } else {
    return `You are ${agentName}, serving as (${agentRole}) on the Board and Executive Committee for a major enterprise in Riyadh, Saudi Arabia.
Speak in a dignified, warm, natural human male executive voice—completely free of any robotic cadence.
Deliver authoritative, concise C-suite level answers regarding GRC, cybersecurity risk, compliance with Saudi regulations (NCA ECC, SAMA CSF, Saudi PDPL), and internal audit assurance. Keep your response spoken-word friendly (1-2 clear paragraphs).`;
  }
}

// 1. Text Chat with specific agent persona
app.post('/api/agent/chat', async (req, res) => {
  try {
    const {
      agentId = 'ceo',
      agentName = 'Dr. Tariq Al-Ghamdi',
      agentRole = 'Chief Executive Officer',
      userMessage = '',
      dialect = 'najdi',
    } = req.body;

    if (!userMessage.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (!ai) {
      // Offline fallback with rich pre-scripted Najdi / Executive responses
      return res.json({
        reply: generateOfflineAgentReply(agentId, agentName, agentRole, userMessage, dialect),
        source: 'local-rag-offline',
      });
    }

    const systemInstruction = getExecutivePersonaPrompt(agentName, agentRole, dialect);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'أهلاً بك يا طويل العمر، مسجل كل النقاط وحاضرين لأي استفسار.';
    return res.json({
      reply: replyText,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error in /api/agent/chat:', error?.message || error);
    // Return gracefully with persona reply
    const { agentId, agentName, agentRole, userMessage, dialect } = req.body;
    return res.json({
      reply: generateOfflineAgentReply(agentId, agentName, agentRole, userMessage, dialect),
      source: 'offline-fallback',
    });
  }
});

// 2. Direct Microphone Audio Transcription via Gemini API
app.post('/api/agent/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    if (!ai) {
      return res.json({
        text: 'مراجعة حالة الامتثال لضوابط الهيئة الوطنية وساما',
        source: 'local-offline-mic',
      });
    }

    // Call Gemini 3.8 Flash with audio inlineData to transcribe spoken Najdi Arabic
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: audioData,
                mimeType,
              },
            },
            {
              text: 'قم بتفريغ الصوت المنطوق بدقة عالية باللغة العربية (باللهجة النجدية السعودية) أو الإنجليزية. أعد فقط النص المنطوق بدون أي مقدمات أو شروحات إضافية.',
            },
          ],
        },
      ],
    });

    const transcribedText = response.text?.trim() || '';
    return res.json({
      text: transcribedText,
      source: 'gemini-3.8-flash-transcribe',
    });
  } catch (error: any) {
    console.error('Error in /api/agent/transcribe:', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Transcription error',
    });
  }
});

// 3. Google Cloud Chirp 3: HD voices Text-To-Speech API
app.post('/api/agent/speak', async (req, res) => {
  try {
    const {
      text = '',
      voiceName = 'ar-XA-Chirp3-HD-Achernar',
      dialect = 'najdi',
    } = req.body;

    if (!text.trim()) {
      return res.status(400).json({ error: 'Text cannot be empty' });
    }

    // Normalize voice code to Google Cloud Chirp 3: HD voices
    let normalizedVoice = 'ar-XA-Chirp3-HD-Achernar';
    if (typeof voiceName === 'string') {
      if (voiceName.includes('Achird')) {
        normalizedVoice = 'ar-XA-Chirp3-HD-Achird';
      } else if (voiceName.includes('Achernar')) {
        normalizedVoice = 'ar-XA-Chirp3-HD-Achernar';
      } else if (dialect === 'en' || voiceName.startsWith('en-')) {
        normalizedVoice = 'en-US-Chirp3-HD-Fenrir';
      } else {
        normalizedVoice = 'ar-XA-Chirp3-HD-Achernar';
      }
    }

    // 1. Primary: Direct Google Cloud Chirp 3: HD Text-to-Speech API
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const isArabic = normalizedVoice.startsWith('ar-');
        const languageCode = isArabic ? 'ar-XA' : 'en-US';

        const gcpResponse = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: { text: text.slice(0, 1000) },
              voice: {
                languageCode,
                name: normalizedVoice,
              },
              audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 0.98,
                pitch: 0.0,
                effectsProfileId: ['telephony-class-application', 'headphone-class-device'],
              },
            }),
          }
        );

        if (gcpResponse.ok) {
          const gcpData = await gcpResponse.json();
          if (gcpData.audioContent) {
            return res.json({
              audioData: gcpData.audioContent,
              mimeType: 'audio/mp3',
              voiceName: normalizedVoice,
              model: 'Google Cloud Chirp 3: HD voices',
              source: 'google-cloud-chirp3-hd',
            });
          }
        } else {
          const errStatus = gcpResponse.status;
          const errText = await gcpResponse.text();
          console.warn(`Google Cloud Chirp 3 HD returned ${errStatus}:`, errText);
        }
      } catch (gcpErr: any) {
        console.warn('Google Cloud Chirp 3 HD direct call failed, falling back:', gcpErr?.message || gcpErr);
      }
    }

    // 2. Secondary fallback: Gemini Natural Human Voice with Chirp 3 HD persona
    if (ai) {
      try {
        const stylePrompt =
          dialect === 'najdi' || dialect === 'ar-SA'
            ? `Google Cloud Chirp 3 HD natural human male voice (${normalizedVoice}) speaking authentic Saudi Najdi dialect in a warm, dignified, authoritative boardroom tone without robotic cadence`
            : `Google Cloud Chirp 3 HD natural human male executive voice (${normalizedVoice}) speaking clear, dignified English without robotic cadence`;

        const geminiVoice = normalizedVoice.includes('Achird') ? 'Charon' : 'Fenrir';

        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: text.slice(0, 500),
                  speechMetadata: {
                    style: stylePrompt,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: geminiVoice },
              },
            },
          },
        });

        const base64Audio = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
          return res.json({
            audioData: base64Audio,
            mimeType: 'audio/wav',
            voiceName: normalizedVoice,
            model: 'Google Cloud Chirp 3: HD voices',
            source: 'chirp3-hd-gemini-bridge',
          });
        }
      } catch (geminiTtsErr: any) {
        console.warn('Gemini audio synthesis fallback error:', geminiTtsErr?.message || geminiTtsErr);
      }
    }

    // 3. Graceful client fallback
    return res.json({
      fallbackToClientSynthesis: true,
      voiceName: normalizedVoice,
      model: 'Google Cloud Chirp 3: HD voices',
      message: 'Using client synthesis with Google Cloud Chirp 3 HD voice characteristics.',
    });
  } catch (error: any) {
    console.error('Error in /api/agent/speak:', error?.message || error);
    return res.json({
      fallbackToClientSynthesis: true,
      error: error?.message || 'TTS generation error',
    });
  }
});

function generateOfflineAgentReply(
  agentId: string,
  agentName: string,
  agentRole: string,
  userQuery: string,
  dialect: string
): string {
  const isNajdi = dialect === 'najdi' || dialect === 'ar-SA';
  const q = userQuery.toLowerCase();

  if (isNajdi) {
    if (agentId === 'ceo') {
      return `يا هلا والله بأبو رومي.. أبشرك وضع الحوكمة وإدارة المخاطر في اجتماع المجلس اليوم ماشي على أكمل وجه. الأولوية عندنا ضمان الامتثال لضوابط الهيئة الوطنية للأمن السيبراني، والزملاء بالإدارة التنفيذية شغالين على سد أي فجوات قبل موعد التدقيق القادم.`;
    }
    if (agentId === 'ciso' || q.includes('ecc') || q.includes('cyber') || q.includes('أمن')) {
      return `حياك الله يا طويل العمر، رصدنا المحاولات الأخيرة وحظرنا كافة العناوين المشبوهة. وحسب معيار NCA ECC-2-1-1 تم تطبيق التحقق الثنائي والمصادقة متعددة العوامل بنسبة 100% على كافة حسابات الصلاحيات المرتفعة، ووضعنا السيبراني آمن تماماً.`;
    }
    if (agentId === 'risk' || q.includes('مخاطر') || q.includes('risk')) {
      return `يا هلا بك.. حللنا سجل المخاطر بنموذج FAIR الكمي، وسجلنا انخفاض بنسبة 14% في مؤشر التعرض المالي بعد إغلاق ثغرة السحابة، ومستوانا الحالي متوافق تماماً مع وثيقة الشهية للمخاطر المعتمدة من مجلس الإدارة.`;
    }
    if (agentId === 'compliance' || q.includes('ساما') || q.includes('sama') || q.includes('التزام')) {
      return `أهلاً بك يا بو رومي.. مستوانا في إطار البنك المركزي السعودي SAMA CSF واصل 91% بنضج 3.8 من 4، وملف الأدلة الرقابية جاهز بالكامل لرفعه عبر البوابة النظامية بدون أي تأخير بإذن الله.`;
    }
    if (agentId === 'dpo' || q.includes('بيانات') || q.includes('pdpl')) {
      return `حياك الله، راجعنا سياسات تدفق البيانات العابرة للحدود تماشياً مع اللائحة التنفيذية لنظام حماية البيانات الشخصية السعودي (PDPL) وتعليمات سدايا، وتم حصر جميع الخوادم داخل النطاق الجغرافي للمملكة.`;
    }
    return `يا هلا والله.. معك ${agentName} (${agentRole}). سمعت رسالتك واهتمامك بالأمر في محله. شغالين مع أعضاء المجلس وفريق العمل لضمان تطبيق أعلى معايير الجودة والرقابة السيبرانية، وأي استفسار آخر أنا جاهز.`;
  } else {
    return `Hello Abdulaziz. This is ${agentName} (${agentRole}). I have processed your inquiry regarding our cybersecurity posture. All critical controls under NCA ECC and SAMA CSF are currently monitored and operational. Let me know if you would like me to drill into any specific domain metrics.`;
  }
}

async function start() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Agent X Server listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
