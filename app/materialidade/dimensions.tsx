import React from 'react';
import { Icon } from './icons';
import { AIFlat } from './components';
import { Card } from './components';
import { PUBLICOS, PUBLICO_BY_ID, getDimValue, sentColor, type Theme } from './data';

/* ============================================================
   DIMENSÕES
   ============================================================ */
export const DIMENSOES = [
  {
    id: 'sentimento',
    label: 'Sentimento',
    range: [-100, 100],
    unit: '',
    nota: 'Sentimento varia de −100 a +100. Valores negativos = tema abordado como fragilidade ou risco. Valores positivos = tratado como força ou oportunidade. "—" = sem dado qualitativo daquele público.',
  },
  {
    id: 'relevancia',
    label: 'Relevância',
    range: [0, 100],
    unit: '',
    nota: 'Relevância varia de 0 a 100. Para públicos consultados: média ponderada das respostas (relevância para os stakeholders). Para a Alta Liderança: consulta direta com a C-Level (relevância para o negócio, Eixo X da matriz).',
  },
];

export const DIM_BY_ID = Object.fromEntries(DIMENSOES.map(d => [d.id, d]));

/* ============================================================
   Color scales
   ============================================================ */
export function dimCellBg(dimId: string, v: number | null): string {
  if (v == null) return '#FCFCFC';
  if (dimId === 'sentimento') {
    if (v <= -75) return '#F8B4B4';
    if (v <= -40) return '#FBC9C9';
    if (v <= -15) return '#FDDFDF';
    if (v < 0)    return '#FEF0F0';
    if (v < 15)   return '#F0FAF4';
    if (v < 40)   return '#D6F5E3';
    if (v < 75)   return '#B8F0D2';
    return                '#7AE2AB';
  }
  if (v < 40) return '#FFFFFF';
  if (v < 60) return '#F4ECFB';
  if (v < 80) return '#E0CBF1';
  return            '#C29DE3';
}

export function dimCellFg(dimId: string, v: number | null): string {
  if (v == null) return '#AA95BE';
  if (dimId === 'sentimento') {
    if (v <= -40) return '#7A1414';
    if (v < 0)    return '#992E2E';
    if (v < 40)   return '#08533B';
    return            '#054D33';
  }
  if (v < 40) return '#525252';
  if (v < 60) return '#5B21B6';
  return            '#3C0366';
}

/* ============================================================
   DimensionRadio
   ============================================================ */
interface DimensionRadioProps {
  value: string;
  onChange: (id: string) => void;
  options?: typeof DIMENSOES;
}

