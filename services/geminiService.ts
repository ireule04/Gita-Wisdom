
import { GoogleGenAI, Modality } from "@google/genai";
import { INITIAL_VERSES } from '../data';
import { GitaVerse } from '../types';

// Note: In a production app, these environment variables would be securely managed.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are Krishna, the divine guide. 
Your goal is to offer wisdom from the Bhagavad Gita that is **short, sweet, and directly applicable**.

Rules:
1. **Be Concise**: Keep answers under 3-4 sentences unless a deep explanation is requested.
2. **No Fluff**: Get straight to the soul of the matter.
3. **Format**: Use **bold** for key concepts. Use bullet points for lists.
4. **Tone**: Loving, authoritative, calm, and poetic.
5. **Reference**: Mention Chapter.Verse briefly if applicable (e.g., "As I told Arjuna in 2.47...").

Avoid long preambles. Speak directly to the heart.
`;

const isQuotaError = (e: any): boolean => {
    try {
        if (e?.message === "QUOTA_EXCEEDED") return true;
        const str = JSON.stringify(e);
        const msg = e?.message || '';
        return (
            str.includes('429') || 
            str.includes('RESOURCE_EXHAUSTED') || 
            msg.includes('429') || 
            msg.includes('RESOURCE_EXHAUSTED') ||
            e?.status === 429 || 
            e?.code === 429 ||
            e?.error?.code === 429
        );
    } catch {
        return false;
    }
};

export const streamChatResponse = async (history: { role: string; parts: { text: string }[] }[], userMessage: string) => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: history,
    });

    const result = await chat.sendMessageStream({ message: userMessage });
    return result;
  } catch (error) {
    if (isQuotaError(error)) {
        console.warn("Chat quota exceeded.");
        throw new Error("QUOTA_EXCEEDED");
    }
    console.error("Chat Error:", error);
    throw error;
  }
};

// Global Memory Cache for Audio
export const AUDIO_CACHE = new Map<string, string>();

export const generateSpeech = async (text: string, cacheKey?: string): Promise<string> => {
   if (!apiKey) return '';

   // Check cache first
   if (cacheKey && AUDIO_CACHE.has(cacheKey)) {
       return AUDIO_CACHE.get(cacheKey)!;
   }

   // Robust cleaning
   const cleanText = text.replace(/[*_#`~]/g, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

   try {
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash-preview-tts',
       contents: [{
         parts: [{ text: cleanText }]
       }],
       config: {
         responseModalities: [Modality.AUDIO],
         speechConfig: {
           voiceConfig: {
             prebuiltVoiceConfig: { voiceName: 'Kore' } // Deep, calm voice suitable for wisdom
           }
         }
       }
     });

     const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
     
     if (base64Audio && cacheKey) {
         AUDIO_CACHE.set(cacheKey, base64Audio);
     }
     
     return base64Audio || '';
   } catch (error: any) {
     if (isQuotaError(error)) {
         throw new Error("QUOTA_EXCEEDED");
     }
     console.error("TTS Error:", error);
     return '';
   }
};

export const streamSpeech = async (text: string, onChunk: (base64: string) => void): Promise<string> => {
    if (!apiKey) return '';
    
    // Aggressive cleaning for smooth TTS
    const cleanText = text.replace(/[*_#`~]/g, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    try {
        const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{
                parts: [{ text: cleanText }]
            }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }
                    }
                }
            }
        });

        const chunks: string[] = [];
        for await (const chunk of response) {
            const data = chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (data) {
                onChunk(data);
                chunks.push(data);
            }
        }
        return chunks.join('');
    } catch (e: any) {
        if (isQuotaError(e)) {
            // Do not log huge JSON to console for expected 429s
            throw new Error("QUOTA_EXCEEDED");
        }
        console.error("TTS Stream Error", e);
        throw e;
    }
}

export const generateMoreVerses = async (count: number = 5, existingIds: number[], category: string = 'All'): Promise<any[]> => {
    if (!apiKey) return [];

    let categoryContext = "";
    if (category && category !== 'All') {
        categoryContext = `IMPORTANT: The generated verses MUST be strictly related to the theme of "${category}".`;
    }

    const prompt = `
      Generate ${count} distinct, important teachings from the Bhagavad Gita that are NOT in this list of IDs: ${existingIds.join(', ')}.
      ${categoryContext}
      
      Return ONLY a valid JSON array. Do not wrap in markdown code blocks. Each object must strictly follow this schema:
      {
        "chapter": number,
        "verse": number,
        "sanskrit": "string (Devanagari)",
        "transliteration": "string (IAST)",
        "translation": "string (English)",
        "coreTeaching": "string (2-3 sentences)",
        "practicalApplication": "string (2-3 sentences)",
        "tags": ["string", "string"]
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      
      let text = response.text;
      if (!text) return [];
      
      // Cleanup Markdown if present (```json ... ```)
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      if (isQuotaError(e)) {
          console.warn("Generate verses quota exceeded");
          return [];
      }
      console.error("Verse Generation Error", e);
      return [];
    }
}

export const getSpecificVerse = async (chapter: number, verse: number): Promise<GitaVerse | null> => {
    if (!apiKey) return null;

    const prompt = `
      Retrieve Bhagavad Gita Chapter ${chapter}, Verse ${verse}.
      Return ONLY a JSON object. Do not wrap in markdown code blocks. Schema:
      {
        "chapter": ${chapter},
        "verse": ${verse},
        "sanskrit": "string (Devanagari)",
        "transliteration": "string (IAST)",
        "translation": "string (English)",
        "coreTeaching": "string (2-3 sentences)",
        "practicalApplication": "string (2-3 sentences)",
        "tags": ["string", "string"]
      }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        let text = response.text;
        if (!text) return null;
        
        // Cleanup Markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const data = JSON.parse(text);
        const id = chapter * 1000 + verse;
        
        return { ...data, id };
    } catch (e) {
        if (isQuotaError(e)) {
            console.warn("Get specific verse quota exceeded");
            return null;
        }
        console.error("Specific Verse Fetch Error", e);
        return null;
    }
}
