import { Skeleton, SimpleGrid, Card, Text, Group, Badge } from '@mantine/core';
import { LightShowTemplate } from '@/types';
import TemplateCard from './TemplateCard';
import { DEEP_BLACK, DARK_GRAY, withAlpha, NEON_PINK } from '@/utils/colors';

interface TemplateGridProps {
  templates: LightShowTemplate[];
  onLoad: (template: LightShowTemplate) => void;
  loading?: boolean;
}

function TemplateCardSkeleton() {
  return (
    <Card
      padding="lg"
      radius="md"
      withBorder
      style={{
        width: '280px',
        backgroundColor: DEEP_BLACK,
        borderColor: withAlpha(DARK_GRAY, 0.5),
      }}
    >
      <Card.Section mb="md">
        <Skeleton height={160} radius="sm" />
      </Card.Section>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Skeleton height={20} width="60%" radius="sm" />
        <Skeleton height={16} radius="sm" />
        <Skeleton height={16} width="80%" radius="sm" />
        <Group gap="xs">
          <Skeleton height={20} width={50} radius="sm" />
          <Skeleton height={20} width={50} radius="sm" />
          <Skeleton height={20} width={50} radius="sm" />
        </Group>
        <Skeleton height={36} radius="sm" mt="sm" />
      </div>
    </Card>
  );
}

export default function TemplateGrid({ templates, onLoad, loading = false }: TemplateGridProps) {
  if (loading) {
    return (
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
        spacing="lg"
        style={{ justifyItems: 'center' }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <TemplateCardSkeleton key={i} />
        ))}
      </SimpleGrid>
    );
  }

  if (templates.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
        }}
      >
        <Text
          style={{
            color: '#606080',
            fontSize: '14px',
          }}
        >
          没有找到匹配的模板
        </Text>
      </div>
    );
  }

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
      spacing="lg"
      style={{ justifyItems: 'center' }}
    >
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} onLoad={onLoad} />
      ))}
    </SimpleGrid>
  );
}
