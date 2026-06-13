import { useRef, useEffect, useState, useCallback } from 'react';
import { Modal, Group, ActionIcon, Text, Button } from '@mantine/core';
import { Play, Pause, SkipBack, X, Film, Image } from 'lucide-react';
import { useCanvasRenderer } from '@/hooks/useCanvasRenderer';
import { useAnimation } from '@/hooks/useAnimation';
import { useExport } from '@/hooks/useExport';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { NEON_PINK, ELECTRIC_BLUE, DEEP_BLACK, DARK_GRAY, withAlpha } from '@/utils/colors';
import ExportPanel from './ExportPanel';

const PREVIEW_WIDTH = 960;
const PREVIEW_HEIGHT = 540;

interface PreviewModalProps {
  opened: boolean;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PreviewModal({ opened, onClose }: PreviewModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const isSeekingRef = useRef(false);
  const prevCanvasSizeRef = useRef({ width: 0, height: 0 });
  const [exportFormat, setExportFormat] = useState<'video' | 'gif' | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const { startRendering, stopRendering } = useCanvasRenderer(canvasRef);
  const { startPlayback, stopPlayback, seekTo } = useAnimation();
  const { exportVideo, exportGif, cancelExport, isExporting, progress } = useExport(canvasRef);

  const currentTime = useTimelineStore((s) => s.currentTime);
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const timeline = useTimelineStore((s) => s.timeline);
  const play = useTimelineStore((s) => s.play);
  const pause = useTimelineStore((s) => s.pause);
  const setCurrentTime = useTimelineStore((s) => s.setCurrentTime);
  const setCanvasSize = useCanvasStore((s) => s.setCanvasSize);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = PREVIEW_WIDTH * dpr;
    canvas.height = PREVIEW_HEIGHT * dpr;
    canvas.style.width = `${PREVIEW_WIDTH}px`;
    canvas.style.height = `${PREVIEW_HEIGHT}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  useEffect(() => {
    if (opened) {
      const prev = useCanvasStore.getState();
      prevCanvasSizeRef.current = { width: prev.canvasWidth, height: prev.canvasHeight };
      setupCanvas();
      setCanvasSize(PREVIEW_WIDTH, PREVIEW_HEIGHT);
      setCurrentTime(0);
      startRendering();
      play();
      startPlayback();
    } else {
      stopPlayback();
      pause();
      stopRendering();
      setCanvasSize(prevCanvasSizeRef.current.width, prevCanvasSizeRef.current.height);
      setExportFormat(null);
      setDownloadUrl(null);
    }
  }, [opened, setupCanvas, setCanvasSize, setCurrentTime, startRendering, stopRendering, startPlayback, stopPlayback, play, pause]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
      stopPlayback();
    } else {
      play();
      startPlayback();
    }
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

  const handleExportVideo = async () => {
    setExportFormat('video');
    setDownloadUrl(null);
    pause();
    stopPlayback();
    try {
      const url = await exportVideo();
      setDownloadUrl(url);
    } catch {
      setExportFormat(null);
    }
  };

  const handleExportGif = async () => {
    setExportFormat('gif');
    setDownloadUrl(null);
    pause();
    stopPlayback();
    try {
      const url = await exportGif();
      setDownloadUrl(url);
    } catch {
      setExportFormat(null);
    }
  };

  const handleExportClose = () => {
    setExportFormat(null);
    setDownloadUrl(null);
  };

  const handleExportCancel = () => {
    cancelExport();
    setExportFormat(null);
    setDownloadUrl(null);
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

  const exportButtonStyle = (color: string) => ({
    backgroundColor: withAlpha(color, 0.1),
    color: color,
    border: `1px solid ${color}`,
    transition: 'all 0.2s ease',
    fontFamily: 'Rajdhani, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.05em',
    boxShadow: `0 0 8px ${withAlpha(color, 0.3)}`,
  });

  const exportHoverStyle = (color: string) => ({
    backgroundColor: withAlpha(color, 0.2),
    boxShadow: `0 0 16px ${withAlpha(color, 0.5)}, 0 0 32px ${withAlpha(color, 0.2)}`,
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        size="auto"
        centered
        closeOnClickOutside={!isExporting}
        closeOnEscape={!isExporting}
        withCloseButton={false}
        styles={{
          content: {
            backgroundColor: DEEP_BLACK,
            border: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.3)}`,
            boxShadow: `0 0 40px ${withAlpha(NEON_PINK, 0.2)}, 0 0 80px ${withAlpha(ELECTRIC_BLUE, 0.1)}`,
            padding: 0,
          },
          inner: {
            padding: 0,
          },
        }}
      >
        <div style={{ padding: '20px 24px 24px' }}>
          <Group justify="space-between" mb="md">
            <Text
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                color: NEON_PINK,
                textShadow: `0 0 12px ${withAlpha(NEON_PINK, 0.6)}, 0 0 24px ${withAlpha(NEON_PINK, 0.3)}`,
                letterSpacing: '0.1em',
              }}
            >
              灯光秀预览
            </Text>
            <ActionIcon
              variant="subtle"
              onClick={onClose}
              style={{ color: '#8080A0', '&:hover': { color: NEON_PINK } }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = NEON_PINK;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#8080A0';
              }}
            >
              <X size={20} />
            </ActionIcon>
          </Group>

          <div
            style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              border: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.3)}`,
              boxShadow: `0 0 20px ${withAlpha(ELECTRIC_BLUE, 0.15)}`,
            }}
          >
            <canvas ref={canvasRef} style={{ display: 'block' }} />
          </div>

          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div
              ref={progressRef}
              onMouseDown={handleProgressMouseDown}
              style={{
                height: '8px',
                backgroundColor: withAlpha(DARK_GRAY, 0.8),
                borderRadius: '4px',
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
                  borderRadius: '4px',
                  boxShadow: `0 0 10px ${NEON_PINK}60`,
                  transition: isSeekingRef.current ? 'none' : 'width 0.05s linear',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${progressPercent}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '14px',
                  height: '14px',
                  backgroundColor: NEON_PINK,
                  borderRadius: '50%',
                  boxShadow: `0 0 10px ${NEON_PINK}, 0 0 20px ${NEON_PINK}60`,
                }}
              />
            </div>

            <Group justify="space-between">
              <Text
                style={{
                  color: '#B0B0C0',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  width: '100px',
                }}
              >
                {formatTime(currentTime)} / {formatTime(timeline.duration)}
              </Text>

              <Group gap={8}>
                <ActionIcon
                  size={34}
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
                  size={48}
                  variant="filled"
                  onClick={handlePlayPause}
                  style={{
                    backgroundColor: withAlpha(NEON_PINK, 0.15),
                    color: NEON_PINK,
                    border: `2px solid ${NEON_PINK}`,
                    boxShadow: `0 0 14px ${withAlpha(NEON_PINK, 0.4)}, inset 0 0 10px ${withAlpha(NEON_PINK, 0.2)}`,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = withAlpha(NEON_PINK, 0.25);
                    e.currentTarget.style.boxShadow = `0 0 24px ${withAlpha(NEON_PINK, 0.6)}, inset 0 0 16px ${withAlpha(NEON_PINK, 0.3)}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = withAlpha(NEON_PINK, 0.15);
                    e.currentTarget.style.boxShadow = `0 0 14px ${withAlpha(NEON_PINK, 0.4)}, inset 0 0 10px ${withAlpha(NEON_PINK, 0.2)}`;
                  }}
                >
                  {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '3px' }} />}
                </ActionIcon>
              </Group>

              <div style={{ width: '100px' }} />
            </Group>
          </div>

          <Group justify="center" mt="xl" gap="md">
            <Button
              leftSection={<Film size={18} />}
              onClick={handleExportVideo}
              disabled={isExporting}
              size="md"
              style={exportButtonStyle(ELECTRIC_BLUE)}
              onMouseEnter={(e) => {
                if (!isExporting) Object.assign(e.currentTarget.style, exportHoverStyle(ELECTRIC_BLUE));
              }}
              onMouseLeave={(e) => {
                if (!isExporting) Object.assign(e.currentTarget.style, exportButtonStyle(ELECTRIC_BLUE));
              }}
            >
              导出视频
            </Button>
            <Button
              leftSection={<Image size={18} />}
              onClick={handleExportGif}
              disabled={isExporting}
              size="md"
              style={exportButtonStyle(NEON_PINK)}
              onMouseEnter={(e) => {
                if (!isExporting) Object.assign(e.currentTarget.style, exportHoverStyle(NEON_PINK));
              }}
              onMouseLeave={(e) => {
                if (!isExporting) Object.assign(e.currentTarget.style, exportButtonStyle(NEON_PINK));
              }}
            >
              导出GIF
            </Button>
          </Group>
        </div>
      </Modal>

      <ExportPanel
        isOpen={exportFormat !== null}
        format={exportFormat}
        progress={progress}
        isExporting={isExporting}
        downloadUrl={downloadUrl}
        onClose={handleExportClose}
        onCancel={handleExportCancel}
      />
    </>
  );
}
