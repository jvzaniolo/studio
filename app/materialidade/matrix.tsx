import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Icon, Pill, Btn } from './icons';
import { Card, PageHeader, SectionTitle, AIInsight } from './components';
import { HeatmapSentimentoBlock } from './dimensions';
import {
  VERSOES, PUBLICOS, PUBLICO_BY_ID, THEMES, ORG, ALTA_LIDERANCA_N,
  recalcEixoY, recalcEixoX, recalcSent, scoreboard, cobertura,
  sentColor, fmtSent, themeStatus, INICIATIVAS,
  type Theme, type Versao,
} from './data';
import {
  Card as ShadCard,
  CardContent,
} from '~/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { cn } from '~/lib/utils';

/* ---------- Scorecard card ---------- */
interface ScoreCardProps {
  label: string;
  value: number | string;
  tone?: string;
  sublabel?: string;
  icon?: string;
  onClick?: () => void;
}

export function ScoreCard({ label, value, onClick }: ScoreCardProps) {
  return (
    <ShadCard
      className={cn('p-[14px_16px] border-t-2 border-t-primary/25', onClick && 'cursor-pointer transition-shadow hover:shadow-md hover:border-t-primary/60')}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="mb-1 min-h-[2.5em] text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-tight">
          {label}
        </div>
        <div className="font-display text-[32px] font-black leading-none tracking-[-0.02em] tabular-nums text-foreground">
          {value}
        </div>
        {onClick && (
          <div className="mt-2 flex items-center gap-0.5 text-[10px] font-semibold text-primary">
            Ver mais
            <ArrowRight className="size-3" />
          </div>
        )}
      </CardContent>
    </ShadCard>
  );
}

