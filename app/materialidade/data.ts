/* Hu360 · Materialidade data layer — TypeScript port of data.jsx */

export const TODAY = new Date('2026-05-12');

export interface Publico {
  id: string;
  label: string;
  short: string;
  icon: string;
  peso: number;
  color: string;
}

export const PUBLICOS: Publico[] = [
  { id: 'interno',        label: 'Colaboradores',  short: 'Colab',   icon: 'users',     peso: 1.0, color: '#7401C3' },
  { id: 'clientes',       label: 'Clientes',       short: 'Client',  icon: 'briefcase', peso: 1.0, color: '#2563EB' },
  { id: 'fornecedores',   label: 'Fornecedores',   short: 'Fornec',  icon: 'plug',      peso: 1.0, color: '#F59E0B' },
  { id: 'sociedade',      label: 'Sociedade',      short: 'Socied',  icon: 'globe',     peso: 1.0, color: '#00A970' },
  { id: 'especialistas',  label: 'Especialistas',  short: 'Espec',   icon: 'shield',    peso: 1.5, color: '#0A3786' },
  { id: 'investidores',   label: 'Investidores',   short: 'Invest',  icon: 'bar-chart', peso: 1.0, color: '#0891B2' },
  { id: 'alta_lideranca', label: 'Alta Liderança', short: 'AltaLid', icon: 'target',    peso: 1.5, color: '#E11D48' },
];

export const PUBLICO_BY_ID: Record<string, Publico> = Object.fromEntries(PUBLICOS.map(p => [p.id, p]));

export const CARGOS: Record<string, { id: string; label: string }[]> = {
  interno: [
    { id: 'eng',    label: 'Engenheiros(as)' },
    { id: 'mestre', label: 'Mestres de obra' },
    { id: 'tec',    label: 'Técnicos(as)' },
    { id: 'admin',  label: 'Analistas administrativos' },
    { id: 'aux',    label: 'Auxiliares de obra' },
    { id: 'gestor', label: 'Gestores(as)' },
  ],
  clientes: [
    { id: 'cpub',  label: 'Clientes públicos' },
    { id: 'cpriv', label: 'Clientes privados' },
    { id: 'incorp',label: 'Incorporadoras' },
  ],
  fornecedores: [
    { id: 'mat', label: 'Fornecedores de materiais' },
    { id: 'sub', label: 'Subcontratados de serviços' },
    { id: 'log', label: 'Logística e transporte' },
  ],
  sociedade: [
    { id: 'comu', label: 'Comunidades do entorno' },
    { id: 'osc',  label: 'Organizações da sociedade civil' },
  ],
  especialistas: [
    { id: 'esg',   label: 'Especialistas em ESG' },
    { id: 'eng_c', label: 'Engenheiros consultores' },
  ],
};

