import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  Activity,
  AlertCircle,
} from 'lucide-react';
import type { TimelineEventItem } from '../../types/investigation';

interface TimelineProps {
  events: TimelineEventItem[];
  currentTime: number; // -10 to +3
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeekTime: (time: number) => void;
  onSelectEvent: (event: TimelineEventItem) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  currentTime,
  isPlaying,
  onTogglePlay,
  onSeekTime,
  onSelectEvent,
}) => {
  const minTime = -10;
  const maxTime = 3;
  const range = maxTime - minTime;
  const [isDragging, setIsDragging] = useState(false);

  // Format time as T - 04.20s or T + 01.50s or T = 00.00s
  const formatTime = (t: number) => {
    if (Math.abs(t) < 0.05) return 'T = 00.00s';
    const sign = t > 0 ? '+' : '-';
    const abs = Math.abs(t).toFixed(2).padStart(5, '0');
    return `T ${sign} ${abs}s`;
  };

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => a.timeSeconds - b.timeSeconds);

  // Find active event closest to current time
  const currentEvent = sortedEvents.reduce((prev, curr) => {
    return Math.abs(curr.timeSeconds - currentTime) < Math.abs(prev.timeSeconds - currentTime)
      ? curr
      : prev;
  });

  const handlePrevEvent = () => {
    const priorEvents = sortedEvents.filter((e) => e.timeSeconds < currentTime - 0.2);
    if (priorEvents.length > 0) {
      const target = priorEvents[priorEvents.length - 1];
      onSeekTime(target.timeSeconds);
      onSelectEvent(target);
    } else {
      onSeekTime(minTime);
    }
  };

  const handleNextEvent = () => {
    const nextEvents = sortedEvents.filter((e) => e.timeSeconds > currentTime + 0.2);
    if (nextEvents.length > 0) {
      const target = nextEvents[0];
      onSeekTime(target.timeSeconds);
      onSelectEvent(target);
    } else {
      onSeekTime(maxTime);
    }
  };

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetT = parseFloat((minTime + ratio * range).toFixed(2));
    onSeekTime(targetT);
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetT = parseFloat((minTime + ratio * range).toFixed(2));
    onSeekTime(targetT);
  };

  const handleTrackPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  return (
    <div style={{
      height: '84px',
      background: 'rgba(2, 6, 18, 0.96)',
      borderTop: '1px solid rgba(0, 240, 255, 0.18)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '20px',
      userSelect: 'none',
      position: 'relative',
      zIndex: 20,
    }}>
      {/* 1. Left: Transport Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Previous Keyframe */}
        <button
          onClick={handlePrevEvent}
          title="Previous Event Keyframe"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#00f0ff';
            e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <SkipBack size={13} />
        </button>

        {/* Play / Pause Toggle */}
        <button
          onClick={onTogglePlay}
          title={isPlaying ? 'Pause Simulation' : 'Play Kinematic Simulation'}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            background: isPlaying
              ? 'rgba(239, 68, 68, 0.2)'
              : 'rgba(0, 240, 255, 0.2)',
            border: isPlaying
              ? '1.5px solid #ef4444'
              : '1.5px solid #00f0ff',
            color: isPlaying ? '#ef4444' : '#00f0ff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isPlaying
              ? '0 0 12px rgba(239, 68, 68, 0.3)'
              : '0 0 12px rgba(0, 240, 255, 0.3)',
            transition: 'all 0.15s ease',
          }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
        </button>

        {/* Next Keyframe */}
        <button
          onClick={handleNextEvent}
          title="Next Event Keyframe"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#00f0ff';
            e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <SkipForward size={13} />
        </button>
      </div>

      {/* 2. Simulation Time Display Box */}
      <div style={{
        padding: '5px 12px',
        borderRadius: '6px',
        background: 'rgba(6, 18, 42, 0.8)',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        minWidth: '120px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '9px',
          color: '#64748b',
          letterSpacing: '0.8px',
        }}>
          <Clock size={10} />
          <span>SIMULATION CLOCK</span>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '14px',
          fontWeight: 800,
          color: '#00f0ff',
          letterSpacing: '0.8px',
        }}>
          {formatTime(currentTime)}
        </div>
      </div>

      {/* 3. Center: Interactive Scrubbing Track with Event Keyframe Nodes */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 12px',
      }}>
        {/* Track Line */}
        <div
          style={{
            position: 'relative',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '4px',
            cursor: 'pointer',
            touchAction: 'none',
          }}
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handleTrackPointerMove}
          onPointerUp={handleTrackPointerUp}
          onPointerCancel={handleTrackPointerUp}
        >
          {/* Active Fill Track */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${((currentTime - minTime) / range) * 100}%`,
            background: 'linear-gradient(90deg, #1e40af 0%, #00f0ff 100%)',
            borderRadius: '3px',
          }} />

          {/* Draggable Scrubber Needle */}
          <div style={{
            position: 'absolute',
            left: `calc(${((currentTime - minTime) / range) * 100}% - 7px)`,
            top: '-5px',
            width: '14px',
            height: '16px',
            background: '#ffffff',
            border: '2px solid #00f0ff',
            borderRadius: '3px',
            boxShadow: '0 0 10px #00f0ff',
            pointerEvents: 'none',
            zIndex: 15,
          }} />

          {/* Event Keyframe Pins */}
          {events.map((evt) => {
            const leftPercent = ((evt.timeSeconds - minTime) / range) * 100;
            const isImpact = evt.timestamp === 'T=0';
            const isNear = Math.abs(evt.timeSeconds - currentTime) < 0.5;

            return (
              <div
                key={evt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeekTime(evt.timeSeconds);
                  onSelectEvent(evt);
                }}
                style={{
                  position: 'absolute',
                  left: `calc(${leftPercent}% - 5px)`,
                  top: '-3px',
                  width: '10px',
                  height: '12px',
                  background: isImpact ? '#ef4444' : isNear ? '#00f0ff' : 'rgba(56, 189, 248, 0.7)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  border: isNear ? '1px solid #ffffff' : 'none',
                  boxShadow: isImpact ? '0 0 8px #ef4444' : isNear ? '0 0 8px #00f0ff' : 'none',
                  zIndex: 10,
                  transition: 'transform 0.15s ease',
                }}
                title={`${evt.timestamp}: ${evt.title}`}
              />
            );
          })}
        </div>

        {/* Keyframe Labels Row */}
        <div style={{
          position: 'relative',
          height: '24px',
          marginTop: '8px',
        }}>
          {events.map((evt) => {
            const leftPercent = ((evt.timeSeconds - minTime) / range) * 100;
            const isImpact = evt.timestamp === 'T=0';
            const isNear = Math.abs(evt.timeSeconds - currentTime) < 0.6;

            return (
              <div
                key={evt.id}
                onClick={() => {
                  onSeekTime(evt.timeSeconds);
                  onSelectEvent(evt);
                }}
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  transform: 'translateX(-50%)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: isImpact ? '10px' : '9px',
                  fontWeight: isNear || isImpact ? 800 : 500,
                  color: isImpact ? '#f87171' : isNear ? '#00f0ff' : '#94a3b8',
                }}>
                  {evt.timestamp}
                </span>
                <span style={{
                  fontSize: '9px',
                  color: isNear ? '#ffffff' : '#64748b',
                  display: isNear || isImpact ? 'block' : 'none',
                }}>
                  {evt.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Active Event Context Card (Right edge) */}
      <div style={{
        maxWidth: '240px',
        padding: '6px 12px',
        borderRadius: '6px',
        background: 'rgba(6, 18, 42, 0.7)',
        border: '1px solid rgba(0, 240, 255, 0.18)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Activity size={14} color="#00f0ff" style={{ flexShrink: 0 }} />
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '9px',
            color: '#38bdf8',
            fontWeight: 700,
          }}>
            CURRENT EVENT: {currentEvent.timestamp}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#e2e8f0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {currentEvent.title}
          </div>
        </div>
      </div>
    </div>
  );
};
