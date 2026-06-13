import { useState } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { Keyboard, X } from 'lucide-react';
import { NEON_PINK, DEEP_BLACK, ELECTRIC_BLUE, withAlpha } from '@/utils/colors';

const SHORTCUTS = [
  { category: '编辑', items: [
    { keys: 'Ctrl+Z', label: '撤销' },
    { keys: 'Ctrl+Shift+Z', label: '重做' },
    { keys: 'Ctrl+S', label: '保存' },
    { keys: 'Ctrl+C', label: '复制' },
    { keys: 'Ctrl+V', label: '粘贴' },
    { keys: 'Delete', label: '删除选中' },
  ]},
  { category: '视图', items: [
    { keys: '+', label: '放大' },
    { keys: '-', label: '缩小' },
    { keys: '0', label: '重置视图' },
  ]},
  { category: '播放', items: [
    { keys: 'Space', label: '播放/暂停' },
  ]},
  { category: '分组', items: [
    { keys: 'Ctrl+G', label: '创建分组' },
    { keys: 'Ctrl+Shift+G', label: '取消分组' },
  ]},
  { category: '其他', items: [
    { keys: 'Esc', label: '取消选择/退出组编辑' },
    { keys: 'Shift+拖拽', label: '框选建筑' },
    { keys: '双击组', label: '进入组编辑' },
  ]},
];

export default function ShortcutHelpPanel() {
  const [open, setOpen] = useState(false);

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    color: '#E0E0E0',
    border: '1px solid rgba(0, 240, 255, 0.2)',
    backdropFilter: 'blur(8px)',
  };

  return (
    <>
      <Tooltip label="快捷键" position="left" withArrow>
        <ActionIcon
          size={32}
          variant="subtle"
          style={buttonStyle}
          onClick={() => setOpen(!open)}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, {
              backgroundColor: `${ELECTRIC_BLUE}20`,
              color: ELECTRIC_BLUE,
              borderColor: `${ELECTRIC_BLUE}80`,
              boxShadow: `0 0 12px ${ELECTRIC_BLUE}40`,
            });
          }}
          onMouseLeave={(e) => {
            Object.assign(e.currentTarget.style, buttonStyle);
          }}
        >
          <Keyboard size={16} />
        </ActionIcon>
      </Tooltip>

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 280,
            right: 300,
            width: 260,
            backgroundColor: withAlpha(DEEP_BLACK, 0.95),
            border: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.3)}`,
            borderRadius: 10,
            padding: '14px 16px',
            zIndex: 100,
            boxShadow: `0 4px 30px rgba(0, 0, 0, 0.6), 0 0 20px ${withAlpha(ELECTRIC_BLUE, 0.1)}`,
            backdropFilter: 'blur(12px)',
            maxHeight: 'calc(100vh - 360px)',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 12,
                fontWeight: 700,
                color: ELECTRIC_BLUE,
                letterSpacing: '0.08em',
              }}
            >
              快捷键
            </span>
            <ActionIcon
              size={20}
              variant="subtle"
              onClick={() => setOpen(false)}
              style={{ color: '#808090' }}
            >
              <X size={14} />
            </ActionIcon>
          </div>

          {SHORTCUTS.map((group) => (
            <div key={group.category} style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: NEON_PINK,
                  letterSpacing: '0.1em',
                  marginBottom: 4,
                  fontFamily: 'Rajdhani, sans-serif',
                }}
              >
                {group.category}
              </div>
              {group.items.map((item) => (
                <div
                  key={item.keys}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '3px 0',
                  }}
                >
                  <span style={{ fontSize: 11, color: '#B0B0C0' }}>{item.label}</span>
                  <kbd
                    style={{
                      fontSize: 10,
                      fontFamily: 'monospace',
                      backgroundColor: 'rgba(0, 240, 255, 0.08)',
                      color: ELECTRIC_BLUE,
                      border: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.25)}`,
                      borderRadius: 4,
                      padding: '1px 6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.keys}
                  </kbd>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
