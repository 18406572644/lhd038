import { TextInput, Group, Badge } from '@mantine/core';
import { Search } from 'lucide-react';
import { NEON_PINK, ELECTRIC_BLUE, DEEP_BLACK, DARK_GRAY, withAlpha, hexToRgb } from '@/utils/colors';

const TAGS = ['all', '夜景', '都市', '河畔', '住宅'];

interface TemplateSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeTag: string;
  onTagChange: (tag: string) => void;
}

export default function TemplateSearch({
  searchTerm,
  onSearchChange,
  activeTag,
  onTagChange,
}: TemplateSearchProps) {
  const rgb = hexToRgb(NEON_PINK);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TextInput
        placeholder="搜索模板名称或描述..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        size="md"
        leftSection={<Search size={18} style={{ color: '#8080A0' }} />}
        styles={{
          wrapper: {
            width: '100%',
            maxWidth: '480px',
          },
          input: {
            backgroundColor: DEEP_BLACK,
            borderColor: withAlpha(ELECTRIC_BLUE, 0.3),
            color: '#E0E0E0',
            fontSize: '14px',
            '&::placeholder': {
              color: '#606080',
            },
            '&:focus': {
              borderColor: NEON_PINK,
              boxShadow: `0 0 8px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
            },
          },
        }}
      />

      <Group gap="sm">
        {TAGS.map((tag) => {
          const isActive = activeTag === tag;
          const label = tag === 'all' ? '全部' : tag;

          return (
            <Badge
              key={tag}
              size="lg"
              onClick={() => onTagChange(tag)}
              style={{
                cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: 'Rajdhani, sans-serif',
                letterSpacing: '0.05em',
                backgroundColor: isActive ? withAlpha(NEON_PINK, 0.15) : DARK_GRAY,
                color: isActive ? NEON_PINK : '#A0A0B8',
                border: `1px solid ${isActive ? NEON_PINK : withAlpha('#606080', 0.4)}`,
                transition: 'all 0.2s ease',
                boxShadow: isActive ? `0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)` : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = withAlpha(NEON_PINK, 0.5);
                  e.currentTarget.style.color = NEON_PINK;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = withAlpha('#606080', 0.4);
                  e.currentTarget.style.color = '#A0A0B8';
                }
              }}
            >
              {label}
            </Badge>
          );
        })}
      </Group>
    </div>
  );
}
