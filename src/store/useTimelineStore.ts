import { create } from 'zustand';
import { TimelineData, TimelineTrack, Keyframe } from '@/types';

interface TimelineState {
  timeline: TimelineData;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;

  setTimeline: (timeline: TimelineData) => void;
  setCurrentTime: (time: number) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setPlaybackSpeed: (speed: number) => void;
  addTrack: (track: TimelineTrack) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<TimelineTrack>) => void;
  addKeyframe: (trackId: string, keyframe: Keyframe) => void;
  updateKeyframe: (trackId: string, keyframeId: string, updates: Partial<Keyframe>) => void;
  removeKeyframe: (trackId: string, keyframeId: string) => void;
  setDuration: (duration: number) => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  timeline: { duration: 10, tracks: [] },
  currentTime: 0,
  isPlaying: false,
  playbackSpeed: 1,

  setTimeline: (timeline) => set({ timeline }),

  setCurrentTime: (time) => set({ currentTime: time }),

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  stop: () => set({ currentTime: 0, isPlaying: false }),

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  addTrack: (track) =>
    set((state) => ({
      timeline: { ...state.timeline, tracks: [...state.timeline.tracks, track] },
    })),

  removeTrack: (trackId) =>
    set((state) => ({
      timeline: { ...state.timeline, tracks: state.timeline.tracks.filter((t) => t.id !== trackId) },
    })),

  updateTrack: (trackId, updates) =>
    set((state) => ({
      timeline: {
        ...state.timeline,
        tracks: state.timeline.tracks.map((t) => (t.id === trackId ? { ...t, ...updates } : t)),
      },
    })),

  addKeyframe: (trackId, keyframe) =>
    set((state) => ({
      timeline: {
        ...state.timeline,
        tracks: state.timeline.tracks.map((t) =>
          t.id === trackId ? { ...t, keyframes: [...t.keyframes, keyframe] } : t
        ),
      },
    })),

  updateKeyframe: (trackId, keyframeId, updates) =>
    set((state) => ({
      timeline: {
        ...state.timeline,
        tracks: state.timeline.tracks.map((t) =>
          t.id === trackId
            ? {
                ...t,
                keyframes: t.keyframes.map((k) =>
                  k.id === keyframeId ? { ...k, ...updates } : k
                ),
              }
            : t
        ),
      },
    })),

  removeKeyframe: (trackId, keyframeId) =>
    set((state) => ({
      timeline: {
        ...state.timeline,
        tracks: state.timeline.tracks.map((t) =>
          t.id === trackId
            ? { ...t, keyframes: t.keyframes.filter((k) => k.id !== keyframeId) }
            : t
        ),
      },
    })),

  setDuration: (duration) =>
    set((state) => ({
      timeline: { ...state.timeline, duration },
    })),
}));