function mkRand(seed: number) {
  let s = (seed | 0) || 1;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

interface PerPublico {
  publico: string;
  relevancia: number;
  sentimento: number | null;
  n_amostra: number;
  impacto_negocio: number;
}

interface PerCargo {
  publico: string;
  cargo: string;
  cargo_label: string;
  relevancia: number | null;
  sentimento: number | null;
  n_amostra: number;
  insuficiente: boolean;
}

interface VersaoPos {
  x: number;
  y: number;
  sentimento: number | null;
}

export interface Theme {
  id: number;
  nome: string;
  descricao: string;
  x: number;
  y: number;
  sentimento: number | null;
  gri: string[];
  ods: number[];
  linkIFRS: boolean;
  esg: 'E' | 'S' | 'G';
  impacto: number;
  financeira: number;
  baseline: VersaoPos;
  por_versao: Record<string, VersaoPos>;
  por_publico: PerPublico[];
  por_cargo: PerCargo[] | null;
  alta_lideranca: { sentimento: number; impacto_negocio: number };
}

const THEME_SEEDS = [
  { id: 1,  nome: 'Processos, tecnologia e infraestrutura',           descricao: 'Modernização da infraestrutura tecnológica e operacional do canteiro e do escritório.',                              x: 97, y: 76, sentimento: -15, gri: ['GRI 3-3'],           ods: [9],     linkIFRS: false, esg: 'G' as const, impacto: 45, financeira: 88 },
  { id: 2,  nome: 'Qualidade e segurança em obras',                   descricao: 'Excelência técnica de entrega e prevenção de acidentes nas obras.',                                                   x: 89, y: 82, sentimento:  28, gri: ['GRI 403'],           ods: [3,11],  linkIFRS: false, esg: 'S' as const, impacto: 82, financeira: 85 },
  { id: 3,  nome: 'Integridade corporativa, ética e transparência',   descricao: 'Cultura de integridade, canal de ética e prevenção a corrupção.',                                                     x: 84, y: 72, sentimento:  14, gri: ['GRI 205','GRI 206'], ods: [16],    linkIFRS: false, esg: 'G' as const, impacto: 58, financeira: 76 },
  { id: 4,  nome: 'Gestão de Pessoas',                                descricao: 'Plano de carreira, reconhecimento, remuneração e desenvolvimento profissional.',                                       x: 91, y: 69, sentimento: -27, gri: ['GRI 401'],           ods: [8],     linkIFRS: false, esg: 'S' as const, impacto: 71, financeira: 80 },
  { id: 5,  nome: 'Saúde e bem-estar dos colaboradores',              descricao: 'Programas de saúde física e mental, ergonomia e qualidade de vida.',                                                  x: 79, y: 73, sentimento:   6, gri: ['GRI 403'],           ods: [3],     linkIFRS: false, esg: 'S' as const, impacto: 78, financeira: 68 },
  { id: 6,  nome: 'Segurança da informação',                          descricao: 'Proteção de dados, controle de acesso e continuidade de serviços críticos.',                                          x: 88, y: 69, sentimento:   5, gri: ['GRI 418'],           ods: [16],    linkIFRS: false, esg: 'G' as const, impacto: 52, financeira: 82 },
  { id: 7,  nome: 'Gestão financeira',                                descricao: 'Disciplina financeira, gestão de capital e previsibilidade de resultados.',                                           x: 85, y: 67, sentimento:  21, gri: ['GRI 201'],           ods: [8],     linkIFRS: false, esg: 'G' as const, impacto: 38, financeira: 95 },
  { id: 8,  nome: 'Desenvolvimento dos colaboradores',                descricao: 'Capacitação técnica, requalificação e trilhas de aprendizagem.',                                                      x: 72, y: 66, sentimento:  18, gri: ['GRI 404'],           ods: [4,8],   linkIFRS: false, esg: 'S' as const, impacto: 65, financeira: 62 },
  { id: 9,  nome: 'Relacionamento com clientes e comunicação',        descricao: 'Comunicação clara com clientes e acompanhamento do ciclo de entrega.',                                                x: 74, y: 71, sentimento:  12, gri: [],                   ods: [12,17], linkIFRS: false, esg: 'S' as const, impacto: 60, financeira: 72 },
  { id: 10, nome: 'Impacto nas comunidades do entorno',               descricao: 'Mitigação de impactos de obra e geração de valor para a vizinhança.',                                                 x: 62, y: 63, sentimento:  33, gri: ['GRI 413'],           ods: [11],    linkIFRS: false, esg: 'S' as const, impacto: 88, financeira: 55 },
  { id: 11, nome: 'Estrutura organizacional',                         descricao: 'Desenho organizacional, governança interna e fluxos decisórios.',                                                     x: 74, y: 68, sentimento: -47, gri: ['GRI 2-9'],           ods: [16],    linkIFRS: false, esg: 'G' as const, impacto: 42, financeira: 78 },
  { id: 12, nome: 'Retenção e atração de talentos',                   descricao: 'Marca empregadora, retenção e estratégia de atração no mercado.',                                                     x: 75, y: 66, sentimento:  -8, gri: ['GRI 401'],           ods: [8],     linkIFRS: false, esg: 'S' as const, impacto: 55, financeira: 74 },
  { id: 13, nome: 'Relacionamento com fornecedores e subcontratados', descricao: 'Parceria de longo prazo com fornecedores e padrões compartilhados.',                                                  x: 70, y: 64, sentimento:  11, gri: ['GRI 204','GRI 308'], ods: [8,12],  linkIFRS: false, esg: 'G' as const, impacto: 62, financeira: 65 },
  { id: 14, nome: 'Comunicação do propósito organizacional',          descricao: 'Clareza do propósito interno e externo da organização.',                                                              x: 72, y: 65, sentimento:  41, gri: [],                   ods: [12],    linkIFRS: false, esg: 'G' as const, impacto: 48, financeira: 50 },
  { id: 15, nome: 'Cadeia de fornecimento responsável',               descricao: 'Critérios ESG na qualificação e auditoria de fornecedores.',                                                          x: 66, y: 61, sentimento:  -3, gri: ['GRI 308','GRI 414'], ods: [12],    linkIFRS: false, esg: 'E' as const, impacto: 74, financeira: 60 },
  { id: 16, nome: 'Gestão de resíduos de construção',                 descricao: 'Destinação adequada de resíduos de obra e logística reversa.',                                                        x: 76, y: 59, sentimento: -12, gri: ['GRI 306'],           ods: [11,12], linkIFRS: false, esg: 'E' as const, impacto: 85, financeira: 58 },
  { id: 17, nome: 'Diversidade, equidade e inclusão',                 descricao: 'DE&I no quadro próprio, na liderança e na cadeia de subcontratados.',                                                 x: 65, y: 62, sentimento:   9, gri: ['GRI 405','GRI 406'], ods: [5,10],  linkIFRS: false, esg: 'S' as const, impacto: 79, financeira: 52 },
  { id: 18, nome: 'Adaptação a mudanças climáticas',                  descricao: 'Riscos climáticos físicos sobre obras, supply chain e cronogramas.',                                                  x: 78, y: 60, sentimento:  -8, gri: ['GRI 201-2'],         ods: [13],    linkIFRS: true,  esg: 'E' as const, impacto: 72, financeira: 77 },
  { id: 19, nome: 'Cultura Organizacional',                           descricao: 'Valores vividos no dia a dia e clima de cooperação entre áreas.',                                                    x: 73, y: 68, sentimento:  15, gri: ['GRI 2-23'],          ods: [8],     linkIFRS: false, esg: 'G' as const, impacto: 44, financeira: 66 },
  { id: 20, nome: 'Emissão de gases de efeito estufa',                descricao: 'Inventário e trajetória de redução de emissões Escopo 1, 2 e 3.',                                                    x: 68, y: 58, sentimento: -22, gri: ['GRI 305'],           ods: [13],    linkIFRS: true,  esg: 'E' as const, impacto: 92, financeira: 70 },
];

function makeBaseline(theme: typeof THEME_SEEDS[0], rand: () => number): VersaoPos {
  return {
    x: Math.max(35, Math.min(100, theme.x + Math.round((rand() - 0.5) * 10))),
    y: Math.max(35, Math.min(100, theme.y + Math.round((rand() - 0.5) * 10))),
    sentimento: theme.sentimento != null
      ? Math.max(-100, Math.min(100, theme.sentimento + Math.round((rand() - 0.5) * 24)))
      : null,
  };
}

function makeProjection(theme: typeof THEME_SEEDS[0], _baseline: VersaoPos, rand: () => number): VersaoPos {
  const themeHasIni = [1, 4, 11, 16, 20, 18, 3, 5, 2].includes(theme.id);
  const drift = themeHasIni ? 6 : -2;
  return {
    x: Math.max(35, Math.min(100, theme.x + Math.round((rand() - 0.5) * 6))),
    y: Math.max(35, Math.min(100, theme.y + Math.round((rand() - 0.5) * 8))),
    sentimento: theme.sentimento != null
      ? Math.max(-100, Math.min(100, theme.sentimento + drift + Math.round((rand() - 0.5) * 10)))
      : null,
  };
}

function makePerPublico(theme: typeof THEME_SEEDS[0], rand: () => number): PerPublico[] {
  // alta_lideranca is stored in theme.alta_lideranca — exclude from por_publico
  return PUBLICOS.filter(pub => pub.id !== 'alta_lideranca').map(pub => {
    let relevancia = theme.y + Math.round((rand() - 0.5) * 16);
    let sentimento: number | null = theme.sentimento != null ? theme.sentimento + Math.round((rand() - 0.5) * 20) : null;
    let n_amostra = 20 + Math.round(rand() * 180);
    let impacto_negocio = theme.x + Math.round((rand() - 0.5) * 22);

    if (pub.id === 'interno' && theme.sentimento != null && theme.sentimento < 0) sentimento = sentimento! - 8;
    if (pub.id === 'especialistas') { relevancia += 5; sentimento = null; impacto_negocio += 8; }
    if (pub.id === 'fornecedores') impacto_negocio -= 6;
    if (pub.id === 'sociedade') impacto_negocio -= 10;
    if (theme.id === 10 && pub.id === 'sociedade') { sentimento = (theme.sentimento || 0) + 45; impacto_negocio += 18; }
    if (theme.id === 11 && pub.id === 'fornecedores') { sentimento = -78; impacto_negocio = 82; }
    if (theme.id === 4 && pub.id === 'interno') sentimento = -38;
    if (theme.id === 20 && pub.id === 'especialistas') impacto_negocio = 96;
    if (theme.id === 18 && pub.id === 'especialistas') impacto_negocio = 92;

    // Investidores: foco em conformidade regulatória, governança e risco climático
    if (pub.id === 'investidores') {
      n_amostra = 8 + Math.round(rand() * 25);
      if ([7, 3, 6, 11].includes(theme.id)) relevancia += 12;
      if ([18, 20].includes(theme.id)) { relevancia += 15; if (sentimento != null) sentimento -= 12; }
      if ([8, 10, 14, 17].includes(theme.id)) relevancia -= 10;
      if (theme.id === 11 && sentimento != null) sentimento -= 25;
      if (theme.id === 7  && sentimento != null) sentimento += 20;
      if (theme.id === 20 && sentimento != null) sentimento -= 18;
      if (theme.id === 1  && sentimento != null) sentimento -= 8;
    }

    relevancia = Math.max(35, Math.min(100, relevancia));
    impacto_negocio = Math.max(30, Math.min(100, impacto_negocio));
    if (sentimento != null) sentimento = Math.max(-100, Math.min(100, sentimento));

    return { publico: pub.id, relevancia, sentimento, n_amostra, impacto_negocio };
  });
}

function makePerCargo(themeId: number, themeSent: number | null, rand: () => number): PerCargo[] | null {
  if (![1, 4, 11].includes(themeId) || themeSent == null) return null;
  return CARGOS.interno.map(c => {
    let relevancia = (themeSent < 0 ? 72 : 65) + Math.round((rand() - 0.5) * 18);
    let sentimento = themeSent + Math.round((rand() - 0.5) * 22);
    let n_amostra = 3 + Math.round(rand() * 62);

    if (c.id === 'aux' && themeSent < 0) sentimento -= 12;
    if (c.id === 'gestor') sentimento += 8;
    if (themeId === 4 && c.id === 'aux') n_amostra = 4;
    if (themeId === 11 && c.id === 'tec') n_amostra = 3;

    relevancia = Math.max(35, Math.min(100, relevancia));
    sentimento = Math.max(-100, Math.min(100, sentimento));
    const insuficiente = n_amostra < 5;
    return {
      publico: 'interno', cargo: c.id, cargo_label: c.label,
      relevancia: insuficiente ? null : relevancia,
      sentimento: insuficiente ? null : sentimento,
      n_amostra, insuficiente,
    };
  });
}

function makeAltaLideranca(theme: typeof THEME_SEEDS[0]) {
  let sent: number;
  if (theme.x >= 90)      sent = 70 + Math.round((theme.x - 90) * 2.5);
  else if (theme.x >= 80) sent = 45 + Math.round((theme.x - 80) * 2);
  else if (theme.x >= 70) sent = 20 + Math.round((theme.x - 70));
  else                    sent = -5 + Math.round((theme.x - 65) * 1.5);
  sent = Math.max(-100, Math.min(100, sent));
  if (theme.id === 4)  sent = 88;
  if (theme.id === 1)  sent = 97;
  if (theme.id === 11) sent = 64;
  if (theme.id === 20) sent = 58;
  if (theme.id === 18) sent = 52;
  return { sentimento: sent, impacto_negocio: theme.x };
}

export const THEMES: Theme[] = THEME_SEEDS.map(t => {
  const rand = mkRand(t.id * 137 + 7);
  const baseline = makeBaseline(t, rand);
  const projection = makeProjection(t, baseline, rand);
  return {
    ...t,
    baseline,
    por_versao: {
      v2024: baseline,
      v2025: { x: t.x, y: t.y, sentimento: t.sentimento },
      v2026: projection,
    },
    por_publico: makePerPublico(t, rand),
    por_cargo: makePerCargo(t.id, t.sentimento, rand),
    alta_lideranca: makeAltaLideranca(t),
  };
});

export const THEME_BY_ID: Record<number, Theme> = Object.fromEntries(THEMES.map(t => [t.id, t]));

export const CITACOES: Record<number, { texto: string; publico: string; classificacao: string }[]> = {
  1: [
    { texto: 'Os sistemas das obras vivem caindo. Perco 2 horas por dia esperando o pessoal de TI resolver coisas básicas.', publico: 'interno', classificacao: 'Fraqueza' },
    { texto: 'A digitalização das medições mudou o jogo no canteiro. Agora temos previsibilidade real.', publico: 'interno', classificacao: 'Força' },
    { texto: 'A empresa investe em tecnologia, mas a infra de campo ainda é precária — internet ruim, equipamentos antigos.', publico: 'interno', classificacao: 'Fraqueza' },
  ],
  4: [
    { texto: 'O plano de carreira existe no papel, mas ninguém sabe como subir de fato. Quem promove é quem grita mais.', publico: 'interno', classificacao: 'Fraqueza' },
    { texto: 'Faltam critérios claros para avaliação de desempenho. As promoções parecem políticas, não técnicas.', publico: 'interno', classificacao: 'Fraqueza' },
    { texto: 'O programa de treinamento técnico melhorou muito nos últimos dois anos.', publico: 'interno', classificacao: 'Força' },
    { texto: 'Os benefícios são bons, mas o reconhecimento informal é raro.', publico: 'interno', classificacao: 'Fraqueza' },
  ],
  11: [
    { texto: 'Tem gente demais entre o canteiro e a diretoria. A decisão demora demais.', publico: 'interno', classificacao: 'Fraqueza' },
    { texto: 'Pagamentos atrasam porque tem oito áreas envolvidas em aprovar uma medição.', publico: 'fornecedores', classificacao: 'Fraqueza' },
    { texto: 'Cada obra tem sua própria forma de fazer as coisas. Falta padrão.', publico: 'interno', classificacao: 'Fraqueza' },
  ],
  3: [
    { texto: 'O canal de ética existe e é divulgado. Mas tenho dúvida se as denúncias têm consequência real.', publico: 'interno', classificacao: 'Fraqueza' },
    { texto: 'A empresa não aceita "jeitinho" — isso é raro no setor e dá orgulho.', publico: 'interno', classificacao: 'Força' },
    { texto: 'Sentimos a postura ética no relacionamento. Não temos episódios de favorecimento.', publico: 'fornecedores', classificacao: 'Força' },
  ],
  16: [
    { texto: 'Resíduos ainda vão muito para aterro comum. Faltam parcerias com recicladoras.', publico: 'especialistas', classificacao: 'Fraqueza' },
    { texto: 'A obra do Centro está com 80% de destinação correta — mas as outras não acompanham.', publico: 'interno', classificacao: 'Fraqueza' },
  ],
  20: [
    { texto: 'Não existe ainda um inventário de emissões formal. Estamos no escuro.', publico: 'especialistas', classificacao: 'Fraqueza' },
    { texto: 'O programa Carbono Neutro 2030 é ambicioso, mas falta caminho concreto até lá.', publico: 'interno', classificacao: 'Fraqueza' },
  ],
  10: [
    { texto: 'A obra atrapalhou o trânsito por meses, mas a comunicação prévia foi correta. Reclamamos menos por isso.', publico: 'sociedade', classificacao: 'Força' },
    { texto: 'A empresa contratou pedreiros da comunidade. Isso fez diferença na nossa região.', publico: 'sociedade', classificacao: 'Força' },
  ],
  2: [
    { texto: 'A qualidade da entrega da última obra superou expectativas — superior ao mercado.', publico: 'clientes', classificacao: 'Força' },
    { texto: 'Treinamento de segurança é levado a sério. Vi muita diferença vs. outras empresas.', publico: 'interno', classificacao: 'Força' },
  ],
};

export const FONTES: Record<string, { label: string; icon: string; short: string }> = {
  pesquisa_clima:        { label: 'Pesquisa de Clima 2025',      icon: 'pie-chart',   short: 'Pesquisa de Clima' },
  nps_clientes:          { label: 'NPS de Clientes',              icon: 'thermometer', short: 'NPS de Clientes' },
  ouvidoria:             { label: 'Canal de Ouvidoria',           icon: 'message',     short: 'Ouvidoria' },
  pesquisa_fornecedores: { label: 'Satisfação de Fornecedores',   icon: 'plug',        short: 'Pesq. Fornecedores' },
  pulse_comunidades:     { label: 'Pulse Comunidades',            icon: 'globe',       short: 'Pulse Comunidades' },
};

export interface Sinal {
  fonte: string;
  data: string;
  sentimento: number;
  n_mencoes: number;
}

export const SINAIS: Record<number, Sinal[]> = {
  1:  [
    { fonte: 'pesquisa_clima', data: '2025-12', sentimento: -8,  n_mencoes: 142 },
    { fonte: 'pesquisa_clima', data: '2026-04', sentimento: -19, n_mencoes: 178 },
    { fonte: 'ouvidoria',      data: '2026-03', sentimento: -22, n_mencoes: 28  },
  ],
  4:  [
    { fonte: 'pesquisa_clima', data: '2025-12', sentimento: -23, n_mencoes: 312 },
    { fonte: 'pesquisa_clima', data: '2026-04', sentimento: -31, n_mencoes: 345 },
    { fonte: 'ouvidoria',      data: '2026-02', sentimento: -41, n_mencoes: 54  },
    { fonte: 'ouvidoria',      data: '2026-04', sentimento: -38, n_mencoes: 47  },
  ],
  11: [
    { fonte: 'pesquisa_clima',        data: '2025-12', sentimento: -42, n_mencoes: 188 },
    { fonte: 'pesquisa_clima',        data: '2026-04', sentimento: -49, n_mencoes: 213 },
    { fonte: 'pesquisa_fornecedores', data: '2026-01', sentimento: -68, n_mencoes: 89  },
    { fonte: 'pesquisa_fornecedores', data: '2026-04', sentimento: -86, n_mencoes: 102 },
    { fonte: 'ouvidoria',             data: '2026-03', sentimento: -55, n_mencoes: 19  },
  ],
  2:  [
    { fonte: 'nps_clientes',  data: '2026-01', sentimento: 32, n_mencoes: 87  },
    { fonte: 'nps_clientes',  data: '2026-04', sentimento: 38, n_mencoes: 95  },
    { fonte: 'pesquisa_clima',data: '2026-04', sentimento: 22, n_mencoes: 156 },
  ],
  16: [{ fonte: 'pesquisa_clima', data: '2026-04', sentimento: -8,  n_mencoes: 67 }],
  20: [{ fonte: 'pesquisa_clima', data: '2026-04', sentimento: -18, n_mencoes: 41 }],
  10: [
    { fonte: 'pulse_comunidades', data: '2026-02', sentimento: 28, n_mencoes: 64 },
    { fonte: 'pulse_comunidades', data: '2026-04', sentimento: 35, n_mencoes: 71 },
  ],
};

export interface Iniciativa {
  id: number;
  tema_id: number;
  nome: string;
  owner: string;
  status: 'andamento' | 'pendente' | 'completo';
  progresso: number;
  prazo: string;
}

export const INICIATIVAS: Iniciativa[] = [
  { id: 101, tema_id: 1,  nome: 'Programa de Digitalização de Obras',         owner: 'Carlos Mendes · CIO',         status: 'andamento', progresso: 65,  prazo: '12/2026' },
  { id: 102, tema_id: 1,  nome: 'Renovação da rede de campo (40 obras)',      owner: 'Carlos Mendes · CIO',         status: 'pendente',  progresso: 10,  prazo: '06/2027' },
  { id: 103, tema_id: 3,  nome: 'Comitê de Ética e Transparência',            owner: 'Ana Beatriz · Compliance',    status: 'completo',  progresso: 100, prazo: '01/2026' },
  { id: 104, tema_id: 4,  nome: 'Plano de Carreira 2026',                     owner: 'Patricia Lemos · CHRO',       status: 'pendente',  progresso: 5,   prazo: '03/2026' },
  { id: 105, tema_id: 4,  nome: 'Programa de Reconhecimento Contínuo',        owner: 'Patricia Lemos · CHRO',       status: 'andamento', progresso: 35,  prazo: '09/2026' },
  { id: 106, tema_id: 5,  nome: 'Programa Saúde +',                           owner: 'Renato Silva · Diretor SSMA', status: 'andamento', progresso: 40,  prazo: '12/2026' },
  { id: 107, tema_id: 16, nome: 'Gestão de Resíduos Certificada (ISO 14001)', owner: 'Renato Silva · Diretor SSMA', status: 'andamento', progresso: 70,  prazo: '03/2027' },
  { id: 108, tema_id: 18, nome: 'Mapeamento de Riscos Climáticos Físicos',    owner: 'Marcelo Santos · Sustentab.', status: 'andamento', progresso: 30,  prazo: '10/2026' },
  { id: 109, tema_id: 20, nome: 'Programa Carbono Neutro 2030',               owner: 'Marcelo Santos · Sustentab.', status: 'andamento', progresso: 15,  prazo: '12/2030' },
  { id: 110, tema_id: 11, nome: 'Redesenho da Cadeia de Aprovações',          owner: 'Eduardo Castro · COO',        status: 'pendente',  progresso: 0,   prazo: '06/2026' },
];

export const RESP_KPI: Record<string, { iniciais: string; nome: string }> = {
  CM: { iniciais: 'CM', nome: 'Carlos Mendes' },
  RS: { iniciais: 'RS', nome: 'Renato Silva' },
  AB: { iniciais: 'AB', nome: 'Ana Beatriz' },
  PL: { iniciais: 'PL', nome: 'Patricia Lemos' },
  MA: { iniciais: 'MA', nome: 'Marcos Andrade' },
  RF: { iniciais: 'RF', nome: 'Roberto Ferraz' },
  JC: { iniciais: 'JC', nome: 'Juliana Costa' },
  MS: { iniciais: 'MS', nome: 'Marcelo Santos' },
  EC: { iniciais: 'EC', nome: 'Eduardo Castro' },
};

export const PERSP_TEMA: Record<number, string> = {
  1: 'Processos', 2: 'Pessoas', 3: 'Stakeholders', 4: 'Pessoas',
  5: 'Pessoas',   6: 'Processos', 7: 'Financeiro', 8: 'Pessoas',
  9: 'Stakeholders', 10: 'Sustentabilidade', 11: 'Processos', 12: 'Pessoas',
  13: 'Stakeholders', 14: 'Stakeholders', 15: 'Sustentabilidade', 16: 'Sustentabilidade',
  17: 'Pessoas', 18: 'Sustentabilidade', 19: 'Pessoas', 20: 'Sustentabilidade',
};

export interface KPI {
  id: number;
  tema_id: number;
  nome: string;
  atual: string;
  meta: string | null;
  status: 'success' | 'warning' | 'danger' | 'neutral';
  tendencia: 'up' | 'down' | 'flat';
  responsavel: { iniciais: string; nome: string };
  atualizado: string;
  polaridade: 'up' | 'down';
  diff: string | null;
  diffTone: string;
  perspectiva: string;
  sem_meta: boolean;
}

export const KPIS: KPI[] = ([
  { id: 1001, tema_id: 1,  nome: 'Disponibilidade dos sistemas de obra',              atual: '94,2%',    meta: '99%',          status: 'warning', tendencia: 'flat', responsavel: RESP_KPI.CM, atualizado: '12/05/2026', polaridade: 'up',   diff: '↓ −4,8pp',    diffTone: 'warning' },
  { id: 1002, tema_id: 1,  nome: 'Tempo médio de aprovação digital',                  atual: '4,2 dias', meta: '< 2 dias',     status: 'danger',  tendencia: 'up',   responsavel: RESP_KPI.CM, atualizado: '08/05/2026', polaridade: 'down', diff: '↑ +2,2 dias',  diffTone: 'danger' },
  { id: 1003, tema_id: 1,  nome: '% de obras com BIM implementado',                   atual: '35%',      meta: '60%',          status: 'danger',  tendencia: 'up',   responsavel: RESP_KPI.EC, atualizado: '02/05/2026', polaridade: 'up',   diff: '↓ −25pp',      diffTone: 'danger' },
  { id: 1004, tema_id: 2,  nome: 'Taxa de Frequência de Acidentes (TF)',              atual: '4,1',      meta: '< 3,0',        status: 'danger',  tendencia: 'flat', responsavel: RESP_KPI.RS, atualizado: '05/05/2026', polaridade: 'down', diff: '↑ +1,1',       diffTone: 'danger' },
  { id: 1005, tema_id: 2,  nome: 'Índice de Qualidade de Obras (IQO)',                atual: '8,7',      meta: '> 8,5',        status: 'success', tendencia: 'up',   responsavel: RESP_KPI.RS, atualizado: '02/05/2026', polaridade: 'up',   diff: '↑ +0,2',       diffTone: 'success' },
  { id: 1006, tema_id: 2,  nome: 'Não conformidades por auditoria',                   atual: '12',       meta: '< 8',          status: 'warning', tendencia: 'down', responsavel: RESP_KPI.RS, atualizado: '06/05/2026', polaridade: 'down', diff: '↑ +4',         diffTone: 'warning' },
  { id: 1007, tema_id: 3,  nome: 'Casos abertos no Canal de Ética',                   atual: '12',       meta: '< 20',         status: 'success', tendencia: 'flat', responsavel: RESP_KPI.AB, atualizado: '01/05/2026', polaridade: 'down', diff: '↓ −8',         diffTone: 'success' },
  { id: 1008, tema_id: 3,  nome: '% de fornecedores com due diligence concluída',     atual: '78%',      meta: '95%',          status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.AB, atualizado: '28/04/2026', polaridade: 'up',   diff: '↓ −17pp',      diffTone: 'warning' },
  { id: 1009, tema_id: 3,  nome: 'Treinamento de Compliance (% colaboradores)',       atual: '92%',      meta: '> 90%',        status: 'success', tendencia: 'up',   responsavel: RESP_KPI.AB, atualizado: '30/04/2026', polaridade: 'up',   diff: '↑ +2pp',       diffTone: 'success' },
  { id: 1010, tema_id: 4,  nome: 'Turnover voluntário (12m)',                         atual: '23,8%',    meta: '< 15%',        status: 'danger',  tendencia: 'up',   responsavel: RESP_KPI.PL, atualizado: '31/03/2026', polaridade: 'down', diff: '↑ +8,8pp',     diffTone: 'danger' },
  { id: 1011, tema_id: 4,  nome: 'Engajamento (eNPS)',                                atual: '12',       meta: '> 30',         status: 'danger',  tendencia: 'down', responsavel: RESP_KPI.PL, atualizado: '15/04/2026', polaridade: 'up',   diff: '↓ −18',        diffTone: 'danger' },
  { id: 1012, tema_id: 4,  nome: '% colaboradores com PDI ativo',                    atual: '45%',      meta: '> 70%',        status: 'danger',  tendencia: 'flat', responsavel: RESP_KPI.PL, atualizado: '10/05/2026', polaridade: 'up',   diff: '↓ −25pp',      diffTone: 'danger' },
  { id: 1013, tema_id: 5,  nome: 'Absenteísmo médio (dias/colaborador)',              atual: '8,4',      meta: '< 5',          status: 'danger',  tendencia: 'up',   responsavel: RESP_KPI.RS, atualizado: '02/05/2026', polaridade: 'down', diff: '↑ +3,4',       diffTone: 'danger' },
  { id: 1014, tema_id: 5,  nome: 'Adesão ao programa de saúde mental',               atual: '38%',      meta: '> 50%',        status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.PL, atualizado: '28/04/2026', polaridade: 'up',   diff: '↓ −12pp',      diffTone: 'warning' },
  { id: 1015, tema_id: 5,  nome: '% colaboradores em check-up anual',                atual: '67%',      meta: '> 80%',        status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.RS, atualizado: '03/05/2026', polaridade: 'up',   diff: '↓ −13pp',      diffTone: 'warning' },
  { id: 1016, tema_id: 6,  nome: 'Incidentes de segurança da informação',            atual: '2',        meta: '0',            status: 'warning', tendencia: 'down', responsavel: RESP_KPI.MA, atualizado: '28/04/2026', polaridade: 'down', diff: '↑ +2',         diffTone: 'warning' },
  { id: 1017, tema_id: 6,  nome: '% de sistemas com MFA habilitado',                 atual: '94%',      meta: '100%',         status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.MA, atualizado: '05/05/2026', polaridade: 'up',   diff: '↓ −6pp',       diffTone: 'warning' },
  { id: 1018, tema_id: 6,  nome: 'Tempo médio de resposta a incidentes (h)',         atual: '6,2',      meta: '< 4',          status: 'warning', tendencia: 'down', responsavel: RESP_KPI.MA, atualizado: '01/05/2026', polaridade: 'down', diff: '↑ +2,2',       diffTone: 'warning' },
  { id: 1019, tema_id: 7,  nome: 'EBITDA Margin',                                    atual: '14,8%',    meta: '> 16%',        status: 'warning', tendencia: 'flat', responsavel: RESP_KPI.RF, atualizado: '30/04/2026', polaridade: 'up',   diff: '↓ −1,2pp',     diffTone: 'warning' },
  { id: 1020, tema_id: 7,  nome: 'Prazo médio de recebimento (dias)',                atual: '67',       meta: '< 60',         status: 'warning', tendencia: 'flat', responsavel: RESP_KPI.RF, atualizado: '02/05/2026', polaridade: 'down', diff: '↑ +7',         diffTone: 'warning' },
  { id: 1021, tema_id: 7,  nome: 'Endividamento líquido / EBITDA',                   atual: '2,3',      meta: '< 2,5',        status: 'success', tendencia: 'flat', responsavel: RESP_KPI.RF, atualizado: '30/04/2026', polaridade: 'down', diff: '↓ −0,2',       diffTone: 'success' },
  { id: 1022, tema_id: 8,  nome: 'Horas de treinamento por colaborador (anual)',     atual: '32',       meta: '> 40',         status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.PL, atualizado: '02/05/2026', polaridade: 'up',   diff: '↓ −8',         diffTone: 'warning' },
  { id: 1023, tema_id: 8,  nome: '% colaboradores promovidos internamente',          atual: '58%',      meta: '> 65%',        status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.PL, atualizado: '15/04/2026', polaridade: 'up',   diff: '↓ −7pp',       diffTone: 'warning' },
  { id: 1024, tema_id: 8,  nome: 'Taxa de conclusão de trilhas técnicas',            atual: '71%',      meta: '> 80%',        status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.PL, atualizado: '20/04/2026', polaridade: 'up',   diff: '↓ −9pp',       diffTone: 'warning' },
  { id: 1025, tema_id: 9,  nome: 'NPS de Clientes',                                  atual: '47',       meta: '> 50',         status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.JC, atualizado: '01/05/2026', polaridade: 'up',   diff: '↓ −3',         diffTone: 'warning' },
  { id: 1026, tema_id: 9,  nome: '% de contratos com SLA cumprido',                  atual: '84%',      meta: '> 90%',        status: 'warning', tendencia: 'flat', responsavel: RESP_KPI.JC, atualizado: '30/04/2026', polaridade: 'up',   diff: '↓ −6pp',       diffTone: 'warning' },
  { id: 1027, tema_id: 9,  nome: 'Reincidência de chamados pós-entrega',             atual: '18%',      meta: '< 10%',        status: 'danger',  tendencia: 'up',   responsavel: RESP_KPI.JC, atualizado: '05/05/2026', polaridade: 'down', diff: '↑ +8pp',       diffTone: 'danger' },
  { id: 1028, tema_id: 10, nome: '% colaboradores contratados da comunidade local',  atual: '42%',      meta: '> 35%',        status: 'success', tendencia: 'up',   responsavel: RESP_KPI.MS, atualizado: '12/05/2026', polaridade: 'up',   diff: '↑ +7pp',       diffTone: 'success' },
  { id: 1029, tema_id: 10, nome: 'Investimento social privado (% receita)',          atual: '0,8%',     meta: '> 1,0%',       status: 'warning', tendencia: 'flat', responsavel: RESP_KPI.MS, atualizado: '08/05/2026', polaridade: 'up',   diff: '↓ −0,2pp',     diffTone: 'warning' },
  { id: 1030, tema_id: 10, nome: 'Reclamações de comunidades vizinhas',              atual: '7',        meta: '< 5',          status: 'warning', tendencia: 'down', responsavel: RESP_KPI.MS, atualizado: '10/05/2026', polaridade: 'down', diff: '↑ +2',         diffTone: 'warning' },
  { id: 1031, tema_id: 11, nome: 'Tempo médio de aprovação de medições (dias)',      atual: '14',       meta: '< 7',          status: 'danger',  tendencia: 'flat', responsavel: RESP_KPI.EC, atualizado: '03/05/2026', polaridade: 'down', diff: '↑ +7',         diffTone: 'danger' },
  { id: 1032, tema_id: 11, nome: '% de processos críticos mapeados',                atual: '52%',      meta: '> 80%',        status: 'danger',  tendencia: 'up',   responsavel: RESP_KPI.EC, atualizado: '01/05/2026', polaridade: 'up',   diff: '↓ −28pp',      diffTone: 'danger' },
  { id: 1033, tema_id: 11, nome: 'Span of control médio',                            atual: '12',       meta: '7-10',         status: 'warning', tendencia: 'flat', responsavel: RESP_KPI.EC, atualizado: '02/05/2026', polaridade: 'down', diff: '↑ +2',         diffTone: 'warning' },
  { id: 1034, tema_id: 12, nome: 'Tempo médio de preenchimento de vaga (dias)',      atual: '78',       meta: '< 60',         status: 'danger',  tendencia: 'up',   responsavel: RESP_KPI.PL, atualizado: '12/04/2026', polaridade: 'down', diff: '↑ +18 d',      diffTone: 'danger' },
  { id: 1035, tema_id: 12, nome: 'Taxa de sucesso de contratações (12m)',            atual: '88,4%',    meta: '> 93%',        status: 'warning', tendencia: 'flat', responsavel: RESP_KPI.PL, atualizado: '20/04/2026', polaridade: 'up',   diff: '↓ −4,6pp',     diffTone: 'warning' },
  { id: 1036, tema_id: 12, nome: 'Custo médio por contratação (R$)',                 atual: 'R$ 4.200', meta: '< R$ 3.500',   status: 'danger',  tendencia: 'up',   responsavel: RESP_KPI.PL, atualizado: '28/04/2026', polaridade: 'down', diff: '↑ +R$ 700',    diffTone: 'danger' },
  { id: 1037, tema_id: 13, nome: 'NPS de Fornecedores',                              atual: '18',       meta: '> 40',         status: 'danger',  tendencia: 'flat', responsavel: RESP_KPI.EC, atualizado: '30/04/2026', polaridade: 'up',   diff: '↓ −22',        diffTone: 'danger' },
  { id: 1038, tema_id: 13, nome: 'Prazo médio de pagamento (dias)',                  atual: '47',       meta: '< 30',         status: 'danger',  tendencia: 'up',   responsavel: RESP_KPI.RF, atualizado: '02/05/2026', polaridade: 'down', diff: '↑ +17',        diffTone: 'danger' },
  { id: 1039, tema_id: 13, nome: '% fornecedores com contrato vigente',              atual: '81%',      meta: '> 90%',        status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.EC, atualizado: '06/05/2026', polaridade: 'up',   diff: '↓ −9pp',       diffTone: 'warning' },
  { id: 1040, tema_id: 14, nome: 'Conhecimento do propósito (pulse)',                atual: '64%',      meta: '> 80%',        status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.PL, atualizado: '28/04/2026', polaridade: 'up',   diff: '↓ −16pp',      diffTone: 'warning' },
  { id: 1041, tema_id: 14, nome: 'Engajamento em canais internos',                   atual: '52%',      meta: '> 60%',        status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.PL, atualizado: '05/05/2026', polaridade: 'up',   diff: '↓ −8pp',       diffTone: 'warning' },
  { id: 1042, tema_id: 14, nome: 'Menções positivas em mídia externa',               atual: '28/trim',  meta: null,           status: 'neutral', tendencia: 'flat', responsavel: RESP_KPI.JC, atualizado: '10/05/2026', polaridade: 'up',   diff: null,           diffTone: 'neutral' },
  { id: 1043, tema_id: 15, nome: '% fornecedores com avaliação socioambiental',      atual: '43%',      meta: '> 70%',        status: 'danger',  tendencia: 'up',   responsavel: RESP_KPI.MS, atualizado: '02/05/2026', polaridade: 'up',   diff: '↓ −27pp',      diffTone: 'danger' },
  { id: 1044, tema_id: 15, nome: 'Compras de fornecedores locais (% volume)',        atual: '67%',      meta: '> 60%',        status: 'success', tendencia: 'up',   responsavel: RESP_KPI.EC, atualizado: '30/04/2026', polaridade: 'up',   diff: '↑ +7pp',       diffTone: 'success' },
  { id: 1045, tema_id: 15, nome: 'Auditorias socioambientais realizadas',            atual: '8',        meta: '12/ano',       status: 'warning', tendencia: 'flat', responsavel: RESP_KPI.MS, atualizado: '06/05/2026', polaridade: 'up',   diff: '↓ −4',         diffTone: 'warning' },
  { id: 1046, tema_id: 16, nome: '% resíduos destinados a reciclagem',              atual: '58%',      meta: '> 75%',        status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.RS, atualizado: '20/04/2026', polaridade: 'up',   diff: '↓ −17pp',      diffTone: 'warning' },
  { id: 1047, tema_id: 16, nome: 'Geração de resíduos por m² construído (kg)',      atual: '124',      meta: '< 100',        status: 'warning', tendencia: 'down', responsavel: RESP_KPI.RS, atualizado: '25/04/2026', polaridade: 'down', diff: '↑ +24',        diffTone: 'warning' },
  { id: 1048, tema_id: 16, nome: '% obras com PGRCC ativo',                         atual: '88%',      meta: '100%',         status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.RS, atualizado: '08/05/2026', polaridade: 'up',   diff: '↓ −12pp',      diffTone: 'warning' },
  { id: 1049, tema_id: 17, nome: '% mulheres em posições de liderança',             atual: '23%',      meta: '> 30%',        status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.PL, atualizado: '03/05/2026', polaridade: 'up',   diff: '↓ −7pp',       diffTone: 'warning' },
  { id: 1050, tema_id: 17, nome: '% PCD no quadro',                                  atual: '3,8%',     meta: '> 5% (legal)', status: 'warning', tendencia: 'flat', responsavel: RESP_KPI.PL, atualizado: '02/05/2026', polaridade: 'up',   diff: '↓ −1,2pp',     diffTone: 'warning' },
  { id: 1051, tema_id: 17, nome: 'Equiparação salarial (gap H/M, mesma função)',    atual: '8,2%',     meta: '< 5%',         status: 'warning', tendencia: 'down', responsavel: RESP_KPI.PL, atualizado: '05/05/2026', polaridade: 'down', diff: '↑ +3,2pp',     diffTone: 'warning' },
  { id: 1052, tema_id: 18, nome: '% de obras com análise de risco climático',       atual: '12%',      meta: '> 80%',        status: 'danger',  tendencia: 'up',   responsavel: RESP_KPI.MS, atualizado: '06/05/2026', polaridade: 'up',   diff: '↓ −68pp',      diffTone: 'danger' },
  { id: 1053, tema_id: 18, nome: 'Investimento em adaptação climática (R$)',        atual: 'R$ 1,2M',  meta: null,           status: 'neutral', tendencia: 'flat', responsavel: RESP_KPI.MS, atualizado: '08/05/2026', polaridade: 'up',   diff: null,           diffTone: 'neutral' },
  { id: 1054, tema_id: 18, nome: '% materiais com baixa pegada de carbono',         atual: '18%',      meta: '> 40%',        status: 'danger',  tendencia: 'up',   responsavel: RESP_KPI.MS, atualizado: '10/05/2026', polaridade: 'up',   diff: '↓ −22pp',      diffTone: 'danger' },
  { id: 1055, tema_id: 19, nome: 'Índice de Cultura (saúde organizacional)',        atual: '68',       meta: '> 75',         status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.PL, atualizado: '02/05/2026', polaridade: 'up',   diff: '↓ −7',         diffTone: 'warning' },
  { id: 1056, tema_id: 19, nome: '% colaboradores que recomendam a empresa',        atual: '71%',      meta: '> 80%',        status: 'warning', tendencia: 'flat', responsavel: RESP_KPI.PL, atualizado: '30/04/2026', polaridade: 'up',   diff: '↓ −9pp',       diffTone: 'warning' },
  { id: 1057, tema_id: 19, nome: 'Aderência a valores (pulse)',                     atual: '73%',      meta: '> 80%',        status: 'warning', tendencia: 'up',   responsavel: RESP_KPI.PL, atualizado: '06/05/2026', polaridade: 'up',   diff: '↓ −7pp',       diffTone: 'warning' },
  { id: 1058, tema_id: 20, nome: 'Emissões CO₂e Escopo 1+2 (tCO₂e/ano)',           atual: '14.218',   meta: '< 12.000',     status: 'danger',  tendencia: 'flat', responsavel: RESP_KPI.MS, atualizado: '15/04/2026', polaridade: 'down', diff: '↑ +2.218 t',   diffTone: 'danger' },
  { id: 1059, tema_id: 20, nome: 'Intensidade de emissões (tCO₂e/R$ mi)',           atual: '28',       meta: '< 20',         status: 'danger',  tendencia: 'flat', responsavel: RESP_KPI.MS, atualizado: '20/04/2026', polaridade: 'down', diff: '↑ +8',         diffTone: 'danger' },
  { id: 1060, tema_id: 20, nome: '% frota com combustível alternativo',             atual: '8%',       meta: '> 30%',        status: 'danger',  tendencia: 'up',   responsavel: RESP_KPI.MS, atualizado: '25/04/2026', polaridade: 'up',   diff: '↓ −22pp',      diffTone: 'danger' },
] as Omit<KPI, 'perspectiva' | 'sem_meta'>[]).map(k => ({
  ...k,
  perspectiva: PERSP_TEMA[k.tema_id] || 'Outros',
  sem_meta: k.meta == null,
})) as KPI[];

export interface SugestaoVinculo {
  kind: 'kpi' | 'iniciativa';
  score?: number;
  ref: string;
  modulo?: string;
  rationale: string;
  acao?: string;
  action?: string;
  atual?: string;
  meta?: string | null;
}

export const SUGESTOES_VINCULO: Record<number, SugestaoVinculo[]> = {
  4: [
    { kind: 'iniciativa', score: 89, ref: 'Plano de Carreira 2026', modulo: 'OKRs', rationale: 'A iniciativa está atrasada há mais de 60 dias. Considere reagendar marcos ou abrir nova iniciativa para descongelar o tema.', acao: 'replanejar' },
    { kind: 'kpi', score: 91, action: 'sem-meta-fix', ref: 'Engajamento (eNPS)', atual: '12', meta: '> 30', rationale: 'KPI está fora da meta há mais de 6 meses. Sugestão: revisar meta ou criar nova iniciativa para destravar.', acao: 'revisar' },
  ],
  1: [
    { kind: 'kpi', score: 88, ref: 'Disponibilidade dos sistemas de obra', atual: '94,2%', meta: '99%', rationale: 'KPI fora da meta há 5 meses; sugerimos criar plano de ação dedicado.', acao: 'plano-acao' },
  ],
  11: [
    { kind: 'iniciativa', score: 84, ref: 'Programa de Padronização de Processos', modulo: 'OKRs', rationale: 'Em andamento no módulo de Iniciativas — endereça parcialmente o ruído com fornecedores.' },
  ],
  14: [
    { kind: 'kpi', score: 82, action: 'sem-meta', ref: 'Menções positivas em mídia externa', atual: '28/trim', meta: null, rationale: 'KPI sem meta definida. Sugerimos 40+ menções/trimestre baseado em benchmark do setor.', acao: 'definir-meta' },
  ],
  18: [
    { kind: 'kpi', score: 79, action: 'sem-meta', ref: 'Investimento em adaptação climática', atual: 'R$ 1,2M', meta: null, rationale: 'KPI sem meta definida. Sugestão: 1,5% da receita anual baseado em benchmark IFRS S2.', acao: 'definir-meta' },
  ],
  20: [
    { kind: 'kpi', score: 78, ref: 'Emissões CO₂e Escopo 1+2', atual: '14.218', meta: '< 12.000', rationale: 'KPI fora da meta há 12 meses. Sugestão: rever trajetória e abrir nova iniciativa de mitigação.', acao: 'revisar' },
  ],
  2: [],
};

export interface Mapeamento {
  id: number;
  fonte: string;
  nome: string;
  periodicidade: string;
  tema_ids: number[];
  peso: number;
  ativo: boolean;
  ultima_ingestao: string;
}

export const MAPEAMENTOS: Mapeamento[] = [
  { id: 401, fonte: 'pesquisa_clima',        nome: 'Pesquisa de Clima 2025',      periodicidade: 'Trimestral', tema_ids: [4, 5, 11, 14, 19], peso: 1.0, ativo: true,  ultima_ingestao: '2026-04-15' },
  { id: 402, fonte: 'nps_clientes',          nome: 'NPS de Clientes',             periodicidade: 'Mensal',     tema_ids: [2, 9],             peso: 1.0, ativo: true,  ultima_ingestao: '2026-05-01' },
  { id: 403, fonte: 'ouvidoria',             nome: 'Canal de Ouvidoria',          periodicidade: 'Contínuo',   tema_ids: [3, 5, 11],         peso: 0.8, ativo: true,  ultima_ingestao: '2026-05-10' },
  { id: 404, fonte: 'pesquisa_fornecedores', nome: 'Satisfação de Fornecedores',  periodicidade: 'Trimestral', tema_ids: [11, 13, 15],       peso: 1.0, ativo: true,  ultima_ingestao: '2026-04-30' },
  { id: 405, fonte: 'pulse_comunidades',     nome: 'Pulse Comunidades',           periodicidade: 'Bimestral',  tema_ids: [10, 18],           peso: 1.0, ativo: true,  ultima_ingestao: '2026-04-12' },
  { id: 406, fonte: 'pesquisa_clima',        nome: 'Pesq. Engaj. Pulse Q1',       periodicidade: 'Pulse',      tema_ids: [1, 8],             peso: 0.6, ativo: false, ultima_ingestao: '2025-12-10' },
];

export const VERSOES = [
  { id: 'v2024', label: 'Matriz 2024', curto: '2024', status: 'arquivada', publicada_em: '2025-04-22', atual: false, draft: false },
  { id: 'v2025', label: 'Matriz 2025', curto: '2025', status: 'publicada', publicada_em: '2026-04-08', atual: true,  draft: false },
  { id: 'v2026', label: 'Matriz 2026', curto: '2026', status: 'rascunho',  publicada_em: '2026-12-01', atual: false, draft: true  },
];
export type Versao = typeof VERSOES[number];

export const ORG = {
  nome: 'Construtora Vértice S.A.',
  cnpj: '12.345.678/0001-90',
  setor: 'Construção civil',
};

export const USUARIO = {
  nome: 'Marcelo Santos',
  cargo: 'Diretor de Sustentabilidade',
  iniciais: 'MS',
};

/* ===== Helpers ===== */
export function sentColor(s: number | null): string {
  if (s == null) return 'var(--hu-sent-na)';
  if (s <= -25) return 'var(--hu-sent-vneg)';
  if (s < 0)    return 'var(--hu-sent-neg)';
  if (s < 15)   return 'var(--hu-sent-lpos)';
  return 'var(--hu-sent-pos)';
}
export function sentLabel(s: number | null): string {
  if (s == null) return 'Sem dado';
  if (s <= -25) return 'Muito negativo';
  if (s < 0)    return 'Negativo';
  if (s < 15)   return 'Levemente positivo';
  return 'Positivo';
}
export function fmtSent(s: number | null): string {
  if (s == null) return '—';
  return (s > 0 ? '+' : '') + s;
}
export function fmtDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const dia = String(d.getUTCDate()).padStart(2, '0');
  return `${dia}/${meses[d.getUTCMonth()]}/${d.getUTCFullYear()}`;
}
export function fmtDateLong(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return `${d.getUTCDate()} de ${meses[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}
export function fmtShortMonth(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + (iso.length === 7 ? '-01' : ''));
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${meses[d.getUTCMonth()]} / ${String(d.getUTCFullYear()).slice(-2)}`;
}

