import React from 'react';
import { Icon, Pill, Btn } from './icons';
import { Card, SectionTitle, EmptyState } from './components';
import {
  THEMES, sentColor, fmtSent,
  kpiStatusText, kpiOnTrackStats,
  iniciativaEmDiaStats, iniciativaDeadlineStatus,
  type Theme, type KPI, type Iniciativa, type SugestaoVinculo,
} from './data';
import { cn } from '~/lib/utils';
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';

/* ===========================================================
   COMENTÁRIOS DOS STAKEHOLDERS
   =========================================================== */

interface CommentItem {
  classificacao: 'Força' | 'Oportunidade' | 'Fraqueza';
  publico: string;
  texto: string;
}

const CLASSIFICACAO_DESC: Record<string, string> = {
  Força:        'Ponto forte identificado nos comentários — algo que já funciona bem.',
  Oportunidade: 'Sugestão de melhoria levantada nos comentários.',
  Fraqueza:     'Ponto fraco ou fragilidade identificada nos comentários.',
};

const COMENTARIOS_INDIVIDUAIS: Record<number, CommentItem[]> = {
  1: [
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'A internet no canteiro cai toda hora. Fico sem conseguir usar o sistema de medição online.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Equipamentos antigos travam na hora errada. Digitalização existe no papel, mas não chega ao campo.' },
    { classificacao: 'Força',        publico: 'Colaboradores', texto: 'A digitalização das medições mudou o jogo — antes era tudo em planilha, agora é bem mais rápido.' },
    { classificacao: 'Oportunidade', publico: 'Fornecedores',  texto: 'Sistema de medição online é avanço, mas quando a rede cai, o atraso é pior que antes.' },
    { classificacao: 'Oportunidade', publico: 'Colaboradores', texto: 'Um roteador 4G em cada canteiro resolveria 90% dos problemas de conectividade.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Suporte de TI leva dias para resolver chamado. Precisamos de atendimento prioritário nas obras.' },
  ],
  2: [
    { classificacao: 'Força',        publico: 'Clientes',      texto: 'A qualidade técnica de entrega superou nossas expectativas — superior ao que vimos em outras construtoras.' },
    { classificacao: 'Força',        publico: 'Clientes',      texto: 'Treinamento de segurança é levado a sério. Transparência nos relatórios de incidentes.' },
    { classificacao: 'Força',        publico: 'Colaboradores', texto: 'Cultura de segurança é real aqui — DDS todo dia, EPI sem exceção.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Pressão de cronograma faz com que às vezes os protocolos sejam relativizados. Isso preocupa.' },
    { classificacao: 'Oportunidade', publico: 'Colaboradores', texto: 'Precisamos de um mestre de segurança próprio nas obras maiores, não terceirizado.' },
    { classificacao: 'Oportunidade', publico: 'Clientes',      texto: 'Institucionalizar pesquisa de qualidade pós-entrega seria um diferencial competitivo.' },
  ],
  3: [
    { classificacao: 'Força',        publico: 'Fornecedores',  texto: 'A empresa não aceita jeitinho — dá orgulho trabalhar com quem tem essa postura.' },
    { classificacao: 'Força',        publico: 'Fornecedores',  texto: 'Contratos claros e pagamentos sem facilidades indevidas constroem confiança de longo prazo.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Tenho dúvida se as denúncias no Canal de Ética têm consequência real. Nunca vejo retorno.' },
    { classificacao: 'Oportunidade', publico: 'Especialistas', texto: 'Publicar o relatório anual do Canal com agregados anonimizados aumentaria a confiança no processo.' },
    { classificacao: 'Oportunidade', publico: 'Colaboradores', texto: 'Treinar as lideranças para lidar com denúncias diretas é essencial para a cultura ética.' },
  ],
  4: [
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'O plano de carreira existe no papel, mas ninguém sabe como subir. Faltam critérios claros.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Avaliações de desempenho são subjetivas — não há alinhamento com o que o RH propõe.' },
    { classificacao: 'Fraqueza',     publico: 'Lideranças',    texto: 'É difícil reter talentos com pressão de entrega e orçamento limitado para reconhecimento.' },
    { classificacao: 'Oportunidade', publico: 'Colaboradores', texto: 'Critérios objetivos e transparentes de promoção mudariam o engajamento no time.' },
    { classificacao: 'Oportunidade', publico: 'Colaboradores', texto: 'Uma trilha de carreira técnica — não só gerencial — faria diferença na retenção.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Auxiliares não enxergam caminho claro de crescimento. Treinamento não vira promoção.' },
  ],
  10: [
    { classificacao: 'Força',        publico: 'Sociedade',     texto: 'A obra atrapalhou o trânsito por meses, mas a comunicação prévia foi correta. Reclamamos menos por isso.' },
    { classificacao: 'Força',        publico: 'Sociedade',     texto: 'A empresa contratou pedreiros da comunidade. Isso fez diferença na nossa região.' },
    { classificacao: 'Força',        publico: 'Sociedade',     texto: 'A empresa patrocinou a reforma da quadra do bairro — ficou ótima.' },
    { classificacao: 'Oportunidade', publico: 'Especialistas', texto: 'Boas práticas de engajamento comunitário, mas sem indicadores de impacto social mensurados.' },
    { classificacao: 'Força',        publico: 'Colaboradores', texto: 'Quando contratamos mão de obra local, a relação com a vizinhança melhora muito.' },
    { classificacao: 'Fraqueza',     publico: 'Sociedade',     texto: 'O barulho fora do horário ainda incomoda, apesar dos avisos.' },
  ],
  11: [
    { classificacao: 'Fraqueza',     publico: 'Fornecedores',  texto: 'Tem gente demais entre o canteiro e a diretoria. Pagamento atrasa por isso, não por falta de dinheiro.' },
    { classificacao: 'Fraqueza',     publico: 'Fornecedores',  texto: 'Oito áreas aprovam uma medição. Reduzi o limite de crédito porque não aguento mais o ciclo.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'A sobreposição de papéis entre Engenharia, Suprimentos e Financeiro gera travamento.' },
    { classificacao: 'Oportunidade', publico: 'Lideranças',    texto: 'Mapear o fluxo atual de aprovações em 60 dias é o primeiro passo para resolver o gargalo.' },
    { classificacao: 'Oportunidade', publico: 'Lideranças',    texto: 'Um piloto em 2 obras de tipologias distintas pode provar o modelo antes do scale.' },
  ],
  16: [
    { classificacao: 'Fraqueza',     publico: 'Especialistas', texto: 'Resíduos ainda vão muito para aterro comum. Faltam parcerias com recicladoras.' },
    { classificacao: 'Fraqueza',     publico: 'Especialistas', texto: 'A logística reversa fica a cargo de cada obra, com resultados muito desiguais.' },
    { classificacao: 'Força',        publico: 'Colaboradores', texto: 'A obra do Centro está com 80% de destinação correta — é o nosso caso de referência.' },
    { classificacao: 'Oportunidade', publico: 'Especialistas', texto: 'Replicar o modelo da obra do Centro nas 5 maiores obras até Dez/2026 é viável.' },
    { classificacao: 'Oportunidade', publico: 'Colaboradores', texto: 'Vincular meta de destinação correta no contrato de subempreiteiras mudaria o comportamento.' },
  ],
  20: [
    { classificacao: 'Fraqueza',     publico: 'Especialistas', texto: 'Não existe ainda um inventário de emissões formal. Estamos no escuro sobre nossa linha de base.' },
    { classificacao: 'Fraqueza',     publico: 'Especialistas', texto: 'O programa Carbono Neutro 2030 é ambicioso, mas falta um caminho concreto e mensurável.' },
    { classificacao: 'Oportunidade', publico: 'Colaboradores', texto: 'Estruturar o inventário GEE agora — a janela regulatória aperta em 2027.' },
    { classificacao: 'Oportunidade', publico: 'Especialistas', texto: 'Adotar trajetória SBTi daria credibilidade externa ao compromisso climático.' },
  ],
  5: [
    { classificacao: 'Força',        publico: 'Colaboradores', texto: 'O programa de ginástica laboral no canteiro faz diferença no dia a dia — menos dor, mais disposição.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Saúde mental quase não é falada aqui. Pressão de obra é alta e não temos suporte psicológico formal.' },
    { classificacao: 'Oportunidade', publico: 'Especialistas', texto: 'Incluir triagem de saúde mental no processo de integração reduziria o absenteísmo a longo prazo.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Ergonomia nas atividades repetitivas de canteiro é ignorada. Muitos colegas têm lesões por esforço.' },
    { classificacao: 'Força',        publico: 'Clientes',      texto: 'A empresa demonstra genuína preocupação com o bem-estar da equipe de campo — isso se reflete na qualidade.' },
  ],
  6: [
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Senhas fracas e compartilhadas ainda são comuns. Falta uma política clara de segurança digital.' },
    { classificacao: 'Oportunidade', publico: 'Especialistas', texto: 'Com o avanço da digitalização das obras, o risco de vazamento de dados aumenta — é hora de estruturar.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Nunca recebi treinamento sobre phishing ou segurança de e-mail. Aprendi sozinho.' },
    { classificacao: 'Oportunidade', publico: 'Lideranças',    texto: 'Uma campanha de conscientização digital semestral teria alto impacto com custo baixo.' },
    { classificacao: 'Força',        publico: 'Colaboradores', texto: 'O novo sistema de autenticação em dois fatores é um passo importante — sentimos mais segurança.' },
  ],
  7: [
    { classificacao: 'Força',        publico: 'Clientes',      texto: 'A transparência nos relatórios financeiros ao longo do projeto é um diferencial claro.' },
    { classificacao: 'Oportunidade', publico: 'Fornecedores',  texto: 'Previsibilidade de caixa e planejamento financeiro de longo prazo beneficiariam toda a cadeia.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Atrasos nos reembolsos de despesas de campo geram desconforto — às vezes espero 60 dias.' },
    { classificacao: 'Força',        publico: 'Lideranças',    texto: 'A disciplina financeira da empresa nos dá segurança para investir em crescimento.' },
    { classificacao: 'Oportunidade', publico: 'Especialistas', texto: 'Vincular metas financeiras a indicadores ESG melhoraria o custo de capital e atrairia investidores.' },
  ],
  8: [
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Treinamentos existem, mas são pontuais e desconectados. Falta uma trilha contínua de aprendizado.' },
    { classificacao: 'Oportunidade', publico: 'Colaboradores', texto: 'Um programa de mentoria interna entre sêniors e juniores teria impacto imediato na retenção.' },
    { classificacao: 'Força',        publico: 'Colaboradores', texto: 'Os cursos de BIM disponibilizados pela empresa abriram portas que eu não esperava.' },
    { classificacao: 'Fraqueza',     publico: 'Lideranças',    texto: 'Gestores não são preparados para desenvolver as equipes — precisam de capacitação em liderança.' },
    { classificacao: 'Oportunidade', publico: 'Especialistas', texto: 'Investir em certificações técnicas aumenta a produtividade e reduz rotatividade — ROI comprovado.' },
  ],
  9: [
    { classificacao: 'Força',        publico: 'Clientes',      texto: 'O atendimento pós-entrega surpreende. Ligam de volta e resolvem sem enrolação.' },
    { classificacao: 'Força',        publico: 'Clientes',      texto: 'Comunicação clara durante a obra, com updates regulares. Isso constrói confiança.' },
    { classificacao: 'Oportunidade', publico: 'Clientes',      texto: 'Um portal digital para acompanhar o andamento da obra em tempo real seria um diferencial enorme.' },
    { classificacao: 'Fraqueza',     publico: 'Clientes',      texto: 'Quando há problema, o primeiro contato é difícil — não fica claro quem é o responsável.' },
    { classificacao: 'Oportunidade', publico: 'Especialistas', texto: 'NPS estruturado e monitorado reduziria perdas de renovação em pelo menos 15%.' },
  ],
  12: [
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Recebo propostas externas com 30% a mais. Fico pela cultura, mas isso tem um limite.' },
    { classificacao: 'Fraqueza',     publico: 'Lideranças',    texto: 'Saímos perdendo profissionais para concorrentes que oferecem flexibilidade que não temos.' },
    { classificacao: 'Oportunidade', publico: 'Colaboradores', texto: 'Employer branding ativo nas universidades de engenharia mudaria o perfil dos candidatos que chegam.' },
    { classificacao: 'Força',        publico: 'Colaboradores', texto: 'A cultura de obra aqui é boa. É o que me manteve quando recebi oferta de ir embora.' },
    { classificacao: 'Oportunidade', publico: 'Especialistas', texto: 'Mapeamento de competências críticas e sucessão para cargos-chave é urgente.' },
  ],
  13: [
    { classificacao: 'Força',        publico: 'Fornecedores',  texto: 'Contratos claros e cumpridos no prazo — isso é raro no setor e nos faz priorizar a Vértice.' },
    { classificacao: 'Fraqueza',     publico: 'Fornecedores',  texto: 'Falta canal de comunicação direto com a obra. Fico ligando para 3 pessoas diferentes.' },
    { classificacao: 'Oportunidade', publico: 'Fornecedores',  texto: 'Um portal de acompanhamento de pedidos e medições economizaria horas por semana.' },
    { classificacao: 'Fraqueza',     publico: 'Fornecedores',  texto: 'Penalidades contratuais desproporcionais para atrasos causados por fatores externos.' },
    { classificacao: 'Força',        publico: 'Colaboradores', texto: 'A exigência de conformidade ética nos fornecedores eleva o padrão de toda a cadeia.' },
  ],
  14: [
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Pouco sei sobre o propósito da empresa além de construir prédios. Nunca foi bem comunicado.' },
    { classificacao: 'Oportunidade', publico: 'Especialistas', texto: 'Propósito claro e autêntico é um fator decisivo para atração de jovens talentos na engenharia.' },
    { classificacao: 'Força',        publico: 'Clientes',      texto: 'A empresa tem um jeito de trabalhar que transmite seriedade e comprometimento com a qualidade.' },
    { classificacao: 'Oportunidade', publico: 'Colaboradores', texto: 'Uma campanha interna sobre o impacto das nossas obras nas comunidades aumentaria o orgulho de pertencer.' },
    { classificacao: 'Fraqueza',     publico: 'Sociedade',     texto: 'Nunca ouvi falar da Vértice antes de eles começarem a obra na minha rua. Deveriam se apresentar.' },
  ],
  15: [
    { classificacao: 'Fraqueza',     publico: 'Especialistas', texto: 'Fornecedores de primeira camada são auditados, mas a segunda camada é completamente opaca.' },
    { classificacao: 'Oportunidade', publico: 'Fornecedores',  texto: 'Critérios ESG claros no processo de qualificação de fornecedores nos ajudariam a melhorar também.' },
    { classificacao: 'Força',        publico: 'Colaboradores', texto: 'A equipe de suprimentos é rigorosa com fornecedores — isso protege a qualidade final da obra.' },
    { classificacao: 'Fraqueza',     publico: 'Especialistas', texto: 'Sem certificação de cadeia responsável, o acesso a certos contratos públicos ficará restrito.' },
    { classificacao: 'Oportunidade', publico: 'Lideranças',    texto: 'Capacitar fornecedores locais em boas práticas cria valor compartilhado e reduz risco de cadeia.' },
  ],
  17: [
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Quase não vejo mulheres em cargos técnicos de obra. A empresa precisa agir mais diretamente nisso.' },
    { classificacao: 'Oportunidade', publico: 'Especialistas', texto: 'Equipes diversas tomam melhores decisões. O setor da construção está muito atrasado nisso.' },
    { classificacao: 'Força',        publico: 'Colaboradores', texto: 'O programa de aprendizes abre portas para jovens que teriam poucas oportunidades — isso me orgulha.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'A linguagem ainda é muito masculina nos comunicados e processos seletivos da empresa.' },
    { classificacao: 'Oportunidade', publico: 'Lideranças',    texto: 'Metas de diversidade com monitoramento real — não só declaração de intenção.' },
  ],
  18: [
    { classificacao: 'Fraqueza',     publico: 'Especialistas', texto: 'Três obras foram impactadas por enchentes nos últimos 2 anos. Ainda não há protocolo de resposta.' },
    { classificacao: 'Oportunidade', publico: 'Especialistas', texto: 'Avaliação de risco climático nos estudos de viabilidade protegeria cronogramas e margens.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'As ondas de calor nas obras em 2025 foram perigosas. Não tivemos nenhuma orientação especial.' },
    { classificacao: 'Oportunidade', publico: 'Lideranças',    texto: 'Vincular o plano de adaptação climática ao módulo IFRS S2 já está no radar — precisamos acelerar.' },
    { classificacao: 'Força',        publico: 'Clientes',      texto: 'A empresa já inclui premissas climáticas em alguns projetos hospitalares — isso é diferencial.' },
  ],
  19: [
    { classificacao: 'Força',        publico: 'Colaboradores', texto: 'O espírito de equipe no canteiro é diferente. Tem gente que fica anos por causa do ambiente.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'Cultura de escritório e de canteiro são mundos separados. Falta integração real entre eles.' },
    { classificacao: 'Oportunidade', publico: 'Lideranças',    texto: 'Rituais de reconhecimento consistentes — mesmo os pequenos — criam pertencimento duradouro.' },
    { classificacao: 'Fraqueza',     publico: 'Colaboradores', texto: 'As lideranças intermediárias não transmitem bem a cultura — tudo depende do gestor direto.' },
    { classificacao: 'Força',        publico: 'Clientes',      texto: 'Percebemos que as equipes são engajadas — isso se traduz em postura proativa em campo.' },
  ],
};

function getComentariosIndividuais(themeId: number): CommentItem[] {
  return COMENTARIOS_INDIVIDUAIS[themeId] || [
    { classificacao: 'Oportunidade', publico: 'Especialistas', texto: 'Tema ainda sem comentários consolidados. Vincule novas fontes de dados em Mapeamentos para alimentar esta análise.' },
  ];
}

export function ComentariosBlock({ theme }: { theme: Theme }) {
  const individuais = getComentariosIndividuais(theme.id);
  const [dimFilter, setDimFilter] = React.useState<'all' | 'Força' | 'Oportunidade' | 'Fraqueza'>('all');
  const [pubFilter, setPubFilter] = React.useState('all');
  const [useful, setUseful] = React.useState<'up' | 'down' | null>(null);

  const publicos = [...new Set(individuais.map(c => c.publico))];

  const filtered = individuais
    .filter(c => dimFilter === 'all' || c.classificacao === dimFilter)
    .filter(c => pubFilter === 'all' || c.publico === pubFilter);

  return (
    <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-3">
      {/* Left: AI Insights — mesma estrutura das páginas de indicadores */}
      <UiCard className="relative self-start overflow-hidden bg-linear-to-br from-primary/8 via-card to-card ring-1 ring-primary/20 lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="sparkles" size={14} color="var(--primary)"/>
            AI Insights
          </CardTitle>
          <CardDescription>
            Síntese consolidada dos comentários deste tema.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Total de comentários
            </div>
            <div className="text-sm text-foreground">
              {individuais.length} comentário{individuais.length === 1 ? '' : 's'} neste tema
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Públicos
            </div>
            <div className="text-sm text-foreground">{publicos.join(', ')}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Distribuição
            </div>
            <div className="flex flex-col gap-1">
              {(['Força', 'Oportunidade', 'Fraqueza'] as const).map(cl => {
                const count = individuais.filter(c => c.classificacao === cl).length;
                if (count === 0) return null;
                return (
                  <div key={cl} className="flex items-center gap-2 text-xs">
                    <Tooltip>
                      <TooltipTrigger render={<span className="cursor-help" />}>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[10px]"
                          style={cl === 'Força' ? { background: '#EFE3F8', color: '#5B21B6' }
                            : cl === 'Oportunidade' ? { background: '#DEF7EC', color: '#065F46' }
                            : { background: '#FEF3C7', color: '#92400E' }}
                        >
                          {cl}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{CLASSIFICACAO_DESC[cl]}</TooltipContent>
                    </Tooltip>
                    <span className="text-muted-foreground">{count} comentário{count === 1 ? '' : 's'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-1 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
            <span>Esta informação foi útil?</span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setUseful(useful === 'up' ? null : 'up')}
              className={useful === 'up' ? 'text-green-600' : ''}
              aria-label="Útil"
            >
              <Icon name="thumbs-up" size={13} color="currentColor"/>
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setUseful(useful === 'down' ? null : 'down')}
              className={useful === 'down' ? 'text-destructive' : ''}
              aria-label="Não útil"
            >
              <Icon name="thumbs-down" size={13} color="currentColor"/>
            </Button>
          </div>
        </CardContent>
      </UiCard>

      {/* Right: individual comments */}
      <div className="flex min-w-0 flex-col gap-3 lg:col-span-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Dimensão:</span>
          <ClassificacaoFilter value={dimFilter} onChange={setDimFilter}/>
          <span className="text-sm font-medium text-muted-foreground">Público:</span>
          <PublicoFilter value={pubFilter} onChange={setPubFilter} options={publicos}/>
        </div>
        <div className="flex flex-col max-h-[600px] overflow-y-auto divide-y divide-border/60 rounded-lg border border-border">
          {filtered.length === 0 ? (
            <EmptyState icon="message"
              title="Sem comentários para este filtro"
              subtitle="Ajuste o filtro de dimensão para ver outros recortes."/>
          ) : filtered.map((c, i) => (
            <ComentarioItem key={i} comment={c}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComentarioItem({ comment }: { comment: CommentItem }) {
  const styles: Record<string, { bg: string; fg: string }> = {
    Força:        { bg: '#EFE3F8', fg: '#5B21B6' },
    Oportunidade: { bg: '#DEF7EC', fg: '#065F46' },
    Fraqueza:     { bg: '#FEF3C7', fg: '#92400E' },
  };
  const s = styles[comment.classificacao] || styles['Força'];
  return (
    <div className="px-4 py-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Tooltip>
          <TooltipTrigger render={<span className="cursor-help" />}>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold"
              style={{ background: s.bg, color: s.fg }}
            >
              {comment.classificacao}
            </span>
          </TooltipTrigger>
          <TooltipContent>{CLASSIFICACAO_DESC[comment.classificacao]}</TooltipContent>
        </Tooltip>
        <span className="text-xs font-semibold text-muted-foreground">{comment.publico}</span>
      </div>
      <div className="text-sm leading-[1.6] text-foreground">{comment.texto}</div>
    </div>
  );
}

function ClassificacaoFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: 'all' | 'Força' | 'Oportunidade' | 'Fraqueza') => void;
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

  const opts: { id: 'all' | 'Força' | 'Oportunidade' | 'Fraqueza'; label: string }[] = [
    { id: 'all',          label: 'Todas as dimensões' },
    { id: 'Força',        label: 'Força' },
    { id: 'Oportunidade', label: 'Oportunidade' },
    { id: 'Fraqueza',     label: 'Fraqueza' },
  ];
  const cur = opts.find(o => o.id === value) || opts[0];

  return (
    <div ref={ref} className="relative min-w-[180px]">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-background cursor-pointer text-sm font-semibold text-foreground/70 w-full"
      >
        <span className="flex-1 text-left">{cur.label}</span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={12} color="#AA95BE"/>
      </button>
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 bg-background rounded-[10px] border border-border shadow-md p-1.5 z-30 min-w-full flex flex-col gap-0.5">
          {opts.map(o => {
            const isActive = o.id === value;
            return (
              <div
                key={o.id}
                onClick={() => { onChange(o.id); setOpen(false); }}
                className={cn(
                  'px-2.5 py-1.5 rounded-md cursor-pointer text-sm hover:bg-muted/50 transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary/80 font-bold'
                    : 'bg-transparent text-muted-foreground font-medium',
                )}
              >
                {o.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PublicoFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
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

  const opts = ['all', ...options];
  const label = (id: string) => id === 'all' ? 'Todos os públicos' : id;
  const cur = opts.includes(value) ? value : 'all';

  return (
    <div ref={ref} className="relative min-w-[180px]">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-background cursor-pointer text-sm font-semibold text-foreground/70 w-full"
      >
        <span className="flex-1 text-left">{label(cur)}</span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={12} color="#AA95BE"/>
      </button>
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 bg-background rounded-[10px] border border-border shadow-md p-1.5 z-30 min-w-full flex flex-col gap-0.5">
          {opts.map(o => {
            const isActive = o === value;
            return (
              <div
                key={o}
                onClick={() => { onChange(o); setOpen(false); }}
                className={cn(
                  'px-2.5 py-1.5 rounded-md cursor-pointer text-sm hover:bg-muted/50 transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary/80 font-bold'
                    : 'bg-transparent text-muted-foreground font-medium',
                )}
              >
                {label(o)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===========================================================
   Legacy data (kept for reference / Apêndice sentimento stats)
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

/* ===========================================================
   KPIs
   =========================================================== */

export function KPIsBlock({
  theme,
  kpis,
}: {
  theme: Theme;
  kpis: KPI[];
}) {
  return (
    <div className="flex flex-col gap-4">
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
    <div className="py-12 px-6 flex flex-col items-center gap-3 text-center">
      <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
        <Icon name={icon} size={26} color="#AA95BE"/>
      </div>
      <div className="text-[15px] font-semibold text-foreground">{title}</div>
      {subtitle && (
        <div className="text-sm text-muted-foreground max-w-[420px] leading-[1.55]">{subtitle}</div>
      )}
      {actions && <div className="flex gap-2 mt-1.5">{actions}</div>}
    </div>
  );
}

function KPITable({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="overflow-x-auto">
      <Table style={{ minWidth: 960 }}>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {['Indicador', 'Responsável', 'Atualizado em', 'Polaridade', 'Atual', 'Meta', 'Diferença', 'Status']
              .map((h, i) => (
                <TableHead
                  key={h}
                  className={cn(
                    'text-xs font-medium text-muted-foreground whitespace-nowrap py-3 px-4',
                    (i >= 4 && i <= 6) && 'text-right',
                  )}
                >{h}</TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {kpis.map(k => (
            <TableRow key={k.id} className="border-b border-border/50">
              <TableCell className="py-3.5 px-4 text-foreground font-semibold">{k.nome}</TableCell>
              <TableCell className="py-3.5 px-4">
                <Resp resp={k.responsavel}/>
              </TableCell>
              <TableCell className="py-3.5 px-4 text-muted-foreground tabular-nums whitespace-nowrap">
                {k.atualizado || '—'}
              </TableCell>
              <TableCell className="py-3.5 px-4">
                <PolaridadeArrow dir={k.polaridade}/>
              </TableCell>
              <TableCell className="py-3.5 px-4 text-right font-bold text-sm text-foreground tabular-nums whitespace-nowrap">
                {k.atual}
              </TableCell>
              <TableCell className={cn('py-3.5 px-4 text-right tabular-nums whitespace-nowrap', k.sem_meta ? 'text-[#AA95BE]' : 'text-muted-foreground')}>
                {k.sem_meta ? '—' : k.meta}
              </TableCell>
              <TableCell className="py-3.5 px-4 text-right whitespace-nowrap">
                <DiffText text={k.diff} tone={k.diffTone}/>
              </TableCell>
              <TableCell className="py-3.5 px-4">
                <KPIStatusCell tone={k.status} label={kpiStatusText(k)}/>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function KPIStatusCell({ tone, label }: { tone: string; label: string }) {
  const map: Record<string, { bg: string; fg: string; icon: string; outlined?: boolean; desc: string }> = {
    success: { bg: '#00A970', fg: '#00875a', icon: '✓', desc: 'Indicador dentro da meta definida.' },
    warning: { bg: '#F59E0B', fg: '#B45309', icon: '⚠', desc: 'Indicador com meta definida, mas em zona de atenção.' },
    danger:  { bg: '#E03131', fg: '#C81E1E', icon: '✗', desc: 'Indicador fora da meta definida.' },
    neutral: { bg: 'transparent', fg: '#737373', icon: '·', outlined: true, desc: 'Ainda não há meta definida para este indicador.' },
  };
  const c = map[tone] || map['neutral'];
  return (
    <Tooltip>
      <TooltipTrigger render={<div className="inline-flex cursor-help items-center gap-2" />}>
        <span
          className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full text-xs font-bold leading-none"
          style={{
            background: c.bg,
            color: c.outlined ? undefined : '#fff',
            border: c.outlined ? '1.5px solid #AA95BE' : 'none',
          }}
        >
          {c.outlined
            ? <span className="text-[#AA95BE]">{c.icon}</span>
            : c.icon}
        </span>
        <span className="text-xs font-semibold whitespace-nowrap" style={{ color: c.fg }}>{label}</span>
      </TooltipTrigger>
      <TooltipContent>{c.desc}</TooltipContent>
    </Tooltip>
  );
}

function Resp({ resp }: { resp?: { iniciais: string; nome: string } | null }) {
  if (!resp) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-2">
      <span className="w-[26px] h-[26px] rounded-full shrink-0 bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] tracking-tight">
        {resp.iniciais}
      </span>
      <span className="text-sm text-foreground">{resp.nome}</span>
    </div>
  );
}

function PolaridadeArrow({ dir }: { dir?: string }) {
  const arrow = dir === 'down' ? '↓' : dir === 'up' ? '↑' : '·';
  const desc  = dir === 'down' ? 'quanto menor melhor' : dir === 'up' ? 'quanto maior melhor' : '';
  return (
    <span title={desc} className="inline-flex items-center justify-center text-muted-foreground text-sm font-semibold">
      {arrow}
    </span>
  );
}

function DiffText({ text, tone }: { text?: string | null; tone?: string }) {
  if (!text) return <span className="text-muted-foreground">—</span>;
  const colorMap: Record<string, string> = {
    danger:  '#C81E1E',
    warning: '#92400E',
    success: '#065F46',
    neutral: '#525252',
  };
  return (
    <span
      className="text-sm font-semibold tabular-nums whitespace-nowrap"
      style={{ color: colorMap[tone || 'neutral'] || colorMap['neutral'] }}
    >{text}</span>
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

  return (
    <div className="flex flex-col gap-4">
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
  const rows: IniciativaWithExtra[] = inics.map(i => ({
    ...i,
    _extra: INICIATIVAS_META[i.id] || ({} as Partial<IniciativaMeta>),
  }));

  return (
    <div className="overflow-x-auto">
      <Table style={{ minWidth: 860 }}>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {['Iniciativa', 'Responsável', 'Prazo', 'Status', 'Progresso'].map(h => (
              <TableHead key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(i => {
            const dl = iniciativaDeadlineStatus(i);
            return (
              <TableRow key={i.id} className="border-b border-border/50">
                <TableCell className="py-3.5 px-4 text-foreground font-semibold">{i.nome}</TableCell>
                <TableCell className="py-3.5 px-4">
                  <Resp resp={i._extra.responsavel}/>
                </TableCell>
                <TableCell className="py-3.5 px-4 text-muted-foreground tabular-nums whitespace-nowrap">
                  {i.prazo}
                </TableCell>
                <TableCell className="py-3.5 px-4 min-w-[200px]">
                  <IniciativaStatusCell i={i} dl={dl}/>
                </TableCell>
                <TableCell className="py-3.5 px-4 min-w-[180px]">
                  <ProgressBar value={i.progresso} status={i.status}/>
                  <PrazoIndicator dl={dl}/>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
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
    <span
      className="inline-flex items-center gap-2 py-1 px-3 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.fg }}
    >
      <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: c.dot }}/>
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
    <div
      className="mt-1.5 text-xs font-medium"
      style={{ color: colors[dl.tone] || '#737373' }}
    >
      {dl.kind === 'completa' ? 'Concluída no prazo'
       : dl.kind === 'indef'  ? 'Prazo a definir'
       : dl.label}
    </div>
  );
}

function ProgressBar({ value, status }: { value: number; status: string }) {
  const color = status === 'completo' ? '#00A970' : status === 'pendente' ? '#AA95BE' : 'var(--primary)';
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-20 h-1.5 rounded-full bg-[#F0F0F0] overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-400"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="font-semibold text-sm text-muted-foreground tabular-nums min-w-[32px] text-right">
        {value}%
      </span>
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
    <div className="flex flex-col gap-0 pt-1 px-1">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="sparkles" size={14} color="#525252"/>
        <span className="text-sm font-semibold text-muted-foreground">{title}</span>
      </div>
      <div className="flex flex-col">
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
  'default':      { primary: 'Vincular',         dot: 'var(--primary)' },
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
    <div className={cn(
      'flex items-start gap-3 py-3 px-1 flex-wrap',
      divider && 'border-b border-border/50',
    )}>
      <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: a.dot }}/>
      <div className="flex-1 min-w-[240px]">
        <div className="text-[13.5px] text-foreground leading-[1.5] mb-0.5">
          <b className="font-semibold">"{s.ref}"</b>
          {s.score != null && (
            <span className="text-muted-foreground ml-2">
              — <b className="text-foreground font-semibold">{s.score}%</b> de similaridade com este tema
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground leading-[1.5]">
          {isKpi && s.atual && s.meta ? (
            <span>Indicador atualmente em <b className="text-foreground">{s.atual}</b> (meta {s.meta}). {s.rationale}</span>
          ) : isKpi && s.atual && !s.meta ? (
            <span>Indicador atualmente em <b className="text-foreground">{s.atual}</b>, sem meta definida. {s.rationale}</span>
          ) : (
            <span>{s.rationale}</span>
          )}
        </div>
      </div>
      <div className="flex gap-3.5 shrink-0 items-center">
        <button onClick={onLink} className="bg-transparent border-0 cursor-pointer p-0 text-primary text-sm font-semibold">
          {a.primary}
        </button>
        {a.secondary && (
          <button onClick={onLink} className="bg-transparent border-0 cursor-pointer p-0 text-primary text-sm font-semibold">
            {a.secondary}
          </button>
        )}
        <button onClick={onDismiss} className="bg-transparent border-0 cursor-pointer p-0 text-muted-foreground text-sm font-medium">
          Dispensar
        </button>
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
    <section className="px-8 pb-9">
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <CollapsibleTrigger
            className={cn(
              'w-full text-left flex items-center gap-3.5 px-5 py-4 border-0 cursor-pointer transition-colors duration-[120ms]',
              open ? 'bg-muted/50' : 'bg-white',
            )}
          >
            <span className="w-8 h-8 rounded-[9px] shrink-0 bg-[#F4F4F5] text-muted-foreground flex items-center justify-center">
              <Icon name="file-text" size={14} color="#737373"/>
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold tracking-[0.10em] uppercase text-muted-foreground mb-0.5">
                Apêndice
              </div>
              <div className="font-bold text-[15px] text-foreground">
                Contexto normativo · GRI · ODS · IFRS
              </div>
            </div>
            <span className="text-xs text-muted-foreground mr-1.5">
              {open ? 'Recolher' : 'Expandir'}
            </span>
            <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#737373"/>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="hu-fade px-6 pt-5 pb-6 border-t border-border flex flex-col gap-[22px]">
              <div className="mat-apendice-grid grid gap-4" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                <ApendiceCol title="GRI"          icon="file-text" theme={theme} kind="gri"/>
                <ApendiceCol title="ODS"          icon="globe"     theme={theme} kind="ods"/>
                <ApendiceCol title="IFRS S1 / S2" icon="shield"    theme={theme} kind="ifrs"/>
              </div>

              <div className="mat-apendice-bottom grid gap-4 items-stretch" style={{ gridTemplateColumns: '1.4fr minmax(0, 1fr)' }}>
                <div className="bg-[#FCFAFD] rounded-xl border border-border px-[18px] py-4">
                  <SectionTitle eyebrow="Contexto">Posição na matriz</SectionTitle>
                  <RefMiniMatrix theme={theme}/>
                </div>

                <div className="bg-[#FCFAFD] rounded-xl border border-border px-[18px] py-4 flex flex-col gap-2.5">
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
          </CollapsibleContent>
        </Card>
      </Collapsible>
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
    <div className="bg-[#FCFAFD] rounded-xl border border-border px-[18px] py-4 flex flex-col gap-3 min-w-0">
      <div className="flex items-center gap-2">
        <span className="w-[26px] h-[26px] rounded-lg shrink-0 bg-primary/10 text-primary flex items-center justify-center">
          <Icon name={icon} size={13} color="var(--primary)"/>
        </span>
        <div className="font-bold text-[15px] text-foreground">{title}</div>
      </div>
      {kind === 'gri'  && <GRIList theme={theme}/>}
      {kind === 'ods'  && <ODSList theme={theme}/>}
      {kind === 'ifrs' && <IFRSCol theme={theme}/>}
    </div>
  );
}

function GRIList({ theme }: { theme: Theme }) {
  if (theme.gri.length === 0) {
    return <div className="text-xs text-muted-foreground italic">Sem padrões GRI vinculados.</div>;
  }
  return (
    <div className="flex flex-col gap-3">
      {theme.gri.map(g => {
        const d = GRI_DETAILS[g] || { titulo: g, cobertura: 'parcial' as const };
        const cov = d.cobertura;
        const covColor = cov === 'total' ? '#009966' : cov === 'parcial' ? '#B45309' : '#C81E1E';
        return (
          <div key={g} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-[5px] h-[5px] rounded-full bg-primary"/>
              <span className="text-sm font-bold text-foreground">{g}</span>
              <span className="text-xs text-muted-foreground">— "{d.titulo}"</span>
            </div>
            <div className="pl-[13px] text-xs font-semibold" style={{ color: covColor }}>
              Cobertura: {cov}
            </div>
          </div>
        );
      })}
      <button className="self-start bg-transparent border-0 cursor-pointer p-0 text-primary/80 text-xs font-semibold inline-flex items-center gap-1">
        Ver detalhes <Icon name="arrow-right" size={11} color="var(--primary)"/>
      </button>
    </div>
  );
}

function ODSList({ theme }: { theme: Theme }) {
  if (theme.ods.length === 0) {
    return <div className="text-xs text-muted-foreground italic">Sem ODS vinculados.</div>;
  }
  return (
    <div className="flex flex-col gap-3.5">
      {theme.ods.map(o => {
        const d = ODS_DETAILS[o] || { titulo: `ODS ${o}`, desc: '', metas: [] as string[] };
        return (
          <div key={o} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-[5px] h-[5px] rounded-full bg-green-600"/>
              <span className="text-sm font-bold text-foreground">ODS {o}</span>
              <span className="text-xs text-muted-foreground">— {d.titulo}</span>
            </div>
            <div className="pl-[13px] text-xs text-muted-foreground leading-[1.45]">
              {d.desc}
            </div>
            {d.metas.length > 0 && (
              <div className="pl-[13px] text-xs text-muted-foreground">
                Metas tocadas: <b className="text-muted-foreground">{d.metas.join(', ')}</b>
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
    <div className="flex flex-col gap-3.5">
      <div className="text-xs text-muted-foreground leading-[1.5]">
        Conexão com o módulo IFRS deste tema:
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <Icon name="arrow-right" size={11} color="var(--primary)"/>
          <div className="text-xs text-foreground">
            <b className="font-bold">Risco S2 mapeado:</b>{' '}
            {theme.linkIFRS
              ? <span className="text-amber-600">Sim — vinculado à Matriz de Riscos Climáticos.</span>
              : <span className="text-muted-foreground">Não se aplica</span>}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Icon name="arrow-right" size={11} color="var(--primary)"/>
          <div className="text-xs text-foreground">
            <b className="font-bold">Métrica financeira:</b>{' '}
            <span className="text-muted-foreground">
              {theme.linkIFRS ? 'Em estruturação' : 'Não vinculada'}
            </span>
          </div>
        </div>
      </div>
      {theme.linkIFRS && (
        <button className="self-start bg-transparent border-0 cursor-pointer p-0 text-primary/80 text-xs font-semibold inline-flex items-center gap-1">
          Abrir IFRS <Icon name="arrow-right" size={11} color="var(--primary)"/>
        </button>
      )}
      {!theme.linkIFRS && (
        <div className="text-xs text-muted-foreground italic pt-1.5 border-t border-dashed border-border">
          Tema sem vínculo direto com IFRS S1/S2.
        </div>
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
    <div className="grid grid-cols-[1fr_auto] gap-3.5 py-2.5 border-b border-dashed border-border items-center">
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          <b className="font-black text-[15px] text-foreground tracking-[-0.01em] tabular-nums mr-1.5">{cur}</b>
          <span>era {prev}</span>
        </div>
      </div>
      <div
        className="inline-flex items-center gap-1 font-bold tabular-nums py-1 px-2.5 rounded-full text-xs"
        style={{
          color: tone,
          background: delta != null && delta !== 0 ? (delta > 0 ? '#DEF7EC' : '#FCE2E2') : '#F4F4F5',
        }}
      >
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
    <div className="relative">
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
