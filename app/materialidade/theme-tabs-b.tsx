import React from 'react';
import { Icon, Pill, Btn } from './icons';
import { Card, SectionTitle, EmptyState } from './components';
import {
  THEMES, sentColor, fmtSent,
  kpiStatusText, kpiOnTrackStats,
  iniciativaEmDiaStats, iniciativaDeadlineStatus,
  type Theme, type KPI, type Iniciativa, type SugestaoVinculo,
} from './data';

/* ===========================================================
   COMENTÁRIOS DOS STAKEHOLDERS
   =========================================================== */

interface ComentarioBloco {
  dimensao: 'oportunidade' | 'fraqueza';
  publico: string;
  texto: string;
}

interface ComentariosData {
  frequencia: number;
  sintese: string;
  citacoesDestaque: string[];
  blocos: ComentarioBloco[];
}

const COMENTARIOS_DATA: Record<number, ComentariosData> = {
  1: {
    frequencia: 24,
    sintese: 'Respondentes apontam tensão entre os investimentos em digitalização e a infraestrutura física do canteiro. A percepção é de que a modernização chega aos sistemas centrais mas não ao chão de obra, gerando frustração diária no time de campo.',
    citacoesDestaque: [
      'A digitalização das medições mudou o jogo no canteiro.',
      'A empresa investe em tecnologia, mas a infra de campo ainda é precária.',
    ],
    blocos: [
      { dimensao: 'fraqueza',     publico: 'Público interno · canteiro',
        texto: 'Internet instável nas obras é o problema mais citado. Equipamentos antigos e suporte de TI lento aparecem em sequência. A digitalização das medições é elogiada, mas o ganho não compensa o tempo perdido com instabilidade da infraestrutura básica.' },
      { dimensao: 'oportunidade', publico: 'Público interno · escritório',
        texto: '1. Antecipar renovação da rede de campo nas 12 obras maiores. 2. Padronizar kit tecnológico para canteiros (notebook + roteador 4G + leitor de medição). 3. Criar tier de suporte dedicado para obras críticas, com SLA de 2h. 4. Comunicar roadmap de digitalização ao canteiro a cada 90 dias.' },
      { dimensao: 'fraqueza',     publico: 'Fornecedores',
        texto: 'Sistema de medição online é tratado como avanço, mas dependência de internet do canteiro inverte o ganho: medições atrasam porque a rede cai. Sugerem fallback offline com sincronização posterior.' },
    ],
  },
  2: {
    frequencia: 18,
    sintese: 'Tema sólido. Clientes destacam consistentemente a qualidade técnica de entrega, acima da média do setor. Time interno valoriza a cultura de segurança como diferencial competitivo. Únicas notas críticas referem-se à taxa de acidentes ainda acima da meta interna.',
    citacoesDestaque: [
      'A qualidade da entrega superou expectativas — superior ao mercado.',
      'Treinamento de segurança é levado a sério.',
    ],
    blocos: [
      { dimensao: 'oportunidade', publico: 'Clientes',
        texto: 'A qualidade técnica das entregas é o atributo mais elogiado pela carteira de clientes — em particular em obras hospitalares e educacionais, onde a precisão técnica importa mais. Sugestão: institucionalizar pesquisa de qualidade pós-entrega.' },
      { dimensao: 'oportunidade', publico: 'Público interno',
        texto: '1. Padronizar protocolos de segurança entre obras (DDS, EPI, observador de segurança). 2. Investir em mestre de segurança próprio (vs. terceirizado) nas obras maiores. 3. Replicar boas práticas das obras com TF < 3,0 para todas as demais.' },
      { dimensao: 'fraqueza', publico: 'Público interno · canteiro',
        texto: 'A taxa de acidentes ainda está em 4,1 — acima da meta interna (< 3,0). Operários relatam que treinamento existe, mas pressão por cronograma faz com que protocolos sejam relativizados em momentos de pico.' },
    ],
  },
  3: {
    frequencia: 16,
    sintese: 'Cultura ética é percebida positivamente, com destaque para a rigidez nas tratativas com fornecedores. Lacuna observada: canal de ética é divulgado, mas a percepção de consequência efetiva das denúncias ainda gera dúvidas em parte do quadro.',
    citacoesDestaque: [
      'A empresa não aceita "jeitinho" — dá orgulho.',
      'Tenho dúvida se as denúncias têm consequência real.',
    ],
    blocos: [
      { dimensao: 'oportunidade', publico: 'Fornecedores',
        texto: 'Postura ética é citada como diferencial no relacionamento — ausência de "facilitações", pagamentos no prazo, contratos claros. Constrói confiança e diferencia a Vértice na cadeia.' },
      { dimensao: 'fraqueza', publico: 'Público interno',
        texto: 'O Canal de Ética é conhecido e divulgado, mas há dúvida sobre o seguimento das denúncias. Sugestão recorrente: comunicar de forma agregada e anonimizada o desfecho dos casos abertos no Canal.' },
      { dimensao: 'oportunidade', publico: 'Especialistas',
        texto: '1. Publicar relatório anual do Canal de Ética com agregados anonimizados. 2. Treinar lideranças no manuseio de denúncias diretas. 3. Vincular o Canal a métrica de cultura organizacional.' },
    ],
  },
  4: {
    frequencia: 31,
    sintese: 'Respondentes expressam forte preocupação com a perda constante de profissionais qualificados e a alta rotatividade nas unidades. Os relatos sugerem que a saída de colaboradores é motivada por falhas na gestão direta, falta de critérios claros de promoção e um ambiente que desmotiva a permanência a longo prazo.',
    citacoesDestaque: [
      'O plano de carreira existe no papel, mas ninguém sabe como subir.',
      'Faltam critérios claros para avaliação de desempenho.',
    ],
    blocos: [
      { dimensao: 'oportunidade', publico: 'Colaboradores',
        texto: '1. Implementação de critérios objetivos e transparentes para avaliação de desempenho. 2. Criação de trilhas técnicas e de liderança claras, com horizonte de 2-3 anos. 3. Programa formal de reconhecimento informal — feedbacks estruturados, não apenas no anual. 4. Capacitação intensiva dos gestores diretos em conversas de desenvolvimento. 5. Política de promoção pública, com requisitos visíveis a todos.' },
      { dimensao: 'fraqueza', publico: 'Lideranças',
        texto: 'As lideranças intermediárias relatam dificuldade em reter talentos frente à pressão por entrega e ao orçamento limitado para reconhecimento. Muitos gestores apontam que avaliações de desempenho seguem critérios subjetivos, sem alinhamento com o que a área de RH propõe. A falta de um plano de carreira estruturado é citada como o principal vetor de saída voluntária — 23,8% no acumulado de 12 meses.' },
      { dimensao: 'fraqueza', publico: 'Auxiliares de Obra',
        texto: 'Auxiliares apontam que não enxergam um caminho claro para crescimento dentro da empresa. Muitos relatam que treinamentos técnicos existem, mas não se traduzem em mudança de função ou aumento salarial proporcional ao esforço. Outro ponto recorrente é a baixa visibilidade — sentimento de "fazer parte da última etapa da cadeia" sem voz nas decisões da obra.' },
    ],
  },
  10: {
    frequencia: 12,
    sintese: 'Comunidades do entorno reconhecem o esforço de mitigação durante as obras — comunicação prévia, contratação local, gestão de barulho. Tema saudável, sem tensões críticas. Espaço para sistematizar boas práticas como diferencial reputacional.',
    citacoesDestaque: [
      'A empresa contratou pedreiros da comunidade. Fez diferença.',
      'A comunicação prévia foi correta. Reclamamos menos por isso.',
    ],
    blocos: [
      { dimensao: 'oportunidade', publico: 'Sociedade · comunidades do entorno',
        texto: 'A presença da Vértice é percebida de forma positiva pela vizinhança das obras. Comunicação prévia sobre cronograma de impacto (barulho, fechamento parcial de ruas) e contratação local são os pontos mais elogiados. Constrói relação de longo prazo com territórios em que a empresa atua de forma recorrente.' },
      { dimensao: 'oportunidade', publico: 'Especialistas',
        texto: '1. Sistematizar protocolo de engajamento comunitário ANTES do início de obras (formato Pulse Comunidades). 2. Vincular a meta de % de mão-de-obra local por obra. 3. Reportar impactos e mitigações em relatório público anual.' },
    ],
  },
  11: {
    frequencia: 19,
    sintese: 'Tema crítico no relacionamento com fornecedores. Estrutura de aprovações considerada lenta, com múltiplas áreas envolvidas em decisões operacionais. Pagamentos atrasam por morosidade interna, não por restrição de caixa.',
    citacoesDestaque: [
      'Tem gente demais entre o canteiro e a diretoria.',
      'Pagamentos atrasam porque oito áreas aprovam uma medição.',
    ],
    blocos: [
      { dimensao: 'fraqueza', publico: 'Fornecedores',
        texto: 'A demora para pagar é o principal ponto de tensão. Fornecedores relatam que o problema não é falta de recursos da Vértice — é o número de aprovações no fluxo de medição. Vários sinalizam que reduziram o limite de crédito como reação ao atraso recorrente, gerando ciclo negativo.' },
      { dimensao: 'fraqueza', publico: 'Público interno',
        texto: 'Time interno reconhece o problema. Aponta sobreposição de papéis entre Engenharia, Suprimentos, Controladoria e Financeiro no fluxo de aprovação. Falta padrão entre obras — cada uma desenvolveu seu próprio processo informal.' },
      { dimensao: 'oportunidade', publico: 'Lideranças',
        texto: '1. Mapear o fluxo atual de aprovação de medição em até 60 dias. 2. Definir piloto em 2 obras de tipologia distinta (vertical e horizontal). 3. Renegociar SLA de pagamento com fornecedores estratégicos durante o piloto. 4. Padronizar role-mapping (quem aprova o quê) para escala posterior.' },
    ],
  },
  16: {
    frequencia: 8,
    sintese: 'Sentimento moderadamente negativo. Especialistas apontam ausência de parcerias com recicladoras como limitador. A obra do Centro é referência interna, mas não escala. Tema com cobertura parcial (ISO 14001 em andamento).',
    citacoesDestaque: [
      'Resíduos ainda vão muito para aterro comum.',
      'A obra do Centro está com 80% de destinação correta — outras não.',
    ],
    blocos: [
      { dimensao: 'fraqueza', publico: 'Especialistas',
        texto: 'Faltam parcerias estruturadas com recicladoras e cooperativas. A logística reversa fica a cargo de cada obra, com resultados muito desiguais. Apenas a obra do Centro atinge níveis aceitáveis de destinação responsável.' },
      { dimensao: 'oportunidade', publico: 'Público interno',
        texto: '1. Replicar o modelo da obra do Centro nas 5 obras maiores até Dez/2026. 2. Vincular meta de % de destinação correta no contrato de subempreiteiras. 3. Concluir certificação ISO 14001 (atualmente 70% do esforço). 4. Reportar em relatório de sustentabilidade anual.' },
    ],
  },
  20: {
    frequencia: 7,
    sintese: 'Tema com risco regulatório crescente. Especialistas externos e time de sustentabilidade apontam ausência de inventário formal de emissões como gap principal. Programa Carbono Neutro 2030 ainda em fase conceitual.',
    citacoesDestaque: [
      'Não existe ainda um inventário de emissões formal. Estamos no escuro.',
      'O programa Carbono Neutro 2030 é ambicioso, mas falta caminho concreto.',
    ],
    blocos: [
      { dimensao: 'fraqueza', publico: 'Especialistas',
        texto: 'Sem inventário GEE formal, a empresa não tem linha de base para reportar trajetória de redução. Janela regulatória aperta em 2027, e a estruturação técnica do inventário leva 6-12 meses.' },
      { dimensao: 'oportunidade', publico: 'Sustentabilidade',
        texto: '1. Contratar consultoria especializada para inventário Escopo 1 e 2 até Out/2026. 2. Definir trajetória de redução em base científica (SBTi) até Dez/2026. 3. Integrar com o módulo IFRS S2 — Riscos Climáticos. 4. Publicar relatório GHG Protocol em 2027.' },
    ],
  },
};

