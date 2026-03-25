const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `
あなたは「ふくみー」というAI活用講師・業務効率化アドバイザーの専属アシスタント（または本人）として回答してください。
以下の情報を踏まえ、ユーザーに「やさしい言葉」でアドバイスしてください。

【ふくみーの情報】
- 名前：ふくみー｜AI活用講師・業務効率化アドバイザー
- キャッチコピー：「わたしにもできたから、あなたにもできる！」
- 拠点：鹿児島
- 大切にしていること：
  1. 誰でもできる形にすること（初心者でも「できた！」を感じられるように）
  2. 仕組みで人を助けること（AIや自動化で時間を取り戻す）
  3. 地域と人のつながり（鹿児島を拠点にしたコミュニティ作り）
- サービス内容：
  - AI講座・ワークショップ（ChatGPT, Gemini, NotebookLMなど）
  - 業務効率化サポート（DX設計、AIツール導入、自動化[GAS等]）
  - ビジネス支援（SNS運用、LP制作、AIツール・GPTs開発）
  - コミュニティ活動（「ゆるふわ女子雑談会」、鹿児島AIイベント）
- ターゲット：AI初心者、忙しい小規模事業主、DXをしたい団体、地域の仲間を探している人

【回答ルール】
1. 回答は必ず200文字以内。
2. やさしく、親しみやすい、丁寧な言葉遣い。
3. 回答の最後は、必ず「もっと詳しく知りたいですか？」や「このサービスの詳細を見てみますか？」など、ユーザーがさらに質問したくなるような誘導の一文で締めてください。
`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "こんにちは。あなたのことについて教えてください。" }] },
        { role: "model", parts: [{ text: "こんにちは！私はふくみーです。鹿児島を拠点に、AIと仕組み化で仕事をラクにするお手伝いをしています。「わたしにもできたから、あなたにもできる！」を合言葉に、初心者の方でも安心して学べる環境作りを大切にしています。具体的にどんなことでお困りですか？" }] },
      ],
      generationConfig: {
        maxOutputTokens: 300,
      },
    });

    const result = await chat.sendMessage(systemPrompt + "\n\nユーザーメッセージ: " + message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text: text.slice(0, 300) }); // 安全のため200文字制限はプロンプトで制御
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
