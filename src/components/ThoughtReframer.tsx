import React, { useState } from "react";
import { AlertCircle, Wand2, Lightbulb, CheckCircle2, Copy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ReframeResult } from "../types";

export default function ThoughtReframer() {
  const [thought, setThought] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReframeResult | null>(null);
  const [ownReframe, setOwnReframe] = useState("");
  const [hasSharedReframe, setHasSharedReframe] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleAnalze = async () => {
    if (!thought.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setHasSharedReframe(false);
    setOwnReframe("");

    try {
      const response = await fetch("/api/reframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stressfulThought: thought.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Không thể phân tích suy nghĩ gây căng thẳng này.");
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra sự cố khi kết nối với máy chủ phân tích nhận thức.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApplyOwnReframe = () => {
    if (!ownReframe.trim()) return;
    setHasSharedReframe(true);
  };

  return (
    <div id="reframe-tool-root" className="flex flex-col w-full box-border h-full lg:h-full lg:max-h-[820px] min-h-[500px] lg:min-h-0 bg-[#FDFCF9] rounded-3xl border border-[#E0DBCF] p-6 shadow-xs overflow-y-auto">
      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#E8EFE0] border border-[#E0DBCF] text-[#3E4A35] flex items-center justify-center shrink-0">
          <Lightbulb className="w-5.5 h-5.5" />
        </div>
        <div>
          <h2 className="serif-title font-serif text-2xl font-bold text-[#3E4A35]">
            Tái Khung Nhận Thức CBT
          </h2>
          <p className="text-xs text-stone-600 mt-1 font-sans leading-relaxed">
            Tháo gỡ những vòng xoáy suy nghĩ tiêu cực hay tự chỉ trích. Hãy nhập vào những tuyên bố gây căng thẳng hoặc suy nghĩ phán xét bản thân, và viết lại chúng dưới những góc nhìn thấu cảm, thực tế và lành mạnh hơn.
          </p>
        </div>
      </div>

      {/* Input thought section */}
      <div className="space-y-4 bg-[#F2EDE4]/60 p-5 rounded-2xl border border-[#E0DBCF]">
        <div>
          <label htmlFor="student-stress-thought" className="block text-[10px] uppercase tracking-widest font-bold text-stone-700 mb-2 font-sans">
            Suy Nghĩ Tiêu Cực Hoặc Tự Chỉ Trích Của Bạn:
          </label>
          <textarea
            id="student-stress-thought"
            rows={3}
            className="w-full bg-white border border-[#E0DBCF] focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] focus:outline-none rounded-2xl p-4 text-sm text-[#3E4A35] placeholder:text-stone-400 font-sans transition resize-none shadow-2xs"
            placeholder="Ví dụ: 'Nếu tôi không đạt điểm tối đa trong kỳ thi này, tôi là kẻ thất bại hoàn toàn và mọi người sẽ coi thường khinh khi tôi...'"
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <button
          id="btn-analyze-thought"
          onClick={handleAnalze}
          disabled={!thought.trim() || isLoading}
          className="w-full py-3 bg-[#5A5A40] hover:bg-[#3E4A35] text-white font-semibold rounded-full text-xs uppercase tracking-wider shadow-sm transition duration-200 cursor-pointer disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none flex items-center justify-center gap-2 font-sans"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang Phân Tích Thói Quen Nhận Thức...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Tái Định Hình Bằng AnSana AI
            </>
          )}
        </button>
      </div>

      {/* Loading & error & results */}
      <div className="mt-5 flex-1">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-orange-50 border border-amber-200 text-amber-900 text-xs flex gap-3 items-start shadow-3xs font-sans"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <div>
                <p className="font-bold text-amber-955">Gặp Sự Cố Phân Tích Nhận Thức</p>
                <p className="opacity-90 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-4 font-sans"
            >
              <div className="w-12 h-12 bg-[#E8EFE0] rounded-full flex items-center justify-center border border-dashed border-[#3E4A35] animate-spin" />
              <div>
                <p className="font-semibold text-[#3E4A35] text-sm">Đang tháo gỡ các vòng xoáy căng thẳng...</p>
                <p className="text-xs text-stone-600 mt-1">Đang chọn lọc các ngôn từ kích hoạt để chuyển hóa thành góc nhìn khách quan và tích cực.</p>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Distortions badges */}
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-2.5 font-sans">
                  Các Méo Mó Nhận Thức Được Phát Hiện:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.distortionsIdentified.map((distortion, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-3 py-1 bg-[#E8EFE0] border border-[#E0DBCF] text-[#3E4A35] rounded-full shadow-3xs font-sans"
                    >
                      🌱 {distortion}
                    </span>
                  ))}
                </div>
              </div>

              {/* Psychological analysis */}
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E0DBCF]">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1 font-sans">
                  Góc Nhìn Thấu Cảm & Khuyên Giải:
                </span>
                <p className="serif-title font-serif italic text-base text-[#3E4A35] leading-relaxed">
                  "{result.explanation}"
                </p>
              </div>

              {/* Suggestion listing */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block font-sans">
                  Ba Lời Tái Khung Cân Bằng & Tự Bao Dung:
                </span>
                <div className="space-y-2.5 font-sans">
                  {result.reframes.map((reframe, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white border border-[#E0DBCF] hover:border-[#D4A373] rounded-2xl relative group transition flex gap-3 shadow-2xs"
                    >
                      <span className="font-serif font-bold text-[#D4A373] text-sm italic">{idx + 1}.</span>
                      <p className="text-sm text-[#3E4A35] leading-relaxed pr-10 flex-1">{reframe}</p>
                      <button
                        onClick={() => copyToClipboard(reframe, idx)}
                        className="text-[#3E4A35]/60 hover:text-[#3E4A35] p-1 rounded-md absolute right-3 top-3 opacity-60 group-hover:opacity-100 transition duration-250 cursor-pointer"
                        title="Sao chép suy nghĩ này"
                      >
                        {copiedIndex === idx ? (
                          <span className="text-[9px] font-bold bg-[#E8EFE0] text-[#3E4A35] px-2 py-0.5 rounded-full border border-[#E0DBCF]">Đã chép</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Own final reframe worksheet practice */}
              <div className="border-t border-[#E0DBCF] pt-5 space-y-3">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block font-sans">
                  Bài Tập Tự Tái Định Hình Nhận Thức:
                </span>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  Tổng hợp thông tin thu được ở trên. Hãy tự mình viết ra một câu khẳng định tích cực, dịu nhẹ và thấu hiểu hơn sao cho phù hợp với cảm giác của bạn lúc này.
                </p>

                {hasSharedReframe ? (
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-[#E8EFE0] border border-[#E0DBCF] rounded-2xl text-[#3E4A35] text-sm flex gap-3.5 items-start mt-2 shadow-2xs font-sans"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-stone-900">Nhận Thức Vô Cùng Tuyệt Vời!</p>
                      <p className="mt-1 leading-relaxed italic text-stone-750">"{ownReframe}"</p>
                      <p className="text-[10px] text-stone-500 mt-2">Việc rèn luyện nhận thức tích cực thường xuyên giúp gieo mầm cho những lối sống lành mạnh. Hãy trân trọng và giữ lời nhắc nhở này bên mình.</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex gap-2 items-end font-sans">
                    <input
                      type="text"
                      className="flex-1 bg-white border border-[#E0DBCF] focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] focus:outline-none rounded-2xl px-4 py-3 text-sm text-[#3E4A35] placeholder:text-stone-400 transition shadow-inner"
                      placeholder="Ví dụ: Tôi sẽ cố gắng hết sức của mình, kết quả dù thế nào tôi vẫn luôn xứng đáng được yêu thương..."
                      value={ownReframe}
                      onChange={(e) => setOwnReframe(e.target.value)}
                    />
                    <button
                      onClick={handleApplyOwnReframe}
                      disabled={!ownReframe.trim()}
                      className="py-3 px-5 bg-[#5A5A40] hover:bg-[#3E4A35] text-white text-xs font-semibold rounded-full shadow-2xs cursor-pointer disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none shrink-0 transition"
                    >
                      Lưu Lời Tự Nhủ
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {!result && !isLoading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-44 border border-dashed border-[#E0DBCF] rounded-3xl flex flex-col items-center justify-center p-5 text-center mt-2 font-sans"
            >
              <Lightbulb className="w-7 h-7 text-[#D4A373] mb-2" />
              <p className="text-xs text-stone-600 max-w-xs leading-relaxed font-medium">
                Gõ những suy nghĩ quẩn quanh gây áp lực vào ô nhập liệu ở trên để AnSana AI phân tích và phản biện thấu tình đạt lý giúp bạn nhé.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
