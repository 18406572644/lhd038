import { ActionIcon, Tooltip, Divider } from '@mantine/core';
import { Building2, Home, Radio, Fence, Layers, ShoppingBag } from 'lucide-react';
import { useDesignStore } from '@/store/useDesignStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { BuildingType, BuildingGroup } from '@/types';
import { hexToRgb } from '@/utils/colors';

const BUILDING_TYPES: {
  type: BuildingType;
  label: string;
  icon: typeof Building2;
  color: string;
  defaultWidth: number;
  defaultHeight: number;
}[] = [
  { type: 'office', label: '写字楼', icon: Building2, color: '#FF2E97', defaultWidth: 80, defaultHeight: 200 },
  { type: 'residential', label: '住宅', icon: Home, color: '#00F0FF', defaultWidth: 60, defaultHeight: 120 },
  { type: 'tower', label: '塔楼', icon: Radio, color: '#BF40FF', defaultWidth: 40, defaultHeight: 280 },
  { type: 'bridge', label: '桥梁', icon: Fence, color: '#FFE600', defaultWidth: 160, defaultHeight: 40 },
];

interface PresetGroup {
  name: string;
  description: string;
  icon: typeof Layers;
  color: string;
  buildings: Array<{
    type: BuildingType;
    x: number;
    y: number;
    width: number;
    height: number;
    windowDensity: number;
    windowPattern: 'grid' | 'random' | 'strip';
  }>;
}

const PRESET_GROUPS: PresetGroup[] = [
  {
    name: '商铺连排',
    description: '一排连续的商铺建筑',
    icon: ShoppingBag,
    color: '#FF6B2B',
    buildings: [
      { type: 'office', x: 0, y: 0, width: 60, height: 120, windowDensity: 70, windowPattern: 'grid' },
      { type: 'office', x: 70, y: -10, width: 60, height: 130, windowDensity: 70, windowPattern: 'grid' },
      { type: 'office', x: 140, y: 5, width: 60, height: 115, windowDensity: 70, windowPattern: 'grid' },
      { type: 'office', x: 210, y: -5, width: 60, height: 125, windowDensity: 70, windowPattern: 'grid' },
    ],
  },
  {
    name: '塔楼群',
    description: '一组高低错落的塔楼',
    icon: Layers,
    color: '#BF40FF',
    buildings: [
      { type: 'tower', x: 0, y: -40, width: 45, height: 260, windowDensity: 85, windowPattern: 'strip' },
      { type: 'tower', x: 60, y: 20, width: 35, height: 200, windowDensity: 80, windowPattern: 'grid' },
      { type: 'tower', x: 110, y: -60, width: 50, height: 280, windowDensity: 90, windowPattern: 'strip' },
    ],
  },
];

interface BuildingRendererProps {
  vertical?: boolean;
}

export default function BuildingRenderer({ vertical = false }: BuildingRendererProps) {
  const addBuilding = useDesignStore((s) => s.addBuilding);
  const createGroup = useDesignStore((s) => s.createGroup);
  const canvasWidth = useCanvasStore((s) => s.canvasWidth);
  const canvasHeight = useCanvasStore((s) => s.canvasHeight);

  const handleAdd = (bt: (typeof BUILDING_TYPES)[number]) => {
    const building = {
      id: crypto.randomUUID(),
      type: bt.type,
      x: canvasWidth / 2 - bt.defaultWidth / 2,
      y: canvasHeight - bt.defaultHeight - 60,
      width: bt.defaultWidth,
      height: bt.defaultHeight,
      windowDensity: 60,
      windowPattern: 'grid' as const,
    };
    addBuilding(building);
  };

  const handleAddPresetGroup = (pg: PresetGroup) => {
    const startX = canvasWidth / 2 - 150;
    const startY = canvasHeight - 200;

    const buildingIds: string[] = [];

    pg.buildings.forEach((b) => {
      const newBuilding = {
        id: crypto.randomUUID(),
        type: b.type,
        x: startX + b.x,
        y: startY + b.y,
        width: b.width,
        height: b.height,
        windowDensity: b.windowDensity,
        windowPattern: b.windowPattern,
      };
      addBuilding(newBuilding);
      buildingIds.push(newBuilding.id);
    });

    if (buildingIds.length >= 2) {
      createGroup(buildingIds, pg.name);
    }
  };

  return (
    <div className={`flex ${vertical ? 'flex-col items-center' : 'items-center'} gap-2`}>
      {BUILDING_TYPES.map((bt) => {
        const rgb = hexToRgb(bt.color);
        return (
          <Tooltip key={bt.type} label={bt.label} withArrow position={vertical ? 'right' : 'bottom'}>
            <ActionIcon
              variant="outline"
              size="lg"
              onClick={() => handleAdd(bt)}
              style={{
                borderColor: bt.color,
                color: bt.color,
                backgroundColor: 'rgba(26, 26, 40, 0.8)',
                textShadow: `0 0 6px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
              }}
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
                    boxShadow: `0 0 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4), 0 0 24px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                    textShadow: `0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`,
                  },
                },
              }}
            >
              <bt.icon size={18} />
            </ActionIcon>
          </Tooltip>
        );
      })}

      <Divider
        orientation={vertical ? 'horizontal' : 'vertical'}
        color="rgba(0, 240, 255, 0.2)"
        mx={4}
      />

      {PRESET_GROUPS.map((pg) => {
        const rgb = hexToRgb(pg.color);
        return (
          <Tooltip
            key={pg.name}
            label={`${pg.name} - ${pg.description}`}
            withArrow
            position={vertical ? 'right' : 'bottom'}
          >
            <ActionIcon
              variant="outline"
              size="lg"
              onClick={() => handleAddPresetGroup(pg)}
              style={{
                borderColor: pg.color,
                color: pg.color,
                backgroundColor: 'rgba(26, 26, 40, 0.8)',
                textShadow: `0 0 6px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
              }}
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
                    boxShadow: `0 0 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4), 0 0 24px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                    textShadow: `0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`,
                  },
                },
              }}
            >
              <pg.icon size={18} />
            </ActionIcon>
          </Tooltip>
        );
      })}
    </div>
  );
}
