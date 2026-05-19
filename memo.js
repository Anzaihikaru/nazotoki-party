/* ============================================================
 *  メモオーバーレイ：Canvas手書き
 *   - ペン(3色) / 消しゴム / 全消し
 *   - タッチ＆マウス両対応
 *   - 解像度はdevicePixelRatioに合わせる
 *   - 描画内容は閉じても保持。clearで全消し
 * ============================================================ */
(function () {
  class MemoCanvas {
    constructor(overlayEl) {
      this.overlay = overlayEl;
      this.canvas = overlayEl.querySelector("#memo-canvas");
      this.ctx = this.canvas.getContext("2d");
      this.tool = "pen-black";
      this.drawing = false;
      this.lastX = 0;
      this.lastY = 0;
      this.imageBackup = null;

      this._bindToolbar();
      this._bindDrawing();
      window.addEventListener("resize", () => this._resize());
    }

    open() {
      this.overlay.classList.remove("hidden");
      // 表示後にサイズ確定 → 解像度合わせ
      requestAnimationFrame(() => this._resize(true));
    }

    close() {
      this._backup();
      this.overlay.classList.add("hidden");
    }

    isOpen() {
      return !this.overlay.classList.contains("hidden");
    }

    clearAll() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.imageBackup = null;
    }

    _resize(restoreBackup) {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);
      if (this.canvas.width === w && this.canvas.height === h && !restoreBackup) return;
      // 復元用にバックアップ
      const prev = this.imageBackup;
      this.canvas.width = w;
      this.canvas.height = h;
      this.ctx.scale(dpr, dpr);
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      if (prev) {
        const img = new Image();
        img.onload = () => this.ctx.drawImage(img, 0, 0, rect.width, rect.height);
        img.src = prev;
      }
    }

    _backup() {
      try {
        this.imageBackup = this.canvas.toDataURL();
      } catch (e) {
        // canvasサイズ0などのとき無視
      }
    }

    _bindToolbar() {
      this.overlay.querySelectorAll(".tool-btn[data-tool]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.overlay.querySelectorAll(".tool-btn[data-tool]").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.tool = btn.dataset.tool;
        });
      });
      this.overlay.querySelector("#memo-clear").addEventListener("click", () => {
        if (confirm("メモを全て消しますか？")) this.clearAll();
      });
      this.overlay.querySelector("#memo-close").addEventListener("click", () => this.close());
    }

    _getPos(e) {
      const rect = this.canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }

    _bindDrawing() {
      const start = (e) => {
        e.preventDefault();
        const p = this._getPos(e);
        this.drawing = true;
        this.lastX = p.x;
        this.lastY = p.y;
        // 点だけ打てるように
        this._stroke(p.x, p.y, p.x + 0.01, p.y + 0.01);
      };
      const move = (e) => {
        if (!this.drawing) return;
        e.preventDefault();
        const p = this._getPos(e);
        this._stroke(this.lastX, this.lastY, p.x, p.y);
        this.lastX = p.x;
        this.lastY = p.y;
      };
      const end = (e) => {
        if (!this.drawing) return;
        this.drawing = false;
        this._backup();
      };
      this.canvas.addEventListener("mousedown", start);
      this.canvas.addEventListener("mousemove", move);
      window.addEventListener("mouseup", end);
      this.canvas.addEventListener("touchstart", start, { passive: false });
      this.canvas.addEventListener("touchmove", move, { passive: false });
      this.canvas.addEventListener("touchend", end);
      this.canvas.addEventListener("touchcancel", end);
    }

    _stroke(x0, y0, x1, y1) {
      const ctx = this.ctx;
      if (this.tool === "eraser") {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 22;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.restore();
        return;
      }
      const colors = {
        "pen-black": "#222",
        "pen-red": "#e84a4a",
        "pen-blue": "#3a78d8",
      };
      ctx.strokeStyle = colors[this.tool] || "#222";
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  }

  window.MemoCanvas = MemoCanvas;
})();
