let prevImageData: ImageData | null = null;

class MotionSmoother {
  private smoothedX: number = 0;
  private smoothedY: number = 0;
  private readonly smoothingFactor: number = 0.3; // Adjust for more/less smoothing

  smooth(dx: number, dy: number): { dx: number; dy: number } {
    // Exponential moving average for smooth motion
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

  // Adjust sensitivity threshold (lower value = more sensitive)
  const threshold = (100 - sensitivity) * 0.5;

  // Compare pixels between frames
  for (let y = 0; y < canvas.height; y += 4) {
    for (let x = 0; x < canvas.width; x += 4) {
      const i = (y * canvas.width + x) * 4;

      // Calculate difference for each color channel
      const rdiff = Math.abs(currentFrame.data[i] - prevImageData.data[i]);
      const gdiff = Math.abs(currentFrame.data[i + 1] - prevImageData.data[i + 1]);
      const bdiff = Math.abs(currentFrame.data[i + 2] - prevImageData.data[i + 2]);

      if ((rdiff + gdiff + bdiff) / 3 > threshold) {
        // Calculate relative position from center
        const relativeX = x - canvas.width / 2;
        const relativeY = y - canvas.height / 2;

        motionX += relativeX;
        motionY += relativeY;
        motionPoints++;
      }
    }
  }

  // Store current frame as previous for next comparison
  prevImageData = currentFrame;

  if (motionPoints > 10) {  // Require minimum motion points to avoid noise
    const rawMotion = {
      dx: (motionX / motionPoints) / (canvas.width / 2),  // Normalize to [-1, 1]
      dy: (motionY / motionPoints) / (canvas.height / 2)  // Normalize to [-1, 1]
    };

    // Apply smoothing to the motion values
    return motionSmoother.smooth(rawMotion.dx, rawMotion.dy);
  }

  // Reset smoother when no motion is detected
  motionSmoother.reset();
  return { dx: 0, dy: 0 };
}