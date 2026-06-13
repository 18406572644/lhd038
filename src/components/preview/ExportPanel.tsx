import { Modal, Text, Button, Group, ActionIcon } from '@mantine/core';
import { X, Download, Loader2 } from 'lucide-react';
import { NEON_PINK, ELECTRIC_BLUE, DEEP_BLACK, DARK_GRAY, withAlpha } from '@/utils/colors';

interface ExportPanelProps {
  isOpen: boolean;
  format: 'video' | 'gif' | null;
  progress: number;
  isExporting: boolean;
  downloadUrl: string | null;
  onClose: () => void;
  onCancel: () => void;
}

export default function ExportPanel({
  isOpen,
  format,
  progress,
  isExporting,
  downloadUrl,
  onClose,
  onCancel,
}: ExportPanelProps) {
  const isComplete = downloadUrl !== null;
  const formatLabel = format === 'video' ? '视频' : 'GIF';
  const accentColor = format === 'video' ? ELECTRIC_BLUE : NEON_PINK;
  const ext = format === 'video' ? 'webm' : 'webm';

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.download = `cyber-light-show-${timestamp}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size="sm"
      centered
      withCloseButton={false}
      closeOnClickOutside={isComplete}
      closeOnEscape={isComplete}
      styles={{
        content: {
          backgroundColor: DEEP_BLACK,
          border: `1px solid ${withAlpha(accentColor, 0.4)}`,
          boxShadow: `0 0 30px ${withAlpha(accentColor, 0.25)}`,
        },
        inner: {
          padding: 0,
        },
      }}
    >
      <div style={{ padding: '24px' }}>
        <Group justify="space-between" mb="md">
          <Text
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              color: accentColor,
              textShadow: `0 0 8px ${withAlpha(accentColor, 0.5)}`,
              letterSpacing: '0.08em',
            }}
          >
            {isComplete ? '导出完成' : `导出${formatLabel}`}
          </Text>
          {isComplete && (
            <ActionIcon
              variant="subtle"
              onClick={onClose}
              style={{ color: '#8080A0' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = NEON_PINK;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#8080A0';
              }}
            >
              <X size={18} />
            </ActionIcon>
          )}
        </Group>

        {isExporting && !isComplete && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 0',
              }}
            >
              <Loader2
                size={48}
                style={{
                  color: accentColor,
                  animation: 'cls-spin 1s linear infinite',
                  filter: `drop-shadow(0 0 8px ${accentColor})`,
                }}
              />
            </div>

            <div>
              <Group justify="space-between" mb="xs">
                <Text size="sm" style={{ color: '#B0B0C0' }}>
                  正在生成{formatLabel}...
                </Text>
                <Text size="sm" style={{ color: accentColor, fontFamily: 'monospace' }}>
                  {Math.round(progress)}%
                </Text>
              </Group>
              <div
                style={{
                  height: '12px',
                  backgroundColor: DARK_GRAY,
                  borderRadius: '6px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${accentColor}, ${withAlpha(accentColor, 0.7)})`,
                    borderRadius: '6px',
                    boxShadow: `0 0 10px ${withAlpha(accentColor, 0.6)}`,
                    transition: 'width 0.1s ease',
                  }}
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={onCancel}
              fullWidth
              style={{
                borderColor: withAlpha('#8080A0', 0.4),
                color: '#B0B0C0',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = withAlpha(NEON_PINK, 0.6);
                e.currentTarget.style.color = NEON_PINK;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = withAlpha('#8080A0', 0.4);
                e.currentTarget.style.color = '#B0B0C0';
              }}
            >
              取消
            </Button>
          </div>
        )}

        {isComplete && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 0',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: withAlpha(accentColor, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${accentColor}`,
                  boxShadow: `0 0 20px ${withAlpha(accentColor, 0.4)}, inset 0 0 12px ${withAlpha(accentColor, 0.2)}`,
                }}
              >
                <Download size={28} style={{ color: accentColor }} />
              </div>
              <Text style={{ color: '#E0E0E0', fontSize: '14px' }}>
                {formatLabel}已准备就绪
              </Text>
            </div>

            <Button
              leftSection={<Download size={18} />}
              onClick={handleDownload}
              fullWidth
              size="md"
              style={{
                backgroundColor: withAlpha(accentColor, 0.15),
                color: accentColor,
                border: `1px solid ${accentColor}`,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 600,
                letterSpacing: '0.05em',
                boxShadow: `0 0 12px ${withAlpha(accentColor, 0.3)}`,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = withAlpha(accentColor, 0.25);
                e.currentTarget.style.boxShadow = `0 0 20px ${withAlpha(accentColor, 0.5)}, 0 0 40px ${withAlpha(accentColor, 0.2)}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = withAlpha(accentColor, 0.15);
                e.currentTarget.style.boxShadow = `0 0 12px ${withAlpha(accentColor, 0.3)}`;
              }}
            >
              下载{formatLabel}
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cls-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Modal>
  );
}