export function kpiStatusText(k: KPI): string {
  if (k.sem_meta) return 'Sem meta';
  return ({ success: 'Em meta', warning: 'Atenção', danger: 'Fora', neutral: 'Sem meta' } as Record<string, string>)[k.status] || '—';
}

export function kpiOnTrackStats(kpis: KPI[]) {
  const total = kpis.length;
  const withMeta = kpis.filter(k => !k.sem_meta);
  const onTrack = withMeta.filter(k => k.status === 'success').length;
  const semMeta = kpis.filter(k => k.sem_meta).length;
  let tone: string;
  if (withMeta.length === 0) tone = 'neutral';
  else {
    const pct = onTrack / withMeta.length;
    tone = pct >= 0.8 ? 'success' : pct >= 0.5 ? 'warning' : 'danger';
  }
  return { total, onTrack, semMeta, withMeta: withMeta.length, tone };
}

export function parsePrazo(p: string): Date | null {
  if (!p || p === 'A definir') return null;
  const m = /^(\d{2})\/(\d{4})$/.exec(p);
  if (!m) return null;
  return new Date(Number(m[2]), Number(m[1]), 0);
}

export function iniciativaDeadlineStatus(i: Iniciativa) {
  if (i.status === 'completo') {
    return { kind: 'completa', tone: 'success', label: `Completa · concluída em ${i.prazo}`, daysDelta: 0 };
  }
  const prazo = parsePrazo(i.prazo);
  if (!prazo) {
    return { kind: 'indef', tone: 'neutral', label: 'Pendente · prazo a definir', daysDelta: 0 };
  }
  const msDay = 86400000;
  const days = Math.round((prazo.getTime() - TODAY.getTime()) / msDay);
  if (days < 0) {
    return { kind: 'atrasada', daysDelta: -days, tone: 'danger', label: `Atrasada · ${-days} dias vencidos` };
  }
  if (days <= 45) {
    return { kind: 'atencao', daysDelta: days, tone: 'warning', label: `Atenção · faltam ${days} dias` };
  }
  return { kind: 'em-dia', daysDelta: days, tone: 'success', label: `Prazo OK · faltam ${days} dias` };
}

