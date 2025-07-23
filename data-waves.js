class WavesCanvas {
    constructor(elm, options = {}) {
      this.canvas = elm;

      if (!this.canvas) return;
      
      const data = this.canvas.dataset;

      this.settings = {
        waveCount: parseInt(data.waveCount) || options.waveCount || 9,
        amplitude: parseInt(data.amplitude) || options.amplitude || 50,
        baseSpeed: parseFloat(data.baseSpeed) || options.baseSpeed || 0.005,
        waveSpacing: parseInt(data.waveSpacing) || options.waveSpacing || 30,
        baseColor: data.baseColor ? data.baseColor.split(',').map(Number) : options.baseColor || [0, 160, 255],
        lineWidth: parseInt(data.lineWidth) || options.lineWidth || 1,
        direction: data.direction || options.direction || "left",
        leftOffset: data.leftOffset || options.leftOffset || 0,
        rightOffset: data.rightOffset || options.rightOffset || 0,
      };

      this.ctx = this.canvas.getContext("2d");
      this.waves = [];

      this.init();
    }

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.waves.forEach((wave) => wave.updateOffset());
    }

    Wave = class {
      constructor(index, settings, canvas) {
        this.index = index;
        this.phase = index * 0.3;
        this.settings = settings;
        this.canvas = canvas;
        this.color = `rgba(${settings.baseColor[0]}, ${
          settings.baseColor[1]
        }, ${settings.baseColor[2]}, ${1 - (this.index / this.settings.waveCount)})`;
        this.updateOffset();
      }

      updateOffset() {
        const totalHeight =
          (this.settings.waveCount - 1) * this.settings.waveSpacing;
        const centerOffset = (this.canvas.height - totalHeight) / 2;
        this.yOffset = centerOffset + this.index * this.settings.waveSpacing;
        
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.settings.lineWidth;

        // Начальная точка с учётом leftOffset в процентах
        let firstX = 0;
        const leftOffsetPx =
          (this.settings.leftOffset / 100) * this.canvas.height;
        let firstY =
          this.yOffset +
          leftOffsetPx +
          Math.sin(firstX * 0.005 + this.phase) * this.settings.amplitude +
          Math.cos(firstX * 0.002 + this.phase) * this.settings.amplitude * 0.5;
        ctx.moveTo(firstX, firstY);

        // Рисуем волну с интерполяцией между leftOffset и rightOffset в процентах
        for (let x = 0; x <= this.canvas.width; x += 20) {
          const t = x / this.canvas.width; // Нормализованная позиция (0 - начало, 1 - конец)
          const leftOffsetPx =
            (this.settings.leftOffset / 100) * this.canvas.height;
          const rightOffsetPx =
            (this.settings.rightOffset / 100) * this.canvas.height;
          const offset = leftOffsetPx * (1 - t) + rightOffsetPx * t; // Интерполяция
          const y =
            this.yOffset +
            offset +
            Math.sin(x * 0.005 + this.phase) * this.settings.amplitude +
            Math.cos(x * 0.002 + this.phase) * this.settings.amplitude * 0.5;
          ctx.lineTo(x, y);
        }

        ctx.stroke();
      }

      update() {
        const speed =
          this.settings.direction === "right"
            ? -this.settings.baseSpeed
            : this.settings.baseSpeed;
        this.phase += speed;
      }
    };

    init() {
      window.addEventListener("resize", () => this.resizeCanvas());
      this.resizeCanvas();

      for (let i = 0; i < this.settings.waveCount; i++) {
        this.waves.push(new this.Wave(i, this.settings, this.canvas));
      }

      this.animate();
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.waves.forEach((wave) => {
        wave.updateOffset();
        wave.update();
        wave.draw(this.ctx);
      });

      this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    destroy() {
      window.removeEventListener("resize", this.resizeCanvas);
      this.waves = [];
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      cancelAnimationFrame(this.animationFrame);
    }

    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings };
      this.waves = [];
      for (let i = 0; i < this.settings.waveCount; i++) {
        this.waves.push(new this.Wave(i, this.settings, this.canvas));
      }
    }
  }

new WavesCanvas(document.querySelector("[data-waves]"))