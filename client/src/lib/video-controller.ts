let videoElement: HTMLVideoElement | null = null;

export function setVideoElement(element: HTMLVideoElement) {
  videoElement = element;
}

export function controlVideo(motion: { dx: number; dy: number }) {
  if (!videoElement) return;

  const MOTION_THRESHOLD = 0.1;
  const SPEED_FACTOR = 3;
  const VOLUME_FACTOR = 0.5;

  // Horizontal motion controls playback speed
  if (Math.abs(motion.dx) > MOTION_THRESHOLD) {
    // Scale motion to playback rate (1 is normal speed)
    const speed = 1 + (Math.abs(motion.dx) * SPEED_FACTOR);
    videoElement.playbackRate = Math.min(speed, 4.0); // Cap at 4x speed

    if (videoElement.paused) {
      videoElement.play().catch(err => console.error('Error playing video:', err));
    }
  } else {
    videoElement.playbackRate = 1;
    if (!videoElement.paused) {
      videoElement.pause();
    }
  }

  // Vertical motion controls volume
  if (Math.abs(motion.dy) > MOTION_THRESHOLD) {
    // Current volume + scaled motion (inverted so up increases volume)
    const newVolume = videoElement.volume - (motion.dy * VOLUME_FACTOR);
    videoElement.volume = Math.max(0, Math.min(1, newVolume));
  }
}