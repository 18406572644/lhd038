import { useRef, useCallback } from 'react';
import { Group, ActionIcon, Text, Select } from '@mantine/core';
import { Play, Pause, SkipBack, Square } from 'lucide-react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useAnimation } from '@/hooks/useAnimation';
import { NEON_PINK, ELECTRIC_BLUE, DEEP_BLACK, DARK_GRAY, withAlpha } from '@/utils/colors';

const speedOptions = [
  { value: '0.5', label: '0.5x' },
  { value: '1', label: '1x' },
  { value: '1.5', label: '1.5x' },
  { value: '2', label: '2x' },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PlaybackControls() {
  const currentTime = useTimelineStore((s) => s.currentTime);
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const playbackSpeed = useTimelineStore((s) => s.playbackSpeed);
  const timeline = useTimelineStore((s) => s.timeline);
  const play = useTimelineStore((s) => s.play);
  const pause = useTimelineStore((s) => s.pause);
  const stop = useTimelineStore((s) => s.stop);
  const setCurrentTime = useTimelineStore((s) => s.setCurrentTime);
  const setPlaybackSpeed = useTimelineStore((s) => s.setPlaybackSpeed);

  const { startPlayback, stopPlayback, seekTo } = useAnimation();

  const progressRef = useRef<HTMLDivElement>(null);
  const isSeekingRef = useRef(false);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
      stopPlayback();
    } else {
      play();
      startPlayback();
    }
  };

  const handleStop = () => {
    stop();
    stopPlayback();
  };

  const handleSkipBack = () => {
    setCurrentTime(0);
    seekTo(0);
  };

  const handleProgressClick = useCallback(
    (e: React.MouseEvent) => {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      const newTime = ratio * timeline.duration;
      setCurrentTime(newTime);
      seekTo(newTime);
    },
    [timeline.duration, setCurrentTime, seekTo]
  );

  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isSeekingRef.current = true;
      handleProgressClick(e);

      const handleMouseMove = (e: MouseEvent) => {
        if (!isSeekingRef.current || !progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, x / rect.width));
        const newTime = ratio * timeline.duration;
        setCurrentTime(newTime);
      };

      const handleMouseUp = () => {
        isSeekingRef.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [timeline.duration, setCurrentTime, handleProgressClick]
  );

  const handleSpeedChange = (value: string | null) => {
    if (value) {
      setPlaybackSpeed(parseFloat(value));
    }
  };

  const progressPercent = timeline.duration > 0 ? (currentTime / timeline.duration) * 100 : 0;

  const iconButtonStyle = (color: string) => ({
    backgroundColor: 'transparent',
    color: '#C0C0D0',
    border: `1px solid ${withAlpha(color, 0.3)}`,
    transition: 'all 0.2s ease',
  });

  const hoverStyle = (color: string) => ({
    backgroundColor: `${color}20`,
    color: color,
    borderColor: `${color}80`,
    boxShadow: `0 0 10px ${color}40`,
  });

  return (
    <div
      style={{
        backgroundColor: withAlpha(DEEP_BLACK, 0.95),
        borderTop: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.2)}`,
        padding: '10px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div
        ref={progressRef}
        onMouseDown={handleProgressMouseDown}
        style={{
          height: '6px',
          backgroundColor: withAlpha(DARK_GRAY, 0.8),
          borderRadius: '3px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, ${NEON_PINK}, ${ELECTRIC_BLUE})`,
            borderRadius: '3px',
            boxShadow: `0 0 8px ${NEON_PINK}60`,
            transition: isSeekingRef.current ? 'none' : 'width 0.05s linear',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${progressPercent}%`,
            transform: 'translate(-50%, -50%)',
            width: '12px',
            height: '12px',
            backgroundColor: NEON_PINK,
            borderRadius: '50%',
            boxShadow: `0 0 8px ${NEON_PINK}, 0 0 16px ${NEON_PINK}60`,
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ width: '100px' }}>
          <Text
            style={{
              color: '#B0B0C0',
              fontSize: '13px',
              fontFamily: 'monospace',
            }}
          >
            {formatTime(currentTime)} / {formatTime(timeline.duration)}
          </Text>
        </div>

        <Group gap={8}>
          <ActionIcon
            size={32}
            variant="outline"
            onClick={handleSkipBack}
            style={iconButtonStyle(ELECTRIC_BLUE)}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, hoverStyle(ELECTRIC_BLUE));
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, iconButtonStyle(ELECTRIC_BLUE));
            }}
          >
            <SkipBack size={16} />
          </ActionIcon>

          <ActionIcon
            size={44}
            variant="filled"
            onClick={handlePlayPause}
            style={{
              backgroundColor: withAlpha(NEON_PINK, 0.15),
              color: NEON_PINK,
              border: `2px solid ${NEON_PINK}`,
              boxShadow: `0 0 12px ${withAlpha(NEON_PINK, 0.4)}, inset 0 0 8px ${withAlpha(NEON_PINK, 0.2)}`,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = withAlpha(NEON_PINK, 0.25);
              e.currentTarget.style.boxShadow = `0 0 20px ${withAlpha(NEON_PINK, 0.6)}, inset 0 0 12px ${withAlpha(NEON_PINK, 0.3)}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = withAlpha(NEON_PINK, 0.15);
              e.currentTarget.style.boxShadow = `0 0 12px ${withAlpha(NEON_PINK, 0.4)}, inset 0 0 8px ${withAlpha(NEON_PINK, 0.2)}`;
            }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
          </ActionIcon>

          <ActionIcon
            size={32}
            variant="outline"
            onClick={handleStop}
            style={iconButtonStyle(ELECTRIC_BLUE)}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, hoverStyle(ELECTRIC_BLUE));
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, iconButtonStyle(ELECTRIC_BLUE));
            }}
          >
            <Square size={14} />
          </ActionIcon>
        </Group>

        <div style={{ width: '100px', display: 'flex', justifyContent: 'flex-end' }}>
          <Select
            value={playbackSpeed.toString()}
            onChange={handleSpeedChange}
            data={speedOptions}
            size="xs"
            style={{ width: '70px' }}
            styles={{
              input: {
                backgroundColor: DARK_GRAY,
                borderColor: withAlpha(ELECTRIC_BLUE, 0.3),
                color: '#E0E0E0',
                fontSize: '12px',
                minHeight: '28px',
                '&:focus': {
                  borderColor: NEON_PINK,
                },
              },
              dropdown: {
                backgroundColor: '#1A0A2E',
                borderColor: withAlpha(ELECTRIC_BLUE, 0.3),
              },
              option: {
                color: '#E0E0E0',
                backgroundColor: 'transparent',
                fontSize: '12px',
                '&[data-hovered]': {
                  backgroundColor: withAlpha(NEON_PINK, 0.2),
                  color: NEON_PINK,
                },
                '&[data-combobox-active-option]': {
                  backgroundColor: withAlpha(NEON_PINK, 0.3),
                  color: NEON_PINK,
                },
                _hover: {
                  backgroundColor: withAlpha(NEON_PINK, 0.2),
                  color: NEON_PINK,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
