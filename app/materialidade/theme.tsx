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
          <Pill tone={st.tone as 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand'} size="md" style={{
            padding: '4px 12px', fontSize: 13, fontWeight: 600,
          }}>{st.label}</Pill>
        }
        subtitle={theme.descricao}
        breadcrumbs={[
          { label: 'Materialidade', onClick: onBack },
          { label: 'Matriz · 2025', onClick: onBack },
          { label: `Tema ${String(theme.id).padStart(2, '0')}` },
        ]}
        actions={
          <>
            <Btn variant="ghost" icon="settings" style={{ color: '#525252' }}>Configurar dados</Btn>
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
    <section id={id} style={{ padding: '24px 32px 8px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        marginBottom: 18, paddingBottom: 14,
        borderBottom: isAction ? '2px solid #E8D9F2' : '1px solid var(--hu-border)',
      }}>
        <span style={{
          width: 4, height: 32, borderRadius: 2,
          background: isAction ? '#7401C3' : '#AA95BE', flexShrink: 0,
        }}/>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: isAction ? 'var(--hu-purple)' : 'var(--hu-muted)',
            marginBottom: 2,
          }}>{eyebrow}</div>
          <h2 style={{
            fontFamily: 'var(--hu-font-display)', fontWeight: 700, fontSize: 22,
            color: 'var(--hu-text)', letterSpacing: '-0.01em', lineHeight: 1.2,
          }}>{title}</h2>
        </div>
      </div>
      <div style={{ marginBottom: 32 }}>{children}</div>
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
    <div style={{ padding: '0 32px 4px' }}>
      <div
        className="mat-hero5-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: 12,
          marginBottom: 18,
        }}>
        <HeroCard
          eyebrow="Relevância"
          sublabel="Alta Liderança"
          icon="compass"
          tone="brand"
          number={`${theme.x}%`}
          comparativo={
            <span style={{ color: 'var(--hu-muted)', fontStyle: 'italic' }}>consulta direta · Eixo X</span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MiniGauge value={theme.sentimento} size={42}/>
              <span style={{
                fontFamily: 'var(--hu-font-display)', fontWeight: 700, fontSize: 26,
                color: sentColor(theme.sentimento),
                letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
              }}>{fmtSent(theme.sentimento)}</span>
            </div>
          }
          comparativo={
            trendDelta != null ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: trendDelta < 0 ? '#C81E1E' : '#009966', fontWeight: 700 }}>
                  {trendDelta < 0 ? '↓' : '↑'} {Math.abs(trendDelta)}pp
                </span>
                <span style={{ color: 'var(--hu-muted)' }}>em {trendSpan}</span>
              </span>
            ) : <span style={{ color: 'var(--hu-muted)' }}>Sem evolução medida</span>
          }
        />

        <HeroCard
          eyebrow="KPIs"
          sublabel="On Track"
          icon="bar-chart"
          tone={kpiStats.tone}
          number={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{
                fontFamily: 'var(--hu-font-display)', fontWeight: 700,
                fontSize: 30, lineHeight: 1, color: '#0A0A0A',
                letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
              }}>{kpiStats.withMeta === 0 ? '—' : kpiStats.onTrack}</span>
              {kpiStats.withMeta > 0 && (
                <span style={{
                  fontFamily: 'var(--hu-font-display)', fontWeight: 600,
                  fontSize: 16, color: '#737373', fontVariantNumeric: 'tabular-nums',
                }}>/ {kpiStats.withMeta}</span>
              )}
            </div>
          }
          comparativo={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--hu-muted)' }}>
                {kpis.length === 0 ? 'sem mensuração'
                  : `de ${kpis.length} indicador${kpis.length === 1 ? '' : 'es'}`}
              </span>
              {kpiStats.semMeta > 0 && (
                <span style={{ color: '#B45309', fontWeight: 600 }}>
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
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{
                fontFamily: 'var(--hu-font-display)', fontWeight: 700,
                fontSize: 30, lineHeight: 1, color: '#0A0A0A',
                letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
              }}>{inics.length === 0 ? '—' : iniStats.emDia}</span>
              {inics.length > 0 && (
                <span style={{
                  fontFamily: 'var(--hu-font-display)', fontWeight: 600,
                  fontSize: 16, color: '#737373', fontVariantNumeric: 'tabular-nums',
                }}>/ {iniStats.total}</span>
              )}
            </div>
          }
          comparativo={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--hu-muted)' }}>
                {inics.length === 0 ? 'sem ação operacional'
                  : `de ${inics.length} iniciativa${inics.length === 1 ? '' : 's'}`}
              </span>
              {iniStats.atrasadas > 0 && (
                <span style={{ color: '#C81E1E', fontWeight: 600 }}>
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
  const [hov, setHov] = React.useState(false);
  const toneDot: Record<string, string | null> = {
    success: '#00A970',
    warning: '#F59E0B',
    danger:  '#E03131',
    brand:   '#7401C3',
    neutral: null,
  };
  const dot = toneDot[tone] ?? null;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onClick && setHov(true)}
      onMouseLeave={() => onClick && setHov(false)}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: 12,
        padding: '16px 18px 14px', minHeight: 130,
        display: 'flex', flexDirection: 'column',
        position: 'relative', cursor: onClick ? 'pointer' : 'default',
        boxShadow: hov && onClick ? '0 4px 12px rgba(60,3,102,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
        transition: 'transform 180ms cubic-bezier(0.22,0.61,0.36,1), box-shadow 180ms',
        transform: onClick && hov ? 'translateY(-1px)' : 'translateY(0)',
      }}>
      <div style={{
        marginBottom: 10, display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 11, fontWeight: 500, letterSpacing: '0.04em',
            textTransform: 'uppercase', color: '#737373',
          }}>{eyebrow}</div>
          {sublabel && (
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#525252', marginTop: 2 }}>
              {sublabel}
            </div>
          )}
        </div>
        {dot && tone !== 'brand' && (
          <span title="Estado agregado" style={{
            width: 9, height: 9, borderRadius: 999, background: dot,
            boxShadow: `0 0 0 3px ${dot}22`,
            flexShrink: 0, marginTop: 6,
          }}/>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {typeof number === 'string' ? (
          <div style={{
            fontFamily: 'var(--hu-font-display)', fontWeight: 700,
            fontSize: 30, lineHeight: 1, color: '#0A0A0A',
            letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
          }}>{number}</div>
        ) : number}
      </div>
      {comparativo && (
        <div style={{
          marginTop: 12, paddingTop: 10, borderTop: '1px solid #F0F0F0',
          fontSize: 11.5, color: 'var(--hu-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
        }}>
          <span>{comparativo}</span>
          {onClick && <Icon name="chevron-right" size={12} color="#AA95BE"/>}
        </div>
      )}
    </div>
  );
}

function DeltaInline({ value, label }: { value: number | null; label: string }) {
  if (value == null) return <span style={{ color: 'var(--hu-muted)' }}>{label}</span>;
  const c = value > 0 ? '#009966' : value < 0 ? '#C81E1E' : '#737373';
  const a = value > 0 ? '↑' : value < 0 ? '↓' : '·';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ fontWeight: 700, color: c, fontVariantNumeric: 'tabular-nums' }}>
        {a} {Math.abs(value)}pp
      </span>
      <span style={{ color: 'var(--hu-muted)' }}>{label}</span>
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
