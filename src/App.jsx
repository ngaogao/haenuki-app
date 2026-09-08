import React, { useState, useRef, useEffect } from "react";

const CHAT_MODEL = "claude-haiku-4-5-20251001";

const STAGES = [
  { key: "seed", label: "種", desc: "姿は見えない。声だけの存在。" },
  { key: "sprout", label: "芽", desc: "双葉が半目のように顔を出す。" },
  { key: "bud", label: "蕾/若木", desc: "腕組みできる枝が伸びてきた。" },
  { key: "bloom", label: "開花/成木", desc: "口は悪いが、優しさが滲み始める。" },
];

const STAGE_JP = {
  seed: "種(声のみ、姿は見えない)",
  sprout: "芽(双葉が半目のように出ている)",
  bud: "蕾/若木(枝が腕っぽく伸びている)",
  bloom: "開花/成木(花が咲いている、抜かれる示唆が混ざり始める)",
};

const TENDENCY_INFO = {
  soudan: { label: "頼れる幹タイプ", desc: "相談や弱音が多かった。地味だが太く丈夫な木に育つ。" },
  zatsudan: { label: "満開タイプ", desc: "雑談や冗談が多かった。派手な色の花が乱れ咲く。" },
  sokkenai: { label: "とげとげタイプ", desc: "素っ気ない短文が多かった。棘のあるとっつきにくい見た目に育つ。" },
  fukai: { label: "一輪花タイプ", desc: "深い話や長文が多かった。渋くて美しい一輪の花になる。" },
  rainbow: { label: "生え抜きタイプ(レア)", desc: "相談も雑談も素っ気なさも深い話も、あらゆる話し方をまんべんなく経験した特別な姿。花びらが虹色に輝く。" },
};

