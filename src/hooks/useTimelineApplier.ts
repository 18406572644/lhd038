import { useEffect, useRef } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useDesignStore } from '@/store/useDesignStore';
import { Keyframe } from '@/types';

function interpolateKeyframes(
  keyframes: Keyframe[],
  currentTime: number
): Partial<Keyframe> | null {
  if (keyframes.length === 0) return null;

  for (let i = 0; i < keyframes.length; i++) {
    const kf = keyframes[i];
    if (currentTime < kf.startTime) {
      if (i === 0) return { color: kf.color, animation: kf.animation, speed: kf.speed, intensity: kf.intensity };
      const prevKf = keyframes[i - 1];
      const progress = (currentTime - prevKf.endTime) / (kf.startTime - prevKf.endTime);
      const clampedProgress = Math.max(0, Math.min(1, progress));
      return {
        color: kf.color,
        animation: clampedProgress > 0.5 ? kf.animation : prevKf.animation,
        speed: prevKf.speed + (kf.speed - prevKf.speed) * clampedProgress,
        intensity: prevKf.intensity + (kf.intensity - prevKf.intensity) * clampedProgress,
      };
    }
    if (currentTime >= kf.startTime && currentTime <= kf.endTime) {
      return { color: kf.color, animation: kf.animation, speed: kf.speed, intensity: kf.intensity };
    }
  }

  const lastKf = keyframes[keyframes.length - 1];
  return { color: lastKf.color, animation: lastKf.animation, speed: lastKf.speed, intensity: lastKf.intensity };
}

export function useTimelineApplier() {
  const appliedRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const unsubscribe = useTimelineStore.subscribe((state) => {
      const { currentTime, timeline } = state;
      const { groups, updateLight, addLight, lights } = useDesignStore.getState();

      for (const track of timeline.tracks) {
        const keyframeState = interpolateKeyframes(track.keyframes, currentTime);
        if (!keyframeState) continue;

        if (track.groupId) {
          const group = groups.find((g) => g.id === track.groupId);
          if (!group) continue;

          for (const buildingId of group.childBuildingIds) {
            const existingLight = lights.find((l) => l.buildingId === buildingId);
            const cacheKey = `${track.groupId}-${buildingId}`;
            const appliedValue = `${keyframeState.color}-${keyframeState.animation}-${keyframeState.speed}-${keyframeState.intensity}`;

            if (appliedRef.current.get(cacheKey) === appliedValue) continue;
            appliedRef.current.set(cacheKey, appliedValue);

            if (existingLight) {
              updateLight(existingLight.id, {
                color: keyframeState.color,
                animation: keyframeState.animation,
                speed: keyframeState.speed,
                intensity: keyframeState.intensity,
              });
            } else {
              addLight({
                id: crypto.randomUUID(),
                buildingId,
                color: keyframeState.color || '#FF2E97',
                animation: keyframeState.animation || 'breathe',
                speed: keyframeState.speed ?? 1,
                intensity: keyframeState.intensity ?? 0.8,
                delay: 0,
              });
            }
          }
        } else if (track.buildingId) {
          const cacheKey = track.buildingId;
          const appliedValue = `${keyframeState.color}-${keyframeState.animation}-${keyframeState.speed}-${keyframeState.intensity}`;

          if (appliedRef.current.get(cacheKey) === appliedValue) continue;
          appliedRef.current.set(cacheKey, appliedValue);

          const existingLight = lights.find((l) => l.buildingId === track.buildingId);
          if (existingLight) {
            updateLight(existingLight.id, {
              color: keyframeState.color,
              animation: keyframeState.animation,
              speed: keyframeState.speed,
              intensity: keyframeState.intensity,
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);
}
