import { useRef, useCallback, useEffect } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';

export function useAnimation() {
  const frameIdRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);

  const tick = useCallback((timestamp: number) => {
    const { isPlaying, timeline, playbackSpeed, setCurrentTime, pause } =
      useTimelineStore.getState();

    if (!isPlaying) return;

    if (lastTimestampRef.current === 0) {
      lastTimestampRef.current = timestamp;
    }

    const delta = (timestamp - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = timestamp;

    const { currentTime } = useTimelineStore.getState();
    const nextTime = currentTime + delta * playbackSpeed;

    if (nextTime >= timeline.duration) {
      setCurrentTime(timeline.duration);
      pause();
    } else {
      setCurrentTime(nextTime);
      frameIdRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const startPlayback = useCallback(() => {
    useTimelineStore.getState().play();
    lastTimestampRef.current = 0;
    frameIdRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopPlayback = useCallback(() => {
    useTimelineStore.getState().pause();
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = 0;
    }
    lastTimestampRef.current = 0;
  }, []);

  const seekTo = useCallback((time: number) => {
    useTimelineStore.getState().setCurrentTime(time);
  }, []);

  useEffect(() => {
    const unsubscribe = useTimelineStore.subscribe((state, prevState) => {
      if (state.isPlaying && !prevState.isPlaying) {
        lastTimestampRef.current = 0;
        frameIdRef.current = requestAnimationFrame(tick);
      }
      if (!state.isPlaying && prevState.isPlaying) {
        if (frameIdRef.current) {
          cancelAnimationFrame(frameIdRef.current);
          frameIdRef.current = 0;
        }
        lastTimestampRef.current = 0;
      }
    });

    return () => {
      unsubscribe();
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [tick]);

  return { startPlayback, stopPlayback, seekTo };
}
