import React, { useState } from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ConciergeSupportChat: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'concierge',
      name: 'FabriQ Atelier Concierge',
      text: "Hello CH Rakesh! I'm your FabriQ Concierge today. How can I help with your garment care, pickup, or custom requests?",
      time: '10:24 AM',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    },
    {
      sender: 'user',
      text: "I'd like to request light starch for my formal shirts in order #FBQ-8829.",
      time: '10:25 AM',
    },
    {
      sender: 'concierge',
      name: 'FabriQ AI Care Concierge',
      text: "Consider it done! I've updated your care preference to Light Starch with hanger press for order #FBQ-8829.",
      time: '10:26 AM',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: input.trim(), time: 'Just now' },
    ]);
    const currentInput = input;
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'concierge',
          name: 'FabriQ AI Care Concierge',
          text: `Thank you for your instruction regarding "${currentInput}". Our valet master team has updated your garment ticket. Is there anything else I can assist with?`,
          time: 'Just now',
          avatar:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#FAFAFC] text-slate-900 min-h-screen font-sans">
      {/* Top Status Header */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md px-5 py-3 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <span className="text-[10px] font-bold text-[#9E7B4F] uppercase tracking-widest block font-sans">
              24/7 SUPPORT & CARE
            </span>
            <span className="font-['Libre_Caslon_Text',serif] text-base font-bold text-slate-900">
              Order #FBQ-8829
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/?text=Hello%20FabriQ%20Support,%20I%20am%20chatting%20regarding%20Order%20%23FBQ-8829."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all shadow-2xs"
            title="Official WhatsApp Support Line"
          >
            <span className="material-symbols-outlined text-[14px]">chat</span>
            <span className="hidden sm:inline">WhatsApp Support</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-[#83633B]">Concierge Online</span>
          </div>
        </div>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 px-5 py-4 space-y-4">
        <div className="text-center my-2">
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider font-sans">
            Today • Active Ticket
          </span>
        </div>

        {messages.map((msg, index) => (
          <div key={index}>
            {msg.sender === 'concierge' ? (
              <div className="flex items-end gap-2.5">
                <img
                  src={msg.avatar}
                  alt="Concierge Avatar"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#9E7B4F]/30 shrink-0"
                />
                <div className="max-w-[80%] space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 ml-1 font-sans">{msg.name}</span>
                  <div className="bg-slate-900 text-white p-3.5 rounded-2xl rounded-bl-xs text-xs leading-relaxed shadow-xs font-sans">
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 ml-1 font-sans">{msg.time}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-0.5 ml-auto max-w-[80%]">
                <div className="bg-[#9E7B4F] text-white p-3.5 rounded-2xl rounded-br-xs text-xs font-bold leading-relaxed shadow-xs font-sans">
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 mr-1 font-sans">{msg.time}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Field Bar */}
      <div className="fixed bottom-16 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-5 py-3 z-40 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type special instructions, query, or pickup request..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9E7B4F] transition-all"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md hover:bg-[#9E7B4F] transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>

      <BottomNav activePath="home" onNavigate={onNavigate} />
    </div>
  );
};
