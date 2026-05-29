import React from 'react';
import { Icon, Pill, Btn } from './icons';
import { PageHeader, FloatingAIButton } from './components';
import { EvolucaoBlock, PercepcaoBlock } from './theme-tabs-a';
import { ComentariosBlock, KPIsBlock, IniciativasBlock, ApendiceBlock } from './theme-tabs-b';
import { VisaoStakeholdersBlock } from './dimensions';
import {
  THEME_BY_ID, INICIATIVAS, KPIS, SINAIS, SUGESTOES_VINCULO,
  sentColor, fmtSent,
  kpiOnTrackStats, iniciativaEmDiaStats,
  themeStatus, quadrant,
  type Theme, type KPI, type Iniciativa, type Sinal,
} from './data';
import { Card, CardContent } from '~/components/ui/card';
import { cn } from '~/lib/utils';

/* ===========================================================
   ThemeDetail
   =========================================================== */

export function ThemeDetail({
  themeId,
  onPickTheme,
  onBack,
}: {
  themeId: number;
  onPickTheme: (id: number) => void;
  onBack: () => void;
}) {
  const theme = THEME_BY_ID[themeId];

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [themeId]);

  if (!theme) return null;

  const inics  = INICIATIVAS.filter(i => i.tema_id === theme.id);
  const kpis   = KPIS.filter(k => k.tema_id === theme.id);
  const sinais = (SINAIS[theme.id] || []).slice().sort((a, b) => a.data.localeCompare(b.data));
  const sugestoes = SUGESTOES_VINCULO[theme.id] || [];

  const st = themeStatus(theme, theme.x, theme.y, theme.sentimento);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="hu-fade" data-screen-label={`Tema ${String(theme.id).padStart(2, '0')} · ${theme.nome}`}>
      <PageHeader
        eyebrow={`Tema material · ${String(theme.id).padStart(2, '0')}`}
        title={theme.nome}
        titlePill={
          <Pill tone={st.tone as 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand'} size="md" className="px-3 py-1 text-[13px] font-semibold">{st.label}</Pill>
        }
        subtitle={theme.descricao}
        breadcrumbs={[
          { label: 'Materialidade', onClick: onBack },
          { label: 'Matriz · 2025', onClick: onBack },
          { label: `Tema ${String(theme.id).padStart(2, '0')}` },
        ]}
        actions={
          <>
            <Btn variant="ghost" icon="settings" className="text-foreground/80">Configurar dados</Btn>
            <Btn variant="secondary" icon="edit">Editar tema</Btn>
            <Btn variant="primary" icon="link" onClick={() => scrollTo('sec-iniciativas')}>
              Vincular iniciativa
            </Btn>
          </>
        }
      />

      <HeroV2
        theme={theme} inics={inics} kpis={kpis} sinais={sinais}
        onScrollKPIs={() => scrollTo('sec-kpis')}
        onScrollIniciativas={() => scrollTo('sec-iniciativas')}
      />

      <ThemeBlock id="sec-evolucao" eyebrow="Evolução" title="Linha do tempo">
        <EvolucaoBlock theme={theme} sinais={sinais} inics={inics} kpis={kpis}/>
      </ThemeBlock>

      <ThemeBlock id="sec-percepcao" eyebrow="Percepção" title="Visão dos stakeholders sobre o tema">
        <VisaoStakeholdersBlock theme={theme}/>
      </ThemeBlock>

      <ThemeBlock id="sec-comentarios" eyebrow="Qualitativo" title="Comentários dos stakeholders sobre o tema">
        <ComentariosBlock theme={theme}/>
      </ThemeBlock>

      <ThemeBlock id="sec-kpis" eyebrow="Mensuração" title="KPIs vinculados" tone="brand">
        <KPIsBlock theme={theme} kpis={kpis} sugestoes={sugestoes}/>
      </ThemeBlock>

      <ThemeBlock id="sec-iniciativas" eyebrow="Ação" title="Iniciativas vinculadas" tone="brand">
        <IniciativasBlock theme={theme} inics={inics} sugestoes={sugestoes}/>
      </ThemeBlock>

      <ApendiceBlock theme={theme}/>

      <FloatingAIButton themeName={theme.nome}/>
    </div>
  );
}

/* ===========================================================
   ThemeBlock — section wrapper
   =========================================================== */

function ThemeBlock({
  id,
  eyebrow,
  title,
  children,
  tone,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  tone?: string;
}) {
  const isAction = tone === 'brand';
  return (
    <section id={id} className="px-8 pt-6 pb-2">
      <div className={cn(
        'flex items-center gap-[14px] mb-[18px] pb-[14px]',
        isAction ? 'border-b-2 border-primary/20' : 'border-b border-border',
      )}>
        <span className={cn(
          'w-1 h-8 rounded-sm flex-shrink-0',
          isAction ? 'bg-primary' : 'bg-primary/80',
        )}/>
        <div>
          <div className={cn(
            'text-[11px] font-bold tracking-[0.12em] uppercase mb-0.5',
            isAction ? 'text-primary' : 'text-muted-foreground',
          )}>{eyebrow}</div>
          <h2 className="font-display font-bold text-[22px] text-foreground tracking-[-0.01em] leading-[1.2]">
            {title}
          </h2>
        </div>
      </div>
      <div className="mb-8">{children}</div>
    </section>
  );
}

