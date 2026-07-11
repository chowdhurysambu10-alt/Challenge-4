/**
 * FanAssistant.jsx - GenAI-grounded Smart Stadium Fan Assistant
 * 
 * DESIGN APPROACH:
 * This component connects to the local API server proxy (/api/chat) to query Google Gemini 2.5 Flash.
 * To ensure answers are grounded in real-time stadium facts rather than hallucinated details,
 * we send the live telemetry context (current gate wait times, zone densities, parking occupancies,
 * weather, and safety/emergency status) pulled dynamically from StadiumContext.
 * 
 * ACCESSIBILITY & CONVERSATION MEMORY:
 * - Integrates voice synthesis (Web Speech API) to speak responses when Voice Guidance is toggled on.
 * - Stores local chat log history and maps it to the API payload to maintain short-term context memory.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Globe, Send, Sparkles, User, Volume2, VolumeX } from 'lucide-react';
import { useStadium } from '../context/StadiumContext';
import { fanChatTranslations } from '../data/mockData';
import { buildTelemetrySnapshot, getOfflineResponse, isEmergencyMessage } from '../lib/fanAssistant';

const MAX_MESSAGES = 50;

function createMessage({ sender, text, basis = '' }) {
  return {
    id: crypto.randomUUID(),
    sender,
    text,
    basis,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

export default function FanAssistant({ currentLanguage, setLanguage }) {
  const { stadiumData, voiceGuidance, setVoiceGuidance } = useStadium();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const requestControllerRef = useRef(null);
  const translations = fanChatTranslations[currentLanguage] || fanChatTranslations.en;

  const appendMessage = useCallback((message) => {
    setMessages((currentMessages) => [...currentMessages, message].slice(-MAX_MESSAGES));
  }, []);

  // Welcome message injection
  useEffect(() => {
    if (!hasInitializedRef.current) {
      appendMessage(createMessage({
        sender: 'ai',
        text: translations.greeting,
        basis: 'Local demo assistant'
      }));
      hasInitializedRef.current = true;
    }
  }, [appendMessage, translations.greeting]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => () => {
    requestControllerRef.current?.abort();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Voice output function for accessibility narration
  const speakTextAloud = (text) => {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage === 'es' ? 'es-ES' :
                     currentLanguage === 'fr' ? 'fr-FR' :
                     currentLanguage === 'ar' ? 'ar-SA' :
                     currentLanguage === 'hi' ? 'hi-IN' :
                     currentLanguage === 'bn' ? 'bn-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Web Speech synthesis failed: ", err);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const message = textToSend.trim();
    if (!message || isTyping) return;

    appendMessage(createMessage({ sender: 'user', text: message }));
    setInputValue('');
    setIsTyping(true);

    // 1. Safety Emergency keyword overrides
    if (isEmergencyMessage(message)) {
      const safetyReply = 'For a real emergency, follow official venue announcements, use the nearest safe exit only when instructed, and alert nearby staff or emergency services. This demo cannot trigger or verify an emergency response.';
      appendMessage(createMessage({
        sender: 'ai',
        text: safetyReply,
        basis: 'Safety guidance; no simulated incident was created'
      }));
      setIsTyping(false);
      if (voiceGuidance) speakTextAloud(safetyReply);
      return;
    }

    const controller = new AbortController();
    requestControllerRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 12_000);

    // Map conversation logs to API history array to enable memory
    const historyPayload = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      text: msg.text
    })).slice(-8); // send last 8 messages of history context

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message,
          language: currentLanguage,
          history: historyPayload,
          telemetry: buildTelemetrySnapshot(stadiumData)
        }),
        signal: controller.signal
      });
      const responseBody = await response.json();

      if (!response.ok || !responseBody.reply) {
        throw new Error('Live assistant unavailable.');
      }

      appendMessage(createMessage({
        sender: 'ai',
        text: responseBody.reply,
        basis: responseBody.basis || 'Live telemetry response'
      }));

      // Speak response aloud if accessibility voice guidance is active
      if (voiceGuidance) {
        speakTextAloud(responseBody.reply);
      }
    } catch {
      const fallback = getOfflineResponse(message, translations, stadiumData);
      const fallbackText = fallback.reply;
      appendMessage(createMessage({
        sender: 'ai',
        text: fallbackText,
        basis: `${fallback.basis}. Live assistant unavailable; using local demo data.`
      }));

      if (voiceGuidance) {
        speakTextAloud(fallbackText);
      }
    } finally {
      window.clearTimeout(timeoutId);
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }
      setIsTyping(false);
    }
  };

  return (
    <section
      className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 rounded-[32px] p-6 h-[550px] flex flex-col justify-between relative shadow-sm transition-colors duration-300 fade-in"
      aria-labelledby="fan-assistant-heading"
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="relative" aria-hidden="true">
            <div className="w-10 h-10 bg-[#121212] dark:bg-white text-white dark:text-black flex items-center justify-center font-extrabold text-sm rounded-xl tracking-tighter">AI</div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#e2ff70] border-2 border-white dark:border-[#121212] rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 font-sans">
              <h2 id="fan-assistant-heading" className="text-sm font-bold tracking-tight text-neutral-800 dark:text-white uppercase">Stadium Co-Pilot</h2>
              <span className="bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-full font-mono font-bold">Live AI</span>
            </div>
            <p className="text-[10px] text-neutral-600 dark:text-neutral-300">Language-adaptive wayfinding helper</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Voice Guidance Toggle */}
          <button
            onClick={() => setVoiceGuidance(!voiceGuidance)}
            className={`p-1.5 rounded-full border transition-all ${
              voiceGuidance 
                ? 'bg-[#e2ff70] text-black border-[#e2ff70]' 
                : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-450 border-neutral-200 dark:border-neutral-800'
            }`}
            title={voiceGuidance ? "Disable Voice Guidance" : "Enable Voice Guidance (Speak replies aloud)"}
            aria-pressed={voiceGuidance}
          >
            {voiceGuidance ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Language Selector */}
          <div className="flex items-center space-x-2 bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded-full">
            <Globe className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" aria-hidden="true" />
            <label className="sr-only" htmlFor="chat-language">Chat language</label>
            <select
              id="chat-language"
              value={currentLanguage}
              onChange={(event) => setLanguage(event.target.value)}
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
      </div>

      <div
        className="flex-1 overflow-y-auto py-4 space-y-4 px-1 scrollbar-thin"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label="Conversation with Stadium Co-Pilot"
      >
        {messages.map((message) => (
          <div key={message.id} className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center space-x-1 mb-1 font-mono text-[9px] text-neutral-600 dark:text-neutral-300">
              <span>{message.timestamp}</span>
              {message.sender === 'ai' ? (
                <span className="font-bold text-neutral-700 dark:text-neutral-200 flex items-center"><Sparkles className="w-2.5 h-2.5 mr-0.5" aria-hidden="true" /> AI COPILOT</span>
              ) : (
                <span className="flex items-center"><User className="w-2.5 h-2.5 mr-0.5" aria-hidden="true" /> FAN</span>
              )}
            </div>

            <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
              message.sender === 'user'
                ? 'bg-[#121212] dark:bg-white text-white dark:text-black font-semibold rounded-tr-none'
                : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-850 dark:text-neutral-100 border border-neutral-150 dark:border-neutral-800 shadow-sm'
            }`}>
              {message.text}
            </div>

            {message.sender === 'ai' && message.basis && (
              <div className="mt-1 bg-[#e2ff70]/30 dark:bg-[#e2ff70]/10 border border-dashed border-[#8da800] dark:border-[#e2ff70] p-2.5 rounded-xl max-w-[85%] text-[9px] text-neutral-700 dark:text-neutral-200 font-mono flex items-start space-x-1.5 leading-normal">
                <span className="text-white dark:text-black font-extrabold whitespace-nowrap bg-black dark:bg-white px-1.5 py-0.5 rounded text-[8px] leading-none">DATA BASIS</span>
                <span>{message.basis}</span>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-300 text-[10px] font-mono" aria-live="polite">
            <span className="w-1.5 h-1.5 rounded-full bg-[#121212] dark:bg-white animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#121212] dark:bg-white animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#121212] dark:bg-white animate-bounce [animation-delay:0.4s]" />
            <span>Co-Pilot is checking the demo telemetry.</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="py-3.5 flex flex-wrap gap-2 border-t border-neutral-100 dark:border-neutral-800" aria-label="Quick chat actions">
        {Object.entries(translations.quickActions).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSendMessage(label)}
            disabled={isTyping}
            className="bg-neutral-50 dark:bg-neutral-900 hover:bg-[#e2ff70] dark:hover:bg-[#e2ff70] text-[#121212] dark:text-white dark:hover:text-black border border-neutral-200 dark:border-neutral-880 px-4 py-2 rounded-full text-[10px] font-bold flex items-center transition-all cursor-pointer shadow-sm hover:scale-102 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{label}</span>
            <ArrowRight className="w-3 h-3 ml-1 opacity-60" aria-hidden="true" />
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => { event.preventDefault(); handleSendMessage(inputValue); }}
        className="flex items-center gap-2 bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2 rounded-2xl shadow-inner"
      >
        <label className="sr-only" htmlFor="chat-input-message">Message text</label>
        <input
          id="chat-input-message"
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Ask Copilot (e.g. 'parking', 'seat block')"
          className="flex-1 bg-transparent border-none text-xs text-neutral-850 dark:text-neutral-250 px-3 py-1 outline-none focus:ring-0 placeholder-neutral-400 font-medium"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className={`p-2.5 rounded-xl transition-all ${
            inputValue.trim() && !isTyping
              ? 'bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 cursor-pointer shadow-sm'
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
          }`}
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="sr-only">Send</span>
        </button>
      </form>
    </section>
  );
}