export function iniciativaEmDiaStats(inics: Iniciativa[]) {
  let emDia = 0, atrasadas = 0;
  inics.forEach(i => {
    const d = iniciativaDeadlineStatus(i);
    if (d.kind === 'atrasada') atrasadas++; else emDia++;
  });
  const total = inics.length;
  let tone: string;
  if (total === 0) tone = 'neutral';
  else {
    const pct = emDia / total;
    tone = pct >= 0.8 ? 'success' : pct >= 0.5 ? 'warning' : 'danger';
  }
  return { total, emDia, atrasadas, tone };
}

export function getDimValue(theme: Theme, publicoId: string, dim: string): number | null {
  if (publicoId === 'alta_lideranca') {
    if (dim === 'sentimento') return theme.alta_lideranca.sentimento;
    if (dim === 'relevancia') return theme.alta_lideranca.impacto_negocio;
    return null;
  }
  if (publicoId === 'agregado') {
    let sum = 0, w = 0;
    theme.por_publico.forEach(pp => {
      const v = dim === 'sentimento' ? pp.sentimento : pp.relevancia;
      if (v == null) return;
      const peso = PUBLICO_BY_ID[pp.publico]?.peso || 1;
      sum += v * peso; w += peso;
    });
    return w > 0 ? Math.round(sum / w) : null;
  }
  const pp = theme.por_publico.find(p => p.publico === publicoId);
  if (!pp) return null;
  if (dim === 'sentimento') return pp.sentimento;
  return pp.relevancia;
}

