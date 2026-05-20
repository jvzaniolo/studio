import React from 'react';
import { Icon, Pill, StatusDot, Btn } from './icons';
import { Card, SectionTitle, EmptyState } from './components';
import { AIFlat } from './components';
import { DimensionRadio, DIM_BY_ID } from './dimensions';
import {
  PUBLICOS, PUBLICO_BY_ID, getDimValue, sentColor, fmtSent, fmtShortMonth,
  FONTES, type Theme, type Sinal,
} from './data';

/* ============================================================
   EVOLUÇÃO DO SENTIMENTO
   ============================================================ */

const PUB_FILTERS = [
  { id: 'all',          label: 'Todos os públicos' },
  { id: 'lideranca',    label: 'Alta Liderança · Eixo X' },
  { id: 'interno',      label: 'Público interno' },
  { id: 'clientes',     label: 'Clientes' },
  { id: 'fornecedores', label: 'Fornecedores' },
  { id: 'sociedade',    label: 'Sociedade' },
  { id: 'especialistas',label: 'Especialistas' },
];

const FONTE_PUBLICO: Record<string, string> = {
  pesquisa_clima: 'interno',
  nps_clientes: 'clientes',
  ouvidoria: 'interno',
  pesquisa_fornecedores: 'fornecedores',
  pulse_comunidades: 'sociedade',
};

const AI_DEFAULTS: Record<number, { diagnostico: string; estado: string; prioridades: string }> = {
  4: {
    diagnostico: 'Tema crítico — alta relevância para liderança (91%) e stakeholders (69%), com sentimento muito negativo (−27) e em deterioração consistente. Falta de critérios claros de promoção é o ponto mais citado em todos os públicos internos.',
    estado: 'Sentimento caiu 8pp em 4 meses (de −23 para −31 na Pesquisa de Clima). Auxiliares de Obra concentram o maior gap, com amostra insuficiente para drill granular.',
    prioridades: '1. Vincular iniciativa "Programa de Reconhecimento Contínuo" (sugerida pela IA, 89% similaridade)\n2. Entregar primeira versão da matriz de competências em Set/2026\n3. Comunicar critérios de promoção transparentes em Jul/2026',
  },
  11: {
    diagnostico: 'Tema crítico com o pior sentimento da matriz (−47). Fornecedores avaliam −86, indicando ruído estrutural no relacionamento com a cadeia.',
    estado: 'Redesenho da cadeia de aprovações aprovado pela diretoria, mas sem prazo definido — bloqueio operacional ativo. Pagamentos atrasam por aprovação multi-área.',
    prioridades: '1. Mapear fluxo de aprovações de medição em Mai/2026\n2. Definir piloto em 2 obras até Ago/2026\n3. Renegociar SLA de pagamento com fornecedores estratégicos',
  },
  1: {
    diagnostico: 'Tema de altíssima relevância (97% para liderança), sentimento moderadamente negativo (−15) e em deterioração lenta.',
    estado: 'Citações apontam infra de campo precária — internet ruim, equipamentos antigos — mesmo com os investimentos recentes em digitalização.',
    prioridades: '1. Antecipar Renovação da rede de campo para Q3/2026\n2. Avaliar terceirização do suporte de campo nas 12 obras maiores\n3. Comunicar roadmap de digitalização ao canteiro',
  },
  20: {
    diagnostico: 'Risco regulatório crescente — tema linkado ao módulo IFRS S2. Empresa ainda não tem inventário GEE formal.',
    estado: 'Sentimento em −22 com tendência estável. Janela de conformidade aperta em 2027.',
    prioridades: '1. Contratar consultoria para inventário Escopo 1+2 até Out/2026\n2. Definir trajetória de redução até Dez/2026\n3. Integrar ao módulo IFRS S2 — Matriz de Riscos',
  },
  18: {
    diagnostico: 'Risco climático físico já materializado em 3 obras no último biênio. Tema linkado à Matriz de Riscos IFRS S2.',
    estado: 'Pontos de mitigação demandados pelos especialistas externos. Mapeamento de riscos em andamento (30%).',
    prioridades: '1. Adotar protocolo de avaliação climática nos estudos de viabilidade (Jul/2026)\n2. Mapear obras em zonas de risco hídrico\n3. Atualizar Matriz de Riscos IFRS S2',
  },
};

