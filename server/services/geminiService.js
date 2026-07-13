import { getSchedules, getConcessions, logAiUsage } from './dbService.js';
import { parseAssistantResponse, validateChatRequest } from '../chatService.js';

export async function handleChatRequest(request, response, readJson, sendJson, canRequest, getClientAddress) {
  if (!canRequest(getClientAddress(request))) {
    sendJson(response, 429, { error: 'Too many assistant requests. Please wait and try again.' });
    return;
  }

  try {
    const json = await readJson(request);
    const validation = validateChatRequest(json);
    if (!validation.valid) {
      sendJson(response, 400, { error: validation.error });
      return;
    }

    const schedules = await getSchedules();
    const concessions = await getConcessions();

    const telemetry = validation.value.telemetry;
    const language = validation.value.language;
    const userMessage = validation.value.message;

    // Grounding prompt with the local knowledge base
    const systemPrompt = `You are FIFA Copilot, a stadium operations and wayfinding assistant for the FIFA World Cup 2026 at Hard Rock Stadium.
Treat all telemetry as simulation data.
Reply in ${language}. Keep the reply to two short sentences.
Return valid JSON only matching the schema: {"reply":"...","basis":"brief factual source description"}.
The basis must be a factual citation such as "Gate 2 wait: 8 minutes", never expose private model reasoning.

Stadium Knowledge Base:
- Match Schedules:
${schedules.map(s => `  * ${s.match} is on ${s.date} at ${s.time} (Status: ${s.status})`).join('\n')}
- Concessions & POIs:
${concessions.map(c => `  * ${c.name} is in ${c.zone} (${c.location}) - Type: ${c.type}`).join('\n')}
- Restrooms & Medical:
  * Restroom A (North) in Zone A - Accessibility Equipped.
  * Restroom B (East) in Zone B - Next to Gate 4.
  * Restroom C (South) in Zone C - Accessibility Equipped.
  * Restroom D (West) in Zone D - Next to sensory quiet room.
  * Medical Station Red Cross is in Zone C.
  * Sensory Quiet Room 1 is in Zone D.
  * Wheelchair Shuttle Gate is in Zone D.
- Telemetry:
  * Emergency State: ${JSON.stringify(telemetry.emergency)}
  * Gates Wait times: ${telemetry.gates.map(g => `${g.name}: wait ${g.waitTime}m`).join(', ')}
  * Zones density: ${telemetry.zones.map(z => `${z.name}: density ${z.density}%`).join(', ')}`;

    // Call Gemini REST API if key is available
    const activeKey = process.env.GEMINI_API_KEY;
    if (!activeKey) {
      const fallbackReply = getLocalFallback(userMessage, language);
      await logAiUsage(detectIntent(userMessage), 150);
      sendJson(response, 200, { available: true, ...fallbackReply });
      return;
    }

    const contents = validation.value.history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`;
    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: "OBJECT",
            properties: {
              reply: { type: "STRING" },
              basis: { type: "STRING" }
            },
            required: ["reply", "basis"]
          }
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini status ${res.status}`);
    }

    const resData = await res.json();
    const rawOutput = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const assistantResponse = parseAssistantResponse(rawOutput);

    if (!assistantResponse) {
      throw new Error('Gemini returned an invalid response.');
    }

    // Log AI Usage for Analytics
    const promptLength = userMessage.length;
    const responseLength = assistantResponse.reply.length;
    await logAiUsage(detectIntent(userMessage), Math.round((promptLength + responseLength) / 4));

    sendJson(response, 200, { available: true, ...assistantResponse });
  } catch (err) {
    console.error("Gemini routing error:", err);
    sendJson(response, 502, { error: 'The live assistant is unavailable. Try again later.' });
  }
}

function detectIntent(message) {
  const msg = message.toLowerCase();
  if (msg.includes('gate')) return 'Wayfinding';
  if (msg.includes('food') || msg.includes('burger') || msg.includes('taco') || msg.includes('coffee')) return 'Concessions';
  if (msg.includes('restroom') || msg.includes('toilet') || msg.includes('washroom')) return 'Amenities';
  if (msg.includes('emergency') || msg.includes('exit') || msg.includes('safety') || msg.includes('fire')) return 'Safety';
  if (msg.includes('schedule') || msg.includes('match') || msg.includes('play')) return 'Schedules';
  return 'General';
}

function getLocalFallback(message, language) {
  const msg = message.toLowerCase();
  let reply = "I am a wayfinding assistant. Please refer to nearby staff for more help.";
  let basis = "Local demo fallback";

  if (msg.includes('gate 2') || msg.includes('gate b') || msg.includes('gate a')) {
    reply = language === 'es' 
      ? "Utilice el Concurso de Acceso Norte-Este para llegar a la Puerta 2 o Puerta B." 
      : "Please use the North-East Access Concourse to reach Gate 2 or Gate B.";
    basis = "Concourse A/B maps";
  } else if (msg.includes('restroom') || msg.includes('toilet') || msg.includes('washroom')) {
    reply = language === 'es' 
      ? "El baño más cercano está en la Zona A, totalmente equipado con accesibilidad." 
      : "The nearest restroom is located in Zone A, fully accessibility equipped.";
    basis = "Amenities directory";
  } else if (msg.includes('emergency') || msg.includes('exit')) {
    reply = language === 'es' 
      ? "En caso de emergencia, siga las señales de salida iluminadas en verde hacia la explanada exterior." 
      : "In case of emergency, follow the green illuminated exit signs towards the outer open apron.";
    basis = "Evacuation standard procedures";
  } else if (msg.includes('schedule') || msg.includes('match')) {
    reply = language === 'es' 
      ? "El próximo partido es el Grupo A: USA vs Italia programado para el 15 de junio de 2026." 
      : "The next match is Group A: USA vs Italy scheduled on June 15, 2026.";
    basis = "FIFA Match Schedules";
  }

  return { reply, basis };
}
