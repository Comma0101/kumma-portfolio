export abstract class Animation {
  protected ctx: CanvasRenderingContext2D;
  protected width: number;
  protected height: number;
  protected backgroundColor: string = "black"; // Default background color

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  abstract update(): void;
  abstract render(): void;

  animate = () => {
    this.update();
    this.render();
    requestAnimationFrame(this.animate);
  };

  start() {
    this.animate();
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setBackgroundColor(color: string) {
    this.backgroundColor = color;
  }

  clearBackground() {
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