/* ---------- Públicos dropdown (filtro puro) ---------- */
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

  const summary =
    allSelected ? 'Todos os públicos'
    : active.length === 0 ? 'Nenhum público'
    : active.length === 1 ? PUBLICO_BY_ID[active[0]]?.label || '1 público'
    : `${active.length} de ${PUBLICOS.length} públicos`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground whitespace-nowrap">
        <Icon name="users" size={12} color="var(--primary)"/>
        <span className={cn('flex-1 text-left', isOriginal && 'text-muted-foreground')}>
          {isOriginal ? 'Filtrar por público' : summary}
        </span>
        {!isOriginal && (
          <Tooltip>
            <TooltipTrigger render={<span className="cursor-help" />}>
              <span className="rounded-full bg-amber-100 px-[7px] py-[2px] text-[10px] font-bold uppercase tracking-[0.06em] text-amber-600">
                filtrado
              </span>
            </TooltipTrigger>
            <TooltipContent>
              A matriz está recalculada só com os públicos selecionados — não é a leitura oficial da matriz.
            </TooltipContent>
          </Tooltip>
        )}
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={13} color="var(--muted-foreground)"/>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-max max-w-[360px] min-w-[280px] rounded-xl border border-border bg-popover p-2 shadow-[0_12px_28px_rgba(60,3,102,0.12)]">
          <div className="mb-1 flex items-center justify-between border-b border-muted px-1.5 pb-2 pt-0.5">
            <span className="text-xs text-muted-foreground">
              Visão {isOriginal
                ? <b className="text-green-600">original</b>
                : <b className="text-amber-600">filtrada</b>}
            </span>
            <div className="flex gap-1">
              <button onClick={onAll} className="cursor-pointer rounded-md border border-border bg-background px-2 py-[3px] text-xs font-semibold text-primary">Todos</button>
              <button onClick={onNone} className="cursor-pointer rounded-md border border-border bg-background px-2 py-[3px] text-xs font-semibold text-muted-foreground">Limpar</button>
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
                    isActive ? 'bg-primary/10' : 'bg-muted/40 hover:bg-primary/5',
                  )}>
                  <span className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px]',
                    isActive ? 'border-[1.5px] border-primary bg-primary' : 'border-[1.5px] border-stone-300 bg-background',
                  )}>
                    {isActive && <Icon name="check" size={10} color="#fff" stroke={3}/>}
                  </span>
                  <span className={cn('flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md', isActive ? 'bg-background' : 'bg-muted')}>
                    <Icon name={pub.icon} size={11} color={isActive ? '#3C0366' : '#737373'}/>
                  </span>
                  <span className={cn('min-w-0 flex-1 text-sm', isActive ? 'font-bold' : 'font-medium text-muted-foreground')}
                    style={isActive ? { color: '#3C0366' } : {}}>
                    {pub.label}
                  </span>
                  {pub.peso !== 1 && (
                    <Tooltip>
                      <TooltipTrigger render={<span className="cursor-help" />}>
                        <span className={cn('rounded-full px-1.5 py-[1px] text-[10px] font-bold', isActive ? 'bg-background text-primary' : 'bg-muted text-muted-foreground')}>
                          {pub.peso}×
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Peso relativo no cálculo agregado dos eixos — quanto maior, mais influência esse público tem na média ponderada.
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 rounded-lg bg-muted/50 px-2.5 py-2 text-xs leading-[1.45] text-muted-foreground">
            Para a visão <b className="text-foreground">original</b>, mantenha todos os públicos selecionados.
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Compare dropdown (unificado: públicos + períodos) ---------- */
interface CompareDropdownProps {
  baseId: string;
  compareId: string | null;
  onVersionChange: (base: string, compare: string | null) => void;
  pubCompareMode: boolean;
  pubActive: string[];
  onPubCompareModeChange: (enabled: boolean) => void;
  onPubToggle: (id: string) => void;
}

export function CompareDropdown({
  baseId, compareId, onVersionChange,
  pubCompareMode, pubActive, onPubCompareModeChange, onPubToggle,
}: CompareDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<'publicos' | 'periodos'>('periodos');
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Sync tab with active comparison type when opening
  React.useEffect(() => {
    if (pubCompareMode) setTab('publicos');
    else if (compareId) setTab('periodos');
  }, [pubCompareMode, compareId]);

  const baseV = VERSOES.find(v => v.id === baseId) || VERSOES.find(v => v.atual);
  const cmpV  = compareId ? VERSOES.find(v => v.id === compareId) : null;

  const isPubComparing = pubCompareMode && pubActive.length === 2;
  const isVersionComparing = !!cmpV;
  const isComparing = isPubComparing || isVersionComparing;

  const handleTabChange = (newTab: 'publicos' | 'periodos') => {
    if (newTab === 'publicos' && !pubCompareMode) {
      onVersionChange(baseId, null);
      onPubCompareModeChange(true);
    } else if (newTab === 'periodos' && pubCompareMode) {
      onPubCompareModeChange(false);
    }
    setTab(newTab);
  };

  const clearAll = () => {
    onPubCompareModeChange(false);
    onVersionChange(baseId, null);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground whitespace-nowrap">
        <Icon name="bar-chart" size={12} color="var(--primary)"/>
        <span className="flex-1 text-left">
          {isPubComparing ? (
            <span className="inline-flex items-center gap-1.5">
              <b style={{ color: PUBLICO_BY_ID[pubActive[0]]?.color }}>{PUBLICO_BY_ID[pubActive[0]]?.short}</b>
              <span className="text-muted-foreground text-xs">vs.</span>
              <b style={{ color: PUBLICO_BY_ID[pubActive[1]]?.color }}>{PUBLICO_BY_ID[pubActive[1]]?.short}</b>
            </span>
          ) : isVersionComparing ? (
            <span className="inline-flex items-center gap-1.5">
              <b>{baseV?.curto}</b>
              <Icon name="arrow-right" size={11} color="var(--muted-foreground)"/>
              <b>{cmpV!.curto}</b>
            </span>
          ) : (
            <span className="text-muted-foreground">Comparar</span>
          )}
        </span>
        {isComparing && (
          <Tooltip>
            <TooltipTrigger render={<span className="cursor-help" />}>
              <span className="rounded-full bg-primary/10 px-[7px] py-[2px] text-[10px] font-bold uppercase tracking-[0.06em] text-primary">
                comparando
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {isPubComparing
                ? 'Comparando a leitura de dois públicos lado a lado para cada tema.'
                : 'Comparando a posição dos temas entre duas versões da matriz.'}
            </TooltipContent>
          </Tooltip>
        )}
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={13} color="var(--muted-foreground)"/>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-max min-w-[300px] rounded-xl border border-border bg-popover p-2.5 shadow-[0_12px_28px_rgba(60,3,102,0.12)]">
          {/* Tab toggle */}
          <div className="mb-3 flex items-center gap-1 rounded-lg border border-border bg-muted p-[3px]">
            {(['publicos', 'periodos'] as const).map(t => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={cn(
                  'flex-1 rounded-md px-3 py-[5px] text-xs font-semibold transition-colors duration-[120ms]',
                  tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t === 'publicos' ? 'Públicos' : 'Períodos'}
              </button>
            ))}
          </div>

          {tab === 'publicos' && (
            <div>
              <div className="mb-2 px-1 text-xs text-muted-foreground">
                {!pubCompareMode
                  ? <span>Ative para selecionar 2 públicos.</span>
                  : pubActive.length < 2
                  ? <b className="text-blue-600">Selecione {2 - pubActive.length} público{2 - pubActive.length > 1 ? 's' : ''}</b>
                  : <b className="text-green-600">Pronto — 2 selecionados</b>}
              </div>
              {!pubCompareMode ? (
                <button
                  onClick={() => handleTabChange('publicos')}
                  className="mb-2 w-full rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10">
                  Ativar comparação por público
                </button>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {PUBLICOS.map(pub => {
                    const isActive = pubActive.includes(pub.id);
                    const slotIndex = pubActive.indexOf(pub.id);
                    const isDisabled = !isActive && pubActive.length >= 2;
                    return (
                      <div
                        key={pub.id}
                        onClick={() => !isDisabled && onPubToggle(pub.id)}
                        className={cn(
                          'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-[120ms]',
                          isDisabled ? 'cursor-not-allowed opacity-40' : '',
                          isActive ? 'bg-[#F0F7FF]' : 'bg-muted/40 hover:bg-primary/5',
                        )}>
                        <span
                          className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px]', isActive ? 'border-0' : 'border-stone-300 bg-background')}
                          style={isActive ? { background: pub.color } : {}}>
                          {isActive && <span className="text-[8px] font-black text-white">{slotIndex + 1}</span>}
                        </span>
                        <span className={cn('flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md', isActive ? 'bg-background' : 'bg-muted')}>
                          <Icon name={pub.icon} size={11} color={isActive ? pub.color : '#737373'}/>
                        </span>
                        <span
                          className={cn('min-w-0 flex-1 text-sm', isActive ? 'font-bold' : 'font-medium text-muted-foreground')}
                          style={isActive ? { color: pub.color } : {}}>
                          {pub.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'periodos' && (
            <div className="flex flex-col gap-3">
              <VersionPicker label="Versão de referência" value={baseId} onChange={(v) => onVersionChange(v, compareId)}/>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                <span className="h-px flex-1 bg-border"/>
                <Icon name="arrow-right" size={11} color="var(--muted-foreground)"/>
                <span>vs.</span>
                <span className="h-px flex-1 bg-border"/>
              </div>
              <VersionPicker label="Comparar com" value={compareId || ''} allowEmpty onChange={(v) => onVersionChange(baseId, v || null)}/>
              {cmpV && (
                <div className="rounded-lg bg-primary/5 px-2.5 py-2 text-xs leading-[1.5] text-primary">
                  Pontos com contorno claro são <b>{cmpV.curto}</b>. Linhas tracejadas conectam ao ponto atual ({baseV?.curto}).
                </div>
              )}
            </div>
          )}

          {isComparing && (
            <button
              onClick={clearAll}
              className="mt-3 w-full rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/60">
              Limpar comparação
            </button>
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
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">{label}</div>
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
                  ? 'border-primary/20 bg-primary/5'
                  : 'border-transparent bg-transparent hover:bg-muted/50',
              )}>
              <span className={cn(
                'h-3.5 w-3.5 shrink-0 rounded-full bg-background',
                isActive ? 'border-[4px] border-primary' : 'border-[1.5px] border-stone-300',
              )}/>
              <span className={cn(
                'min-w-0 flex-1 text-sm text-foreground',
                isActive ? 'font-bold' : 'font-medium',
              )}>
                {opt.label || 'Sem comparação'}
              </span>
              {opt.status && (
                <span className={cn(
                  'text-[10px] font-bold uppercase tracking-[0.06em]',
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
interface PubCompareSlot {
  id: string;
  label: string;
  color: string;
  y: number;
  sent: number | null;
}

interface MatrixPoint {
  id: number;
  name: string;
  x: number;
  y: number;
  sent: number | null;
  cmp: { x: number; y: number; sentimento?: number } | null;
  tema: Theme;
  pubCompare?: { pub1: PubCompareSlot; pub2: PubCompareSlot };
}

const ESG_COLOR: Record<'E' | 'S' | 'G', string> = {
  E: '#16A34A',
  S: '#2563EB',
  G: '#7401C3',
};

type XDimension = 'negocios' | 'impacto' | 'financeira';

interface MatrixSVGProps {
  themes: Theme[];
  activePublicos: string[];
  basePos?: (t: Theme) => { x: number; y: number; sentimento?: number | null };
  comparePos?: (t: Theme) => { x: number; y: number; sentimento?: number | null } | null;
  onPick?: (id: number) => void;
  onHover?: (point: MatrixPoint | null) => void;
  hoverId?: number;
  selectedId?: number;
  colorMode?: 'sentiment' | 'esg';
  pubComparePair?: [string, string];
  xDimension?: XDimension;
}

export function MatrixSVG({ themes, activePublicos, basePos, comparePos, onPick, onHover, hoverId, selectedId, colorMode = 'sentiment', pubComparePair, xDimension = 'negocios' }: MatrixSVGProps) {
  const W = 720, H = 480;
  const ML = 60, MR = 30, MT = 24, MB = 50;

  // Compute data extent for dynamic axis scaling
  const isPubCompareEarly = pubComparePair != null;
  const _allX: number[] = [], _allY: number[] = [];
  themes.forEach(t => {
    const yLive = recalcEixoY(t, activePublicos);
    const usingFilter = !isPubCompareEarly && activePublicos.length > 0 && activePublicos.length < PUBLICOS.length;
    const base = basePos ? basePos(t) : { x: t.x, y: yLive };
    const rawX = xDimension === 'impacto' ? t.impacto : xDimension === 'financeira' ? t.financeira : (usingFilter ? recalcEixoX(t, activePublicos) : base.x);
    const rawY = usingFilter ? yLive : base.y;
    _allX.push(rawX); _allY.push(rawY);
    const cmp = comparePos ? comparePos(t) : null;
    if (cmp) { _allX.push(cmp.x); _allY.push(cmp.y); }
    if (isPubCompareEarly) {
      _allY.push(recalcEixoY(t, [pubComparePair![0]]));
      _allY.push(recalcEixoY(t, [pubComparePair![1]]));
    }
  });
  const PAD = 5;
  const minX = Math.max(0,   Math.floor((Math.min(..._allX) - PAD) / 5) * 5);
  const maxX = Math.min(100, Math.ceil ((Math.max(..._allX) + PAD) / 5) * 5);
  const minY = Math.max(0,   Math.floor((Math.min(..._allY) - PAD) / 5) * 5);
  const maxY = Math.min(100, Math.ceil ((Math.max(..._allY) + PAD) / 5) * 5);

  const px = (v: number) => ML + ((v - minX) / (maxX - minX)) * (W - ML - MR);
  const py = (v: number) => H - MB - ((v - minY) / (maxY - minY)) * (H - MT - MB);

  // Dynamic tick generation (every 5 within range)
  const xTicks = Array.from({ length: Math.round((maxX - minX) / 5) + 1 }, (_, i) => minX + i * 5);
  const yTicks = Array.from({ length: Math.round((maxY - minY) / 5) + 1 }, (_, i) => minY + i * 5);

  const thresholdX = 75, thresholdY = 65;

  const isPubCompare = pubComparePair != null;

  const xLabel =
    xDimension === 'impacto'    ? 'Impacto (inside-out) →' :
    xDimension === 'financeira' ? 'Materialidade Financeira (outside-in) →' :
    'Relevância para os negócios (Alta Liderança) →';

  const points: MatrixPoint[] = themes.map(t => {
    const yLive = recalcEixoY(t, activePublicos);
    const sLive = recalcSent(t, activePublicos);
    const usingFilter = !isPubCompare && activePublicos.length > 0 && activePublicos.length < PUBLICOS.length;
    const base = basePos ? basePos(t) : { x: t.x, y: yLive, sentimento: sLive };
    const cmp  = comparePos && xDimension === 'negocios' ? comparePos(t) : null;

    const rawX = xDimension === 'impacto' ? t.impacto : xDimension === 'financeira' ? t.financeira : (usingFilter ? recalcEixoX(t, activePublicos) : base.x);

    let pubCompare: MatrixPoint['pubCompare'];
    if (isPubCompare) {
      const [id1, id2] = pubComparePair!;
      const p1 = PUBLICO_BY_ID[id1];
      const p2 = PUBLICO_BY_ID[id2];
      pubCompare = {
        pub1: { id: id1, label: p1?.label ?? id1, color: p1?.color ?? '#7401C3', y: recalcEixoY(t, [id1]), sent: recalcSent(t, [id1]) },
        pub2: { id: id2, label: p2?.label ?? id2, color: p2?.color ?? '#2563EB', y: recalcEixoY(t, [id2]), sent: recalcSent(t, [id2]) },
      };
    }

    return {
      id: t.id,
      name: t.nome,
      x: rawX,
      y: usingFilter ? yLive : base.y,
      sent: usingFilter ? sLive : (base.sentimento != null ? base.sentimento : sLive),
      cmp: cmp ? { x: cmp.x, y: cmp.y, sentimento: cmp.sentimento ?? undefined } : null,
      tema: t,
      pubCompare,
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
      {thresholdX > minX && thresholdX < maxX && thresholdY > minY && thresholdY < maxY && (<>
        <rect x={px(thresholdX)} y={py(maxY)} width={px(maxX) - px(thresholdX)} height={py(thresholdY) - py(maxY)} fill="#FAF5FE"/>
        <rect x={px(minX)} y={py(thresholdY)} width={px(thresholdX) - px(minX)} height={py(minY) - py(thresholdY)} fill="#FAFCFA"/>
      </>)}

      {/* X grid lines */}
      {xTicks.filter(v => v > minX && v < maxX).map(v => (
        <line key={`vx${v}`} x1={px(v)} y1={py(minY)} x2={px(v)} y2={py(maxY)} stroke="#F0EBF4" strokeWidth="1"/>
      ))}
      {/* Y grid lines */}
      {yTicks.filter(v => v > minY && v < maxY).map(v => (
        <line key={`hy${v}`} x1={px(minX)} y1={py(v)} x2={px(maxX)} y2={py(v)} stroke="#F0EBF4" strokeWidth="1"/>
      ))}

      {/* Thresholds dashed */}
      {thresholdX > minX && thresholdX < maxX && (
        <line x1={px(thresholdX)} y1={py(minY)} x2={px(thresholdX)} y2={py(maxY)} stroke="#AA95BE" strokeWidth="1" strokeDasharray="4 4" opacity="0.7"/>
      )}
      {thresholdY > minY && thresholdY < maxY && (
        <line x1={px(minX)} y1={py(thresholdY)} x2={px(maxX)} y2={py(thresholdY)} stroke="#AA95BE" strokeWidth="1" strokeDasharray="4 4" opacity="0.7"/>
      )}

      {/* Quadrant labels */}
      <text x={px(maxX) - 8} y={py(maxY) + 16} textAnchor="end" fontFamily="Lato" fontWeight="700" fontSize="11" letterSpacing="1" fill="#7401C3">PRIORIDADE MÁXIMA</text>
      <text x={px(minX) + 8} y={py(maxY) + 16} textAnchor="start" fontFamily="Lato" fontWeight="700" fontSize="11" letterSpacing="1" fill="#737373">ENGAJAMENTO</text>
      <text x={px(maxX) - 8} y={py(minY) - 10} textAnchor="end" fontFamily="Lato" fontWeight="700" fontSize="11" letterSpacing="1" fill="#737373">ESTRATÉGICO</text>
      <text x={px(minX) + 8} y={py(minY) - 10} textAnchor="start" fontFamily="Lato" fontWeight="700" fontSize="11" letterSpacing="1" fill="#AA95BE">MONITORAR</text>

      {/* Axes */}
      <line x1={px(minX)} y1={py(minY)} x2={px(maxX)} y2={py(minY)} stroke="#0A0A0A" strokeWidth="1.5"/>
      <line x1={px(minX)} y1={py(minY)} x2={px(minX)} y2={py(maxY)} stroke="#0A0A0A" strokeWidth="1.5"/>

      {/* X ticks */}
      {xTicks.map(t => (
        <g key={`xt${t}`}>
          <line x1={px(t)} y1={py(minY)} x2={px(t)} y2={py(minY) + 4} stroke="#737373" strokeWidth="1"/>
          <text x={px(t)} y={py(minY) + 18} textAnchor="middle" fontSize="10" fill="#737373" fontFamily="Open Sans">{t}</text>
        </g>
      ))}
      {/* Y ticks */}
      {yTicks.map(t => (
        <g key={`yt${t}`}>
          <line x1={px(minX) - 4} y1={py(t)} x2={px(minX)} y2={py(t)} stroke="#737373" strokeWidth="1"/>
          <text x={px(minX) - 8} y={py(t) + 3} textAnchor="end" fontSize="10" fill="#737373" fontFamily="Open Sans">{t}</text>
        </g>
      ))}

      {/* Axis titles */}
      <text x={(px(minX) + px(maxX)) / 2} y={H - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="#525252" fontFamily="Open Sans">Materialidade financeira →</text>
      <text x={-(py(minY) + py(maxY)) / 2} y={18} transform="rotate(-90)" textAnchor="middle" fontSize="11" fontWeight="600" fill="#525252" fontFamily="Open Sans">Materialidade de impacto →</text>

      {/* Version compare arrows (existing feature) */}
      {!isPubCompare && points.map(p => p.cmp && (
        <g key={`cmp${p.id}`}>
          <line x1={px(p.cmp.x)} y1={py(p.cmp.y)} x2={px(p.x)} y2={py(p.y)} stroke="#AA95BE" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.75"/>
          <circle cx={px(p.cmp.x)} cy={py(p.cmp.y)} r="4.5" fill="#fff" stroke="#AA95BE" strokeWidth="1.6"/>
        </g>
      ))}

      {/* Pub compare: connecting lines (render before circles so circles are on top) */}
      {isPubCompare && points.map(p => {
        const pc = p.pubCompare!;
        return (
          <line key={`pcline${p.id}`}
            x1={px(p.x)} y1={py(pc.pub1.y)}
            x2={px(p.x)} y2={py(pc.pub2.y)}
            stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
        );
      })}

      {/* Points */}
      {points.map(p => {
        const isHover = hoverId === p.id;
        const isSel   = selectedId === p.id;

        if (isPubCompare && p.pubCompare) {
          const pc = p.pubCompare;
          const r1 = isHover ? 11 : 9;
          const r2 = isHover ? 11 : 9;
          return (
            <g key={p.id}
              onMouseEnter={() => onHover && onHover(p)}
              onMouseLeave={() => onHover && onHover(null)}
              onClick={() => onPick && onPick(p.id)}
              style={{ cursor: 'pointer' }}>
              {isHover && <circle cx={px(p.x)} cy={py(pc.pub1.y)} r={18} fill={pc.pub1.color} opacity={0.15}/>}
              {isHover && <circle cx={px(p.x)} cy={py(pc.pub2.y)} r={18} fill={pc.pub2.color} opacity={0.15}/>}
              <circle cx={px(p.x)} cy={py(pc.pub1.y)} r={r1} fill={pc.pub1.color} stroke="#fff" strokeWidth="2"/>
              <text x={px(p.x)} y={py(pc.pub1.y) + 3.5} textAnchor="middle"
                fontFamily="Lato" fontWeight="900" fontSize="10" fill="#fff" style={{ pointerEvents: 'none' }}>
                {String(p.id).padStart(2, '0')}
              </text>
              <circle cx={px(p.x)} cy={py(pc.pub2.y)} r={r2} fill={pc.pub2.color} stroke="#fff" strokeWidth="2"/>
              <text x={px(p.x)} y={py(pc.pub2.y) + 3.5} textAnchor="middle"
                fontFamily="Lato" fontWeight="900" fontSize="10" fill="#fff" style={{ pointerEvents: 'none' }}>
                {String(p.id).padStart(2, '0')}
              </text>
            </g>
          );
        }

        const radius = isHover || isSel ? 11 : 9;
        const auraR  = isHover || isSel ? 18 : 14;
        const fg = colorMode === 'esg' ? ESG_COLOR[p.tema.esg] : sentColor(p.sent);
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

  if (point.pubCompare) {
    const { pub1, pub2 } = point.pubCompare;
    const deltaY = pub1.y - pub2.y;
    const deltaSent = pub1.sent != null && pub2.sent != null ? pub1.sent - pub2.sent : null;
    return (
      <div className="pointer-events-none absolute right-3 top-3 z-[5] w-[300px] animate-[hu-fade-in_160ms_ease-out_both] rounded-xl border border-border bg-card/95 backdrop-blur-sm px-[14px] pb-[14px] pt-3 shadow-[0_8px_24px_rgba(60,3,102,0.16)]">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-primary">Tema {String(t.id).padStart(2, '0')}</span>
          <Pill tone={st.tone as 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand'} size="sm">{st.label}</Pill>
        </div>
        <div className="mb-2 font-display text-sm font-bold leading-[1.3] text-foreground">{t.nome}</div>
        <div className="flex flex-col gap-1.5">
          {([pub1, pub2] as const).map(pub => (
            <div key={pub.id} className="rounded-lg px-2.5 py-2" style={{ background: `${pub.color}10`, border: `1px solid ${pub.color}30` }}>
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: pub.color }}/>
                <span className="text-xs font-bold" style={{ color: pub.color }}>{pub.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <TipStat label="Stakeholders" value={`${pub.y}%`} delta={null}/>
                <TipStat label="Sentimento" value={fmtSent(pub.sent)} color={sentColor(pub.sent)} delta={null}/>
              </div>
            </div>
          ))}
          {(deltaY !== 0 || deltaSent !== null) && (
            <div className="rounded-lg bg-muted/50 px-2.5 py-1.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground mb-1">Diferença</div>
              <div className="flex gap-3 text-xs font-bold tabular-nums">
                <span className={deltaY > 0 ? 'text-green-600' : deltaY < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                  Stakeh. {deltaY > 0 ? '↑' : deltaY < 0 ? '↓' : '='} {Math.abs(deltaY)}
                </span>
                {deltaSent !== null && (
                  <span className={deltaSent > 0 ? 'text-green-600' : deltaSent < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                    Sent. {deltaSent > 0 ? '↑' : deltaSent < 0 ? '↓' : '='} {Math.abs(deltaSent)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-2 border-t border-dashed border-border pt-2 text-xs text-muted-foreground">
          {inicCount > 0
            ? <span><b className="text-primary">{inicCount}</b> iniciativa{inicCount > 1 ? 's' : ''} vinculada{inicCount > 1 ? 's' : ''}</span>
            : <span className="font-semibold text-amber-600">Sem iniciativa</span>}
        </div>
      </div>
    );
  }

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
    <div className="pointer-events-none absolute right-3 top-3 z-[5] w-[280px] animate-[hu-fade-in_160ms_ease-out_both] rounded-xl border border-border bg-card/95 backdrop-blur-sm px-[14px] pb-[14px] pt-3 shadow-[0_8px_24px_rgba(60,3,102,0.16)]">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
          Tema {String(t.id).padStart(2, '0')}
        </span>
        <Pill tone={st.tone as 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand'} size="sm">{st.label}</Pill>
      </div>
      <div className="mb-2 font-display text-sm font-bold leading-[1.3] text-foreground">
        {t.nome}
      </div>
      <div className="mb-2.5 text-xs leading-[1.4] text-muted-foreground">
        {t.descricao}
      </div>
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 px-2.5 py-2">
        <TipStat label="Negócios" value={`${point.x}%`} delta={cmpLabel ? deltaX : null}/>
        <TipStat label="Stakeh." value={`${point.y}%`} delta={cmpLabel ? deltaY : null}/>
        <TipStat label="Sent." value={fmtSent(point.sent)} color={sentColor(point.sent)} delta={cmpLabel ? deltaSent : null}/>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-dashed border-border pt-2 text-xs text-muted-foreground">
        <span>
          {inicCount > 0
            ? <span><b className="text-primary">{inicCount}</b> iniciativa{inicCount > 1 ? 's' : ''} vinculada{inicCount > 1 ? 's' : ''}</span>
            : <span className="font-semibold text-amber-600">Sem iniciativa</span>}
        </span>
        {cmpLabel && <span className="font-semibold text-muted-foreground/60">{baseLabel} vs. {cmpLabel}</span>}
      </div>
    </div>
  );
}

function TipStat({ label, value, color, delta }: { label: string; value: string; color?: string; delta: number | null }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">{label}</div>
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
      <SectionTitle eyebrow="Top 10 · ordem de prioridade">
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
      className="grid cursor-pointer items-center gap-2.5 rounded-[10px] border border-border bg-background px-3 py-2.5 transition-colors duration-[120ms] hover:border-primary/20 hover:bg-primary/5 [grid-template-columns:36px_1fr_auto]">
      <div className={cn(
        'text-center font-display text-[22px] font-black tabular-nums tracking-[-0.03em]',
        pos <= 3 ? 'text-primary' : 'text-muted-foreground/60',
      )}>
        {String(pos).padStart(2, '0')}
      </div>
      <div className="min-w-0">
        <div className="mb-1 truncate text-sm font-semibold text-foreground">
          {theme.nome}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn(
            'rounded-full px-1.5 py-[1px] text-[10px] font-bold uppercase tracking-[0.06em]',
            tone.fg, tone.bg,
          )}>{st.label}</span>
          <span className="text-xs font-bold tabular-nums" style={{ color: sentColor(s) }}>
            {fmtSent(s)}
          </span>
        </div>
      </div>
      <Icon name="chevron-right" size={14} color="var(--muted-foreground)"/>
    </div>
  );
}

/* ---------- Matrix Ranking Sidebar ---------- */
interface MatrixRankingSidebarProps {
  themes: Theme[];
  activePublicos: string[];
  colorMode: 'sentiment' | 'esg';
  hoverId?: number;
  onHover: (t: Theme | null) => void;
  onPick: (id: number) => void;
}

function MatrixRankingSidebar({ themes, activePublicos, colorMode, hoverId, onHover, onPick }: MatrixRankingSidebarProps) {
  const ranked = themes.map(t => {
    const y = recalcEixoY(t, activePublicos);
    const s = recalcSent(t, activePublicos);
    const sentPenalty = s != null ? Math.max(0, -s) * 0.20 : 0;
    const score = (t.x + y) / 2 + sentPenalty;
    return { theme: t, y, s, score };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Ranking · {ranked.length} temas
      </div>
      <div className="mat-scroll flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[2px]">
          {ranked.map((r, i) => {
            const isHover = hoverId === r.theme.id;
            const dotColor = colorMode === 'esg' ? ESG_COLOR[r.theme.esg] : sentColor(r.s);
            const isMaterial = r.theme.x >= 75 && r.y >= 65;
            return (
              <div
                key={r.theme.id}
                onMouseEnter={() => onHover(r.theme)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onPick(r.theme.id)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-[7px] px-2 py-[5px] transition-colors duration-[120ms]',
                  isHover ? 'bg-primary/5' : 'hover:bg-primary/5',
                )}
              >
                <span className={cn(
                  'w-[22px] shrink-0 text-right font-display text-xs font-black tabular-nums leading-none',
                  isMaterial ? 'text-primary' : 'text-muted-foreground/50',
                )}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="h-[7px] w-[7px] shrink-0 rounded-full"
                  style={{ background: dotColor }}
                />
                <span className={cn(
                  'min-w-0 flex-1 text-xs leading-[1.3]',
                  isHover ? 'font-semibold text-foreground' : 'font-normal text-foreground/80',
                )}>
                  {r.theme.nome}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="font-display text-xs font-black tabular-nums text-primary">01</span>
          tema no quadrante de prioridade máxima
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-display text-xs font-black tabular-nums text-muted-foreground/50">04</span>
          demais temas
        </span>
      </div>
    </div>
  );
}

/* ---------- Main Overview ---------- */
interface OverviewProps {
  onPickTheme: (id: number) => void;
  activeCycle?: string;
  externalActive?: string[];
  onExternalToggle?: (id: string) => void;
  onExternalSelectAll?: () => void;
  onExternalSelectNone?: () => void;
}

export function Overview({ onPickTheme, activeCycle = 'v2025', externalActive, onExternalToggle, onExternalSelectAll, onExternalSelectNone }: OverviewProps) {
  const navigate = useNavigate();
  const [internalActive, setInternalActive] = React.useState(PUBLICOS.map(p => p.id));
  const active = externalActive ?? internalActive;
  const [hoverPoint, setHoverPoint] = React.useState<MatrixPoint | null>(null);
  const [baseVersion, setBaseVersion] = React.useState(activeCycle);
  const [compareVersion, setCompareVersion] = React.useState<string | null>(null);

  React.useEffect(() => { setBaseVersion(activeCycle); setCompareVersion(null); }, [activeCycle]);
  const [colorMode, setColorMode] = React.useState<'sentiment' | 'esg'>('sentiment');
  const [pubCompareMode, setPubCompareMode] = React.useState(false);
  const [xDimension, setXDimension] = React.useState<XDimension>('negocios');

  const allSelected = active.length === PUBLICOS.length;
  const filtered = !allSelected;

  const toggle = (id: string) => {
    if (onExternalToggle) onExternalToggle(id);
    else setInternalActive(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };
  const selectAll = () => {
    if (onExternalSelectAll) onExternalSelectAll();
    else setInternalActive(PUBLICOS.map(p => p.id));
  };
  const selectNone = () => {
    if (onExternalSelectNone) onExternalSelectNone();
    else setInternalActive([]);
  };
  const pubComparePair: [string, string] | undefined =
    pubCompareMode && active.length === 2 ? [active[0], active[1]] : undefined;

  const sb = scoreboard(THEMES, filtered ? active : []);
  const cob = cobertura(THEMES);

  const totalStakeholders = React.useMemo(() => {
    const seen = new Map<string, number>([['alta_lideranca', ALTA_LIDERANCA_N]]);
    THEMES.forEach(t => {
      t.por_publico.forEach(pp => {
        seen.set(pp.publico, Math.max(seen.get(pp.publico) ?? 0, pp.n_amostra));
      });
      seen.set('investidores', Math.max(seen.get('investidores') ?? 0, t.investidores.n_amostra));
    });
    return Array.from(seen.values()).reduce((s, v) => s + v, 0);
  }, []);

  const totalComentarios = React.useMemo(() =>
    THEMES.reduce((s, t) => s + t.por_publico.filter(pp => pp.sentimento != null).reduce((a, pp) => a + pp.n_amostra, 0), 0)
  , []);

  const temasPrioritarios = React.useMemo(() =>
    THEMES.filter(t => {
      const y = recalcEixoY(t, filtered ? active : []);
      return t.x >= 75 && y >= 65;
    }).length
  , [filtered, active]);

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

      {filtered && (
        <div className="hu-fade mx-8 mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Icon name="filter" size={16} color="#B45309"/>
          <div className="flex-1 text-sm text-amber-900">
            <b>Vista filtrada</b> — você está vendo apenas as percepções de <b>{active.length} público(s)</b> sobre a matriz. Esta não é a matriz oficial.
          </div>
          <Btn size="sm" variant="ghost" icon="x" onClick={selectAll}>Restaurar todos</Btn>
        </div>
      )}

      <div className="flex flex-col gap-4 px-8 pt-6 pb-8">

        {/* Matriz + Ranking — lado a lado */}
        <div className="flex gap-4 items-stretch">

          {/* Ranking — card separado, à esquerda */}
          <Card className="w-[340px] shrink-0 flex flex-col" style={{ padding: '16px 20px' }}>
            <MatrixRankingSidebar
              themes={THEMES}
              activePublicos={filtered ? active : []}
              colorMode={colorMode}
              hoverId={hoverPoint?.id}
              onHover={(t) => setHoverPoint(t ? ({ id: t.id, name: t.nome, x: t.x, y: recalcEixoY(t, filtered ? active : []), sent: recalcSent(t, filtered ? active : []), cmp: null, tema: t }) : null)}
              onPick={onPickTheme}
            />
          </Card>

          {/* Matriz com filtros integrados */}
          <Card className="min-w-0 flex-1" style={{ padding: '16px 20px', position: 'relative', overflow: 'visible' }}>
            <SectionTitle className="mb-3" eyebrow={filtered ? 'Vista filtrada' : (cmpLabel ? `Comparativo · ${baseLabel} vs. ${cmpLabel}` : 'Matriz de Materialidade')}/>

            {/* Filtros integrados — linha única */}
            <div className="mb-2 flex items-center gap-3 border-b border-border pb-3">
              <PublicosDropdown active={active} onToggle={toggle} onAll={selectAll} onNone={selectNone}/>
              <CompareDropdown
                baseId={baseVersion} compareId={compareVersion}
                onVersionChange={(b, c) => { setBaseVersion(b); setCompareVersion(c); }}
                pubCompareMode={pubCompareMode} pubActive={active}
                onPubCompareModeChange={(enabled) => { setPubCompareMode(enabled); if (enabled) selectNone(); else selectAll(); }}
                onPubToggle={toggle}
              />
              <div className="min-w-0 flex-1"/>
              {/* Toggle cor */}
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-[3px]">
                {(['sentiment', 'esg'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setColorMode(mode)}
                    className={cn(
                      'rounded-md px-3 py-1 text-xs font-semibold transition-colors duration-[120ms]',
                      colorMode === mode
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {mode === 'sentiment' ? 'Sentimento' : 'ESG'}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG + tooltip */}
            <div className="relative">
              <MatrixSVG
                themes={THEMES}
                activePublicos={filtered ? active : []}
                basePos={basePos}
                comparePos={comparePos}
                onPick={onPickTheme}
                onHover={setHoverPoint}
                hoverId={hoverPoint?.id}
                colorMode={colorMode}
                pubComparePair={pubComparePair}
                xDimension={xDimension}
              />
              <HoverTooltip point={hoverPoint} baseLabel={baseLabel} cmpLabel={cmpLabel}/>
            </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-4 border-t border-border pt-1.5 text-xs text-muted-foreground">
            {pubComparePair ? (
              <>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Comparando:</div>
                {pubComparePair.map(id => {
                  const pub = PUBLICO_BY_ID[id];
                  return (
                    <div key={id} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: pub?.color }}/>
                      <span className="font-semibold" style={{ color: pub?.color }}>{pub?.label}</span>
                    </div>
                  );
                })}
                <span className="text-xs text-muted-foreground">· Linha conecta os dois pontos de cada tema</span>
              </>
            ) : colorMode === 'sentiment' ? (
              <>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sentimento agregado:</div>
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
              </>
            ) : (
              <>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Dimensão ESG:</div>
                {([
                  ['E · Ambiental',   '#16A34A'],
                  ['S · Social',      '#2563EB'],
                  ['G · Governança',  '#7401C3'],
                ] as const).map(([lbl, c]) => (
                  <div key={lbl} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }}/>
                    <span>{lbl}</span>
                  </div>
                ))}
              </>
            )}
            {cmpLabel && (
              <div className="ml-auto flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full border-[1.5px] border-muted-foreground/40 bg-background"/>
                <span>Posição em {cmpLabel}</span>
              </div>
            )}
          </div>
          </Card>

        </div>

        {/* Big numbers */}
        <div className="mat-scorecard">
          <ScoreCard label="Players analisados"       value="16"                                                                                             onClick={() => navigate('/materialidade/benchmark')}/>
          <ScoreCard label="Stakeholders consultados" value={totalStakeholders > 999 ? `${(totalStakeholders / 1000).toFixed(1)}k` : String(totalStakeholders)} onClick={() => navigate('/materialidade/stakeholders')}/>
          <ScoreCard label="Comentários analisados"   value={totalComentarios > 999 ? `${(totalComentarios / 1000).toFixed(1)}k` : String(totalComentarios)}    onClick={() => navigate('/materialidade/comentarios')}/>
          <ScoreCard label="Temas identificados"      value={sb.total}                                                                                           onClick={() => navigate('/materialidade/temas')}/>
          <ScoreCard label="Temas prioritários"       value={String(temasPrioritarios).padStart(2, '0')}                                                         onClick={() => navigate('/materialidade/prioritarios')}/>
        </div>

        {/* Conteúdo de suporte — abaixo da matriz */}
        <AIInsight
          title="Síntese executiva"
          sintese={sint}
          prioridades={prioridades}
          tone={filtered ? 'warning' : 'brand'}
          compact
        />

        {/* Heatmap */}
        <div className="relative z-[1] bg-background">
          <HeatmapSentimentoBlock
            themes={THEMES}
            activePublicos={filtered ? active : []}
            onPickTheme={onPickTheme}/>
        </div>


      </div>
    </div>
  );
}