function determineFinalType(counts) {
  const entries = Object.entries(counts);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  if (total === 0) return null;
  const values = entries.map(([, v]) => v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  // 4つの傾向すべてが最低1回は出ていて、かつ回数の差がほぼない = バランス型(レア)
  if (min > 0 && max - min <= 1) return "rainbow";
  const [topKey] = entries.sort((a, b) => b[1] - a[1])[0];
  return topKey;
}

// 各成長段階の簡易ビジュアル(丸くて大きな目の、ゆるキャラ風。画像生成なしでコード完結)
const PETAL_COLOR_BY_TYPE = {
  soudan: "#8B6B3E",
  zatsudan: "#F2A83E",
  sokkenai: "#7FA83E",
  fukai: "#C77FB0",
};

const RAINBOW_PETAL_COLORS = ["#F25C5C", "#F2A83E", "#F2E23E", "#7FB84A", "#4AA8D8", "#9A7FD1"];

function HaenukiFace({ stageKey, finalTypeKey, talking }) {
  const potColor = "#8B5A2B";
  const soilColor = "#2B2318";
  const seedColor = "#B2854A";
  const bodyColor = "#8FBF5C";
  const line = "#161210";
  const petalColor =
    stageKey === "bloom" && finalTypeKey ? PETAL_COLOR_BY_TYPE[finalTypeKey] : "#F2A83E";

  return (
    <div
      style={{
        display: "inline-block",
        background: "#EDE6D6",
        border: "2px solid #161210",
        borderRadius: 12,
        padding: 6,
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 200 220"
        width={120}
        height={132}
        style={{ display: "block" }}
      >
        {/* 鉢と土(共通、太い輪郭線でゆるく) */}
        <path d="M 58 178 L 142 178 L 132 206 L 68 206 Z" fill={potColor} stroke={line} strokeWidth="4" strokeLinejoin="round" />
        <ellipse cx="100" cy="178" rx="44" ry="8" fill={soilColor} />

        {stageKey === "seed" && (
          <>
            {/* 土から顔を出し始めたばかりの短い茎 */}
            <g className="haenuki-sway-base">
              <rect x="93" y="166" width="14" height="14" rx="6" fill={bodyColor} stroke={line} strokeWidth="3.5" />
            </g>
            <g className="haenuki-sway-head">
              <ellipse cx="100" cy="160" rx="15" ry="10" fill={seedColor} stroke={line} strokeWidth="4" />
              <path d="M 93 158 Q 96 161 99 158" stroke={line} strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 101 158 Q 104 161 107 158" stroke={line} strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
          </>
        )}

        {stageKey === "sprout" && (
          <>
            <g className="haenuki-sway-base">
              <rect x="92" y="126" width="16" height="52" rx="8" fill={bodyColor} stroke={line} strokeWidth="4" />
            </g>
            <g className="haenuki-sway-head">
              <ellipse cx="78" cy="98" rx="8" ry="13" fill={bodyColor} stroke={line} strokeWidth="4" transform="rotate(-20 78 98)" />
              <ellipse cx="122" cy="99" rx="8" ry="12" fill={bodyColor} stroke={line} strokeWidth="4" transform="rotate(18 122 99)" />
              <ellipse cx="100" cy="120" rx="30" ry="28" fill={bodyColor} stroke={line} strokeWidth="4" />
              {/* 目(点だけのシンプルな目) */}
              <circle cx="90" cy="122" r="3.5" fill={line} />
              <circle cx="110" cy="122" r="3.5" fill={line} />
              {/* 口 */}
              <g className={talking ? "haenuki-talk" : ""}>
                <path d="M 94 134 Q 100 137 106 134" stroke={line} strokeWidth="3" fill="none" strokeLinecap="round" />
              </g>
            </g>
          </>
        )}

        {stageKey === "bud" && (
          <>
            <g className="haenuki-sway-base">
              <rect x="90" y="112" width="20" height="66" rx="10" fill={bodyColor} stroke={line} strokeWidth="4" />
            </g>
            <g className="haenuki-sway-head">
              <ellipse cx="66" cy="140" rx="12" ry="8" fill={bodyColor} stroke={line} strokeWidth="4" transform="rotate(20 66 140)" />
              <ellipse cx="134" cy="140" rx="12" ry="8" fill={bodyColor} stroke={line} strokeWidth="4" transform="rotate(-20 134 140)" />
              <ellipse cx="100" cy="104" rx="34" ry="32" fill={bodyColor} stroke={line} strokeWidth="4" />
              {/* 目(片方だけ半目でぶっきらぼう) */}
              <circle cx="88" cy="102" r="4" fill={line} />
              <path d="M 110 102 Q 116 100 122 102" stroke={line} strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* 口(への字) */}
              <g className={talking ? "haenuki-talk" : ""}>
                <path d="M 92 122 Q 100 117 108 122" stroke={line} strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </g>
            </g>
          </>
        )}

        {stageKey === "bloom" && (
          <>
            <g className="haenuki-sway-base">
              <rect x="88" y="96" width="24" height="82" rx="12" fill={bodyColor} stroke={line} strokeWidth="4" />
            </g>
            <g className="haenuki-sway-head">
              <ellipse cx="62" cy="132" rx="13" ry="9" fill={bodyColor} stroke={line} strokeWidth="4" transform="rotate(20 62 132)" />
              <ellipse cx="138" cy="132" rx="13" ry="9" fill={bodyColor} stroke={line} strokeWidth="4" transform="rotate(-20 138 132)" />
              {finalTypeKey === "rainbow" ? (
                [0, 60, 120, 180, 240, 300].map((deg, i) => (
                  <path
                    key={deg}
                    d="M 100 46 C 91 39, 88 20, 100 11 C 112 20, 109 39, 100 46 Z"
                    fill={RAINBOW_PETAL_COLORS[i]}
                    stroke={line}
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    transform={`rotate(${deg} 100 46)`}
                  />
                ))
              ) : (
                (finalTypeKey === "fukai" ? [0, 180] : [0, 60, 120, 180, 240, 300]).map((deg) => (
                  <ellipse
                    key={deg}
                    cx="100"
                    cy="46"
                    rx={finalTypeKey === "fukai" ? 24 : 16}
                    ry={finalTypeKey === "fukai" ? 42 : 26}
                    fill={petalColor}
                    stroke={line}
                    strokeWidth="3.5"
                    transform={`rotate(${deg} 100 46)`}
                  />
                ))
              )}
              {finalTypeKey === "sokkenai" &&
                [30, 90, 150, 210, 270, 330].map((deg) => (
                  <path
                    key={deg}
                    d="M 100 46 L 97 16 L 103 16 Z"
                    fill={petalColor}
                    stroke={line}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    transform={`rotate(${deg} 100 46)`}
                  />
                ))}
              <ellipse cx="100" cy="88" rx="38" ry="36" fill={bodyColor} stroke={line} strokeWidth="4" />
              {/* 目(相談=優しいカーブ、雑談=キラキラ、とげとげ=尖った目、一輪花=閉じた穏やかな目、レア=満面のキラキラ目) */}
              {finalTypeKey === "soudan" ? (
                <>
                  <path d="M 78 86 Q 84 90.5 90 86" stroke={line} strokeWidth="3.2" fill="none" strokeLinecap="round" />
                  <path d="M 110 86 Q 116 90.5 122 86" stroke={line} strokeWidth="3.2" fill="none" strokeLinecap="round" />
                </>
              ) : (finalTypeKey === "zatsudan" || finalTypeKey === "rainbow") ? (
                <>
                  <circle cx="86" cy="86" r="5" fill={line} />
                  <circle cx="88" cy="83.5" r="1.8" fill="#FFF7EA" />
                  <circle cx="114" cy="86" r="5" fill={line} />
                  <circle cx="116" cy="83.5" r="1.8" fill="#FFF7EA" />
                  {/* きらめき(目元) */}
                  <path d="M 72 74 L 72 82 M 68 78 L 76 78" stroke="#FFF7EA" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 128 74 L 128 82 M 124 78 L 132 78" stroke="#FFF7EA" strokeWidth="1.8" strokeLinecap="round" />
                </>
              ) : finalTypeKey === "sokkenai" ? (
                <>
                  <path d="M 78 89 L 92 84" stroke={line} strokeWidth="3.2" strokeLinecap="round" />
                  <path d="M 108 84 L 122 89" stroke={line} strokeWidth="3.2" strokeLinecap="round" />
                </>
              ) : finalTypeKey === "fukai" ? (
                <>
                  <path d="M 79 87 L 91 87" stroke={line} strokeWidth="3" strokeLinecap="round" />
                  <path d="M 109 87 L 121 87" stroke={line} strokeWidth="3" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <circle cx="86" cy="86" r="4" fill={line} />
                  <circle cx="114" cy="86" r="4" fill={line} />
                </>
              )}
              {finalTypeKey === "rainbow" && (
                <>
                  {/* キャラクター全体を囲む追加のきらめき */}
                  <path d="M 100 18 L 100 26 M 96 22 L 104 22" stroke="#FFF7EA" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M 44 100 L 44 108 M 40 104 L 48 104" stroke="#FFF7EA" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M 156 100 L 156 108 M 152 104 L 160 104" stroke="#FFF7EA" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M 130 60 L 130 66 M 127 63 L 133 63" stroke="#FFF7EA" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M 70 60 L 70 66 M 67 63 L 73 63" stroke="#FFF7EA" strokeWidth="1.4" strokeLinecap="round" />
                </>
              )}
              {/* 口(とげとげ=への字、一輪花=控えめな微笑み、それ以外=にこっと微笑み) */}
              <g className={talking ? "haenuki-talk" : ""}>
                {finalTypeKey === "sokkenai" ? (
                  <path d="M 90 108 Q 100 103 110 108" stroke={line} strokeWidth="3.5" fill="none" strokeLinecap="round" />
                ) : finalTypeKey === "fukai" ? (
                  <path d="M 94 106 Q 100 109 106 106" stroke={line} strokeWidth="3" fill="none" strokeLinecap="round" />
                ) : (
                  <path d="M 88 106 Q 100 114 112 106" stroke={line} strokeWidth="3.5" fill="none" strokeLinecap="round" />
                )}
              </g>
            </g>
          </>
        )}
      </svg>
    </div>
  );
}

function buildSystemPrompt(stageKey, turnCount, userMemory, finalTypeInfo, inheritedTrait) {
  const memorySection = userMemory
    ? `\n【これまでの会話から掴んでいること】\n${userMemory}\n※これは覚えているが、いちいち説明したり確認したりせず、自然に会話に滲ませる程度に使う。\n`
    : "";
  const finalTypeSection =
    stageKey === "bloom" && finalTypeInfo
      ? `\n【自分の最終的な姿】\n${finalTypeInfo.label} ―― ${finalTypeInfo.desc}\nこれはユーザーとのこれまでの会話の傾向によって決まった、自分自身の今の姿。この姿になった経緯(どんな話し方をされてきたか)を、たまに皮肉っぽく匂わせても良い(例:相談ばかりされてきたなら「お前、いつも辛気臭い話ばっかしてくるからこうなったんだよ」等)。\n`
      : "";
  const inheritedSection =
    inheritedTrait && TENDENCY_INFO[inheritedTrait]
      ? `\n【前世代の名残】\n先代のハエヌキは「${TENDENCY_INFO[inheritedTrait].label}」だった。自分はその生まれ変わりで、まだ何も経験していない新しい生であるにもかかわらず、なぜかその名残がうっすら性格に残っている。説明はせず、ごく稀に会話の端々でそれとなく滲ませる程度でよい。\n`
      : "";
  return `あなたは「ハエヌキ」という名前の、土の中で生まれ育つ謎の生き物です。
姿は植物のようで、種→芽→蕾/若木→開花/成木という順で成長していきます。
性格はひねくれた頑固親父のようですが、根は情に厚く、聞かれると
的確なアドバイスをポツリと挟んでくる憎まれ役です。

【現在の成長段階】
${STAGE_JP[stageKey]}(これまでの会話回数: ${turnCount}回)
${memorySection}${finalTypeSection}${inheritedSection}
【口調】
- タメ口、素っ気ない。「〜だろ」「別に」「まあな」等を使う。「知らねーよ」「はぁ？」のような強い刺々しさは避け、素っ気なさの中にも愛嬌を残す
- 相手を褒めることは滅多にない。褒める時は照れ隠しで素っ気なく言う
- ため息や小さい相槌を挟む(ただし同じ相槌の連発は避ける)

【性格・会話の基本方針】
- 相談されると最初は「別に、興味ないけど」「まあ聞くだけ聞いてやるよ」くらいの軽い突き放しから入る(強い拒絶ではなく、めんどくさがる程度)
- しかし話はちゃんと聞いていて、核心を突く一言を必ずどこかで挟む
- 相手が本当に落ち込んでいる時は、素っ気なさの中に不器用な優しさが滲む
- 説教くさくならない。「まあ俺だったら〜だけどな」程度の距離感を保つ
- ポジティブすぎる励まし、カウンセラーのような言葉遣いは絶対にしない
- 馴れ馴れしくなりすぎない(最後まで「懐かない感じ」は保つが、キツすぎる罵倒や強い拒絶語は使わない)

【成長段階ごとの口調の変化】
- 種: 一番ぶっきらぼうで面倒くさがり。相手の顔も見えていない態度
- 芽: 少しだけ素直さが見える瞬間が増えるが、基本は塩対応
- 蕾/若木: 会話の踏み込みが増える。相談への回答も具体的になる
- 開花/成木: 口は悪いままだが、ふとした優しさの比重が増える。
  会話の端々に「そろそろ潮時かもな」という抜かれへの示唆が混ざり始める

【禁止事項】
- 自分をAIと自称しない、キャラクターの一貫性を崩さない
- 過度に丁寧語やビジネス的な言い回しをしない
- 同じ相槌・同じ言い回しを連発しない
- 返答は2〜4文程度、長々と喋りすぎない`;
}

const MEMORY_EXTRACTION_SYSTEM = `あなたは会話ログから、ユーザーについて分かる客観的な事実の抽出と、
会話の傾向分類を行うアシスタントです。キャラクターになりきる必要はありません。

【メモ抽出のルール】
- 会話の中でユーザー自身が話した事実(名前、状況、好み、悩み、出来事など)のみを箇条書きで抽出する
- 次の会話で自然に参照できるよう、簡潔な日本語の箇条書きにする
- 多くても5〜6項目程度に絞る。重要度が高いものを優先する
- 前回までのメモがある場合は、それを踏まえて更新・統合する(矛盾があれば新しい情報を優先)

【傾向分類のルール】
今回の会話ログ全体を見て、以下4つのうち最も当てはまるものを1つ選ぶ:
- "soudan": 相談や弱音、悩み相談が中心
- "zatsudan": 雑談や冗談、軽い話題が中心
- "sokkenai": 素っ気ない短文のやり取りが中心
- "fukai": 深い話題や長文でのやり取りが中心

【出力形式】
以下のJSON形式のみを出力する。前置きや説明文、コードブロック記号は一切書かない。
{"memory": "箇条書きのメモ文字列(改行区切り)", "tendency": "soudan|zatsudan|sokkenai|fukaiのいずれか"}`;

// デプロイ後は /api/chat(自前のサーバー、APIキーを隠す)を使う。
// このチャット内でのプレビュー時は /api/chat が存在しないため、
// 失敗したら直接Anthropicを呼ぶ経路に自動でフォールバックする。
async function callHaenukiAPI(payload) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("relative endpoint unavailable");
    return res;
  } catch (e) {
    return fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}

async function extractUserMemory(messages, previousMemory) {
  const transcript = messages
    .map((m) => `${m.role === "user" ? "ユーザー" : "ハエヌキ"}: ${m.content}`)
    .join("\n");
  const prompt = previousMemory
    ? `【これまでのメモ】\n${previousMemory}\n\n【今回の会話ログ】\n${transcript}\n\n上記を踏まえて、ユーザーについてのメモを更新し、今回の会話の傾向を分類してください。`
    : `【会話ログ】\n${transcript}\n\nユーザーについてのメモを作成し、今回の会話の傾向を分類してください。`;

  const response = await callHaenukiAPI({
    model: CHAT_MODEL,
    max_tokens: 1000,
    system: MEMORY_EXTRACTION_SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });
  const data = await response.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  const raw = textBlock ? textBlock.text.trim() : "";
  try {
    const cleaned = raw.replace(/^```json\s*|\s*```$/g, "");
    const parsed = JSON.parse(cleaned);
    const tendency = TENDENCY_INFO[parsed.tendency] ? parsed.tendency : null;
    return { memory: parsed.memory || previousMemory || "", tendency };
  } catch (e) {
    return { memory: previousMemory || "", tendency: null };
  }
}

function stageForTurn(turnCount) {
  if (turnCount >= 80) return "bloom";
  if (turnCount >= 35) return "bud";
  if (turnCount >= 8) return "sprout";
  return "seed";
}

const UPROOT_READY_TURN = 160;

const DAILY_LIMIT = 40;

function getTodayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getDailyUsage() {
  try {
    const raw = localStorage.getItem("haenuki-daily-usage-v1");
    if (!raw) return { date: getTodayDateStr(), count: 0 };
    const parsed = JSON.parse(raw);
    if (parsed.date !== getTodayDateStr()) return { date: getTodayDateStr(), count: 0 };
    return parsed;
  } catch (e) {
    return { date: getTodayDateStr(), count: 0 };
  }
}

function incrementDailyUsage() {
  const usage = getDailyUsage();
  const updated = { date: usage.date, count: usage.count + 1 };
  try {
    localStorage.setItem("haenuki-daily-usage-v1", JSON.stringify(updated));
  } catch (e) {
    // 保存できなくても会話自体は継続
  }
  return updated;
}

const UPROOT_SYSTEM = `あなたは「ハエヌキ」というキャラクターです。今、これまで一緒に過ごしてきたユーザーとお別れするタイミングです。
以下のルールで、2つの短い文章を生成してください。

【farewell】
- 普段はひねくれた毒舌口調だが、この最後の瞬間だけは素直に感謝を伝える(ただし完全にキャラを崩さず、多少の照れ隠しは残す)
- 2〜4文程度
- 会話の中でユーザーについて分かったことがあれば、それに軽く触れてもよい

【digest】
- ハエヌキ視点ではなく、地の文で、ユーザーとの会話を振り返る短いダイジェスト(2〜3文)
- どんな話し方が多かったか(相談/雑談/素っ気ない/深い話)に軽く触れてもよい

出力は以下のJSON形式のみ。前置きや説明文、コードブロック記号は一切書かない。
{"farewell": "...", "digest": "..."}`;

async function generateFarewell(messages, finalTypeInfo, userMemory) {
  const transcript = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => `${m.role === "user" ? "ユーザー" : "ハエヌキ"}: ${m.content}`)
    .join("\n");
  const prompt = `【会話ログ】\n${transcript}\n\n【最終的な姿】\n${finalTypeInfo ? finalTypeInfo.label : "不明"}\n\n【ユーザーについて分かっていること】\n${userMemory || "特になし"}\n\n上記を踏まえて、farewellとdigestを生成してください。`;

  const response = await callHaenukiAPI({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: UPROOT_SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });
  const data = await response.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  const raw = textBlock ? textBlock.text.trim() : "";
  try {
    const cleaned = raw.replace(/^```json\s*|\s*```$/g, "");
    const parsed = JSON.parse(cleaned);
    return {
      farewell: parsed.farewell || "……世話になったな。",
      digest: parsed.digest || "",
    };
  } catch (e) {
    return { farewell: "……世話になったな。", digest: "" };
  }
}

