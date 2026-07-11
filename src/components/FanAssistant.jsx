import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, Sparkles, User, ArrowRight } from 'lucide-react';
import { fanChatTranslations } from '../data/mockData';

export default function FanAssistant({ currentLanguage, setLanguage, addAlertNotification }) {
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

  const handleSendMessage = (textToSend) => {
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

    setTimeout(() => {
      let aiText = '';
      let aiReason = '';
      const lowercaseText = textToSend.toLowerCase();

      if (lowercaseText.includes('seat') || lowercaseText.includes('block') || lowercaseText.includes('asiento') || lowercaseText.includes('siège') || lowercaseText.includes('आसन') || lowercaseText.includes('আসন')) {
        aiText = translations.responses.seat;
        aiReason = "Derived from stadium seating layout registries.";
      } else if (lowercaseText.includes('food') || lowercaseText.includes('stall') || lowercaseText.includes('burger') || lowercaseText.includes('taco') || lowercaseText.includes('comida') || lowercaseText.includes('nourriture') || lowercaseText.includes('طعام') || lowercaseText.includes('भोजन') || lowercaseText.includes('খাবার')) {
        aiText = translations.responses.food;
        aiReason = "Calculated based on closest concession lines and lowest flow averages.";
      } else if (lowercaseText.includes('parking') || lowercaseText.includes('car') || lowercaseText.includes('estacionamiento') || lowercaseText.includes('stationnement') || lowercaseText.includes('موقف') || lowercaseText.includes('पार्किंग') || lowercaseText.includes('পার্কিং')) {
        aiText = translations.responses.parking;
        aiReason = "Derived from live loop barrier sensors at Lots A, B, C, D.";
      } else if (lowercaseText.includes('accessibility') || lowercaseText.includes('wheelchair') || lowercaseText.includes('disability') || lowercaseText.includes('accesibilidad') || lowercaseText.includes('accessibilité') || lowercaseText.includes('سيل') || lowercaseText.includes('सुगमता') || lowercaseText.includes('সহায়তা')) {
        aiText = translations.responses.access;
        aiReason = "Filtered from stadium accessibility registries database.";
      } else if (lowercaseText.includes('emergency') || lowercaseText.includes('fire') || lowercaseText.includes('danger') || lowercaseText.includes('evacuate')) {
        aiText = "⚠️ SECURITY ANNOUNCEMENT. Remain calm. Evacuate to the nearest exit point immediately. Dynamic evacuation route layout overlays have been loaded on your stadium map.";
        aiReason = "Automated high-priority safety override trigger.";
        addAlertNotification();
      } else {
        aiText = translations.responses.default;
        aiReason = "Derived from crowd density telemetry models.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reason: aiReason
      }]);
      setIsTyping(false);
    }, 1000);
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
            <span>Telemetry routing sync in progress...</span>
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
            className="bg-neutral-50 dark:bg-neutral-900 hover:bg-[#e2ff70] dark:hover:bg-[#e2ff70] text-[#121212] dark:text-white dark:hover:text-black border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-full text-[10px] font-bold flex items-center transition-all cursor-pointer shadow-sm hover:scale-102"
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
