import type { ClinicalRecord } from "../api/types";
import { formatDate } from "../utils/format";

const WIDTH = 560;
const HEIGHT = 160;
const PAD_X = 28;
const PAD_Y = 16;

// Gráfico de evolução da dor (EVA) ao longo das sessões — SVG desenhado à
// mão, sem biblioteca de gráficos: são poucos pontos e o projeto evita
// dependências pesadas para algo tão simples.
export function PainTrendChart({ records }: { records: ClinicalRecord[] }) {
  const points = records
    .filter((r): r is ClinicalRecord & { painScore: number } => r.painScore !== null)
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (points.length < 2) {
    return <p className="empty-note">Registre pelo menos duas sessões com dor (EVA) para ver o gráfico de evolução.</p>;
  }

  const innerW = WIDTH - PAD_X * 2;
  const innerH = HEIGHT - PAD_Y * 2;
  const stepX = innerW / (points.length - 1);
  const y = (score: number) => PAD_Y + innerH - (score / 10) * innerH;
  const coords = points.map((p, i) => ({ x: PAD_X + i * stepX, y: y(p.painScore), score: p.painScore, date: p.createdAt }));
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const first = points[0].painScore;
  const last = points[points.length - 1].painScore;
  const trend = last < first ? "success" : last > first ? "danger" : "neutral";
  const trendLabel = last < first ? "melhora" : last > first ? "piora" : "estável";

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: "100%", height: "auto" }} role="img" aria-label="Gráfico de evolução da dor">
        {[0, 5, 10].map((tick) => (
          <line
            key={tick}
            x1={PAD_X}
            x2={WIDTH - PAD_X}
            y1={y(tick)}
            y2={y(tick)}
            stroke="var(--border)"
            strokeWidth={1}
          />
        ))}
        <path d={path} fill="none" stroke="var(--brand)" strokeWidth={2} />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={3.5} fill="var(--brand)" />
        ))}
      </svg>
      <div className="badge-row" style={{ marginTop: 6 }}>
        <span className="muted small">
          {formatDate(coords[0].date)} (EVA {first}) → {formatDate(coords[coords.length - 1].date)} (EVA {last})
        </span>
        <span className={`badge badge-${trend}`}>{trendLabel}</span>
      </div>
    </div>
  );
}
