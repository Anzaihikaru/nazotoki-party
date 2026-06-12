/* ============================================================
 *  謎解きパーティー  -  puzzles.js
 *  v0.5.0 (2026-06-13)
 *    : 新作謎30問追加（隠し言葉・曜日暗号・反対語暗号・ローマ字逆読み・ひっかけ等）
 *  v0.4.0 (2026-05-21)
 *    : ストーリーを難易度別に刷新（ノーマル4話・ハード5話）
 *  v0.3.0 (2026-05-20)
 *    : 視覚謎を30問追加 / 答えを表示・更新通知・おひとり様モード対応
 *  v0.2.0 (2026-05-20)
 *    : 謎を全面リニューアル
 * ============================================================ */
(function () {
  window.APP_VERSION = "0.5.0";

  // 今回のバージョンで「何が変わったか」を、初回起動時に通知する。
  window.APP_CHANGELOG = {
    version: "0.5.0",
    title: "v0.5.0 アップデート",
    points: [
      "🧩 新作の謎が30問仲間入り！（各難易度に10問ずつ）",
      "🌱 イージー：隠し言葉・逆さ読み・影絵 など",
      "🌿 ノーマル：曜日暗号・反対語暗号・マッチ棒 など",
      "🌌 ハード：ローマ字逆読み暗号・論理パズル・カレンダー算数 など",
    ],
  };

  // ============================================================
  //  ENDLESS  - 難易度別のひたすら謎解きプール
  // ============================================================
  const ENDLESS = {

    // ---------- EASY ----------
    easy: [
      {
        type: "なぞなぞ",
        q: "ある家電製品を買ったら、家に「女の子（じょし）」がついてくるそうです。\nさて、その家電製品とは？",
        hint: "「じょし」が「つき」ます…つまり、「じょしつき」。",
        a: ["除湿機", "じょしつき", "じょしっき", "ジョシツキ"],
      },
      {
        type: "なぞなぞ",
        q: "学校にナポレオンが現れた！\n彼が立っているのは、学校のどこ？",
        hint: "ナポレオンといえば…？\n強い君主の称号と同じ読みの場所。",
        a: ["校庭", "こうてい", "コウテイ"],
      },
      {
        type: "なぞなぞ",
        q: "お肉屋さんで「牛ロース」「豚ロース」「馬ロース」のどれを買うか迷っている人がいます。\nさて、それは誰？",
        hint: "「3択（さんたく）ロース」を縮めて読むと…？",
        a: ["サンタクロース", "さんたくろーす", "santaclaus", "santa"],
      },
      {
        type: "なぞなぞ",
        q: "食べれば食べるほど増えていくもの、なーんだ？",
        hint: "ダイエットの大敵…",
        a: ["体重", "たいじゅう", "タイジュウ"],
      },
      {
        type: "なぞなぞ",
        q: "パンはパンでも、食べられないパンってなーんだ？",
        hint: "キッチンで毎日使ってるよ。",
        a: ["フライパン", "ふらいぱん", "fryingpan", "fly pan"],
      },
      {
        type: "ひらめき",
        q: "次の中で、仲間はずれはどれ？",
        choices: ["りんご", "ばなな", "にんじん", "もも"],
        hint: "3つは果物だね。",
        a: ["にんじん"],
      },
      {
        type: "🎨 イラスト謎",
        q: "下のイラストを言葉にして、それぞれの【1文字目】を順番に読むと、春に咲くお花の名前になります！",
        html: `<div class="emoji-grid">
          <div class="emoji-item">
            <div class="emoji-big">🐟</div>
            <div class="emoji-arrow">↓</div>
            <div class="emoji-label"><span class="pick">？</span>かな</div>
          </div>
          <div class="emoji-item">
            <div class="emoji-big">🚗</div>
            <div class="emoji-arrow">↓</div>
            <div class="emoji-label"><span class="pick">？</span>るま</div>
          </div>
          <div class="emoji-item">
            <div class="emoji-big">🐪</div>
            <div class="emoji-arrow">↓</div>
            <div class="emoji-label"><span class="pick">？</span>くだ</div>
          </div>
        </div>`,
        hint: "さかな・くるま・らくだ の1文字目をつなげると…",
        a: ["さくら", "サクラ", "桜"],
      },

      // === ↓↓↓ v0.3.0 追加：視覚パズル群 ↓↓↓ ===
      {
        type: "🔄 視点変更",
        q: "目の前のテーブルに、紙が置かれています。\nあなたから見ると数字の「9」。\nテーブルの向かいに座る友だちには、これは何の数字に見える？",
        html: `<div class="big-display">9</div>`,
        hint: "紙を180°回転させてみよう。",
        a: ["6", "６", "ろく"],
      },
      {
        type: "🌑 影絵",
        q: "下の影は、ある動物のシルエットです。\nさて、何の動物？",
        html: `<div class="silhouette">
          <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
            <path d="M30,100 Q25,55 70,45 Q85,20 115,30 Q160,30 170,70 Q175,90 165,105 L160,120 L150,120 L150,110 L120,110 L120,120 L110,120 L110,108 Q95,112 80,108 L80,120 L70,120 L70,108 Q55,105 50,118 Q45,128 35,125 Q25,118 25,108 Q20,100 30,100 Z M55,75 Q60,40 30,30 Q40,55 50,70 Z" fill="#1a1530" stroke="#fbcf67" stroke-width="2"/>
            <circle cx="155" cy="60" r="3" fill="#fbcf67"/>
          </svg>
        </div>`,
        hint: "長い鼻と大きな耳。陸上で一番大きい動物。",
        a: ["象", "ぞう", "ゾウ", "elephant"],
      },
      {
        type: "🔺 図形数え",
        q: "下の図の中に「三角形」は全部でいくつある？\n（大きさを問わず、三角形になっている部分すべて）",
        html: `<div class="shape-count">
          <svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg">
            <polygon points="100,20 20,160 180,160" fill="none" stroke="#fbcf67" stroke-width="3"/>
            <line x1="100" y1="20" x2="100" y2="160" stroke="#fbcf67" stroke-width="3"/>
          </svg>
        </div>`,
        hint: "大きな三角1つ＋分かれた小さな三角は…？",
        a: ["3", "３", "三", "さん"],
      },
      {
        type: "👁 錯視",
        q: "下の図、真ん中の青い丸は左と右どちらが大きい？",
        html: `<div class="illusion">
          <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
            <!-- 左：小さい円に囲まれた青円 -->
            <g>
              <circle cx="80" cy="90" r="25" fill="#7a5cff"/>
              <circle cx="80" cy="40" r="12" fill="none" stroke="#aaa" stroke-width="2"/>
              <circle cx="80" cy="140" r="12" fill="none" stroke="#aaa" stroke-width="2"/>
              <circle cx="30" cy="90" r="12" fill="none" stroke="#aaa" stroke-width="2"/>
              <circle cx="130" cy="90" r="12" fill="none" stroke="#aaa" stroke-width="2"/>
              <circle cx="45" cy="55" r="12" fill="none" stroke="#aaa" stroke-width="2"/>
              <circle cx="115" cy="55" r="12" fill="none" stroke="#aaa" stroke-width="2"/>
              <circle cx="45" cy="125" r="12" fill="none" stroke="#aaa" stroke-width="2"/>
              <circle cx="115" cy="125" r="12" fill="none" stroke="#aaa" stroke-width="2"/>
            </g>
            <!-- 右：大きい円に囲まれた同サイズの青円 -->
            <g>
              <circle cx="240" cy="90" r="25" fill="#7a5cff"/>
              <circle cx="240" cy="25" r="32" fill="none" stroke="#aaa" stroke-width="2"/>
              <circle cx="240" cy="155" r="32" fill="none" stroke="#aaa" stroke-width="2"/>
              <circle cx="175" cy="90" r="32" fill="none" stroke="#aaa" stroke-width="2"/>
              <circle cx="305" cy="90" r="32" fill="none" stroke="#aaa" stroke-width="2"/>
            </g>
          </svg>
        </div>`,
        choices: ["左が大きい", "右が大きい", "同じ大きさ"],
        hint: "周りの円の大きさに目が惑わされる…定規を当てるつもりで見比べて。",
        a: ["同じ大きさ", "同じ"],
      },
      {
        type: "🔵 規則性",
        q: "下の図形の並び。？に入る図形は？",
        html: `<div class="shape-row">
          <svg viewBox="0 0 360 60" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#fbcf67" stroke-width="3">
              <circle cx="25" cy="30" r="18"/>
              <polygon points="75,12 95,48 55,48"/>
              <rect x="115" y="12" width="36" height="36"/>
              <circle cx="195" cy="30" r="18"/>
              <polygon points="245,12 265,48 225,48"/>
              <rect x="285" y="12" width="36" height="36"/>
            </g>
            <text x="345" y="40" fill="#fbcf67" font-size="28" font-weight="700" text-anchor="middle">？</text>
          </svg>
        </div>`,
        choices: ["○", "△", "□"],
        hint: "3つで1セット繰り返している。次は何番目？",
        a: ["○", "丸", "まる", "circle"],
      },
      {
        type: "🎨 イラスト謎",
        q: "下の絵が表す「ことわざ」は？",
        html: `<div class="illust-words">
          <div class="iw-item"><div class="iw-emoji">🐈</div><div class="iw-cap">ねこ</div></div>
          <div class="iw-plus">＋</div>
          <div class="iw-item"><div class="iw-emoji">🪙</div><div class="iw-cap">こばん</div></div>
        </div>`,
        hint: "値打ちが分からない相手に、貴重なものをあげても…",
        a: ["猫に小判", "ねこにこばん", "ネコニコバン"],
      },
      {
        type: "📚 重なり",
        q: "下の図、○・△・□の3つが部分的に重なっています。\n一番「下」にある形は、どれ？",
        html: `<div class="stack-shapes">
          <svg viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="50" width="100" height="90" fill="#7a5cff" opacity="0.95"/>
            <polygon points="120,30 180,130 60,130" fill="#fbcf67" opacity="0.95"/>
            <circle cx="150" cy="70" r="40" fill="#ff6db5" opacity="0.95"/>
          </svg>
        </div>`,
        choices: ["○（ピンクの丸）", "△（黄の三角）", "□（紫の四角）"],
        hint: "一番奥にあって、他の2つに隠されてる形を探そう。",
        a: ["□（紫の四角）", "□", "四角", "しかく", "紫"],
      },
      {
        type: "⭕ 数えよう",
        q: "下の絵に「円」は全部でいくつ描かれている？\n（大きさを問わず、丸い線で囲まれた円すべて）",
        html: `<div class="shape-count">
          <svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#fbcf67" stroke-width="3">
              <circle cx="70" cy="80" r="55"/>
              <circle cx="70" cy="80" r="35"/>
              <circle cx="70" cy="80" r="15"/>
              <circle cx="170" cy="50" r="28"/>
              <circle cx="190" cy="110" r="28"/>
            </g>
          </svg>
        </div>`,
        hint: "左に同心円（入れ子）が3つ、右に2つ。",
        a: ["5", "５", "五", "ご"],
      },
      {
        type: "🔄 視点変更",
        q: "下の矢印の並び。？に入る向きはどれ？",
        html: `<div class="shape-row">
          <svg viewBox="0 0 360 70" xmlns="http://www.w3.org/2000/svg">
            <g font-size="36" font-weight="800" fill="#fbcf67" text-anchor="middle">
              <text x="35" y="48">▲</text>
              <text x="95" y="48">▶</text>
              <text x="155" y="48">▼</text>
              <text x="215" y="48">◀</text>
              <text x="275" y="48">▲</text>
              <text x="335" y="48">？</text>
            </g>
          </svg>
        </div>`,
        choices: ["▲（上）", "▶（右）", "▼（下）", "◀（左）"],
        hint: "矢印が時計回りに90°ずつ回っているよ。",
        a: ["▶（右）", "▶", "右", "みぎ"],
      },
      {
        type: "🌑 影絵",
        q: "下のシルエットは、ある楽器です。何の楽器？",
        html: `<div class="silhouette">
          <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M75,8 L85,8 L85,90 Q125,95 132,145 Q132,185 80,190 Q28,185 28,145 Q35,95 75,90 Z" fill="#1a1530" stroke="#fbcf67" stroke-width="2"/>
            <circle cx="80" cy="150" r="12" fill="#fbcf67"/>
            <line x1="76" y1="12" x2="76" y2="185" stroke="#fbcf67" stroke-width="0.6"/>
            <line x1="80" y1="12" x2="80" y2="185" stroke="#fbcf67" stroke-width="0.6"/>
            <line x1="84" y1="12" x2="84" y2="185" stroke="#fbcf67" stroke-width="0.6"/>
            <rect x="73" y="8" width="14" height="6" fill="#fbcf67"/>
          </svg>
        </div>`,
        hint: "弦が6本ある、座って演奏することの多い楽器。",
        a: ["ギター", "ぎたー", "guitar"],
      },

      // === ↓↓↓ v0.5.0 追加：新作10問 ↓↓↓ ===
      {
        type: "🎨 イラスト謎",
        q: "下のイラストを言葉にして、それぞれの【1文字目】を順番に読むと、夏に咲くお花の名前になります！",
        html: `<div class="emoji-grid">
          <div class="emoji-item">
            <div class="emoji-big">🐑</div>
            <div class="emoji-arrow">↓</div>
            <div class="emoji-label"><span class="pick">？</span>つじ</div>
          </div>
          <div class="emoji-item">
            <div class="emoji-big">🛏️</div>
            <div class="emoji-arrow">↓</div>
            <div class="emoji-label"><span class="pick">？</span>くら</div>
          </div>
          <div class="emoji-item">
            <div class="emoji-big">🐊</div>
            <div class="emoji-arrow">↓</div>
            <div class="emoji-label"><span class="pick">？</span>に</div>
          </div>
          <div class="emoji-item">
            <div class="emoji-big">🍎</div>
            <div class="emoji-arrow">↓</div>
            <div class="emoji-label"><span class="pick">？</span>んご</div>
          </div>
        </div>`,
        hint: "ひつじ・まくら・わに・りんご の1文字目をつなげると…",
        a: ["ひまわり", "ヒマワリ", "向日葵"],
      },
      {
        type: "なぞなぞ",
        q: "イスはイスでも、冷たくて甘いイスってなーんだ？",
        hint: "夏に食べたくなる、コーンにのったあれ。",
        a: ["アイス", "あいす", "アイスクリーム", "あいすくりーむ", "ice", "icecream"],
      },
      {
        type: "なぞなぞ",
        q: "カメはカメでも、空を飛ぶカメってなーんだ？",
        hint: "海の上を飛んでいる白い鳥だよ。",
        a: ["かもめ", "カモメ", "鴎"],
      },
      {
        type: "ひらめき",
        q: "「くるみ」を反対から読むと出てくる、白い飲み物ってなーんだ？",
        hint: "「く・る・み」を後ろから1文字ずつ読んでみよう。",
        a: ["ミルク", "みるく", "milk", "牛乳"],
      },
      {
        type: "ひらめき",
        q: "次の中で、仲間はずれはどれ？",
        choices: ["ピアノ", "ギター", "たいこ", "サッカー"],
        hint: "3つは楽器だね。",
        a: ["サッカー"],
      },
      {
        type: "なぞなぞ",
        q: "「かばん」の中に、いつも隠れている動物ってなーんだ？",
        hint: "「か・ば・ん」…言葉の中をよーく見て。",
        a: ["かば", "カバ", "河馬"],
      },
      {
        type: "なぞなぞ",
        q: "「せかい（世界）」の真ん中に隠れている虫ってなーんだ？",
        hint: "「せ・か・い」の真ん中の文字は…？\nプ〜ンと飛んでくる虫。",
        a: ["か", "カ", "蚊"],
      },
      {
        type: "🔲 図形数え",
        q: "下の2×2の格子で、できる「正方形」は全部でいくつ？\n（小さいものも大きいものも全部数えてね）",
        html: `<div class="shape-count">
          <svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#fbcf67" stroke-width="3">
              <rect x="20" y="20" width="140" height="140"/>
              <line x1="90" y1="20" x2="90" y2="160"/>
              <line x1="20" y1="90" x2="160" y2="90"/>
            </g>
          </svg>
        </div>`,
        hint: "小さい正方形が4つ。それと、外側の大きな正方形も…",
        a: ["5", "５", "五", "ご"],
      },
      {
        type: "🎵 規則性",
        q: "次の音の並び。？に入るのは？\n【 ド・レ・ミ・ファ・ソ・ラ・？ 】",
        choices: ["シ", "ド", "ファ"],
        hint: "音階を順番に歌ってみよう。ドレミファソラ…",
        a: ["シ", "し"],
      },
      {
        type: "🌑 影絵",
        q: "下の影は、ある動物のシルエットです。\nさて、何の動物？",
        html: `<div class="silhouette">
          <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
            <path d="M70,20 L78,45 Q95,38 112,45 L120,20 L128,52 Q140,68 138,90 Q136,125 95,128 Q54,125 52,90 Q50,68 62,52 Z" fill="#1a1530" stroke="#fbcf67" stroke-width="2"/>
            <path d="M133,112 Q168,124 163,88 Q161,78 153,80" fill="none" stroke="#1a1530" stroke-width="9" stroke-linecap="round"/>
            <circle cx="80" cy="75" r="4" fill="#fbcf67"/>
            <circle cx="110" cy="75" r="4" fill="#fbcf67"/>
          </svg>
        </div>`,
        hint: "「にゃー」と鳴く、ひげの生えたペット。",
        a: ["猫", "ねこ", "ネコ", "cat"],
      },
    ],

    // ---------- NORMAL ----------
    normal: [
      {
        type: "なぞなぞ",
        q: "Mサイズの海女（あま）さんが、1サイズ大きくなったらある生き物に変身した！\nそれって何？",
        hint: "海女（アマ）＋ ある記号 ＝ 雨上がりの森にいる…",
        a: ["アマガエル", "あまがえる", "雨蛙"],
      },
      {
        type: "なぞなぞ",
        q: "魚たちがカーレースをした。\nトップは鯛（たい）選手！しかしライバルがわざとぶつかってきて、負けてしまった。\nぶつかってきた魚は何？",
        hint: "「わざと」を難しい言葉で言うと…？\n同じ読みの魚を探そう。",
        a: ["鯉", "こい", "コイ"],
      },
      {
        type: "なぞなぞ",
        q: "タマちゃんとゴロウくんのお弁当は、運動会でも遠足でも音楽会でも、なぜか毎回同じだった。\nそのお弁当とは？",
        hint: "「3度（さんど）・一致（いっち）」を続けて読むと？",
        a: ["サンドイッチ", "さんどいっち", "sandwich"],
      },
      {
        type: "ひらめき",
        q: "「ラリレロ川」って、どこに流れている川？\n（5文字で答えてね）",
        hint: "ラ行から1文字「足りない」のがポイント。\nその文字を入れると、有名な川の名前に。",
        a: ["ナイル川", "ないるがわ", "ナイルがわ"],
      },
      {
        type: "なぞなぞ",
        q: "腹黒い人が、お正月によく買うものってなーんだ？",
        hint: "「腹（ふく）」＋「黒（ろ）」＝？\nお正月といえば…",
        a: ["福袋", "ふくぶくろ", "フクブクロ"],
      },
      {
        type: "規則性",
        q: "次の数列、？に入る数字は？\n【 1, 1, 2, 3, 5, 8, ? 】",
        hint: "前の2つの数を足してみよう。",
        a: ["13"],
      },
      {
        type: "推理",
        q: "3人のうち1人が犯人。\n  A: 「Bが犯人だ」\n  B: 「Aは嘘つきだ」\n  C: 「私は犯人じゃない」\n\nCは正直者と分かっている。犯人は誰？",
        hint: "Aが犯人だと仮定すると、A・Bの発言は両方とも説明がつく？",
        a: ["A", "a", "Aさん", "えー"],
      },
      {
        type: "ひらめき",
        q: "「日」と「月」をくっつけてできる漢字は何？",
        hint: "光るもの、夜空に出るもの。",
        a: ["明", "あかり", "あきら", "めい"],
      },
      {
        type: "🎨 ありなし謎",
        q: "「ある」側にだけ共通して入っているひらがな、何？\n（1文字で答えてね）",
        html: `<div class="arinashi">
          <div class="arinashi-col aru">
            <div class="arinashi-head">ある</div>
            <ul class="arinashi-list">
              <li>いるか</li>
              <li>くるま</li>
              <li>さくら</li>
              <li>はるか</li>
            </ul>
          </div>
          <div class="arinashi-col nai">
            <div class="arinashi-head">ない</div>
            <ul class="arinashi-list">
              <li>かに</li>
              <li>でんしゃ</li>
              <li>もも</li>
              <li>けいこ</li>
            </ul>
          </div>
        </div>`,
        hint: "ある側の4つの単語をよく見て、共通する1文字を探そう。",
        a: ["る", "ル"],
      },
      {
        type: "🎨 グリッドパズル",
        q: "下のマス目には規則があります。\n？に入る漢字は何？",
        html: `<div class="grid-puzzle">
          <div class="grid-cell">一</div>
          <div class="grid-cell">二</div>
          <div class="grid-cell">三</div>
          <div class="grid-cell">四</div>
          <div class="grid-cell">五</div>
          <div class="grid-cell">六</div>
          <div class="grid-cell">七</div>
          <div class="grid-cell">八</div>
          <div class="grid-cell q">？</div>
        </div>`,
        hint: "1から順に並んでいるよ。最後は…？",
        a: ["九", "きゅう", "9"],
      },

      // === ↓↓↓ v0.3.0 追加：視覚パズル群 ↓↓↓ ===
      {
        type: "🪞 鏡像",
        q: "鏡に映ったアナログ時計が下の絵。\n本当の時刻は、何時何分？\n（例：7:30）",
        html: `<div class="mirror-clock">
          <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
            <circle cx="80" cy="80" r="70" fill="#fff" stroke="#1a1530" stroke-width="3"/>
            <!-- 鏡像の文字盤（数字も鏡映） -->
            <text x="80" y="28" font-size="14" font-weight="700" fill="#1a1530" text-anchor="middle">12</text>
            <text x="32" y="86" font-size="14" font-weight="700" fill="#1a1530" text-anchor="middle">3</text>
            <text x="80" y="148" font-size="14" font-weight="700" fill="#1a1530" text-anchor="middle">6</text>
            <text x="132" y="86" font-size="14" font-weight="700" fill="#1a1530" text-anchor="middle">9</text>
            <!-- 鏡で「4:30」風に見せる：実時刻7:30 -->
            <!-- 短針：実7:30→鏡では「文字盤の4と5の間」(角度およそ225°from-12oclock, 鏡像なので右下方向ではなく…)
                 鏡像時計の規則：実=11:60-鏡 ⇔ 鏡=11:60-実
                 実7:30 → 鏡4:30 → 鏡盤上で短針は「4と5の間」位置
                 鏡像なので「4と5の間」は、ふつうの時計では「7と8の間」の位置（左下）。
                 ここではSVGはふつうの座標で描くが「鏡盤」の数字を左右反転している前提なので、
                 鏡盤の4の方向 = ふつうの座標の右下に4が来る（数字テキストの位置が普通配置になっている）
                 シンプルにするために：盤面はふつうの12,3,6,9。針の位置を「鏡時刻=4:30」相当の位置で描く。
                 → 短針は4と5の間（角度135°from-12o'clock）、長針は6の方向。 -->
            <line x1="80" y1="80" x2="120" y2="115" stroke="#1a1530" stroke-width="6" stroke-linecap="round"/>
            <line x1="80" y1="80" x2="80" y2="135" stroke="#1a1530" stroke-width="4" stroke-linecap="round"/>
            <circle cx="80" cy="80" r="4" fill="#1a1530"/>
            <!-- 「鏡」のアイコン -->
            <text x="8" y="158" font-size="11" fill="#5a527a">↔ 鏡像</text>
          </svg>
        </div>`,
        hint: "鏡像時計の公式：実時刻 = 11時60分 − 鏡時刻。\nこの絵は鏡だと「4:30」に見えるから…",
        a: ["7:30", "7時30分", "7じ30ふん", "7時半"],
      },
      {
        type: "🔲 図形数え",
        q: "下の3×3の格子で、できる「正方形」は全部でいくつ？\n（1×1, 2×2, 3×3 すべての大きさを数えてね）",
        html: `<div class="shape-count">
          <svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#fbcf67" stroke-width="3">
              <rect x="20" y="20" width="140" height="140"/>
              <line x1="66.67" y1="20" x2="66.67" y2="160"/>
              <line x1="113.33" y1="20" x2="113.33" y2="160"/>
              <line x1="20" y1="66.67" x2="160" y2="66.67"/>
              <line x1="20" y1="113.33" x2="160" y2="113.33"/>
            </g>
          </svg>
        </div>`,
        hint: "1×1が9個、2×2が4個、3×3が1個。\n合計は…？",
        a: ["14"],
      },
      {
        type: "👀 視点変更",
        q: "下のアイスクリームコーン（円すい）を、\n「真上から覗き込む」と、どんな形に見える？",
        html: `<div class="silhouette">
          <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="80" cy="40" rx="40" ry="14" fill="#fbcf67"/>
            <path d="M40,40 L80,150 L120,40 Z" fill="#fbcf67" stroke="#fbcf67" stroke-width="2"/>
            <path d="M40,40 L80,150 L120,40" fill="none" stroke="#1a1530" stroke-width="2" opacity="0.4"/>
            <path d="M50,55 L110,55 M55,70 L105,70 M60,85 L100,85" stroke="#1a1530" stroke-width="1.5" opacity="0.4"/>
          </svg>
        </div>`,
        choices: ["○（円）", "△（三角）", "□（四角）", "◇（ひし形）"],
        hint: "コーンを上から覗き込むと、見えるのは口の部分だけ…",
        a: ["○（円）", "○", "円", "丸", "まる"],
      },
      {
        type: "📄 折り紙",
        q: "1枚の紙を「半分に折った」状態で、真ん中にハサミで穴を1つだけあけました。\n紙を広げると、穴は何個ある？",
        html: `<div class="origami">
          <svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
            <g>
              <rect x="20" y="20" width="80" height="100" fill="#fff" stroke="#1a1530" stroke-width="2"/>
              <line x1="20" y1="20" x2="100" y2="20" stroke="#1a1530" stroke-width="4" stroke-dasharray="6 4"/>
              <circle cx="60" cy="70" r="9" fill="#1a1530"/>
              <text x="60" y="135" fill="#fbcf67" font-size="11" text-anchor="middle">折った状態</text>
            </g>
            <text x="140" y="75" fill="#fbcf67" font-size="22" text-anchor="middle">→</text>
            <text x="140" y="92" fill="#fbcf67" font-size="11" text-anchor="middle">開く</text>
            <g>
              <rect x="180" y="20" width="80" height="100" fill="#fff" stroke="#1a1530" stroke-width="2"/>
              <line x1="180" y1="20" x2="260" y2="20" stroke="#1a1530" stroke-width="1" stroke-dasharray="4 4"/>
              <text x="220" y="75" fill="#1a1530" font-size="18" text-anchor="middle">？</text>
              <text x="220" y="135" fill="#fbcf67" font-size="11" text-anchor="middle">開いたら？</text>
            </g>
          </svg>
        </div>`,
        hint: "折ったときは2枚重なってる。ハサミは2枚同時に貫通する。",
        a: ["2", "２", "二", "2個", "2つ"],
      },
      {
        type: "🔢 規則性",
        q: "下のマス目の規則を見つけて、\n？に入る数字を答えてね。",
        html: `<div class="grid-puzzle three">
          <div class="grid-cell">1</div>
          <div class="grid-cell">2</div>
          <div class="grid-cell">3</div>
          <div class="grid-cell">2</div>
          <div class="grid-cell">4</div>
          <div class="grid-cell">6</div>
          <div class="grid-cell">3</div>
          <div class="grid-cell q">？</div>
          <div class="grid-cell">9</div>
        </div>`,
        hint: "各行は左から ×1, ×2, ×3。\n3行目は3で始まるから…",
        a: ["6"],
      },
      {
        type: "🎨 イラスト謎",
        q: "下のイラストが表す「ことわざ」は？",
        html: `<div class="illust-words">
          <div class="iw-item"><div class="iw-emoji">🐴</div><div class="iw-cap">うま</div></div>
          <div class="iw-item"><div class="iw-emoji">👂</div><div class="iw-cap">みみ</div></div>
          <div class="iw-item"><div class="iw-emoji">🙏</div><div class="iw-cap">ねんぶつ</div></div>
        </div>`,
        hint: "いくら忠告しても、まったく聞いてもらえないこと。",
        a: ["馬の耳に念仏", "うまのみみにねんぶつ", "馬耳念仏"],
      },
      {
        type: "⚖ 推理",
        q: "下のシーソーの状態から、A・B・Cを「重い順」に並べると？",
        html: `<div class="seesaws">
          <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
            <!-- シーソー1: A(軽)上 / B(重)下 -->
            <g>
              <line x1="20" y1="70" x2="160" y2="100" stroke="#fbcf67" stroke-width="4"/>
              <polygon points="90,100 80,150 100,150" fill="#fbcf67"/>
              <circle cx="35" cy="60" r="14" fill="#7a5cff"/>
              <text x="35" y="65" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">A</text>
              <circle cx="145" cy="92" r="14" fill="#7a5cff"/>
              <text x="145" y="97" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">B</text>
            </g>
            <!-- シーソー2: B(軽)上 / C(重)下 -->
            <g>
              <line x1="180" y1="70" x2="310" y2="100" stroke="#fbcf67" stroke-width="4"/>
              <polygon points="240,100 230,150 250,150" fill="#fbcf67"/>
              <circle cx="195" cy="60" r="14" fill="#ff6db5"/>
              <text x="195" y="65" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">B</text>
              <circle cx="295" cy="92" r="14" fill="#ff6db5"/>
              <text x="295" y="97" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">C</text>
            </g>
          </svg>
        </div>`,
        choices: ["A > B > C", "C > B > A", "B > A > C", "C > A > B"],
        hint: "シーソーは「重いほうが下」になる。\n左の絵：A<B。 右の絵：B<C。",
        a: ["C > B > A", "C>B>A"],
      },
      {
        type: "👀 視点変更",
        q: "下の立体は「縦に置かれた円柱」。\n「正面（横）」から見ると、どんな形に見える？",
        html: `<div class="silhouette">
          <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="80" cy="40" rx="50" ry="14" fill="#7a5cff"/>
            <rect x="30" y="40" width="100" height="120" fill="#7a5cff"/>
            <ellipse cx="80" cy="160" rx="50" ry="14" fill="#7a5cff"/>
            <ellipse cx="80" cy="160" rx="50" ry="14" fill="none" stroke="#1a1530" stroke-width="2" opacity="0.4"/>
          </svg>
        </div>`,
        choices: ["○（円）", "□（横長の四角）", "□（縦長の四角）", "△（三角）"],
        hint: "上から見たら○。でも横から見ると、円柱の側面は…",
        a: ["□（縦長の四角）", "縦長の四角", "縦長", "長方形"],
      },
      {
        type: "🪞 鏡像",
        q: "鏡に映った英単語が下の絵。\n元の単語は何？（4文字）",
        html: `<div class="mirror-text">
          <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(120, 50) scale(-1, 1)">
              <text x="0" y="0" font-size="48" font-weight="800" fill="#fbcf67" text-anchor="middle" font-family="Arial">TIME</text>
            </g>
            <text x="120" y="78" fill="#5a527a" font-size="11" text-anchor="middle">↔ 鏡に映った状態</text>
          </svg>
        </div>`,
        hint: "左右反転を頭の中で戻すと…",
        a: ["TIME", "time", "Time", "タイム"],
      },
      {
        type: "🪓 マッチ棒",
        q: "下の式は正しくありません。\nマッチ棒（線）を「1本だけ」動かして、正しい等式にしてください。\n移動後の式（=の左辺）を答えてね。\n\n【 5 + 5 + 5 = 550 】",
        html: `<div class="match-equation">5 + 5 + 5 = 550</div>`,
        hint: "「+」の縦線を1本動かして、「+」を「4」に変えてみたら？",
        a: ["545+5", "545 + 5", "545+5=550", "545+5＝550"],
      },

      // === ↓↓↓ v0.5.0 追加：新作10問 ↓↓↓ ===
      {
        type: "🎨 ありなし謎",
        q: "「ある」側には、ある共通の秘密が隠れています。\nでは「くじら」は、「ある」「ない」どっち？",
        html: `<div class="arinashi">
          <div class="arinashi-col aru">
            <div class="arinashi-head">ある</div>
            <ul class="arinashi-list">
              <li>いちご</li>
              <li>にんじん</li>
              <li>さんま</li>
              <li>しかく</li>
            </ul>
          </div>
          <div class="arinashi-col nai">
            <div class="arinashi-head">ない</div>
            <ul class="arinashi-list">
              <li>ばなな</li>
              <li>たまご</li>
              <li>さば</li>
              <li>ほし</li>
            </ul>
          </div>
        </div>`,
        choices: ["ある", "ない"],
        hint: "ある側には数字が隠れているよ。\nいちご→「いち」、にんじん→「に」、さんま→「さん」、しかく→「し」。\nじゃあ「くじら」には…？",
        a: ["ある"],
      },
      {
        type: "🗓 曜日暗号",
        q: "カレンダーの曜日を使った暗号です。\n【 1=日 2=月 3=火 4=水 5=木 6=金 7=土 】\n？に入る言葉は？",
        html: `<div class="story-pair-list">
          <div class="spl-row"><span>3 ・ 1</span><span class="arr">→</span><span>かに</span></div>
          <div class="spl-row"><span>4 ・ 5 ・ 5</span><span class="arr">→</span><span class="num q">？</span></div>
        </div>`,
        hint: "曜日の読みの1文字目。\n火=「か」、日=「に」ち。\nじゃあ 水=？ 木=？",
        a: ["すもも", "スモモ", "李"],
      },
      {
        type: "なぞなぞ",
        q: "「39」── この数字を声に出して読むと、お礼の言葉に聞こえる！\nさて、何と聞こえる？",
        hint: "3=サン、9=キュー。続けて読むと…",
        a: ["サンキュー", "さんきゅー", "さんきゅう", "thankyou", "thank you", "ありがとう"],
      },
      {
        type: "🪓 マッチ棒",
        q: "下の式は正しくありません。\nマッチ棒（線）を「1本だけ」動かして、正しい等式にしてください。\n移動後の式（=の左辺）を答えてね。\n\n【 6 + 4 = 4 】",
        html: `<div class="match-equation">6 + 4 = 4</div>`,
        hint: "「+」の縦線を1本抜いて「−」にする。\n抜いた1本を「6」に足すと、別の数字に変身…！",
        a: ["8-4", "8 - 4", "8−4", "8ー4", "8-4=4", "8−4＝4"],
      },
      {
        type: "🏃 推理",
        q: "かけっこを4人でしました。\n  ・AはBより速かった\n  ・CはAより速かった\n  ・Dはビリだった\n\nさて、2位は誰？",
        hint: "速い順に並べると C → A → B → D。",
        a: ["A", "a", "えー", "Aさん"],
      },
      {
        type: "🎨 イラスト謎",
        q: "下のイラストが表す「ことわざ」は？",
        html: `<div class="illust-words">
          <div class="iw-item"><div class="iw-emoji">🐵</div><div class="iw-cap">さる</div></div>
          <div class="iw-item"><div class="iw-emoji">🌳</div><div class="iw-cap">き</div></div>
          <div class="iw-item"><div class="iw-emoji">⬇️</div><div class="iw-cap">おちる</div></div>
        </div>`,
        hint: "どんな名人でも、ときには失敗するということ。",
        a: ["猿も木から落ちる", "さるもきからおちる", "サルも木から落ちる"],
      },
      {
        type: "🔤 共通文字",
        q: "下の3つの言葉の「□」には、すべて同じひらがなが入ります。\nその1文字は？",
        html: `<div class="story-list">
          <div class="sl-row">ま □ ら</div>
          <div class="sl-row">さ □ ら</div>
          <div class="sl-row">た □ さん</div>
        </div>`,
        hint: "1つ目は寝るときに使うもの。2つ目は春に咲く花。",
        a: ["く", "ク"],
      },
      {
        type: "🙃 逆さ文字",
        q: "下の言葉は、逆さま（180°回転）に書かれています。\n元の言葉は？",
        html: `<div class="mirror-text">
          <svg viewBox="0 0 240 90" xmlns="http://www.w3.org/2000/svg">
            <g transform="rotate(180 120 40)">
              <text x="120" y="55" font-size="44" font-weight="800" fill="#fbcf67" text-anchor="middle">うどん</text>
            </g>
            <text x="120" y="86" fill="#5a527a" font-size="11" text-anchor="middle">↻ 180°回転した状態</text>
          </svg>
        </div>`,
        hint: "つるつるの麺類。きつね？たぬき？",
        a: ["うどん", "ウドン", "udon"],
      },
      {
        type: "🕯 ひっかけ",
        q: "ろうそくが10本、火がついて燃えています。\n風が吹いて、3本だけ火が消えました。\n\n翌朝まで「残っている」ろうそくは何本？",
        hint: "火がついたままのろうそくは、燃え尽きてなくなってしまうよ。",
        a: ["3", "3本", "３", "３本", "三", "さんぼん"],
      },
      {
        type: "🔁 反対語暗号",
        q: "下の3つの言葉を「反対の意味の言葉」に変えて、\nそれぞれの【1文字目】をつなげると、海の生き物が現れる！\nその生き物は？",
        html: `<div class="story-pair-list">
          <div class="spl-row"><span>しろい</span><span class="arr">→</span><span class="num q">？</span></div>
          <div class="spl-row"><span>はで</span><span class="arr">→</span><span class="num q">？</span></div>
          <div class="spl-row"><span>くるしい</span><span class="arr">→</span><span class="num q">？</span></div>
        </div>`,
        hint: "しろい⇔くろい、はで⇔じみ、くるしい⇔らく。\n頭文字をつなげると…",
        a: ["くじら", "クジラ", "鯨"],
      },
    ],

    // ---------- HARD ----------
    hard: [
      {
        type: "なぞなぞ",
        q: "「絶対に返事をしない」と決めている、体の一部はどこ？",
        hint: "「返答 せん」 ＝ 「○○○ せん」。\n喉のあたりにある。",
        a: ["扁桃腺", "へんとうせん", "ヘントウセン"],
      },
      {
        type: "なぞなぞ",
        q: "夜に走っていると、いつのまにか体に張り付いてくるもの、なーんだ？",
        hint: "「晩（ばん）」「走行（そうこう）」を続けて読むと？\nケガしたとき貼るやつ。",
        a: ["絆創膏", "ばんそうこう", "バンソウコウ"],
      },
      {
        type: "なぞなぞ",
        q: "飛行機に乗っている人の中で、いちばんオシャレな人は？",
        hint: "「服装（ふくそう）重視（じゅうし）」を続けて読むと？",
        a: ["副操縦士", "ふくそうじゅうし", "フクソウジュウシ"],
      },
      {
        type: "計算",
        q: "「4」を4つ、＋−×÷を使って24を作るには？\n  4 ? 4 ? 4 ? 4 = 24\n（答えは式を入力。例：4+4+4+4）",
        hint: "4×4 を起点に考えてみよう。",
        a: ["4*4+4+4", "4×4+4+4", "4x4+4+4", "4・4+4+4", "(4*4)+4+4"],
      },
      {
        type: "推理",
        q: "3つの箱A, B, Cのうち、1つだけ宝が入っている。\n  A: 「宝はBの中だ」\n  B: 「宝はここだ」\n  C: 「宝はAの中ではない」\n\nこのうち真実は1つだけ。宝はどの箱？",
        hint: "それぞれの仮定で、真実の数を数えてみよう。",
        a: ["C", "c", "Cの箱", "しー"],
      },
      {
        type: "推理",
        q: "4人のうち、1人だけが正直者。\n  A: 「私は嘘つきだ」\n  B: 「Aは正直者だ」\n  C: 「Bは嘘つきだ」\n  D: 「Cは嘘つきだ」\n\n正直者は誰？",
        hint: "Aの発言「私は嘘つき」は矛盾するので、Aは嘘つき確定。\nB,C,Dを順に判定しよう。",
        a: ["C", "c", "シー"],
      },
      {
        type: "ひらめき",
        q: "遠くに女性が立っている。\n友達に「彼女、何してるの？」と聞いたら、\n「しー、しー、しー」と3回だけ言われた。\n\n彼女は何をしているでしょう？",
        hint: "英語で読んでみよう。\nShe ... ... ...",
        a: ["海を見ている", "うみをみている", "海をみている", "ウミヲミテイル", "海見てる"],
      },
      {
        type: "🎨 数字グリッド",
        q: "下のマス目には、行ごとに共通する規則があります。\n？に入る数字は？",
        html: `<div class="grid-puzzle three">
          <div class="grid-cell">2</div>
          <div class="grid-cell">4</div>
          <div class="grid-cell">8</div>
          <div class="grid-cell">3</div>
          <div class="grid-cell">9</div>
          <div class="grid-cell">27</div>
          <div class="grid-cell">5</div>
          <div class="grid-cell">25</div>
          <div class="grid-cell q">？</div>
        </div>`,
        hint: "各行は、左→中→右で同じ数を掛けているよ。\n  1行目: ×2 ×2\n  2行目: ×3 ×3\n  3行目: ×5 ×5 = ?",
        a: ["125"],
      },

      // === ↓↓↓ v0.3.0 追加：視覚パズル群 ↓↓↓ ===
      {
        type: "🎩 論理",
        q: "A・B・Cが縦一列に並んでいます（A→B→Cの順、Aが先頭）。\n後ろの人は前の人の帽子だけ見える。Aは何も見えない。\n用意された帽子は【黒2個・白3個】の合計5個。その中から3個選んでかぶせた。\n\n  C：「自分の色は分からない」\n  B：「自分の色は分からない」\n  A：「分かった！」\n\nAの帽子の色は？",
        hint: "Cが「分からない」→ A・Bの2人が両方とも黒、ではない。\nそれを聞いたBも「分からない」→ もしAが黒なら、Bは自分が白と即断できたはず。\nつまり、Aの色は…？",
        a: ["白", "しろ", "シロ", "白色"],
      },
      {
        type: "🔺 図形数え",
        q: "下の「五芒星（星マーク）」の中に、三角形は全部でいくつある？",
        html: `<div class="shape-count">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <polygon points="100,15 121,75 185,75 134,113 152,175 100,138 48,175 66,113 15,75 79,75" fill="none" stroke="#fbcf67" stroke-width="3"/>
          </svg>
        </div>`,
        hint: "外側に飛び出した小さい三角が5つ。\nそれと、星を構成する大きな三角形も…",
        a: ["10"],
      },
      {
        type: "🪞 鏡像",
        q: "鏡に映ったアナログ時計が下の絵。\n本当の時刻は、何時何分？\n（時計の文字盤は普通のものです）",
        html: `<div class="mirror-clock">
          <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
            <circle cx="80" cy="80" r="70" fill="#fff" stroke="#1a1530" stroke-width="3"/>
            <text x="80" y="28" font-size="14" font-weight="700" fill="#1a1530" text-anchor="middle">12</text>
            <text x="32" y="86" font-size="14" font-weight="700" fill="#1a1530" text-anchor="middle">3</text>
            <text x="80" y="148" font-size="14" font-weight="700" fill="#1a1530" text-anchor="middle">6</text>
            <text x="132" y="86" font-size="14" font-weight="700" fill="#1a1530" text-anchor="middle">9</text>
            <!-- 鏡で 3:40 風 → 実 8:20 -->
            <!-- 鏡像での短針：3と4の間（角度~110度from-12oclock） → 右下 -->
            <line x1="80" y1="80" x2="120" y2="100" stroke="#1a1530" stroke-width="6" stroke-linecap="round"/>
            <!-- 鏡像での長針：8の位置(40分) -->
            <line x1="80" y1="80" x2="40" y2="135" stroke="#1a1530" stroke-width="4" stroke-linecap="round"/>
            <circle cx="80" cy="80" r="4" fill="#1a1530"/>
            <text x="8" y="158" font-size="11" fill="#5a527a">↔ 鏡像</text>
          </svg>
        </div>`,
        hint: "鏡時計の公式：実時刻 = 11時60分 − 鏡時刻。\nこの絵は鏡では「3:40」付近に見える。\n11:60 − 3:40 = ？",
        a: ["8:20", "8時20分", "8じ20ふん"],
      },
      {
        type: "🎲 立体",
        q: "下の展開図を組み立てると、サイコロになります。\n完成したとき「1」の真向かいの面に来るのは、いくつ？",
        html: `<div class="dice-net">
          <svg viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg">
            <g fill="#fff" stroke="#1a1530" stroke-width="2">
              <rect x="75" y="10" width="50" height="50"/>
              <rect x="75" y="60" width="50" height="50"/>
              <rect x="25" y="110" width="50" height="50"/>
              <rect x="75" y="110" width="50" height="50"/>
              <rect x="125" y="110" width="50" height="50"/>
              <rect x="75" y="160" width="50" height="50"/>
            </g>
            <g fill="#1a1530" font-size="22" font-weight="800" text-anchor="middle" font-family="Arial">
              <text x="100" y="42">1</text>
              <text x="100" y="92">2</text>
              <text x="50" y="142">3</text>
              <text x="100" y="142">5</text>
              <text x="150" y="142">4</text>
              <text x="100" y="192">6</text>
            </g>
          </svg>
        </div>`,
        hint: "サイコロは「向かい合う面の和が7」になるのが基本。\nじゃあ1の向かいは…？",
        a: ["6", "６", "六", "ろく"],
      },
      {
        type: "⚖ 推理",
        q: "9枚のコインがある。8枚はまったく同じ重さで、1枚だけ少し「重い」。\n天秤を使って、その1枚を確実に特定したい。\n\n最低、何回の天秤の計量で必ず見つけられる？",
        hint: "3枚ずつ3グループに分ける。まず1回目で…\n（3進法で考えるとカチッとくる）",
        a: ["2", "２", "2回", "二", "に"],
      },
      {
        type: "🤔 算数の罠",
        q: "3人で1万円のホテルに泊まった。\n  1人 3,400円ずつ払い、お釣り 200円を3人で取り戻した。\n\nところがフロント係員はミスして、お釣りを300円と言い、3人に100円ずつ返した。\n\nつまり1人2,800円払って、合計【 2,800円 × 3 = 8,400円 】。\nさらに係員が抜いた【 200円 → 600円 】、合わせて 8,400 + 600 = 9,000円。\n\n…あれ？元は1万円のはず。残りの1,000円はどこに消えた？",
        hint: "そもそも「2,800円×3」に「600円を足す」のが筋違い。\n2,800円×3 = 8,400円の中には、すでに係員が抜いた600円が【含まれて】いる。",
        a: ["どこにも消えていない", "消えていない", "計算が間違っている", "計算ミス", "計算違い", "そもそも計算が変", "計算が間違ってる", "消えてない"],
      },
      {
        type: "🔄 視点変更",
        q: "上下を逆さま（180°回転）にしても、まったく同じに見える「3桁の数字」を1つ答えてね。\n（例：1881 のような4桁ではなく、3桁）",
        hint: "上下対称になる数字は 0, 1, 8。\nさらに 6 ⇄ 9 のペアも使える。\n3桁ABCで「Aを反転=C」「Bを反転=B」が条件。\n例：8_8, 6_9, 9_6, 1_1...",
        a: ["101", "111", "181", "808", "818", "888", "609", "619", "689", "906", "916", "986"],
      },
      {
        type: "👨‍👩‍👧 関係推理",
        q: "「私の弟の母の、たった1人の娘の父」── この人は、私とどんな関係？\n（一語で答えてね）",
        hint: "一段ずつ、ゆっくり辿ろう。\n　弟の母 ＝ 私の母\n　母の唯一の娘 ＝ 私\n　私の父 ＝ ？",
        a: ["父", "ちち", "お父さん", "おとうさん", "父親"],
      },
      {
        type: "🔢 数列",
        q: "下の数列の規則を見つけて、？に入る数字を答えよう！\n\n【 1, 11, 21, 1211, 111221, ? 】",
        hint: "それぞれの項を「声に出して読む」のがコツ。\n  1 →「1が1個」→ 11\n  11 →「1が2個」→ 21\n  21 →「2が1個、1が1個」→ 1211 …",
        a: ["312211"],
      },
      {
        type: "🔢 数列",
        q: "下の数列の規則を見つけて、？に入る数字を答えよう！\n\n【 1, 2, 6, 42, ? 】",
        hint: "となり合う数の関係を、「掛け算と足し算」で見てみよう。\n　1 →（×2＋0）→ 2\n　2 →（×3＋0）→ 6\n　6 →（×7＋0）→ 42 ← つまり、前の数 ×（前の数＋1）！",
        a: ["1806"],
      },

      // === ↓↓↓ v0.5.0 追加：新作10問 ↓↓↓ ===
      {
        type: "🛤 論理",
        q: "分かれ道に着いた。片方は「正直村」、もう片方は「うそつき村」へ続く。\n道ばたに村人が1人いるが、どちらの村の人かは分からない。\n（正直村の人は必ず本当を、うそつき村の人は必ず嘘を言う）\n\n「正直村」へ行きたい。1回だけ質問できるとしたら、どれを聞けば確実？",
        choices: ["あなたの村はどっち？", "正直村はどっち？", "あなたは正直者？"],
        hint: "正直者は自分の村（=正直村）を正しく指す。\nうそつきは自分の村（=うそつき村）について嘘をつくので、逆の正直村を指す。\nつまり、どちらの村人でも「同じ方向」を指す質問は…？",
        a: ["あなたの村はどっち？"],
      },
      {
        type: "🔢 数列",
        q: "下の数列の規則を見つけて、？に入る数字を答えよう！\n\n【 0, 1, 1, 2, 4, 7, 13, 24, ? 】",
        hint: "直前の「3つ」の数を足してみよう。\n7 + 13 + 24 = ？",
        a: ["44"],
      },
      {
        type: "🔄 ローマ字暗号",
        q: "ある法則で言葉が変身しています。\n？に入る言葉は？",
        html: `<div class="story-pair-list">
          <div class="spl-row"><span>いか</span><span class="arr">→</span><span>あき</span></div>
          <div class="spl-row"><span>いけ</span><span class="arr">→</span><span class="num q">？</span></div>
        </div>`,
        hint: "ローマ字で書いて、後ろから読んでみよう。\nいか = IKA → 逆から AKI = あき。\nいけ = IKE → 逆から…？",
        a: ["えき", "駅", "エキ", "eki", "EKI"],
      },
      {
        type: "✏ 漢字パズル",
        q: "漢字の「口」に2画だけ書き足してできる漢字を、1つ答えてね。\n（答えはいくつもあるよ）",
        hint: "「た」と読む四角い漢字、「め」と読む漢字、「しろ」と読む漢字…",
        a: ["田", "目", "白", "古", "旧", "叶", "占", "号", "右", "史", "司", "台", "只", "兄", "加", "召", "申", "由", "甲", "四", "石"],
      },
      {
        type: "🕐 時計算",
        q: "アナログ時計の「長針」と「短針」。\n12時ちょうどに重なってスタートしてから、次に12時になるまでの12時間で、2本の針は何回重なる？\n（スタートの12時は数えない）",
        hint: "1時間に1回…と思いきや、11時台には重ならずに12時まで持ち越される。\n12時間 ÷ 重なる間隔（約65.45分）＝？",
        a: ["11", "11回", "１１", "１１回", "十一"],
      },
      {
        type: "🏁 順位推理",
        q: "5人（A・B・C・D・E）でレースをした。\n  ・Dは1位だった\n  ・EはCより速かった\n  ・Cはビリではなかった\n  ・AはBの「すぐ後ろ」でゴールした\n\nさて、3位は誰？",
        hint: "Dが1位。AとBは連続する順位。\nCがビリでなく、EがCより上──この条件をすべて満たす並びは\n【 D → E → C → B → A 】の1通りだけ。",
        a: ["C", "c", "シー", "しー"],
      },
      {
        type: "📅 カレンダー算数",
        q: "ある月のカレンダーで、同じ曜日の列に「縦に3つ」並んだ数字を足したら45になった。\n真ん中の数字はいくつ？",
        hint: "カレンダーで縦に並ぶ数は7ずつ増える。\n真ん中をnとすると (n−7) + n + (n+7) = 3n = 45。",
        a: ["15", "１５", "十五", "15日"],
      },
      {
        type: "🔥 ひっかけ",
        q: "真っ暗な山小屋に入った。\n小屋の中には「ランプ」「ストーブ」「ろうそく」がある。\nマッチは1本しかない。\n\n最初に火をつけるべきものは？",
        hint: "ランプにもストーブにもろうそくにも、火をつける「前」に必要なことがある…",
        a: ["マッチ", "まっち", "match", "マッチ棒", "まっちぼう"],
      },
      {
        type: "🔤 頭文字",
        q: "下のアルファベットの並びの規則を見抜いて、？に入る1文字を答えよう！\n\n【 J ・ F ・ M ・ A ・ M ・ J ・ ? 】",
        hint: "January, February, March…\n英語の「月の名前」の頭文字だよ。6月の次は…？",
        a: ["J", "j", "ジェイ", "July", "july", "JULY"],
      },
      {
        type: "🔢 数字読み暗号",
        q: "ある法則で、言葉が数字に変わっています。\n？に入る数字は？",
        html: `<div class="story-pair-list">
          <div class="spl-row"><span>いちご</span><span class="arr">→</span><span class="num">15</span></div>
          <div class="spl-row"><span>にし</span><span class="arr">→</span><span class="num">24</span></div>
          <div class="spl-row"><span>しちごさん</span><span class="arr">→</span><span class="num">753</span></div>
          <div class="spl-row"><span>くろ</span><span class="arr">→</span><span class="num q">？</span></div>
        </div>`,
        hint: "いち=1、ご=5 → いちご=15。\nく=9、ろ=…？（ろく の「ろ」）",
        a: ["96", "９６"],
      },
    ],
  };

  // ============================================================
  //  STORY  -  難易度別ストーリー
  // ============================================================

  // -------- NORMAL：「お母さんのたんじょう日 宝さがし」（全4話）--------
  const STORY_NORMAL = {
    title: "お母さんのたんじょう日 宝さがし",
    intro:
      "今日は君のたんじょう日！\n朝、テーブルにお母さんからの手紙が置いてあった。\n「家のどこかにプレゼントを隠したよ。4つの謎を解いてね♪」",
    chapters: [
      {
        type: "📖 第一話 - キッチンの紙きれ",
        q:
          "今日は君のたんじょう日！\nテーブルに、お母さんからの手紙が置いてあった。\n「家のどこかにプレゼントを隠したよ。\n  4つの謎を解いてね♪」\n\n――最初のメモ――\n\n並び変えると3つの言葉。\n共通点は？",
        html:
          `<div class="scramble-chars">ぐ ・ ん ・ ま ・ ろ ・ さ ・ い ・ た ・ ま</div>`,
        hint: "3つの生き物が出てきます。共通点は？",
        a: ["魚", "さかな", "サカナ"],
      },
      {
        type: "📖 第二話 - 水槽のとなりの紙",
        q:
          "「魚」── 水槽のガラスに、次のメモが貼ってあった。",
        html:
          `<div class="story-pair-list">
            <div class="spl-row"><span>いぬ</span><span class="arr">→</span><span class="num">3</span></div>
            <div class="spl-row"><span>ねこ</span><span class="arr">→</span><span class="num">4</span></div>
            <div class="spl-row"><span>ぞう</span><span class="arr">→</span><span class="num">3</span></div>
            <div class="spl-row"><span>きりん</span><span class="arr">→</span><span class="num q">？</span></div>
          </div>`,
        hint: "ローマ字で書いてみると…？",
        a: ["5", "５", "ご", "五"],
      },
      {
        type: "📖 第三話 - 5番目の本棚",
        q:
          "「5」── リビングの5番目の本棚に、次のメモが貼ってあった。\n\n仲間外れは？",
        html:
          `<div class="story-list">
            <div class="sl-row">① しんぶんし</div>
            <div class="sl-row">② たけやぶやけた</div>
            <div class="sl-row">③ みなみ</div>
            <div class="sl-row">④ トマト</div>
            <div class="sl-row">⑤ やまびこ</div>
          </div>`,
        hint: "他の4つは上から読んでも下から読んでも同じ「回文」だ。",
        a: ["やまびこ", "ヤマビコ", "⑤", "5", "５"],
      },
      {
        type: "📖 最終話 - 山の絵の裏",
        q:
          "「やまびこ」── 山の絵の裏に、最後のメモが落ちていた。\n\nわたしがすきなもの！\nじゃあ、「ばなな」と「めろん」、わたしが好きなのはどっち？",
        html:
          `<div class="like-dislike">
            <div class="ld-col like">
              <div class="ld-head">好き</div>
              <div>ぶどう</div><div>いちご</div><div>りんご</div>
            </div>
            <div class="ld-col dislike">
              <div class="ld-head">きらい</div>
              <div>みかん</div><div>すいか</div><div>もも</div>
            </div>
          </div>`,
        hint: "「濁点（゛）」がつく言葉が好き。",
        a: ["ばなな", "バナナ"],
      },
    ],
    ending:
      "答えは「ばなな」！\nキッチンへ駆けつけると、テーブルにバナナ味のケーキと、大きなプレゼントの箱。\n\nお母さん「お誕生日おめでとう♪」\n\n中身は、ずっとほしかった図鑑だった。\n\n   〜 完 〜",
  };

  // -------- HARD：「消えた数学者の遺書」（全5話）--------
  const STORY_HARD = {
    title: "消えた数学者の遺書",
    intro:
      "天才数学者・桜井博士が、研究室から忽然と姿を消した。\n机に残されていたのは、5枚の暗号メモ。",
    chapters: [
      {
        type: "📖 第一章 - 机に残された数字",
        q:
          "天才数学者・桜井博士が、研究室から忽然と姿を消した。\n机に残されていたのは、5枚の暗号メモ。\n\n――1枚目――",
        html:
          `<div class="story-pair-list">
            <div class="spl-row"><span>11・12・32・44・93</span><span class="arr">→</span><span>愛してる</span></div>
            <div class="spl-row"><span>41・21・91・75・55</span><span class="arr">→</span><span class="num q">？</span></div>
          </div>`,
        hint: null,
        a: ["たからもの", "宝物", "宝もの", "タカラモノ", "宝"],
      },
      {
        type: "📖 第二章 - 鞄の中の数列",
        q:
          "「たからもの」── 棚の奥から博士の革鞄が出てきた。\n中には、新しい紙きれが1枚。",
        html:
          `<div class="story-pair-list">
            <div class="spl-row"><span>2 ・ 1 ・ 7</span><span class="arr">→</span><span style="font-size:32px">👜</span></div>
            <div class="spl-row"><span>20 ・ 1 ・ 2 ・ 12 ・ 5</span><span class="arr">→</span><span class="num q">？</span></div>
          </div>`,
        hint: "２はB、１はA、７はG　ということは…？",
        a: ["TABLE", "table", "Table", "テーブル"],
      },
      {
        type: "📖 第三章 - テーブルの裏の手帳",
        q:
          "「TABLE」── 研究テーブルの裏に、手帳が貼り付けられていた。",
        html:
          `<div class="story-pair-list">
            <div class="spl-row"><span>れ</span><span class="arr">→</span><span>え</span></div>
            <div class="spl-row"><span>み</span><span class="arr">→</span><span>い</span></div>
            <div class="spl-row"><span>さ</span><span class="arr">→</span><span class="num q">①</span></div>
            <div class="spl-row"><span>と</span><span class="arr">→</span><span class="num q">②</span></div>
            <div class="spl-row"><span>し</span><span class="arr">→</span><span class="num q">③</span></div>
          </div>
          <div class="story-pair-list" style="margin-top:10px;">
            <div class="spl-row"><span>①②③</span><span class="arr">→</span><span class="num q">？</span></div>
          </div>`,
        hint: "さ=a、と=o、し=i　→　a・o・i　→　？",
        a: ["あおい", "アオイ", "青", "青い", "aoi", "AOI"],
      },
      {
        type: "📖 第四章 - 青い額の裏",
        q:
          "「あおい」── 研究室の壁にかかった青い額の裏に、暗号が貼られていた。",
        html:
          `<div class="story-pair-list">
            <div class="spl-row"><span>て ・ ぼ ・ ら</span><span class="arr">→</span><span>と ・ ば ・ り</span></div>
            <div class="spl-row"><span>そ ・ き ・ ろ</span><span class="arr">→</span><span class="num q">？</span></div>
          </div>`,
        hint: "母音を1つすすめると…？",
        a: ["さくら", "サクラ", "桜"],
      },
      {
        type: "📖 最終章 - 桜の木の根元",
        q:
          "「さくら」── 窓から見える1本の桜の木。\n根元の土を払うと、最後の手紙が出てきた。",
        html:
          `<div class="story-pair-list">
            <div class="spl-row small"><span>なすび／ぞうきん／とけい／きって</span><span class="arr">→</span><span>なぞとき</span></div>
            <div class="spl-row small"><span>いなずま／どあ</span><span class="arr">→</span><span>インド</span></div>
            <div class="spl-row small"><span>あいす／しるもの／てんじょう／るびー</span><span class="arr">→</span><span class="num q">？</span></div>
          </div>`,
        hint: "①ローマ字で書いてみると…？\n②頭文字に注目すると…？",
        a: ["愛してる", "あいしてる", "アイシテル", "AISHITERU", "aishiteru"],
      },
    ],
    ending:
      "暗号がたどり着いた答えは── 「愛してる」。\n\n博士は失踪したのではなかった。\n長く疎遠だった家族へ、最後にどうしても伝えたかった一言を、\n5つの謎に託して、故郷へ帰っていたのだ。\n\n机の引き出しの底からは、家族写真と1通の航空券が見つかった。\n\n   〜 完 〜",
  };

  // -------- EASY：旧版「消えた指輪事件」（全5話）をそのまま据え置き --------
  const STORY_EASY = {
    title: "消えた指輪事件",
    intro:
      "おばあちゃん家に泊まりに来た夜。\n大切なルビーの指輪が消えていた…！\n君は探偵になって、謎を解き明かそう。",
    chapters: [
      {
        type: "📖 序章 - 玄関の暗証番号",
        q:
          "玄関の鍵が暗証番号式になっていた。\nおばあちゃんが残したヒント：\n「私の生まれ年の下2桁を2倍した数」\n\nおばあちゃんは1942年生まれ。\nさあ、暗証番号は？",
        hint: "42を2倍してみよう。",
        a: ["84"],
      },
      {
        type: "📖 第一章 - 床に落ちたメモ",
        q:
          "リビングのテーブルの下に、メモが落ちていた。\n\n【 ほ゛  ん  だ゛  な゛ 】\n\n…濁点を全部取って読むと、家の中のどこ？",
        hint: "「ほんたな」あるいは「ほんだな」。次に調べる場所がここに書いてある！",
        a: ["ほんだな", "本棚", "ほんたな", "ホンダナ"],
      },
      {
        type: "📖 第二章 - 本棚の暗号",
        q:
          "本棚から1枚の紙が出てきた。\n\n【 ら ・ の ・ あ ・ お ・ そ 】\n\nこの5文字を並び替えると、空を表す美しい言葉になる。",
        hint: "「そら」から始めてみて。",
        a: ["そらのあお", "空の青", "ソラノアオ"],
      },
      {
        type: "📖 第三章 - 容疑者の証言",
        q:
          "容疑者は3人。\n\n  父: 「私はずっと外にいたよ」\n  母: 「お父さんは家の中にいた」\n  弟: 「お母さんは嘘をついてないよ」\n\nこの中で嘘をついているのは1人だけ。\n指輪を盗ったのは嘘つきの人。犯人は誰？",
        hint: "父と母の証言は真逆だから、どちらかが嘘。\n弟の証言から、母は本当のことを言っている。すると…",
        a: ["父", "父さん", "ちち", "おとうさん", "お父さん"],
      },
      {
        type: "📖 最終章 - 隠し場所の暗号",
        q:
          "父の部屋を調べると、暗号の紙が！\n\n【 とけい→5 、 すいか→5 、 いぬ→? 】\n\nルール：その単語をローマ字で書いたときの、\nアルファベットの文字数だよ。",
        hint: "TOKEI = 5文字、SUIKA = 5文字、INU = ?",
        a: ["3"],
      },
    ],
    ending:
      "本棚の3冊目の本の中から、ルビーの指輪を発見！\nお父さんは「サプライズで磨いてあげようと思って…」と苦笑い。\nなんだ、犯人なんていなかった。\nみんなで笑った、夜更けのリビング。\n\n   〜 完 〜",
  };

  // 旧バージョン互換のため STORY も残す（easyにエイリアス＝旧来の挙動）
  const STORY = STORY_EASY;
  const STORY_BY_DIFFICULTY = {
    easy: STORY_EASY,
    normal: STORY_NORMAL,
    hard: STORY_HARD,
  };

  // ============================================================
  //  難易度の説明
  // ============================================================
  const DIFFICULTY_INFO = {
    easy: "やさしめの謎。なぞなぞ＋視覚パズル（影絵・錯視・図形数えなど）。",
    normal: "鏡像時計・折り紙・推理など、視点変更も増えてくる標準難度。",
    hard: "論理パズル・展開図・数列・関係推理など、本気の難問ぞろい。",
  };

  // ---------- export ----------
  window.PUZZLES = ENDLESS;
  window.STORY = STORY;
  window.STORY_BY_DIFFICULTY = STORY_BY_DIFFICULTY;
  window.DIFFICULTY_INFO = DIFFICULTY_INFO;
})();
