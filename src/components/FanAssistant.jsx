/**
 * FanAssistant.jsx - GenAI-grounded Smart Stadium Fan Assistant
 * 
 * DESIGN APPROACH:
 * This component connects directly to the Anthropic API (Claude model "claude-sonnet-4-6")
 * to provide intelligent, contextual guidance to stadium fans for the World Cup 2026.
 * 
 * To ensure answers are grounded in real-time stadium facts rather than hallucinated details,
 * we inject a system prompt containing the live telemetry context (current gate wait times,
 * zone densities, parking occupancies, weather, and safety/emergency status) pulled
 * dynamically from StadiumContext.
 * 
 * MULTILINGUAL & OUTPUT CONTROL:
 * The assistant is instructed to reply strictly in JSON format matching the schema:
 * { "reply": "conversational answer", "reasoning": "underlying logic" }
 * and to adapt to the currently selected language (en, es, fr, ar, hi, bn) within 2-3 sentences.
 * 
 * OFFLINE / EXCEPTION RESILIENCE:
 * In case VITE_ANTHROPIC_API_KEY is not set or network errors occur, the assistant
 * appends a developer notification and falls back automatically to its deterministic offline keyword
 * engine, ensuring the prototype remains fully functional under any presentation condition.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, Sparkles, User, ArrowRight } from 'lucide-react';
import { useStadium } from '../context/StadiumContext';
import { fanChatTranslations } from '../data/mockData';

export default function FanAssistant({ currentLanguage, setLanguage, addAlertNotification }) {
  const { stadiumData } = useStadium();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const translations = fanChatTranslations[currentLanguage] || fanChatTranslations['en'];

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: translations.greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reason: "Greeting customized based on language selection."
      }
    ]);
  }, [currentLanguage, translations.greeting]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // JSON helper to clean up Markdown-wrapped JSON if Claude returns it in a code block
  const parseJsonSafely = (rawText) => {
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    return JSON.parse(cleaned.trim());
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const lowercaseText = textToSend.toLowerCase();

    // 1. PRE-CHECK: Safety emergency overrides are handled instantly and deterministically
    if (
      lowercaseText.includes('emergency') || 
      lowercaseText.includes('fire') || 
      lowercaseText.includes('danger') || 
      lowercaseText.includes('evacuate')
    ) {
      const aiReplyText = "⚠️ SECURITY ANNOUNCEMENT. Remain calm. Evacuate to the nearest exit point immediately. Follow stewards and security. Dynamic evacuation route layout overlays have been loaded on your stadium map.";
      const aiReasonText = "Automated high-priority safety override trigger.";
      addAlertNotification();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reason: aiReasonText
      }]);
      setIsTyping(false);
      return;
    }

    // Prepare offline fallback function for reuse
    const runOfflineFallback = () => {
      let aiText = '';
      let aiReason = '';
      if (lowercaseText.includes('seat') || lowercaseText.includes('block') || lowercaseText.includes('asiento') || lowercaseText.includes('siège') || lowercaseText.includes('आसन') || lowercaseText.includes('আসন')) {
        aiText = translations.responses.seat;
        aiReason = "Offline Rule Engine: Resolved seat request from static stand charts.";
      } else if (lowercaseText.includes('food') || lowercaseText.includes('stall') || lowercaseText.includes('burger') || lowercaseText.includes('taco') || lowercaseText.includes('comida') || lowercaseText.includes('nourriture') || lowercaseText.includes('طعام') || lowercaseText.includes('भोजन') || lowercaseText.includes('খাবার')) {
        aiText = translations.responses.food;
        aiReason = "Offline Rule Engine: Found nearby concession names and estimated queue wait times.";
      } else if (lowercaseText.includes('parking') || lowercaseText.includes('car') || lowercaseText.includes('estacionamiento') || lowercaseText.includes('stationnement') || lowercaseText.includes('موقف') || lowercaseText.includes('पार्किंग') || lowercaseText.includes('পার্কিং')) {
        aiText = translations.responses.parking;
        aiReason = "Offline Rule Engine: Searched current lot capacity levels.";
      } else if (lowercaseText.includes('accessibility') || lowercaseText.includes('wheelchair') || lowercaseText.includes('disability') || lowercaseText.includes('accesibilidad') || lowercaseText.includes('accessibilité') || lowercaseText.includes('سيل') || lowercaseText.includes('सुगमता') || lowercaseText.includes('সহায়তা')) {
        aiText = translations.responses.access;
        aiReason = "Offline Rule Engine: Retrieved quiet room and elevator directions from ADA index.";
      } else {
        aiText = translations.responses.default;
        aiReason = "Offline Rule Engine: Formulated default routing recommendation.";
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-offline',
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reason: aiReason
      }]);
    };

    // 2. RETRIEVE API KEY AND INITIATE LIVE AI CALL
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    if (!apiKey) {
      // API Key warning
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-warning',
        sender: 'ai',
        text: "⚠️ VITE_ANTHROPIC_API_KEY is not configured in this environment. Falling back to the offline simulation core.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reason: "Offline fallback mode: No VITE_ANTHROPIC_API_KEY detected in .env"
      }]);
      
      // Delay slightly to feel conversational
      setTimeout(() => {
        runOfflineFallback();
        setIsTyping(false);
      }, 700);
      return;
    }

    // Build context strings from live telemetry
    const gatesInfo = stadiumData.gates.map(g => `- ${g.name}: wait time ${g.waitTime}m, density ${g.density}%, flow: ${g.currentFlow} fans/min, status: ${g.status}`).join('\n');
    const zonesInfo = stadiumData.zones.map(z => `- ${z.name}: density ${z.density}%`).join('\n');
    const parkingInfo = stadiumData.parking.map(p => `- ${p.name}: ${p.filled}% filled, flow: ${p.rate}, class: ${p.type}`).join('\n');
    const weatherInfo = `${stadiumData.weather.condition}, Temp: ${stadiumData.weather.tempC}°C (${stadiumData.weather.tempF}°F), Wind: ${stadiumData.weather.windKmh}km/h`;
    const emergencyInfo = stadiumData.emergencyState.active 
      ? `ACTIVE EMERGENCY: ${stadiumData.emergencyState.type} at ${stadiumData.emergencyState.location}. Evacuation Route: ${stadiumData.emergencyState.evacRoute.join(' -> ')}` 
      : 'All nominal. No safety incidents.';

    // Construct grounded system prompt
    const systemPrompt = `You are "FIFA Copilot 2026", the AI-powered Smart Stadium Assistant web app for the FIFA World Cup 2026 at the Hard Rock Stadium.
You must help fans with seating location, concessions, restrooms, parking lot capacities, weather forecasts, transit and security directives.
You MUST anchor your responses in the real-time stadium telemetry below:

[LIVE TELEMETRY]
GATES:
${gatesInfo}

STAND ZONES DENSITIES:
${zonesInfo}

PARKING:
${parkingInfo}

WEATHER:
${weatherInfo}

SAFETY INFRASTRUCTURE:
${emergencyInfo}

[INSTRUCTIONS]
1. Respond strictly in the currently requested language: "${currentLanguage}" (en: English, es: Spanish, fr: French, ar: Arabic, hi: Hindi, bn: Bengali).
2. Keep your answer brief (2-3 sentences max) since this is a compact stadium chat widget.
3. You MUST respond strictly in valid JSON format matching the schema:
{
  "reply": "Your brief conversational message to the fan in the requested language.",
  "reasoning": "A 1-sentence technical explanation (in English) outlining the live telemetry telemetry metrics or rules you used to determine this response."
}
Do not write any markdown code blocks or text outside the JSON. Return only the JSON object.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-access-outside-of-browser": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            { role: "user", content: textToSend }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const responseData = await response.json();
      const rawOutput = responseData.content[0].text;
      
      let parsedReply = '';
      let parsedReasoning = '';

      try {
        const parsed = parseJsonSafely(rawOutput);
        parsedReply = parsed.reply;
        parsedReasoning = parsed.reasoning;
      } catch (jsonErr) {
        // Safe try/catch fallback if Claude failed to return valid JSON
        parsedReply = rawOutput;
        parsedReasoning = "API response was parsed as raw text. JSON structure failed.";
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: parsedReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reason: parsedReasoning
      }]);

    } catch (err) {
      console.error("API Call Failed: ", err);
      // Append warning bubble about the network/API error
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-err',
        sender: 'ai',
        text: `⚠️ API Connection Issue: ${err.message || "Unable to reach Claude"}. Activating local core engine.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reason: "Connection failure: Fallback to nominal rules."
      }]);

      // Fallback offline execution
      runOfflineFallback();
    } finally {
      setIsTyping(false);
    }
  };

  const triggerQuickAction = (actionKey) => {
    const chipText = translations.quickActions[actionKey];
    handleSendMessage(chipText);
  };

  return (
    <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 rounded-[32px] p-6 h-[550px] flex flex-col justify-between relative shadow-sm transition-colors duration-300 fade-in">
      
      {/* Chat Header */}
      <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-[#121212] dark:bg-white text-white dark:text-black flex items-center justify-center font-extrabold text-sm rounded-xl tracking-tighter">
              AI
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#e2ff70] border-2 border-white dark:border-[#121212] rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 font-sans">
              <h2 className="text-sm font-bold tracking-tight text-neutral-800 dark:text-white uppercase">Stadium Co-Pilot</h2>
              <span className="bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-450 text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-full font-mono font-bold">
                Live Chat
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Language-adaptive wayfinding helper</p>
          </div>
        </div>

        {/* Selector */}
        <div className="flex items-center space-x-2 bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded-full">
          <Globe className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-450" />
          <select
            value={currentLanguage}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-neutral-700 dark:text-neutral-200 text-[11px] font-mono border-none outline-none focus:ring-0 cursor-pointer font-bold"
          >
            <option value="en" className="bg-white dark:bg-black text-black dark:text-white">English (EN)</option>
            <option value="es" className="bg-white dark:bg-black text-black dark:text-white">Español (ES)</option>
            <option value="fr" className="bg-white dark:bg-black text-black dark:text-white">Français (FR)</option>
            <option value="ar" className="bg-white dark:bg-black text-black dark:text-white">العربية (AR)</option>
            <option value="hi" className="bg-white dark:bg-black text-black dark:text-white">हिन्दी (HI)</option>
            <option value="bn" className="bg-white dark:bg-black text-black dark:text-white">বাংলা (BN)</option>
          </select>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center space-x-1 mb-1 font-mono text-[9px] text-neutral-400 dark:text-neutral-555">
              <span>{msg.timestamp}</span>
              {msg.sender === 'ai' ? (
                <span className="font-bold text-neutral-700 dark:text-neutral-350 flex items-center">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> AI COPILOT
                </span>
              ) : (
                <span className="flex items-center">
                  <User className="w-2.5 h-2.5 mr-0.5" /> FAN
                </span>
              )}
            </div>
            
            <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-[#121212] dark:bg-white text-white dark:text-black font-semibold rounded-tr-none' 
                : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-850 dark:text-neutral-100 border border-neutral-150 dark:border-neutral-800 shadow-sm'
            }`}>
              {msg.text}
            </div>

            {/* Reasoning footer */}
            {msg.sender === 'ai' && msg.reason && (
              <div className="mt-1 bg-[#e2ff70]/30 dark:bg-[#e2ff70]/10 border border-dashed border-[#e2ff70] p-2.5 rounded-xl max-w-[85%] text-[9px] text-neutral-700 dark:text-neutral-300 font-mono flex items-start space-x-1.5 leading-normal">
                <span className="text-white dark:text-black font-extrabold whitespace-nowrap bg-black dark:bg-white px-1.5 py-0.5 rounded text-[8px] leading-none">REASONING</span>
                <span>{msg.reason}</span>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-neutral-400 dark:text-neutral-500 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#121212] dark:bg-white animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#121212] dark:bg-white animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#121212] dark:bg-white animate-bounce [animation-delay:0.4s]" />
            <span>AI Copilot is resolving telemetry...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Suggestion Chips */}
      <div className="py-3.5 flex flex-wrap gap-2 border-t border-neutral-100 dark:border-neutral-800">
        {Object.keys(translations.quickActions).map((key) => (
          <button
            key={key}
            onClick={() => triggerQuickAction(key)}
            className="bg-neutral-50 dark:bg-neutral-900 hover:bg-[#e2ff70] dark:hover:bg-[#e2ff70] text-[#121212] dark:text-white dark:hover:text-black border border-neutral-200 dark:border-neutral-880 px-4 py-2 rounded-full text-[10px] font-bold flex items-center transition-all cursor-pointer shadow-sm hover:scale-102"
          >
            <span>{translations.quickActions[key]}</span>
            <ArrowRight className="w-3 h-3 ml-1 opacity-60" />
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
        className="flex items-center gap-2 bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2 rounded-2xl shadow-inner"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Copilot (e.g. 'parking', 'seat block')"
          className="flex-1 bg-transparent border-none text-xs text-neutral-850 dark:text-neutral-250 px-3 py-1 outline-none focus:ring-0 placeholder-neutral-400 font-medium"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className={`p-2.5 rounded-xl transition-all ${
            inputValue.trim() 
              ? 'bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 cursor-pointer shadow-sm' 
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
