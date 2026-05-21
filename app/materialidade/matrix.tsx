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
import {
  Card as ShadCard,
  CardContent,
} from '~/components/ui/card';
import { cn } from '~/lib/utils';

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
    neutral: 'text-foreground',
    danger:  'text-destructive',
    warning: 'text-amber-600',
    success: 'text-green-600',
    brand:   'text-primary',
  };
  const bgMap: Record<string, string> = {
    neutral: 'bg-muted',
    danger:  'bg-red-100',
    warning: 'bg-amber-100',
    success: 'bg-green-100',
    brand:   'bg-primary/10',
  };
  const iconColorMap: Record<string, string> = {
    neutral: '#525252',
    danger:  '#C81E1E',
    warning: '#B45309',
    success: '#009966',
    brand:   '#7401C3',
  };
  return (
    <ShadCard className="relative min-h-[122px] p-[18px_18px_16px]">
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              {label}
            </div>
            <div className={cn(
              'font-display text-[32px] font-black leading-none tracking-[-0.02em] tabular-nums',
              colorMap[tone] ?? 'text-foreground',
            )}>
              {value}
            </div>
            {sublabel && (
              <div className="mt-2 text-[11.5px] leading-[1.4] text-muted-foreground">{sublabel}</div>
            )}
          </div>
          <span className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]',
            bgMap[tone] ?? 'bg-muted',
          )}>
            <Icon name={icon} size={16} color={iconColorMap[tone] ?? '#525252'}/>
          </span>
        </div>
      </CardContent>
    </ShadCard>
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
    <div ref={ref} className="relative min-w-[220px]">
      <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        Filtrar por público
      </div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] border border-border bg-white px-3 py-[9px] text-[13px] font-semibold text-foreground">
        <Icon name="users" size={14} color="#7401C3"/>
        <span className="flex-1 text-left">{summary}</span>
        {!isOriginal && (
          <span className="rounded-full bg-amber-100 px-[7px] py-[2px] text-[10px] font-bold uppercase tracking-[0.06em] text-amber-600">
            filtrado
          </span>
        )}
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={13} color="#AA95BE"/>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-max max-w-[360px] min-w-[300px] rounded-xl border border-border bg-white p-2 shadow-[0_12px_28px_rgba(60,3,102,0.12)]">
          <div className="mb-1.5 flex items-center justify-between border-b border-muted px-1.5 pb-2 pt-1">
            <span className="text-[11px] text-muted-foreground">
              Visão {isOriginal
                ? <b className="text-green-600">original</b>
                : <b className="text-amber-600">filtrada</b>}
            </span>
            <div className="flex gap-1">
              <button
                onClick={onAll}
                className="cursor-pointer rounded-md border border-border bg-white px-2 py-[3px] text-[11px] font-semibold text-primary">
                Todos
              </button>
              <button
                onClick={onNone}
                className="cursor-pointer rounded-md border border-border bg-white px-2 py-[3px] text-[11px] font-semibold text-muted-foreground">
                Limpar
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            {PUBLICOS.map(pub => {
              const isActive = active.includes(pub.id);
              return (
                <div
                  key={pub.id}
                  onClick={() => onToggle(pub.id)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-[120ms]',
                    isActive ? 'bg-primary/10' : 'bg-[#FAFAFA] hover:bg-[#F6EDFB]',
                  )}>
                  <span className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px]',
                    isActive
                      ? 'border-[1.5px] border-primary bg-primary'
                      : 'border-[1.5px] border-stone-300 bg-white',
                  )}>
                    {isActive && <Icon name="check" size={10} color="#fff" stroke={3}/>}
                  </span>
                  <span className={cn(
                    'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md',
                    isActive ? 'bg-white' : 'bg-muted',
                  )}>
                    <Icon name={pub.icon} size={11} color={isActive ? '#3C0366' : '#737373'}/>
                  </span>
                  <span className={cn(
                    'min-w-0 flex-1 text-[12.5px]',
                    isActive ? 'font-bold text-[#3C0366]' : 'font-medium text-[#525252]',
                  )}>{pub.label}</span>
                  {pub.peso !== 1 && (
                    <span className={cn(
                      'rounded-full px-1.5 py-[1px] text-[10px] font-bold',
                      isActive ? 'bg-white text-[#5A0992]' : 'bg-muted text-muted-foreground',
                    )}>{pub.peso}×</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 rounded-lg bg-[#FAFAFA] px-2.5 py-2 text-[11px] leading-[1.45] text-[#525252]">
            Para a visão <b className="text-foreground">original</b>, mantenha todos os públicos selecionados. Esta vista não altera a matriz oficial.
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
    <div ref={ref} className="relative min-w-[260px]">
      <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        Comparar versões
      </div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] border border-border bg-white px-3 py-[9px] text-[13px] font-semibold text-foreground">
        <Icon name="history" size={14} color="#7401C3"/>
        <span className="flex-1 text-left">
          {cmpV ? (
            <span className="inline-flex items-center gap-1.5">
              <b>{baseV?.curto}</b>
              <Icon name="arrow-right" size={11} color="#AA95BE"/>
              <b>{cmpV.curto}</b>
            </span>
          ) : (
            <span className="text-muted-foreground">Selecionar versões para comparar</span>
          )}
        </span>
        {cmpV && (
          <span className="rounded-full bg-primary/10 px-[7px] py-[2px] text-[10px] font-bold uppercase tracking-[0.06em] text-[#5A0992]">
            comparando
          </span>
        )}
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={13} color="#AA95BE"/>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-max min-w-[320px] rounded-xl border border-border bg-white p-3 shadow-[0_12px_28px_rgba(60,3,102,0.12)]">
          <div className="flex flex-col gap-3">
            <VersionPicker label="Versão de referência" value={baseId}
              onChange={(v) => onChange(v, compareId)}/>
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#AA95BE]">
              <span className="h-px flex-1 bg-border"/>
              <Icon name="arrow-right" size={11} color="#AA95BE"/>
              <span>vs.</span>
              <span className="h-px flex-1 bg-border"/>
            </div>
            <VersionPicker label="Comparar com" value={compareId || ''} allowEmpty
              onChange={(v) => onChange(baseId, v || null)}/>
          </div>
          {cmpV && (
            <div className="mt-3 rounded-lg bg-[#F6EDFB] px-2.5 py-2 text-[11px] leading-[1.5] text-[#5A0992]">
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
      <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{label}</div>
      <div className="flex flex-col gap-1">
        {options.map(opt => {
          const isActive = value === opt.id;
          return (
            <div
              key={opt.id || 'none'}
              onClick={() => onChange(opt.id)}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors duration-[120ms]',
                isActive
                  ? 'border-[#E8D9F2] bg-[#F6EDFB]'
                  : 'border-transparent bg-transparent hover:bg-muted/50',
              )}>
              <span className={cn(
                'h-3.5 w-3.5 shrink-0 rounded-full bg-white',
                isActive ? 'border-[4px] border-primary' : 'border-[1.5px] border-stone-300',
              )}/>
              <span className={cn(
                'min-w-0 flex-1 text-[12.5px] text-foreground',
                isActive ? 'font-bold' : 'font-medium',
              )}>
                {opt.label || 'Sem comparação'}
              </span>
              {opt.status && (
                <span className={cn(
                  'text-[9.5px] font-bold uppercase tracking-[0.06em]',
                  opt.atual ? 'text-green-600' : (opt.draft ? 'text-amber-600' : 'text-muted-foreground'),
                )}>
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
    <div className="pointer-events-none absolute right-3 top-3 z-[5] w-[280px] animate-[hu-fade-in_160ms_ease-out_both] rounded-xl border border-border bg-white/[0.98] px-[14px] pb-[14px] pt-3 shadow-[0_8px_24px_rgba(60,3,102,0.16)]">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#5A0992]">
          Tema {String(t.id).padStart(2, '0')}
        </span>
        <Pill tone={st.tone as 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand'} size="sm">{st.label}</Pill>
      </div>
      <div className="mb-2 font-display text-[14px] font-bold leading-[1.3] text-foreground">
        {t.nome}
      </div>
      <div className="mb-2.5 text-[11.5px] leading-[1.4] text-[#525252]">
        {t.descricao}
      </div>
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#FAFAFA] px-2.5 py-2">
        <TipStat label="Negócios" value={`${point.x}%`} delta={cmpLabel ? deltaX : null}/>
        <TipStat label="Stakeh." value={`${point.y}%`} delta={cmpLabel ? deltaY : null}/>
        <TipStat label="Sent." value={fmtSent(point.sent)} color={sentColor(point.sent)} delta={cmpLabel ? deltaSent : null}/>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-dashed border-border pt-2 text-[11px] text-muted-foreground">
        <span>
          {inicCount > 0
            ? <span><b className="text-primary">{inicCount}</b> iniciativa{inicCount > 1 ? 's' : ''} vinculada{inicCount > 1 ? 's' : ''}</span>
            : <span className="font-semibold text-amber-600">Sem iniciativa</span>}
        </span>
        {cmpLabel && <span className="font-semibold text-[#AA95BE]">{baseLabel} vs. {cmpLabel}</span>}
      </div>
    </div>
  );
}

function TipStat({ label, value, color, delta }: { label: string; value: string; color?: string; delta: number | null }) {
  return (
    <div>
      <div className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">{label}</div>
      <div
        className="mt-0.5 font-display text-[15px] font-black leading-[1.1] tabular-nums tracking-[-0.01em]"
        style={{ color: color || undefined }}
      >
        {value}
      </div>
      {delta != null && delta !== 0 && (
        <div className={cn(
          'mt-0.5 text-[10px] font-bold tabular-nums',
          delta > 0 ? 'text-green-600' : 'text-destructive',
        )}>
          {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}
        </div>
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
          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <Icon name="info" size={12} color="#AA95BE"/>
            <span>{filtered ? 'Ordem segundo filtros selecionados' : 'Ordem oficial da matriz'}</span>
          </span>
        }>
        Ranking de temas materiais
      </SectionTitle>
      <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
        {ranked.map((r, i) => (
          <PriorityCard key={r.theme.id} pos={i + 1} theme={r.theme} y={r.y} s={r.s} onPick={onPick}/>
        ))}
      </div>
    </Card>
  );
}

function PriorityCard({ pos, theme, y, s, onPick }: { pos: number; theme: Theme; y: number; s: number | null; onPick: (id: number) => void }) {
  const st = themeStatus(theme, theme.x, y, s);
  const tones: Record<string, { bg: string; fg: string }> = {
    danger:  { bg: 'bg-red-100',    fg: 'text-destructive' },
    warning: { bg: 'bg-amber-100',  fg: 'text-amber-600' },
    success: { bg: 'bg-green-100',  fg: 'text-green-600' },
    info:    { bg: 'bg-blue-100',   fg: 'text-blue-600' },
    brand:   { bg: 'bg-primary/10', fg: 'text-primary' },
    neutral: { bg: 'bg-muted',      fg: 'text-muted-foreground' },
  };
  const tone = tones[st.tone] ?? tones.neutral;
  return (
    <div
      onClick={() => onPick(theme.id)}
      className="grid cursor-pointer items-center gap-2.5 rounded-[10px] border border-border bg-white px-3 py-2.5 transition-colors duration-[120ms] hover:border-[#E8D9F2] hover:bg-[#FAF5FE] [grid-template-columns:36px_1fr_auto]">
      <div className={cn(
        'text-center font-display text-[22px] font-black tabular-nums tracking-[-0.03em]',
        pos <= 3 ? 'text-primary' : 'text-[#AA95BE]',
      )}>
        {String(pos).padStart(2, '0')}
      </div>
      <div className="min-w-0">
        <div className="mb-1 truncate text-[12.5px] font-semibold text-foreground">
          {theme.nome}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn(
            'rounded-full px-1.5 py-[1px] text-[9.5px] font-bold uppercase tracking-[0.06em]',
            tone.fg, tone.bg,
          )}>{st.label}</span>
          <span className="text-[11px] font-bold tabular-nums" style={{ color: sentColor(s) }}>
            {fmtSent(s)}
          </span>
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

      <div className="mat-scorecard px-8 mb-4">
        <ScoreCard label="Total de temas"   value={sb.total}    tone="neutral" icon="list"           sublabel="20 temas materiais publicados"/>
        <ScoreCard label="Críticos"         value={sb.crit}     tone="danger"  icon="alert"          sublabel="Alta relev. + sent. negativo"/>
        <ScoreCard label="Em alerta"        value={sb.alerta}   tone="warning" icon="trending-down"  sublabel="Sent. em deterioração"/>
        <ScoreCard label="Saudáveis"        value={sb.saudavel} tone="success" icon="check-circle"   sublabel="Iniciativas avançando"/>
        <ScoreCard label="Sem iniciativa"   value={sb.semIni}   tone="brand"   icon="link"           sublabel="Temas priorit. não cobertos"/>
      </div>

      {filtered && (
        <div className="hu-fade mx-8 mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Icon name="filter" size={16} color="#B45309"/>
          <div className="flex-1 text-[13px] text-amber-900">
            <b>Vista filtrada</b> — você está vendo apenas as percepções de <b>{active.length} público(s)</b> sobre a matriz. Esta não é a matriz oficial.
          </div>
          <Btn size="sm" variant="ghost" icon="x" onClick={selectAll}>Restaurar todos</Btn>
        </div>
      )}

      <div className="mat-overview-grid-v2 px-8 pb-8">
        {/* LEFT column: AI insight + cobertura */}
        <div className="mat-overview-sticky flex max-h-[calc(100vh-140px)] flex-col gap-4 overflow-y-auto pr-1">
          <AIInsight
            title="Síntese executiva"
            sintese={sint}
            prioridades={prioridades}
            tone={filtered ? 'warning' : 'brand'}
          />
          <Card style={{
            background: 'linear-gradient(135deg, #FAF5FE 0%, #F6EDFB 100%)',
          }} className="border-[#E8D9F2] p-[14px_16px]">
            <div className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.10em] text-[#5A0992]">
              Cobertura normativa
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="font-display text-[22px] font-black leading-none tracking-[-0.02em] text-[#3C0366]">{cob.gri}</div>
                <div className="mt-0.5 text-[11px] text-[#5A0992]">normas GRI</div>
              </div>
              <div>
                <div className="font-display text-[22px] font-black leading-none tracking-[-0.02em] text-[#3C0366]">{cob.ods}</div>
                <div className="mt-0.5 text-[11px] text-[#5A0992]">ODS</div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT column: filters + matrix */}
        <div className="flex min-w-0 flex-col gap-4">
          <Card style={{ padding: '16px 20px 18px', overflow: 'visible' }}>
            <div className="flex flex-wrap items-end gap-[18px]">
              <PublicosDropdown active={active} onToggle={toggle} onAll={selectAll} onNone={selectNone}/>
              <ComparisonDropdown baseId={baseVersion} compareId={compareVersion}
                onChange={(b, c) => { setBaseVersion(b); setCompareVersion(c); }}/>
              <div className="min-w-0 flex-1"/>
              <div className="flex flex-col gap-0.5 text-right text-[11px] text-muted-foreground">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#AA95BE]">Eixo X (oficial)</span>
                <span><b className="text-foreground">Alta Liderança</b> · pesquisa direta com C-Level</span>
              </div>
            </div>
          </Card>

          <Card style={{ padding: '20px 24px 24px', position: 'relative' }}>
            <SectionTitle
              eyebrow={filtered ? 'Vista filtrada' : (cmpLabel ? `Comparativo · ${baseLabel} vs. ${cmpLabel}` : 'Matriz oficial')}
              action={
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Icon name="info" size={12} color="#AA95BE"/>
                  <span>Passe o mouse sobre um tema para ver detalhes</span>
                </span>
              }>
              Relevância para os negócios × stakeholders
            </SectionTitle>
            <div className="relative mt-2">
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
            <div className="mt-3.5 flex flex-wrap items-center gap-4 border-t border-border pt-3.5 text-[11.5px] text-muted-foreground">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#525252]">Sentimento agregado:</div>
              {[
                ['Muito negativo', '#E03131'],
                ['Negativo',       '#F59E0B'],
                ['Levemente +',    '#A8D85E'],
                ['Positivo',       '#00A970'],
                ['Sem dado',       '#AA95BE'],
              ].map(([lbl, c]) => (
                <div key={lbl} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }}/>
                  <span>{lbl}</span>
                </div>
              ))}
              {cmpLabel && (
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full border-[1.5px] border-[#AA95BE] bg-white"/>
                  <span>Posição em {cmpLabel}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Full-width heatmap */}
        <div className="relative col-span-full z-[1] bg-background">
          <HeatmapSentimentoBlock
            themes={THEMES}
            activePublicos={filtered ? active : []}
            onPickTheme={onPickTheme}/>
        </div>

        {/* Full-width ranking */}
        <div className="relative col-span-full z-[1] bg-background">
          <PriorityList themes={THEMES} activePublicos={filtered ? active : []} onPick={onPickTheme}/>
        </div>
      </div>
    </div>
  );
}
