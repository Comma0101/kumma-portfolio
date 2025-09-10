import { FC } from "react";
import { useEffect, useRef } from "react";

interface Curve {
  amplitude: number;
  frequency: number;
  phase: number;
  rotation: number;
  speed: number;
}

const AnimationThree: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("2D context not available");
      return;
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create several curves with random parameters
    const numCurves = 7;
    const curves: Curve[] = Array.from({ length: numCurves }, () => ({
      amplitude: Math.random() * 80 + 40, // Between 40 and 120
      frequency: Math.random() * 0.03 + 0.01, // 0.01 to 0.04
      phase: Math.random() * Math.PI * 2, // 0 to 2π
      rotation: Math.random() * (Math.PI / 6) - Math.PI / 12, // -15° to +15°
      speed: Math.random() * 0.005 + 0.005, // 0.005 to 0.01
    }));

    let time = 0;

    const render = () => {
      // Draw a dynamic background gradient
      const bgGrad = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      bgGrad.addColorStop(0, `hsl(${(time * 0.05) % 360}, 30%, 10%)`);
      bgGrad.addColorStop(1, `hsl(${(time * 0.05 + 60) % 360}, 30%, 10%)`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // For each curve, set up a unique transformation and draw a path
      curves.forEach((curve, idx) => {
        ctx.save();
        // Translate to center of canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);
        // Rotate the canvas by a fixed rotation plus a slow time-based twist
        ctx.rotate(curve.rotation + time * 0.0005 * (idx + 1));

        // Begin path for curve: from -width/2 to width/2
        ctx.beginPath();
        const startX = -canvas.width / 2;
        const endX = canvas.width / 2;
        const step = 5;
        for (let x = startX; x <= endX; x += step) {
          // Calculate a dynamic y value based on sine; time makes it animate
          const y =
            curve.amplitude *
            Math.sin(curve.frequency * x + curve.phase + time * curve.speed);
          if (x === startX) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Create a dynamic stroke gradient for this curve
        const grad = ctx.createLinearGradient(startX, 0, endX, 0);
        grad.addColorStop(0, `hsl(${(time + idx * 40) % 360}, 80%, 60%)`);
        grad.addColorStop(1, `hsl(${(time + idx * 40 + 120) % 360}, 80%, 60%)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2 + idx;
        ctx.stroke();
        ctx.restore();
      });

      time += 2;
      requestAnimationFrame(render);
    };

    render();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100vw", height: "100vh" }}
    />
  );
};

export default AnimationThree;
