let videoElement: HTMLVideoElement | null = null;
let currentSeekTime = 0;
let isTransitioning = false;

export function setVideoElement(element: HTMLVideoElement) {
  videoElement = element;
  // Ensure video starts unmuted
  videoElement.muted = false;
  videoElement.volume = 0.5; // Start at 50% volume
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function controlVideo(motion: { dx: number; dy: number }) {
  if (!videoElement) return;

  const MOTION_THRESHOLD = 0.1;
  const SEEK_FACTOR = 5; // Seconds to seek per motion unit

  // Horizontal motion controls playhead position
  if (Math.abs(motion.dx) > MOTION_THRESHOLD) {
    try {
      // Calculate target seek time based on motion intensity
      const seekDelta = motion.dx * SEEK_FACTOR;
      const targetTime = videoElement.currentTime + seekDelta;

      // Apply easing to the seek time transition
      if (!isTransitioning) {
        currentSeekTime = videoElement.currentTime;
        isTransitioning = true;
      }

      // Smoothly interpolate between current and target time
      const easedTime = currentSeekTime + (targetTime - currentSeekTime) * easeInOutCubic(0.5);
      const safeTime = Math.max(0.1, Math.min(easedTime, videoElement.duration - 0.1));

      // Only update if the time actually changed
      if (safeTime !== videoElement.currentTime) {
        videoElement.currentTime = safeTime;
        currentSeekTime = safeTime;
      }

      // Only try to play if we're not at the end
      if (videoElement.currentTime < videoElement.duration - 0.1) {
        if (videoElement.paused) {
          videoElement.play().catch(err => console.error('Error playing video:', err));
        }
      } else {
        videoElement.pause(); // Pause at the end
      }
    } catch (err) {
      console.error('Error controlling video:', err);
    }
  } else {
    // Reset transition state when no motion
    isTransitioning = false;

    // Pause when no horizontal motion
    if (!videoElement.paused) {
      videoElement.pause();
    }
  }

  // Vertical motion controls volume
  if (Math.abs(motion.dy) > MOTION_THRESHOLD) {
    // Current volume + scaled motion (inverted so up increases volume)
    const newVolume = videoElement.volume - (motion.dy * 0.8);
    videoElement.volume = Math.max(0, Math.min(1, newVolume));
    console.log('Volume set to:', videoElement.volume); // Debug volume changes
  }
}