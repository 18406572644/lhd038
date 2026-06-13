import { useState, useEffect } from 'react';
import { Modal, TextInput, Text, Button, Group, Stack, ActionIcon, ScrollArea, Badge } from '@mantine/core';
import { Trash2, Calendar, Eye } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import AppLayout from '@/components/layout/AppLayout';
import CityCanvas from '@/components/canvas/CityCanvas';
import BuildingRenderer from '@/components/canvas/BuildingRenderer';
import Toolbar from '@/components/panels/Toolbar';
import BuildingPanel from '@/components/panels/BuildingPanel';
import LightPanel from '@/components/panels/LightPanel';
import TimelineEditor from '@/components/timeline/TimelineEditor';
import PreviewModal from '@/components/preview/PreviewModal';
import ExportPanel from '@/components/preview/ExportPanel';
import { useDesignStore } from '@/store/useDesignStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { DEEP_BLACK, ELECTRIC_BLUE, NEON_PINK, withAlpha } from '@/utils/colors';
import { presetTemplates } from '@/data/presets';
import { getDesigns, saveDesignToApi, deleteDesignFromApi } from '@/services/mockApi';
import { useExport } from '@/hooks/useExport';
import { UserDesign } from '@/types';

export default function Workbench() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<UserDesign[]>([]);
  const [saveName, setSaveName] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const designId = useDesignStore((s) => s.designId);
  const designName = useDesignStore((s) => s.designName);
  const buildings = useDesignStore((s) => s.buildings);
  const groups = useDesignStore((s) => s.groups);
  const lights = useDesignStore((s) => s.lights);
  const loadDesign = useDesignStore((s) => s.loadDesign);
  const setDesignName = useDesignStore((s) => s.setDesignName);
  const isDirty = useDesignStore((s) => s.isDirty);
  const markClean = useDesignStore((s) => s.markClean);

  const timeline = useTimelineStore((s) => s.timeline);
  const setTimeline = useTimelineStore((s) => s.setTimeline);
  const setDuration = useTimelineStore((s) => s.setDuration);
  const stop = useTimelineStore((s) => s.stop);

  const { exportVideo, exportGif, cancelExport, isExporting, progress } = useExport();
  const [exportFormat, setExportFormat] = useState<'video' | 'gif' | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialLoad && buildings.length === 0 && presetTemplates.length > 0) {
      const tpl = presetTemplates[0];
      loadDesign({
        id: tpl.id,
        name: tpl.name,
        buildings: tpl.buildings,
        groups: tpl.groups,
        lights: tpl.lights,
        timeline: tpl.timeline,
        updatedAt: tpl.createdAt,
        createdAt: tpl.createdAt,
      });
      setTimeline(tpl.timeline);
      setDuration(tpl.timeline.duration);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, buildings.length, loadDesign, setTimeline, setDuration]);

  const handlePreview = () => {
    stop();
    setPreviewOpen(true);
  };

  const handleSave = () => {
    setSaveName(designName);
    setSaveModalOpen(true);
  };

  const confirmSave = async () => {
    if (!saveName.trim()) {
      notifications.show({
        title: '保存失败',
        message: '请输入设计名称',
        color: 'red',
        autoClose: 3000,
      });
      return;
    }

    const now = new Date().toISOString();
    const design: UserDesign = {
      id: designId,
      name: saveName.trim(),
      buildings,
      groups,
      lights,
      timeline,
      updatedAt: now,
      createdAt: now,
    };

    try {
      await saveDesignToApi(design);
      setDesignName(saveName.trim());
      markClean();
      setSaveModalOpen(false);
      notifications.show({
        title: '保存成功',
        message: `设计 "${saveName.trim()}" 已保存`,
        color: 'teal',
        autoClose: 3000,
      });
      await refreshSavedDesigns();
    } catch {
      notifications.show({
        title: '保存失败',
        message: '请稍后重试',
        color: 'red',
        autoClose: 3000,
      });
    }
  };

  const refreshSavedDesigns = async () => {
    const designs = await getDesigns();
    setSavedDesigns(designs);
  };

  const handleLoad = async () => {
    await refreshSavedDesigns();
    setLoadModalOpen(true);
  };

  const handleLoadDesign = (design: UserDesign) => {
    loadDesign(design);
    setTimeline(design.timeline);
    setDuration(design.timeline.duration);
    setLoadModalOpen(false);
    notifications.show({
      title: '加载成功',
      message: `已加载设计 "${design.name}"`,
      color: 'cyan',
      autoClose: 3000,
    });
  };

  const handleDeleteDesign = async (id: string, name: string) => {
    await deleteDesignFromApi(id);
    await refreshSavedDesigns();
    notifications.show({
      title: '已删除',
      message: `设计 "${name}" 已删除`,
      color: 'yellow',
      autoClose: 2500,
    });
  };

  const handleExportVideo = async () => {
    if (buildings.length === 0) {
      notifications.show({
        title: '无法导出',
        message: '画布为空，请先添加建筑',
        color: 'yellow',
        autoClose: 3000,
      });
      return;
    }
    try {
      setExportFormat('video');
      setExportUrl(null);
      const url = await exportVideo();
      setExportUrl(url);
      notifications.show({
        title: '导出成功',
        message: '视频已就绪，可以下载',
        color: 'teal',
        autoClose: 3000,
      });
    } catch {
      notifications.show({
        title: '导出失败',
        message: '您的浏览器可能不支持此功能',
        color: 'red',
        autoClose: 3000,
      });
      setExportFormat(null);
    }
  };

  const handleExportGif = async () => {
    if (buildings.length === 0) {
      notifications.show({
        title: '无法导出',
        message: '画布为空，请先添加建筑',
        color: 'yellow',
        autoClose: 3000,
      });
      return;
    }
    try {
      setExportFormat('gif');
      setExportUrl(null);
      const url = await exportGif();
      setExportUrl(url);
      notifications.show({
        title: '导出成功',
        message: '动图已就绪，可以下载',
        color: 'teal',
        autoClose: 3000,
      });
    } catch {
      notifications.show({
        title: '导出失败',
        message: '您的浏览器可能不支持此功能',
        color: 'red',
        autoClose: 3000,
      });
      setExportFormat(null);
    }
  };

  const leftPanelStyle = {
    width: '80px',
    minWidth: '80px',
    backgroundColor: withAlpha(DEEP_BLACK, 0.95),
    borderRight: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.2)}`,
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
    boxShadow: `inset -1px 0 0 ${withAlpha(ELECTRIC_BLUE, 0.1)}`,
  };

  const rightPanelStyle = {
    width: '280px',
    minWidth: '280px',
    backgroundColor: withAlpha(DEEP_BLACK, 0.95),
    borderLeft: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.2)}`,
    padding: '16px 12px',
    overflowY: 'auto' as const,
    boxShadow: `inset 1px 0 0 ${withAlpha(ELECTRIC_BLUE, 0.1)}`,
  };

  const centerAreaStyle = {
    flex: 1,
    position: 'relative' as const,
    overflow: 'hidden',
    backgroundColor: DEEP_BLACK,
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-1 overflow-hidden">
          <div style={leftPanelStyle}>
            <BuildingRenderer vertical />
          </div>

          <div style={centerAreaStyle}>
            <CityCanvas />
            <Toolbar
              onPreview={handlePreview}
              onSave={handleSave}
              onLoad={handleLoad}
              onExportVideo={handleExportVideo}
              onExportGif={handleExportGif}
            />
          </div>

          <div style={rightPanelStyle}>
            <BuildingPanel />
            <LightPanel />
          </div>
        </div>

        <TimelineEditor />
      </div>

      <PreviewModal opened={previewOpen} onClose={() => setPreviewOpen(false)} />

      <Modal
        opened={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title={
          <Text style={{ fontFamily: 'Orbitron, sans-serif', color: NEON_PINK, fontWeight: 700, letterSpacing: '0.05em' }}>
            保存设计
          </Text>
        }
        centered
        styles={{
          content: {
            backgroundColor: DEEP_BLACK,
            border: `1px solid ${withAlpha(NEON_PINK, 0.3)}`,
            boxShadow: `0 0 40px ${withAlpha(NEON_PINK, 0.2)}`,
          },
          header: { backgroundColor: 'transparent' },
          title: { color: NEON_PINK },
          close: { color: '#C0C0C0', '&:hover': { color: NEON_PINK } },
          body: { paddingTop: '8px' },
        }}
      >
        <Stack gap={16}>
          <TextInput
            label="设计名称"
            placeholder="输入设计名称..."
            value={saveName}
            onChange={(e) => setSaveName(e.currentTarget.value)}
            styles={{
              input: {
                backgroundColor: '#1E1E2E',
                borderColor: withAlpha(ELECTRIC_BLUE, 0.3),
                color: '#E0E0E0',
                '&:focus': { borderColor: NEON_PINK },
              },
              label: { color: '#B0B0C0', fontSize: '12px' },
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmSave();
            }}
          />
          <Group justify="space-between" mt="sm">
            <Badge color="gray" variant="outline">
              {buildings.length} 栋建筑 · {lights.length} 组灯光
            </Badge>
            <Text size="xs" style={{ color: '#808090' }}>
              {isDirty ? '有未保存的更改' : '已保存'}
            </Text>
          </Group>
          <Group justify="flex-end" mt="md" gap={10}>
            <Button
              variant="outline"
              onClick={() => setSaveModalOpen(false)}
              style={{
                borderColor: 'rgba(192,192,192,0.3)',
                color: '#C0C0C0',
                backgroundColor: 'transparent',
              }}
            >
              取消
            </Button>
            <Button
              onClick={confirmSave}
              style={{
                backgroundColor: withAlpha(NEON_PINK, 0.2),
                color: NEON_PINK,
                border: `1px solid ${NEON_PINK}`,
                boxShadow: `0 0 12px ${withAlpha(NEON_PINK, 0.4)}`,
              }}
            >
              保存
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={loadModalOpen}
        onClose={() => setLoadModalOpen(false)}
        title={
          <Text style={{ fontFamily: 'Orbitron, sans-serif', color: ELECTRIC_BLUE, fontWeight: 700, letterSpacing: '0.05em' }}>
            加载设计
          </Text>
        }
        centered
        size="lg"
        styles={{
          content: {
            backgroundColor: DEEP_BLACK,
            border: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.3)}`,
            boxShadow: `0 0 40px ${withAlpha(ELECTRIC_BLUE, 0.2)}`,
          },
          header: { backgroundColor: 'transparent' },
          title: { color: ELECTRIC_BLUE },
          close: { color: '#C0C0C0', '&:hover': { color: ELECTRIC_BLUE } },
          body: { paddingTop: '8px' },
        }}
      >
        {savedDesigns.length === 0 ? (
          <div
            style={{
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 10,
              color: '#606070',
              border: '1px dashed rgba(0,240,255,0.2)',
              borderRadius: 8,
              backgroundColor: 'rgba(0,240,255,0.03)',
            }}
          >
            <Eye size={28} style={{ opacity: 0.4 }} />
            <Text size="sm">暂无保存的设计</Text>
          </div>
        ) : (
          <ScrollArea h={360}>
            <Stack gap={10}>
              {savedDesigns.map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(30,30,46,0.6)',
                    border: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.15)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleLoadDesign(d)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,240,255,0.08)';
                    e.currentTarget.style.borderColor = withAlpha(ELECTRIC_BLUE, 0.4);
                    e.currentTarget.style.boxShadow = `0 0 14px ${withAlpha(ELECTRIC_BLUE, 0.2)}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(30,30,46,0.6)';
                    e.currentTarget.style.borderColor = withAlpha(ELECTRIC_BLUE, 0.15);
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      size="sm"
                      fw={600}
                      style={{
                        color: '#E0E0E0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {d.name || '未命名设计'}
                    </Text>
                    <Group gap={10} mt={4}>
                      <Badge size="xs" color="pink" variant="dot">
                        {d.buildings.length} 栋建筑
                      </Badge>
                      <Badge size="xs" color="cyan" variant="dot">
                        {d.lights.length} 组灯光
                      </Badge>
                      <Group gap={4} style={{ opacity: 0.7 }}>
                        <Calendar size={11} style={{ color: '#808090' }} />
                        <Text size="xs" style={{ color: '#808090' }}>
                          {new Date(d.updatedAt).toLocaleDateString('zh-CN')}
                        </Text>
                      </Group>
                    </Group>
                  </div>
                  <ActionIcon
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDesign(d.id, d.name || '未命名设计');
                    }}
                    variant="subtle"
                    style={{ color: 'rgba(255,0,60,0.7)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,0,60,0.15)';
                      e.currentTarget.style.color = '#FF003C';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,0,60,0.7)';
                    }}
                  >
                    <Trash2 size={14} />
                  </ActionIcon>
                </div>
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Modal>

      <ExportPanel
        isOpen={!!exportFormat}
        format={exportFormat}
        progress={progress}
        isExporting={isExporting}
        downloadUrl={exportUrl}
        onClose={() => {
          setExportFormat(null);
          setExportUrl(null);
        }}
        onCancel={() => {
          cancelExport();
          setExportFormat(null);
          setExportUrl(null);
        }}
      />
    </AppLayout>
  );
}
