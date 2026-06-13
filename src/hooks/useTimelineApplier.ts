import { useEffect, useRef } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useDesignStore } from '@/store/useDesignStore';
import { Keyframe, LightConfig, LightGroup } from '@/types';
import { lerpColor } from '@/utils/colors';

function interpolateKeyframes(
  keyframes: Keyframe[],
  currentTime: number
): Partial<Keyframe> | null {
  if (keyframes.length === 0) return null;

  for (let i = 0; i < keyframes.length; i++) {
    const kf = keyframes[i];
    if (currentTime < kf.startTime) {
      if (i === 0) return { color: kf.color, animation: kf.animation, speed: kf.speed, intensity: kf.intensity, delay: kf.delay, overrideMode: kf.overrideMode };
      const prevKf = keyframes[i - 1];
      const progress = (currentTime - prevKf.endTime) / (kf.startTime - prevKf.endTime);
      const clampedProgress = Math.max(0, Math.min(1, progress));
      return {
        color: lerpColor(prevKf.color, kf.color, clampedProgress),
        animation: clampedProgress > 0.5 ? kf.animation : prevKf.animation,
        speed: prevKf.speed + (kf.speed - prevKf.speed) * clampedProgress,
        intensity: prevKf.intensity + (kf.intensity - prevKf.intensity) * clampedProgress,
        delay: (prevKf.delay || 0) + ((kf.delay || 0) - (prevKf.delay || 0)) * clampedProgress,
        overrideMode: clampedProgress > 0.5 ? kf.overrideMode : prevKf.overrideMode,
      };
    }
    if (currentTime >= kf.startTime && currentTime <= kf.endTime) {
      return { color: kf.color, animation: kf.animation, speed: kf.speed, intensity: kf.intensity, delay: kf.delay, overrideMode: kf.overrideMode };
    }
  }

  const lastKf = keyframes[keyframes.length - 1];
  return { color: lastKf.color, animation: lastKf.animation, speed: lastKf.speed, intensity: lastKf.intensity, delay: lastKf.delay, overrideMode: lastKf.overrideMode };
}

function applyGroupParams(
  baseLight: LightConfig,
  groupParams: Partial<Keyframe>,
  group: LightGroup,
  buildingIndex: number
): Partial<LightConfig> {
  const mode = groupParams.overrideMode || group.overrideMode;
  const result: Partial<LightConfig> = {};

  if (mode === 'replace') {
    if (groupParams.color !== undefined) result.color = groupParams.color;
    if (groupParams.animation !== undefined) result.animation = groupParams.animation;
    if (groupParams.speed !== undefined) result.speed = groupParams.speed;
    if (groupParams.intensity !== undefined) result.intensity = groupParams.intensity;
  } else if (mode === 'multiply') {
    if (groupParams.color !== undefined) result.color = groupParams.color;
    if (groupParams.animation !== undefined) result.animation = groupParams.animation;
    if (groupParams.speed !== undefined) result.speed = baseLight.speed * groupParams.speed;
    if (groupParams.intensity !== undefined) result.intensity = baseLight.intensity * groupParams.intensity;
  } else if (mode === 'offset') {
    if (groupParams.color !== undefined) result.color = groupParams.color;
    if (groupParams.animation !== undefined) result.animation = groupParams.animation;
    if (groupParams.speed !== undefined) result.speed = baseLight.speed * groupParams.speed;
    if (groupParams.intensity !== undefined) result.intensity = baseLight.intensity * groupParams.intensity;
    const delayPerBuilding = groupParams.delay !== undefined ? groupParams.delay : group.delay;
    result.delay = baseLight.delay + buildingIndex * delayPerBuilding;
  }

  return result;
}

export function useTimelineApplier() {
  const appliedRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const unsubscribe = useTimelineStore.subscribe((state) => {
      const { currentTime, timeline } = state;
      const { groups, updateLight, addLight, lights, lightGroups } = useDesignStore.getState();

      for (const track of timeline.tracks) {
        const keyframeState = interpolateKeyframes(track.keyframes, currentTime);
        if (!keyframeState) continue;

        if (track.lightGroupId) {
          const lightGroup = lightGroups.find((g) => g.id === track.lightGroupId);
          if (!lightGroup) continue;

          lightGroup.buildingIds.forEach((buildingId, index) => {
            const existingLight = lights.find((l) => l.buildingId === buildingId);
            const cacheKey = `${track.lightGroupId}-${buildingId}`;
            const mode = keyframeState.overrideMode || lightGroup.overrideMode;
            const appliedValue = `${mode}-${keyframeState.color}-${keyframeState.animation}-${keyframeState.speed}-${keyframeState.intensity}-${keyframeState.delay}-${index}`;

            if (appliedRef.current.get(cacheKey) === appliedValue) return;
            appliedRef.current.set(cacheKey, appliedValue);

            if (existingLight) {
              const updates = applyGroupParams(existingLight, keyframeState, lightGroup, index);
              updateLight(existingLight.id, updates);
            } else {
              const baseLight: LightConfig = {
                id: crypto.randomUUID(),
                buildingId,
                color: lightGroup.color,
                animation: lightGroup.animation,
                speed: lightGroup.speed,
                intensity: lightGroup.intensity,
                delay: lightGroup.delay,
              };
              const updates = applyGroupParams(baseLight, keyframeState, lightGroup, index);
              addLight({ ...baseLight, ...updates });
            }
          });
        } else if (track.groupId) {
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
