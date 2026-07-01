import React from 'react';
import { Icon, Pill, StatusDot, Btn } from './icons';
import { Card, SectionTitle, EmptyState, AIInsight } from './components';
import { AIFlat } from './components';
import { DimensionRadio, DIM_BY_ID } from './dimensions';
import {
  PUBLICOS, PUBLICO_BY_ID, getDimValue, sentColor, fmtSent, fmtShortMonth,
  FONTES, type Theme, type Sinal,
} from './data';
import { cn } from '~/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  Card as ShadCard,
  CardContent,
} from '~/components/ui/card';

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
  2: {
    diagnostico: 'Tema sólido com sentimento positivo (+28). Clientes avaliam a qualidade técnica acima da média do setor. Ponto de atenção: taxa de acidentes ainda acima da meta interna (4,1 vs. meta < 3,0).',
    estado: 'Aprovação de clientes é consistente. Time interno valoriza a cultura de segurança. Pressão de cronograma continua relativizando protocolos em picos de obra.',
    prioridades: '1. Reduzir taxa de acidentes para < 3,0 até Dez/2026\n2. Padronizar protocolos de segurança entre todas as obras\n3. Institucionalizar pesquisa de qualidade pós-entrega',
  },
  3: {
    diagnostico: 'Cultura ética percebida positivamente por fornecedores e pelo mercado. Lacuna: percepção de consequência real das denúncias no Canal de Ética ainda gera dúvidas internamente.',
    estado: 'Canal de Ética operacional e divulgado. Relatório anual de desfechos ainda não publicado — esse é o gap crítico para credibilidade interna.',
    prioridades: '1. Publicar relatório anual do Canal com agregados anonimizados (Set/2026)\n2. Treinar lideranças no manejo de denúncias diretas\n3. Vincular Canal a métrica de cultura organizacional',
  },
  5: {
    diagnostico: 'Saúde física razoavelmente endereçada via ginástica laboral e EPIs. Saúde mental é o grande gap — não existe programa estruturado e o tema é tabu nas obras.',
    estado: 'Sentimento levemente positivo (+6) mas com fragilidade em ergonomia e suporte psicológico. Absenteísmo por saúde subiu 12% no último ano.',
    prioridades: '1. Estruturar programa de saúde mental com parceiro especializado (Set/2026)\n2. Incorporar avaliação ergonômica nas obras maiores\n3. Treinar gestores para identificar sinais de burnout',
  },
  6: {
    diagnostico: 'Risco crescente com a digitalização acelerada das obras. Políticas de segurança digital existem no papel mas não são praticadas nem monitoradas no campo.',
    estado: 'Autenticação em dois fatores implementada em sistemas centrais. Canteiros ainda operam com senhas fracas e sem treinamento formal de cibersegurança.',
    prioridades: '1. Implantar política de senhas e MFA em todos os sistemas de obra até Ago/2026\n2. Treinar 100% dos colaboradores com acesso a sistemas em segurança digital\n3. Realizar pentest semestral',
  },
  7: {
    diagnostico: 'Gestão financeira disciplinada é reconhecida como diferencial competitivo. Fragilidade interna: reembolsos e fluxo de aprovação de despesas operacionais ainda são lentos.',
    estado: 'Relatórios financeiros transparentes para clientes. Processo interno de reembolso de campo gera fricção — tempo médio de 45 dias é alto para a operação.',
    prioridades: '1. Reduzir tempo médio de reembolso de campo para < 15 dias até Jul/2026\n2. Vincular metas financeiras a indicadores ESG para acesso a capital verde\n3. Estruturar previsibilidade de caixa de 18 meses',
  },
  8: {
    diagnostico: 'Investimento em desenvolvimento existe mas é fragmentado. Treinamentos pontuais sem trilha contínua não geram retenção nem aumento mensurável de competência.',
    estado: 'Cursos de BIM disponibilizados com boa adesão. Programa de mentoria não existe formalmente. Gestores não preparados para papel de desenvolvimento de equipe.',
    prioridades: '1. Lançar trilha de desenvolvimento técnico (BIM, gestão de obra, segurança) até Set/2026\n2. Implementar programa de mentoria sênior-júnior em 5 obras piloto\n3. Capacitar 100% dos gestores em feedbacks estruturados',
  },
  9: {
    diagnostico: 'Relacionamento com clientes é um ponto forte — atendimento pós-entrega e comunicação durante a obra são bem avaliados. Gap: primeiro contato em situações de problema ainda é confuso.',
    estado: 'NPS não é monitorado formalmente. Portal digital de acompanhamento de obra ainda não existe — clientes solicitam recorrentemente.',
    prioridades: '1. Implementar NPS formal a cada entrega de fase (Mai/2026)\n2. Desenvolver portal de acompanhamento de obra para clientes (Set/2026)\n3. Definir matriz de escalação clara para problemas em obra',
  },
  12: {
    diagnostico: 'Retenção é crítica — rotatividade de 23,8% acima da referência do setor (< 18%). Cultura retém mais do que salário, mas o gap salarial está se tornando insuportável para perfis seniores.',
    estado: 'Employer branding inexistente em universidades de engenharia. Mapeamento de competências críticas e plano de sucessão não existem formalmente.',
    prioridades: '1. Lançar programa de employer branding em 5 universidades de engenharia até Ago/2026\n2. Mapear competências críticas e cargos sem sucessor identificado\n3. Rever bandas salariais para perfis seniores técnicos',
  },
  13: {
    diagnostico: 'Contratos claros e pagamentos pontuais são reconhecidos como diferencial na cadeia. Fragilidade: comunicação operacional durante as obras ainda gera atrito com fornecedores.',
    estado: 'Fornecedores estratégicos satisfeitos com a relação contratual. Portal de acompanhamento de pedidos/medições ainda não existe — gap operacional relevante.',
    prioridades: '1. Desenvolver portal de comunicação com fornecedores (Out/2026)\n2. Revisar penalidades contratuais para incluir cláusulas de força maior\n3. Implementar programa de capacitação de fornecedores locais em boas práticas',
  },
  14: {
    diagnostico: 'Propósito organizacional não está claro internamente — colaboradores sabem o que fazem mas não por quê importa. Clientes percebem seriedade mas não identificam um propósito diferenciador.',
    estado: 'Sem campanha ativa de propósito. Material de apresentação institucional desatualizado. Oportunidade de vincular propósito à estratégia ESG em andamento.',
    prioridades: '1. Definir e validar o propósito organizacional com liderança sênior (Jul/2026)\n2. Lançar campanha interna de propósito para 100% dos colaboradores\n3. Integrar propósito na comunicação com clientes e comunidades',
  },
  15: {
    diagnostico: 'Primeira camada de fornecedores é auditada, mas cadeia estendida é opaca. Risco regulatório crescente com exigências de rastreabilidade em contratos públicos e ESG.',
    estado: 'Sem certificação de cadeia responsável. Processo de qualificação de fornecedores existe mas não inclui critérios ESG formais.',
    prioridades: '1. Incluir critérios ESG no processo de qualificação de todos os fornecedores até Dez/2026\n2. Mapear segunda camada de fornecedores críticos\n3. Iniciar processo de certificação de cadeia responsável',
  },
  17: {
    diagnostico: 'Setor historicamente masculino e pouco diverso. Empresa tem consciência do gap mas sem metas quantitativas nem programa estruturado. Jovens talentos avaliam DEI na decisão de onde trabalhar.',
    estado: 'Programa de aprendizes existe e é bem avaliado. Representação feminina em cargos técnicos abaixo de 8%. Ausência de metas formais de diversidade.',
    prioridades: '1. Definir metas de diversidade por nível hierárquico até Set/2026\n2. Revisar linguagem e processo seletivo para reduzir vieses\n3. Ampliar programa de aprendizes com foco em grupos sub-representados',
  },
  19: {
    diagnostico: 'Cultura de canteiro é percebida como ponto forte de identidade da empresa. Gap crítico: desconexão entre cultura de escritório e de campo. Gestores intermediários são o elo mais fraco na transmissão cultural.',
    estado: 'Rituais de reconhecimento existem mas são inconsistentes entre obras. Integração e onboarding funcionam bem no escritório, mal no canteiro.',
    prioridades: '1. Padronizar rituais de reconhecimento e celebração entre todas as obras\n2. Criar programa de intercâmbio escritório-canteiro (rotação de 1 semana)\n3. Capacitar gestores intermediários como embaixadores de cultura',
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
    <div className="mat-evolucao-outer grid gap-3" style={{ gridTemplateColumns: '300px minmax(0, 1fr)' }}>

      {/* ── AI Diagnosis — standalone card ── */}
      <ThemeAIInsight theme={theme} dim={dim}/>

      {/* ── Timeline + filters — single card ── */}
      <ShadCard className="flex flex-col gap-0 overflow-hidden p-0">
        {/* title */}
        <div className="px-5 pt-4 pb-3 border-b border-border/50">
          <div className="text-[15px] font-bold text-foreground tracking-tight leading-snug">
            {isSent ? 'Linha do tempo do sentimento' : 'Evolução da relevância'}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Evolução</p>
        </div>

        {/* filters bar */}
        <div className="px-5 py-3 border-b border-border/50 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Filtrar por público</span>
            <PubFilterDropdown value={pubFilter} onChange={setPubFilter}/>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Dimensão</span>
            <DimensionRadio value={dim} onChange={setDim}/>
          </div>
          {pubFilter !== 'all' && (
            <span className="text-xs text-primary">
              Recorte: <b>{PUB_FILTERS.find(f => f.id === pubFilter)?.label}</b>
            </span>
          )}
        </div>

        {/* chart area */}
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-end gap-3.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"/>Matriz
            </span>
            {isSent && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }}/>
                Sinal operacional
              </span>
            )}
          </div>
          {points.length < 2 ? (
            <EmptyState icon="zap"
              title="Sem dados suficientes para este recorte"
              subtitle="Ajuste o filtro de público ou a dimensão para ver outra leitura."/>
          ) : (
            <TimelineSVG points={points} range={range} dim={dim}/>
          )}
        </div>
      </ShadCard>

      <style>{`
        @media (max-width: 1100px) {
          .mat-evolucao-outer { grid-template-columns: minmax(0, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------- AI Analysis (read-only, same formatting as Matriz de Materialidade) ---------- */
interface ThemeAIInsightProps {
  theme: Theme;
  dim?: string;
}

function ThemeAIInsight({ theme, dim = 'sentimento' }: ThemeAIInsightProps) {
  const defaults = getAIDefaults(theme, dim);
  const prioridades = defaults.prioridades
    .split('\n')
    .filter(l => l.trim())
    .map(l => l.replace(/^\s*\d+\.\s*/, ''));
  const tone =
    theme.sentimento != null && theme.sentimento < -20 ? 'danger'
    : theme.sentimento != null && theme.sentimento < 0  ? 'warning'
    : 'brand';

  return (
    <AIInsight
      title="Diagnóstico do tema"
      sintese={`${defaults.diagnostico} ${defaults.estado}`}
      prioridades={prioridades}
      tone={tone}
      className="min-w-0 self-start"
    />
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
    <div ref={ref} className="relative min-w-60">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-[7px] rounded-lg border border-border bg-white cursor-pointer text-sm font-semibold text-primary/80 w-full">
        <Icon name="users" size={13} color="#737373"/>
        <span className="flex-1 text-left">{current.label}</span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={12} color="#AA95BE"/>
      </button>
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 bg-white rounded-[10px] border border-border shadow-[0_12px_28px_rgba(60,3,102,0.12)] p-1.5 z-30 min-w-full flex flex-col gap-0.5">
          {PUB_FILTERS.map(f => {
            const isActive = f.id === value;
            return (
              <div key={f.id}
                onClick={() => { onChange(f.id); setOpen(false); }}
                className={cn(
                  'px-2.5 py-[7px] rounded-md cursor-pointer text-sm transition-colors duration-[120ms]',
                  isActive
                    ? 'bg-primary/10 text-primary/80 font-bold'
                    : 'bg-transparent text-foreground font-medium hover:bg-muted/50',
                )}>
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

export function TimelineSVG({ points, range = [-100, 100] as [number, number], dim = 'sentimento' }: {
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
    if (p.kind === 'matrix') return 'var(--primary)';
    return sentColor(p.value);
  };

  return (
    <div className="relative">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
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
          fill="none" stroke="var(--primary)" strokeWidth="1.8" opacity="0.4"/>

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
    <div className="flex flex-col gap-3.5">
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
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAFAFA] hover:bg-[#FAFAFA]">
              <TableHead className="text-xs font-medium text-muted-foreground px-6 py-3">Público</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground px-6 py-3 text-right">Relevância</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground px-6 py-3 text-right">Sentimento</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground px-6 py-3 text-right">n</TableHead>
              <TableHead className="w-9 px-6 py-3"/>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Alta Liderança row */}
            <TableRow className="bg-primary/10 hover:bg-primary/10 border-b border-border">
              <TableCell className="px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg shrink-0 bg-primary text-white flex items-center justify-center font-black text-xs tracking-tight" style={{ fontFamily: 'var(--hu-font-display)' }}>
                    AL
                  </span>
                  <div>
                    <div className="text-[13.5px] font-bold text-foreground">Alta Liderança</div>
                    <div className="text-xs text-primary">Pesquisa direta com C-Level</div>
                  </div>
                  <Pill tone="brand" size="sm" style={{ marginLeft: 8 }}>Eixo X</Pill>
                </div>
              </TableCell>
              <TableCell className="text-right px-6 py-3.5 font-black text-[18px] text-primary/80 tabular-nums" style={{ fontFamily: 'var(--hu-font-display)' }}>
                {theme.x}%
              </TableCell>
              <TableCell className="text-right px-6 py-3.5 text-sm text-muted-foreground">—</TableCell>
              <TableCell className="text-right px-6 py-3.5 text-xs text-muted-foreground">direta</TableCell>
              <TableCell/>
            </TableRow>

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
          </TableBody>
        </Table>

        <div className="bg-[#FAFAFA] border-t border-border px-6 py-3 flex items-center gap-2.5 text-xs text-foreground" style={{ color: '#525252' }}>
          <Icon name="shield" size={14} color="var(--primary)"/>
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
  return (
    <TableRow
      onClick={() => { if (hasCargo) onExpand(); }}
      className={cn(
        'border-b border-[#F4F4F5] transition-colors duration-[120ms]',
        hasCargo ? 'cursor-pointer hover:bg-muted/50' : 'cursor-default',
      )}>
      <TableCell className="px-6 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-8 h-8 rounded-lg shrink-0 bg-[#F4F4F5] flex items-center justify-center">
            <Icon name={pub.icon} size={15} color="#525252"/>
          </span>
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold text-foreground">{pub.label}</div>
            <div className="text-xs text-muted-foreground">
              peso {pub.peso}× {hasCargo && '· clique para ver por cargo'}
            </div>
          </div>
          {isMax && <Pill tone="brand"   size="sm" style={{ marginLeft: 'auto', whiteSpace: 'nowrap', fontWeight: 500 }}>Maior relev.</Pill>}
          {isMin && <Pill tone="neutral" size="sm" style={{ marginLeft: 'auto', whiteSpace: 'nowrap', fontWeight: 500 }}>Menor</Pill>}
        </div>
      </TableCell>
      <TableCell className="text-right px-6 py-3.5 font-bold text-[16px] text-foreground tabular-nums" style={{ fontFamily: 'var(--hu-font-display)' }}>
        {pp.relevancia}%
      </TableCell>
      <TableCell className="text-right px-6 py-3.5">
        <div className="flex justify-end items-center gap-1.5">
          <StatusDot size={9} tone={
            pp.sentimento == null ? 'neutral'
            : pp.sentimento <= -25 ? 'danger'
            : pp.sentimento < 0    ? 'warning'
            : 'success'
          }/>
          <span className="font-bold text-sm tabular-nums" style={{ fontFamily: 'var(--hu-font-display)', color: sentColor(pp.sentimento) }}>
            {fmtSent(pp.sentimento)}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right px-6 py-3.5 text-xs text-muted-foreground tabular-nums">
        {pp.n_amostra}
      </TableCell>
      <TableCell className="text-right px-6 py-3.5">
        {hasCargo && (
          <span className={cn(
            'inline-flex transition-transform duration-[180ms]',
            isExpanded ? 'rotate-90' : 'rotate-0',
          )}>
            <Icon name="chevron-right" size={14} color="#AA95BE"/>
          </span>
        )}
      </TableCell>
    </TableRow>
  );
}

export function CargoRow({ cargo }: { cargo: { cargo: string; cargo_label: string; relevancia: number | null; sentimento: number | null; n_amostra: number; insuficiente: boolean } }) {
  return (
    <TableRow className="border-b border-[#F4F4F5] bg-[#FCFAFD] hover:bg-[#FCFAFD]">
      <TableCell className="pl-14 pr-6 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="w-[5px] h-[5px] rounded-full bg-[#AA95BE] shrink-0"/>
          <span className="text-sm text-foreground" style={{ color: '#525252' }}>{cargo.cargo_label}</span>
        </div>
      </TableCell>
      <TableCell className={cn(
        'text-right px-6 py-2.5 text-sm font-semibold tabular-nums',
        cargo.insuficiente ? 'text-[#AA95BE]' : 'text-foreground',
      )}>
        {cargo.insuficiente ? '—' : `${cargo.relevancia}%`}
      </TableCell>
      <TableCell className="text-right px-6 py-2.5">
        {cargo.insuficiente ? (
          <i className="text-xs text-destructive">amostra insuficiente</i>
        ) : (
          <span className="font-bold text-sm tabular-nums" style={{ fontFamily: 'var(--hu-font-display)', color: sentColor(cargo.sentimento) }}>
            {fmtSent(cargo.sentimento)}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right px-6 py-2.5">
        <span className={cn(
          'text-xs tabular-nums',
          cargo.insuficiente ? 'font-bold text-destructive' : 'font-normal text-muted-foreground',
        )}>
          {cargo.n_amostra}
        </span>
      </TableCell>
      <TableCell/>
    </TableRow>
  );
}
