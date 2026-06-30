import React from 'react';
import { Icon } from './icons';
import { AIFlat } from './components';
import { Card } from './components';
import { PUBLICOS, PUBLICO_BY_ID, getDimValue, sentColor, type Theme } from './data';
import { cn } from '~/lib/utils';
import { Badge } from '~/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { Separator } from '~/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

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
    <div className="inline-flex self-start items-center gap-1 rounded-lg border border-border bg-muted p-[3px]">
      {options.map(opt => {
        const isActive = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-semibold transition-colors duration-[120ms] whitespace-nowrap',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
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
    ...PUBLICOS.filter(p => p.id !== 'alta_lideranca' && p.id !== 'especialistas').map(p => ({ id: p.id, label: p.label, short: p.short, kind: 'publico' as const })),
    { id: 'alta_lideranca', label: 'Alta Liderança', short: 'Alta Lid.', kind: 'al' as const },
  ];

  const allActive = activePublicos.length === 0 || activePublicos.length === PUBLICOS.length;
  const isDimmed = (col: { id: string; kind: string }) => {
    if (col.kind === 'al') return false;
    if (allActive) return false;
    return !activePublicos.includes(col.id);
  };

  return (
    <div className="hu-fade flex flex-col gap-[14px]">
      <div className="flex flex-col gap-3">
        <div className="text-xs font-bold tracking-[0.10em] uppercase text-muted-foreground">
          Análise multi-stakeholder em 2 dimensões
        </div>
        <DimensionRadio value={dim} onChange={setDim} />
      </div>

      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
        <span>
          Faixa:{' '}
          <b className="text-foreground font-semibold tabular-nums">
            {dimDef.range[0]} a {dimDef.range[1]}
          </b>
        </span>
        <Separator orientation="vertical" className="h-3" />
        <span className="inline-flex items-center gap-[6px]">
          <Icon name="info" size={12} color="#AA95BE" />
          Clique em uma linha para abrir o tema correspondente
        </span>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px] border-0 rounded-none max-h-none">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border w-80 min-w-[280px] tracking-[0.02em]">
                  Tema
                </TableHead>
                {cols.map(c => {
                  const dimmed = isDimmed(c);
                  return (
                    <TableHead
                      key={c.id}
                      className={cn(
                        'text-center px-2 py-3 text-xs font-semibold border-b border-border tracking-[0.02em] whitespace-nowrap transition-opacity',
                        c.kind === 'al'
                          ? 'text-primary border-l border-primary/20 bg-primary/5'
                          : 'text-muted-foreground',
                        dimmed && 'bg-muted opacity-55',
                        !dimmed && c.kind !== 'al' && 'bg-muted/50',
                      )}
                    >
                      {c.label}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {themes.map(t => (
                <HeatmapRow
                  key={t.id}
                  theme={t}
                  cols={cols}
                  dim={dim}
                  onClick={() => onPickTheme(t.id)}
                  isDimmed={isDimmed}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="px-5 py-3 bg-[#FCFAFD] border-t border-border flex items-center gap-4 flex-wrap">
          <ScaleLegend dim={dim} />
          <div className="flex-1 min-w-[200px] text-xs text-muted-foreground leading-[1.55]">
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
  return (
    <TableRow
      onClick={onClick}
      className="cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <TableCell className="px-4 py-[11px] border-b border-border text-sm font-medium text-foreground hover:font-bold">
        <div className="flex items-center gap-[10px]">
          <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-[6px] shrink-0 bg-primary/10 text-primary font-heading font-black text-xs tracking-[-0.02em]">
            {String(theme.id).padStart(2, '0')}
          </span>
          <span className="leading-snug">
            {theme.nome}
          </span>
        </div>
      </TableCell>
      {cols.map(c => {
        const v = getDimValue(theme, c.id, dim);
        const dimmed = isDimmed(c);
        const bg = dimmed ? '#FAFAFA' : dimCellBg(dim, v);
        const fg = dimCellFg(dim, v);
        return (
          <TableCell
            key={c.id}
            className={cn(
              'p-0 border-b border-border text-center transition-opacity duration-150',
              c.kind === 'al' && 'border-l border-primary/20',
              dimmed && 'opacity-55',
            )}
            style={{ background: bg }}
          >
            <div
              className="px-2 py-[11px] font-heading font-bold text-[13.5px] tabular-nums tracking-[-0.01em]"
              style={{ color: fg }}
            >
              {fmtDimValue(dim, v)}
            </div>
          </TableCell>
        );
      })}
    </TableRow>
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
      <div className="flex items-center gap-[6px]">
        <span className="text-xs font-bold tracking-[0.06em] uppercase text-muted-foreground">
          Escala
        </span>
        {stops.map(s => (
          <span
            key={s.v}
            className="inline-flex items-center justify-center min-w-[36px] h-[22px] rounded border border-border text-xs font-bold text-muted-foreground tabular-nums"
            style={{ background: s.bg }}
          >
            {s.v}
          </span>
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
    <div className="flex items-center gap-[6px]">
      <span className="text-xs font-bold tracking-[0.06em] uppercase text-muted-foreground">
        Escala
      </span>
      {stops.map(s => (
        <span
          key={s.v}
          className="inline-flex items-center justify-center min-w-[56px] h-[22px] rounded border border-border text-xs font-bold text-muted-foreground tabular-nums"
          style={{ background: s.bg }}
        >
          {s.v}
        </span>
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
    <div className="hu-fade flex flex-col gap-[14px]">
      {gapRel >= 12 && maxPub && minPub && (
        <AIFlat tone="warning" footer={false}
          title="Divergência entre públicos"
          sintese={
            <span>
              Há <b>{gapRel}pp</b> de diferença na relevância entre os públicos.{' '}
              <b>{PUBLICO_BY_ID[maxPub.publico]?.label}</b> avalia em <b>{maxPub.relevancia}%</b>;{' '}
              <b>{PUBLICO_BY_ID[minPub.publico]?.label}</b> em <b>{minPub.relevancia}%</b>. Vale endereçar antes do próximo ciclo.
            </span>
          }
        />
      )}

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-6 pt-[18px] pb-[14px] flex items-start justify-between gap-[14px] flex-wrap">
          <div className="min-w-0">
            <div className="text-[16px] font-semibold text-foreground">
              Visão dos stakeholders sobre o tema
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Comparativo dos 5 públicos consultados + leitura direta da Alta Liderança.
            </div>
          </div>
          <div className="flex items-center gap-[10px] flex-wrap">
            <span className="text-xs font-bold tracking-[0.06em] uppercase text-muted-foreground">
              Dimensão
            </span>
            <DimensionRadio value={dim} onChange={setDim} />
          </div>
        </div>

        <div className="px-6 py-2">
          {stakeholderRows.map(r => (
            <React.Fragment key={r.id}>
              <VisaoRow
                row={r}
                theme={theme}
                dim={dim}
                expanded={expanded.includes(r.id)}
                onToggle={r.hasCargo ? () => toggleExpand(r.id) : null}
              />
              {r.hasCargo && expanded.includes(r.id) && theme.por_cargo?.map(c => (
                <CargoSubRow key={c.cargo} cargo={c} dim={dim} />
              ))}
            </React.Fragment>
          ))}

          <div className="mx-1 mt-[10px] mb-[6px] pt-3 pb-1 border-t border-dashed border-primary/30 flex items-center gap-2">
            <span className="text-xs font-bold tracking-[0.10em] uppercase text-primary/50">
              Consulta direta
            </span>
          </div>
          <VisaoRow row={alRow} theme={theme} dim={dim} isAL />
        </div>

        <div className="px-6 py-3 bg-[#FCFAFD] border-t border-border text-xs text-muted-foreground leading-[1.55]">
          {dimDef.nota}
        </div>

        <div className="bg-muted/50 border-t border-border px-6 py-3 flex items-center gap-[10px] text-xs text-muted-foreground">
          <Icon name="shield" size={14} color="#7401C3" />
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
  const v = getDimValue(theme, row.id, dim);
  const isSent = dim === 'sentimento';
  const isHighlight = row.highlight;
  const BAR_H = 14;

  let barRender: React.ReactNode;
  if (v == null) {
    barRender = (
      <div className="w-full relative" style={{ height: BAR_H }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'repeating-linear-gradient(45deg, #F4F4F5, #F4F4F5 4px, #FAFAFA 4px, #FAFAFA 8px)',
          }}
        />
      </div>
    );
  } else if (isSent) {
    const valPct = Math.abs(v) / 100 * 50;
    const pos = v >= 0;
    const gradPos = 'linear-gradient(to right, #7AE2AB, #00A970)';
    const gradNeg = 'linear-gradient(to left, #F8B4B4, #E03131)';
    barRender = (
      <div className="w-full relative" style={{ height: BAR_H }}>
        <div className="absolute inset-0 bg-muted rounded-full" />
        <div className="absolute left-1/2 -top-0.5 -bottom-0.5 w-px -ml-px bg-primary/30" />
        <div
          className="absolute top-0 rounded-full transition-[width,left] duration-240 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
          style={{
            height: BAR_H,
            left: pos ? '50%' : (50 - valPct) + '%',
            width: valPct + '%',
            background: pos ? gradPos : gradNeg,
          }}
        />
      </div>
    );
  } else {
    barRender = (
      <div className="w-full relative" style={{ height: BAR_H }}>
        <div className="absolute inset-0 bg-muted rounded-full" />
        <div
          className="absolute top-0 left-0 rounded-full transition-[width] duration-240 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
          style={{
            height: BAR_H,
            width: v + '%',
            background: 'linear-gradient(to right, #B280E0, #7401C3)',
          }}
        />
        {[25, 50, 75].map(t => (
          <div
            key={t}
            className="absolute -top-0.5 -bottom-0.5 w-px bg-primary/20"
            style={{ left: t + '%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      onClick={onToggle || undefined}
      className={cn(
        'grid gap-[14px] items-center px-3 py-[10px] rounded-lg mb-[2px] transition-colors duration-120',
        'grid-cols-[minmax(180px,240px)_minmax(140px,1fr)_minmax(54px,60px)_minmax(40px,56px)_20px]',
        isHighlight && 'bg-muted/50',
        isAL && 'bg-primary/5',
        !isHighlight && !isAL && 'hover:bg-primary/5',
        onToggle ? 'cursor-pointer' : 'cursor-default',
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {row.icon && (
          <span className="w-6 h-6 rounded-[6px] shrink-0 bg-muted inline-flex items-center justify-center">
            <Icon name={row.icon} size={12} color="#525252" />
          </span>
        )}
        {isAL && (
          <span className="w-6 h-6 rounded-[6px] shrink-0 bg-primary text-primary-foreground inline-flex items-center justify-center font-heading font-black text-[10px] tracking-[-0.02em]">
            AL
          </span>
        )}
        {isHighlight && (
          <span className="w-6 h-6 rounded-[6px] shrink-0 bg-primary/10 inline-flex items-center justify-center">
            <Icon name="users" size={12} color="#5A0992" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-[6px] flex-wrap">
            <span
              className={cn(
                'text-sm whitespace-nowrap',
                isHighlight || isAL ? 'font-bold' : 'font-medium',
                isAL ? 'text-primary' : 'text-foreground',
              )}
            >
              {row.label}
            </span>
            {row.isMax && (
              <Badge className="text-[10px] tracking-[0.06em] uppercase bg-primary/10 text-primary border-0 rounded-full px-[6px] py-[2px] h-auto whitespace-nowrap">
                Maior relev.
              </Badge>
            )}
            {row.isMin && (
              <Badge variant="outline" className="text-[10px] tracking-[0.06em] uppercase rounded-full px-[6px] py-[2px] h-auto whitespace-nowrap">
                Menor
              </Badge>
            )}
          </div>
          {row.hint && (
            <div className="text-xs text-muted-foreground">
              {row.hint}
              {row.hasCargo && <span> · clique para ver por cargo</span>}
            </div>
          )}
        </div>
      </div>

      <div>{barRender}</div>

      <div
        className="text-right font-heading font-bold text-[15px] tabular-nums tracking-[-0.01em] whitespace-nowrap"
        style={{ color: v == null ? '#AA95BE' : (isSent ? sentColor(v) : '#3C0366') }}
      >
        {fmtDimValue(dim, v)}
      </div>

      <div
        className={cn(
          'text-right text-xs tabular-nums',
          v == null ? 'text-[#AA95BE] italic' : 'text-muted-foreground',
        )}
      >
        {v == null ? 'sem quali' : (isAL ? 'direta' : (row.n_amostra ? `n=${row.n_amostra}` : ''))}
      </div>

      <div className="text-center">
        {onToggle && (
          <span
            className={cn(
              'inline-flex transition-transform duration-180',
              expanded ? 'rotate-90' : 'rotate-0',
            )}
          >
            <Icon name="chevron-right" size={14} color="#AA95BE" />
          </span>
        )}
      </div>
    </div>
  );
}

export function CargoSubRow({ cargo, dim }: { cargo: { cargo: string; cargo_label: string; sentimento: number | null; relevancia: number | null; n_amostra: number; insuficiente: boolean }; dim: string }) {
  const isSent = dim === 'sentimento';
  const v = cargo.insuficiente ? null : (isSent ? cargo.sentimento : cargo.relevancia);
  const BAR_H = 10;

  let barRender: React.ReactNode;
  if (v == null) {
    barRender = (
      <div className="w-full relative" style={{ height: BAR_H }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'repeating-linear-gradient(45deg, #F4F4F5, #F4F4F5 3px, #FAFAFA 3px, #FAFAFA 6px)',
          }}
        />
      </div>
    );
  } else if (isSent) {
    const valPct = Math.abs(v) / 100 * 50;
    const pos = v >= 0;
    barRender = (
      <div className="w-full relative" style={{ height: BAR_H }}>
        <div className="absolute inset-0 bg-muted rounded-full" />
        <div className="absolute left-1/2 -top-px -bottom-px w-px -ml-px bg-primary/30" />
        <div
          className="absolute top-0 rounded-full"
          style={{
            height: BAR_H,
            left: pos ? '50%' : (50 - valPct) + '%',
            width: valPct + '%',
            background: pos ? '#7AE2AB' : '#F8B4B4',
          }}
        />
      </div>
    );
  } else {
    barRender = (
      <div className="w-full relative" style={{ height: BAR_H }}>
        <div className="absolute inset-0 bg-muted rounded-full" />
        <div
          className="absolute top-0 left-0 rounded-full"
          style={{ height: BAR_H, width: v + '%', background: '#B280E0' }}
        />
      </div>
    );
  }

  return (
    <div
      className="hu-fade grid gap-[14px] items-center px-3 pl-10 py-[6px] rounded-lg bg-primary/5 mb-[2px] grid-cols-[minmax(180px,240px)_minmax(140px,1fr)_minmax(54px,60px)_minmax(40px,56px)_20px]"
    >
      <div className="flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
        <span className="text-xs text-muted-foreground">{cargo.cargo_label}</span>
      </div>
      <div>{barRender}</div>
      <div
        className="text-right font-heading font-bold text-sm tabular-nums"
        style={{ color: cargo.insuficiente ? '#AA95BE' : (isSent ? sentColor(cargo.sentimento) : '#5B21B6') }}
      >
        {cargo.insuficiente ? '—' : fmtDimValue(dim, v)}
      </div>
      <div
        className={cn(
          'text-right text-xs tabular-nums',
          cargo.insuficiente
            ? 'text-destructive font-semibold italic'
            : 'text-muted-foreground',
        )}
      >
        {cargo.insuficiente ? 'n<5' : `n=${cargo.n_amostra}`}
      </div>
      <div />
    </div>
  );
}
