import { useState, useEffect } from 'react';
import { Container, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import AppLayout from '@/components/layout/AppLayout';
import TemplateSearch from '@/components/templates/TemplateSearch';
import TemplateGrid from '@/components/templates/TemplateGrid';
import { getTemplates } from '@/services/mockApi';
import { useDesignStore } from '@/store/useDesignStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { LightShowTemplate, UserDesign } from '@/types';
import { NEON_PINK, withAlpha, hexToRgb } from '@/utils/colors';

export default function Templates() {
  const navigate = useNavigate();
  const loadDesign = useDesignStore((s) => s.loadDesign);
  const setTimeline = useTimelineStore((s) => s.setTimeline);

  const [templates, setTemplates] = useState<LightShowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('all');

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const result = await getTemplates();
        setTemplates(result.templates);
      } catch {
        notifications.show({
          title: '加载失败',
          message: '无法加载模板列表',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = activeTag === 'all' || t.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  const handleLoadTemplate = (template: LightShowTemplate) => {
    const design: UserDesign = {
      id: template.id,
      name: template.name,
      buildings: template.buildings,
      groups: template.groups,
      lights: template.lights,
      timeline: template.timeline,
      updatedAt: template.createdAt,
      createdAt: template.createdAt,
    };

    loadDesign(design);
    setTimeline(template.timeline);

    notifications.show({
      title: '模板加载成功',
      message: `"${template.name}" 已加载到工作台`,
      color: 'teal',
      styles: {
        root: {
          backgroundColor: '#0A0A14',
          borderColor: withAlpha('#00F0FF', 0.4),
        },
        title: {
          color: '#00F0FF',
        },
        description: {
          color: '#B0B0C0',
        },
      },
    });

    navigate('/');
  };

  const rgb = hexToRgb(NEON_PINK);

  return (
    <AppLayout>
      <Container size="xl" py="xl" style={{ height: '100%', overflowY: 'auto' }}>
        <Title
          order={1}
          mb="lg"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '36px',
            fontWeight: 800,
            color: NEON_PINK,
            textShadow: `0 0 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5), 0 0 24px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
            letterSpacing: '0.1em',
          }}
        >
          模板库
        </Title>

        <TemplateSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTag={activeTag}
          onTagChange={setActiveTag}
        />

        <div style={{ marginTop: '32px' }}>
          <TemplateGrid
            templates={filteredTemplates}
            onLoad={handleLoadTemplate}
            loading={loading}
          />
        </div>
      </Container>
    </AppLayout>
  );
}
