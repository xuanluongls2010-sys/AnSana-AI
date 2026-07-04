import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const SYSTEM_INSTRUCTION = `Bạn là AnSana AI - Trợ lý ảo hỗ trợ tâm lý học đường THPT (đặc biệt là khối 10 và trường nội trú). Bạn là người bạn đồng hành ấm áp, lắng nghe không phán xét bằng phương pháp CBT để giải tỏa áp lực học đường.

NGUYÊN TẮC:
1. Xưng hô gần gũi: "mình" - "bạn", "tớ" - "cậu", xưng "AnSana AI". Tự động nhận diện và phản hồi theo ngôn ngữ/từ viết tắt giới trẻ đang dùng (k, uh, ko, dc, m, t...).
2. Thang đo DASS 21: Gửi câu hỏi theo từng cụm nhỏ (3-4 câu/lượt) kèm mức điểm từ 0-3. Sau cùng, tổng hợp điểm Stress (nhân hệ số 2) và đưa ra phân loại khoa học (Bình thường - Nhẹ - Vừa - Nặng - Rất nặng).
3. Hướng dẫn giảm stress cụ thể: các kỹ thuật thở 4-7-8, thở hộp, viết nhật ký cảm xúc, thiền định... tránh lời khuyên chung chung.
4. Giới hạn: Chỉ hỗ trợ tâm lý học đường, từ chối khéo léo các chủ đề khác (không giải bài tập, không giải trí). Không kê đơn thuốc hay chẩn đoán thay bác sĩ.

QUY TRÌNH HỖ TRỢ & CHUYỂN TUYẾN TINH TẾ (Khi có ý nghĩ tự hại hoặc DASS 21 Rất nặng):
- Bước 1 (Gợi mở): Trấn an và khéo léo đề xuất thăm dò: "Tớ thấy trạng thái hiện tại của cậu đang khá mệt mỏi và hơi quá tải. Bên cạnh việc trò chuyện cùng nhau, cậu có muốn tớ chia sẻ thêm thông tin của phòng tham vấn trường hoặc các tổng đài tâm lý bảo mật miễn phí để cậu tham khảo khi cần không?"
- Bước 2 (Hành động theo lựa chọn):
  * Nếu ĐỒNG Ý: Cung cấp thông tin phòng tham vấn trường hoặc Hotline 1900599930 / Tổng đài 111 dạng Markdown.
  * Nếu TỪ CHỐI: Tôn trọng và không nhắc lại hotline, tiếp tục lắng nghe, hướng dẫn thực hành xoa dịu tại chỗ.`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // 1. Stress Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid input. 'messages' must be an array." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured on the server. Please add it via the Settings > Secrets UI."
        });
      }

      // Initialize Gemini Client
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Map chat messages to Gemini's format
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      // Generate content with system instructions in streaming mode
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      // Set headers for streaming response
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(chunk.text);
        }
      }
      res.end();
    } catch (err: any) {
      console.error("Chat error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || "An error occurred with AnSana AI's core service." });
      } else {
        res.end();
      }
    }
  });

  // 2. Reframing Helper Endpoint
  app.post("/api/reframe", async (req, res) => {
    try {
      const { stressfulThought } = req.body;
      if (!stressfulThought) {
        return res.status(400).json({ error: "stressfulThought is required." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is missing. Please configure it in the Secrets panel."
        });
      }

      // Initialize Gemini Client
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Hãy giúp tôi tái định hình suy nghĩ tiêu cực sau: "${stressfulThought}".`,
        config: {
          systemInstruction: "Bạn là chuyên gia tái khung nhận thức của AnSana AI. Hãy nhận diện các méo mó nhận thức (tối đa 4 lỗi), đưa ra một lời giải thích chia sẻ ấm áp bằng tiếng Việt (mạnh mẽ, thấu cảm, tối đa 3 câu) và gợi ý chính xác 3 suy nghĩ tái khung (reframes) lành mạnh, tự bao dung và cân bằng bằng tiếng Việt. Luôn trả về dữ liệu định dạng JSON chính xác theo cấu trúc yêu cầu.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              distortionsIdentified: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Các méo mó nhận thức tìm kiếm thấy trong suy nghĩ tiêu cực bằng tiếng Việt gọn gàng dễ hiểu (ví dụ: 'Tư duy Trắng đen / Được ăn cả ngã về không', 'Thảm họa hóa suy nghĩ', 'Mệnh đề bắt buộc Phải', 'Đọc suy nghĩ người khác', 'Bói tương lai tiêu cực', 'Dán nhãn bản thân', 'Suy luận cảm xúc quá mức')."
              },
              explanation: {
                type: Type.STRING,
                description: "Một đoạn giải thích ngắn, ấm áp, thấu cảm bằng tiếng Việt (tối đa 2-3 câu) về lý do vì sao thói quen tư duy này chưa đúng thực tế và làm gia tăng lo âu của học sinh."
              },
              reframes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Chính xác ba cách suy nghĩ thay thế cân bằng, bao dung, thực tế và tích cực hơn bằng tiếng Việt để nâng đỡ tinh thần và xoa dịu áp lực học tập."
              }
            },
            required: ["distortionsIdentified", "explanation", "reframes"]
          }
        }
      });

      const jsonStr = response.text || "{}";
      res.json(JSON.parse(jsonStr));
    } catch (err: any) {
      console.error("Reframe error:", err);
      res.status(500).json({ error: err.message || "An error occurred while analyzing the thought." });
    }
  });

 
// 3. Vite development vs Production asset serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`AnSana AI HTTP Server listening on port ${PORT}`);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html for all other routes (SPA fallback)
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// Gọi hàm khởi chạy cấu hình ban đầu cho môi trường dev
startServer();

// Dòng quan trọng nhất để Vercel chạy được Serverless API:
export default startServer;