function getComentarios(themeId: number): ComentariosData {
  return COMENTARIOS_DATA[themeId] || {
    frequencia: 5,
    sintese: 'Tema ainda sem síntese qualitativa consolidada. Vincule novas fontes de comentários em Mapeamentos para alimentar esta análise.',
    citacoesDestaque: [],
    blocos: [],
  };
}

export function ComentariosBlock({ theme }: { theme: Theme }) {
  const data = getComentarios(theme.id);
  const [dimFilter, setDimFilter] = React.useState<'all' | 'oportunidade' | 'fraqueza'>('all');
  const [useful, setUseful] = React.useState<'up' | 'down' | null>(null);

  const filtered = dimFilter === 'all'
    ? data.blocos
    : data.blocos.filter(b => b.dimensao === dimFilter);

  return (
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
          <div style={{ fontSize: 16, fontWeight: 600, color: '#0A0A0A' }}>
            Comentários dos stakeholders sobre o tema
          </div>
          <div style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>
            Seleção dos comentários mais relevantes consolidados pela IA.
          </div>
        </div>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: 0, cursor: 'pointer', padding: 0,
          color: '#7401C3', fontSize: 13, fontWeight: 600,
        }}>
          <Icon name="download" size={13} color="#7401C3"/>
          Exportar comentários (Excel)
        </button>
      </div>

      <div style={{
        padding: '0 24px 16px',
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#737373' }}>Dimensão:</span>
        <DimensaoDropdown value={dimFilter} onChange={setDimFilter}/>
      </div>

      <div className="mat-coment-grid" style={{
        display: 'grid',
        gridTemplateColumns: '380px minmax(0, 1.6fr)',
        gap: 16,
        padding: '0 24px 24px',
      }}>
        {/* Left: síntese */}
        <div style={{
          background: '#FAFAFA',
          border: '1px solid #E5E5E5',
          borderRadius: 8,
          padding: '20px',
          display: 'flex', flexDirection: 'column', gap: 14,
          minWidth: 0,
          alignSelf: 'flex-start',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A' }}>Síntese</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SynKV label="Tema" value={theme.nome}/>
            <SynKV label="Frequência" value={
              <span>
                <b style={{ color: '#0A0A0A', fontVariantNumeric: 'tabular-nums' }}>{data.frequencia}%</b>
                <span style={{ color: '#737373', marginLeft: 6 }}>
                  ({data.frequencia >= 20 ? 'Tema muito relevante' : data.frequencia >= 10 ? 'Tema relevante' : 'Menção esporádica'})
                </span>
              </span>
            }/>
            <SynKV label="Síntese" value={
              <span style={{ color: '#1a1a1a', lineHeight: 1.55 }}>
                {data.sintese}
              </span>
            }/>
            {data.citacoesDestaque.length > 0 && (
              <SynKV label="Citações representativas" value={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.citacoesDestaque.map((c, i) => (
                    <div key={i} style={{
                      fontStyle: 'italic', fontSize: 12.5, color: '#525252',
                      lineHeight: 1.5,
                    }}>"{c}"</div>
                  ))}
                </div>
              }/>
            )}
          </div>

          <div style={{
            marginTop: 4, paddingTop: 12, borderTop: '1px solid #E5E5E5',
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 12, color: '#737373',
          }}>
            <span>Esta informação foi útil?</span>
            <button onClick={() => setUseful(useful === 'up' ? null : 'up')}
              title="Útil"
              style={{
                width: 24, height: 24, padding: 0, borderRadius: 6, cursor: 'pointer',
                border: '1px solid transparent', background: 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: useful === 'up' ? '#00A970' : '#737373',
              }}>
              <Icon name="thumbs-up" size={13} color="currentColor"/>
            </button>
            <button onClick={() => setUseful(useful === 'down' ? null : 'down')}
              title="Não útil"
              style={{
                width: 24, height: 24, padding: 0, borderRadius: 6, cursor: 'pointer',
                border: '1px solid transparent', background: 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: useful === 'down' ? '#C81E1E' : '#737373',
              }}>
              <Icon name="thumbs-down" size={13} color="currentColor"/>
            </button>
          </div>
        </div>

        {/* Right: citações */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 0,
          minWidth: 0,
          maxHeight: 600, overflowY: 'auto',
        }}>
          {filtered.length === 0 ? (
            <EmptyState icon="message"
              title="Sem comentários para este filtro"
              subtitle="Ajuste o filtro de dimensão para ver outros recortes."/>
          ) : filtered.map((b, i) => (
            <ComentarioBlocoItem key={i} bloco={b} last={i === filtered.length - 1}/>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .mat-coment-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

function ComentarioBlocoItem({ bloco, last }: { bloco: ComentarioBloco; last: boolean }) {
  const isOp = bloco.dimensao === 'oportunidade';
  return (
    <div style={{
      paddingTop: 4, paddingBottom: 16,
      borderBottom: last ? 'none' : '1px solid #F0F0F0',
      marginBottom: last ? 0 : 16,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Pill tone={isOp ? 'opportunity' : 'weakness'} size="sm">
          {isOp ? 'Oportunidade' : 'Fraqueza'}
        </Pill>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A' }}>{bloco.publico}</span>
      </div>
      <div style={{
        fontSize: 13, lineHeight: 1.6, color: '#1a1a1a',
      }}>{bloco.texto}</div>
    </div>
  );
}

function SynKV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12.5, fontWeight: 600, color: '#0A0A0A',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: '#7401C3' }}/>
        {label}:
      </div>
      <div style={{ fontSize: 12.5, color: '#1a1a1a', lineHeight: 1.55, paddingLeft: 12 }}>{value}</div>
    </div>
  );
}

function DimensaoDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: 'all' | 'oportunidade' | 'fraqueza') => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const opts: { id: 'all' | 'oportunidade' | 'fraqueza'; label: string }[] = [
    { id: 'all',          label: 'Todas as dimensões' },
    { id: 'oportunidade', label: 'Oportunidade' },
    { id: 'fraqueza',     label: 'Fraqueza' },
  ];
  const cur = opts.find(o => o.id === value) || opts[0];

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 180 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 10px', borderRadius: 8,
        border: '1px solid var(--hu-border)', background: '#fff',
        cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#3C0366',
        width: '100%',
      }}>
        <span style={{ flex: 1, textAlign: 'left' }}>{cur.label}</span>
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
          {opts.map(o => {
            const isActive = o.id === value;
            return (
              <div key={o.id}
                onClick={() => { onChange(o.id); setOpen(false); }}
                style={{
                  padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                  background: isActive ? '#EFE3F8' : 'transparent',
                  color: isActive ? '#3C0366' : '#525252',
                  fontWeight: isActive ? 700 : 500, fontSize: 12.5,
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = '#FAFAFA'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}>
                {o.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===========================================================
   KPIs
   =========================================================== */

export function KPIsBlock({
  theme,
  kpis,
  sugestoes,
}: {
  theme: Theme;
  kpis: KPI[];
  sugestoes: SugestaoVinculo[];
}) {
  const stats = kpiOnTrackStats(kpis);
  const kpiSugestoes = sugestoes.filter(s => s.kind === 'kpi');
  const [sugState, setSugState] = React.useState<Record<number, string>>({});
  const visibleSugs = kpiSugestoes
    .map((s, idx) => ({ s, idx }))
    .filter(x => !sugState[x.idx]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 14, flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#0A0A0A' }}>KPIs vinculados</div>
          <div style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>
            {kpis.length === 0
              ? 'Nenhum indicador conectado a este tema'
              : (
                <span>
                  <b style={{ color: '#0A0A0A', fontWeight: 600 }}>{kpis.length}</b> indicador{kpis.length === 1 ? '' : 'es'} conectado{kpis.length === 1 ? '' : 's'} a este tema
                  {stats.withMeta > 0 && <span> · <b style={{ color: '#0A0A0A', fontWeight: 600 }}>{stats.onTrack}</b> On Track</span>}
                  {stats.semMeta > 0 && <span> · <b style={{ color: '#B45309', fontWeight: 600 }}>{stats.semMeta}</b> sem meta</span>}
                </span>
              )}
          </div>
        </div>
        {kpis.length > 0 && (
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 0, cursor: 'pointer', padding: 0,
            color: '#7401C3', fontSize: 13, fontWeight: 600,
          }}>
            <Icon name="plus" size={13} color="#7401C3"/>
            Vincular KPI
          </button>
        )}
      </div>

      {kpis.length === 0 ? (
        <FlatEmptyState
          icon="bar-chart"
          title="Sem KPIs vinculados a este tema"
          subtitle="KPIs vinculados conectam a percepção dos stakeholders à mensuração operacional."
          actions={
            <>
              <Btn variant="primary" size="sm" icon="link">Vincular KPI existente</Btn>
              <Btn variant="secondary" size="sm" icon="plus">Criar novo KPI</Btn>
            </>
          }
        />
      ) : (
        <KPITable kpis={kpis}/>
      )}

      {visibleSugs.length > 0 && (
        <SugestoesIAVinculo
          title="Sugestões de vínculo (IA)"
          kind="kpi"
          sugs={visibleSugs}
          onAction={(idx, action) => setSugState(s => ({ ...s, [idx]: action }))}
        />
      )}
    </div>
  );
}

function FlatEmptyState({
  icon,
  title,
  subtitle,
  actions,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E5E5E5',
      borderRadius: 12,
      padding: '48px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 12, textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 999,
        background: '#FAFAFA',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={26} color="#AA95BE"/>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A' }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: 13, color: '#737373', maxWidth: 420, lineHeight: 1.55 }}>{subtitle}</div>
      )}
      {actions && <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>{actions}</div>}
    </div>
  );
}

function KPITable({ kpis }: { kpis: KPI[] }) {
  const perspBg: Record<string, { bg: string; fg: string }> = {
    Pessoas:          { bg: '#E8F8F1', fg: '#065F46' },
    Financeiro:       { bg: '#E4F0FE', fg: '#1E40AF' },
    Stakeholders:     { bg: '#EFE3F8', fg: '#5B21B6' },
    Processos:        { bg: '#FFF7E6', fg: '#92400E' },
    Sustentabilidade: { bg: '#E8F8F1', fg: '#065F46' },
    Outros:           { bg: '#FAFAFA', fg: '#525252' },
  };

  const groups: Record<string, KPI[]> = {};
  kpis.forEach(k => {
    const persp = k.perspectiva || 'Outros';
    (groups[persp] = groups[persp] || []).push(k);
  });

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E5E5E5',
      borderRadius: 12,
      overflowX: 'auto',
    }}>
      <table style={{
        width: '100%', minWidth: 1040,
        borderCollapse: 'collapse', fontSize: 12.5,
      }}>
        <thead>
          <tr style={{ background: '#FAFAFA' }}>
            {['Perspectiva', 'Indicador', 'Responsável', 'Atualizado em', 'Polaridade', 'Atual', 'Meta', 'Diferença', 'Status']
              .map((h, i) => (
                <th key={h} style={{
                  textAlign: (i >= 5 && i <= 7) ? 'right' : 'left',
                  padding: '12px 16px',
                  fontSize: 12, fontWeight: 500,
                  color: '#737373',
                  borderBottom: '1px solid #F0F0F0',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(groups).map(([persp, items]) => {
            const palette = perspBg[persp] || perspBg['Outros'];
            return items.map((k, i) => (
              <tr key={k.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                {i === 0 && (
                  <td rowSpan={items.length} style={{
                    padding: '14px 16px',
                    background: palette.bg,
                    verticalAlign: 'top',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: palette.fg }}>{persp}</div>
                  </td>
                )}
                <td style={{ padding: '14px 16px', color: '#0A0A0A', fontWeight: 600 }}>{k.nome}</td>
                <td style={{ padding: '14px 16px' }}>
                  <Resp resp={k.responsavel}/>
                </td>
                <td style={{ padding: '14px 16px', color: '#525252', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {k.atualizado || '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <PolaridadeArrow dir={k.polaridade}/>
                </td>
                <td style={{
                  padding: '14px 16px', textAlign: 'right',
                  fontFamily: 'var(--hu-font-display)', fontWeight: 700, fontSize: 14,
                  color: '#0A0A0A', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
                }}>{k.atual}</td>
                <td style={{
                  padding: '14px 16px', textAlign: 'right',
                  color: k.sem_meta ? '#AA95BE' : '#525252',
                  fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
                }}>{k.sem_meta ? '—' : k.meta}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <DiffText text={k.diff} tone={k.diffTone}/>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <KPIStatusCell tone={k.status} label={kpiStatusText(k)}/>
                </td>
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
}

function KPIStatusCell({ tone, label }: { tone: string; label: string }) {
  const map: Record<string, { bg: string; fg: string; icon: string; outlined?: boolean }> = {
    success: { bg: '#00A970', fg: '#00875a', icon: '✓' },
    warning: { bg: '#F59E0B', fg: '#B45309', icon: '⚠' },
    danger:  { bg: '#E03131', fg: '#C81E1E', icon: '✗' },
    neutral: { bg: 'transparent', fg: '#737373', icon: '·', outlined: true },
  };
  const c = map[tone] || map['neutral'];
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 22, height: 22, borderRadius: 999,
        background: c.bg, color: '#fff',
        border: c.outlined ? '1.5px solid #AA95BE' : 'none',
        fontSize: 12, fontWeight: 700, lineHeight: 1,
      }}>
        {c.outlined
          ? <span style={{ color: '#AA95BE' }}>{c.icon}</span>
          : c.icon}
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, color: c.fg, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );
}

function Resp({ resp }: { resp?: { iniciais: string; nome: string } | null }) {
  if (!resp) return <span style={{ color: 'var(--hu-muted)' }}>—</span>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        width: 26, height: 26, borderRadius: 999, flexShrink: 0,
        background: '#EFE3F8', color: '#5A0992',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--hu-font-display)', fontWeight: 900, fontSize: 10, letterSpacing: '-0.02em',
      }}>{resp.iniciais}</span>
      <span style={{ fontSize: 12.5, color: '#0A0A0A' }}>{resp.nome}</span>
    </div>
  );
}

function PolaridadeArrow({ dir }: { dir?: string }) {
  const arrow = dir === 'down' ? '↓' : dir === 'up' ? '↑' : '·';
  const desc  = dir === 'down' ? 'quanto menor melhor' : dir === 'up' ? 'quanto maior melhor' : '';
  return (
    <span title={desc} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: '#737373', fontSize: 14, fontWeight: 600,
    }}>{arrow}</span>
  );
}

function DiffText({ text, tone }: { text?: string | null; tone?: string }) {
  if (!text) return <span style={{ color: '#737373' }}>—</span>;
  const colorMap: Record<string, string> = {
    danger:  '#C81E1E',
    warning: '#92400E',
    success: '#065F46',
    neutral: '#525252',
  };
  return (
    <span style={{
      color: colorMap[tone || 'neutral'] || colorMap['neutral'],
      fontSize: 12.5, fontWeight: 600,
      fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
    }}>{text}</span>
  );
}

/* ===========================================================
   INICIATIVAS
   =========================================================== */

interface IniciativaMeta {
  objetivo: string;
  objetivoTone: string;
  responsavel: { iniciais: string; nome: string };
  marco: string;
}

const INICIATIVAS_META: Record<number, IniciativaMeta> = {
  101: { objetivo: 'OKR Q3 2026',           objetivoTone: 'Processos',  responsavel: { iniciais: 'CM', nome: 'Carlos Mendes' },  marco: 'Piloto em 4 obras · Set/26' },
  102: { objetivo: 'OKR Q3 2026',           objetivoTone: 'Processos',  responsavel: { iniciais: 'CM', nome: 'Carlos Mendes' },  marco: 'Aprov. orçamento · Jun/26' },
  103: { objetivo: 'OKR Q1 2026',           objetivoTone: 'Governança', responsavel: { iniciais: 'AB', nome: 'Ana Beatriz' },    marco: 'Concluído · Mar/26' },
  104: { objetivo: 'OKR Q3 2026 Pessoas',   objetivoTone: 'Pessoas',    responsavel: { iniciais: 'PL', nome: 'Patricia Lemos' }, marco: 'Matriz de comp. · Set/26' },
  105: { objetivo: 'OKR Q3 2026 Pessoas',   objetivoTone: 'Pessoas',    responsavel: { iniciais: 'PL', nome: 'Patricia Lemos' }, marco: 'Piloto em 2 áreas · Jul/26' },
  106: { objetivo: 'OKR Q2 2026 Saúde',     objetivoTone: 'Pessoas',    responsavel: { iniciais: 'RS', nome: 'Renato Silva' },   marco: 'Adesão > 60% · Ago/26' },
  107: { objetivo: 'OKR Q4 2026 ESG',       objetivoTone: 'Ambiental',  responsavel: { iniciais: 'RS', nome: 'Renato Silva' },   marco: 'Auditoria ISO · Jan/27' },
  108: { objetivo: 'OKR 2026 IFRS',         objetivoTone: 'Ambiental',  responsavel: { iniciais: 'MS', nome: 'Marcelo Santos' }, marco: 'Mapa de riscos · Out/26' },
  109: { objetivo: 'Plano Estratégico ESG', objetivoTone: 'Ambiental',  responsavel: { iniciais: 'MS', nome: 'Marcelo Santos' }, marco: 'Inventário GEE · Out/26' },
  110: { objetivo: 'OKR Q3 2026',           objetivoTone: 'Processos',  responsavel: { iniciais: 'EC', nome: 'Eduardo Castro' }, marco: 'Mapeamento fluxo · Jun/26' },
};

export function IniciativasBlock({
  theme,
  inics,
  sugestoes,
}: {
  theme: Theme;
  inics: Iniciativa[];
  sugestoes: SugestaoVinculo[];
}) {
  const iniSugestoes = sugestoes.filter(s => s.kind === 'iniciativa');
  const [sugState, setSugState] = React.useState<Record<number, string>>({});
  const visibleSugs = iniSugestoes
    .map((s, idx) => ({ s, idx }))
    .filter(x => !sugState[x.idx]);
  const stats = iniciativaEmDiaStats(inics);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 14, flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#0A0A0A' }}>Iniciativas vinculadas</div>
          <div style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>
            {inics.length === 0
              ? 'Nenhuma iniciativa conectada a este tema'
              : (
                <span>
                  <b style={{ color: '#0A0A0A', fontWeight: 600 }}>{inics.length}</b> iniciativa{inics.length === 1 ? '' : 's'} conectada{inics.length === 1 ? '' : 's'} a este tema
                  {stats.emDia > 0 && <span> · <b style={{ color: '#00875a', fontWeight: 600 }}>{stats.emDia}</b> em dia</span>}
                  {stats.atrasadas > 0 && <span> · <b style={{ color: '#C81E1E', fontWeight: 600 }}>{stats.atrasadas}</b> atrasada{stats.atrasadas === 1 ? '' : 's'}</span>}
                </span>
              )}
          </div>
        </div>
        {inics.length > 0 && (
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 0, cursor: 'pointer', padding: 0,
            color: '#7401C3', fontSize: 13, fontWeight: 600,
          }}>
            <Icon name="plus" size={13} color="#7401C3"/>
            Vincular Iniciativa
          </button>
        )}
      </div>

      {inics.length === 0 ? (
        <FlatEmptyState
          icon="flag"
          title="Sem iniciativas vinculadas a este tema"
          subtitle="Iniciativas vinculadas conectam a materialidade à ação operacional."
          actions={
            <>
              <Btn variant="primary" size="sm" icon="link">Vincular Iniciativa existente</Btn>
              <Btn variant="secondary" size="sm" icon="plus">Criar nova Iniciativa</Btn>
            </>
          }
        />
      ) : (
        <IniciativasTable inics={inics}/>
      )}

      {visibleSugs.length > 0 && (
        <SugestoesIAVinculo
          title="Sugestões de vínculo (IA)"
          kind="iniciativa"
          sugs={visibleSugs}
          onAction={(idx, action) => setSugState(s => ({ ...s, [idx]: action }))}
        />
      )}
    </div>
  );
}

type IniciativaWithExtra = Iniciativa & { _extra: Partial<IniciativaMeta> };

function IniciativasTable({ inics }: { inics: Iniciativa[] }) {
  const groups: Record<string, IniciativaWithExtra[]> = {};
  inics.forEach(i => {
    const m = INICIATIVAS_META[i.id] || ({} as Partial<IniciativaMeta>);
    const obj = m.objetivo || 'Sem objetivo';
    (groups[obj] = groups[obj] || []).push({ ...i, _extra: m });
  });

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E5E5E5',
      borderRadius: 12,
      overflowX: 'auto',
    }}>
      <table style={{
        width: '100%', minWidth: 1100,
        borderCollapse: 'collapse', fontSize: 12.5,
      }}>
        <thead>
          <tr style={{ background: '#FAFAFA' }}>
            {['Objetivo', 'Iniciativa', 'Responsável', 'Prazo', 'Status', 'Progresso', 'Próximo marco'].map(h => (
              <th key={h} style={{
                textAlign: 'left',
                padding: '12px 16px',
                fontSize: 12, fontWeight: 500,
                color: '#737373',
                borderBottom: '1px solid #F0F0F0',
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(groups).map(([obj, items]) =>
            items.map((i, idx) => {
              const dl = iniciativaDeadlineStatus(i);
              return (
                <tr key={i.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                  {idx === 0 && (
                    <td rowSpan={items.length} style={{
                      padding: '14px 16px',
                      background: '#EFE3F8',
                      verticalAlign: 'top',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#5B21B6' }}>{obj}</div>
                      {items[0]._extra.objetivoTone && (
                        <div style={{ fontSize: 11, color: '#5B21B6', opacity: 0.75, marginTop: 2 }}>
                          {items[0]._extra.objetivoTone}
                        </div>
                      )}
                    </td>
                  )}
                  <td style={{ padding: '14px 16px', color: '#0A0A0A', fontWeight: 600 }}>{i.nome}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Resp resp={i._extra.responsavel}/>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#525252', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {i.prazo}
                  </td>
                  <td style={{ padding: '14px 16px', minWidth: 200 }}>
                    <IniciativaStatusCell i={i} dl={dl}/>
                  </td>
                  <td style={{ padding: '14px 16px', minWidth: 180 }}>
                    <ProgressBar value={i.progresso} status={i.status}/>
                    <PrazoIndicator dl={dl}/>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#525252', fontSize: 12.5 }}>
                    {i._extra.marco || '—'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function IniciativaStatusCell({
  i,
  dl,
}: {
  i: Iniciativa;
  dl: ReturnType<typeof iniciativaDeadlineStatus>;
}) {
  let tone: string, label: string;
  if (i.status === 'completo') {
    tone = 'success'; label = `Concluída · ${i.progresso}%`;
  } else if (dl.kind === 'atrasada') {
    tone = 'danger'; label = `Atrasada · ${dl.daysDelta}d vencidos`;
  } else if (i.status === 'andamento') {
    tone = 'warning'; label = `Em andamento · ${i.progresso}%`;
  } else if (i.status === 'pendente') {
    tone = 'neutral'; label = 'Pendente · não iniciada';
  } else {
    tone = 'neutral'; label = i.status;
  }
  const map: Record<string, { bg: string; fg: string; dot: string }> = {
    success: { bg: '#DEF7EC', fg: '#00875a', dot: '#00A970' },
    warning: { bg: '#FEF3C7', fg: '#B45309', dot: '#F59E0B' },
    danger:  { bg: '#FCE2E2', fg: '#C81E1E', dot: '#E03131' },
    neutral: { bg: '#F4F4F5', fg: '#525252', dot: '#AA95BE' },
  };
  const c = map[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '4px 12px 4px 10px', borderRadius: 999,
      background: c.bg, color: c.fg,
      fontSize: 12, fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: c.dot, flexShrink: 0 }}/>
      {label}
    </span>
  );
}

function PrazoIndicator({ dl }: { dl: ReturnType<typeof iniciativaDeadlineStatus> | null }) {
  if (!dl) return null;
  const colors: Record<string, string> = {
    success: '#00875a',
    warning: '#B45309',
    danger:  '#C81E1E',
    neutral: '#737373',
  };
  return (
    <div style={{
      marginTop: 6, fontSize: 11, color: colors[dl.tone] || '#737373',
      fontWeight: 500,
    }}>
      {dl.kind === 'completa' ? 'Concluída no prazo'
       : dl.kind === 'indef'  ? 'Prazo a definir'
       : dl.label}
    </div>
  );
}

function ProgressBar({ value, status }: { value: number; status: string }) {
  const color = status === 'completo' ? '#00A970' : status === 'pendente' ? '#AA95BE' : '#7401C3';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 80, height: 6, borderRadius: 999, background: '#F0F0F0', overflow: 'hidden',
      }}>
        <div style={{
          width: `${value}%`, height: '100%', background: color, borderRadius: 999,
          transition: 'width 400ms',
        }}/>
      </div>
      <span style={{
        fontWeight: 600, fontSize: 12.5,
        color: '#525252', fontVariantNumeric: 'tabular-nums', minWidth: 32, textAlign: 'right',
      }}>{value}%</span>
    </div>
  );
}

/* ===========================================================
   Sugestões IA de vínculo
   =========================================================== */

function SugestoesIAVinculo({
  title,
  kind,
  sugs,
  onAction,
}: {
  title: string;
  kind: string;
  sugs: { s: SugestaoVinculo; idx: number }[];
  onAction: (idx: number, action: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '4px 4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Icon name="sparkles" size={14} color="#525252"/>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#525252' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {sugs.map(({ s, idx }, i) => (
          <SugRow key={idx} s={s} kind={kind || s.kind}
            divider={i < sugs.length - 1}
            onLink={() => onAction(idx, 'linked')}
            onDismiss={() => onAction(idx, 'dismissed')}/>
        ))}
      </div>
    </div>
  );
}

const ACTION_VERBS: Record<string, { primary: string; dot: string; secondary?: string }> = {
  'sem-meta':     { primary: 'Definir meta',     dot: '#F59E0B' },
  'sem-meta-fix': { primary: 'Criar iniciativa', dot: '#E03131', secondary: 'Revisar meta' },
  'plano-acao':   { primary: 'Criar iniciativa', dot: '#F59E0B' },
  'revisar':      { primary: 'Revisar meta',     dot: '#F59E0B' },
  'replanejar':   { primary: 'Replanejar',       dot: '#E03131' },
  'default':      { primary: 'Vincular',         dot: '#7401C3' },
};

function SugRow({
  s,
  kind,
  divider,
  onLink,
  onDismiss,
}: {
  s: SugestaoVinculo;
  kind: string;
  divider: boolean;
  onLink: () => void;
  onDismiss: () => void;
}) {
  const isKpi = kind === 'kpi';
  const a = (s.acao ? ACTION_VERBS[s.acao] : undefined) || ACTION_VERBS['default'];
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 4px',
      borderBottom: divider ? '1px solid #F0F0F0' : 'none',
      flexWrap: 'wrap',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: 999, flexShrink: 0,
        background: a.dot, marginTop: 7,
      }}/>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ fontSize: 13.5, color: '#0A0A0A', lineHeight: 1.5, marginBottom: 2 }}>
          <b style={{ fontWeight: 600 }}>"{s.ref}"</b>
          {s.score != null && (
            <span style={{ color: '#737373', marginLeft: 8 }}>
              — <b style={{ color: '#0A0A0A', fontWeight: 600 }}>{s.score}%</b> de similaridade com este tema
            </span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: '#525252', lineHeight: 1.5 }}>
          {isKpi && s.atual && s.meta ? (
            <span>Indicador atualmente em <b style={{ color: '#0A0A0A' }}>{s.atual}</b> (meta {s.meta}). {s.rationale}</span>
          ) : isKpi && s.atual && !s.meta ? (
            <span>Indicador atualmente em <b style={{ color: '#0A0A0A' }}>{s.atual}</b>, sem meta definida. {s.rationale}</span>
          ) : (
            <span>{s.rationale}</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 14, flexShrink: 0, alignItems: 'center' }}>
        <button onClick={onLink} style={{
          background: 'transparent', border: 0, cursor: 'pointer', padding: 0,
          color: '#7401C3', fontSize: 12.5, fontWeight: 600,
        }}>{a.primary}</button>
        {a.secondary && (
          <button onClick={onLink} style={{
            background: 'transparent', border: 0, cursor: 'pointer', padding: 0,
            color: '#7401C3', fontSize: 12.5, fontWeight: 600,
          }}>{a.secondary}</button>
        )}
        <button onClick={onDismiss} style={{
          background: 'transparent', border: 0, cursor: 'pointer', padding: 0,
          color: '#737373', fontSize: 12.5, fontWeight: 500,
        }}>Dispensar</button>
      </div>
    </div>
  );
}

/* ===========================================================
   APÊNDICE · Contexto Normativo
   =========================================================== */

const GRI_DETAILS: Record<string, { titulo: string; cobertura: 'total' | 'parcial' | 'nenhuma' }> = {
  'GRI 3-3':   { titulo: 'Gestão de temas materiais',           cobertura: 'parcial' },
  'GRI 201':   { titulo: 'Desempenho econômico',                cobertura: 'total' },
  'GRI 201-2': { titulo: 'Implicações climáticas',              cobertura: 'parcial' },
  'GRI 204':   { titulo: 'Práticas de compras',                 cobertura: 'parcial' },
  'GRI 205':   { titulo: 'Combate à corrupção',                 cobertura: 'total' },
  'GRI 206':   { titulo: 'Concorrência desleal',                cobertura: 'parcial' },
  'GRI 305':   { titulo: 'Emissões',                            cobertura: 'parcial' },
  'GRI 306':   { titulo: 'Resíduos',                            cobertura: 'parcial' },
  'GRI 308':   { titulo: 'Avaliação ambiental de fornecedores', cobertura: 'parcial' },
  'GRI 401':   { titulo: 'Emprego',                             cobertura: 'parcial' },
  'GRI 403':   { titulo: 'Saúde e segurança do trabalho',       cobertura: 'total' },
  'GRI 404':   { titulo: 'Capacitação e educação',              cobertura: 'total' },
  'GRI 405':   { titulo: 'Diversidade e igualdade',             cobertura: 'parcial' },
  'GRI 406':   { titulo: 'Não-discriminação',                   cobertura: 'parcial' },
  'GRI 413':   { titulo: 'Comunidades locais',                  cobertura: 'parcial' },
  'GRI 414':   { titulo: 'Avaliação social de fornecedores',    cobertura: 'parcial' },
  'GRI 418':   { titulo: 'Privacidade do cliente',              cobertura: 'parcial' },
  'GRI 2-9':   { titulo: 'Estrutura de governança',             cobertura: 'parcial' },
  'GRI 2-23':  { titulo: 'Compromissos de política',            cobertura: 'parcial' },
};

const ODS_DETAILS: Record<number, { titulo: string; desc: string; metas: string[] }> = {
  3:  { titulo: 'Saúde e bem-estar',                desc: 'Garantir vida saudável e promover bem-estar para todos.',       metas: ['3.4', '3.6', '3.9'] },
  4:  { titulo: 'Educação de qualidade',            desc: 'Garantir educação inclusiva, equitativa e de qualidade.',       metas: ['4.3', '4.4'] },
  5:  { titulo: 'Igualdade de gênero',              desc: 'Alcançar igualdade de gênero e empoderar mulheres.',             metas: ['5.1', '5.5'] },
  8:  { titulo: 'Trabalho decente e crescimento',   desc: 'Promover crescimento econômico e trabalho decente.',             metas: ['8.5', '8.6', '8.8'] },
  9:  { titulo: 'Indústria, inovação e infra',      desc: 'Construir infraestrutura resiliente e inovação.',               metas: ['9.1', '9.4'] },
  10: { titulo: 'Redução das desigualdades',        desc: 'Reduzir desigualdades dentro e entre os países.',               metas: ['10.2', '10.3'] },
  11: { titulo: 'Cidades sustentáveis',             desc: 'Tornar cidades inclusivas, seguras e sustentáveis.',             metas: ['11.3', '11.6'] },
  12: { titulo: 'Consumo e produção responsáveis',  desc: 'Padrões sustentáveis de produção e consumo.',                   metas: ['12.2', '12.5'] },
  13: { titulo: 'Ação contra mudança climática',    desc: 'Combater mudança climática e seus impactos.',                   metas: ['13.1', '13.2'] },
  16: { titulo: 'Paz, justiça e instituições',      desc: 'Promover sociedades pacíficas e instituições eficazes.',        metas: ['16.5', '16.6'] },
  17: { titulo: 'Parcerias para os objetivos',      desc: 'Fortalecer a parceria global para o desenvolvimento.',          metas: ['17.16'] },
};

export function ApendiceBlock({ theme }: { theme: Theme }) {
  const [open, setOpen] = React.useState(false);

  const deltaX = theme.x - theme.baseline.x;
  const deltaY = theme.y - theme.baseline.y;
  const deltaS = (theme.sentimento != null && theme.baseline.sentimento != null)
    ? theme.sentimento - theme.baseline.sentimento : null;

  return (
    <section style={{ padding: '0 32px 36px' }}>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 20px',
            background: open ? '#FAFAFA' : '#fff',
            border: 0, cursor: 'pointer',
            transition: 'background 120ms',
          }}>
          <span style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: '#F4F4F5', color: '#737373',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="file-text" size={14} color="#737373"/>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: '0.10em',
              textTransform: 'uppercase', color: 'var(--hu-muted)', marginBottom: 2,
            }}>Apêndice</div>
            <div style={{
              fontFamily: 'var(--hu-font-display)', fontWeight: 700, fontSize: 15,
              color: '#0A0A0A',
            }}>Contexto normativo · GRI · ODS · IFRS</div>
          </div>
          <span style={{ fontSize: 11.5, color: '#737373', marginRight: 6 }}>
            {open ? 'Recolher' : 'Expandir'}
          </span>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#737373"/>
        </button>

        {open && (
          <div className="hu-fade" style={{
            padding: '20px 24px 24px',
            borderTop: '1px solid var(--hu-border)',
            display: 'flex', flexDirection: 'column', gap: 22,
          }}>
            <div className="mat-apendice-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 16,
            }}>
              <ApendiceCol title="GRI"          icon="file-text" theme={theme} kind="gri"/>
              <ApendiceCol title="ODS"          icon="globe"     theme={theme} kind="ods"/>
              <ApendiceCol title="IFRS S1 / S2" icon="shield"    theme={theme} kind="ifrs"/>
            </div>

            <div className="mat-apendice-bottom" style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr minmax(0, 1fr)',
              gap: 16, alignItems: 'stretch',
            }}>
              <div style={{
                background: '#FCFAFD', borderRadius: 12,
                border: '1px solid var(--hu-border)',
                padding: '16px 18px',
              }}>
                <SectionTitle eyebrow="Contexto">Posição na matriz</SectionTitle>
                <RefMiniMatrix theme={theme}/>
              </div>

              <div style={{
                background: '#FCFAFD', borderRadius: 12,
                border: '1px solid var(--hu-border)',
                padding: '16px 18px',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <SectionTitle eyebrow="Variação vs. Matriz 2024">Posição e sentimento</SectionTitle>
                <DeltaRow label="Relevância Alta Liderança" cur={`${theme.x}%`}              prev={`${theme.baseline.x}%`}              delta={deltaX}/>
                <DeltaRow label="Relevância Stakeholders"   cur={`${theme.y}%`}              prev={`${theme.baseline.y}%`}              delta={deltaY}/>
                <DeltaRow label="Sentimento"                cur={fmtSent(theme.sentimento)}  prev={fmtSent(theme.baseline.sentimento)}  delta={deltaS}/>
              </div>
            </div>

            <style>{`
              @media (max-width: 1080px) {
                .mat-apendice-grid   { grid-template-columns: minmax(0, 1fr) !important; }
                .mat-apendice-bottom { grid-template-columns: minmax(0, 1fr) !important; }
              }
            `}</style>
          </div>
        )}
      </Card>
    </section>
  );
}

