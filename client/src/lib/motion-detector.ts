export function detectMotion(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  sensitivity: number
): { dx: number; dy: number } {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dx: 0, dy: 0 };

  // Draw current video frame
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Store previous frame if it exists
  const prevFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  let motionX = 0;
  let motionY = 0;
  let motionPoints = 0;

  // Compare pixels between frames
  for (let i = 0; i < frame.data.length; i += 4) {
    const rdiff = Math.abs(frame.data[i] - prevFrame.data[i]);
    const gdiff = Math.abs(frame.data[i + 1] - prevFrame.data[i + 1]);
    const bdiff = Math.abs(frame.data[i + 2] - prevFrame.data[i + 2]);
    
    if ((rdiff + gdiff + bdiff) / 3 > sensitivity) {
      const x = (i / 4) % canvas.width;
      const y = Math.floor((i / 4) / canvas.width);
      
      motionX += x - canvas.width / 2;
      motionY += y - canvas.height / 2;
      motionPoints++;
    }
  }

  if (motionPoints > 0) {
    return {
      dx: motionX / motionPoints / canvas.width,
      dy: motionY / motionPoints / canvas.height
    };
  }

  return { dx: 0, dy: 0 };
}
