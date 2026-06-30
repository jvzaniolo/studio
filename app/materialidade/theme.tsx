import React from 'react';
import { PageHeader } from '~/components/page-header';
import { Icon, Pill, Btn } from './icons';
import { FloatingAIButton } from './components';
import { EvolucaoBlock } from './theme-tabs-a';
import { ComentariosBlock, KPIsBlock, IniciativasBlock } from './theme-tabs-b';
import { VisaoStakeholdersBlock } from './dimensions';
import {
  THEME_BY_ID, INICIATIVAS, KPIS, SINAIS, SUGESTOES_VINCULO,
  sentColor, fmtSent,
  kpiOnTrackStats, iniciativaEmDiaStats,
  themeStatus,
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
  const kpiStats = kpiOnTrackStats(kpis);
  const iniStats = iniciativaEmDiaStats(inics);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const slug = theme.nome
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-');

  const kpiSubtitle = kpis.length === 0
    ? '0 indicadores conectados a este tema'
    : `${kpis.length} indicador${kpis.length === 1 ? '' : 'es'} conectado${kpis.length === 1 ? '' : 's'} a este tema${kpiStats.onTrack > 0 ? ` · ${kpiStats.onTrack} On Track` : ''}`;

  const iniSubtitle = inics.length === 0
    ? '0 iniciativas conectadas a este tema · 0 em dia'
    : `${inics.length} iniciativa${inics.length === 1 ? '' : 's'} conectada${inics.length === 1 ? '' : 's'} a este tema · ${iniStats.emDia} em dia`;

  return (
    <div className="hu-fade" data-screen-label={`Tema ${String(theme.id).padStart(2, '0')} · ${theme.nome}`}>

      {/* ── Sticky header bar ── */}
      <PageHeader
        title={
          <span className="flex items-center gap-1.5 text-sm font-normal">
            <span className="text-muted-foreground">Estratégia</span>
            <span className="text-muted-foreground/40">›</span>
            <span
              className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              onClick={onBack}
            >
              Matriz de Materialidade
            </span>
            <span className="text-muted-foreground/40">›</span>
            <span className="font-medium text-foreground truncate max-w-[280px]">{theme.nome}</span>
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Btn variant="primary" icon="link" onClick={() => scrollTo('sec-iniciativas')}>
              Vincular iniciativa
            </Btn>
          </div>
        }
      />

      {/* ── Theme meta section ── */}
      <div className="px-8 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">
              Tema material · {String(theme.id).padStart(2, '0')}
            </span>
            <Pill
              tone={st.tone as 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand'}
              size="md"
              className="px-2.5 py-0.5 text-xs font-semibold"
            >
              {st.label}
            </Pill>
          </div>
          <span className="text-xs text-muted-foreground font-mono">v2025 · {slug}</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">{theme.nome}</h1>
        <p className="text-sm text-muted-foreground">{theme.descricao}</p>
      </div>

      {/* ── 5-card hero strip ── */}
      <HeroV2
        theme={theme} inics={inics} kpis={kpis} sinais={sinais}
        onScrollKPIs={() => scrollTo('sec-kpis')}
        onScrollIniciativas={() => scrollTo('sec-iniciativas')}
      />

      {/* ── Sections ── */}
      <ThemeBlock id="sec-evolucao" title="Linha do tempo do sentimento" subtitle="Evolução">
        <EvolucaoBlock theme={theme} sinais={sinais} inics={inics} kpis={kpis}/>
      </ThemeBlock>

      <ThemeBlock
        id="sec-percepcao"
        title="Visão dos stakeholders sobre o tema"
        subtitle="Comparativo dos públicos consultados + leitura direta da Alta Liderança."
      >
        <VisaoStakeholdersBlock theme={theme}/>
      </ThemeBlock>

      <ThemeBlock
        id="sec-comentarios"
        title="Comentários dos stakeholders sobre o tema"
        subtitle="Seleção dos comentários mais relevantes consolidados pela IA."
        action={
          <button className="inline-flex items-center gap-1.5 bg-transparent border-0 cursor-pointer p-0 text-primary text-sm font-semibold">
            <Icon name="download" size={13} color="var(--primary)"/>
            Exportar comentários (Excel)
          </button>
        }
      >
        <ComentariosBlock theme={theme}/>
      </ThemeBlock>

      <ThemeBlock
        id="sec-kpis"
        title="KPIs vinculados"
        subtitle={kpiSubtitle}
        action={
          <button className="inline-flex items-center gap-1.5 bg-transparent border-0 cursor-pointer p-0 text-primary text-sm font-semibold">
            <Icon name="link" size={13} color="var(--primary)"/>
            Vincular KPI
          </button>
        }
      >
        <KPIsBlock theme={theme} kpis={kpis} sugestoes={sugestoes}/>
      </ThemeBlock>

      <ThemeBlock
        id="sec-iniciativas"
        title="Iniciativas vinculadas"
        subtitle={iniSubtitle}
        action={
          <button className="inline-flex items-center gap-1.5 bg-transparent border-0 cursor-pointer p-0 text-primary text-sm font-semibold">
            <Icon name="link" size={13} color="var(--primary)"/>
            Vincular Iniciativa
          </button>
        }
      >
        <IniciativasBlock theme={theme} inics={inics} sugestoes={sugestoes}/>
      </ThemeBlock>

      <div className="pb-8"/>

      <FloatingAIButton themeName={theme.nome}/>
    </div>
  );
}

/* ===========================================================
   ThemeBlock — section wrapper (simplified)
   =========================================================== */

function ThemeBlock({
  id,
  title,
  subtitle,
  children,
  action,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section id={id} className="px-8 pt-3 pb-0">
      <Card>
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-border/50">
          <div>
            <h2 className="text-[15px] font-bold text-foreground tracking-tight leading-snug">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0 mt-1">{action}</div>}
        </div>
        <div className="overflow-hidden rounded-b-xl">{children}</div>
      </Card>
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

  const sentNumColor = sentTone === 'danger' ? 'text-destructive' : sentTone === 'warning' ? 'text-amber-500' : sentTone === 'success' ? 'text-green-600' : 'text-foreground';

  return (
    <div className="px-8 pb-1 pt-4">
      <div className="mat-hero5-grid grid grid-cols-5 gap-3 mb-[18px]">
        <HeroCard
          eyebrow="Relevância"
          sublabel="Alta Liderança"
          number={`${theme.x}%`}
          comparativo={<span className="italic">Consulta direta · eixo X</span>}
        />

        <HeroCard
          eyebrow="Relevância"
          sublabel="Stakeholders"
          number={`${theme.y}%`}
          comparativo={<DeltaInline value={deltaY} label="vs Matriz 2024"/>}
        />

        <HeroCard
          eyebrow="Sentimento"
          number={
            <span className={sentNumColor}>{fmtSent(theme.sentimento)}</span>
          }
          comparativo={
            trendDelta != null ? (
              <span className="inline-flex items-center gap-1">
                <span className={trendDelta < 0 ? 'text-destructive' : 'text-green-600'}>
                  {trendDelta < 0 ? '↓' : '↑'} {Math.abs(trendDelta)}pp
                </span>
                <span>em {trendSpan}</span>
              </span>
            ) : 'Sem evolução medida'
          }
        />

        <HeroCard
          eyebrow="KPIs"
          sublabel="On track"
          number={
            <span>
              {kpiStats.withMeta === 0 ? '—' : kpiStats.onTrack}
              {kpiStats.withMeta > 0 && (
                <span className="text-[18px] font-semibold text-muted-foreground">/{kpiStats.withMeta}</span>
              )}
            </span>
          }
          comparativo={kpis.length === 0 ? 'sem mensuração' : `${kpis.length} indicador${kpis.length === 1 ? '' : 'es'} vinculado${kpis.length === 1 ? '' : 's'}`}
          onClick={onScrollKPIs}
        />

        <HeroCard
          eyebrow="Iniciativas"
          sublabel="Em dia"
          number={
            <span>
              {inics.length === 0 ? '—' : iniStats.emDia}
              {inics.length > 0 && (
                <span className="text-[18px] font-semibold text-muted-foreground">/{iniStats.total}</span>
              )}
            </span>
          }
          comparativo={inics.length === 0 ? '0 iniciativas vinculadas' : `${inics.length} iniciativa${inics.length === 1 ? '' : 's'} vinculada${inics.length === 1 ? '' : 's'}`}
          onClick={onScrollIniciativas}
        />
      </div>

      <style>{`
        @media (max-width: 800px) { .mat-hero5-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; } }
        @media (max-width: 520px) { .mat-hero5-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
        @media (max-width: 340px) { .mat-hero5-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

/* ===========================================================
   HeroCard
   =========================================================== */

function HeroCard({
  eyebrow,
  sublabel,
  number,
  comparativo,
  onClick,
}: {
  eyebrow: string;
  sublabel?: string;
  number: React.ReactNode;
  comparativo?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'flex flex-col transition-shadow duration-[180ms]',
        onClick ? 'cursor-pointer hover:shadow-md' : 'cursor-default',
      )}
    >
      <CardContent className="flex flex-col p-[12px_14px]">
        <div className="h-[30px]">
          <div className="text-[11px] text-muted-foreground font-medium leading-tight">{eyebrow}</div>
          <div className="text-[11px] font-medium text-muted-foreground leading-tight min-h-[14px]">
            {sublabel ?? ''}
          </div>
        </div>
        <div className="font-display font-bold text-[22px] leading-none tracking-[-0.02em] tabular-nums text-foreground mt-1.5 mb-2">
          {number}
        </div>
        <div className="text-[11px] text-muted-foreground leading-tight min-h-[14px]">
          {comparativo ?? ''}
        </div>
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
