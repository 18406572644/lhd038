import { Group, ActionIcon, Tooltip, Divider } from '@mantine/core';
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
  const resetView = useCanvasStore((s) => s.resetView);
  const zoom = useCanvasStore((s) => s.zoom);
  const setZoom = useCanvasStore((s) => s.setZoom);

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
        {renderButton(<Save size={18} />, '保存', () => onSave?.(), NEON_PINK)}
        {renderButton(<FolderOpen size={18} />, '加载', () => onLoad?.(), NEON_PINK)}

        <Divider orientation="vertical" size="sm" color="rgba(0, 240, 255, 0.2)" />

        {renderButton(<Undo2 size={18} />, '撤销', () => {}, NEON_PINK, true)}
        {renderButton(<Redo2 size={18} />, '重做', () => {}, NEON_PINK, true)}

        <Divider orientation="vertical" size="sm" color="rgba(0, 240, 255, 0.2)" />

        {renderButton(<Maximize2 size={18} />, '重置视图', resetView, ELECTRIC_BLUE)}
        {renderButton(<ZoomIn size={18} />, '放大', handleZoomIn, ELECTRIC_BLUE)}
        {renderButton(<ZoomOut size={18} />, '缩小', handleZoomOut, ELECTRIC_BLUE)}

        <Divider orientation="vertical" size="sm" color="rgba(0, 240, 255, 0.2)" />

        {renderButton(<Play size={18} />, '预览', () => onPreview?.(), ELECTRIC_BLUE)}
        {renderButton(<Video size={18} />, '导出视频', () => onExportVideo?.(), NEON_PINK)}
        {renderButton(<Image size={18} />, '导出GIF', () => onExportGif?.(), NEON_PINK)}
      </Group>
    </div>
  );
}
