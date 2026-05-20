import React from 'react';
import { Icon, Pill, Btn } from './icons';
import { Card, PageHeader, SectionTitle, AIInsight } from './components';
import { HeatmapSentimentoBlock } from './dimensions';
import {
  VERSOES, PUBLICOS, PUBLICO_BY_ID, THEMES, ORG,
  recalcEixoY, recalcSent, scoreboard, cobertura,
  sentColor, fmtSent, themeStatus, INICIATIVAS,
  type Theme, type Versao,
} from './data';

/* ---------- Scorecard card ---------- */
interface ScoreCardProps {
  label: string;
  value: number | string;
  tone: 'neutral' | 'danger' | 'warning' | 'success' | 'brand';
  sublabel?: string;
  icon: string;
}

export function ScoreCard({ label, value, tone, sublabel, icon }: ScoreCardProps) {
  const colorMap: Record<string, string> = {
    neutral: '#0A0A0A',
    danger:  '#C81E1E',
    warning: '#B45309',
    success: '#009966',
    brand:   '#7401C3',
  };
  const bgMap: Record<string, string> = {
    neutral: '#F4F4F5',
    danger:  '#FCE2E2',
    warning: '#FDF6B2',
    success: '#DEF7EC',
    brand:   '#EFE3F8',
  };
  return (
    <Card style={{ padding: '18px 18px 16px', minHeight: 122, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: 'var(--hu-muted)',
            marginBottom: 8,
          }}>{label}</div>
          <div style={{
            fontFamily: 'var(--hu-font-display)', fontWeight: 900,
            fontSize: 32, lineHeight: 1, letterSpacing: '-0.02em',
            color: colorMap[tone] || '#0A0A0A',
            fontVariantNumeric: 'tabular-nums',
          }}>{value}</div>
          {sublabel && (
            <div style={{ fontSize: 11.5, color: 'var(--hu-muted)', marginTop: 8, lineHeight: 1.4 }}>{sublabel}</div>
          )}
        </div>
        <span style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: bgMap[tone] || '#F4F4F5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon} size={16} color={colorMap[tone] || '#525252'}/>
        </span>
      </div>
    </Card>
  );
}

/* ---------- Públicos dropdown (multi-select) ---------- */
interface PublicosDropdownProps {
  active: string[];
  onToggle: (id: string) => void;
  onAll: () => void;
  onNone: () => void;
}

