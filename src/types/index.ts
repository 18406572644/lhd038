export type BuildingType = 'office' | 'residential' | 'tower' | 'bridge';
export type WindowPattern = 'grid' | 'random' | 'strip';
export type AnimationType = 'breathe' | 'chase' | 'blink' | 'gradient' | 'rainbow';
export type OverrideMode = 'replace' | 'multiply' | 'offset';

export interface Building {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  width: number;
  height: number;
  windowDensity: number;
  windowPattern: WindowPattern;
  groupId?: string;
}

export interface BuildingGroup {
  id: string;
  name: string;
  childBuildingIds: string[];
  pivotX: number;
  pivotY: number;
  locked: boolean;
}

export interface LightConfig {
  id: string;
  buildingId: string;
  color: string;
  animation: AnimationType;
  speed: number;
  intensity: number;
  delay: number;
}

export interface LightGroup {
  id: string;
  name: string;
  buildingIds: string[];
  color: string;
  animation: AnimationType;
  overrideMode: OverrideMode;
  speed: number;
  intensity: number;
  delay: number;
}

export interface Keyframe {
  id: string;
  startTime: number;
  endTime: number;
  color: string;
  animation: AnimationType;
  speed: number;
  intensity: number;
  delay?: number;
  overrideMode?: OverrideMode;
}

export interface TimelineTrack {
  id: string;
  buildingId?: string;
  groupId?: string;
  lightGroupId?: string;
  lightId: string;
  label: string;
  keyframes: Keyframe[];
}

export interface TimelineData {
  duration: number;
  tracks: TimelineTrack[];
}

export interface LightShowTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  tags: string[];
  buildings: Building[];
  groups: BuildingGroup[];
  lights: LightConfig[];
  lightGroups: LightGroup[];
  timeline: TimelineData;
  createdAt: string;
}

export interface UserDesign {
  id: string;
  name: string;
  buildings: Building[];
  groups: BuildingGroup[];
  lights: LightConfig[];
  lightGroups: LightGroup[];
  timeline: TimelineData;
  updatedAt: string;
  createdAt: string;
}
