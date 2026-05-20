/* ============================================================
 *  app.js  – 画面遷移・ゲーム進行・スコア管理
 * ============================================================ */
(function () {
  // ====== 状態 ======
  const state = {
    mode: "endless",        // "story" or "endless"
    difficulty: "easy",     // "easy" | "normal" | "hard"
    players: ["プレイヤー1", "プレイヤー2"],
    scores: [],             // [10, 0, ...]
    turn: 0,                // 現在のプレイヤーindex
    puzzles: [],            // 今回出題する配列
    cursor: 0,              // 進行中index
    hintUsed: false,
    answered: 0,
    correct: 0,
  };

  let memo;

  // ====== ヘルパー ======
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function showScreen(name) {
    $$(".screen").forEach((s) => s.classList.remove("active"));
    const el = document.getElementById("screen-" + name);
    if (el) el.classList.add("active");
    window.scrollTo(0, 0);
  }

  function toast(msg, type) {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast " + (type || "");
    t.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.add("hidden"), 1600);
  }

  function normalize(s) {
    return String(s).trim().toLowerCase().replace(/\s+/g, "");
  }

  // 配列シャッフル
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ====== タイトル → 設定 ======
  $$('[data-goto]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const dest = btn.dataset.goto;
      if (dest === "setup") {
        state.mode = btn.dataset.mode || "endless";
        renderSetup();
      }
      showScreen(dest);
    });
  });

  // 終了系
  $("#quit-btn").addEventListener("click", () => {
    if (state.answered > 0) {
      if (!confirm("ゲームを中断してタイトルに戻りますか？\n（記録は残りません）")) return;
    }
    showScreen("title");
  });
  $("#end-btn").addEventListener("click", () => {
    if (state.mode === "story") {
      toast("ストーリーは最後まで頑張ろう！");
      return;
    }
    if (state.answered === 0) {
      toast("まだ1問も解いてないよ");
      return;
    }
    if (confirm("ここで終了して結果を見ますか？")) endGame();
  });

  function renderSetup() {
    $("#setup-title").textContent =
      state.mode === "story" ? "ストーリーモード設定" : "ひたすら謎解き設定";
    renderPlayers();
    updateDifficultyHint();
  }

  function renderPlayers() {
    const list = $("#players-list");
    list.innerHTML = "";
    state.players.forEach((name, i) => {
      const row = document.createElement("div");
      row.className = "player-row";
      row.innerHTML = `
        <div class="pnum">${i + 1}</div>
        <input type="text" value="${escapeHtml(name)}" maxlength="12" />
      `;
      const input = row.querySelector("input");
      input.addEventListener("input", () => {
        state.players[i] = input.value || `プレイヤー${i + 1}`;
      });
      list.appendChild(row);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  $("#add-player").addEventListener("click", () => {
    if (state.players.length >= 6) {
      toast("最大6人までだよ");
      return;
    }
    state.players.push(`プレイヤー${state.players.length + 1}`);
    renderPlayers();
  });
  $("#remove-player").addEventListener("click", () => {
    if (state.players.length <= 2) {
      toast("最低2人必要だよ");
      return;
    }
    state.players.pop();
    renderPlayers();
  });

  // 難易度切替
  $$('#difficulty-seg .seg-btn').forEach((btn) => {
    btn.addEventListener("click", () => {
      $$('#difficulty-seg .seg-btn').forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.difficulty = btn.dataset.difficulty;
      updateDifficultyHint();
    });
  });
  function updateDifficultyHint() {
    $("#difficulty-hint").textContent = window.DIFFICULTY_INFO[state.difficulty];
  }

  // スタート
  $("#start-btn").addEventListener("click", () => {
    state.scores = state.players.map(() => 0);
    state.turn = 0;
    state.cursor = 0;
    state.answered = 0;
    state.correct = 0;

    if (state.mode === "story") {
      // ストーリーは難易度に関わらず固定（ただし結果画面で難易度倍率）
      state.puzzles = window.STORY.chapters.slice();
    } else {
      const pool = window.PUZZLES[state.difficulty];
      state.puzzles = shuffle(pool);
    }

    renderPuzzle();
    showScreen("puzzle");
  });

  // ====== 謎解き画面 ======
  function renderPuzzle() {
    const p = state.puzzles[state.cursor];
    if (!p) return endGame();

    // ヘッダ
    const total = state.puzzles.length;
    $("#progress-text").textContent =
      state.mode === "story"
        ? `第 ${state.cursor + 1} / ${total} 話`
        : `第 ${state.cursor + 1} 問 / クリア${state.correct}`;
    $("#progress-fill").style.width = ((state.cursor) / total * 100) + "%";

    const diff = state.mode === "story" ? "story" : state.difficulty;
    const badge = $("#diff-badge");
    badge.className = "diff-badge " + (state.mode === "story" ? "" : state.difficulty);
    badge.textContent = state.mode === "story" ? "STORY" : state.difficulty.toUpperCase();

    // ターン
    $("#current-player").textContent = state.players[state.turn];

    // 内容
    $("#puzzle-type").textContent = p.type || "謎";
    $("#puzzle-question").textContent = p.q;
    // ビジュアル（HTML/SVG）があれば挿入
    const visEl = $("#puzzle-visual");
    visEl.innerHTML = p.html || "";

    // 選択肢 or 入力
    const choicesEl = $("#puzzle-choices");
    const inputWrap = $("#puzzle-input-wrap");
    choicesEl.innerHTML = "";
    if (p.choices && p.choices.length) {
      inputWrap.classList.add("hidden");
      p.choices.forEach((c) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = c;
        btn.addEventListener("click", () => handleAnswer(c));
        choicesEl.appendChild(btn);
      });
    } else {
      inputWrap.classList.remove("hidden");
      const inp = $("#puzzle-input");
      inp.value = "";
      // 自動フォーカスはモバイルでキーボードが問題文を隠すので避ける
    }

    // ヒント
    state.hintUsed = false;
    $("#hint-box").classList.add("hidden");
    $("#hint-btn").disabled = false;

    // スコアボード
    renderScoreboard();

    // メモ：問題切り替え時はそのまま残す（プレイヤー判断）
  }

  function renderScoreboard() {
    const sb = $("#scoreboard");
    sb.innerHTML = "";
    state.players.forEach((name, i) => {
      const chip = document.createElement("div");
      chip.className = "score-chip" + (i === state.turn ? " current" : "");
      chip.innerHTML = `<span class="pname">${escapeHtml(name)}</span><span class="pscore">${state.scores[i]} pt</span>`;
      sb.appendChild(chip);
    });
  }

  // 回答
  $("#submit-btn").addEventListener("click", () => {
    const v = $("#puzzle-input").value;
    if (!v.trim()) {
      toast("答えを入力してね");
      return;
    }
    handleAnswer(v);
  });
  $("#puzzle-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("#submit-btn").click();
  });

  function handleAnswer(input) {
    const p = state.puzzles[state.cursor];
    const answers = Array.isArray(p.a) ? p.a : [p.a];
    const ok = answers.some((a) => normalize(a) === normalize(input));

    if (ok) {
      const gained = state.hintUsed ? 5 : 10;
      state.scores[state.turn] += gained;
      state.correct++;
      toast(`正解！ +${gained}pt`, "correct");
      advance(true);
    } else {
      toast("ちがうみたい…", "wrong");
      // 不正解はターンは進めず、再挑戦可能。だがパスもできる。
      // ただし無限ループ防止に何もしない（プレイヤーが「パス」で次へ）。
    }
  }

  $("#hint-btn").addEventListener("click", () => {
    const p = state.puzzles[state.cursor];
    if (!p.hint) {
      toast("ヒントなし！");
      return;
    }
    state.hintUsed = true;
    const box = $("#hint-box");
    box.textContent = p.hint;
    box.classList.remove("hidden");
    $("#hint-btn").disabled = true;
  });

  $("#pass-btn").addEventListener("click", () => {
    if (!confirm("この問題をパスしますか？\n（次の問題へ進み、ターンも交代します）")) return;
    toast("パスしました");
    advance(false);
  });

  function advance(wasCorrect) {
    state.answered++;
    // ターン交代
    state.turn = (state.turn + 1) % state.players.length;
    state.cursor++;

    if (state.cursor >= state.puzzles.length) {
      // ストーリー or エンドレスのループ
      if (state.mode === "story") return endGame();
      // エンドレス：プール再シャッフルして継続
      const pool = window.PUZZLES[state.difficulty];
      state.puzzles = state.puzzles.concat(shuffle(pool));
    }
    setTimeout(renderPuzzle, 600);
  }

  function endGame() {
    showScreen("result");
    const isStory = state.mode === "story";
    $("#result-title").textContent = isStory ? "事件解決！" : "おつかれさま！";

    let sub;
    if (isStory) {
      sub = window.STORY.ending;
    } else {
      sub = `${state.answered} 問中 ${state.correct} 問クリア！`;
    }
    $("#result-sub").textContent = sub;
    $("#result-sub").style.whiteSpace = "pre-wrap";

    // ランキング
    const ranked = state.players
      .map((name, i) => ({ name, score: state.scores[i] }))
      .sort((a, b) => b.score - a.score);
    const top = ranked[0].score;
    const list = $("#result-scores");
    list.innerHTML = "";
    ranked.forEach((r, idx) => {
      const chip = document.createElement("div");
      chip.className = "score-chip" + (r.score === top && top > 0 ? " win" : "");
      const crown = r.score === top && top > 0 ? '<span class="crown">👑</span>' : "";
      chip.innerHTML = `<span class="pname">${escapeHtml(r.name)}${crown}</span><span class="pscore">${r.score} pt</span>`;
      list.appendChild(chip);
    });
  }

  $("#result-again").addEventListener("click", () => {
    renderSetup();
    showScreen("setup");
  });

  // ====== メモ ======
  memo = new window.MemoCanvas(document.getElementById("memo-overlay"));
  $("#memo-toggle").addEventListener("click", () => {
    if (memo.isOpen()) memo.close();
    else memo.open();
  });

  // ====== バージョン表示 ======
  $$('.version-text').forEach((el) => {
    el.textContent = window.APP_VERSION || "0.0.0";
  });

  // ====== 初期化 ======
  renderPlayers();
  updateDifficultyHint();
  showScreen("title");
})();
