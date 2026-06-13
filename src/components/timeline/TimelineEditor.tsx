import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Text, Button, Group, Menu } from '@mantine/core';
import { Plus, ChevronDown } from 'lucide-react';
import TrackRow from './TrackRow';
import PlaybackControls from './PlaybackControls';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useDesignStore } from '@/store/useDesignStore';
import { NEON_PINK, ELECTRIC_BLUE, DEEP_BLACK, DARK_PURPLE, withAlpha, NEON_YELLOW } from '@/utils/colors';
import { TimelineTrack, AnimationType, Keyframe } from '@/types';

interface TimelineEditorProps {
  height?: number;
  onResize?: (height: number) => void;
}

export default function TimelineEditor({ height = 280, onResize }: TimelineEditorProps) {
  const currentTime = useTimelineStore((s) => s.currentTime);
  const timeline = useTimelineStore((s) => s.timeline);
  const addTrack = useTimelineStore((s) => s.addTrack);
  const updateKeyframe = useTimelineStore((s) => s.updateKeyframe);
  const lightGroups = useDesignStore((s) => s.lightGroups);

  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null);
  const [editorHeight, setEditorHeight] = useState(height);
  const [isResizing, setIsResizing] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  const tracksContainerRef = useRef<HTMLDivElement>(null);
  const trackAreaRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const pixelsPerSecond = 60;
  const trackWidth = Math.max(timeline.duration * pixelsPerSecond, 800);

  const timeMarks = useMemo(() => {
    const marks: number[] = [];
    const step = timeline.duration <= 10 ? 1 : timeline.duration <= 30 ? 2 : 5;
    for (let i = 0; i <= timeline.duration; i += step) {
      marks.push(i);
    }
    return marks;
  }, [timeline.duration]);

  const playheadLeft = (currentTime / timeline.duration) * trackWidth;

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = editorHeight;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [editorHeight]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const deltaY = startYRef.current - e.clientY;
      const newHeight = Math.max(120, Math.min(600, startHeightRef.current + deltaY));
      setEditorHeight(newHeight);
      onResize?.(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onResize]);

  const handleSelectKeyframe = (keyframeId: string | null) => {
    setSelectedKeyframeId(keyframeId);
  };

  const handleDragKeyframe = (trackId: string, keyframeId: string, newStartTime: number) => {
    const track = timeline.tracks.find((t) => t.id === trackId);
    if (!track) return;
    const keyframe = track.keyframes.find((k) => k.id === keyframeId);
    if (!keyframe) return;
    const duration = keyframe.endTime - keyframe.startTime;
    updateKeyframe(trackId, keyframeId, {
      startTime: newStartTime,
      endTime: newStartTime + duration,
    });
  };

  const createDefaultKeyframes = (): Keyframe[] => [
    {
      id: crypto.randomUUID(),
      startTime: 0,
      endTime: 2,
      color: NEON_PINK,
      animation: 'breathe' as AnimationType,
      speed: 1,
      intensity: 1,
    },
    {
      id: crypto.randomUUID(),
      startTime: 4,
      endTime: 6,
      color: ELECTRIC_BLUE,
      animation: 'chase' as AnimationType,
      speed: 1.5,
      intensity: 0.8,
    },
  ];

  const handleAddBuildingTrack = () => {
    const newTrack: TimelineTrack = {
      id: crypto.randomUUID(),
      buildingId: '',
      lightId: '',
      label: `建筑轨道 ${timeline.tracks.length + 1}`,
      keyframes: createDefaultKeyframes(),
    };
    addTrack(newTrack);
    setMenuOpened(false);
  };

  const handleAddGroupTrack = () => {
    const newTrack: TimelineTrack = {
      id: crypto.randomUUID(),
      groupId: '',
      lightId: '',
      label: `群组轨道 ${timeline.tracks.length + 1}`,
      keyframes: createDefaultKeyframes(),
    };
    addTrack(newTrack);
    setMenuOpened(false);
  };

  const handleAddLightGroupTrack = () => {
    if (lightGroups.length === 0) return;
    const lightGroup = lightGroups[0];
    const newTrack: TimelineTrack = {
      id: crypto.randomUUID(),
      lightGroupId: lightGroup.id,
      lightId: '',
      label: `${lightGroup.name}`,
      keyframes: [
        {
          id: crypto.randomUUID(),
          startTime: 0,
          endTime: 3,
          color: lightGroup.color,
          animation: lightGroup.animation,
          speed: lightGroup.speed,
          intensity: lightGroup.intensity,
          delay: lightGroup.delay,
          overrideMode: lightGroup.overrideMode,
        },
      ],
    };
    addTrack(newTrack);
    setMenuOpened(false);
  };

  const handleAddLightGroupTrackForSpecific = (lightGroupId: string) => {
    const lightGroup = lightGroups.find((g) => g.id === lightGroupId);
    if (!lightGroup) return;
    const newTrack: TimelineTrack = {
      id: crypto.randomUUID(),
      lightGroupId: lightGroup.id,
      lightId: '',
      label: `${lightGroup.name}`,
      keyframes: [
        {
          id: crypto.randomUUID(),
          startTime: 0,
          endTime: 3,
          color: lightGroup.color,
          animation: lightGroup.animation,
          speed: lightGroup.speed,
          intensity: lightGroup.intensity,
          delay: lightGroup.delay,
          overrideMode: lightGroup.overrideMode,
        },
      ],
    };
    addTrack(newTrack);
    setMenuOpened(false);
  };

  const rulerHeight = 28;
  const controlsHeight = 80;
  const tracksHeight = editorHeight - rulerHeight - controlsHeight - 50;

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: withAlpha(DEEP_BLACK, 0.98),
        borderTop: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.25)}`,
        height: `${editorHeight}px`,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: `0 -4px 20px ${withAlpha(ELECTRIC_BLUE, 0.1)}, inset 0 1px 0 ${withAlpha(ELECTRIC_BLUE, 0.1)}`,
      }}
    >
      <div
        onMouseDown={handleResizeStart}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          cursor: 'ns-resize',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '3px',
            backgroundColor: withAlpha(ELECTRIC_BLUE, 0.4),
            borderRadius: '2px',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px 4px 16px',
          borderBottom: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.1)}`,
        }}
      >
        <Group gap={12}>
          <Text
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '14px',
              fontWeight: 700,
              color: NEON_PINK,
              textShadow: `0 0 6px ${withAlpha(NEON_PINK, 0.5)}`,
              letterSpacing: '0.05em',
            }}
          >
            时间线
          </Text>
          <Text
            style={{
              fontSize: '12px',
              color: '#808090',
            }}
          >
            时长: {timeline.duration.toFixed(1)}s
          </Text>
        </Group>

        <Menu
          opened={menuOpened}
          onChange={setMenuOpened}
          position="top-end"
          withinPortal
          shadow="xl"
        >
          <Menu.Target>
            <Button
              size="xs"
              variant="outline"
              leftSection={<Plus size={14} />}
              rightSection={<ChevronDown size={12} />}
              style={{
                borderColor: withAlpha(NEON_PINK, 0.5),
                color: NEON_PINK,
                backgroundColor: withAlpha(NEON_PINK, 0.08),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = withAlpha(NEON_PINK, 0.15);
                e.currentTarget.style.boxShadow = `0 0 10px ${withAlpha(NEON_PINK, 0.3)}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = withAlpha(NEON_PINK, 0.08);
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              添加轨道
            </Button>
          </Menu.Target>
          <Menu.Dropdown
            style={{
              backgroundColor: '#0A0A14',
              borderColor: 'rgba(0, 240, 255, 0.3)',
              minWidth: 200,
            }}
          >
            <Menu.Item
              onClick={handleAddBuildingTrack}
              leftSection={<div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ELECTRIC_BLUE }} />}
            >
              <Text size="sm">建筑轨道</Text>
              <Text size="xs" c="dimmed">控制单栋建筑灯光</Text>
            </Menu.Item>
            <Menu.Item
              onClick={handleAddGroupTrack}
              leftSection={<div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: NEON_YELLOW }} />}
            >
              <Text size="sm">群组轨道</Text>
              <Text size="xs" c="dimmed">控制建筑组（空间组）</Text>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Label c={NEON_PINK}>灯光群组轨道</Menu.Label>
            {lightGroups.length === 0 ? (
              <Menu.Item disabled>
                <Text size="xs" c="dimmed">请先创建灯光分组</Text>
              </Menu.Item>
            ) : (
              lightGroups.map((lg) => (
                <Menu.Item
                  key={lg.id}
                  onClick={() => handleAddLightGroupTrackForSpecific(lg.id)}
                  leftSection={
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: lg.color,
                        boxShadow: `0 0 6px ${lg.color}`,
                      }}
                    />
                  }
                >
                  <Text size="sm">{lg.name}</Text>
                  <Text size="xs" c="dimmed">
                    {lg.buildingIds.length} 栋 · {lg.overrideMode === 'replace' ? '替换' : lg.overrideMode === 'multiply' ? '乘法' : '偏移'}
                  </Text>
                </Menu.Item>
              ))
            )}
            {lightGroups.length > 0 && (
              <>
                <Menu.Divider />
                <Menu.Item
                  onClick={handleAddLightGroupTrack}
                  leftSection={<Plus size={14} style={{ color: NEON_PINK }} />}
                >
                  <Text size="sm" c={NEON_PINK}>新建灯光群组轨道</Text>
                </Menu.Item>
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      </div>

      <div
        style={{
          position: 'relative',
          height: `${rulerHeight}px`,
          borderBottom: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.15)}`,
          backgroundColor: withAlpha(DARK_PURPLE, 0.5),
        }}
      >
        <div
          style={{
            width: '180px',
            minWidth: '180px',
            height: '100%',
            float: 'left',
            borderRight: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.15)}`,
          }}
        />
        <div
          ref={trackAreaRef}
          style={{
            position: 'relative',
            marginLeft: '180px',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: `${trackWidth}px`,
              height: '100%',
            }}
          >
            {timeMarks.map((time) => (
              <div
                key={time}
                style={{
                  position: 'absolute',
                  left: `${(time / timeline.duration) * trackWidth}px`,
                  top: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '1px',
                    height: '8px',
                    backgroundColor: withAlpha(ELECTRIC_BLUE, 0.3),
                    marginTop: '4px',
                  }}
                />
                <Text
                  style={{
                    fontSize: '10px',
                    color: '#707080',
                    marginTop: '2px',
                    fontFamily: 'monospace',
                  }}
                >
                  {time}s
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={tracksContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          scrollbarWidth: 'thin',
        }}
      >
        <div
          style={{
            position: 'relative',
            minHeight: `${tracksHeight}px`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '180px',
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${playheadLeft}px`,
                width: '2px',
                backgroundColor: NEON_PINK,
                boxShadow: `0 0 8px ${NEON_PINK}, 0 0 16px ${withAlpha(NEON_PINK, 0.5)}`,
                zIndex: 5,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '10px',
                  height: '10px',
                  backgroundColor: NEON_PINK,
                  borderRadius: '50%',
                  boxShadow: `0 0 8px ${NEON_PINK}`,
                }}
              />
            </div>
          </div>

          {timeline.tracks.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: `${tracksHeight}px`,
                color: '#505060',
                fontSize: '13px',
              }}
            >
              暂无轨道，点击"添加轨道"创建
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {timeline.tracks.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  selectedKeyframeId={selectedKeyframeId}
                  onSelectKeyframe={handleSelectKeyframe}
                  onDragKeyframe={handleDragKeyframe}
                  duration={timeline.duration}
                  trackWidth={trackWidth}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <PlaybackControls />
    </div>
  );
}
