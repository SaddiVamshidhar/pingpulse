// Lightweight SVG line chart of response times (oldest on the left).
// DOWN checks are drawn as red markers on the baseline.
const W = 800;
const H = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 52 };

const LatencyChart = ({ checks }) => {
  const data = [...checks].reverse();
  if (data.length < 2) return <p className="muted">Waiting for more checks to draw the chart...</p>;

  const maxMs = Math.max(100, ...data.map((c) => c.responseTime || 0));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (i / (data.length - 1)) * innerW;
  const y = (ms) => PAD.top + innerH - (ms / maxMs) * innerH;

  const points = data
    .map((c, i) => (c.status === 'UP' && c.responseTime != null ? `${x(i)},${y(c.responseTime)}` : null))
    .filter(Boolean)
    .join(' ');
  const ticks = [0, 0.5, 1].map((f) => Math.round(maxMs * f));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Response time chart">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="gridline" />
          <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="axis">{t} ms</text>
        </g>
      ))}
      <polyline points={points} className="line" />
      {data.map((c, i) =>
        c.status === 'DOWN' ? (
          <circle key={c._id} cx={x(i)} cy={y(0)} r="5" className="down-marker">
            <title>{c.error || `HTTP ${c.statusCode}`}</title>
          </circle>
        ) : null
      )}
      <text x={PAD.left} y={H - 6} className="axis">
        {new Date(data[0].checkedAt).toLocaleTimeString()}
      </text>
      <text x={W - PAD.right} y={H - 6} textAnchor="end" className="axis">
        {new Date(data[data.length - 1].checkedAt).toLocaleTimeString()}
      </text>
    </svg>
  );
};

export default LatencyChart;
