import { useState, useRef, useCallback } from 'react';
import {
  Stack,
  Text,
  Select,
  Slider,
  Button,
  Group,
  ActionIcon,
  ScrollArea,
  Checkbox,
  ColorPicker,
  Collapse,
  Badge,
} from '@mantine/core';
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { useDesignStore } from '@/store/useDesignStore';
import { LightGroup, OverrideMode, AnimationType } from '@/types';
import { NEON_PRESETS, NEON_PINK, DEEP_BLACK, DARK_GRAY, ELECTRIC_BLUE } from '@/utils/colors';

const overrideOptions = [
  { value: 'replace', label: '替换' },
  { value: 'multiply', label: '乘法' },
  { value: 'offset', label: '偏移' },
];

const animationOptions = [
  { value: 'breathe', label: '呼吸' },
  { value: 'chase', label: '追逐' },
  { value: 'blink', label: '闪烁' },
  { value: 'gradient', label: '渐变' },
  { value: 'rainbow', label: '彩虹' },
];

export default function LightGroupManager() {
  const buildings = useDesignStore((s) => s.buildings);
  const lightGroups = useDesignStore((s) => s.lightGroups);
  const selectedLightGroupId = useDesignStore((s) => s.selectedLightGroupId);
  const addLightGroup = useDesignStore((s) => s.addLightGroup);
  const updateLightGroup = useDesignStore((s) => s.updateLightGroup);
  const removeLightGroup = useDesignStore((s) => s.removeLightGroup);
  const selectLightGroup = useDesignStore((s) => s.selectLightGroup);
  const reorderBuildingIdsInLightGroup = useDesignStore((s) => s.reorderBuildingIdsInLightGroup);

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<{ groupId: string; index: number } | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  const handleCreateGroup = () => {
    const newGroup: LightGroup = {
      id: crypto.randomUUID(),
      name: `灯光组 ${lightGroups.length + 1}`,
      buildingIds: [],
      color: NEON_PINK,
      animation: 'breathe',
      overrideMode: 'replace',
      speed: 1,
      intensity: 0.8,
      delay: 0,
    };
    addLightGroup(newGroup);
    selectLightGroup(newGroup.id);
    setExpandedGroupId(newGroup.id);
  };

  const handleToggleBuilding = (groupId: string, buildingId: string) => {
    const group = lightGroups.find((g) => g.id === groupId);
    if (!group) return;
    const isInGroup = group.buildingIds.includes(buildingId);
    const newBuildingIds = isInGroup
      ? group.buildingIds.filter((id) => id !== buildingId)
      : [...group.buildingIds, buildingId];
    updateLightGroup(groupId, { buildingIds: newBuildingIds });
  };

  const handleDragStart = (groupId: string, index: number) => {
    setDragItem({ groupId, index });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndexRef.current = index;
  };

  const handleDrop = (groupId: string) => {
    if (!dragItem || dragItem.groupId !== groupId) return;
    const group = lightGroups.find((g) => g.id === groupId);
    if (!group) return;
    const fromIndex = dragItem.index;
    const toIndex = dragOverIndexRef.current;
    if (toIndex === null || fromIndex === toIndex) return;

    const newBuildingIds = [...group.buildingIds];
    const [moved] = newBuildingIds.splice(fromIndex, 1);
    newBuildingIds.splice(toIndex, 0, moved);
    reorderBuildingIdsInLightGroup(groupId, newBuildingIds);
    setDragItem(null);
    dragOverIndexRef.current = null;
  };

  const handleDragEnd = () => {
    setDragItem(null);
    dragOverIndexRef.current = null;
  };

  const selectStyles = {
    input: {
      backgroundColor: DARK_GRAY,
      borderColor: 'rgba(0, 240, 255, 0.3)',
      color: '#E0E0E0',
      '&:focus': {
        borderColor: ELECTRIC_BLUE,
      },
    },
    label: {
      color: '#B0B0C0',
      marginBottom: '4px',
      fontSize: '12px',
      fontWeight: 500,
    },
    dropdown: {
      backgroundColor: '#1A0A2E',
      borderColor: 'rgba(0, 240, 255, 0.3)',
    },
    option: {
      color: '#E0E0E0',
      backgroundColor: 'transparent',
      '&[data-hovered]': {
        backgroundColor: 'rgba(0, 240, 255, 0.2)',
        color: ELECTRIC_BLUE,
      },
      '&[data-combobox-active-option]': {
        backgroundColor: 'rgba(0, 240, 255, 0.3)',
        color: ELECTRIC_BLUE,
      },
    },
  };

  const sliderStyles = (color: string) => ({
    root: { marginTop: '8px' },
    track: { backgroundColor: 'rgba(0, 240, 255, 0.2)' },
    bar: { backgroundColor: color },
    thumb: {
      backgroundColor: color,
      borderColor: color,
      boxShadow: `0 0 8px ${color}80`,
    },
  });

  const getBuildingLabel = useCallback(
    (buildingId: string) => {
      const b = buildings.find((b) => b.id === buildingId);
      if (!b) return '未知建筑';
      const typeMap: Record<string, string> = {
        office: '写字楼',
        residential: '住宅',
        tower: '塔楼',
        bridge: '桥梁',
      };
      const idx = buildings.indexOf(b) + 1;
      return `${typeMap[b.type] || b.type} ${idx}`;
    },
    [buildings]
  );

  const getOverrideModeBadge = (mode: OverrideMode) => {
    const map: Record<OverrideMode, { label: string; color: string }> = {
      replace: { label: '替换', color: '#FF2E97' },
      multiply: { label: '乘法', color: '#39FF14' },
      offset: { label: '偏移', color: '#FFE600' },
    };
    const info = map[mode];
    return (
      <Badge
        size="xs"
        style={{
          backgroundColor: `${info.color}20`,
          color: info.color,
          border: `1px solid ${info.color}40`,
          fontSize: '10px',
        }}
      >
        {info.label}
      </Badge>
    );
  };

  const renderGroupDetail = (group: LightGroup) => {
    const isExpanded = expandedGroupId === group.id;
    return (
      <div
        key={group.id}
        style={{
          borderRadius: '6px',
          backgroundColor: selectedLightGroupId === group.id ? 'rgba(0, 240, 255, 0.08)' : 'rgba(30, 30, 46, 0.5)',
          border: `1px solid ${selectedLightGroupId === group.id ? `${ELECTRIC_BLUE}60` : 'rgba(0, 240, 255, 0.15)'}`,
          transition: 'all 0.2s ease',
          overflow: 'hidden',
        }}
      >
        <div
          onClick={() => {
            selectLightGroup(group.id);
            setExpandedGroupId(isExpanded ? null : group.id);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            if (selectedLightGroupId !== group.id) {
              e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.04)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedLightGroupId !== group.id) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Group gap={8}>
            {isExpanded ? (
              <ChevronDown size={14} style={{ color: ELECTRIC_BLUE }} />
            ) : (
              <ChevronRight size={14} style={{ color: '#B0B0C0' }} />
            )}
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: group.color,
                boxShadow: `0 0 8px ${group.color}80`,
              }}
            />
            <Text size="xs" style={{ color: selectedLightGroupId === group.id ? ELECTRIC_BLUE : '#D0D0E0' }}>
              {group.name}
            </Text>
            {getOverrideModeBadge(group.overrideMode)}
            <Badge size="xs" color="gray" variant="outline" style={{ fontSize: '10px' }}>
              {group.buildingIds.length} 栋
            </Badge>
          </Group>
          <ActionIcon
            size="sm"
            color="red"
            variant="subtle"
            onClick={(e) => {
              e.stopPropagation();
              removeLightGroup(group.id);
            }}
            style={{ color: 'rgba(255, 0, 60, 0.7)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FF003C';
              e.currentTarget.style.backgroundColor = 'rgba(255, 0, 60, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 0, 60, 0.7)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Trash2 size={12} />
          </ActionIcon>
        </div>

        <Collapse in={isExpanded}>
          <div style={{ padding: '8px 10px 12px', borderTop: '1px solid rgba(0, 240, 255, 0.1)' }}>
            <Stack gap={10}>
              <div>
                <Text
                  style={{ color: '#B0B0C0', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}
                >
                  建筑选择
                </Text>
                <div
                  style={{
                    maxHeight: '120px',
                    overflowY: 'auto',
                    borderRadius: '4px',
                    border: '1px solid rgba(0, 240, 255, 0.1)',
                    padding: '4px',
                  }}
                >
                  {buildings.map((b) => {
                    const checked = group.buildingIds.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '3px 4px',
                          borderRadius: '3px',
                          transition: 'background-color 0.15s',
                          backgroundColor: checked ? 'rgba(0, 240, 255, 0.06)' : 'transparent',
                        }}
                      >
                        <Checkbox
                          size="xs"
                          checked={checked}
                          onChange={() => handleToggleBuilding(group.id, b.id)}
                          styles={{
                            input: {
                              borderColor: checked ? ELECTRIC_BLUE : 'rgba(0, 240, 255, 0.3)',
                              backgroundColor: checked ? `${ELECTRIC_BLUE}20` : 'transparent',
                            },
                          }}
                        />
                        <Text
                          size="xs"
                          style={{
                            color: checked ? ELECTRIC_BLUE : '#A0A0B0',
                            marginLeft: '6px',
                            fontSize: '11px',
                          }}
                        >
                          {getBuildingLabel(b.id)}
                        </Text>
                      </div>
                    );
                  })}
                </div>
              </div>

              {group.buildingIds.length > 1 && (
                <div>
                  <Text
                    style={{ color: '#B0B0C0', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}
                  >
                    建筑顺序（拖拽排序）
                  </Text>
                  <div
                    style={{
                      borderRadius: '4px',
                      border: '1px solid rgba(0, 240, 255, 0.1)',
                      padding: '4px',
                    }}
                  >
                    {group.buildingIds.map((bid, index) => (
                      <div
                        key={bid}
                        draggable
                        onDragStart={() => handleDragStart(group.id, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={() => handleDrop(group.id)}
                        onDragEnd={handleDragEnd}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 6px',
                          borderRadius: '3px',
                          cursor: 'grab',
                          backgroundColor:
                            dragItem?.groupId === group.id && dragItem?.index === index
                              ? 'rgba(0, 240, 255, 0.1)'
                              : 'transparent',
                          transition: 'background-color 0.15s',
                          border: '1px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.06)';
                          e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}
                      >
                        <GripVertical size={12} style={{ color: '#606070', flexShrink: 0 }} />
                        <Text size="xs" style={{ color: '#D0D0E0', fontSize: '11px', flex: 1 }}>
                          {getBuildingLabel(bid)}
                        </Text>
                        <Text size="xs" style={{ color: '#707080', fontSize: '10px' }}>
                          #{index + 1}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Text style={{ color: '#B0B0C0', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>
                  颜色
                </Text>
                <ColorPicker
                  value={group.color}
                  onChange={(color) => updateLightGroup(group.id, { color })}
                  format="hex"
                  size="xs"
                  swatches={NEON_PRESETS.map((p) => p.value)}
                  swatchesPerRow={4}
                />
              </div>

              <Select
                label="覆盖模式"
                value={group.overrideMode}
                data={overrideOptions}
                onChange={(value) => {
                  if (value) updateLightGroup(group.id, { overrideMode: value as OverrideMode });
                }}
                styles={selectStyles}
                size="xs"
              />

              <Select
                label="动画类型"
                value={group.animation}
                data={animationOptions}
                onChange={(value) => {
                  if (value) updateLightGroup(group.id, { animation: value as AnimationType });
                }}
                styles={selectStyles}
                size="xs"
              />

              {group.overrideMode === 'multiply' && (
                <div>
                  <Text style={{ color: '#B0B0C0', fontSize: '11px', fontWeight: 500, marginBottom: '4px' }}>
                    强度系数: {group.intensity.toFixed(2)}
                  </Text>
                  <Slider
                    value={group.intensity}
                    min={0}
                    max={2}
                    step={0.01}
                    onChange={(value) => updateLightGroup(group.id, { intensity: value })}
                    styles={sliderStyles(NEON_PINK)}
                    size="xs"
                  />
                </div>
              )}

              {group.overrideMode === 'offset' && (
                <div>
                  <Text style={{ color: '#B0B0C0', fontSize: '11px', fontWeight: 500, marginBottom: '4px' }}>
                    递增延迟: {group.delay.toFixed(1)}s
                  </Text>
                  <Slider
                    value={group.delay}
                    min={0}
                    max={5}
                    step={0.1}
                    onChange={(value) => updateLightGroup(group.id, { delay: value })}
                    styles={sliderStyles(ELECTRIC_BLUE)}
                    size="xs"
                  />
                </div>
              )}

              {group.overrideMode === 'replace' && (
                <>
                  <div>
                    <Text style={{ color: '#B0B0C0', fontSize: '11px', fontWeight: 500, marginBottom: '4px' }}>
                      速度: {group.speed.toFixed(1)}x
                    </Text>
                    <Slider
                      value={group.speed}
                      min={0.1}
                      max={3}
                      step={0.1}
                      onChange={(value) => updateLightGroup(group.id, { speed: value })}
                      styles={sliderStyles(ELECTRIC_BLUE)}
                      size="xs"
                    />
                  </div>
                  <div>
                    <Text style={{ color: '#B0B0C0', fontSize: '11px', fontWeight: 500, marginBottom: '4px' }}>
                      强度: {(group.intensity * 100).toFixed(0)}%
                    </Text>
                    <Slider
                      value={group.intensity}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(value) => updateLightGroup(group.id, { intensity: value })}
                      styles={sliderStyles(NEON_PINK)}
                      size="xs"
                    />
                  </div>
                </>
              )}
            </Stack>
          </div>
        </Collapse>
      </div>
    );
  };

  return (
    <div
      style={{
        width: 280,
        backgroundColor: `${DEEP_BLACK}E6`,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${ELECTRIC_BLUE}30`,
        borderRadius: '8px',
        padding: '16px',
        boxShadow: `0 0 20px ${ELECTRIC_BLUE}15, inset 0 0 20px ${ELECTRIC_BLUE}08`,
      }}
    >
      <Group justify="space-between" style={{ marginBottom: '12px' }}>
        <Text
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            color: ELECTRIC_BLUE,
            textShadow: `0 0 8px ${ELECTRIC_BLUE}60`,
            letterSpacing: '0.05em',
          }}
        >
          灯光分组
        </Text>
        <ActionIcon
          size="sm"
          onClick={handleCreateGroup}
          style={{
            backgroundColor: 'rgba(0, 240, 255, 0.15)',
            color: ELECTRIC_BLUE,
            border: '1px solid rgba(0, 240, 255, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.25)';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.15)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Plus size={14} />
        </ActionIcon>
      </Group>

      {lightGroups.length === 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60px',
            color: '#606070',
            fontSize: '12px',
            border: '1px dashed rgba(0, 240, 255, 0.2)',
            borderRadius: '6px',
            backgroundColor: 'rgba(0, 240, 255, 0.03)',
          }}
        >
          点击 + 创建灯光分组
        </div>
      ) : (
        <ScrollArea h={Math.min(lightGroups.length * 60 + 40, 200)} style={{ marginBottom: '8px' }}>
          <Stack gap={6}>
            {lightGroups.map(renderGroupDetail)}
          </Stack>
        </ScrollArea>
      )}

      {selectedLightGroupId && (
        <Button
          size="xs"
          variant="outline"
          leftSection={<Plus size={12} />}
          onClick={handleCreateGroup}
          style={{
            borderColor: `${ELECTRIC_BLUE}50`,
            color: ELECTRIC_BLUE,
            backgroundColor: 'rgba(0, 240, 255, 0.08)',
            width: '100%',
            marginTop: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.08)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          添加分组
        </Button>
      )}
    </div>
  );
}