/* ===========================================================
   HeroV2 — 5-card summary strip
   =========================================================== */

function HeroV2({
  theme,
  inics,
  kpis,
  sinais,
  onScrollKPIs,
  onScrollIniciativas,
}: {
  theme: Theme;
  inics: Iniciativa[];
  kpis: KPI[];
  sinais: Sinal[];
  onScrollKPIs: () => void;
  onScrollIniciativas: () => void;
}) {
  let trendDelta: number | null = null;
  let trendSpan:  string | null = null;
  if (sinais.length >= 2) {
    trendDelta = sinais[sinais.length - 1].sentimento - sinais[0].sentimento;
    const diff = monthDiff(sinais[0].data, sinais[sinais.length - 1].data);
    trendSpan  = `${diff} ${diff === 1 ? 'mês' : 'meses'}`;
  }

  const deltaY = theme.y - theme.baseline.y;

  const sentTone =
    theme.sentimento != null && theme.sentimento < -20 ? 'danger'
    : theme.sentimento != null && theme.sentimento < 0  ? 'warning'
    : theme.sentimento != null && theme.sentimento >= 15 ? 'success'
    : 'neutral';

  const kpiStats = kpiOnTrackStats(kpis);
  const iniStats = iniciativaEmDiaStats(inics);

  return (
    <div className="px-8 pb-1">
      <div className="mat-hero5-grid grid grid-cols-5 gap-3 mb-[18px]">
        <HeroCard
          eyebrow="Relevância"
          sublabel="Alta Liderança"
          icon="compass"
          tone="brand"
          number={`${theme.x}%`}
          comparativo={
            <span className="text-muted-foreground italic">consulta direta · Eixo X</span>
          }
        />

        <HeroCard
          eyebrow="Relevância"
          sublabel="Stakeholders"
          icon="users"
          tone="brand"
          number={`${theme.y}%`}
          comparativo={<DeltaInline value={deltaY} label="vs Matriz 2024"/>}
        />

        <HeroCard
          eyebrow="Sentimento"
          icon="thermometer"
          tone={sentTone}
          number={
            <div className="flex items-center gap-[10px]">
              <MiniGauge value={theme.sentimento} size={42}/>
              <span
                className="font-display font-bold text-[26px] tracking-[-0.02em] tabular-nums leading-none"
                style={{ color: sentColor(theme.sentimento) }}
              >{fmtSent(theme.sentimento)}</span>
            </div>
          }
          comparativo={
            trendDelta != null ? (
              <span className="inline-flex items-center gap-1.5">
                <span className={cn('font-bold', trendDelta < 0 ? 'text-destructive' : 'text-green-600')}>
                  {trendDelta < 0 ? '↓' : '↑'} {Math.abs(trendDelta)}pp
                </span>
                <span className="text-muted-foreground">em {trendSpan}</span>
              </span>
            ) : <span className="text-muted-foreground">Sem evolução medida</span>
          }
        />

        <HeroCard
          eyebrow="KPIs"
          sublabel="On Track"
          icon="bar-chart"
          tone={kpiStats.tone}
          number={
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-[30px] leading-none text-foreground tracking-[-0.02em] tabular-nums">
                {kpiStats.withMeta === 0 ? '—' : kpiStats.onTrack}
              </span>
              {kpiStats.withMeta > 0 && (
                <span className="font-display font-semibold text-base text-muted-foreground tabular-nums">
                  / {kpiStats.withMeta}
                </span>
              )}
            </div>
          }
          comparativo={
            <span className="inline-flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground">
                {kpis.length === 0 ? 'sem mensuração'
                  : `de ${kpis.length} indicador${kpis.length === 1 ? '' : 'es'}`}
              </span>
              {kpiStats.semMeta > 0 && (
                <span className="text-amber-600 font-semibold">
                  · {kpiStats.semMeta} sem meta
                </span>
              )}
            </span>
          }
          onClick={onScrollKPIs}
        />

        <HeroCard
          eyebrow="Iniciativas"
          sublabel="Em dia"
          icon="flag"
          tone={iniStats.tone}
          number={
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-[30px] leading-none text-foreground tracking-[-0.02em] tabular-nums">
                {inics.length === 0 ? '—' : iniStats.emDia}
              </span>
              {inics.length > 0 && (
                <span className="font-display font-semibold text-base text-muted-foreground tabular-nums">
                  / {iniStats.total}
                </span>
              )}
            </div>
          }
          comparativo={
            <span className="inline-flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground">
                {inics.length === 0 ? 'sem ação operacional'
                  : `de ${inics.length} iniciativa${inics.length === 1 ? '' : 's'}`}
              </span>
              {iniStats.atrasadas > 0 && (
                <span className="text-destructive font-semibold">
                  · {iniStats.atrasadas} atrasada{iniStats.atrasadas === 1 ? '' : 's'}
                </span>
              )}
            </span>
          }
          onClick={onScrollIniciativas}
        />
      </div>

      <style>{`
        @media (max-width: 1380px) { .mat-hero5-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; } }
        @media (max-width: 900px)  { .mat-hero5-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
        @media (max-width: 560px)  { .mat-hero5-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

/* ===========================================================
   HeroCard
   =========================================================== */

const toneDotClass: Record<string, string> = {
  success: 'bg-green-600 shadow-[0_0_0_3px_rgba(0,169,112,0.13)]',
  warning: 'bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.13)]',
  danger:  'bg-destructive shadow-[0_0_0_3px_rgba(224,49,49,0.13)]',
  brand:   'bg-primary shadow-[0_0_0_3px_rgba(116,1,195,0.13)]',
  neutral: '',
};

function HeroCard({
  eyebrow,
  sublabel,
  icon,
  tone,
  number,
  comparativo,
  onClick,
}: {
  eyebrow: string;
  sublabel?: string;
  icon: string;
  tone: string;
  number: React.ReactNode;
  comparativo?: React.ReactNode;
  onClick?: () => void;
}) {
  const dot = tone !== 'neutral' ? toneDotClass[tone] ?? null : null;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'relative flex flex-col min-h-[130px] transition-transform duration-[180ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]',
        onClick ? 'cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(60,3,102,0.08)]' : 'cursor-default',
      )}
    >
      <CardContent className="flex flex-col flex-1 p-[16px_18px_14px]">
        <div className="mb-[10px] flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium tracking-[0.04em] uppercase text-muted-foreground">
              {eyebrow}
            </div>
            {sublabel && (
              <div className="text-[12.5px] font-semibold text-foreground/80 mt-0.5">
                {sublabel}
              </div>
            )}
          </div>
          {dot && tone !== 'brand' && (
            <span
              title="Estado agregado"
              className={cn('w-[9px] h-[9px] rounded-full flex-shrink-0 mt-1.5', dot)}
            />
          )}
        </div>
        <div className="flex-1 flex items-center">
          {typeof number === 'string' ? (
            <div className="font-display font-bold text-[30px] leading-none text-foreground tracking-[-0.02em] tabular-nums">
              {number}
            </div>
          ) : number}
        </div>
        {comparativo && (
          <div className="mt-3 pt-[10px] border-t border-border/60 text-[11.5px] text-muted-foreground flex items-center justify-between gap-1.5">
            <span>{comparativo}</span>
            {onClick && <Icon name="chevron-right" size={12} color="#AA95BE"/>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DeltaInline({ value, label }: { value: number | null; label: string }) {
  if (value == null) return <span className="text-muted-foreground">{label}</span>;
  const arrow = value > 0 ? '↑' : value < 0 ? '↓' : '·';
  return (
    <span className="inline-flex items-center gap-[5px]">
      <span className={cn('font-bold tabular-nums', value > 0 ? 'text-green-600' : value < 0 ? 'text-destructive' : 'text-muted-foreground')}>
        {arrow} {Math.abs(value)}pp
      </span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

export function MiniGauge({ value, size = 48 }: { value: number | null; size?: number }) {
  const W = size, H = size * 0.62;
  const cx = W / 2, cy = H * 0.95;
  const r = size * 0.4, sw = size * 0.13;
  const v = value == null ? 0 : Math.max(-100, Math.min(100, value));
  const angle = Math.PI * (1 - (v + 100) / 200);
  const arcX1 = cx - r, arcY1 = cy;
  const arcX2 = cx + r, arcY2 = cy;
  const nx = cx + Math.cos(angle) * (r - sw * 0.4);
  const ny = cy - Math.sin(angle) * (r - sw * 0.4);
  const gradId = `mg-${size}`;

  return (
    <svg width={W} height={H + 2} style={{ display: 'block', flexShrink: 0 }}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#E03131"/>
          <stop offset="38%"  stopColor="#F59E0B"/>
          <stop offset="62%"  stopColor="#A8D85E"/>
          <stop offset="100%" stopColor="#00A970"/>
        </linearGradient>
      </defs>
      <path
        d={`M ${arcX1} ${arcY1} A ${r} ${r} 0 0 1 ${arcX2} ${arcY2}`}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      {value != null && (
        <g>
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#0A0A0A" strokeWidth={2} strokeLinecap="round"/>
          <circle cx={cx} cy={cy} r={3} fill="#0A0A0A"/>
        </g>
      )}
    </svg>
  );
}

function monthDiff(a: string, b: string): number {
  const pa = a.length === 7 ? a + '-01' : a;
  const pb = b.length === 7 ? b + '-01' : b;
  const da = new Date(pa);
  const db = new Date(pb);
  return (db.getUTCFullYear() - da.getUTCFullYear()) * 12 + (db.getUTCMonth() - da.getUTCMonth());
}
