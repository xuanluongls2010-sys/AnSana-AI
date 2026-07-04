import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Wind, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type BreathingPhase = "inhale" | "holdIn" | "exhale" | "holdOut";

const PHASE_CONFIGs: Record<BreathingPhase, {
  text: string;
  duration: number;
  scale: number;
  color: string;
  subtext: string;
  gradient: string;
}> = {
  inhale: {
    text: "Hít Vào Thật Sâu",
    duration: 4,
    scale: 1.4,
    color: "text-[#3E4A35]",
    subtext: "Hít hơi thở trong lành chứa năng lượng thanh khiết nuôi dưỡng buồng phổi...",
    gradient: "from-[#E8EFE0] to-[#D4A373]",
  },
  holdIn: {
    text: "Nín Thở & Hòa Nhịp",
    duration: 4,
    scale: 1.4,
    color: "text-[#3E4A35]",
    subtext: "Thả lỏng toàn bộ các nhóm cơ và tĩnh lặng giữ hơi ấm tràn đầy...",
    gradient: "from-[#D4A373] to-[#E0DBCF]",
  },
  exhale: {
    text: "Từ Từ Thở Ra",
    duration: 4,
    scale: 1.0,
    color: "text-[#5A5A40]",
    subtext: "Nhẹ nhàng đẩy trút hết áp lực học tập, thi cử và những âu lo bất an tự thân...",
    gradient: "from-[#E8EFE0] to-[#FAF8F5]",
  },
  holdOut: {
    text: "Ngưng Lặng Tĩnh Tâm",
    duration: 4,
    scale: 1.0,
    color: "text-[#3E4A35]",
    subtext: "Cảm nhận sự bình nhiên, thong sảng tuyệt đối trước khi chu kỳ thở tiếp theo...",
    gradient: "from-[#F2EDE4] to-[#E8EFE0]",
  }
};

const PHASES: BreathingPhase[] = ["inhale", "holdIn", "exhale", "holdOut"];

export default function BreathingVisualizer() {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const activePhase = PHASES[phaseIndex];
  const config = PHASE_CONFIGs[activePhase];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
        interval = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              // Transition to next phase
              const nextIdx = (phaseIndex + 1) % PHASES.length;
              setPhaseIndex(nextIdx);
              if (nextIdx === 0) {
                setCycleCount((c) => c + 1);
              }
              return PHASE_CONFIGs[PHASES[nextIdx]].duration;
            }
            return prev - 1;
          });
        }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, phaseIndex]);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setSecondsRemaining(4);
    setCycleCount(0);
    setElapsedTime(0);
  };

  return (
    <div id="breathing-visual-container" className="flex flex-col w-full box-border h-full lg:h-full min-h-[500px] lg:min-h-0 bg-[#FDFCF9] rounded-3xl border border-[#E0DBCF] p-6 shadow-xs overflow-hidden">
      {/* Visual Header */}
      <div className="text-center mb-4">
        <h2 className="serif-title font-serif text-2xl font-bold text-[#3E4A35] flex items-center justify-center gap-2">
          <Heart className="w-5 h-5 text-emerald-800" />
          Liệu Pháp Thở Hộp Thư Giãn (Box Breathing)
        </h2>
        <p className="text-xs text-stone-600 mt-1.5 max-w-sm mx-auto font-sans leading-relaxed">
          Kỹ thuật định lực 4 giây giúp điều hòa nhịp trống ngực, quân bình nồng độ adrenaline và khôi phục sự minh mẫn tập trung tuyệt hảo để giải quyết bài vở học tập.
        </p>
      </div>

      {/* Breathing Main Stage */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Outer Ripple circle */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-64 h-64 rounded-full bg-[#E8EFE0]/40 border border-[#E0DBCF]"
          />

          {/* Animated phase circle scaling up/down */}
          <motion.div
            animate={{
              scale: config.scale,
              filter: isActive ? "blur(8px)" : "blur(0px)"
            }}
            transition={{
              duration: 4,
              ease: "easeInOut"
            }}
            className={`absolute w-36 h-36 rounded-full bg-gradient-to-tr ${config.gradient} opacity-20`}
          />

          {/* Core Breathing Circle */}
          <motion.div
            animate={{
              scale: config.scale,
              boxShadow: isActive 
                ? "0 0 20px rgba(212, 163, 115, 0.3)" 
                : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}
            transition={{
              duration: 4,
              ease: "easeInOut"
            }}
            className={`absolute w-28 h-28 rounded-full bg-gradient-to-br ${config.gradient} flex flex-col items-center justify-center border border-white/80`}
          >
            <span className="serif-title font-serif text-4xl font-bold tracking-tight text-[#3E4A35] tabular-nums">
              {secondsRemaining}
            </span>
            <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-stone-700/80 mt-0.5">
              giây
            </span>
          </motion.div>

          {/* Floating Leaves / Sparkles */}
          {isActive && (
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute top-4 left-8 text-emerald-800 animate-pulse text-xs">🌱</span>
              <span className="absolute bottom-4 right-10 text-emerald-800 animate-pulse text-[10px]">🌿</span>
              <span className="absolute bottom-10 left-4 text-emerald-800 animate-pulse text-xs">✨</span>
            </div>
          )}
        </div>

        {/* Phase Text Status */}
        <div className="mt-8 text-center min-h-[5.5rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="space-y-1.5"
            >
              <h3 className={`serif-title font-serif text-2xl font-bold italic ${config.color}`}>
                {config.text}
              </h3>
              <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed h-11 px-4 font-sans">
                {config.subtext}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 mb-6">
          {isActive && (
            <span className="text-[10px] bg-[#E8EFE0] px-3 py-1 rounded-full border border-[#E0DBCF]/40 flex items-center gap-1.5 animate-pulse font-sans font-medium text-[#3E4A35]">
              <span className="w-1.5 h-1.5 bg-[#3E4A35] rounded-full" /> Đang Tập
            </span>
          )}
        </div>
      </div>

      {/* Stage Controls */}
      <div className="flex justify-center gap-2.5 bg-[#F2EDE4]/60 p-3 rounded-2xl border border-[#E0DBCF]">
        <button
          onClick={handleToggle}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-2xs transition duration-200 cursor-pointer text-white font-sans
            ${isActive
              ? "bg-[#D4A373] hover:bg-[#c99564]"
              : "bg-[#5A5A40] hover:bg-[#3E4A35]"}`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4" /> Tạm Dừng
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Bắt Đầu
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2.5 bg-white border border-[#E0DBCF] hover:bg-[#FAF8F5] hover:border-[#D4A373] text-[#3E4A35] rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-3xs transition duration-200 cursor-pointer font-sans"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Kết Thúc
        </button>
      </div>
    </div>
  );
}