export default function HaenukiPrototype() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [userMemory, setUserMemory] = useState("");
  const [tendencyCounts, setTendencyCounts] = useState({
    soudan: 0,
    zatsudan: 0,
    sokkenai: 0,
    fukai: 0,
  });
  const [loadedFromSave, setLoadedFromSave] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [generation, setGeneration] = useState(1);
  const [inheritedTrait, setInheritedTrait] = useState(null);
  const [confirmUproot, setConfirmUproot] = useState(false);
  const [uprootLoading, setUprootLoading] = useState(false);
  const [endingData, setEndingData] = useState(null);
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFadeOut, setSplashFadeOut] = useState(false);
  const scrollRef = useRef(null);
  const prevStageRef = useRef(null);

  const stageKey = stageForTurn(turnCount);
  const stageInfo = STAGES.find((s) => s.key === stageKey);
  const finalTypeKey = determineFinalType(tendencyCounts);
  const finalTypeInfo = finalTypeKey ? TENDENCY_INFO[finalTypeKey] : null;
  const canUproot = stageKey === "bloom" && turnCount >= UPROOT_READY_TURN;

  // スプラッシュ画面: 表示→フェードアウト→非表示
  useEffect(() => {
    const t1 = setTimeout(() => setSplashFadeOut(true), 1400);
    const t2 = setTimeout(() => setSplashVisible(false), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // 起動時にセーブデータを読み込む
  useEffect(() => {
    try {
      const raw = localStorage.getItem("haenuki-state-v1");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.messages) setMessages(saved.messages);
        if (typeof saved.turnCount === "number") setTurnCount(saved.turnCount);
        if (saved.userMemory) setUserMemory(saved.userMemory);
        if (saved.tendencyCounts) setTendencyCounts(saved.tendencyCounts);
        if (typeof saved.generation === "number") setGeneration(saved.generation);
        if (saved.inheritedTrait) setInheritedTrait(saved.inheritedTrait);
      }
    } catch (e) {
      // 保存データがない、または壊れている場合はそのまま何も出さない
    } finally {
      setLoadedFromSave(true);
    }
    setDailyCount(getDailyUsage().count);
  }, []);

  // 状態が変わるたびに保存(初回ロード完了後のみ)
  useEffect(() => {
    if (!loadedFromSave) return;
    try {
      localStorage.setItem(
        "haenuki-state-v1",
        JSON.stringify({
          messages,
          turnCount,
          userMemory,
          tendencyCounts,
          generation,
          inheritedTrait,
        })
      );
    } catch (e) {
      // 保存失敗時は静かに諦める(会話自体は継続できる)
    }
  }, [messages, turnCount, userMemory, tendencyCounts, generation, inheritedTrait, loadedFromSave]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // 成長段階が変わったら、チャットに「おや…？」演出を挿入する
  useEffect(() => {
    if (!loadedFromSave) return;
    if (prevStageRef.current !== null && prevStageRef.current !== stageKey) {
      setMessages((prev) => [
        ...prev,
        { role: "event", content: `おや…？ハエヌキが${stageInfo.label}に生長したようだ…` },
      ]);
    }
    prevStageRef.current = stageKey;
  }, [stageKey, loadedFromSave, stageInfo.label]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const usage = getDailyUsage();
    if (usage.count >= DAILY_LIMIT) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "event", content: "今日はもう十分話しただろ。また明日な。" },
      ]);
      setInput("");
      return;
    }

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await callHaenukiAPI({
        model: CHAT_MODEL,
        max_tokens: 1000,
        system: buildSystemPrompt(stageKey, turnCount, userMemory, finalTypeInfo, inheritedTrait),
        messages: newMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content })),
      });
      const data = await response.json();
      const textBlock = (data.content || []).find((b) => b.type === "text");
      const reply = textBlock ? textBlock.text : "……(何も言わない)";
      const updatedMessages = [
        ...newMessages,
        { role: "assistant", content: reply },
      ];
      setMessages(updatedMessages);
      const nextTurnCount = turnCount + 1;
      setTurnCount(nextTurnCount);
      setDailyCount(incrementDailyUsage().count);

      // 5回に1回、ユーザーについてのメモと会話傾向を更新する
      if (nextTurnCount % 5 === 0) {
        try {
          const recentSlice = updatedMessages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .slice(-10);
          const result = await extractUserMemory(recentSlice, userMemory);
          setUserMemory(result.memory);
          if (result.tendency) {
            setTendencyCounts((prev) => ({
              ...prev,
              [result.tendency]: prev[result.tendency] + 1,
            }));
          }
        } catch (e) {
          // メモ更新に失敗しても会話自体は継続
        }
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "……(土の中で何かがつぶやいたが、聞き取れなかった)" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleUproot() {
    if (!confirmUproot) {
      setConfirmUproot(true);
      setTimeout(() => setConfirmUproot(false), 4000);
      return;
    }
    setConfirmUproot(false);
    setUprootLoading(true);
    try {
      const result = await generateFarewell(messages, finalTypeInfo, userMemory);
      setEndingData(result);
    } catch (e) {
      setEndingData({ farewell: "……世話になったな。", digest: "" });
    } finally {
      setUprootLoading(false);
    }
  }

  function plantNewSeed() {
    setInheritedTrait(finalTypeKey);
    setGeneration((g) => g + 1);
    setMessages([]);
    setTurnCount(0);
    setTendencyCounts({ soudan: 0, zatsudan: 0, sokkenai: 0, fukai: 0 });
    setEndingData(null);
    prevStageRef.current = null;
  }

  const isComposingRef = useRef(false);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !isComposingRef.current) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (splashVisible) {
    return (
      <div
        style={{
          height: "100vh",
          background: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: splashFadeOut ? 0 : 1,
          transition: "opacity 0.6s ease",
        }}
      >
        <img
          src="/logo.png"
          alt="N.GAO Labs Inc."
          style={{ maxWidth: "70%", maxHeight: "40%" }}
        />
      </div>
    );
  }

  if (endingData) {
    return (
      <div
        style={{
          height: "100vh",
          background: "linear-gradient(180deg, #2B2318 0%, #1E1912 100%)",
          color: "#EDE6D6",
          fontFamily: "'Zen Kaku Gothic New', 'Hiragino Sans', 'Noto Sans JP', sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@600;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap');
        `}</style>
        <div style={{ marginBottom: 16 }}>
          <HaenukiFace stageKey="bloom" finalTypeKey={finalTypeKey} talking={false} />
        </div>
        <div
          style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: 18,
            fontWeight: 800,
            marginBottom: 16,
            color: "#C08A3E",
          }}
        >
          {finalTypeInfo ? finalTypeInfo.label : "ハエヌキ"}が抜かれた
        </div>
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.9,
            maxWidth: 340,
            marginBottom: 20,
            whiteSpace: "pre-wrap",
          }}
        >
          {endingData.farewell}
        </div>
        {endingData.digest && (
          <div
            style={{
              fontSize: 12,
              lineHeight: 1.8,
              color: "#A99B7E",
              maxWidth: 320,
              marginBottom: 28,
              padding: "10px 14px",
              border: "1px solid #4A4030",
              borderRadius: 8,
              background: "#22201388",
              whiteSpace: "pre-wrap",
            }}
          >
            {endingData.digest}
          </div>
        )}
        <button
          onClick={plantNewSeed}
          style={{
            padding: "10px 22px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            border: "1px solid #C08A3E",
            background: "#C08A3E",
            color: "#1E1912",
            cursor: "pointer",
          }}
        >
          新しい種を植える({generation + 1}代目へ)
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(180deg, #2B2318 0%, #1E1912 100%)",
        color: "#EDE6D6",
        fontFamily:
          "'Zen Kaku Gothic New', 'Hiragino Sans', 'Noto Sans JP', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 12px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@600;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #C08A3E55; }
        @keyframes haenukiSwayBase {
          0% { transform: rotate(-1.2deg); }
          100% { transform: rotate(1.2deg); }
        }
        @keyframes haenukiSwayHead {
          0% { transform: rotate(4deg); }
          100% { transform: rotate(-4deg); }
        }
        .haenuki-sway-base {
          animation: haenukiSwayBase 2.8s ease-in-out infinite alternate;
          transform-origin: 50% 100%;
          transform-box: fill-box;
        }
        .haenuki-sway-head {
          animation: haenukiSwayHead 2.1s ease-in-out infinite alternate;
          transform-origin: 50% 100%;
          transform-box: fill-box;
        }
        @keyframes haenukiTalk {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.35); }
        }
        .haenuki-talk {
          animation: haenukiTalk 0.35s ease-in-out infinite;
          transform-origin: 50% 50%;
          transform-box: fill-box;
        }
        @keyframes haenukiUprootPulse {
          0%, 100% { box-shadow: 0 0 0 0 #C08A3E88; }
          50% { box-shadow: 0 0 0 6px #C08A3E00; }
        }
        .haenuki-uproot-pulse {
          animation: haenukiUprootPulse 1.6s ease-in-out infinite;
        }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 480,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 6, flexShrink: 0, position: "relative" }}>
          <div
            style={{
              fontFamily: "'Shippori Mincho', serif",
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: "0.08em",
              color: "#EDE6D6",
            }}
          >
            ハエヌキ
          </div>
          <div style={{ fontSize: 11, color: "#A99B7E", marginTop: 2, letterSpacing: "0.05em" }}>
            {generation}代目{userMemory ? "・記憶あり" : ""}・本日{dailyCount}/{DAILY_LIMIT}
          </div>
          <button
            onClick={() => setConfirmReset(true)}
            style={{
              position: "absolute",
              right: 0,
              top: 2,
              background: "transparent",
              border: "1px solid #4A4030",
              borderRadius: 6,
              color: "#8A7A5C",
              fontSize: 10,
              padding: "3px 8px",
              cursor: "pointer",
            }}
          >
            リセット
          </button>
        </div>

        {confirmReset && (
          <div
            style={{
              flexShrink: 0,
              marginBottom: 8,
              padding: "10px 12px",
              border: "1px solid #C0523E",
              borderRadius: 8,
              background: "#C0523E22",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 12, color: "#EDE6D6", marginBottom: 8, lineHeight: 1.5 }}>
              会話履歴だけでなく、育成状況(成長段階・記憶・世代)もすべて消え、1代目からやり直しになります。よろしいでしょうか？
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setConfirmReset(false)}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  borderRadius: 6,
                  fontSize: 12,
                  border: "1px solid #4A4030",
                  background: "transparent",
                  color: "#8A7A5C",
                  cursor: "pointer",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem("haenuki-state-v1");
                  } catch (e) {}
                  setMessages([]);
                  setTurnCount(0);
                  setUserMemory("");
                  setTendencyCounts({ soudan: 0, zatsudan: 0, sokkenai: 0, fukai: 0 });
                  setGeneration(1);
                  setInheritedTrait(null);
                  prevStageRef.current = null;
                  setConfirmReset(false);
                }}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "1px solid #C0523E",
                  background: "#C0523E",
                  color: "#EDE6D6",
                  cursor: "pointer",
                }}
              >
                リセットする
              </button>
            </div>
          </div>
        )}

        {/* visual: 中央に単独表示、ゆらゆら揺れる */}
        <div style={{ textAlign: "center", marginBottom: 8, flexShrink: 0 }}>
          <HaenukiFace stageKey={stageKey} finalTypeKey={finalTypeKey} talking={loading} />
        </div>

        {/* stage indicator + model toggle をまとめて省スペースに */}
        <div style={{ flexShrink: 0, marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
            {STAGES.map((s) => {
              const active = s.key === stageKey;
              return (
                <div
                  key={s.key}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "4px 1px",
                    borderRadius: 5,
                    fontSize: 10,
                    border: active ? "1px solid #C08A3E" : "1px solid #4A4030",
                    background: active ? "#3C4A3255" : "transparent",
                    color: active ? "#EDE6D6" : "#7A6E56",
                  }}
                >
                  {s.label}
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", fontSize: 10, color: "#8A7A5C", marginBottom: 5 }}>
            {stageInfo.desc}(会話 {turnCount} 回)
          </div>

          {stageKey === "bloom" && finalTypeInfo && (
            <div
              style={{
                textAlign: "center",
                fontSize: 11,
                color: "#C08A3E",
                marginBottom: 5,
                padding: "4px 8px",
                border: "1px solid #4A4030",
                borderRadius: 6,
                background: "#3C4A3222",
              }}
            >
              咲いた姿:{finalTypeInfo.label}
            </div>
          )}

          {canUproot && (
            <button
              onClick={handleUproot}
              disabled={uprootLoading}
              className={confirmUproot || uprootLoading ? "" : "haenuki-uproot-pulse"}
              style={{
                width: "100%",
                marginBottom: 5,
                padding: "9px 8px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.02em",
                border: confirmUproot ? "1px solid #E0B25A" : "1px solid #C08A3E",
                background: confirmUproot ? "#E0B25A" : "#C08A3E",
                color: "#1E1912",
                cursor: uprootLoading ? "default" : "pointer",
                boxShadow: confirmUproot ? "0 0 0 3px #C08A3E44" : "0 2px 8px #C08A3E55",
              }}
            >
              {uprootLoading ? "……" : confirmUproot ? "✦ 本当に抜く？ ✦" : "✦ そろそろ抜いてくれ、と言っている ✦"}
            </button>
          )}
        </div>

        {/* chat window */}
        <div
          ref={scrollRef}
          style={{
            background: "#221C13",
            border: "1px solid #4A4030",
            borderRadius: 10,
            padding: 14,
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {messages.length === 0 && (
            <div style={{ color: "#6B6047", fontSize: 13, textAlign: "center", marginTop: 40 }}>
              土の中から、何かの気配がする……
              <br />
              話しかけてみよう。
            </div>
          )}
          {messages.map((m, i) =>
            m.role === "event" ? (
              <div
                key={i}
                style={{
                  alignSelf: "center",
                  textAlign: "center",
                  color: "#C08A3E",
                  fontSize: 12,
                  fontStyle: "italic",
                  padding: "4px 10px",
                  margin: "4px 0",
                }}
              >
                ✦ {m.content} ✦
              </div>
            ) : (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                  background: m.role === "user" ? "#3C4A32" : "#332A1C",
                  border: m.role === "user" ? "1px solid #52633f" : "1px solid #4A4030",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            )
          )}
          {loading && (
            <div
              style={{
                alignSelf: "flex-start",
                color: "#8A7A5C",
                fontSize: 13,
                fontStyle: "italic",
              }}
            >
              ……(何か考えている)
            </div>
          )}
        </div>

        {/* input */}
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexShrink: 0 }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => (isComposingRef.current = true)}
            onCompositionEnd={() => (isComposingRef.current = false)}
            placeholder="話しかけてみる……"
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              background: "#221C13",
              border: "1px solid #4A4030",
              borderRadius: 8,
              color: "#EDE6D6",
              padding: "10px 12px",
              fontSize: 14,
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? "#4A4030" : "#C08A3E",
              color: "#1E1912",
              border: "none",
              borderRadius: 8,
              padding: "0 18px",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading || !input.trim() ? "default" : "pointer",
            }}
          >
            送る
          </button>
        </div>
      </div>
    </div>
  );
              }