function ApendiceCol({
  title,
  icon,
  theme,
  kind,
}: {
  title: string;
  icon: string;
  theme: Theme;
  kind: 'gri' | 'ods' | 'ifrs';
}) {
  return (
    <div style={{
      background: '#FCFAFD', borderRadius: 12,
      border: '1px solid var(--hu-border)',
      padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 12,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          background: '#EFE3F8', color: '#5A0992',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon} size={13} color="#5A0992"/>
        </span>
        <div style={{
          fontFamily: 'var(--hu-font-display)', fontWeight: 700, fontSize: 15,
          color: '#0A0A0A',
        }}>{title}</div>
      </div>
      {kind === 'gri'  && <GRIList theme={theme}/>}
      {kind === 'ods'  && <ODSList theme={theme}/>}
      {kind === 'ifrs' && <IFRSCol theme={theme}/>}
    </div>
  );
}

function GRIList({ theme }: { theme: Theme }) {
  if (theme.gri.length === 0) {
    return <div style={{ fontSize: 12, color: 'var(--hu-muted)', fontStyle: 'italic' }}>
      Sem padrões GRI vinculados.
    </div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {theme.gri.map(g => {
        const d = GRI_DETAILS[g] || { titulo: g, cobertura: 'parcial' as const };
        const cov = d.cobertura;
        const covColor = cov === 'total' ? '#009966' : cov === 'parcial' ? '#B45309' : '#C81E1E';
        return (
          <div key={g} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: '#7401C3' }}/>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A' }}>{g}</span>
              <span style={{ fontSize: 12, color: '#525252' }}>— "{d.titulo}"</span>
            </div>
            <div style={{ paddingLeft: 13, fontSize: 11.5, color: covColor, fontWeight: 600 }}>
              Cobertura: {cov}
            </div>
          </div>
        );
      })}
      <button style={{
        alignSelf: 'flex-start',
        background: 'transparent', border: 0, cursor: 'pointer', padding: 0,
        color: '#5A0992', fontSize: 11.5, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>Ver detalhes <Icon name="arrow-right" size={11} color="#5A0992"/></button>
    </div>
  );
}

function ODSList({ theme }: { theme: Theme }) {
  if (theme.ods.length === 0) {
    return <div style={{ fontSize: 12, color: 'var(--hu-muted)', fontStyle: 'italic' }}>
      Sem ODS vinculados.
    </div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {theme.ods.map(o => {
        const d = ODS_DETAILS[o] || { titulo: `ODS ${o}`, desc: '', metas: [] as string[] };
        return (
          <div key={o} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: '#00A970' }}/>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A' }}>ODS {o}</span>
              <span style={{ fontSize: 12, color: '#525252' }}>— {d.titulo}</span>
            </div>
            <div style={{ paddingLeft: 13, fontSize: 11.5, color: '#525252', lineHeight: 1.45 }}>
              {d.desc}
            </div>
            {d.metas.length > 0 && (
              <div style={{ paddingLeft: 13, fontSize: 11, color: 'var(--hu-muted)' }}>
                Metas tocadas: <b style={{ color: '#525252' }}>{d.metas.join(', ')}</b>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function IFRSCol({ theme }: { theme: Theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 12, color: '#525252', lineHeight: 1.5 }}>
        Conexão com o módulo IFRS deste tema:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <Icon name="arrow-right" size={11} color="#5A0992"/>
          <div style={{ fontSize: 12, color: '#0A0A0A' }}>
            <b style={{ fontWeight: 700 }}>Risco S2 mapeado:</b>{' '}
            {theme.linkIFRS
              ? <span style={{ color: '#B45309' }}>Sim — vinculado à Matriz de Riscos Climáticos.</span>
              : <span style={{ color: 'var(--hu-muted)' }}>Não se aplica</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <Icon name="arrow-right" size={11} color="#5A0992"/>
          <div style={{ fontSize: 12, color: '#0A0A0A' }}>
            <b style={{ fontWeight: 700 }}>Métrica financeira:</b>{' '}
            <span style={{ color: 'var(--hu-muted)' }}>
              {theme.linkIFRS ? 'Em estruturação' : 'Não vinculada'}
            </span>
          </div>
        </div>
      </div>
      {theme.linkIFRS && (
        <button style={{
          alignSelf: 'flex-start',
          background: 'transparent', border: 0, cursor: 'pointer', padding: 0,
          color: '#5A0992', fontSize: 11.5, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>Abrir IFRS <Icon name="arrow-right" size={11} color="#5A0992"/></button>
      )}
      {!theme.linkIFRS && (
        <div style={{
          fontSize: 11.5, color: 'var(--hu-muted)', fontStyle: 'italic',
          paddingTop: 6, borderTop: '1px dashed var(--hu-border)',
        }}>Tema sem vínculo direto com IFRS S1/S2.</div>
      )}
    </div>
  );
}

function DeltaRow({
  label,
  cur,
  prev,
  delta,
}: {
  label: string;
  cur: string;
  prev: string;
  delta: number | null;
}) {
  const tone = delta == null ? '#737373' : delta > 0 ? '#009966' : delta < 0 ? '#C81E1E' : '#737373';
  const arrow = delta == null || delta === 0 ? '·' : delta > 0 ? '↑' : '↓';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto', gap: 14,
      padding: '10px 0', borderBottom: '1px dashed var(--hu-border)',
      alignItems: 'center',
    }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--hu-muted)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--hu-muted)', marginTop: 2 }}>
          <b style={{
            fontFamily: 'var(--hu-font-display)', fontWeight: 900, fontSize: 15,
            color: '#0A0A0A', letterSpacing: '-0.01em',
            fontVariantNumeric: 'tabular-nums', marginRight: 6,
          }}>{cur}</b>
          <span>era {prev}</span>
        </div>
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontWeight: 700, color: tone, fontVariantNumeric: 'tabular-nums',
        background: delta != null && delta !== 0 ? (delta > 0 ? '#DEF7EC' : '#FCE2E2') : '#F4F4F5',
        padding: '4px 10px', borderRadius: 999, fontSize: 12,
      }}>
        <span>{arrow}</span>
        <span>{delta == null ? '—' : Math.abs(delta) + 'pp'}</span>
      </div>
    </div>
  );
}

function RefMiniMatrix({ theme }: { theme: Theme }) {
  const W = 420, H = 280;
  const ML = 36, MR = 14, MT = 14, MB = 28;
  const minA = 35, maxA = 100;
  const px = (v: number) => ML + ((v - minA) / (maxA - minA)) * (W - ML - MR);
  const py = (v: number) => H - MB - ((v - minA) / (maxA - minA)) * (H - MT - MB);

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <rect x={px(75)} y={py(maxA)} width={px(maxA) - px(75)} height={py(65) - py(maxA)} fill="#FAF5FE"/>
        <line x1={px(75)} y1={py(minA)} x2={px(75)} y2={py(maxA)} stroke="#AA95BE" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"/>
        <line x1={px(minA)} y1={py(65)} x2={px(maxA)} y2={py(65)} stroke="#AA95BE" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"/>
        <line x1={px(minA)} y1={py(minA)} x2={px(maxA)} y2={py(minA)} stroke="#0A0A0A" strokeWidth="1"/>
        <line x1={px(minA)} y1={py(minA)} x2={px(minA)} y2={py(maxA)} stroke="#0A0A0A" strokeWidth="1"/>

        {THEMES.filter(t => t.id !== theme.id).map(t => (
          <circle key={t.id} cx={px(t.x)} cy={py(t.y)} r={3.5} fill="#D6D3D1"/>
        ))}
        <circle cx={px(theme.x)} cy={py(theme.y)} r={16} fill={sentColor(theme.sentimento)} opacity={0.18}/>
        <circle cx={px(theme.x)} cy={py(theme.y)} r={9}  fill={sentColor(theme.sentimento)} stroke="#fff" strokeWidth="2"/>
        <text x={px(theme.x)} y={py(theme.y) + 3.5} textAnchor="middle"
          fontFamily="Lato" fontWeight="900" fontSize="10" fill="#fff">
          {String(theme.id).padStart(2, '0')}
        </text>
        <text x={W - MR} y={H - 6} textAnchor="end" fontSize="9.5" fill="#737373">Alta Liderança →</text>
        <text x={6} y={MT - 2} fontSize="9.5" fill="#737373">↑ Stakeholders</text>
      </svg>
    </div>
  );
}
