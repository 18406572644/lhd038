import KeyframeBlock from './KeyframeBlock';
import { TimelineTrack } from '@/types';
import { DARK_GRAY, ELECTRIC_BLUE, withAlpha } from '@/utils/colors';

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
  const handleDragUpdate = (keyframeId: string, newStartTime: number) => {
    onDragKeyframe(track.id, keyframeId, newStartTime);
  };

  const handleTrackClick = () => {
    onSelectKeyframe(null);
  };

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
          backgroundColor: withAlpha(DARK_GRAY, 0.5),
          borderRight: `1px solid ${withAlpha(ELECTRIC_BLUE, 0.15)}`,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            color: '#C0C0D0',
            fontSize: '12px',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
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
