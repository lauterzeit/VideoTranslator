let videoElement: HTMLVideoElement | null = null;

export function setVideoElement(element: HTMLVideoElement) {
  videoElement = element;
}

export function controlVideo(motion: { dx: number; dy: number }) {
  if (!videoElement) return;

  // Horizontal motion controls playback speed
  const speed = Math.abs(motion.dx) > 0.1 
    ? 1 + Math.min(Math.abs(motion.dx) * 2, 2) 
    : 1;
  
  videoElement.playbackRate = speed;

  // Vertical motion controls volume
  if (Math.abs(motion.dy) > 0.1) {
    const volume = Math.max(0, Math.min(1, videoElement.volume - motion.dy));
    videoElement.volume = volume;
  }

  // Play/pause based on overall motion
  if (Math.abs(motion.dx) + Math.abs(motion.dy) > 0.5) {
    if (videoElement.paused) {
      videoElement.play();
    }
  } else {
    if (!videoElement.paused) {
      videoElement.pause();
    }
  }
}
