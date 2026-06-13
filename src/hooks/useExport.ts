import { useRef, useState, useCallback } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import GIF from 'gif.js';

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
      let isCompleted = false;

      mediaRecorder.onstop = () => {
        const mimeType = getSupportedMimeType();
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setProgress(100);
        setIsExporting(false);
        isExportingRef.current = false;
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
        if (!isExportingRef.current || isCompleted) {
          clearInterval(progressInterval);
          return;
        }
        const { currentTime } = useTimelineStore.getState();
        const pct = Math.min((currentTime / duration) * 100, 99.9);
        setProgress(pct);
      }, 100);

      const checkDone = setInterval(() => {
        if (!isExportingRef.current || isCompleted) {
          clearInterval(checkDone);
          clearInterval(progressInterval);
          return;
        }
        const { currentTime } = useTimelineStore.getState();
        if (currentTime >= duration) {
          isCompleted = true;
          clearInterval(checkDone);
          clearInterval(progressInterval);
          setProgress(100);
          pause();
          setTimeout(() => {
            mediaRecorder.stop();
          }, 200);
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
    const delay = Math.round(1000 / fps);

    setIsExporting(true);
    isExportingRef.current = true;
    setProgress(0);

    pause();
    setCurrentTime(0);

    return new Promise<string>((resolve, reject) => {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: '/gif.worker.js',
        width: canvas.width,
        height: canvas.height,
      });

      let frameIndex = 0;
      let isCancelled = false;

      const checkCancelled = () => !isExportingRef.current || isCancelled;

      const addNextFrame = () => {
        if (checkCancelled()) {
          gif.abort();
          setIsExporting(false);
          setProgress(0);
          reject(new Error('Export cancelled'));
          return;
        }

        if (frameIndex >= totalFrames) {
          setProgress(90);
          gif.on('finished', (blob: Blob) => {
            const url = URL.createObjectURL(blob);
            setProgress(100);
            setIsExporting(false);
            isExportingRef.current = false;
            resolve(url);
          });
          gif.render();
          return;
        }

        setCurrentTime(frameIndex / fps);
        setProgress(Math.min((frameIndex / totalFrames) * 85, 85));

        setTimeout(() => {
          try {
            gif.addFrame(canvas, { delay, copy: true });
            frameIndex++;
            requestAnimationFrame(addNextFrame);
          } catch (e) {
            setIsExporting(false);
            isExportingRef.current = false;
            setProgress(0);
            reject(e);
          }
        }, 16);
      };

      setTimeout(addNextFrame, 200);
    });
  }, [getCanvas]);

  const cancelExport = useCallback(() => {
    isExportingRef.current = false;
    setIsExporting(false);
    setProgress(0);
  }, []);

  return { exportVideo, exportGif, cancelExport, isExporting, progress };
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