export function recalcEixoY(theme: Theme, activePublicos: string[]): number {
  if (!activePublicos.length) return theme.y;
  let sum = 0, weight = 0;
  if (activePublicos.includes('alta_lideranca')) {
    const w = PUBLICO_BY_ID['alta_lideranca']?.peso ?? 1.5;
    sum += theme.alta_lideranca.impacto_negocio * w; weight += w;
  }
  theme.por_publico.forEach(pp => {
    if (activePublicos.includes(pp.publico)) {
      const p = PUBLICO_BY_ID[pp.publico];
      const w = p ? p.peso : 1;
      sum += pp.relevancia * w; weight += w;
    }
  });
  return weight > 0 ? Math.round(sum / weight) : theme.y;
}

export function recalcSent(theme: Theme, activePublicos: string[]): number | null {
  if (!activePublicos.length) return theme.sentimento;
  let sum = 0, weight = 0;
  if (activePublicos.includes('alta_lideranca')) {
    const w = PUBLICO_BY_ID['alta_lideranca']?.peso ?? 1.5;
    sum += theme.alta_lideranca.sentimento * w; weight += w;
  }
  theme.por_publico.forEach(pp => {
    if (activePublicos.includes(pp.publico) && pp.sentimento != null) {
      const p = PUBLICO_BY_ID[pp.publico];
      const w = p ? p.peso : 1;
      sum += pp.sentimento * w; weight += w;
    }
  });
  return weight > 0 ? Math.round(sum / weight) : theme.sentimento;
}