export function PublicosDropdown({ active, onToggle, onAll, onNone }: PublicosDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const allSelected = active.length === PUBLICOS.length;
  const isOriginal = allSelected;

  let summary: string;
  if (allSelected) summary = 'Todos os públicos';
  else if (active.length === 0) summary = 'Nenhum público';
  else if (active.length === 1) summary = PUBLICO_BY_ID[active[0]]?.label || '1 público';
  else summary = `${active.length} de ${PUBLICOS.length} públicos`;

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 220 }}>
      <div style={{
        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: 'var(--hu-muted)', marginBottom: 6,
      }}>Filtrar por público</div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px 9px 12px',
          borderRadius: 10, border: '1px solid var(--hu-border)',
          background: '#fff', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: '#0A0A0A',
        }}>
        <Icon name="users" size={14} color="#7401C3"/>
        <span style={{ flex: 1, textAlign: 'left' }}>{summary}</span>
        {!isOriginal && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#B45309',
            background: '#FEF3C7', padding: '2px 7px', borderRadius: 999,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>filtrado</span>
        )}
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={13} color="#AA95BE"/>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          background: '#fff', borderRadius: 12, border: '1px solid var(--hu-border)',
          boxShadow: '0 12px 28px rgba(60,3,102,0.12)',
          padding: 8, zIndex: 40, minWidth: 300, width: 'max-content', maxWidth: 360,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 6px 8px', borderBottom: '1px solid #F4F4F5', marginBottom: 6,
          }}>
            <span style={{ fontSize: 11, color: '#737373' }}>
              Visão {isOriginal ? <b style={{ color: '#009966' }}>original</b> : <b style={{ color: '#B45309' }}>filtrada</b>}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={onAll} style={{
                padding: '3px 8px', borderRadius: 6, border: '1px solid var(--hu-border)',
                background: '#fff', cursor: 'pointer', fontSize: 11, color: '#7401C3', fontWeight: 600,
              }}>Todos</button>
              <button onClick={onNone} style={{
                padding: '3px 8px', borderRadius: 6, border: '1px solid var(--hu-border)',
                background: '#fff', cursor: 'pointer', fontSize: 11, color: '#737373', fontWeight: 600,
              }}>Limpar</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {PUBLICOS.map(pub => {
              const isActive = active.includes(pub.id);
              return (
                <div key={pub.id}
                  onClick={() => onToggle(pub.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8,
                    cursor: 'pointer',
                    background: isActive ? '#EFE3F8' : '#FAFAFA',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F6EDFB'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#FAFAFA'; }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    background: isActive ? '#7401C3' : '#fff',
                    border: isActive ? '1.5px solid #7401C3' : '1.5px solid #D6D3D1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isActive && <Icon name="check" size={10} color="#fff" stroke={3}/>}
                  </span>
                  <span style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: isActive ? '#fff' : '#F4F4F5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={pub.icon} size={11} color={isActive ? '#3C0366' : '#737373'}/>
                  </span>
                  <span style={{
                    flex: 1, minWidth: 0,
                    fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#3C0366' : '#525252',
                  }}>{pub.label}</span>
                  {pub.peso !== 1 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: isActive ? '#5A0992' : '#737373',
                      background: isActive ? '#fff' : '#F4F4F5',
                      padding: '1px 6px', borderRadius: 999,
                    }}>{pub.peso}×</span>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{
            marginTop: 8, padding: '8px 10px',
            background: '#FAFAFA', borderRadius: 8, fontSize: 11, color: '#525252', lineHeight: 1.45,
          }}>
            Para a visão <b style={{ color: '#0A0A0A' }}>original</b>, mantenha todos os públicos selecionados. Esta vista não altera a matriz oficial.
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Comparison dropdown ---------- */
interface ComparisonDropdownProps {
  baseId: string;
  compareId: string | null;
  onChange: (base: string, compare: string | null) => void;
}

export function ComparisonDropdown({ baseId, compareId, onChange }: ComparisonDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const baseV = VERSOES.find(v => v.id === baseId) || VERSOES.find(v => v.atual);
  const cmpV  = compareId ? VERSOES.find(v => v.id === compareId) : null;

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 260 }}>
      <div style={{
        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: 'var(--hu-muted)', marginBottom: 6,
      }}>Comparar versões</div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px',
          borderRadius: 10, border: '1px solid var(--hu-border)',
          background: '#fff', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: '#0A0A0A',
        }}>
        <Icon name="history" size={14} color="#7401C3"/>
        <span style={{ flex: 1, textAlign: 'left' }}>
          {cmpV ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <b>{baseV?.curto}</b>
              <Icon name="arrow-right" size={11} color="#AA95BE"/>
              <b>{cmpV.curto}</b>
            </span>
          ) : (
            <span style={{ color: '#737373' }}>Selecionar versões para comparar</span>
          )}
        </span>
        {cmpV && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#5A0992',
            background: '#EFE3F8', padding: '2px 7px', borderRadius: 999,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>comparando</span>
        )}
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={13} color="#AA95BE"/>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          background: '#fff', borderRadius: 12, border: '1px solid var(--hu-border)',
          boxShadow: '0 12px 28px rgba(60,3,102,0.12)',
          padding: 12, zIndex: 40, minWidth: 320, width: 'max-content',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <VersionPicker label="Versão de referência" value={baseId}
              onChange={(v) => onChange(v, compareId)}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#AA95BE', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span style={{ flex: 1, height: 1, background: 'var(--hu-border)' }}/>
              <Icon name="arrow-right" size={11} color="#AA95BE"/>
              <span>vs.</span>
              <span style={{ flex: 1, height: 1, background: 'var(--hu-border)' }}/>
            </div>
            <VersionPicker label="Comparar com" value={compareId || ''} allowEmpty
              onChange={(v) => onChange(baseId, v || null)}/>
          </div>
          {cmpV && (
            <div style={{
              marginTop: 12, padding: '8px 10px',
              background: '#F6EDFB', borderRadius: 8,
              fontSize: 11, color: '#5A0992', lineHeight: 1.5,
            }}>
              Pontos com contorno claro são <b>{cmpV.curto}</b>. Linhas tracejadas conectam ao ponto atual ({baseV?.curto}).
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VersionPicker({ label, value, onChange, allowEmpty }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  allowEmpty?: boolean;
}) {
  const options = allowEmpty ? [{ id: '', curto: '—', label: 'Sem comparação', status: '', atual: false, draft: false } as Versao & { id: string }, ...VERSOES] : VERSOES;
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--hu-muted)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {options.map(opt => {
          const isActive = value === opt.id;
          return (
            <div key={opt.id || 'none'}
              onClick={() => onChange(opt.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8,
                cursor: 'pointer',
                background: isActive ? '#F6EDFB' : 'transparent',
                border: isActive ? '1px solid #E8D9F2' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#FAFAFA'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              <span style={{
                width: 14, height: 14, borderRadius: 999,
                border: isActive ? '4px solid #7401C3' : '1.5px solid #D6D3D1',
                background: '#fff', flexShrink: 0,
              }}/>
              <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: isActive ? 700 : 500, color: '#0A0A0A' }}>
                {opt.label || 'Sem comparação'}
              </span>
              {opt.status && (
                <span style={{
                  fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: opt.atual ? '#009966' : (opt.draft ? '#B45309' : '#737373'),
                }}>
                  {opt.atual ? 'atual' : (opt.draft ? 'rascunho' : 'arquivada')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Matrix SVG ---------- */
interface MatrixPoint {
  id: number;
  name: string;
  x: number;
  y: number;
  sent: number | null;
  cmp: { x: number; y: number; sentimento?: number } | null;
  tema: Theme;
}

interface MatrixSVGProps {
  themes: Theme[];
  activePublicos: string[];
  basePos?: (t: Theme) => { x: number; y: number; sentimento?: number | null };
  comparePos?: (t: Theme) => { x: number; y: number; sentimento?: number | null } | null;
  onPick?: (id: number) => void;
  onHover?: (point: MatrixPoint | null) => void;
  hoverId?: number;
  selectedId?: number;
}

export function MatrixSVG({ themes, activePublicos, basePos, comparePos, onPick, onHover, hoverId, selectedId }: MatrixSVGProps) {
  const W = 720, H = 480;
  const ML = 60, MR = 30, MT = 24, MB = 50;
  const minA = 35, maxA = 100;
  const span = maxA - minA;

  const px = (v: number) => ML + ((v - minA) / span) * (W - ML - MR);
  const py = (v: number) => H - MB - ((v - minA) / span) * (H - MT - MB);

  const thresholdX = 75, thresholdY = 65;

  const points: MatrixPoint[] = themes.map(t => {
    const yLive = recalcEixoY(t, activePublicos);
    const sLive = recalcSent(t, activePublicos);
    const usingFilter = activePublicos.length > 0 && activePublicos.length < PUBLICOS.length;
    const base = basePos ? basePos(t) : { x: t.x, y: yLive, sentimento: sLive };
    const cmp  = comparePos ? comparePos(t) : null;
    return {
      id: t.id,
      name: t.nome,
      x: usingFilter ? t.x : base.x,
      y: usingFilter ? yLive : base.y,
      sent: usingFilter ? sLive : (base.sentimento != null ? base.sentimento : sLive),
      cmp: cmp ? { x: cmp.x, y: cmp.y, sentimento: cmp.sentimento ?? undefined } : null,
      tema: t,
    };
  });

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', maxWidth: '100%', userSelect: 'none' }}>
      <defs>
        <pattern id="dashed" patternUnits="userSpaceOnUse" width="6" height="1">
          <line x1="0" y1="0" x2="3" y2="0" stroke="#AA95BE" strokeWidth="1"/>
        </pattern>
      </defs>

      {/* Quadrant tints */}
      <rect x={px(thresholdX)} y={py(maxA)} width={px(maxA) - px(thresholdX)} height={py(thresholdY) - py(maxA)} fill="#FAF5FE"/>
      <rect x={px(minA)} y={py(thresholdY)} width={px(thresholdX) - px(minA)} height={py(minA) - py(thresholdY)} fill="#FAFCFA"/>

      {/* Grid lines */}
      {[50, 65, 75, 85].map(v => (
        <g key={`vx${v}`}>
          <line x1={px(v)} y1={py(minA)} x2={px(v)} y2={py(maxA)} stroke="#F0EBF4" strokeWidth="1"/>
          <line x1={px(minA)} y1={py(v)} x2={px(maxA)} y2={py(v)} stroke="#F0EBF4" strokeWidth="1"/>
        </g>
      ))}

      {/* Thresholds dashed */}
      <line x1={px(thresholdX)} y1={py(minA)} x2={px(thresholdX)} y2={py(maxA)} stroke="#AA95BE" strokeWidth="1" strokeDasharray="4 4" opacity="0.7"/>
      <line x1={px(minA)} y1={py(thresholdY)} x2={px(maxA)} y2={py(thresholdY)} stroke="#AA95BE" strokeWidth="1" strokeDasharray="4 4" opacity="0.7"/>

      {/* Quadrant labels */}
      <text x={px(maxA) - 8} y={py(maxA) + 16} textAnchor="end" fontFamily="Lato" fontWeight="700" fontSize="11" letterSpacing="1" fill="#7401C3">PRIORIDADE MÁXIMA</text>
      <text x={px(minA) + 8} y={py(maxA) + 16} textAnchor="start" fontFamily="Lato" fontWeight="700" fontSize="11" letterSpacing="1" fill="#737373">ENGAJAMENTO</text>
      <text x={px(maxA) - 8} y={py(minA) - 10} textAnchor="end" fontFamily="Lato" fontWeight="700" fontSize="11" letterSpacing="1" fill="#737373">ESTRATÉGICO</text>
      <text x={px(minA) + 8} y={py(minA) - 10} textAnchor="start" fontFamily="Lato" fontWeight="700" fontSize="11" letterSpacing="1" fill="#AA95BE">MONITORAR</text>

      {/* Axes */}
      <line x1={px(minA)} y1={py(minA)} x2={px(maxA)} y2={py(minA)} stroke="#0A0A0A" strokeWidth="1.5"/>
      <line x1={px(minA)} y1={py(minA)} x2={px(minA)} y2={py(maxA)} stroke="#0A0A0A" strokeWidth="1.5"/>

      {/* X ticks */}
      {[40, 50, 60, 70, 80, 90, 100].map(t => (
        <g key={`xt${t}`}>
          <line x1={px(t)} y1={py(minA)} x2={px(t)} y2={py(minA) + 4} stroke="#737373" strokeWidth="1"/>
          <text x={px(t)} y={py(minA) + 18} textAnchor="middle" fontSize="10" fill="#737373" fontFamily="Open Sans">{t}</text>
        </g>
      ))}
      {/* Y ticks */}
      {[40, 50, 60, 70, 80, 90, 100].map(t => (
        <g key={`yt${t}`}>
          <line x1={px(minA) - 4} y1={py(t)} x2={px(minA)} y2={py(t)} stroke="#737373" strokeWidth="1"/>
          <text x={px(minA) - 8} y={py(t) + 3} textAnchor="end" fontSize="10" fill="#737373" fontFamily="Open Sans">{t}</text>
        </g>
      ))}

      {/* Axis titles */}
      <text x={W - MR} y={H - 10} textAnchor="end" fontSize="11" fontWeight="600" fill="#525252" fontFamily="Open Sans">Relevância para os negócios (Alta Liderança) →</text>
      <text x={-py(minA) + 8} y={18} transform="rotate(-90)" fontSize="11" fontWeight="600" fill="#525252" fontFamily="Open Sans">Relevância para os stakeholders →</text>

      {/* Compare mode: arrows */}
      {points.map(p => p.cmp && (
        <g key={`cmp${p.id}`}>
          <line x1={px(p.cmp.x)} y1={py(p.cmp.y)} x2={px(p.x)} y2={py(p.y)} stroke="#AA95BE" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.75"/>
          <circle cx={px(p.cmp.x)} cy={py(p.cmp.y)} r="4.5" fill="#fff" stroke="#AA95BE" strokeWidth="1.6"/>
        </g>
      ))}

      {/* Points */}
      {points.map(p => {
        const isHover = hoverId === p.id;
        const isSel   = selectedId === p.id;
        const radius = isHover || isSel ? 11 : 9;
        const auraR  = isHover || isSel ? 18 : 14;
        const fg = sentColor(p.sent);
        return (
          <g key={p.id}
            onMouseEnter={() => onHover && onHover(p)}
            onMouseLeave={() => onHover && onHover(null)}
            onClick={() => onPick && onPick(p.id)}
            style={{ cursor: 'pointer', transition: 'transform 250ms cubic-bezier(0.22,0.61,0.36,1)' }}>
            <circle cx={px(p.x)} cy={py(p.y)} r={auraR} fill={fg} opacity={isHover ? 0.32 : 0.15}/>
            <circle cx={px(p.x)} cy={py(p.y)} r={radius} fill={fg} stroke="#fff" strokeWidth="2"/>
            <text x={px(p.x)} y={py(p.y) + 3.5} textAnchor="middle"
              fontFamily="Lato" fontWeight="900" fontSize="10" fill="#fff"
              style={{ pointerEvents: 'none' }}>
              {String(p.id).padStart(2, '0')}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Tooltip (HTML overlay) ---------- */
interface HoverTooltipProps {
  point: MatrixPoint | null;
  baseLabel?: string;
  cmpLabel?: string | null;
}

export function HoverTooltip({ point, baseLabel, cmpLabel }: HoverTooltipProps) {
  if (!point) return null;
  const t = point.tema;
  const st = themeStatus(t, point.x, point.y, point.sent);
  const inicCount = INICIATIVAS.filter(i => i.tema_id === t.id).length;

  let deltaSent: number | null = null;
  let deltaY: number | null = null;
  let deltaX: number | null = null;
  if (point.cmp) {
    deltaY = point.y - point.cmp.y;
    deltaX = point.x - point.cmp.x;
    if (point.cmp.sentimento != null && point.sent != null) {
      deltaSent = point.sent - point.cmp.sentimento;
    }
  }

  return (
    <div style={{
      position: 'absolute', top: 12, right: 12, zIndex: 5,
      width: 280, pointerEvents: 'none',
      background: 'rgba(255,255,255,0.98)',
      border: '1px solid var(--hu-border)',
      borderRadius: 12,
      boxShadow: '0 8px 24px rgba(60,3,102,0.16)',
      padding: '12px 14px 14px',
      animation: 'hu-fade-in 160ms ease-out both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: '#5A0992',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>Tema {String(t.id).padStart(2, '0')}</span>
        <Pill tone={st.tone as 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand'} size="sm">{st.label}</Pill>
      </div>
      <div style={{
        fontFamily: 'var(--hu-font-display)', fontWeight: 700, fontSize: 14, lineHeight: 1.3,
        color: '#0A0A0A', marginBottom: 8,
      }}>{t.nome}</div>
      <div style={{ fontSize: 11.5, color: '#525252', lineHeight: 1.4, marginBottom: 10 }}>
        {t.descricao}
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
        padding: '8px 10px', background: '#FAFAFA', borderRadius: 8,
      }}>
        <TipStat label="Negócios" value={`${point.x}%`} delta={cmpLabel ? deltaX : null}/>
        <TipStat label="Stakeh." value={`${point.y}%`} delta={cmpLabel ? deltaY : null}/>
        <TipStat label="Sent." value={fmtSent(point.sent)} color={sentColor(point.sent)} delta={cmpLabel ? deltaSent : null}/>
      </div>
      <div style={{
        marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--hu-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 11, color: '#737373',
      }}>
        <span>
          {inicCount > 0 ? <span><b style={{ color: '#7401C3' }}>{inicCount}</b> iniciativa{inicCount > 1 ? 's' : ''} vinculada{inicCount > 1 ? 's' : ''}</span>
                          : <span style={{ color: '#B45309', fontWeight: 600 }}>Sem iniciativa</span>}
        </span>
        {cmpLabel && <span style={{ fontWeight: 600, color: '#AA95BE' }}>{baseLabel} vs. {cmpLabel}</span>}
      </div>
    </div>
  );
}

function TipStat({ label, value, color, delta }: { label: string; value: string; color?: string; delta: number | null }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#737373' }}>{label}</div>
      <div style={{
        fontFamily: 'var(--hu-font-display)', fontWeight: 900, fontSize: 15, lineHeight: 1.1,
        color: color || '#0A0A0A', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
        marginTop: 2,
      }}>{value}</div>
      {delta != null && delta !== 0 && (
        <div style={{
          fontSize: 10, fontWeight: 700, marginTop: 2,
          color: delta > 0 ? '#009966' : '#C81E1E',
          fontVariantNumeric: 'tabular-nums',
        }}>{delta > 0 ? '↑' : '↓'} {Math.abs(delta)}</div>
      )}
    </div>
  );
}

/* ---------- Priority list ---------- */
interface PriorityListProps {
  themes: Theme[];
  activePublicos: string[];
  onPick: (id: number) => void;
}

export function PriorityList({ themes, activePublicos, onPick }: PriorityListProps) {
  const filtered = activePublicos.length > 0 && activePublicos.length < PUBLICOS.length;
  const ranked = themes.map(t => {
    const y = recalcEixoY(t, activePublicos);
    const s = recalcSent(t, activePublicos);
    const sentPenalty = s != null ? Math.max(0, -s) * 0.20 : 0;
    const score = (t.x + y) / 2 + sentPenalty;
    return { theme: t, y, s, score };
  }).sort((a, b) => b.score - a.score).slice(0, 10);

  return (
    <Card style={{ padding: '20px 24px 22px' }}>
      <SectionTitle
        eyebrow="Top 10 · ordem de prioridade"
        action={
          <span style={{
            fontSize: 11.5, color: '#737373',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="info" size={12} color="#AA95BE"/>
            <span>{filtered ? 'Ordem segundo filtros selecionados' : 'Ordem oficial da matriz'}</span>
          </span>
        }>
        Ranking de temas materiais
      </SectionTitle>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 8,
      }}>
        {ranked.map((r, i) => (
          <PriorityCard key={r.theme.id} pos={i + 1} theme={r.theme} y={r.y} s={r.s} onPick={onPick}/>
        ))}
      </div>
    </Card>
  );
}

function PriorityCard({ pos, theme, y, s, onPick }: { pos: number; theme: Theme; y: number; s: number | null; onPick: (id: number) => void }) {
  const [hov, setHov] = React.useState(false);
  const st = themeStatus(theme, theme.x, y, s);
  const tones: Record<string, { bg: string; fg: string }> = {
    danger:  { bg: '#FCE2E2', fg: '#C81E1E' },
    warning: { bg: '#FEF3C7', fg: '#B45309' },
    success: { bg: '#DEF7EC', fg: '#009966' },
    info:    { bg: '#E1EFFE', fg: '#1E40AF' },
    brand:   { bg: '#EFE3F8', fg: '#5A0992' },
    neutral: { bg: '#F4F4F5', fg: '#525252' },
  };
  const tone = tones[st.tone] || tones.neutral;
  return (
    <div
      onClick={() => onPick(theme.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid', gridTemplateColumns: '36px 1fr auto',
        gap: 10, alignItems: 'center',
        padding: '10px 12px',
        borderRadius: 10,
        border: `1px solid ${hov ? '#E8D9F2' : 'var(--hu-border)'}`,
        background: hov ? '#FAF5FE' : '#fff',
        cursor: 'pointer',
        transition: 'background 120ms, border-color 120ms',
      }}>
      <div style={{
        fontFamily: 'var(--hu-font-display)', fontWeight: 900, fontSize: 22,
        color: pos <= 3 ? '#7401C3' : '#AA95BE',
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em',
        textAlign: 'center',
      }}>{String(pos).padStart(2, '0')}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 600, color: 'var(--hu-text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 4,
        }}>{theme.nome}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: tone.fg, background: tone.bg, padding: '1px 6px', borderRadius: 999,
          }}>{st.label}</span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: sentColor(s),
            fontVariantNumeric: 'tabular-nums',
          }}>{fmtSent(s)}</span>
        </div>
      </div>
      <Icon name="chevron-right" size={14} color="#AA95BE"/>
    </div>
  );
}

/* ---------- Main Overview ---------- */
interface OverviewProps {
  onPickTheme: (id: number) => void;
}

export function Overview({ onPickTheme }: OverviewProps) {
  const [active, setActive] = React.useState(PUBLICOS.map(p => p.id));
  const [hoverPoint, setHoverPoint] = React.useState<MatrixPoint | null>(null);
  const [baseVersion, setBaseVersion] = React.useState('v2025');
  const [compareVersion, setCompareVersion] = React.useState<string | null>(null);

  const allSelected = active.length === PUBLICOS.length;
  const filtered = !allSelected;

  const toggle = (id: string) => {
    setActive(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };
  const selectAll = () => setActive(PUBLICOS.map(p => p.id));
  const selectNone = () => setActive([]);

  const sb = scoreboard(THEMES, filtered ? active : []);
  const cob = cobertura(THEMES);

  const basePos = React.useCallback((t: Theme) => t.por_versao[baseVersion] || { x: t.x, y: t.y, sentimento: t.sentimento }, [baseVersion]);
  const comparePos = React.useCallback((t: Theme) => compareVersion ? (t.por_versao[compareVersion] || null) : null, [compareVersion]);

  const baseLabel = VERSOES.find(v => v.id === baseVersion)?.curto;
  const cmpLabel = compareVersion ? VERSOES.find(v => v.id === compareVersion)?.curto : null;

  const sint = filtered
    ? `Vista filtrada por ${active.length} público(s) — a leitura agregada muda em relação à matriz oficial. Use para entender percepção segmentada, não para decisão estratégica.`
    : `${sb.crit} temas exigem ação executiva imediata. Pessoas e Estrutura Organizacional concentram o pior sentimento da matriz (−27 e −47) e travam decisão de cadeia de aprovações na diretoria. Processos & Tecnologia salta para 97% de relevância — segundo ano consecutivo no topo, infra de campo ainda é o ponto mais citado. ${sb.semIni > 0 ? `${sb.semIni} tema(s) prioritário(s) seguem sem iniciativa vinculada.` : ''}`;

  const prioridades = filtered ? [
    'Restaure todos os públicos para retomar a leitura oficial',
    'Compare a vista filtrada com a original na coluna ao lado',
    'Use os filtros para preparar conversas específicas com cada público',
  ] : [
    'Cobrar a diretoria por prazo do redesenho da Cadeia de Aprovações (tema 11)',
    'Antecipar a Renovação da rede de campo para Q3/2026 (tema 1 · decisão já tomada)',
    'Iniciar contratação de inventário GEE — bloqueio regulatório IFRS S2 em 2027',
    `Vincular iniciativas aos ${sb.semIni} tema(s) prioritário(s) ainda descobertos`,
  ];

  return (
    <div className="hu-fade" data-screen-label="Materialidade · Visão geral">
      <PageHeader
        eyebrow={`Materialidade · ${ORG.nome}`}
        title="Matriz de Materialidade · 2025"
        subtitle="Versão publicada em 08/04/2026 · Próxima revisão prevista para Abr/2027. Cada tema material termina vinculado a iniciativas — não em diagnóstico parado."
        breadcrumbs={[
          { label: 'Sustentabilidade' },
          { label: 'Materialidade' },
          { label: 'Matriz · 2025' },
        ]}
        actions={<Btn variant="secondary" icon="download">Exportar</Btn>}
      />

      <div className="mat-scorecard" style={{ padding: '0 32px', marginBottom: 16 }}>
        <ScoreCard label="Total de temas"   value={sb.total}    tone="neutral" icon="list"           sublabel="20 temas materiais publicados"/>
        <ScoreCard label="Críticos"         value={sb.crit}     tone="danger"  icon="alert"          sublabel="Alta relev. + sent. negativo"/>
        <ScoreCard label="Em alerta"        value={sb.alerta}   tone="warning" icon="trending-down"  sublabel="Sent. em deterioração"/>
        <ScoreCard label="Saudáveis"        value={sb.saudavel} tone="success" icon="check-circle"   sublabel="Iniciativas avançando"/>
        <ScoreCard label="Sem iniciativa"   value={sb.semIni}   tone="brand"   icon="link"           sublabel="Temas priorit. não cobertos"/>
      </div>

      {filtered && (
        <div className="hu-fade" style={{
          margin: '0 32px 16px',
          background: '#FFF7E6',
          border: '1px solid #FFE4B5',
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Icon name="filter" size={16} color="#B45309"/>
          <div style={{ flex: 1, fontSize: 13, color: '#7C2D12' }}>
            <b>Vista filtrada</b> — você está vendo apenas as percepções de <b>{active.length} público(s)</b> sobre a matriz. Esta não é a matriz oficial.
          </div>
          <Btn size="sm" variant="ghost" icon="x" onClick={selectAll}>Restaurar todos</Btn>
        </div>
      )}

      <div className="mat-overview-grid-v2" style={{ padding: '0 32px 32px' }}>
        {/* LEFT column: AI insight + cobertura */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          maxHeight: 'calc(100vh - 140px)', overflowY: 'auto',
          paddingRight: 4,
        }} className="mat-overview-sticky">
          <AIInsight
            title="Síntese executiva"
            sintese={sint}
            prioridades={prioridades}
            tone={filtered ? 'warning' : 'brand'}
          />
          <Card style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #FAF5FE 0%, #F6EDFB 100%)',
            border: '1px solid #E8D9F2',
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#5A0992', marginBottom: 10 }}>
              Cobertura normativa
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontFamily: 'var(--hu-font-display)', fontWeight: 900, fontSize: 22, color: '#3C0366', letterSpacing: '-0.02em', lineHeight: 1 }}>{cob.gri}</div>
                <div style={{ fontSize: 11, color: '#5A0992', marginTop: 2 }}>normas GRI</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--hu-font-display)', fontWeight: 900, fontSize: 22, color: '#3C0366', letterSpacing: '-0.02em', lineHeight: 1 }}>{cob.ods}</div>
                <div style={{ fontSize: 11, color: '#5A0992', marginTop: 2 }}>ODS</div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT column: filters + matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <Card style={{ padding: '16px 20px 18px', overflow: 'visible' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 18 }}>
              <PublicosDropdown active={active} onToggle={toggle} onAll={selectAll} onNone={selectNone}/>
              <ComparisonDropdown baseId={baseVersion} compareId={compareVersion}
                onChange={(b, c) => { setBaseVersion(b); setCompareVersion(c); }}/>
              <div style={{ flex: 1, minWidth: 0 }}/>
              <div style={{
                fontSize: 11, color: '#737373', textAlign: 'right',
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <span style={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, color: '#AA95BE' }}>Eixo X (oficial)</span>
                <span><b style={{ color: '#0A0A0A' }}>Alta Liderança</b> · pesquisa direta com C-Level</span>
              </div>
            </div>
          </Card>

          <Card style={{ padding: '20px 24px 24px', position: 'relative' }}>
            <SectionTitle
              eyebrow={filtered ? 'Vista filtrada' : (cmpLabel ? `Comparativo · ${baseLabel} vs. ${cmpLabel}` : 'Matriz oficial')}
              action={
                <span style={{ fontSize: 11, color: '#737373', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="info" size={12} color="#AA95BE"/>
                  <span>Passe o mouse sobre um tema para ver detalhes</span>
                </span>
              }>
              Relevância para os negócios × stakeholders
            </SectionTitle>
            <div style={{ marginTop: 8, position: 'relative' }}>
              <MatrixSVG
                themes={THEMES}
                activePublicos={filtered ? active : []}
                basePos={basePos}
                comparePos={comparePos}
                onPick={onPickTheme}
                onHover={setHoverPoint}
                hoverId={hoverPoint?.id}
              />
              <HoverTooltip point={hoverPoint} baseLabel={baseLabel} cmpLabel={cmpLabel}/>
            </div>
            <div style={{
              marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--hu-border)',
              display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16,
              fontSize: 11.5, color: 'var(--hu-muted)',
            }}>
              <div style={{ fontWeight: 700, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10.5 }}>Sentimento agregado:</div>
              {[
                ['Muito negativo', '#E03131'],
                ['Negativo',       '#F59E0B'],
                ['Levemente +',    '#A8D85E'],
                ['Positivo',       '#00A970'],
                ['Sem dado',       '#AA95BE'],
              ].map(([lbl, c]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: c }}/>
                  <span>{lbl}</span>
                </div>
              ))}
              {cmpLabel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: '#fff', border: '1.5px solid #AA95BE' }}/>
                  <span>Posição em {cmpLabel}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Full-width heatmap */}
        <div style={{ gridColumn: '1 / -1', position: 'relative', zIndex: 1, background: 'var(--hu-bg)' }}>
          <HeatmapSentimentoBlock
            themes={THEMES}
            activePublicos={filtered ? active : []}
            onPickTheme={onPickTheme}/>
        </div>

        {/* Full-width ranking */}
        <div style={{ gridColumn: '1 / -1', position: 'relative', zIndex: 1, background: 'var(--hu-bg)' }}>
          <PriorityList themes={THEMES} activePublicos={filtered ? active : []} onPick={onPickTheme}/>
        </div>
      </div>
    </div>
  );
}
