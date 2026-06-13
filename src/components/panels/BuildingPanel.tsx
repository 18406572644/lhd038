import { Stack, Text, Select, NumberInput, Slider, Button, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Trash2, Copy } from 'lucide-react';
import { useDesignStore } from '@/store/useDesignStore';
import { BuildingType, WindowPattern } from '@/types';
import { NEON_PINK, DARK_PURPLE, DARK_GRAY, DEEP_BLACK, ELECTRIC_BLUE } from '@/utils/colors';

const buildingTypeOptions = [
  { value: 'office', label: '写字楼' },
  { value: 'residential', label: '住宅' },
  { value: 'tower', label: '塔楼' },
  { value: 'bridge', label: '桥梁' },
];

const windowPatternOptions = [
  { value: 'grid', label: '网格' },
  { value: 'random', label: '随机' },
  { value: 'strip', label: '条状' },
];

export default function BuildingPanel() {
  const selectedBuildingId = useDesignStore((s) => s.selectedBuildingId);
  const buildings = useDesignStore((s) => s.buildings);
  const updateBuilding = useDesignStore((s) => s.updateBuilding);
  const removeBuilding = useDesignStore((s) => s.removeBuilding);
  const copyBuilding = useDesignStore((s) => s.copyBuilding);
  const pasteBuilding = useDesignStore((s) => s.pasteBuilding);
  const clipboard = useDesignStore((s) => s.clipboard);

  const handleCopy = () => {
    if (selectedBuildingId) {
      copyBuilding(selectedBuildingId);
      notifications.show({
        title: '已复制',
        message: '建筑已复制到剪贴板',
        color: 'cyan',
        autoClose: 2000,
        icon: <Copy size={16} />,
        styles: {
          root: {
            backgroundColor: '#0A0A14',
            borderColor: ELECTRIC_BLUE,
          },
          title: {
            color: ELECTRIC_BLUE,
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 600,
          },
          description: {
            color: '#B0B0C0',
          },
        },
      });
    }
  };

  const handlePaste = () => {
    if (clipboard) {
      pasteBuilding();
      notifications.show({
        title: '已粘贴',
        message: '建筑粘贴成功',
        color: 'pink',
        autoClose: 2000,
        styles: {
          root: {
            backgroundColor: '#0A0A14',
            borderColor: NEON_PINK,
          },
          title: {
            color: NEON_PINK,
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 600,
          },
          description: {
            color: '#B0B0C0',
          },
        },
      });
    }
  };

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);

  const inputStyles = {
    input: {
      backgroundColor: DARK_GRAY,
      borderColor: 'rgba(0, 240, 255, 0.3)',
      color: '#E0E0E0',
      '&:focus': {
        borderColor: NEON_PINK,
      },
      '&[data-type="number"]': {
        color: '#E0E0E0',
      },
    },
    label: {
      color: '#B0B0C0',
      marginBottom: '4px',
      fontSize: '12px',
      fontWeight: 500,
    },
    error: {
      color: NEON_PINK,
    },
  };

  const selectStyles = {
    input: {
      backgroundColor: DARK_GRAY,
      borderColor: 'rgba(0, 240, 255, 0.3)',
      color: '#E0E0E0',
      '&:focus': {
        borderColor: NEON_PINK,
      },
    },
    label: {
      color: '#B0B0C0',
      marginBottom: '4px',
      fontSize: '12px',
      fontWeight: 500,
    },
    dropdown: {
      backgroundColor: DARK_PURPLE,
      borderColor: 'rgba(0, 240, 255, 0.3)',
    },
    option: {
      color: '#E0E0E0',
      backgroundColor: 'transparent',
      '&[data-hovered]': {
        backgroundColor: 'rgba(255, 46, 151, 0.2)',
        color: NEON_PINK,
      },
      '&[data-combobox-active-option]': {
        backgroundColor: 'rgba(255, 46, 151, 0.3)',
        color: NEON_PINK,
      },
    },
  };

  const sliderStyles = {
    root: {
      marginTop: '8px',
    },
    track: {
      backgroundColor: 'rgba(0, 240, 255, 0.2)',
    },
    bar: {
      backgroundColor: NEON_PINK,
    },
    thumb: {
      backgroundColor: NEON_PINK,
      borderColor: NEON_PINK,
      boxShadow: `0 0 8px ${NEON_PINK}80`,
    },
    label: {
      color: '#B0B0C0',
      fontSize: '12px',
      fontWeight: 500,
    },
  };

  if (!selectedBuilding) {
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
        <Text
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '16px',
            fontWeight: 700,
            color: NEON_PINK,
            textShadow: `0 0 8px ${NEON_PINK}60`,
            marginBottom: '16px',
            letterSpacing: '0.05em',
          }}
        >
          建筑属性
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
          未选中建筑
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
      }}
    >
      <Text
        style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '16px',
          fontWeight: 700,
          color: NEON_PINK,
          textShadow: `0 0 8px ${NEON_PINK}60`,
          marginBottom: '16px',
          letterSpacing: '0.05em',
        }}
      >
        建筑属性
      </Text>

      <Stack gap={12}>
        <Select
          label="类型"
          value={selectedBuilding.type}
          data={buildingTypeOptions}
          onChange={(value) => {
            if (value) updateBuilding(selectedBuilding.id, { type: value as BuildingType });
          }}
          styles={selectStyles}
          size="sm"
        />

        <Group grow>
          <NumberInput
            label="X 位置"
            value={selectedBuilding.x}
            min={0}
            step={1}
            onChange={(value) => {
              if (typeof value === 'number') updateBuilding(selectedBuilding.id, { x: value });
            }}
            styles={inputStyles}
            size="sm"
          />
          <NumberInput
            label="Y 位置"
            value={selectedBuilding.y}
            min={0}
            step={1}
            onChange={(value) => {
              if (typeof value === 'number') updateBuilding(selectedBuilding.id, { y: value });
            }}
            styles={inputStyles}
            size="sm"
          />
        </Group>

        <Group grow>
          <NumberInput
            label="宽度"
            value={selectedBuilding.width}
            min={10}
            step={1}
            onChange={(value) => {
              if (typeof value === 'number') updateBuilding(selectedBuilding.id, { width: value });
            }}
            styles={inputStyles}
            size="sm"
          />
          <NumberInput
            label="高度"
            value={selectedBuilding.height}
            min={10}
            step={1}
            onChange={(value) => {
              if (typeof value === 'number') updateBuilding(selectedBuilding.id, { height: value });
            }}
            styles={inputStyles}
            size="sm"
          />
        </Group>

        <div>
          <Text
            style={{
              color: '#B0B0C0',
              fontSize: '12px',
              fontWeight: 500,
              marginBottom: '6px',
            }}
          >
            窗户密度: {selectedBuilding.windowDensity}
          </Text>
          <Slider
            value={selectedBuilding.windowDensity}
            min={0}
            max={100}
            step={1}
            onChange={(value) => updateBuilding(selectedBuilding.id, { windowDensity: value })}
            styles={sliderStyles}
            size="sm"
          />
        </div>

        <Select
          label="窗户图案"
          value={selectedBuilding.windowPattern}
          data={windowPatternOptions}
          onChange={(value) => {
            if (value) updateBuilding(selectedBuilding.id, { windowPattern: value as WindowPattern });
          }}
          styles={selectStyles}
          size="sm"
        />

        <Group grow mt="md">
          <Button
            leftSection={<Copy size={14} />}
            variant="outline"
            onClick={handleCopy}
            style={{
              borderColor: 'rgba(0, 240, 255, 0.5)',
              color: '#00F0FF',
              backgroundColor: 'rgba(0, 240, 255, 0.08)',
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
            复制
          </Button>
          <Button
            leftSection={<Copy size={14} />}
            variant="outline"
            onClick={handlePaste}
            disabled={!clipboard}
            style={{
              borderColor: clipboard ? 'rgba(191, 64, 255, 0.5)' : 'rgba(100, 100, 100, 0.3)',
              color: clipboard ? '#BF40FF' : 'rgba(100, 100, 100, 0.5)',
              backgroundColor: clipboard ? 'rgba(191, 64, 255, 0.08)' : 'rgba(50, 50, 50, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (clipboard) {
                e.currentTarget.style.backgroundColor = 'rgba(191, 64, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(191, 64, 255, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = clipboard ? 'rgba(191, 64, 255, 0.08)' : 'rgba(50, 50, 50, 0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            粘贴
          </Button>
        </Group>

        <Button
          leftSection={<Trash2 size={14} />}
          color="red"
          variant="outline"
          onClick={() => removeBuilding(selectedBuilding.id)}
          style={{
            borderColor: 'rgba(255, 0, 60, 0.5)',
            color: '#FF003C',
            backgroundColor: 'rgba(255, 0, 60, 0.08)',
            marginTop: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 0, 60, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 0, 60, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 0, 60, 0.08)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          删除建筑
        </Button>
      </Stack>
    </div>
  );
}