export function quadrant(x: number, y: number) {
  const right = x >= 75, top = y >= 65;
  if (right && top)   return { label: 'Prioridade máxima', tone: 'brand' };
  if (right && !top)  return { label: 'Estratégico',       tone: 'info'  };
  if (!right && top)  return { label: 'Engajamento',       tone: 'neutral' };
  return                      { label: 'Monitorar',        tone: 'neutral' };
}

export function themeStatus(theme: Theme, x: number, y: number, sent: number | null) {
  const inTopRight = x >= 75 && y >= 65;
  const sinais = SINAIS[theme.id];
  const sigDrop = (() => {
    if (!sinais || sinais.length < 2) return false;
    const sorted = [...sinais].sort((a, b) => a.data.localeCompare(b.data));
    return sorted[sorted.length - 1].sentimento < sorted[0].sentimento - 10;
  })();
  if (inTopRight && sent != null && sent < -10) return { label: 'Crítico',   tone: 'danger'  };
  if (sigDrop)                                  return { label: 'Em alerta', tone: 'warning' };
  if (sent != null && sent >= 10 && (theme.linkIFRS || x >= 75 || y >= 65)) return { label: 'Saudável', tone: 'success' };
  if (sent == null)                             return { label: 'Sem dado',  tone: 'neutral' };
  if (sent < -10)                               return { label: 'Em alerta', tone: 'warning' };
  return                                          { label: 'Monitorar', tone: 'neutral' };
}

