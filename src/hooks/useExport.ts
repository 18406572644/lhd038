import { useRef, useState, useCallback } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';

function findMainCanvas(): HTMLCanvasElement | null {
  return document.querySelector('canvas[data-city-canvas]') || document.querySelector('canvas');
}

export function useExport(canvasRefArg?: React.RefObject<HTMLCanvasElement>) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const isExportingRef = useRef(false);

  const getCanvas = useCallback((): HTMLCanvasElement | null => {
    if (canvasRefArg?.current) return canvasRefArg.current;
    return findMainCanvas();
  }, [canvasRefArg]);

  const exportVideo = useCallback(async (): Promise<string> => {
    const canvas = getCanvas();
    if (!canvas) throw new Error('Canvas not available');

    const { timeline, play, pause, setCurrentTime, setPlaybackSpeed } =
      useTimelineStore.getState();
    const duration = timeline.duration;

    setIsExporting(true);
    isExportingRef.current = true;
    setProgress(0);

    setPlaybackSpeed(1);
    setCurrentTime(0);

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: getSupportedMimeType(),
      videoBitsPerSecond: 5000000,
    });

    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    return new Promise<string>((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const mimeType = getSupportedMimeType();
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setIsExporting(false);
        isExportingRef.current = false;
        setProgress(100);
        resolve(url);
      };

      mediaRecorder.onerror = () => {
        setIsExporting(false);
        isExportingRef.current = false;
        setProgress(0);
        reject(new Error('MediaRecorder error'));
      };

      mediaRecorder.start(100);
      play();

      const progressInterval = setInterval(() => {
        if (!isExportingRef.current) {
          clearInterval(progressInterval);
          return;
        }
        const { currentTime } = useTimelineStore.getState();
        const pct = Math.min((currentTime / duration) * 100, 100);
        setProgress(pct);
      }, 100);

      const checkDone = setInterval(() => {
        if (!isExportingRef.current) {
          clearInterval(checkDone);
          clearInterval(progressInterval);
          return;
        }
        const { currentTime } = useTimelineStore.getState();
        if (currentTime >= duration) {
          clearInterval(checkDone);
          clearInterval(progressInterval);
          pause();
          mediaRecorder.stop();
        }
      }, 50);
    });
  }, [getCanvas]);

  const exportGif = useCallback(async (): Promise<string> => {
    const canvas = getCanvas();
    if (!canvas) throw new Error('Canvas not available');

    const { timeline, pause, setCurrentTime } = useTimelineStore.getState();
    const duration = timeline.duration;
    const fps = 15;
    const totalFrames = Math.floor(duration * fps);

    setIsExporting(true);
    isExportingRef.current = true;
    setProgress(0);

    pause();

    const stream = canvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: getSupportedMimeType(),
      videoBitsPerSecond: 1500000,
    });

    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    return new Promise<string>((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const mimeType = getSupportedMimeType();
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setIsExporting(false);
        isExportingRef.current = false;
        setProgress(100);
        resolve(url);
      };

      mediaRecorder.onerror = () => {
        setIsExporting(false);
        isExportingRef.current = false;
        setProgress(0);
        reject(new Error('MediaRecorder error'));
      };

      mediaRecorder.start(100);

      let frameIndex = 0;

      const advanceFrame = () => {
        if (!isExportingRef.current) return;

        if (frameIndex >= totalFrames) {
          mediaRecorder.stop();
          pause();
          return;
        }

        setCurrentTime(frameIndex / fps);
        setProgress(Math.min((frameIndex / totalFrames) * 100, 100));
        frameIndex++;
        setTimeout(advanceFrame, 1000 / fps);
      };

      setCurrentTime(0);
      setTimeout(advanceFrame, 100);
    });
  }, [getCanvas]);

  return { exportVideo, exportGif, isExporting, progress };
}

function getSupportedMimeType(): string {
  const types = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return 'video/webm';
}