function getAIDefaults(theme: Theme, dim = 'sentimento') {
  if (dim !== 'sentimento') {
    return {
      diagnostico: `Relevância de ${theme.y}% para stakeholders e ${theme.x}% para a Alta Liderança.`,
      estado: 'Edite os campos para registrar a leitura focada em relevância para stakeholders e para o negócio.',
      prioridades: '1. Aprofundar leitura por público\n2. Cruzar com benchmark setorial\n3. Reapurar no próximo ciclo',
    };
  }
  if (AI_DEFAULTS[theme.id]) return AI_DEFAULTS[theme.id];
  return {
    diagnostico: `Tema com relevância ${theme.x}% para liderança e ${theme.y}% para stakeholders. Sentimento agregado em ${fmtSent(theme.sentimento)}.`,
    estado: 'Sem narrativa específica definida. Edite os campos para registrar o diagnóstico atual do tema.',
    prioridades: '1. Revisar vínculo com iniciativas e KPIs\n2. Definir owner do tema para próximo ciclo\n3. Aumentar cobertura de sinais operacionais',
  };
}

interface EvolucaoBlockProps {
  theme: Theme;
  sinais: Sinal[];
  inics?: unknown[];
  kpis?: unknown[];
}

export function EvolucaoBlock({ theme, sinais }: EvolucaoBlockProps) {
  const [pubFilter, setPubFilter] = React.useState('all');
  const [dim, setDim] = React.useState('sentimento');
  const isSent = dim === 'sentimento';

  const filteredSinais = pubFilter === 'all' || pubFilter === 'lideranca'
    ? sinais
    : sinais.filter(s => FONTE_PUBLICO[s.fonte] === pubFilter);

  const matrixValue = (versionKey: string): number | null => {
    if (dim === 'sentimento') {
      if (pubFilter === 'all' || pubFilter === 'lideranca') {
        return versionKey === '2024' ? theme.baseline.sentimento : theme.sentimento;
      }
      const pp = theme.por_publico.find(p => p.publico === pubFilter);
      if (!pp || pp.sentimento == null) return null;
      if (versionKey === '2024') {
        const shift = theme.sentimento != null ? ((theme.baseline.sentimento ?? 0) - theme.sentimento) : 0;
        return Math.max(-100, Math.min(100, pp.sentimento + shift));
      }
      return pp.sentimento;
    }
    if (pubFilter === 'lideranca') {
      return versionKey === '2024' ? theme.baseline.x : theme.x;
    }
    if (pubFilter === 'all') {
      return versionKey === '2024' ? theme.baseline.y : theme.y;
    }
    const pp = theme.por_publico.find(p => p.publico === pubFilter);
    if (!pp) return null;
    const drift = theme.y - theme.baseline.y;
    return versionKey === '2024' ? Math.max(35, Math.min(100, pp.relevancia - drift)) : pp.relevancia;
  };

  const points: { kind: string; data: string; value: number; label?: string; fonte?: string; n?: number }[] = [];
  const vBaseline = matrixValue('2024');
  const vCurrent  = matrixValue('2025');
  if (vBaseline != null) points.push({ kind: 'matrix', data: '2025-04-22', value: vBaseline, label: 'Matriz 2024' });
  if (isSent) {
    filteredSinais.forEach(s => points.push({
      kind: 'signal', data: s.data + '-15', value: s.sentimento,
      fonte: s.fonte, n: s.n_mencoes,
    }));
  }
  if (vCurrent != null) points.push({ kind: 'matrix', data: '2026-04-08', value: vCurrent, label: 'Matriz 2025' });
  points.sort((a, b) => a.data.localeCompare(b.data));

  const range = DIM_BY_ID[dim].range as [number, number];
  const blockTitle = isSent ? 'Linha do tempo do sentimento' : 'Evolução da relevância';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: 'var(--hu-muted)',
          }}>Filtrar por público</span>
          <PubFilterDropdown value={pubFilter} onChange={setPubFilter}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: 'var(--hu-muted)',
          }}>Dimensão</span>
          <DimensionRadio value={dim} onChange={setDim}/>
        </div>
        {pubFilter !== 'all' && (
          <span style={{ fontSize: 11.5, color: '#5A0992' }}>
            Recorte: <b>{PUB_FILTERS.find(f => f.id === pubFilter)?.label}</b>
          </span>
        )}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div className="mat-evolucao-grid" style={{
          display: 'grid',
          gridTemplateColumns: '320px minmax(0, 1fr)',
          gap: 0,
        }}>
          <AIAnalysePanel theme={theme} dim={dim}/>
          <div style={{
            padding: '20px 24px 22px',
            borderLeft: '1px solid var(--hu-border)',
            display: 'flex', flexDirection: 'column', gap: 12,
            minWidth: 0,
          }}>
            <SectionTitle eyebrow="Evolução"
              action={
                <span style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'var(--hu-muted)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: '#7401C3' }}/>
                    Matriz
                  </span>
                  {isSent && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: '#F59E0B' }}/>
                      Sinal operacional
                    </span>
                  )}
                </span>
              }>
              {blockTitle}
            </SectionTitle>
            {points.length < 2 ? (
              <EmptyState icon="zap"
                title="Sem dados suficientes para este recorte"
                subtitle="Ajuste o filtro de público ou a dimensão para ver outra leitura."/>
            ) : (
              <TimelineSVG points={points} range={range} dim={dim}/>
            )}
          </div>
        </div>
      </Card>

      <style>{`
        @media (max-width: 1080px) {
          .mat-evolucao-grid { grid-template-columns: minmax(0, 1fr) !important; }
          .mat-evolucao-grid > div:nth-child(2) { border-left: 0 !important; border-top: 1px solid var(--hu-border); }
        }
      `}</style>
    </div>
  );
}

