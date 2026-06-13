import { useDesignStore } from '@/store/useDesignStore';
import { useCanvasStore } from '@/store/useCanvasStore';

export default function CanvasOverlay() {
  const buildingCount = useDesignStore((s) => s.buildings.length);
  const zoom = useCanvasStore((s) => s.zoom);
  const canvasWidth = useCanvasStore((s) => s.canvasWidth);
  const canvasHeight = useCanvasStore((s) => s.canvasHeight);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute top-3 left-3 flex flex-col gap-1.5"
        style={{
          backgroundColor: 'rgba(10, 10, 20, 0.7)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          borderRadius: 6,
          padding: '8px 12px',
        }}
      >
        <div
          className="text-xs font-semibold tracking-wide"
          style={{
            color: '#00F0FF',
            textShadow: '0 0 6px rgba(0, 240, 255, 0.4)',
            fontFamily: 'Rajdhani, sans-serif',
          }}
        >
          缩放: {Math.round(zoom * 100)}%
        </div>
        <div
          className="text-xs font-semibold tracking-wide"
          style={{
            color: '#FF2E97',
            textShadow: '0 0 6px rgba(255, 46, 151, 0.4)',
            fontFamily: 'Rajdhani, sans-serif',
          }}
        >
          建筑: {buildingCount}
        </div>
      </div>

      <div
        className="absolute bottom-3 left-3"
        style={{
          backgroundColor: 'rgba(10, 10, 20, 0.6)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(0, 240, 255, 0.1)',
          borderRadius: 6,
          padding: '6px 10px',
        }}
      >
        <span
          className="text-xs"
          style={{
            color: 'rgba(0, 240, 255, 0.5)',
            fontFamily: 'Rajdhani, sans-serif',
          }}
        >
          按住中键拖拽平移
        </span>
      </div>

      <div
        className="absolute bottom-3 right-3"
        style={{
          width: 120,
          height: 80,
          backgroundColor: 'rgba(10, 10, 20, 0.7)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <div
          className="w-full h-full relative"
          style={{ backgroundColor: '#0A0A14' }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 4,
              height: 4,
              backgroundColor: '#FF2E97',
              borderRadius: '50%',
              boxShadow: '0 0 6px rgba(255, 46, 151, 0.6)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: '1px solid rgba(0, 240, 255, 0.1)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
