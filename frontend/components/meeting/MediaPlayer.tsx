import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { formatTime } from "@/lib/format";

type Props = {
  currentTime: number;
  duration: number;
  playing: boolean;
  speed: number;
  onToggle: () => void;
  onSeek: (seconds: number) => void;
  onSpeedChange: (speed: number) => void;
};

export function MediaPlayer({
  currentTime,
  duration,
  playing,
  speed,
  onToggle,
  onSeek,
  onSpeedChange,
}: Props) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section className="mf-player" aria-label="Meeting playback controls">
      <button className="mf-player-play" type="button" onClick={onToggle}>
        {playing ? <Pause size={21} /> : <Play size={21} />}
      </button>

      <button
        className="mf-player-icon"
        type="button"
        onClick={() => onSeek(Math.max(0, currentTime - 10))}
        aria-label="Go back 10 seconds"
      >
        <RotateCcw size={16} />
        <small>10</small>
      </button>

      <span className="mf-player-time">{formatTime(currentTime)}</span>

      <div className="mf-player-track-wrap">
        <input
          className="mf-player-track"
          type="range"
          min={0}
          max={Math.max(duration, 1)}
          value={Math.min(currentTime, Math.max(duration, 1))}
          onChange={(event) => onSeek(Number(event.target.value))}
          style={{ "--progress": `${progress}%` } as React.CSSProperties}
          aria-label="Seek meeting playback"
        />
      </div>

      <span className="mf-player-time">{formatTime(duration)}</span>
      <Volume2 size={18} className="mf-player-volume" />

      <select
        className="mf-speed-select"
        value={speed}
        onChange={(event) => onSpeedChange(Number(event.target.value))}
        aria-label="Playback speed"
      >
        <option value={0.75}>0.75×</option>
        <option value={1}>1×</option>
        <option value={1.25}>1.25×</option>
        <option value={1.5}>1.5×</option>
        <option value={2}>2×</option>
      </select>
    </section>
  );
}