/* ---------- AI Analysis Panel (editable) ---------- */
interface AIAnalysePanelProps {
  theme: Theme;
  dim?: string;
}

function AIAnalysePanel({ theme, dim = 'sentimento' }: AIAnalysePanelProps) {
  const defaults = getAIDefaults(theme, dim);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(defaults);
  const [values, setValues] = React.useState(defaults);

  React.useEffect(() => {
    const d = getAIDefaults(theme, dim);
    setValues(d);
    setDraft(d);
    setEditing(false);
  }, [theme.id, dim]);

  const save = () => { setValues(draft); setEditing(false); };
  const discard = () => { setDraft(values); setEditing(false); };
  const regen = () => { setDraft(getAIDefaults(theme, dim)); };

  const TextLinkButton = ({ icon, color, onClick, children }: { icon?: string; color: string; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: 'transparent', border: 0, cursor: 'pointer', padding: 0,
      color: color, fontSize: 12.5, fontWeight: 600,
    }}>
      {icon && <Icon name={icon} size={12} color={color}/>}
      {children}
    </button>
  );

  return (
    <div style={{
      padding: '18px 20px',
      background: '#FAFAFA',
      display: 'flex', flexDirection: 'column', gap: 14,
      minWidth: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8, paddingBottom: 10, borderBottom: '1px solid #E5E5E5',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="sparkles" size={14} color="#525252"/>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#525252' }}>Análise IA</span>
        </div>
        {!editing && (
          <TextLinkButton color="#7401C3" onClick={() => setEditing(true)}>Editar tudo</TextLinkButton>
        )}
      </div>

      <EditableField
        eyebrow="Diagnóstico"
        value={editing ? draft.diagnostico : values.diagnostico}
        editing={editing}
        rows={4}
        onChange={(v) => setDraft(d => ({ ...d, diagnostico: v }))}
      />
      <EditableField
        eyebrow="Estado atual"
        value={editing ? draft.estado : values.estado}
        editing={editing}
        rows={3}
        onChange={(v) => setDraft(d => ({ ...d, estado: v }))}
      />
      <EditableField
        eyebrow="Prioridades de evolução"
        value={editing ? draft.prioridades : values.prioridades}
        editing={editing}
        rows={4}
        onChange={(v) => setDraft(d => ({ ...d, prioridades: v }))}
        formatList
      />

      {editing && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
          paddingTop: 10, borderTop: '1px solid #E5E5E5',
        }}>
          <TextLinkButton icon="check" color="#7401C3" onClick={save}>Salvar</TextLinkButton>
          <TextLinkButton icon="x" color="#525252" onClick={discard}>Descartar</TextLinkButton>
          <TextLinkButton icon="sparkles" color="#7401C3" onClick={regen}>Regenerar com IA</TextLinkButton>
        </div>
      )}

      {!editing && (
        <div style={{
          fontSize: 12, color: '#737373',
          paddingTop: 8, borderTop: '1px solid #E5E5E5',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>Esta informação foi útil?</span>
          <Icon name="thumbs-up" size={13} color="#AA95BE"/>
          <Icon name="thumbs-down" size={13} color="#AA95BE"/>
        </div>
      )}
    </div>
  );
}

