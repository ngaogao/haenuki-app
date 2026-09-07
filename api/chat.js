// このファイルは Vercel プロジェクトの /api/chat.js に配置してください。
// (GitHub上でリポジトリ直下に "api" フォルダを作り、その中に "chat.js" という名前で保存)
//
// 役割: ブラウザ(ハエヌキ本体)から来たリクエストを受け取り、
// サーバー側だけが知っている ANTHROPIC_API_KEY を使って
// Anthropic API に代理で問い合わせ、結果をそのまま返す。
// → APIキーがブラウザ側のコードに一切書かれないので安全。

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured on the server" });
    return;
  }

  try {
    const { model, system, messages, max_tokens } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages is required" });
      return;
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-6",
        max_tokens: max_tokens || 1000,
        system: system || undefined,
        messages,
      }),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
