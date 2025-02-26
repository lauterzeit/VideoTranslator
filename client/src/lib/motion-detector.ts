let prevImageData: ImageData | null = null;

class MotionSmoother {
  private smoothedX: number = 0;
  private smoothedY: number = 0;
  private readonly smoothingFactor: number = 0.2; // Balanced smoothing for responsive yet smooth control

  smooth(dx: number, dy: number): { dx: number; dy: number } {
    // Simple exponential smoothing for gradual transitions
    this.smoothedX = this.smoothedX * (1 - this.smoothingFactor) + dx * this.smoothingFactor;
    this.smoothedY = this.smoothedY * (1 - this.smoothingFactor) + dy * this.smoothingFactor;

    return {
      dx: this.smoothedX,
      dy: this.smoothedY
    };
  }

  reset() {
    this.smoothedX = 0;
    this.smoothedY = 0;
  }
}

const motionSmoother = new MotionSmoother();

export function detectMotion(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  sensitivity: number
): { dx: number; dy: number } {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dx: 0, dy: 0 };

  // Draw current video frame
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (!prevImageData) {
    prevImageData = currentFrame;
    return { dx: 0, dy: 0 };
  }

  let motionX = 0;
  let motionY = 0;
  let motionPoints = 0;

  // Adjust sensitivity threshold
  const threshold = (100 - sensitivity) * 0.5;

  // Sample pixels for motion detection
  for (let y = 0; y < canvas.height; y += 8) {
    for (let x = 0; x < canvas.width; x += 8) {
      const i = (y * canvas.width + x) * 4;

      // Calculate difference for each color channel
      const rdiff = Math.abs(currentFrame.data[i] - prevImageData.data[i]);
      const gdiff = Math.abs(currentFrame.data[i + 1] - prevImageData.data[i + 1]);
      const bdiff = Math.abs(currentFrame.data[i + 2] - prevImageData.data[i + 2]);

      const avgDiff = (rdiff + gdiff + bdiff) / 3;
      if (avgDiff > threshold) {
        motionX += x - canvas.width / 2;
        motionY += y - canvas.height / 2;
        motionPoints++;
      }
    }
  }

  prevImageData = currentFrame;

  if (motionPoints > 5) {
    const rawMotion = {
      dx: (motionX / motionPoints) / (canvas.width / 2),
      dy: (motionY / motionPoints) / (canvas.height / 2)
    };

    return motionSmoother.smooth(rawMotion.dx, rawMotion.dy);
  }

  return motionSmoother.smooth(0, 0);
}