function EditableField({ eyebrow, value, editing, rows = 3, onChange, formatList }: {
  eyebrow: string;
  value: string;
  editing: boolean;
  rows?: number;
  onChange: (v: string) => void;
  formatList?: boolean;
}) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
        textTransform: 'uppercase', color: '#525252', marginBottom: 6,
      }}>{eyebrow}</div>
      {editing ? (
        <textarea
          value={value}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%', resize: 'vertical',
            padding: '8px 10px',
            fontSize: 13, lineHeight: 1.55, color: '#1a1a1a',
            background: '#fff', border: '1px solid #E5E5E5',
            borderRadius: 8, outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 150ms',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = '#7401C3'; }}
          onBlur={e => { e.target.style.borderColor = '#E5E5E5'; }}
        />
      ) : formatList && /^\s*\d+\./m.test(value) ? (
        <div style={{ fontSize: 13.5, lineHeight: 1.55, color: '#1a1a1a' }}>
          {(() => {
            const items = value.split('\n').filter(l => l.trim()).map(l => l.replace(/^\s*\d+\.\s*/, ''));
            return items.map((t, i) => (
              <span key={i}>
                <b>({i + 1})</b> {t}{i < items.length - 1 ? '; ' : '.'}
              </span>
            ));
          })()}
        </div>
      ) : (
        <div style={{
          fontSize: 13.5, lineHeight: 1.55, color: '#1a1a1a',
          whiteSpace: 'pre-wrap',
        }}>{value}</div>
      )}
    </div>
  );
}

