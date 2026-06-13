import { ActionIcon, Tooltip } from '@mantine/core';
import { Building2, Home, Radio, Fence } from 'lucide-react';
import { useDesignStore } from '@/store/useDesignStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { BuildingType } from '@/types';
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

interface BuildingRendererProps {
  vertical?: boolean;
}

export default function BuildingRenderer({ vertical = false }: BuildingRendererProps) {
  const addBuilding = useDesignStore((s) => s.addBuilding);
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
    </div>
  );
}
