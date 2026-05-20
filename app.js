/* ============================================================
 *  app.js  – 画面遷移・ゲーム進行・スコア管理
 * ============================================================ */
(function () {
  // ====== 状態 ======
  const state = {
    mode: "endless",        // "story" | "endless" | "solo"
    difficulty: "easy",     // "easy" | "normal" | "hard"
    players: ["プレイヤー1", "プレイヤー2"],
    scores: [],             // [10, 0, ...]
    turn: 0,                // 現在のプレイヤーindex
    puzzles: [],            // 今回出題する配列
    cursor: 0,              // 進行中index
    hintUsed: false,
    answerRevealed: false,  // この問題で「答えを表示」を押したか
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

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  // モード判定ユーティリティ
  function isSolo() { return state.mode === "solo"; }

  // ====== タイトル → 設定 ======
  $$('[data-goto]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const dest = btn.dataset.goto;
      if (dest === "setup") {
        state.mode = btn.dataset.mode || "endless";
        // soloモードならプレイヤーを1人に揃える
        if (isSolo()) {
          state.players = ["あなた"];
        } else if (state.players.length < 2) {
          state.players = ["プレイヤー1", "プレイヤー2"];
        }
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
    const titles = { story: "ストーリーモード設定", endless: "ひたすら謎解き設定", solo: "おひとり様モード設定" };
    $("#setup-title").textContent = titles[state.mode] || "設定";

    // おひとり様モードはプレイヤー設定欄ごと非表示
    const playerField = $("#players-field");
    if (isSolo()) {
      playerField.classList.add("hidden");
    } else {
      playerField.classList.remove("hidden");
      renderPlayers();
    }
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
      state.puzzles = window.STORY.chapters.slice();
    } else {
      // endless と solo は同じ：難易度ごとのプールからシャッフル
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

    const badge = $("#diff-badge");
    badge.className = "diff-badge " + (state.mode === "story" ? "" : state.difficulty);
    badge.textContent = state.mode === "story" ? "STORY" : state.difficulty.toUpperCase();

    // ターンバナー：soloは非表示
    const turnBanner = $(".turn-banner");
    if (isSolo()) {
      turnBanner.classList.add("hidden");
    } else {
      turnBanner.classList.remove("hidden");
      $("#current-player").textContent = state.players[state.turn];
    }

    // 内容
    $("#puzzle-type").textContent = p.type || "謎";
    $("#puzzle-question").textContent = p.q;
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
      $("#puzzle-input").value = "";
    }

    // ヒント・答え表示状態をリセット
    state.hintUsed = false;
    state.answerRevealed = false;
    $("#hint-box").classList.add("hidden");
    $("#answer-box").classList.add("hidden");
    $("#hint-btn").disabled = false;
    $("#reveal-btn").disabled = false;

    // スコアボード（soloは非表示）
    renderScoreboard();
  }

  function renderScoreboard() {
    const sb = $("#scoreboard");
    if (isSolo()) {
      sb.classList.add("hidden");
      return;
    }
    sb.classList.remove("hidden");
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
    if (state.answerRevealed) {
      // 答え表示後は採点せず、次へ進める専用処理
      advance(false);
      return;
    }
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

  // 答えを表示（v0.3.0 新機能）
  $("#reveal-btn").addEventListener("click", () => {
    if (state.answerRevealed) return;
    if (!confirm("この問題の答えを表示しますか？\n（その問題はスコア対象外になります）")) return;
    const p = state.puzzles[state.cursor];
    const answers = Array.isArray(p.a) ? p.a : [p.a];
    const main = answers[0];
    state.answerRevealed = true;
    const box = $("#answer-box");
    box.innerHTML = `<strong>答え：</strong>${escapeHtml(main)}`;
    box.classList.remove("hidden");
    $("#reveal-btn").disabled = true;
    toast("答えを表示しました");
  });

  $("#pass-btn").addEventListener("click", () => {
    if (!confirm("この問題をパスしますか？\n（次の問題へ進み、ターンも交代します）")) return;
    toast("パスしました");
    advance(false);
  });

  function advance(wasCorrect) {
    state.answered++;
    // ターン交代（soloはターンの概念なし）
    if (!isSolo()) {
      state.turn = (state.turn + 1) % state.players.length;
    }
    state.cursor++;

    if (state.cursor >= state.puzzles.length) {
      if (state.mode === "story") return endGame();
      // endless / solo：プール再シャッフルして継続
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
    } else if (isSolo()) {
      sub = `${state.answered} 問中 ${state.correct} 問クリア！\nスコア：${state.scores[0]} pt`;
    } else {
      sub = `${state.answered} 問中 ${state.correct} 問クリア！`;
    }
    $("#result-sub").textContent = sub;
    $("#result-sub").style.whiteSpace = "pre-wrap";

    // ランキング
    const list = $("#result-scores");
    list.innerHTML = "";
    if (isSolo()) {
      // 単独表示：勝者扱いなし、シンプルな単一カード
      const chip = document.createElement("div");
      chip.className = "score-chip";
      chip.innerHTML = `<span class="pname">${escapeHtml(state.players[0])}</span><span class="pscore">${state.scores[0]} pt</span>`;
      list.appendChild(chip);
    } else {
      const ranked = state.players
        .map((name, i) => ({ name, score: state.scores[i] }))
        .sort((a, b) => b.score - a.score);
      const top = ranked[0].score;
      ranked.forEach((r) => {
        const chip = document.createElement("div");
        chip.className = "score-chip" + (r.score === top && top > 0 ? " win" : "");
        const crown = r.score === top && top > 0 ? '<span class="crown">👑</span>' : "";
        chip.innerHTML = `<span class="pname">${escapeHtml(r.name)}${crown}</span><span class="pscore">${r.score} pt</span>`;
        list.appendChild(chip);
      });
    }
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

  // ====== 更新お知らせ（端末で最初に開いたときに限り表示） ======
  function maybeShowUpdateNotice() {
    const cur = window.APP_VERSION || "0.0.0";
    const log = window.APP_CHANGELOG;
    if (!log || log.version !== cur) return;

    let last = null;
    try {
      last = localStorage.getItem("nazotoki_lastSeenVersion");
    } catch (e) {
      // localStorage不可（プライベートモードなど）→ 表示しないで終了
      return;
    }
    if (last === cur) return;

    // モーダルを構築
    $("#update-title").textContent = log.title || "アップデート";
    const ul = $("#update-points");
    ul.innerHTML = "";
    (log.points || []).forEach((pt) => {
      const li = document.createElement("li");
      li.textContent = pt;
      ul.appendChild(li);
    });
    $("#update-modal").classList.remove("hidden");

    const close = () => {
      $("#update-modal").classList.add("hidden");
      try { localStorage.setItem("nazotoki_lastSeenVersion", cur); } catch (e) {}
    };
    $("#update-close").addEventListener("click", close, { once: true });
  }

  // ====== 初期化 ======
  renderPlayers();
  updateDifficultyHint();
  showScreen("title");
  maybeShowUpdateNotice();
})();
