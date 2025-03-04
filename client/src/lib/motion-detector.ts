let prevImageData: ImageData | null = null;
let lastMotionTime: number = Date.now();
let resetTimeout: NodeJS.Timeout | null = null;

class MotionSmoother {
  private smoothedX: number = 0;
  private smoothedY: number = 0;
  private readonly smoothingFactor: number = 0.7; // Further reduced for smoother transitions, default 0.1
  private readonly velocityDamping: number = 0.5; // Damping factor for motion, default 0.85
  private readonly velocityThreshold: number = 0.035; // Minimum velocity threshold, default 0.05
  private prevDx: number = 0;
  private prevDy: number = 0;
  private velocityX: number = 0;
  private velocityY: number = 0;

  smooth(dx: number, dy: number): { dx: number; dy: number } {
    // Update velocity with new motion values
    this.velocityX = this.velocityX * this.velocityDamping + (dx - this.prevDx);
    this.velocityY = this.velocityY * this.velocityDamping + (dy - this.prevDy);

    // Apply velocity damping to previous values
    this.prevDx = this.prevDx * this.velocityDamping;
    this.prevDy = this.prevDy * this.velocityDamping;

    // Blend new motion with damped previous motion and predicted velocity
    const blendedDx = (dx + this.prevDx + this.velocityX) / 3;
    const blendedDy = (dy + this.prevDy + this.velocityY) / 3;

    // Apply exponential smoothing with reduced factor
    this.smoothedX = this.smoothedX * (1 - this.smoothingFactor) + blendedDx * this.smoothingFactor;
    this.smoothedY = this.smoothedY * (1 - this.smoothingFactor) + blendedDy * this.smoothingFactor;

    // Apply velocity threshold to reduce micro-movements
    const finalDx = Math.abs(this.smoothedX) < this.velocityThreshold ? 0 : this.smoothedX;
    const finalDy = Math.abs(this.smoothedY) < this.velocityThreshold ? 0 : this.smoothedY;

    // Update previous values
    this.prevDx = dx;
    this.prevDy = dy;

    return {
      dx: finalDx,
      dy: finalDy
    };
  }

  reset() {
    this.smoothedX = 0;
    this.smoothedY = 0;
    this.prevDx = 0;
    this.prevDy = 0;
    this.velocityX = 0;
    this.velocityY = 0;
  }
}

const motionSmoother = new MotionSmoother();

// Function to reset video to midpoint
function resetToMidpoint() {
  const videoElements = document.getElementsByTagName('video');
  // Find the video player (not the camera feed)
  for (const video of videoElements) {
    if (!video.srcObject) { // This is the video player, not the camera feed
      const midPoint = video.duration / 2;
      video.currentTime = midPoint;
      break;
    }
  }
}

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

  // Adjust sensitivity threshold (lower value = more sensitive) 0.5 was default
  const threshold = (100 - sensitivity) * 0.4;

  // Sample fewer pixels for better performance and reduced noise
  const sampleStep = 8; // Increased step size for sampling, default 8

  // Compare pixels between frames
  for (let y = 0; y < canvas.height; y += sampleStep) {
    for (let x = 0; x < canvas.width; x += sampleStep) {
      const i = (y * canvas.width + x) * 4;

      // Calculate difference for each color channel
      const rdiff = Math.abs(currentFrame.data[i] - prevImageData.data[i]);
      const gdiff = Math.abs(currentFrame.data[i + 1] - prevImageData.data[i + 1]);
      const bdiff = Math.abs(currentFrame.data[i + 2] - prevImageData.data[i + 2]);

      const avgDiff = (rdiff + gdiff + bdiff) / 3;
      if (avgDiff > threshold) {
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

  if (motionPoints > 5) {  // Keep minimum motion points requirement low
    // Reset the inactivity timer when motion is detected
    lastMotionTime = Date.now();
    if (resetTimeout) {
      clearTimeout(resetTimeout);
      resetTimeout = null;
    }

    const rawMotion = {
      dx: (motionX / motionPoints) / (canvas.width / 2),  // Normalize to [-1, 1]
      dy: (motionY / motionPoints) / (canvas.height / 2)  // Normalize to [-1, 1]
    };

    // Apply enhanced smoothing to the motion values
    return motionSmoother.smooth(rawMotion.dx, rawMotion.dy);
  }

  // Check for inactivity (4 seconds)
  if (!resetTimeout && Date.now() - lastMotionTime > 4000) {
    resetTimeout = setTimeout(() => {
      resetToMidpoint();
      resetTimeout = null;
    }, 100); // Small delay to ensure smooth transition
  }

  // Apply smoothing even when no motion is detected for smoother transitions
  return motionSmoother.smooth(0, 0);
}