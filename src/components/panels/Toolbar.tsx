import { Group, ActionIcon, Tooltip, Divider, Badge } from '@mantine/core';
import {
  FilePlus,
  Save,
  FolderOpen,
  Undo2,
  Redo2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Play,
  Video,
  Image,
} from 'lucide-react';
import { useDesignStore } from '@/store/useDesignStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useUndoStore } from '@/store/useUndoStore';
import { NEON_PINK, DEEP_BLACK, ELECTRIC_BLUE } from '@/utils/colors';

interface ToolbarProps {
  onSave?: () => void;
  onLoad?: () => void;
  onPreview?: () => void;
  onExportVideo?: () => void;
  onExportGif?: () => void;
}

export default function Toolbar({
  onSave,
  onLoad,
  onPreview,
  onExportVideo,
  onExportGif,
}: ToolbarProps) {
  const newDesign = useDesignStore((s) => s.newDesign);
  const undo = useDesignStore((s) => s.undo);
  const redo = useDesignStore((s) => s.redo);
  const resetView = useCanvasStore((s) => s.resetView);
  const zoom = useCanvasStore((s) => s.zoom);
  const setZoom = useCanvasStore((s) => s.setZoom);
  const undoCount = useUndoStore((s) => s.undoCount);
  const redoCount = useUndoStore((s) => s.redoCount);

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.2));
  };

  const iconButtonStyle = {
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    color: '#E0E0E0',
    border: '1px solid rgba(0, 240, 255, 0.2)',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s ease',
  };

  const hoverStyle = (color: string) => ({
    backgroundColor: `${color}20`,
    color: color,
    borderColor: `${color}80`,
    boxShadow: `0 0 12px ${color}40, 0 0 24px ${color}20`,
  });

  const renderButton = (
    icon: React.ReactNode,
    label: string,
    onClick: () => void,
    color: string = NEON_PINK,
    disabled: boolean = false
  ) => (
    <Tooltip label={label} position="bottom" withArrow>
      <ActionIcon
        size={36}
        variant="subtle"
        disabled={disabled}
        style={iconButtonStyle}
        onClick={onClick}
        onMouseEnter={(e) => {
          if (!disabled) Object.assign(e.currentTarget.style, hoverStyle(color));
        }}
        onMouseLeave={(e) => {
          if (!disabled) Object.assign(e.currentTarget.style, iconButtonStyle);
        }}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  );

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
      style={{
        backgroundColor: `${DEEP_BLACK}CC`,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '10px',
        padding: '6px 10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 240, 255, 0.05)',
      }}
    >
      <Group gap={6}>
        {renderButton(<FilePlus size={18} />, '新建', newDesign, NEON_PINK)}
        {renderButton(<Save size={18} />, '保存 Ctrl+S', () => onSave?.(), NEON_PINK)}
        {renderButton(<FolderOpen size={18} />, '加载', () => onLoad?.(), NEON_PINK)}

        <Divider orientation="vertical" size="sm" color="rgba(0, 240, 255, 0.2)" />

        <Tooltip label={`撤销 Ctrl+Z (${undoCount})`} position="bottom" withArrow>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <ActionIcon
              size={36}
              variant="subtle"
              disabled={undoCount === 0}
              style={iconButtonStyle}
              onClick={undo}
              onMouseEnter={(e) => {
                if (undoCount > 0) Object.assign(e.currentTarget.style, hoverStyle(NEON_PINK));
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, iconButtonStyle);
              }}
            >
              <Undo2 size={18} />
            </ActionIcon>
            {undoCount > 0 && (
              <Badge
                size="xs"
                variant="filled"
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  minWidth: 16,
                  height: 16,
                  padding: '0 3px',
                  backgroundColor: NEON_PINK,
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  border: 'none',
                }}
              >
                {undoCount}
              </Badge>
            )}
          </div>
        </Tooltip>
        <Tooltip label={`重做 Ctrl+Shift+Z (${redoCount})`} position="bottom" withArrow>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <ActionIcon
              size={36}
              variant="subtle"
              disabled={redoCount === 0}
              style={iconButtonStyle}
              onClick={redo}
              onMouseEnter={(e) => {
                if (redoCount > 0) Object.assign(e.currentTarget.style, hoverStyle(NEON_PINK));
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, iconButtonStyle);
              }}
            >
              <Redo2 size={18} />
            </ActionIcon>
            {redoCount > 0 && (
              <Badge
                size="xs"
                variant="filled"
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  minWidth: 16,
                  height: 16,
                  padding: '0 3px',
                  backgroundColor: ELECTRIC_BLUE,
                  color: '#000',
                  fontSize: 9,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  border: 'none',
                }}
              >
                {redoCount}
              </Badge>
            )}
          </div>
        </Tooltip>

        <Divider orientation="vertical" size="sm" color="rgba(0, 240, 255, 0.2)" />

        {renderButton(<Maximize2 size={18} />, '重置视图 0', resetView, ELECTRIC_BLUE)}
        {renderButton(<ZoomIn size={18} />, '放大 +', handleZoomIn, ELECTRIC_BLUE)}
        {renderButton(<ZoomOut size={18} />, '缩小 -', handleZoomOut, ELECTRIC_BLUE)}

        <Divider orientation="vertical" size="sm" color="rgba(0, 240, 255, 0.2)" />

        {renderButton(<Play size={18} />, '预览 Space', () => onPreview?.(), ELECTRIC_BLUE)}
        {renderButton(<Video size={18} />, '导出视频', () => onExportVideo?.(), NEON_PINK)}
        {renderButton(<Image size={18} />, '导出GIF', () => onExportGif?.(), NEON_PINK)}
      </Group>
    </div>
  );
}
