import { Stack, Text, Select, Slider, Button, ColorPicker, Group, ActionIcon, ScrollArea } from '@mantine/core';
import { Plus, Trash2, Lightbulb } from 'lucide-react';
import { useDesignStore } from '@/store/useDesignStore';
import { LightConfig, AnimationType } from '@/types';
import { NEON_PRESETS, NEON_PINK, DEEP_BLACK, DARK_GRAY, ELECTRIC_BLUE, hexToRgb } from '@/utils/colors';

const animationOptions = [
  { value: 'breathe', label: '呼吸' },
  { value: 'chase', label: '追逐' },
  { value: 'blink', label: '闪烁' },
  { value: 'gradient', label: '渐变' },
  { value: 'rainbow', label: '彩虹' },
];

export default function LightPanel() {
  const selectedBuildingId = useDesignStore((s) => s.selectedBuildingId);
  const lights = useDesignStore((s) => s.lights);
  const selectedLightId = useDesignStore((s) => s.selectedLightId);
  const selectLight = useDesignStore((s) => s.selectLight);
  const addLight = useDesignStore((s) => s.addLight);
  const updateLight = useDesignStore((s) => s.updateLight);
  const removeLight = useDesignStore((s) => s.removeLight);

  const buildingLights = lights.filter((l) => l.buildingId === selectedBuildingId);
  const selectedLight = lights.find((l) => l.id === selectedLightId && l.buildingId === selectedBuildingId);

  const inputStyles = {
    label: {
      color: '#B0B0C0',
      marginBottom: '4px',
      fontSize: '12px',
      fontWeight: 500,
    },
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
    root: {
      marginTop: '8px',
    },
    track: {
      backgroundColor: 'rgba(0, 240, 255, 0.2)',
    },
    bar: {
      backgroundColor: color,
    },
    thumb: {
      backgroundColor: color,
      borderColor: color,
      boxShadow: `0 0 8px ${color}80`,
    },
    label: {
      color: '#B0B0C0',
      fontSize: '12px',
      fontWeight: 500,
    },
  });

  const handleAddLight = () => {
    if (!selectedBuildingId) return;
    const newLight: LightConfig = {
      id: crypto.randomUUID(),
      buildingId: selectedBuildingId,
      color: NEON_PINK,
      animation: 'breathe',
      speed: 1,
      intensity: 1,
      delay: 0,
    };
    addLight(newLight);
    selectLight(newLight.id);
  };

  const renderLightItem = (light: LightConfig) => {
    const isSelected = light.id === selectedLightId;
    const rgb = hexToRgb(light.color);
    return (
      <div
        key={light.id}
        onClick={() => selectLight(light.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: '6px',
          cursor: 'pointer',
          backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(30, 30, 46, 0.5)',
          border: `1px solid ${isSelected ? `${ELECTRIC_BLUE}60` : 'rgba(0, 240, 255, 0.15)'}`,
          transition: 'all 0.2s ease',
          boxShadow: isSelected ? `0 0 10px ${ELECTRIC_BLUE}30` : 'none',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'rgba(30, 30, 46, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.15)';
          }
        }}
      >
        <Group gap={8}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: light.color,
              boxShadow: `0 0 8px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`,
            }}
          />
          <Lightbulb size={14} style={{ color: isSelected ? ELECTRIC_BLUE : '#B0B0C0' }} />
          <Text size="xs" style={{ color: isSelected ? ELECTRIC_BLUE : '#D0D0E0' }}>
            灯光 {buildingLights.indexOf(light) + 1}
          </Text>
        </Group>
        <ActionIcon
          size="sm"
          color="red"
          variant="subtle"
          onClick={(e) => {
            e.stopPropagation();
            removeLight(light.id);
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
    );
  };

  if (!selectedBuildingId) {
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
          marginTop: '12px',
        }}
      >
        <Text
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '16px',
            fontWeight: 700,
            color: ELECTRIC_BLUE,
            textShadow: `0 0 8px ${ELECTRIC_BLUE}60`,
            marginBottom: '16px',
            letterSpacing: '0.05em',
          }}
        >
          灯光效果
        </Text>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '120px',
            color: '#606070',
            fontSize: '13px',
            border: '1px dashed rgba(0, 240, 255, 0.2)',
            borderRadius: '6px',
            backgroundColor: 'rgba(0, 240, 255, 0.03)',
          }}
        >
          请先选择建筑
        </div>
      </div>
    );
  }

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
        marginTop: '12px',
      }}
    >
      <Group justify="space-between" style={{ marginBottom: '12px' }}>
        <Text
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '16px',
            fontWeight: 700,
            color: ELECTRIC_BLUE,
            textShadow: `0 0 8px ${ELECTRIC_BLUE}60`,
            letterSpacing: '0.05em',
          }}
        >
          灯光效果
        </Text>
        <ActionIcon
          size="sm"
          onClick={handleAddLight}
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

      {buildingLights.length > 0 && (
        <ScrollArea h={buildingLights.length > 2 ? 100 : 'auto'} style={{ marginBottom: '12px' }}>
          <Stack gap={6}>
            {buildingLights.map(renderLightItem)}
          </Stack>
        </ScrollArea>
      )}

      {selectedLight ? (
        <Stack gap={12}>
          <div>
            <Text
              style={{
                color: '#B0B0C0',
                fontSize: '12px',
                fontWeight: 500,
                marginBottom: '6px',
              }}
            >
              颜色
            </Text>
            <ColorPicker
              value={selectedLight.color}
              onChange={(color) => updateLight(selectedLight.id, { color })}
              format="hex"
              size="sm"
              style={{
                marginBottom: '8px',
              }}
              swatches={NEON_PRESETS.map((p) => p.value)}
              swatchesPerRow={4}
            />
            <Group gap={6} style={{ flexWrap: 'wrap' }}>
              {NEON_PRESETS.map((preset) => {
                const rgb = hexToRgb(preset.value);
                const isActive = selectedLight.color.toLowerCase() === preset.value.toLowerCase();
                return (
                  <button
                    key={preset.value}
                    onClick={() => updateLight(selectedLight.id, { color: preset.value })}
                    title={preset.name}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      backgroundColor: preset.value,
                      border: isActive ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      boxShadow: isActive
                        ? `0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`
                        : `0 0 4px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
                      transition: 'all 0.2s ease',
                      padding: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.15)';
                      e.currentTarget.style.boxShadow = `0 0 8px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = isActive
                        ? `0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`
                        : `0 0 4px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
                    }}
                  />
                );
              })}
            </Group>
          </div>

          <Select
            label="动画类型"
            value={selectedLight.animation}
            data={animationOptions}
            onChange={(value) => {
              if (value) updateLight(selectedLight.id, { animation: value as AnimationType });
            }}
            styles={selectStyles}
            size="sm"
          />

          <div>
            <Text
              style={{
                color: '#B0B0C0',
                fontSize: '12px',
                fontWeight: 500,
                marginBottom: '6px',
              }}
            >
              速度: {selectedLight.speed.toFixed(1)}x
            </Text>
            <Slider
              value={selectedLight.speed}
              min={0.1}
              max={3}
              step={0.1}
              onChange={(value) => updateLight(selectedLight.id, { speed: value })}
              styles={sliderStyles(ELECTRIC_BLUE)}
              size="sm"
            />
          </div>

          <div>
            <Text
              style={{
                color: '#B0B0C0',
                fontSize: '12px',
                fontWeight: 500,
                marginBottom: '6px',
              }}
            >
              强度: {(selectedLight.intensity * 100).toFixed(0)}%
            </Text>
            <Slider
              value={selectedLight.intensity}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => updateLight(selectedLight.id, { intensity: value })}
              styles={sliderStyles(NEON_PINK)}
              size="sm"
            />
          </div>

          <div>
            <Text
              style={{
                color: '#B0B0C0',
                fontSize: '12px',
                fontWeight: 500,
                marginBottom: '6px',
              }}
            >
              延迟: {selectedLight.delay.toFixed(1)}s
            </Text>
            <Slider
              value={selectedLight.delay}
              min={0}
              max={5}
              step={0.1}
              onChange={(value) => updateLight(selectedLight.id, { delay: value })}
              styles={sliderStyles(ELECTRIC_BLUE)}
              size="sm"
            />
          </div>

          <Button
            leftSection={<Plus size={14} />}
            onClick={handleAddLight}
            variant="outline"
            style={{
              borderColor: `${ELECTRIC_BLUE}50`,
              color: ELECTRIC_BLUE,
              backgroundColor: 'rgba(0, 240, 255, 0.08)',
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
            添加灯光
          </Button>
        </Stack>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80px',
            color: '#606070',
            fontSize: '13px',
            border: '1px dashed rgba(0, 240, 255, 0.2)',
            borderRadius: '6px',
            backgroundColor: 'rgba(0, 240, 255, 0.03)',
          }}
        >
          {buildingLights.length === 0 ? '暂无灯光，点击 + 添加' : '选择一个灯光进行编辑'}
        </div>
      )}
    </div>
  );
}