export function themeStatusReason(theme: Theme, x: number, y: number, sent: number | null): string {
  const inTopRight = x >= 75 && y >= 65;
  const sinais = SINAIS[theme.id];
  const sigDrop = (() => {
    if (!sinais || sinais.length < 2) return false;
    const sorted = [...sinais].sort((a, b) => a.data.localeCompare(b.data));
    return sorted[sorted.length - 1].sentimento < sorted[0].sentimento - 10;
  })();
  if (inTopRight && sent != null && sent < -10) {
    return `Prioridade máxima — relevância de ${x}% para a Alta Liderança e ${y}% para stakeholders, combinada a sentimento negativo (${fmtSent(sent)}).`;
  }
  if (sigDrop) {
    return 'O sentimento caiu mais de 10 pontos entre o primeiro e o último sinal operacional medido no período.';
  }
  if (sent != null && sent >= 10 && (theme.linkIFRS || x >= 75 || y >= 65)) {
    return `Sentimento positivo (${fmtSent(sent)}) em um tema de alta relevância${theme.linkIFRS ? ', também vinculado a risco IFRS' : ''}.`;
  }
  if (sent == null) {
    return 'Ainda não há sentimento agregado medido para este tema.';
  }
  if (sent < -10) {
    return `Sentimento agregado negativo (${fmtSent(sent)}), mas sem os demais critérios de criticidade.`;
  }
  return 'Sem sinais de risco ou destaque no momento — tema dentro da faixa neutra de acompanhamento.';
}

export function scoreboard(themes: Theme[], activePublicos: string[]) {
  let total = themes.length, crit = 0, alerta = 0, saudavel = 0, semIni = 0;
  themes.forEach(t => {
    const y = recalcEixoY(t, activePublicos);
    const s = recalcSent(t, activePublicos);
    const st = themeStatus(t, t.x, y, s);
    if (st.tone === 'danger') crit++;
    else if (st.tone === 'warning') alerta++;
    else if (st.tone === 'success') saudavel++;
    const hasIni = INICIATIVAS.some(i => i.tema_id === t.id);
    const prior = t.x >= 75 || y >= 65;
    if (prior && !hasIni) semIni++;
  });
  return { total, crit, alerta, saudavel, semIni };
}

export function cobertura(themes: Theme[]) {
  const gri = new Set<string>();
  const ods = new Set<number>();
  themes.forEach(t => { t.gri.forEach(g => gri.add(g)); t.ods.forEach(o => ods.add(o)); });
  return { gri: gri.size, ods: ods.size };
}