export function DimensionRadio({ value, onChange, options = DIMENSOES }: DimensionRadioProps) {
  return (
    <div role="radiogroup" style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: 3, borderRadius: 999,
      background: '#FAFAFA', border: '1px solid var(--hu-border)',
    }}>
      {options.map(opt => {
        const isActive = opt.id === value;
        return (
          <button key={opt.id}
            role="radio" aria-checked={isActive}
            onClick={() => onChange(opt.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 14px', borderRadius: 999,
              border: 0, cursor: 'pointer',
              background: isActive ? '#7401C3' : 'transparent',
              color: isActive ? '#fff' : '#525252',
              fontSize: 12.5, fontWeight: isActive ? 700 : 500,
              transition: 'background 160ms, color 160ms',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F0EBF4'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
            <span style={{
              width: 14, height: 14, borderRadius: 999, flexShrink: 0,
              background: isActive ? '#fff' : 'transparent',
              border: isActive ? '0' : '1.5px solid #AA95BE',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isActive && <span style={{ width: 6, height: 6, borderRadius: 999, background: '#7401C3' }}/>}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   Format value cell
   ============================================================ */
export function fmtDimValue(dimId: string, v: number | null): string {
  if (v == null) return '—';
  if (dimId === 'sentimento') return (v > 0 ? '+' : '') + v;
  return String(Math.round(v));
}

/* ============================================================
   HEATMAP "Sentimento por público"
   ============================================================ */
interface HeatmapSentimentoBlockProps {
  themes: Theme[];
  activePublicos: string[];
  onPickTheme: (id: number) => void;
}

export function HeatmapSentimentoBlock({ themes, activePublicos, onPickTheme }: HeatmapSentimentoBlockProps) {
  const [dim, setDim] = React.useState('sentimento');
  const dimDef = DIM_BY_ID[dim];

  const cols = [
    ...PUBLICOS.map(p => ({ id: p.id, label: p.label, short: p.short, kind: 'publico' as const })),
    { id: 'alta_lideranca', label: 'Alta Liderança', short: 'Alta Lid.', kind: 'al' as const },
  ];

  const allActive = activePublicos.length === 0 || activePublicos.length === PUBLICOS.length;
  const isDimmed = (col: { id: string; kind: string }) => {
    if (col.kind === 'al') return false;
    if (allActive) return false;
    return !activePublicos.includes(col.id);
  };

  return (
    <div className="hu-fade" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 18, flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: '#737373', marginBottom: 4,
          }}>Sentimento por público</div>
          <h3 style={{
            fontFamily: 'var(--hu-font-display)', fontWeight: 700, fontSize: 18,
            color: '#0A0A0A', letterSpacing: '-0.01em', margin: 0,
          }}>Comparação multi-stakeholder em 3 dimensões</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: '#737373',
          }}>Dimensão</span>
          <DimensionRadio value={dim} onChange={setDim}/>
        </div>
      </div>

      <div style={{
        fontSize: 11.5, color: '#737373',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <span>Faixa: <b style={{ color: '#0A0A0A', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {dimDef.range[0]} a {dimDef.range[1]}
        </b></span>
        <span style={{ width: 1, height: 12, background: 'var(--hu-border)' }}/>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="info" size={12} color="#AA95BE"/>
          Clique em uma linha para abrir o tema correspondente
        </span>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA' }}>
                <th style={{
                  textAlign: 'left', padding: '12px 16px',
                  fontSize: 11.5, fontWeight: 600, color: '#525252',
                  borderBottom: '1px solid #F0F0F0', width: 320, minWidth: 280,
                  letterSpacing: '0.02em',
                }}>Tema</th>
                {cols.map(c => {
                  const dimmed = isDimmed(c);
                  return (
                    <th key={c.id} style={{
                      textAlign: 'center', padding: '12px 8px',
                      fontSize: 11, fontWeight: 600, color: c.kind === 'al' ? '#5A0992' : '#525252',
                      borderBottom: '1px solid #F0F0F0',
                      background: dimmed ? '#F4F4F5' : (c.kind === 'al' ? '#F6EDFB' : '#FAFAFA'),
                      borderLeft: c.kind === 'al' ? '1px solid #E8D9F2' : 'none',
                      letterSpacing: '0.02em',
                      opacity: dimmed ? 0.55 : 1,
                      whiteSpace: 'nowrap',
                    }}>{c.label}</th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {themes.map(t => (
                <HeatmapRow key={t.id} theme={t} cols={cols} dim={dim}
                  onClick={() => onPickTheme(t.id)} isDimmed={isDimmed}/>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          padding: '12px 20px 14px',
          background: '#FCFAFD',
          borderTop: '1px solid #F0F0F0',
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <ScaleLegend dim={dim}/>
          <div style={{ flex: 1, minWidth: 200, fontSize: 11, color: '#737373', lineHeight: 1.55 }}>
            {dimDef.nota}
          </div>
        </div>
      </Card>
    </div>
  );
}

function HeatmapRow({ theme, cols, dim, onClick, isDimmed }: {
  theme: Theme;
  cols: { id: string; label: string; kind: string }[];
  dim: string;
  onClick: () => void;
  isDimmed: (col: { id: string; kind: string }) => boolean;
}) {
  const [hov, setHov] = React.useState(false);
  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: 'pointer',
        background: hov ? '#FAFAFA' : 'transparent',
        transition: 'background 120ms',
      }}>
      <td style={{
        padding: '11px 16px',
        borderBottom: '1px solid #F0F0F0',
        fontSize: 13, fontWeight: hov ? 700 : 500, color: '#0A0A0A',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
            background: '#EFE3F8', color: '#5A0992',
            fontFamily: 'var(--hu-font-display)', fontWeight: 900, fontSize: 10.5,
            letterSpacing: '-0.02em',
          }}>{String(theme.id).padStart(2, '0')}</span>
          <span style={{
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            display: 'inline-block', maxWidth: 260,
          }}>{theme.nome}</span>
        </div>
      </td>
      {cols.map(c => {
        const v = getDimValue(theme, c.id, dim);
        const dimmed = isDimmed(c);
        const bg = dimmed ? '#FAFAFA' : dimCellBg(dim, v);
        const fg = dimCellFg(dim, v);
        return (
          <td key={c.id} style={{
            padding: '0',
            borderBottom: '1px solid #F0F0F0',
            borderLeft: c.kind === 'al' ? '1px solid #E8D9F2' : 'none',
            textAlign: 'center',
            background: bg,
            opacity: dimmed ? 0.55 : (hov ? 0.92 : 1),
            transition: 'opacity 140ms, background 200ms',
          }}>
            <div style={{
              padding: '11px 8px',
              fontFamily: 'var(--hu-font-display)', fontWeight: 700,
              fontSize: 13.5, color: fg,
              fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
            }}>{fmtDimValue(dim, v)}</div>
          </td>
        );
      })}
    </tr>
  );
}

function ScaleLegend({ dim }: { dim: string }) {
  if (dim === 'sentimento') {
    const stops = [
      { v: '−100', bg: '#F8B4B4' },
      { v: '−50',  bg: '#FDDFDF' },
      { v: '0',    bg: '#FFFFFF' },
      { v: '+50',  bg: '#D6F5E3' },
      { v: '+100', bg: '#7AE2AB' },
    ];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#737373', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Escala</span>
        {stops.map(s => (
          <span key={s.v} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: 36, height: 22, borderRadius: 4,
            background: s.bg, border: '1px solid #F0F0F0',
            fontSize: 10.5, fontWeight: 700, color: '#525252',
            fontVariantNumeric: 'tabular-nums',
          }}>{s.v}</span>
        ))}
      </div>
    );
  }
  const stops = [
    { v: '0-40',   bg: '#FFFFFF' },
    { v: '40-60',  bg: '#F4ECFB' },
    { v: '60-80',  bg: '#E0CBF1' },
    { v: '80-100', bg: '#C29DE3' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#737373', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Escala</span>
      {stops.map(s => (
        <span key={s.v} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 56, height: 22, borderRadius: 4,
          background: s.bg, border: '1px solid #F0F0F0',
          fontSize: 10.5, fontWeight: 700, color: '#525252',
          fontVariantNumeric: 'tabular-nums',
        }}>{s.v}</span>
      ))}
    </div>
  );
}

/* ============================================================
   VISÃO DOS STAKEHOLDERS
   ============================================================ */
interface VisaoStakeholdersBlockProps {
  theme: Theme;
}

export function VisaoStakeholdersBlock({ theme }: VisaoStakeholdersBlockProps) {
  const [dim, setDim] = React.useState('sentimento');
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const dimDef = DIM_BY_ID[dim];

  const relevs = theme.por_publico.map(p => p.relevancia);
  const maxRel = Math.max(...relevs);
  const minRel = Math.min(...relevs);
  const gapRel = maxRel - minRel;
  const maxPub = theme.por_publico.find(p => p.relevancia === maxRel);
  const minPub = theme.por_publico.find(p => p.relevancia === minRel);

  const toggleExpand = (pubId: string) => {
    setExpanded(prev => prev.includes(pubId) ? prev.filter(p => p !== pubId) : [...prev, pubId]);
  };

  const stakeholderRows = [
    { id: 'agregado', label: 'Stakeholders (agregado)', highlight: true, hint: 'média ponderada', hasCargo: false, isMax: false, isMin: false },
    ...PUBLICOS.map(p => ({
      id: p.id, label: p.label, icon: p.icon, hint: `peso ${p.peso}×`,
      n_amostra: theme.por_publico.find(pp => pp.publico === p.id)?.n_amostra,
      isMax: p.id === maxPub?.publico && gapRel > 0,
      isMin: p.id === minPub?.publico && gapRel > 0 && minPub !== maxPub,
      hasCargo: p.id === 'interno' && Array.isArray(theme.por_cargo),
      highlight: false,
    })),
  ];
  const alRow = { id: 'alta_lideranca', label: 'Alta Liderança', hint: 'consulta direta · Eixo X' };

  return (
    <div className="hu-fade" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {gapRel >= 12 && maxPub && minPub && (
        <AIFlat tone="warning" footer={false}
          title="Divergência entre públicos"
          sintese={
            <span>
              Há <b>{gapRel}pp</b> de diferença na relevância entre os públicos. <b>{PUBLICO_BY_ID[maxPub.publico]?.label}</b> avalia em <b>{maxPub.relevancia}%</b>; <b>{PUBLICO_BY_ID[minPub.publico]?.label}</b> em <b>{minPub.relevancia}%</b>. Vale endereçar antes do próximo ciclo.
            </span>
          }
        />
      )}

      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '18px 24px 14px',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 14, flexWrap: 'wrap',
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0A0A0A' }}>Visão dos stakeholders sobre o tema</div>
            <div style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>
              Comparativo dos 5 públicos consultados + leitura direta da Alta Liderança.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#737373',
            }}>Dimensão</span>
            <DimensionRadio value={dim} onChange={setDim}/>
          </div>
        </div>

        <div style={{ padding: '6px 24px 8px' }}>
          {stakeholderRows.map(r => (
            <React.Fragment key={r.id}>
              <VisaoRow row={r} theme={theme} dim={dim}
                expanded={expanded.includes(r.id)}
                onToggle={r.hasCargo ? () => toggleExpand(r.id) : null}/>
              {r.hasCargo && expanded.includes(r.id) && theme.por_cargo?.map(c => (
                <CargoSubRow key={c.cargo} cargo={c} dim={dim}/>
              ))}
            </React.Fragment>
          ))}
          <div style={{
            margin: '10px 4px 6px',
            paddingTop: 12, paddingBottom: 4,
            borderTop: '1px dashed #E8D9F2',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: '0.10em',
              textTransform: 'uppercase', color: '#AA95BE',
            }}>Consulta direta</span>
          </div>
          <VisaoRow row={alRow} theme={theme} dim={dim} isAL/>
        </div>

        <div style={{
          padding: '12px 24px 12px',
          background: '#FCFAFD',
          borderTop: '1px solid #F0F0F0',
          fontSize: 11.5, color: '#525252', lineHeight: 1.55,
        }}>{dimDef.nota}</div>

        <div style={{
          background: '#FAFAFA',
          borderTop: '1px solid var(--hu-border)',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 11.5, color: '#525252',
        }}>
          <Icon name="shield" size={14} color="#7401C3"/>
          <span>
            <b>Regra dos 5 · LGPD</b> — segmentos com menos de 5 respostas são mascarados como
            <i> "amostra insuficiente"</i> para evitar reidentificação.
          </span>
        </div>
      </div>
    </div>
  );
}

interface VisaoRowProps {
  row: {
    id: string;
    label: string;
    icon?: string;
    hint?: string;
    highlight?: boolean;
    hasCargo?: boolean;
    isMax?: boolean;
    isMin?: boolean;
    n_amostra?: number;
  };
  theme: Theme;
  dim: string;
  isAL?: boolean;
  expanded?: boolean;
  onToggle?: (() => void) | null;
}

function VisaoRow({ row, theme, dim, isAL, expanded, onToggle }: VisaoRowProps) {
  const [hov, setHov] = React.useState(false);
  const v = getDimValue(theme, row.id, dim);
  const isSent = dim === 'sentimento';
  const isHighlight = row.highlight;
  const BAR_H = 14;

  let barRender: React.ReactNode;
  if (v == null) {
    barRender = (
      <div style={{ width: '100%', height: BAR_H, position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(45deg, #F4F4F5, #F4F4F5 4px, #FAFAFA 4px, #FAFAFA 8px)',
          borderRadius: BAR_H / 2,
        }}/>
      </div>
    );
  } else if (isSent) {
    const valPct = Math.abs(v) / 100 * 50;
    const pos = v >= 0;
    const gradPos = 'linear-gradient(to right, #7AE2AB, #00A970)';
    const gradNeg = 'linear-gradient(to left, #F8B4B4, #E03131)';
    barRender = (
      <div style={{ width: '100%', height: BAR_H, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: '#F4F4F5', borderRadius: BAR_H / 2 }}/>
        <div style={{
          position: 'absolute', left: '50%', top: -2, bottom: -2,
          width: 1, marginLeft: -0.5, background: '#AA95BE',
        }}/>
        <div style={{
          position: 'absolute', top: 0, height: BAR_H,
          left: pos ? '50%' : (50 - valPct) + '%',
          width: valPct + '%',
          background: pos ? gradPos : gradNeg,
          borderRadius: BAR_H / 2,
          transition: 'width 240ms cubic-bezier(0.22, 0.61, 0.36, 1), left 240ms',
        }}/>
      </div>
    );
  } else {
    barRender = (
      <div style={{ width: '100%', height: BAR_H, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: '#F4F4F5', borderRadius: BAR_H / 2 }}/>
        <div style={{
          position: 'absolute', top: 0, height: BAR_H,
          left: 0, width: v + '%',
          background: 'linear-gradient(to right, #B280E0, #7401C3)',
          borderRadius: BAR_H / 2,
          transition: 'width 240ms cubic-bezier(0.22,0.61,0.36,1)',
        }}/>
        {[25, 50, 75].map(t => (
          <div key={t} style={{
            position: 'absolute', left: t + '%', top: -2, bottom: -2,
            width: 1, background: '#E0CBF1',
          }}/>
        ))}
      </div>
    );
  }

  return (
    <div
      onClick={onToggle || undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(180px, 240px) minmax(140px, 1fr) minmax(54px, 60px) minmax(40px, 56px) 20px',
        gap: 14, alignItems: 'center',
        padding: '10px 12px',
        borderRadius: 8,
        background: isHighlight ? '#FAFAFA' : (isAL ? '#F6EDFB' : (hov ? '#FCFAFD' : 'transparent')),
        marginBottom: 2,
        cursor: onToggle ? 'pointer' : 'default',
        transition: 'background 120ms',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {row.icon && (
          <span style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            background: '#F4F4F5',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={row.icon} size={12} color="#525252"/>
          </span>
        )}
        {isAL && (
          <span style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            background: '#7401C3', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--hu-font-display)', fontWeight: 900, fontSize: 10,
            letterSpacing: '-0.02em',
          }}>AL</span>
        )}
        {isHighlight && (
          <span style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            background: '#EFE3F8',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="users" size={12} color="#5A0992"/>
          </span>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 13,
              fontWeight: isHighlight || isAL ? 700 : 500,
              color: isAL ? '#3C0366' : '#0A0A0A',
              whiteSpace: 'nowrap',
            }}>{row.label}</span>
            {row.isMax && (
              <span style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: '#5A0992', background: '#EFE3F8', padding: '2px 6px', borderRadius: 999,
                whiteSpace: 'nowrap',
              }}>Maior relev.</span>
            )}
            {row.isMin && (
              <span style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: '#737373', background: '#F4F4F5', padding: '2px 6px', borderRadius: 999,
                whiteSpace: 'nowrap',
              }}>Menor</span>
            )}
          </div>
          {row.hint && (
            <div style={{ fontSize: 11, color: '#737373' }}>
              {row.hint}
              {row.hasCargo && <span> · clique para ver por cargo</span>}
            </div>
          )}
        </div>
      </div>

      <div>{barRender}</div>

      <div style={{
        textAlign: 'right',
        fontFamily: 'var(--hu-font-display)', fontWeight: 700,
        fontSize: 15, color: v == null ? '#AA95BE' : (isSent ? sentColor(v) : '#3C0366'),
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
      }}>{fmtDimValue(dim, v)}</div>

      <div style={{
        textAlign: 'right', fontSize: 11.5,
        color: v == null ? '#AA95BE' : '#737373', fontVariantNumeric: 'tabular-nums',
        fontStyle: v == null ? 'italic' : 'normal',
      }}>
        {v == null ? 'sem quali' : (isAL ? 'direta' : (row.n_amostra ? `n=${row.n_amostra}` : ''))}
      </div>

      <div style={{ textAlign: 'center' }}>
        {onToggle && (
          <span style={{
            display: 'inline-flex',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 180ms',
          }}>
            <Icon name="chevron-right" size={14} color="#AA95BE"/>
          </span>
        )}
      </div>
    </div>
  );
}

