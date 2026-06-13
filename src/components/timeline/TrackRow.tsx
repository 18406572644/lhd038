import KeyframeBlock from './KeyframeBlock';
import { TimelineTrack } from '@/types';
import { DARK_GRAY, ELECTRIC_BLUE, withAlpha, NEON_YELLOW, NEON_PINK } from '@/utils/colors';
import { useDesignStore } from '@/store/useDesignStore';

interface TrackRowProps {
  track: TimelineTrack;
  selectedKeyframeId: string | null;
  onSelectKeyframe: (keyframeId: string | null) => void;
  onDragKeyframe: (trackId: string, keyframeId: string, newStartTime: number) => void;
  duration: number;
  trackWidth: number;
}

export default function TrackRow({
  track,
  selectedKeyframeId,
  onSelectKeyframe,
  onDragKeyframe,
  duration,
  trackWidth,
}: TrackRowProps) {
  const lightGroups = useDesignStore((s) => s.lightGroups);

  const handleDragUpdate = (keyframeId: string, newStartTime: number) => {
    onDragKeyframe(track.id, keyframeId, newStartTime);
  };

  const handleTrackClick = () => {
    onSelectKeyframe(null);
  };

  const getTrackTypeIndicator = () => {
    if (track.lightGroupId) {
      const lg = lightGroups.find((g) => g.id === track.lightGroupId);
      const color = lg?.color || NEON_PINK;
      return {
        color,
        label: '灯',
        title: lg ? `灯光群组: ${lg.name}` : '灯光群组',
      };
    }
    if (track.groupId) {
      return {
        color: NEON_YELLOW,
        label: '组',
        title: '建筑群组',
      };
    }
    return {
      color: ELECTRIC_BLUE,
      label: '建',
      title: '单栋建筑',
    };
  };

  const indicator = getTrackTypeIndicator();

  return (
    <div
      style={{
        display: 'flex',
        height: '40px',
        borderBottom: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.1)}`,
      }}
    >
      <div
        style={{
          width: '180px',
          minWidth: '180px',
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: withAlpha(DARK_GRAY, 0.5),
          borderRight: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.15)}`,
          overflow: 'hidden',
        }}
      >
        <div
          title={indicator.title}
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            backgroundColor: withAlpha(indicator.color, 0.2),
            border: `1px solid ${indicator.color}`,
            color: indicator.color,
            fontSize: '9px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 0 4px ${withAlpha(indicator.color, 0.4)}`,
          }}
        >
          {indicator.label}
        </div>
        <span
          style={{
            color: '#C0C0D0',
            fontSize: '12px',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
          }}
        >
          {track.label}
        </span>
      </div>
      <div
        onClick={handleTrackClick}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          backgroundImage: `
            linear-gradient(to right, ${withAlpha(ELECTRIC_BLUE, 0.06)} 1px, transparent 1px)
          `,
          backgroundSize: `${trackWidth / (duration / 2)}px 100%`,
        }}
      >
        {track.keyframes.map((keyframe) => (
          <KeyframeBlock
            key={keyframe.id}
            keyframe={keyframe}
            isSelected={selectedKeyframeId === keyframe.id}
            onDragStart={() => {}}
            onDragUpdate={handleDragUpdate}
            onClick={onSelectKeyframe}
            trackDuration={duration}
            trackWidth={trackWidth}
          />
        ))}
      </div>
    </div>
  );
}
