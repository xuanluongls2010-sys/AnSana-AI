import React, { useState, useRef, useEffect } from "react";
import { Message } from "../types";
import { Send, Sparkles, MessageSquare, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AnSanaChatProps {
  messages: Message[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onClearChat: () => void;
}

const PRESETS = [
  { text: "Tôi đang cảm thấy cực kỳ quá tải về thi cử và bài tập chất đống.", label: "Áp Lực Thi Cử 📚" },
  { text: "Hãy nhẹ nhàng hướng dẫn tôi thực hiện một bài tập tĩnh tâm ngắn.", label: "Cần Tĩnh Tâm Ngay 🌸" },
  { text: "Tôi mất ngủ vì đầu óc cứ suy nghĩ mông lung không dứt.", label: "Suy Nghĩ Mông Lung 🌙" },
  { text: "Tôi có cảm giác bản thân đang thụt lùi và tụt hậu so với bạn bè.", label: "Áp Lực Đồng Trang Lứa 🏃‍♂️" }
];

export default function AnSanaChat({
  messages,
  onSendMessage,
  isLoading,
  error,
  onClearChat
}: AnSanaChatProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      console.warn("scrollIntoView not supported:", e);
    }
  }, [messages, isLoading]);

  return (
    <div id="ansana-chat-container" className="flex flex-col h-full w-full box-border bg-[#FDFCF9] rounded-3xl border border-[#E0DBCF] shadow-xs overflow-hidden">
      {/* Header */}
      <div id="chat-header" className="flex items-center justify-between p-5 bg-[#F2EDE4] border-b border-[#E0DBCF]">
        <div className="flex items-center gap-3">
          <img 
            src="https://i.ibb.co/RGPsp3vg/9f1cf1c9-3893-4b9c-817d-674f1c01d6eb.jpg" 
            alt="AnSana AI Logo" 
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border border-[#E0DBCF]" 
          />
          <div>
            <h2 className="serif-title font-serif text-xl font-bold text-[#3E4A35] flex items-center gap-1.5 leading-none">
              Trò Chuyện Cùng AnSana AI <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-emerald-800 bg-[#E8EFE0] px-2.5 py-1 rounded-full">Lắng Nghe Sâu Sắc</span>
            </h2>
            <p className="text-xs text-stone-600 mt-1 font-sans">Không gian yên bình nuôi dưỡng tâm hồn, giải tỏa mâu thuẫn nhận thức</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-clear-chat"
            onClick={onClearChat}
            className="p-2.5 rounded-full border border-[#E0DBCF] text-[#3E4A35] hover:text-red-700 bg-white/70 hover:bg-red-50 hover:border-red-100 transition duration-200 shadow-3xs cursor-pointer flex items-center justify-center"
            title="Xóa cuộc trò chuyện"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div id="chat-message-viewport" className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-[#FAF8F5]">
        {error && (
          <div id="chat-error-msg" className="p-4 rounded-2xl bg-orange-50 border border-amber-200 text-amber-900 text-xs flex gap-3 items-start shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <div className="flex-1">
              <p className="font-semibold text-amber-950">Gặp Sự Cố Kết Nối</p>
              <p className="opacity-90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center py-8 px-4"
            >
              <img 
                src="https://i.ibb.co/RGPsp3vg/9f1cf1c9-3893-4b9c-817d-674f1c01d6eb.jpg" 
                alt="AnSana AI Logo" 
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover mb-4 border border-[#E0DBCF] shadow-xs" 
              />
              <p className="serif-title font-serif text-3xl italic text-[#3E4A35]">Xin chào bạn thương.</p>
              <p className="text-sm text-stone-600 max-w-md mt-2.5 leading-relaxed font-sans">
                Tôi là AnSana AI, bến đỗ trong lành tĩnh mịch của bạn. Những suy nghĩ hay gánh nặng lo toan nào đang đè nặng tâm trí bạn hôm nay? Đừng ngần ngại bày tỏ những âu lo áp lực thi cử, sự trống trải kiệt quệ sức lực khi chạy đua, hay những khoảnh khắc hoài nghi bản thân. Chúng ta sẽ cùng nhau chia sẻ, xoa dịu chúng dưới góc nhìn tâm lý CBT thấu cảm.
              </p>

              {/* Presets */}
              <div className="mt-8 w-full max-w-lg">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-stone-400 mb-3.5">Bắt đầu nhẹ nhàng bằng các gợi ý:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => onSendMessage(preset.text)}
                      className="text-left font-sans py-3 px-4 bg-white border border-[#E0DBCF] hover:border-[#D4A373] hover:bg-[#FDFCF9] rounded-2xl text-xs text-[#3E4A35] shadow-2xs hover:shadow-xs transition duration-200 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                {m.role === "user" ? (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border shadow-2xs font-sans bg-[#3E4A35] text-white border-[#3E4A35]">
                    Tôi
                  </div>
                ) : (
                  <img
                    src="https://i.ibb.co/RGPsp3vg/9f1cf1c9-3893-4b9c-817d-674f1c01d6eb.jpg"
                    alt="AnSana AI Logo"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover shrink-0 border shadow-2xs border-[#E0DBCF]"
                  />
                )}

                {/* Message Body */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className={`p-4 rounded-[24px] text-sm leading-relaxed whitespace-pre-line shadow-2xs font-sans break-words w-full box-border
                    ${m.role === "user"
                      ? "bg-white text-[#3E4A35] border border-[#E0DBCF] rounded-tr-none"
                      : "bg-[#E8EFE0] text-[#3E4A35] border border-[#E0DBCF]/60 rounded-tl-none"}`}
                  >
                    {m.content}
                  </div>
                  <span className={`text-[10px] mt-1 text-stone-400 px-1 font-sans ${m.role === "user" ? "text-right" : ""}`}>
                    {m.timestamp ? (() => {
                      const d = new Date(m.timestamp);
                      return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    })() : ""}
                  </span>
                </div>
              </motion.div>
            ))
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[85%] mr-auto"
            >
              <div className="w-8 h-8 rounded-full bg-[#E8EFE0] flex items-center justify-center text-[#3E4A35] shrink-0 border border-[#E0DBCF]">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-[24px] bg-[#E8EFE0]/60 text-[#3E4A35] text-xs border border-[#E0DBCF]/40 rounded-tl-none flex items-center gap-2.5 font-sans min-w-0 flex-1 break-words box-border">
                <span className="flex space-x-1 items-center">
                  <span className="w-1.5 h-1.5 bg-[#3E4A35] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#3E4A35] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#3E4A35] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                <span className="font-medium italic">AnSana AI đang lắng nghe và suy ngẫm lời chia sẻ...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div id="chat-input-area" className="p-4 bg-white/80 border-t border-[#E0DBCF]">
        <div className="relative flex items-center bg-white border border-[#E0DBCF] rounded-full px-5 py-2 hover:border-[#D4A373] transition duration-200">
          <input
            id="chat-text-input"
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E4A35] placeholder:text-stone-400 py-1"
            placeholder={isLoading ? "Vui lòng đợi giây lát hoặc gửi thêm thông điệp..." : "Hãy chia sẻ, để tôi được lắng nghe câu chuyện của bạn."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
          <button
            id="chat-send-btn"
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="bg-[#5A5A40] text-white px-5 py-2 rounded-full text-xs font-semibold tracking-wide hover:bg-[#3E4A35] disabled:bg-stone-200 disabled:text-stone-400 cursor-pointer transition shadow-2xs"
          >
            Gửi Đi
          </button>
        </div>
        <p className="text-[10px] text-center text-stone-400 mt-3 font-sans">
          AnSana được tạo ra nhằm đồng hành hỗ trợ tinh thần học sinh, không thay thế cho y khoa hay nhà tâm lý lâm sàng chuyên nghiệp. Trường hợp khẩn cấp cấp bách, hãy liên hệ Tổng đài Quốc gia Bảo vệ Trẻ em 111 hoặc cơ quan y tế gần nhất.
        </p>
      </div>
    </div>
  );
}