function CargoSubRow({ cargo, dim }: { cargo: { cargo: string; cargo_label: string; sentimento: number | null; relevancia: number | null; n_amostra: number; insuficiente: boolean }; dim: string }) {
  const isSent = dim === 'sentimento';
  const v = cargo.insuficiente ? null : (isSent ? cargo.sentimento : cargo.relevancia);
  const BAR_H = 10;

  let barRender: React.ReactNode;
  if (v == null) {
    barRender = (
      <div style={{ width: '100%', height: BAR_H, position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(45deg, #F4F4F5, #F4F4F5 3px, #FAFAFA 3px, #FAFAFA 6px)',
          borderRadius: BAR_H / 2,
        }}/>
      </div>
    );
  } else if (isSent) {
    const valPct = Math.abs(v) / 100 * 50;
    const pos = v >= 0;
    barRender = (
      <div style={{ width: '100%', height: BAR_H, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: '#F4F4F5', borderRadius: BAR_H / 2 }}/>
        <div style={{
          position: 'absolute', left: '50%', top: -1, bottom: -1,
          width: 1, marginLeft: -0.5, background: '#AA95BE',
        }}/>
        <div style={{
          position: 'absolute', top: 0, height: BAR_H,
          left: pos ? '50%' : (50 - valPct) + '%',
          width: valPct + '%',
          background: pos ? '#7AE2AB' : '#F8B4B4',
          borderRadius: BAR_H / 2,
        }}/>
      </div>
    );
  } else {
    barRender = (
      <div style={{ width: '100%', height: BAR_H, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: '#F4F4F5', borderRadius: BAR_H / 2 }}/>
        <div style={{
          position: 'absolute', top: 0, height: BAR_H,
          left: 0, width: v + '%',
          background: '#B280E0', borderRadius: BAR_H / 2,
        }}/>
      </div>
    );
  }

  return (
    <div className="hu-fade" style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(180px, 240px) minmax(140px, 1fr) minmax(54px, 60px) minmax(40px, 56px) 20px',
      gap: 14, alignItems: 'center',
      padding: '6px 12px 6px 40px',
      borderRadius: 8,
      background: '#FCFAFD',
      marginBottom: 2,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 4, height: 4, borderRadius: 999, background: '#AA95BE' }}/>
        <span style={{ fontSize: 12, color: '#525252' }}>{cargo.cargo_label}</span>
      </div>
      <div>{barRender}</div>
      <div style={{
        textAlign: 'right',
        fontFamily: 'var(--hu-font-display)', fontWeight: 700, fontSize: 12.5,
        color: cargo.insuficiente ? '#AA95BE' : (isSent ? sentColor(cargo.sentimento) : '#5B21B6'),
        fontVariantNumeric: 'tabular-nums',
      }}>{cargo.insuficiente ? '—' : fmtDimValue(dim, v)}</div>
      <div style={{
        textAlign: 'right', fontSize: 11,
        color: cargo.insuficiente ? '#C81E1E' : '#737373',
        fontVariantNumeric: 'tabular-nums',
        fontWeight: cargo.insuficiente ? 600 : 400,
        fontStyle: cargo.insuficiente ? 'italic' : 'normal',
      }}>{cargo.insuficiente ? 'n<5' : `n=${cargo.n_amostra}`}</div>
      <div/>
    </div>
  );
}