/* ---------- Public filter dropdown ---------- */
function PubFilterDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = PUB_FILTERS.find(f => f.id === value) || PUB_FILTERS[0];

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 240 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 12px', borderRadius: 8,
        border: '1px solid var(--hu-border)', background: '#fff',
        cursor: 'pointer',
        fontSize: 12.5, fontWeight: 600, color: '#3C0366',
        width: '100%',
      }}>
        <Icon name="users" size={13} color="#737373"/>
        <span style={{ flex: 1, textAlign: 'left' }}>{current.label}</span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={12} color="#AA95BE"/>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          background: '#fff', borderRadius: 10, border: '1px solid var(--hu-border)',
          boxShadow: '0 12px 28px rgba(60,3,102,0.12)',
          padding: 6, zIndex: 30, minWidth: '100%',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {PUB_FILTERS.map(f => {
            const isActive = f.id === value;
            return (
              <div key={f.id}
                onClick={() => { onChange(f.id); setOpen(false); }}
                style={{
                  padding: '7px 10px', borderRadius: 6, cursor: 'pointer',
                  background: isActive ? '#EFE3F8' : 'transparent',
                  color: isActive ? '#3C0366' : '#525252',
                  fontWeight: isActive ? 700 : 500, fontSize: 12.5,
                  transition: 'background 120ms',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#FAFAFA'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                {f.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Timeline SVG ---------- */
interface TimelinePoint {
  kind: string;
  data: string;
  value: number;
  label?: string;
  fonte?: string;
  n?: number;
}

function TimelineSVG({ points, range = [-100, 100] as [number, number], dim = 'sentimento' }: {
  points: TimelinePoint[];
  range?: [number, number];
  dim?: string;
}) {
  const W = 720, H = 320;
  const ML = 50, MR = 40, MT = 22, MB = 60;
  const [hover, setHover] = React.useState<number | null>(null);

  const [rMin, rMax] = range;
  const isSent = dim === 'sentimento';
  const firstT = new Date(points[0].data).getTime();
  const lastT  = new Date(points[points.length - 1].data).getTime();
  const span = Math.max(1, lastT - firstT);
  const px = (iso: string) => ML + ((new Date(iso).getTime() - firstT) / span) * (W - ML - MR);
  const py = (s: number) => H - MB - ((s - rMin) / (rMax - rMin)) * (H - MT - MB);

  const fmtAxis = (v: number) => isSent ? (v > 0 ? '+' + v : String(v)) : String(v);

  const axisTicks = isSent ? [-100, -50, 0, 50, 100] : [0, 25, 50, 75, 100];
  const zeroVal = isSent ? 0 : null;

  const pointColor = (p: TimelinePoint) => {
    if (p.kind === 'matrix') return '#7401C3';
    return sentColor(p.value);
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {axisTicks.map(t => (
          <g key={t}>
            <line x1={ML} y1={py(t)} x2={W - MR} y2={py(t)}
              stroke={t === zeroVal ? '#AA95BE' : '#F0EBF4'}
              strokeWidth="1"
              strokeDasharray={t === zeroVal ? '4 4' : undefined}/>
            <text x={W - MR + 6} y={py(t) + 4} fontSize="10" fill="#737373" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtAxis(t)}</text>
          </g>
        ))}
        <line x1={ML} y1={H - MB} x2={W - MR} y2={H - MB} stroke="#E7E0EB" strokeWidth="1"/>

        <path d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p.data)} ${py(p.value)}`).join(' ')}
          fill="none" stroke="#7401C3" strokeWidth="1.8" opacity="0.4"/>

        {points.map((p, i) => {
          const isMatrix = p.kind === 'matrix';
          const color = pointColor(p);
          const r = isMatrix ? 7 : 5.5;
          return (
            <g key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}>
              <circle cx={px(p.data)} cy={py(p.value)} r={isMatrix ? 14 : 11} fill={color} opacity="0.13"/>
              <circle cx={px(p.data)} cy={py(p.value)} r={r} fill={color} stroke="#fff" strokeWidth={isMatrix ? 2.2 : 1.8}/>
              <text x={px(p.data)} y={py(p.value) - r - 5} textAnchor="middle"
                fontFamily="Lato" fontWeight="900" fontSize="10.5" fill="#0A0A0A">
                {fmtAxis(Math.round(p.value))}
              </text>
              <text x={px(p.data)} y={H - MB + 16} textAnchor="middle"
                fontSize="9.5" fill={isMatrix ? '#5A0992' : '#737373'} fontWeight={isMatrix ? '700' : '500'}>
                {fmtShortMonth(p.data)}
              </text>
              {isMatrix && (
                <text x={px(p.data)} y={H - MB + 30} textAnchor="middle"
                  fontSize="9" fill="#5A0992" fontWeight="700" letterSpacing="0.05em">
                  {p.label?.toUpperCase()}
                </text>
              )}
            </g>
          );
        })}

        {hover != null && (() => {
          const p = points[hover];
          const x = px(p.data), y = py(p.value);
          const isMatrix = p.kind === 'matrix';
          const dimLabel = isSent ? 'Sentimento' : 'Relevância';
          const lines = isMatrix
            ? [p.label || '', fmtShortMonth(p.data), `${dimLabel}: ${fmtAxis(Math.round(p.value))}`]
            : [(FONTES as Record<string, { short?: string }>)[p.fonte || '']?.short || p.fonte || '', fmtShortMonth(p.data), `${dimLabel}: ${fmtAxis(Math.round(p.value))}`, `${p.n} menções`];
          const tw = 180, th = 14 + lines.length * 14;
          const tx = Math.min(W - MR - tw, Math.max(ML, x - tw / 2));
          const ty = y - th - 18 < MT ? y + 18 : y - th - 18;
          return (
            <g key="tip" style={{ pointerEvents: 'none' }}>
              <rect x={tx} y={ty} width={tw} height={th} rx={6}
                fill="#0A0A0A" opacity="0.92"/>
              {lines.map((ln, i) => (
                <text key={i} x={tx + 10} y={ty + 16 + i * 14}
                  fontSize="10.5" fill="#fff" fontWeight={i === 0 ? '700' : '400'}>
                  {ln}
                </text>
              ))}
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

/* ============================================================
   PERCEPÇÃO · Tabela
   ============================================================ */
interface PercepcaoBlockProps {
  theme: Theme;
}

export function PercepcaoBlock({ theme }: PercepcaoBlockProps) {
  const [expanded, setExpanded] = React.useState<string[]>(theme.id === 4 ? ['interno'] : []);

  const toggleExpand = (pubId: string) => {
    setExpanded(prev => prev.includes(pubId) ? prev.filter(p => p !== pubId) : [...prev, pubId]);
  };

  const relevs = theme.por_publico.map(p => p.relevancia);
  const maxRel = Math.max(...relevs);
  const minRel = Math.min(...relevs);
  const gap = maxRel - minRel;
  const maxPub = theme.por_publico.find(p => p.relevancia === maxRel);
  const minPub = theme.por_publico.find(p => p.relevancia === minRel);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {gap >= 12 && maxPub && minPub && (
        <AIFlat tone="warning" footer={false}
          title="Divergência entre públicos"
          sintese={
            <span>
              Há <b>{gap}pp</b> de diferença na relevância entre os públicos. {PUBLICO_BY_ID[maxPub.publico]?.label} avalia em <b>{maxPub.relevancia}%</b> e {PUBLICO_BY_ID[minPub.publico]?.label} em <b>{minPub.relevancia}%</b>. Endereçar essa percepção antes do próximo ciclo.
            </span>
          }
        />
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 110px 130px 90px 36px',
          fontSize: 12, fontWeight: 500,
          color: '#737373', background: '#FAFAFA',
          padding: '12px 24px',
          borderBottom: '1px solid #F0F0F0',
        }}>
          <span>Público</span>
          <span style={{ textAlign: 'right' }}>Relevância</span>
          <span style={{ textAlign: 'right' }}>Sentimento</span>
          <span style={{ textAlign: 'right' }}>n</span>
          <span/>
        </div>

        {/* Alta Liderança row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 110px 130px 90px 36px',
          alignItems: 'center',
          padding: '14px 24px',
          background: '#FAF5FE',
          borderBottom: '1px solid var(--hu-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: '#7401C3', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--hu-font-display)', fontWeight: 900, fontSize: 12, letterSpacing: '-0.02em',
            }}>AL</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0A0A0A' }}>Alta Liderança</div>
              <div style={{ fontSize: 11, color: '#5A0992' }}>Pesquisa direta com C-Level</div>
            </div>
            <Pill tone="brand" size="sm" style={{ marginLeft: 8 }}>Eixo X</Pill>
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'var(--hu-font-display)', fontWeight: 900, fontSize: 18, color: '#3C0366', fontVariantNumeric: 'tabular-nums' }}>
            {theme.x}%
          </div>
          <div style={{ textAlign: 'right', color: 'var(--hu-muted)', fontSize: 13 }}>—</div>
          <div style={{ textAlign: 'right', fontSize: 11.5, color: 'var(--hu-muted)' }}>direta</div>
          <span/>
        </div>

        {PUBLICOS.map((pub) => {
          const pp = theme.por_publico.find(x => x.publico === pub.id);
          if (!pp) return null;
          const hasCargo = pub.id === 'interno' && Array.isArray(theme.por_cargo);
          const isExpanded = expanded.includes(pub.id);
          const isMax = pp.relevancia === maxRel;
          const isMin = pp.relevancia === minRel && minRel !== maxRel;
          return (
            <React.Fragment key={pub.id}>
              <PercepcaoRow pub={pub} pp={pp} hasCargo={hasCargo}
                isExpanded={isExpanded}
                onExpand={() => hasCargo && toggleExpand(pub.id)}
                isMax={isMax} isMin={isMin}/>
              {hasCargo && isExpanded && theme.por_cargo?.map(c => (
                <CargoRow key={c.cargo} cargo={c}/>
              ))}
            </React.Fragment>
          );
        })}

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
      </Card>
    </div>
  );
}

function PercepcaoRow({ pub, pp, hasCargo, isExpanded, onExpand, isMax, isMin }: {
  pub: { id: string; icon: string; label: string; peso: number };
  pp: { relevancia: number; sentimento: number | null; n_amostra: number };
  hasCargo: boolean;
  isExpanded: boolean;
  onExpand: () => void;
  isMax: boolean;
  isMin: boolean;
}) {
  const [hov, setHov] = React.useState(false);
  return (
    <div onClick={() => { if (hasCargo) onExpand(); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 110px 130px 90px 36px',
        alignItems: 'center',
        padding: '14px 24px',
        borderBottom: '1px solid #F4F4F5',
        cursor: hasCargo ? 'pointer' : 'default',
        background: hov ? '#FAFAFA' : 'transparent',
        transition: 'background 120ms',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: '#F4F4F5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={pub.icon} size={15} color="#525252"/>
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0A0A0A' }}>{pub.label}</div>
          <div style={{ fontSize: 11, color: 'var(--hu-muted)' }}>
            peso {pub.peso}× {hasCargo && '· clique para ver por cargo'}
          </div>
        </div>
        {isMax && <Pill tone="brand"   size="sm" style={{ marginLeft: 'auto', whiteSpace: 'nowrap', fontWeight: 500 }}>Maior relev.</Pill>}
        {isMin && <Pill tone="neutral" size="sm" style={{ marginLeft: 'auto', whiteSpace: 'nowrap', fontWeight: 500 }}>Menor</Pill>}
      </div>
      <div style={{
        textAlign: 'right',
        fontFamily: 'var(--hu-font-display)', fontWeight: 700, fontSize: 16,
        color: '#0A0A0A', fontVariantNumeric: 'tabular-nums',
      }}>{pp.relevancia}%</div>
      <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
        <StatusDot size={9} tone={
          pp.sentimento == null ? 'neutral'
          : pp.sentimento <= -25 ? 'danger'
          : pp.sentimento < 0    ? 'warning'
          : 'success'
        }/>
        <span style={{
          fontFamily: 'var(--hu-font-display)', fontWeight: 700, fontSize: 14,
          color: sentColor(pp.sentimento), fontVariantNumeric: 'tabular-nums',
        }}>{fmtSent(pp.sentimento)}</span>
      </div>
      <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--hu-muted)', fontVariantNumeric: 'tabular-nums' }}>
        {pp.n_amostra}
      </div>
      <div style={{ textAlign: 'right' }}>
        {hasCargo && (
          <span style={{
            display: 'inline-flex',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 180ms',
          }}>
            <Icon name="chevron-right" size={14} color="#AA95BE"/>
          </span>
        )}
      </div>
    </div>
  );
}

function CargoRow({ cargo }: { cargo: { cargo: string; cargo_label: string; relevancia: number | null; sentimento: number | null; n_amostra: number; insuficiente: boolean } }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 110px 130px 90px 36px',
      alignItems: 'center',
      padding: '10px 24px 10px 56px',
      borderBottom: '1px solid #F4F4F5',
      background: '#FCFAFD',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: '#AA95BE' }}/>
        <span style={{ fontSize: 12.5, color: '#525252' }}>{cargo.cargo_label}</span>
      </div>
      <div style={{
        textAlign: 'right',
        fontSize: 13, fontWeight: 600,
        color: cargo.insuficiente ? '#AA95BE' : '#0A0A0A',
        fontVariantNumeric: 'tabular-nums',
      }}>{cargo.insuficiente ? '—' : `${cargo.relevancia}%`}</div>
      <div style={{ textAlign: 'right' }}>
        {cargo.insuficiente ? (
          <i style={{ fontSize: 11, color: '#C81E1E' }}>amostra insuficiente</i>
        ) : (
          <span style={{
            fontFamily: 'var(--hu-font-display)', fontWeight: 700, fontSize: 13,
            color: sentColor(cargo.sentimento), fontVariantNumeric: 'tabular-nums',
          }}>{fmtSent(cargo.sentimento)}</span>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{
          fontSize: 12, fontWeight: cargo.insuficiente ? 700 : 400,
          color: cargo.insuficiente ? '#C81E1E' : 'var(--hu-muted)',
          fontVariantNumeric: 'tabular-nums',
        }}>{cargo.n_amostra}</span>
      </div>
      <div/>
    </div>
  );
}
