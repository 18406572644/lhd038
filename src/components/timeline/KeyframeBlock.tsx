import { useRef, useCallback, useEffect } from 'react';
import { Keyframe } from '@/types';
import { NEON_PINK, withAlpha } from '@/utils/colors';

interface KeyframeBlockProps {
  keyframe: Keyframe;
  isSelected: boolean;
  onDragStart: (keyframeId: string, startTime: number) => void;
  onDragUpdate: (keyframeId: string, newStartTime: number) => void;
  onClick: (keyframeId: string) => void;
  trackDuration: number;
  trackWidth: number;
}

export default function KeyframeBlock({
  keyframe,
  isSelected,
  onDragStart,
  onDragUpdate,
  onClick,
  trackDuration,
  trackWidth,
}: KeyframeBlockProps) {
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startStartTimeRef = useRef(0);

  const left = (keyframe.startTime / trackDuration) * trackWidth;
  const width = Math.max(((keyframe.endTime - keyframe.startTime) / trackDuration) * trackWidth, 4);
  const duration = keyframe.endTime - keyframe.startTime;

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - startXRef.current;
      const deltaTime = (deltaX / trackWidth) * trackDuration;
      let newStartTime = startStartTimeRef.current + deltaTime;

      newStartTime = Math.max(0, Math.min(newStartTime, trackDuration - duration));

      onDragUpdate(keyframe.id, newStartTime);
    },
    [keyframe.id, onDragUpdate, trackDuration, trackWidth, duration]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onClick(keyframe.id);
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      startStartTimeRef.current = keyframe.startTime;
      onDragStart(keyframe.id, keyframe.startTime);

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    },
    [keyframe.id, keyframe.startTime, onClick, onDragStart, handleMouseMove, handleMouseUp]
  );

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: '4px',
        width: `${width}px`,
        height: '32px',
        backgroundColor: withAlpha(keyframe.color, 0.4),
        border: `1px solid ${NEON_PINK}`,
        borderRadius: '3px',
        cursor: 'grab',
        transition: 'box-shadow 0.2s ease',
        boxShadow: isSelected
          ? `0 0 8px ${NEON_PINK}, 0 0 16px ${withAlpha(NEON_PINK, 0.5)}, inset 0 0 6px ${withAlpha(NEON_PINK, 0.3)}`
          : `0 0 4px ${withAlpha(NEON_PINK, 0.3)}`,
        userSelect: 'none',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!isSelected && !isDraggingRef.current) {
          e.currentTarget.style.boxShadow = `0 0 8px ${NEON_PINK}, 0 0 12px ${withAlpha(NEON_PINK, 0.4)}`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected && !isDraggingRef.current) {
          e.currentTarget.style.boxShadow = `0 0 4px ${withAlpha(NEON_PINK, 0.3)}`;
        }
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: NEON_PINK,
          opacity: 0.8,
        }}
      />
    </div>
  );
}
