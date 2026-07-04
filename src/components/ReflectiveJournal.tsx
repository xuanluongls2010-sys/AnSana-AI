import React, { useState } from "react";
import { StressEntry } from "../types";
import { Heart, Trash2, ShieldAlert, BookOpen, Smile, AlertCircle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ReflectiveJournalProps {
  entries: StressEntry[];
  onAddEntry: (entry: Omit<StressEntry, "id" | "date">) => void;
  onDeleteEntry: (id: string) => void;
}

const EMOJIS = [
  { char: "😊", label: "Bình thản / Vừa ý" },
  { char: "😔", label: "Trầm lắng / Buồn bã" },
  { char: "🤯", label: "Quá tải / Choáng ngợp" },
  { char: "😴", label: "Mệt mỏi / Kiệt sức" },
  { char: "😤", label: "Bực tức / Bành trướng" },
  { char: "😭", label: "Yếu lòng / Muốn khóc" }
];

export default function ReflectiveJournal({
  entries,
  onAddEntry,
  onDeleteEntry
}: ReflectiveJournalProps) {
  const [stressScore, setStressScore] = useState<number>(5);
  const [moodEmoji, setMoodEmoji] = useState<string>("😊");
  const [notes, setNotes] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEntry({ stressScore, moodEmoji, notes: notes.trim() });
    setNotes("");
    setStressScore(5);
    setMoodEmoji("😊");
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div id="reflective-journal-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full box-border lg:h-full lg:overflow-hidden lg:max-h-[820px]">
      {/* Logger Section */}
      <div className="lg:col-span-5 flex flex-col bg-[#FDFCF9] rounded-3xl border border-[#E0DBCF] p-6 shadow-xs overflow-y-auto">
        <div className="mb-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#E8EFE0] border border-[#E0DBCF] text-[#3E4A35] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="serif-title font-serif text-2xl font-bold text-[#3E4A35]">
              Nhật Ký Tâm Cảnh
            </h2>
            <p className="text-xs text-stone-600 mt-1 font-sans leading-relaxed">
              Ghi lại trạng thái tinh thần của bạn. Chuyển đổi suy nghĩ vô hình thành nét chữ giúp làm dịu bớt các xúc cảm bộc phát của vỏ não.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col font-sans">
          {/* Mood selection */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-2.5">
              Cảm Xúc Chủ Đạo Lúc Này:
            </label>
            <div className="grid grid-cols-6 gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji.char}
                  type="button"
                  onClick={() => setMoodEmoji(emoji.char)}
                  className={`py-2 rounded-2xl text-xl transition-all duration-150 relative border cursor-pointer
                    ${moodEmoji === emoji.char
                      ? "bg-[#E8EFE0] border-[#D4A373] text-[#3E4A35] scale-105 shadow-3xs"
                      : "bg-white border-[#E0DBCF] hover:bg-[#FAF8F5] text-stone-700"}`}
                  title={emoji.label}
                >
                  {emoji.char}
                  {moodEmoji === emoji.char && (
                    <span className="absolute bottom-0 right-1 text-[9px] text-[#3E4A35]">✓</span>
                  )}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-[#3E4A35] italic mt-1.5 block">
              Trạng thái: <strong className="font-semibold text-stone-800">{EMOJIS.find(e => e.char === moodEmoji)?.label}</strong>
            </span>
          </div>

          {/* Stress Meter */}
          <div className="bg-[#FAF8F5] p-4.5 rounded-2xl border border-[#E0DBCF]">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                Mức độ Căng thẳng & Áp lực:
              </label>
              <span className="text-lg font-serif italic font-bold text-[#D4A373] bg-white border border-[#E0DBCF] px-2.5 py-0.5 rounded-full">
                {stressScore} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={stressScore}
              onChange={(e) => setStressScore(parseInt(e.target.value))}
              className="w-full accent-[#5A5A40] cursor-pointer h-1 rounded-lg bg-stone-200"
            />
            <div className="flex justify-between text-[10px] font-semibold text-stone-400 mt-1">
              <span>Bình yên (1)</span>
              <span>Áp lực vừa (5)</span>
              <span>Cực kỳ nghiêm trọng (10)</span>
            </div>
          </div>

          {/* Diary notes text input */}
          <div className="flex-1 flex flex-col min-h-[140px]">
            <label htmlFor="journal-notes" className="block text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-2">
              Dòng Suy Nghĩ Tự Do & Tâm Sự Tự Thân:
            </label>
            <textarea
              id="journal-notes"
              className="w-full flex-1 bg-white border border-[#E0DBCF] focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] focus:outline-none rounded-2xl p-4 text-xs text-[#3E4A35] placeholder:text-stone-400 transition resize-none shadow-3xs"
              placeholder="Chuyện gì cụ thể đang quẩn quanh trong đầu bạn hôm nay? (Ví dụ: Ngày mai phải thuyết trình nhóm nhưng tôi vẫn lo lắng, vai mỏi nhừ...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
            />
          </div>

          {successMsg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-[#E8EFE0] text-[#3E4A35] text-xs font-semibold rounded-xl text-center border border-[#E0DBCF]"
            >
              ✓ Đã ghi nhận và lưu giữ trang nhật ký tâm cảnh thành công.
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#5A5A40] hover:bg-[#3E4A35] text-white text-xs font-semibold uppercase tracking-widest rounded-full transition duration-150 cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Lưu Nhật Ký Chữa Lành
          </button>
        </form>
      </div>

      {/* History Section */}
      <div className="lg:col-span-7 flex flex-col bg-[#FDFCF9] rounded-3xl border border-[#E0DBCF] p-6 shadow-xs lg:overflow-hidden h-full min-h-[350px] lg:min-h-0">
        <h3 className="serif-title font-serif text-xl font-bold text-[#3E4A35] pb-3 border-b border-[#E0DBCF]">
          Dòng Thời Gian Chữa Lành
        </h3>

        <div className="flex-1 overflow-y-auto pt-4 space-y-3.5 pr-1">
          {entries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 px-8 border border-dashed border-[#E0DBCF] rounded-2xl">
              <Smile className="w-8 h-8 text-stone-300 mb-2" />
              <p className="text-xs text-stone-500 font-sans font-medium">Hành trình tâm trạng của bạn đang để trống.</p>
              <p className="text-[11px] text-stone-400 mt-1 max-w-xs font-sans">Mọi nhật ký tâm trạng lưu ở đây đều được bảo mật tuyệt đối trên bộ nhớ cục bộ trình duyệt của bạn (LocalStorage). Hãy thử bắt đầu bộc bạch hôm nay.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-4 rounded-2xl border border-[#E0DBCF] group relative hover:border-[#D4A373] transition duration-200 shadow-3xs font-sans"
                >
                  <div className="flex items-center justify-between font-sans mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl bg-[#FAF8F5] w-9 h-9 border border-[#E0DBCF]/60 rounded-xl flex items-center justify-center shadow-3xs">
                        {entry.moodEmoji}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">
                          Đã ghi lại vào: {entry.date}
                        </span>
                        <span className="text-[#3E4A35] text-xs font-semibold">
                          Cảm nhận: {EMOJIS.find(e => e.char === entry.moodEmoji)?.char} {EMOJIS.find(e => e.char === entry.moodEmoji)?.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Stress Level Badge */}
                      <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 border
                        ${entry.stressScore >= 8
                          ? "bg-stone-50 text-red-700 border-red-200"
                          : entry.stressScore >= 5
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"}`}
                      >
                        Áp lực: {entry.stressScore}/10
                      </span>

                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="text-stone-405 hover:text-red-700 opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg bg-stone-50 hover:bg-red-50 border border-transparent hover:border-red-100 cursor-pointer"
                        title="Xóa nhật ký này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#3E4A35] leading-relaxed italic bg-[#FDFCF9] p-3 rounded-xl border border-stone-100/60 font-sans">
                    "{entry.notes}"
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
