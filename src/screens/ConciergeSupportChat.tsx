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
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#070F1E] text-[#FAF9F6] min-h-screen font-sans">
      {/* Top Status Header */}
      <div className="sticky top-16 z-30 bg-[#0B1528]/95 backdrop-blur-md px-5 py-3 flex items-center justify-between border-b border-[#C29C6D]/30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 min-h-[44px] rounded-full bg-[#070F1E] text-[#E5C07B] border border-[#C29C6D]/40 hover:border-[#D4AF37] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <span className="text-[10px] font-extrabold text-[#E5C07B] uppercase tracking-widest block font-sans">
              24/7 SUPPORT & CARE
            </span>
            <span className="font-['Libre_Caslon_Text',serif] text-base font-bold text-[#FAF9F6]">
              Order #FBQ-8829
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/?text=Hello%20FabriQ%20Support,%20I%20am%20chatting%20regarding%20Order%20%23FBQ-8829."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all shadow-xs"
            title="Official WhatsApp Support Line"
          >
            <span className="material-symbols-outlined text-[14px]">chat</span>
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#070F1E] rounded-full border border-[#C29C6D]/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-[#E5C07B]">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 px-5 py-4 space-y-4 max-w-2xl mx-auto w-full">
        <div className="text-center my-2">
          <span className="text-[10px] font-bold text-[#E5C07B] bg-[#0B1528] border border-[#C29C6D]/30 px-3 py-1 rounded-full uppercase tracking-wider font-sans">
            Today • Active Care Session
          </span>
        </div>

        {messages.map((msg, index) => (
          <div key={index}>
            {msg.sender === 'concierge' ? (
              <div className="flex items-end gap-2.5">
                <img
                  src={msg.avatar}
                  alt="Concierge Avatar"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#C29C6D]/40 shrink-0"
                />
                <div className="max-w-[80%] space-y-0.5">
                  <span className="text-[10px] font-bold text-[#E5C07B] ml-1 font-sans">{msg.name}</span>
                  <div className="bg-[#0B1528] text-[#FAF9F6] border border-[#C29C6D]/30 p-3.5 rounded-2xl rounded-bl-xs text-xs leading-relaxed shadow-xs font-sans">
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 ml-1 font-sans">{msg.time}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-0.5 ml-auto max-w-[80%]">
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] p-3.5 rounded-2xl rounded-br-xs text-xs font-black leading-relaxed shadow-xs font-sans">
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 mr-1 font-sans">{msg.time}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Field Bar */}
      <div className="fixed bottom-16 inset-x-0 bg-[#0B1528]/95 backdrop-blur-xl border-t border-[#C29C6D]/30 px-5 py-3 z-40 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type special instructions, query, or pickup request..."
            className="flex-1 bg-[#070F1E] border border-[#C29C6D]/30 rounded-full px-4 py-2.5 text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-[#D4AF37] transition-all"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 min-h-[44px] rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] flex items-center justify-center shadow-md hover:opacity-95 transition-colors cursor-pointer shrink-0"
            aria-label="Send message"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>

      <BottomNav activePath="home" onNavigate={onNavigate} />
    </div>
  );
};
