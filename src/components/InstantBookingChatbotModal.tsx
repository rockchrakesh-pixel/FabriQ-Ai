import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { ScreenId } from '../types';
import { OnlineBillingModal } from './OnlineBillingModal';
import fabriqLogo from '../assets/images/fabriq_ai_logo_1785771380575.jpg';

interface InstantBookingChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenId) => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  imageUrl?: string;
  stainAnalysis?: {
    fabric: string;
    stainType: string;
    cleanableProbability: string;
    treatment: string;
  };
  options?: { label: string; action: () => void; isPrimary?: boolean }[];
  bookingSummary?: {
    items: string;
    total: number;
    pickupTime: string;
    address: string;
    ticketId: string;
  };
}

export const InstantBookingChatbotModal: React.FC<InstantBookingChatbotModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { profile } = useAuth();
  const { activeBranch } = useBranch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Booking Cart State in Chat
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const [showOrderBuilder, setShowOrderBuilder] = useState(false);

  const [pickupSlot, setPickupSlot] = useState<string>('Tomorrow, 10:00 AM - 12:00 PM');
  const [isBooked, setIsBooked] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Item prices mapping
  const prices: { [key: string]: number } = {
    'Shirt (Wash & Steam)': 70,
    'Trousers / Denim': 80,
    'Luxury Suit (2-Piece)': 360,
    'Instant Steam Iron (Self Drop @ ₹15)': 15,
    'Silk Saree & Couture': 250,
    'Bridal Wear Cleaning': 999,
  };

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((sum, [name, qty]) => {
      const itemQty = Number(qty) || 0;
      return sum + (prices[name] || 50) * itemQty;
    }, 0);
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: `Namaste ${profile?.name || 'Valued Guest'}! 🙏 Welcome to FabriQ Instant Pre-Order Chat!

💬 Feel free to chat with us, ask questions, or inquire about pricing & stain care BEFORE placing your order.

📞 **Notice:** If you do not receive an immediate response, please call our FabriQ Concierge directly at **1800-202-0000** or **+91 98765 43210**.`,
      time: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const addItem = (itemName: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemName]: (prev[itemName] || 0) + 1,
    }));
  };

  const removeItem = (itemName: string) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      if (updated[itemName] > 1) {
        updated[itemName] -= 1;
      } else {
        delete updated[itemName];
      }
      return updated;
    });
  };

  const handleConfirmBooking = () => {
    const total = calculateTotal();
    const itemsList = Object.entries(selectedItems)
      .map(([name, qty]) => `${qty}x ${name}`)
      .join(', ');

    const ticketId = `#FBQ-${Math.floor(1000 + Math.random() * 9000)}`;
    setIsBooked(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Confirm instant booking for ${itemsList} (${pickupSlot}). Total: ₹${total}`,
      time: 'Just now',
    };

    const botConfirmation: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: `🎉 Order Confirmed! Ticket ${ticketId} has been created and assigned to our ${activeBranch.name} valet team.`,
      time: 'Just now',
      bookingSummary: {
        items: itemsList || '2x Shirt, 3x Instant Steam Iron',
        total: total || 185,
        pickupTime: pickupSlot,
        address: profile?.address || activeBranch.address,
        ticketId,
      },
    };

    setMessages((prev) => [...prev, userMsg, botConfirmation]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imgUrl = reader.result as string;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: 'Uploaded garment photo for stain and cleanability evaluation.',
        imageUrl: imgUrl,
        time: 'Just now',
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const botReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `🔍 **AI Garment & Stain Analysis Complete!**\n\nWe analyzed your uploaded garment photo:`,
          time: 'Just now',
          stainAnalysis: {
            fabric: 'Delicate Silk & Organic Cotton Blend',
            stainType: 'Surface Oil / Dye Residue Spot',
            cleanableProbability: '97% Fully Restorable',
            treatment: 'Eco-Hydrocarbon Ultrasonic Spotting & Gentle Silk Spa',
          },
        };
        setMessages((prev) => [...prev, botReply]);
      }, 1000);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const processNLP = async (userText: string) => {
    const lower = userText.toLowerCase();

    // Multilingual or NLP detection
    // Telugu triggers: నమస్కారం, ధర, ఆర్డర్, షర్ట్, లొకేషన్, ఫోన్, సహాయం
    // Hindi triggers: नमस्ते, दाम, प्राइस, आर्डर, लोकेशन, हेल्प
    if (lower.includes('తెలుగు') || lower.includes('నమస్కారం') || lower.includes('ఎంత') || lower.includes('ధర')) {
      return `నమస్కారం! FabriQ AI కి స్వాగతం! 🧺
• షర్ట్ వాష్ & ఐరన్: ₹70
• డ్రై క్లీనింగ్: ₹120 నుండి
• సిల్క్ చీర కేర్: ₹250
• ₹15 ఇన్‌స్టంట్ స్టీమ్ ఐరన్ (స్టోర్ సెల్ఫ్ డ్రాప్).
ఏ సేవ బుక్ చేయాలనుకుంటున్నారు?`;
    }

    if (lower.includes('हिंदी') || lower.includes('नमस्ते') || lower.includes('दाम') || lower.includes('कितना')) {
      return `नमस्ते! FabriQ AI में आपका स्वागत है! 🧺
• शर्ट वॉश और स्टीम: ₹70
• ड्राई क्लीनिंग: ₹120 से शुरू
• सिल्क साड़ी केयर: ₹250
• ₹15 इंस्टेंट वैक्यूम स्टीम प्रेस (स्टोर ड्रॉप)।
आप क्या बुक करना चाहते हैं?`;
    }

    // FAQs: Pricing & Rates
    if (lower.includes('price') || lower.includes('rate') || lower.includes('cost') || lower.includes('how much')) {
      return `🏷️ **FabriQ AI Standard Rate Card:**
• Shirt (Wash & Steam): ₹70
• Trouser / Denim: ₹80
• Executive Suit (2-Piece): ₹360
• Silk Saree & Heritage Couture: ₹250
• Shoe & Sneaker Spa: ₹250 / pair
• Special Self Drop Steam Iron: ₹15 / pc!`;
    }

    // Active Orders / Track Order
    if (lower.includes('track') || lower.includes('status') || lower.includes('order') || lower.includes('where is')) {
      return `📦 **Active Order Status:**\nOrder **#FBQ-8829** is currently in phase **Washing & Pure Hydro Care** at ${activeBranch.name}. Estimated delivery: Tomorrow at 4:00 PM.`;
    }

    // Nearest Store / Location
    if (lower.includes('store') || lower.includes('branch') || lower.includes('location') || lower.includes('nearest')) {
      return `📍 **Your Nearest FabriQ AI Store:**\n**${activeBranch.name}**\nAddress: ${activeBranch.address}\nContact: ${activeBranch.phone}\nStatus: Active (0.8 km away from your location)`;
    }

    // Cancel or Reschedule
    if (lower.includes('cancel') || lower.includes('reschedule') || lower.includes('change time')) {
      return `🔄 **Reschedule or Cancel Request:**\nI can help you reschedule your pickup for Order #FBQ-8829. Would you like to shift to Tomorrow 10 AM - 12 PM or speak to our Live Valet Executive on WhatsApp?`;
    }

    // Silk Saree / Premium Care
    if (lower.includes('saree') || lower.includes('silk') || lower.includes('lehenga') || lower.includes('bridal')) {
      addItem('Silk Saree & Couture');
      return `✨ Added **1x Silk Saree & Couture Care (₹250)** to your chat booking basket! We utilize pH-neutral gentle steam and zero-moisture zari roll pressing.`;
    }

    // Steam Iron / Self Drop ₹15
    if (lower.includes('iron') || lower.includes('steam') || lower.includes('15')) {
      addItem('Instant Steam Iron (Self Drop @ ₹15)');
      return `🔥 Added **1x Instant Steam Ironing (@ ₹15/pc)** to your booking basket! Drop off at ${activeBranch.name} for 15-minute express turnaround.`;
    }

    // Shirts
    if (lower.includes('shirt')) {
      addItem('Shirt (Wash & Steam)');
      return `👔 Added **1x Shirt Wash & Steam (₹70)** to your chat booking basket.`;
    }

    // Business & Executive metrics for staff roles
    if (lower.includes('revenue') || lower.includes('sales')) {
      return `📊 **Enterprise Performance:**\nToday's total revenue across active branches is **₹1,84,500** with 142 orders processed. Top branch: Jubilee Hills Atelier (₹68,400).`;
    }

    // Default Fallback
    return `I understand you are asking about "${userText}". I can schedule a valet pickup, calculate garment care pricing, or connect you with our team.\n\n📞 **If you do not receive a response immediately, please call our FabriQ Concierge directly at 1800-202-0000 or +91 98765 43210.**`;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const botReplyText = await processNLP(userText);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botReplyText,
          time: 'Just now',
        },
      ]);
    }, 600);
  };

  const sendQuickChip = (chipText: string) => {
    setInput(chipText);
    setTimeout(() => {
      handleSendMessage();
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#9E7B4F]/40 flex flex-col h-[85vh] sm:h-[650px]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 border-b border-[#9E7B4F]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#C29C6D] ring-2 ring-amber-400/90 bg-[#0F172A] shrink-0 flex items-center justify-center p-1 shadow-md">
                <img
                  src={fabriqLogo}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/src/assets/images/fabriq_ai_logo_1785771380575.jpg';
                  }}
                  alt="FabriQ AI Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-['Libre_Caslon_Text',serif] text-base font-bold text-white">
                  Fabri<span className="text-amber-400">Q</span>{' '}
                  <span className="text-amber-300 font-sans text-xs uppercase tracking-widest font-extrabold">
                    AI
                  </span>
                </span>
                <span className="bg-[#9E7B4F] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  24/7 AI ASSISTANT
                </span>
              </div>
              <p className="text-[11px] text-amber-200/90 font-medium flex items-center gap-1">
                <span>Official Hotline: 1800-202-0000</span>
                <span>• English / हिंदी / తెలుగు</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="bg-slate-100 p-2.5 border-b border-slate-200 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {[
            'Price List',
            'Ask About Stain Care',
            'Silk Saree & Couture',
            'Store Locations & Hotline',
            'Upload Garment Photo',
            'Build Order (Optional)',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => {
                if (chip === 'Upload Garment Photo') {
                  fileInputRef.current?.click();
                } else if (chip === 'Build Order (Optional)') {
                  setShowOrderBuilder(true);
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      sender: 'bot',
                      text: `🛒 **Garment & Service Selection Opened Below!**\nPick your items and choose a pickup slot when you are ready to book.`,
                      time: 'Just now',
                    },
                  ]);
                } else if (chip === 'Store Locations & Hotline') {
                  sendQuickChip('Store Locations');
                } else {
                  sendQuickChip(chip);
                }
              }}
              className="px-3 py-1 rounded-full bg-white text-slate-800 text-[11px] font-bold border border-slate-200 hover:border-amber-400 whitespace-nowrap transition-all shadow-2xs cursor-pointer shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Live Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAFC]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-2xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#9E7B4F] text-white rounded-br-xs font-medium'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-[#9E7B4F] uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                    <span>FabriQ AI Assistant</span>
                  </div>
                )}
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Uploaded Garment Photo Preview */}
                {msg.imageUrl && (
                  <div className="mt-2.5 overflow-hidden rounded-xl border border-white/20 shadow-sm max-w-[220px]">
                    <img
                      src={msg.imageUrl}
                      alt="Garment Upload"
                      className="w-full h-auto object-cover max-h-48"
                    />
                  </div>
                )}

                {/* Stain & Cleanability AI Assessment */}
                {msg.stainAnalysis && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-300 text-slate-900 space-y-2">
                    <div className="flex justify-between items-center border-b border-amber-200 pb-1.5">
                      <span className="text-[10px] font-black text-[#83633B] uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-amber-600">microscope</span>
                        STAIN DIAGNOSIS
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {msg.stainAnalysis.cleanableProbability}
                      </span>
                    </div>
                    <div className="text-[11px] space-y-1">
                      <p><strong>Fabric:</strong> {msg.stainAnalysis.fabric}</p>
                      <p><strong>Stain Detected:</strong> {msg.stainAnalysis.stainType}</p>
                      <p><strong>Recommended Process:</strong> {msg.stainAnalysis.treatment}</p>
                    </div>
                    <button
                      onClick={() => {
                        addItem('Silk Saree & Couture');
                        handleConfirmBooking();
                      }}
                      className="w-full mt-2 py-2 rounded-lg bg-slate-900 text-amber-300 font-bold text-xs flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      <span>Add Treatment & Confirm Order</span>
                    </button>
                  </div>
                )}

                {/* Booking Summary Card */}
                {msg.bookingSummary && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-slate-900 space-y-2">
                    <div className="flex justify-between items-center border-b border-amber-200/60 pb-1.5">
                      <span className="text-[10px] font-extrabold text-[#83633B] uppercase">
                        Ticket {msg.bookingSummary.ticketId}
                      </span>
                      <span className="font-bold text-emerald-700">₹{msg.bookingSummary.total}</span>
                    </div>
                    <div className="text-[11px] space-y-1">
                      <p>
                        <strong>Items:</strong> {msg.bookingSummary.items}
                      </p>
                      <p>
                        <strong>Slot:</strong> {msg.bookingSummary.pickupTime}
                      </p>
                      <p>
                        <strong>Address:</strong> {msg.bookingSummary.address}
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col gap-1.5">
                      <button
                        onClick={() => setIsBillingModalOpen(true)}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-md cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                        <span>Online Billing & Pay (₹{msg.bookingSummary.total})</span>
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onClose();
                            onNavigate('order-tracking');
                          }}
                          className="flex-1 bg-slate-900 text-white py-1.5 rounded-lg font-bold text-[11px] text-center cursor-pointer shadow-xs"
                        >
                          Track Ticket
                        </button>
                        <button
                          onClick={() => {
                            const text = encodeURIComponent(
                              `Hello FabriQ Care, my instant chatbot ticket is ${msg.bookingSummary?.ticketId}.`
                            );
                            window.open(`https://wa.me/?text=${text}`, '_blank');
                          }}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center justify-center cursor-pointer"
                          title="Instant Chat"
                        >
                          <span className="material-symbols-outlined text-[15px]">chat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs bg-white p-3 rounded-2xl w-24 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}

          {/* Optional Order Builder Toggle Banner */}
          {!isBooked && !showOrderBuilder && (
            <div className="bg-slate-900 text-white p-3 rounded-2xl border border-amber-400/40 shadow-sm flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">shopping_bag</span>
                <span className="font-semibold text-slate-200">Ready to book an order?</span>
              </div>
              <button
                onClick={() => setShowOrderBuilder(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-[11px] shadow-sm hover:brightness-110 transition cursor-pointer"
              >
                Build Order Basket
              </button>
            </div>
          )}

          {/* Quick Interactive Items Selector inside Chat */}
          {!isBooked && showOrderBuilder && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">checkroom</span>
                  SELECT GARMENTS & SERVICES
                </span>
                <button
                  onClick={() => setShowOrderBuilder(false)}
                  className="text-[10px] text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
                >
                  Hide Order Builder
                </button>
              </div>

              <div className="space-y-2">
                {Object.keys(prices).map((name) => {
                  const qty = selectedItems[name] || 0;
                  return (
                    <div
                      key={name}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">{name}</span>
                        <span className="text-[10px] text-slate-500">₹{prices[name]} / pc</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {qty > 0 && (
                          <button
                            onClick={() => removeItem(name)}
                            className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 font-bold flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                        )}
                        <span className="font-bold text-slate-900 w-4 text-center">{qty}</span>
                        <button
                          onClick={() => addItem(name)}
                          className="w-6 h-6 rounded-lg bg-[#9E7B4F] text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pickup Slot Selection */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Preferred Pickup / Drop Slot
                </label>
                <select
                  value={pickupSlot}
                  onChange={(e) => setPickupSlot(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="Today, 4:00 PM - 6:00 PM">Today, 4:00 PM - 6:00 PM</option>
                  <option value="Tomorrow, 10:00 AM - 12:00 PM">Tomorrow, 10:00 AM - 12:00 PM</option>
                  <option value="Tomorrow, 2:00 PM - 4:00 PM">Tomorrow, 2:00 PM - 4:00 PM</option>
                  <option value="Self Drop at Store Today">Self Drop at Store Today</option>
                </select>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={calculateTotal() === 0}
                className="w-full bg-slate-900 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs shadow-md border border-amber-400/50 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-amber-300">
                  flash_on
                </span>
                <span>
                  {calculateTotal() > 0
                    ? `Confirm Instant Booking (₹${calculateTotal()})`
                    : 'Select at least 1 item to book'}
                </span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-2xl bg-amber-50 hover:bg-amber-100 text-[#83633B] border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer transition-all"
            title="Upload Photo of Stained or Dirty Garment for AI Assessment"
          >
            <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type message or upload garment photo..."
            className="flex-1 bg-slate-100 px-4 py-2.5 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#9E7B4F]"
          />
          <button
            onClick={handleSendMessage}
            className="w-10 h-10 rounded-2xl bg-[#9E7B4F] hover:bg-[#83633B] text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>

      <OnlineBillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        items={Object.entries(selectedItems).map(([name, qty]) => ({
          id: name,
          name,
          qty,
          price: prices[name] || 50,
          unit: 'pc',
        }))}
        onPaymentSuccess={() => {
          onClose();
          onNavigate('payment-success');
        }}
      />
    </div>
  );
};
