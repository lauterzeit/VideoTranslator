let videoElement: HTMLVideoElement | null = null;
let currentSeekTime = 0;

export function setVideoElement(element: HTMLVideoElement) {
  videoElement = element;
  // Ensure video starts unmuted
  videoElement.muted = false;
  videoElement.volume = 0.5; // Start at 50% volume
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

      // Ensure we stay within video bounds with a small buffer
      const safeTime = Math.max(0.1, Math.min(targetTime, videoElement.duration - 0.1));

      // Only update if the time actually changed
      if (safeTime !== videoElement.currentTime) {
        videoElement.currentTime = safeTime;
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