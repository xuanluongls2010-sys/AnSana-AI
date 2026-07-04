import React, { useState, useEffect, useRef } from "react";
import { Message, StressEntry, ActiveTab } from "./types";
import AnSanaChat from "./components/AnSanaChat";
import BreathingVisualizer from "./components/BreathingVisualizer";
import ThoughtReframer from "./components/ThoughtReframer";
import ReflectiveJournal from "./components/ReflectiveJournal";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Heart,
  Lightbulb,
  BookOpen,
  Activity,
  Compass,
  ArrowRight,
  Smile,
  ShieldAlert,
  Wind,
  Menu,
  X
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Local Storage State Hook for Stress logs
  const [journalEntries, setJournalEntries] = useState<StressEntry[]>(() => {
    const saved = localStorage.getItem("ansana_journal_logs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Local Storage State Hook for Chat logs
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("ansana_chat_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const triggerAudio = (audioType: string) => {
    // Map type to hypothetical URLs.
    const audioMap: Record<string, string> = {
      tieng_mua: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Placeholder
      song_bien: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      nhac_thien: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      tieng_chuong_gio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    };
    if (audioRef.current && audioMap[audioType]) {
      audioRef.current.src = audioMap[audioType];
      audioRef.current.play().catch(console.error);
    }
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("ansana_journal_logs", JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem("ansana_chat_sessions", JSON.stringify(messages));
  }, [messages]);

  // Chat triggers
  const handleSendMessage = async (text: string) => {
    const newUserMsg: Message = {
      id: "usr-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date()
    };

    const updatedMsgs = [...messages, newUserMsg];
    setMessages(updatedMsgs);
    setIsLoadingChat(true);
    setChatError(null);

    // Prepare assistant message ID that we can populate as the stream loads
    const assistantMsgId = "ai-" + Date.now();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMsgs })
      });

      if (!response.ok) {
        let errMsg = "An error occurred with AnSana AI services.";
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) {
        throw new Error("Cannot read response stream.");
      }

      // Add empty assistant message that will be updated in real-time
      const answerMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, answerMsg]);

      let streamText = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        streamText += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: streamText } : msg
          )
        );
      }
      // Check for audio trigger
      const match = streamText.match(/\[AUDIO_TRIGGER: (.*?)\]/);
      if (match) {
        triggerAudio(match[1]);
        // Optionally remove the tag from content to keep it clean
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: streamText.replace(match[0], "").trim() } : msg
          )
        );
      }
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || "Failed to load response. Check server environment.");
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleClearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChat = () => {
    setMessages([]);
    setChatError(null);
    setShowClearConfirm(false);
  };

  // Journal additions
  const handleAddJournalEntry = (entry: Omit<StressEntry, "id" | "date">) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newEntry: StressEntry = {
      ...entry,
      id: "jrn-" + Date.now(),
      date: todayStr
    };
    setJournalEntries([newEntry, ...journalEntries]);
  };

  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries(journalEntries.filter((j) => j.id !== id));
  };

  // Calulate average stress quotient
  const averageStress = journalEntries.length
    ? parseFloat(
        (
          journalEntries.reduce((sum, item) => sum + item.stressScore, 0) /
          journalEntries.length
        ).toFixed(1)
      )
    : 0;

  // Derive verbal stress state
  const getStressTitle = (score: number) => {
    if (score === 0) return "Chưa Ghi Nhận";
    if (score <= 3) return "Bình Yên Thư Thái";
    if (score <= 6) return "Áp Lực Vừa Phải";
    if (score <= 8) return "Căng Thẳng Cao Độ";
    return "Quá Tải Nghiêm Trọng";
  };

  return (
    <div className="w-full h-screen bg-[#FDFCF9] flex flex-col text-[#3E4A35] overflow-hidden antialiased">
      {/* Mobile Header with Hamburger */}
      <header className="lg:hidden h-16 shrink-0 border-b border-[#E0DBCF] bg-[#F2EDE4] px-4 flex items-center justify-between sticky top-0 z-30 select-none w-full box-border">
        <div className="flex items-center gap-2.5">
          <img 
            src="https://i.ibb.co/RGPsp3vg/9f1cf1c9-3893-4b9c-817d-674f1c01d6eb.jpg" 
            alt="AnSana AI Logo" 
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-[#E0DBCF]" 
          />
          <div>
            <h1 className="serif-title font-serif text-base font-bold text-emerald-950 leading-none">AnSana AI</h1>
            <p className="text-[10px] text-[#3E4A35]/80 mt-1 font-sans font-medium">
              {activeTab === "chat" && "Trò Chuyện Chữa Lành"}
              {activeTab === "breathing" && "Thở Hộp Thư Giãn"}
              {activeTab === "reframer" && "Tái Khung Nhận Thức"}
              {activeTab === "journal" && "Nhật Ký Tâm Cảnh"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2.5 rounded-xl border border-[#E0DBCF] bg-white text-[#3E4A35] hover:bg-[#FAF8F5] transition cursor-pointer flex items-center justify-center shadow-3xs"
          title="Danh mục công cụ"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Main Layout Body wrapper */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden min-h-0 w-full box-border">
        {/* Mobile Sidebar Backdrop Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-35"
            />
          )}
        </AnimatePresence>

        {/* 1. Left Sidebar Navigation */}
        <aside className={`
          fixed lg:relative top-0 bottom-0 left-0 w-64 border-r border-[#E0DBCF] bg-[#F2EDE4] flex flex-col p-6 shrink-0 z-40 lg:z-10 shadow-3xs transition-transform duration-300 ease-in-out lg:translate-x-0 h-full lg:h-auto overflow-y-auto
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          {/* Close Button on Mobile */}
          <div className="lg:hidden flex justify-end mb-2">
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-full border border-[#E0DBCF] bg-white text-[#3E4A35] hover:bg-[#FAF8F5] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Logo and Brand */}
          <div className="mb-8 select-none">
            <h1 className="serif-title font-serif text-3.5xl font-bold tracking-tight text-emerald-950 flex items-center gap-3">
              <img 
                src="https://i.ibb.co/RGPsp3vg/9f1cf1c9-3893-4b9c-817d-674f1c01d6eb.jpg" 
                alt="AnSana AI Logo" 
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-[#E0DBCF]" 
              />
              AnSana AI
            </h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#3E4A35]/60 mt-2 font-sans">
              Góc Chữa Lành Cho Học Sinh & Sinh Viên
            </p>
          </div>

          {/* Nurturing tools selection */}
          <nav className="flex-grow space-y-8">
            <section>
              <h3 className="text-[10px] uppercase tracking-widest font-sans font-bold mb-4 text-[#3E4A35]/40 select-none">
                Công Cụ Thư Giãn
              </h3>
              <ul className="space-y-1.5 font-sans">
                <li
                  onClick={() => { setActiveTab("chat"); setChatError(null); setIsSidebarOpen(false); }}
                  className={`text-sm flex items-center justify-between p-3 rounded-2xl cursor-pointer font-medium transition duration-150
                    ${activeTab === "chat"
                      ? "bg-white border border-[#E0DBCF] text-[#3E4A35] shadow-3xs"
                      : "hover:bg-white/40 text-stone-600"}`}
                >
                  <div id="tab-nav-chat" className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${activeTab === "chat" ? "bg-emerald-800" : "bg-stone-400"}`} />
                    Trò Chuyện Chữa Lành
                  </div>
                  {activeTab === "chat" && <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">Mở</span>}
                </li>

                <li
                  onClick={() => { setActiveTab("breathing"); setIsSidebarOpen(false); }}
                  className={`text-sm flex items-center justify-between p-3 rounded-2xl cursor-pointer font-medium transition duration-150
                    ${activeTab === "breathing"
                      ? "bg-white border border-[#E0DBCF] text-[#3E4A35] shadow-3xs"
                      : "hover:bg-white/40 text-stone-600"}`}
                >
                  <div id="tab-nav-breathing" className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${activeTab === "breathing" ? "bg-emerald-800" : "bg-stone-400"}`} />
                    Thở Hộp Thư Giãn
                  </div>
                  {activeTab === "breathing" && <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">Mở</span>}
                </li>

                <li
                  onClick={() => { setActiveTab("reframer"); setIsSidebarOpen(false); }}
                  className={`text-sm flex items-center justify-between p-3 rounded-2xl cursor-pointer font-medium transition duration-150
                    ${activeTab === "reframer"
                      ? "bg-white border border-[#E0DBCF] text-[#3E4A35] shadow-3xs"
                      : "hover:bg-white/40 text-stone-600"}`}
                >
                  <div id="tab-nav-reframer" className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${activeTab === "reframer" ? "bg-emerald-800" : "bg-stone-400"}`} />
                    Tái Khung Nhận Thức
                  </div>
                  {activeTab === "reframer" && <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">Mở</span>}
                </li>

                <li
                  onClick={() => { setActiveTab("journal"); setIsSidebarOpen(false); }}
                  className={`text-sm flex items-center justify-between p-3 rounded-2xl cursor-pointer font-medium transition duration-150
                    ${activeTab === "journal"
                      ? "bg-white border border-[#E0DBCF] text-[#3E4A35] shadow-3xs"
                      : "hover:bg-white/40 text-stone-600"}`}
                >
                  <div id="tab-nav-journal" className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${activeTab === "journal" ? "bg-emerald-800" : "bg-stone-400"}`} />
                    Nhật Ký Tâm Cảnh
                  </div>
                  {activeTab === "journal" && <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">Mở</span>}
                </li>
              </ul>
            </section>

            {/* Quick Affirmations / Predefined list */}
            <section className="hidden md:block">
              <h3 className="text-[10px] uppercase tracking-widest font-sans font-bold mb-3.5 text-[#3E4A35]/40 select-none">
                Nhắc Nhở Mỗi Ngày
              </h3>
              <ul className="space-y-3 font-sans text-xs text-stone-600">
                <li className="flex items-start gap-2 italic leading-relaxed">
                  <span>✦</span> Cho phép bản thân được tạm dừng một nhịp.
                </li>
                <li className="flex items-start gap-2 italic leading-relaxed">
                  <span>✦</span> Một bảng điểm đơn lẻ không thể định đoạt số phận bạn.
                </li>
                <li className="flex items-start gap-2 italic leading-relaxed">
                  <span>✦</span> Cứ bình tĩnh đi từng bước một, mọi chuyện sẽ ổn thôi.
                </li>
              </ul>
            </section>

            {/* Mobile/Tablet Only Stress Assessment (Đánh Giá Áp Lực) */}
            <section className="lg:hidden mt-1 pt-4 border-t border-[#E0DBCF]/30">
              <h3 className="text-[10px] uppercase tracking-widest font-sans font-bold mb-3 text-[#3E4A35]/40 select-none">
                Đánh Giá Áp Lực
              </h3>
              
              {/* Stress Pulse Widget */}
              <div className="bg-white p-4 rounded-2xl shadow-3xs border border-[#E0DBCF] w-full box-border">
                <div className="flex items-center justify-between mb-2 w-full">
                  <span className="serif-title font-serif text-sm italic font-semibold text-[#3E4A35] break-words pr-1">
                    {getStressTitle(averageStress)}
                  </span>
                  <span className="text-[10px] font-bold text-[#D4A373] bg-[#FDFCF9] border border-[#E0DBCF] px-2 py-0.5 rounded-full font-sans shrink-0">
                    Điểm: {averageStress !== 0 ? averageStress : "N/A"}
                  </span>
                </div>
                {/* Progress bar showing student's Stress average status */}
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden border border-stone-200/50 shadow-inner">
                  <div
                    className={`h-full transition-all duration-500
                      ${averageStress >= 8
                        ? "bg-red-400"
                        : averageStress >= 5
                          ? "bg-[#D4A373]"
                          : "bg-[#5A5A40]"}`}
                    style={{ width: `${averageStress !== 0 ? averageStress * 10 : 0}%` }}
                  />
                </div>
                <p className="text-[10px] text-stone-500 font-sans leading-relaxed mt-2.5 break-words">
                  {averageStress === 0
                    ? "Ghi nhận tâm cảnh trong phần Nhật Ký Tâm Cảnh để theo dõi biểu đồ."
                    : averageStress >= 8
                      ? "Mức độ áp lực tích lũy của bạn đang khá nặng nề. Bạn nên trò chuyện với AnSana AI hoặc luyện tập Thở Hộp để hồi phục."
                      : "Trạng thái tinh thần của bạn đang được giữ ở mức cân bằng tốt. Hãy tiếp tục bao dung và nhẹ nhàng với bản thân."}
                </p>
              </div>
            </section>
          </nav>

          {/* Muted Quote of Willow */}
          <div className="mt-auto mx-1.5 p-3 bg-emerald-900/5 rounded-xl border border-[#E0DBCF]/30 bg-white/25 shadow-3xs">
            <p className="text-[11px] italic serif-title text-stone-600 leading-relaxed text-center">
              "Thuận theo làn gió, thích nghi uyển chuyển, hãy vững vàng bình thản như rặng liễu cổ thụ."
            </p>
          </div>
        </aside>

        {/* 2. Main Body Container Content */}
        <main className="flex-grow lg:flex-1 flex flex-col relative overflow-hidden bg-[#FDFCF9] w-full box-border h-full">
          {/* Dynamic header of current active tool - Desktop only since Mobile has top bar */}
          <header className="hidden lg:flex h-20 border-b border-[#E0DBCF] items-center justify-between px-8 bg-white/30 backdrop-blur-xs select-none">
            <div>
              {activeTab === "chat" && (
                <>
                  <h2 className="serif-title font-serif text-2xl font-bold italic text-emerald-950">Trò Chuyện Chữa Lành</h2>
                  <p className="text-xs text-stone-500 font-sans mt-0.5">Người bạn lắng nghe sâu sắc và thấu cảm</p>
                </>
              )}
              {activeTab === "breathing" && (
                <>
                  <h2 className="serif-title font-serif text-2xl font-bold italic text-emerald-950">Thở Hộp Neo Giữ Tâm Trí</h2>
                  <p className="text-xs text-stone-500 font-sans mt-0.5">Điều hòa nhịp tim và cân bằng trạng thái thần kinh trung ương</p>
                </>
              )}
              {activeTab === "reframer" && (
                <>
                  <h2 className="serif-title font-serif text-2xl font-bold italic text-emerald-950">Tái Khung Nhận Thức CBT</h2>
                  <p className="text-xs text-stone-500 font-sans mt-0.5">Bẻ gãy thói quen tư duy méo mó và căng thẳng một cách tương tác</p>
                </>
              )}
              {activeTab === "journal" && (
                <>
                  <h2 className="serif-title font-serif text-2xl font-bold italic text-emerald-950">Nhật Ký Hành Trình Cảm Xúc</h2>
                  <p className="text-xs text-stone-500 font-sans mt-0.5">Giảm tải âu lo và theo dõi xu thế căng thẳng tích lũy</p>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex text-xs font-semibold bg-[#E8EFE0] text-[#3E4A35] px-3.5 py-1.5 rounded-full border border-[#E0DBCF] font-sans items-center gap-2">
                <img 
                  src="https://i.ibb.co/RGPsp3vg/9f1cf1c9-3893-4b9c-817d-674f1c01d6eb.jpg" 
                  alt="Logo" 
                  referrerPolicy="no-referrer" 
                  className="w-5 h-5 rounded-full object-cover" 
                />
                Trung Tâm Sức Khỏe Tinh Thần
              </span>
            </div>
          </header>

          {/* Dynamically Loaded Stage */}
          <section className={`flex-grow lg:flex-1 p-3 sm:p-4 md:p-6 w-full box-border min-h-0 lg:h-full lg:overflow-hidden relative flex flex-col
            ${activeTab === "chat" ? "h-full overflow-hidden" : "h-full overflow-y-auto lg:overflow-hidden"}
          `}>
            {activeTab === "chat" && (
              <AnSanaChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoadingChat}
                error={chatError}
                onClearChat={handleClearChat}
              />
            )}

            {activeTab === "breathing" && (
              <BreathingVisualizer />
            )}

            {activeTab === "reframer" && (
              <ThoughtReframer />
            )}

            {activeTab === "journal" && (
              <ReflectiveJournal
                entries={journalEntries}
                onAddEntry={handleAddJournalEntry}
                onDeleteEntry={handleDeleteJournalEntry}
              />
            )}
          </section>
        </main>

        {/* 3. Right Status widget drawer */}
        <aside className="hidden lg:flex lg:w-80 border-l border-[#E0DBCF] bg-[#FAF8F5] p-6 flex-col gap-5 overflow-y-auto shrink-0 select-none box-border">
          
          {/* Stress Pulse Widget */}
          <div className="bg-white p-5.5 rounded-3xl shadow-3xs border border-[#E0DBCF] w-full box-border">
            <h3 className="text-[10px] uppercase tracking-widest font-sans font-bold mb-4 text-stone-400">
              Chỉ Số Căng Thẳng Tích Lũy
            </h3>
            <div className="flex items-center justify-between mb-2.5 w-full">
              <span className="serif-title font-serif text-xl italic font-semibold text-[#3E4A35] break-words pr-1">
                {getStressTitle(averageStress)}
              </span>
              <span className="text-xs font-bold text-[#D4A373] bg-[#FDFCF9] border border-[#E0DBCF] px-2.5 py-1 rounded-full font-sans shrink-0">
                Điểm: {averageStress !== 0 ? averageStress : "N/A"}
              </span>
            </div>
            {/* Progress bar showing student's Stress average status */}
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200/50 shadow-inner">
              <div
                className={`h-full transition-all duration-500
                  ${averageStress >= 8
                    ? "bg-red-400"
                    : averageStress >= 5
                      ? "bg-[#D4A373]"
                      : "bg-[#5A5A40]"}`}
                style={{ width: `${averageStress !== 0 ? averageStress * 10 : 0}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 font-sans leading-relaxed mt-3.5 break-words">
              {averageStress === 0
                ? "Ghi nhận tâm cảnh hàng ngày của bạn trong phần Nhật Ký Tâm Cảnh để bắt đầu theo dõi biểu đồ xu hướng."
                : averageStress >= 8
                  ? "Mức độ áp lực tích lũy của bạn đang khá nặng nề. Bạn nên trò chuyện với AnSana AI hoặc luyện tập Thở Hộp để hồi phục."
                  : "Trạng thái tinh thần của bạn đang được giữ ở mức cân bằng tốt. Hãy tiếp tục bao dung và nhẹ nhàng với bản thân."}
            </p>
          </div>

          {/* Breathing Companion Preview - Quick actions block */}
          <div className="bg-[#3E4A35] text-white p-5.5 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[190px] w-full box-border">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            
            <div>
              <h3 className="text-[9px] uppercase tracking-widest font-semibold opacity-70 mb-1 flex items-center gap-1.5 font-sans">
                <Wind className="w-3.5 h-3.5" /> Khoảng Lặng Hơi Thở
              </h3>
              <h4 className="serif-title font-serif text-lg italic mt-1 font-bold">
                Thư Giãn Tức Thì
              </h4>
              <p className="text-[11px] leading-relaxed opacity-85 mt-2.5 font-sans break-words">
                Bạn đang cảm thấy trống ngực đập nhanh hay bồn chồn trước giờ thi? Hãy cùng thở hộp 1 phút để cân bằng lại nhịp thần kinh trung ương.
              </p>
            </div>

            <button
              onClick={() => setActiveTab("breathing")}
              className="w-full mt-4 py-2.5 bg-[#FDFCF9] text-[#3E4A35] rounded-full text-xs font-semibold hover:bg-[#E8EFE0] transition font-sans cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              Bắt Đầu Thở Hộp <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rest Strategy suggestion box */}
          <div className="w-full box-border lg:flex-1 border-2 border-dashed border-[#E0DBCF] rounded-3xl p-5 flex flex-col items-center justify-center text-center bg-white/40">
            <img 
              src="https://i.ibb.co/RGPsp3vg/9f1cf1c9-3893-4b9c-817d-674f1c01d6eb.jpg" 
              alt="AnSana Logo" 
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full object-cover border border-[#E0DBCF] mb-3 shadow-3xs" 
            />
            <h4 className="serif-title font-serif text-lg italic text-[#3E4A35] font-semibold mb-1 break-words">
              Quy Tắc Mắt 20-20-20
            </h4>
            <p className="text-[11px] leading-relaxed text-stone-500 px-2 font-sans break-words">
              Tránh mỏi mắt học tập căng thẳng. Cứ sau mỗi 20 phút tập trung học, hãy nhìn vào một vật cách xa khoảng 6 mét (20 feet) trong vòng 20 giây để vỏ não thư giãn.
            </p>
          </div>

          {/* Crisis Contact Information footer */}
          <div className="bg-[#E8EFE0] p-4 rounded-2xl border border-[#E0DBCF]/60 text-center text-xs w-full box-border">
            <p className="font-sans font-bold text-[#3E4A35]">Hỗ Trợ Khẩn Cấp 24/7</p>
            <p className="text-[11px] text-stone-600 mt-1 font-sans leading-relaxed break-words">
              Bạn cần kết nối tham vấn khẩn cấp với chuyên gia con người? Hãy liên hệ Tổng đài Quốc gia 111 hoặc Trung tâm Y tế học đường gần nhất. Bảo mật & miễn phí.
            </p>
          </div>

        </aside>
      </div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-stone-900/45 backdrop-blur-xs"
            />
            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-[#FDFCF9] rounded-3xl border border-[#E0DBCF] p-6 shadow-xl z-10"
            >
              <h3 className="serif-title font-serif text-2xl font-bold text-[#3E4A35] mb-2.5">
                Thiết lập lại cuộc trò chuyện?
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-sans mb-6">
                Toàn bộ lịch sử trò chuyện hiện tại cùng AnSana AI sẽ bị xóa sạch khỏi bộ nhớ. Hành động này không thể hoàn tác. Bạn có thực sự muốn thiết lập lại không?
              </p>
              <div className="flex gap-3 justify-end font-sans">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E0DBCF] hover:bg-[#FAF8F5] text-stone-700 text-xs font-semibold cursor-pointer transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={confirmClearChat}
                  className="px-5 py-2.5 rounded-full bg-red-700 text-white text-xs font-semibold hover:bg-red-800 shadow-2xs cursor-pointer transition"
                >
                  Xác Nhận Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <audio ref={audioRef} />
    </div>
  );
}
