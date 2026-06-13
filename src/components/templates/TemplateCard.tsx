import { Card, Text, Button, Badge, Group, Stack } from '@mantine/core';
import { LightShowTemplate } from '@/types';
import { NEON_PINK, DEEP_BLACK, DARK_PURPLE, DARK_GRAY, withAlpha, hexToRgb } from '@/utils/colors';

interface TemplateCardProps {
  template: LightShowTemplate;
  onLoad: (template: LightShowTemplate) => void;
}

function getTemplateColors(template: LightShowTemplate): string[] {
  const colors = template.lights.map((l) => l.color);
  const unique = [...new Set(colors)];
  return unique.slice(0, 4);
}

function TemplateThumbnail({ template }: { template: LightShowTemplate }) {
  const colors = getTemplateColors(template);
  const primary = colors[0] || NEON_PINK;
  const secondary = colors[1] || '#00F0FF';
  const tertiary = colors[2] || '#FFE600';
  const quaternary = colors[3] || '#BF40FF';

  const buildingCount = template.buildings.length;

  const buildingStyles = template.buildings.map((building, i) => {
    const lightColor = template.lights.find((l) => l.buildingId === building.id)?.color || primary;
    const buildingHeight = building.height;
    const maxHeight = Math.max(...template.buildings.map((b) => b.height));
    const relativeHeight = (buildingHeight / maxHeight) * 100;
    const leftPos = (i / buildingCount) * 100 + (100 / buildingCount) * 0.15;
    const width = (100 / buildingCount) * 0.7;

    return {
      left: `${leftPos}%`,
      width: `${width}%`,
      height: `${relativeHeight}%`,
      lightColor,
      animationDelay: `${i * 0.3}s`,
    };
  });

  const rgb = hexToRgb(primary);

  return (
    <div
      style={{
        width: '100%',
        height: '160px',
        background: `linear-gradient(180deg, ${DARK_PURPLE} 0%, ${DEEP_BLACK} 60%, ${DARK_GRAY} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '6px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at 30% 20%, ${withAlpha(primary, 0.15)} 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, ${withAlpha(secondary, 0.12)} 0%, transparent 50%)`,
        }}
      />

      {buildingStyles.map((bs, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            bottom: 0,
            left: bs.left,
            width: bs.width,
            height: bs.height,
            background: `linear-gradient(180deg, ${withAlpha(bs.lightColor, 0.3)} 0%, ${withAlpha(bs.lightColor, 0.1)} 100%)`,
            borderTop: `2px solid ${bs.lightColor}`,
            borderLeft: `1px solid ${withAlpha(bs.lightColor, 0.5)}`,
            borderRight: `1px solid ${withAlpha(bs.lightColor, 0.5)}`,
            boxShadow: `0 0 8px ${withAlpha(bs.lightColor, 0.4)}, inset 0 0 12px ${withAlpha(bs.lightColor, 0.15)}`,
            animation: `breathe-${i} ${2 + (i % 3) * 0.5}s ease-in-out infinite`,
            animationDelay: bs.animationDelay,
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${tertiary}, ${quaternary}, ${primary}, ${secondary}, transparent)`,
          boxShadow: `0 0 10px ${withAlpha(primary, 0.6)}`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '4px',
          height: '4px',
          backgroundColor: '#ffffff',
          borderRadius: '50%',
          opacity: 0.6,
          boxShadow: `0 0 4px #ffffff`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '70%',
          width: '3px',
          height: '3px',
          backgroundColor: '#ffffff',
          borderRadius: '50%',
          opacity: 0.5,
          boxShadow: `0 0 3px #ffffff`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '55%',
          width: '2px',
          height: '2px',
          backgroundColor: '#ffffff',
          borderRadius: '50%',
          opacity: 0.7,
        }}
      />

      <style>{`
        ${buildingStyles.map((_, i) => `
          @keyframes breathe-${i} {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
        `).join('')}
      `}</style>
    </div>
  );
}

export default function TemplateCard({ template, onLoad }: TemplateCardProps) {
  const primaryColor = template.lights[0]?.color || NEON_PINK;
  const rgb = hexToRgb(primaryColor);

  return (
    <Card
      padding="lg"
      radius="md"
      withBorder
      style={{
        width: '280px',
        backgroundColor: DEEP_BLACK,
        borderColor: withAlpha(primaryColor, 0.3),
        transition: 'all 0.3s ease',
        boxShadow: `0 0 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 0 24px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25), 0 0 48px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
        e.currentTarget.style.borderColor = withAlpha(primaryColor, 0.6);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = `0 0 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
        e.currentTarget.style.borderColor = withAlpha(primaryColor, 0.3);
      }}
    >
      <Card.Section withBorder style={{ borderColor: 'transparent' }} mb="md">
        <TemplateThumbnail template={template} />
      </Card.Section>

      <Stack gap="sm">
        <Text
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '16px',
            fontWeight: 700,
            color: primaryColor,
            textShadow: `0 0 6px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
            letterSpacing: '0.05em',
          }}
          lineClamp={1}
        >
          {template.name}
        </Text>

        <Text
          size="sm"
          style={{ color: '#A0A0B8', lineHeight: 1.5 }}
          lineClamp={2}
        >
          {template.description}
        </Text>

        <Group gap="xs" mt="xs">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              size="sm"
              variant="light"
              style={{
                backgroundColor: withAlpha(primaryColor, 0.12),
                color: primaryColor,
                border: `1px solid ${withAlpha(primaryColor, 0.3)}`,
              }}
            >
              {tag}
            </Badge>
          ))}
        </Group>

        <Button
          fullWidth
          onClick={() => onLoad(template)}
          size="md"
          mt="sm"
          style={{
            backgroundColor: withAlpha(primaryColor, 0.1),
            color: primaryColor,
            border: `1px solid ${primaryColor}`,
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.05em',
            boxShadow: `0 0 8px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = withAlpha(primaryColor, 0.2);
            e.currentTarget.style.boxShadow = `0 0 16px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.45), 0 0 32px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = withAlpha(primaryColor, 0.1);
            e.currentTarget.style.boxShadow = `0 0 8px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
          }}
        >
          加载模板
        </Button>
      </Stack>
    </Card>
  );
}
