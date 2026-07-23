import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { PageHeader } from '~/components/page-header';
import { cn } from '~/lib/utils';
import { Card as ShadCard, CardContent } from '~/components/ui/card';
import { MaterialidadeBreadcrumb } from '~/materialidade/components';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

const TEMAS = [
  'Processos, tecnologia e infraestrutura',
  'Qualidade e segurança em obras',
  'Gestão de Pessoas',
  'Estrutura organizacional',
  'Segurança da informação',
  'Integridade corporativa, ética e transparência',
  'Saúde e bem-estar dos colaboradores',
  'Gestão financeira',
  'Relacionamento com clientes e comunicação',
  'Impacto nas comunidades do entorno',
  'Adaptação a mudanças climáticas',
  'Emissão de gases de efeito estufa',
  'Diversidade, equidade e inclusão',
  'Gestão de resíduos de construção',
  'Desenvolvimento dos colaboradores',
];

// Categorias gerais ao estilo SASB — mapeamento ilustrativo para fins de demonstração.
const TEMA_SASB: Record<string, string> = {
  'Processos, tecnologia e infraestrutura': 'Business Model & Innovation',
  'Qualidade e segurança em obras': 'Human Capital',
  'Gestão de Pessoas': 'Human Capital',
  'Estrutura organizacional': 'Leadership & Governance',
  'Segurança da informação': 'Business Model & Innovation',
  'Integridade corporativa, ética e transparência': 'Leadership & Governance',
  'Saúde e bem-estar dos colaboradores': 'Human Capital',
  'Gestão financeira': 'Leadership & Governance',
  'Relacionamento com clientes e comunicação': 'Social Capital',
  'Impacto nas comunidades do entorno': 'Social Capital',
  'Adaptação a mudanças climáticas': 'Environment',
  'Emissão de gases de efeito estufa': 'Environment',
  'Diversidade, equidade e inclusão': 'Human Capital',
  'Gestão de resíduos de construção': 'Environment',
  'Desenvolvimento dos colaboradores': 'Human Capital',
};

const SASB_FRAMEWORKS = [
  'Todos',
  'Environment',
  'Social Capital',
  'Human Capital',
  'Business Model & Innovation',
  'Leadership & Governance',
];

// Rótulo curto em português para exibição — o nome oficial em inglês aparece só no tooltip.
const SASB_LABEL: Record<string, string> = {
  'Environment': 'Ambiental',
  'Social Capital': 'Capital Social',
  'Human Capital': 'Capital Humano',
  'Business Model & Innovation': 'Modelo de Negócio',
  'Leadership & Governance': 'Governança',
};

const SASB_COLOR: Record<string, string> = {
  'Environment': 'bg-teal-100 text-teal-700',
  'Social Capital': 'bg-sky-100 text-sky-700',
  'Human Capital': 'bg-orange-100 text-orange-700',
  'Business Model & Innovation': 'bg-indigo-100 text-indigo-700',
  'Leadership & Governance': 'bg-pink-100 text-pink-700',
};

interface Player {
  nome: string;
  setor: string;
  temas: string[];
}

const PLAYERS: Player[] = [
  { nome: 'Empresa A', setor: 'Construção Civil', temas: ['Qualidade e segurança em obras', 'Gestão de Pessoas', 'Emissão de gases de efeito estufa', 'Gestão financeira', 'Estrutura organizacional'] },
  { nome: 'Empresa B', setor: 'Infraestrutura', temas: ['Processos, tecnologia e infraestrutura', 'Segurança da informação', 'Gestão de Pessoas', 'Integridade corporativa, ética e transparência', 'Adaptação a mudanças climáticas'] },
  { nome: 'Empresa C', setor: 'Construção Civil', temas: ['Qualidade e segurança em obras', 'Saúde e bem-estar dos colaboradores', 'Diversidade, equidade e inclusão', 'Gestão de resíduos de construção', 'Gestão financeira'] },
  { nome: 'Empresa D', setor: 'Incorporação', temas: ['Relacionamento com clientes e comunicação', 'Impacto nas comunidades do entorno', 'Gestão financeira', 'Qualidade e segurança em obras', 'Desenvolvimento dos colaboradores'] },
  { nome: 'Empresa E', setor: 'Infraestrutura', temas: ['Emissão de gases de efeito estufa', 'Adaptação a mudanças climáticas', 'Gestão de resíduos de construção', 'Integridade corporativa, ética e transparência', 'Gestão financeira'] },
  { nome: 'Empresa F', setor: 'Construção Civil', temas: ['Gestão de Pessoas', 'Diversidade, equidade e inclusão', 'Saúde e bem-estar dos colaboradores', 'Desenvolvimento dos colaboradores', 'Emissão de gases de efeito estufa'] },
  { nome: 'Empresa G', setor: 'Facilities', temas: ['Processos, tecnologia e infraestrutura', 'Qualidade e segurança em obras', 'Gestão financeira', 'Segurança da informação', 'Relacionamento com clientes e comunicação'] },
  { nome: 'Empresa H', setor: 'Incorporação', temas: ['Gestão financeira', 'Qualidade e segurança em obras', 'Impacto nas comunidades do entorno', 'Diversidade, equidade e inclusão', 'Integridade corporativa, ética e transparência'] },
  { nome: 'Empresa I', setor: 'Facilities', temas: ['Saúde e bem-estar dos colaboradores', 'Gestão de Pessoas', 'Desenvolvimento dos colaboradores', 'Processos, tecnologia e infraestrutura', 'Segurança da informação'] },
  { nome: 'Empresa J', setor: 'Construção Civil', temas: ['Emissão de gases de efeito estufa', 'Gestão de resíduos de construção', 'Adaptação a mudanças climáticas', 'Gestão financeira', 'Qualidade e segurança em obras'] },
  { nome: 'Empresa K', setor: 'Infraestrutura', temas: ['Integridade corporativa, ética e transparência', 'Estrutura organizacional', 'Gestão financeira', 'Processos, tecnologia e infraestrutura', 'Adaptação a mudanças climáticas'] },
  { nome: 'Empresa L', setor: 'Construção Civil', temas: ['Qualidade e segurança em obras', 'Saúde e bem-estar dos colaboradores', 'Gestão de Pessoas', 'Gestão de resíduos de construção', 'Emissão de gases de efeito estufa'] },
  { nome: 'Empresa M', setor: 'Incorporação', temas: ['Relacionamento com clientes e comunicação', 'Gestão financeira', 'Estrutura organizacional', 'Integridade corporativa, ética e transparência', 'Diversidade, equidade e inclusão'] },
  { nome: 'Empresa N', setor: 'Facilities', temas: ['Gestão de Pessoas', 'Desenvolvimento dos colaboradores', 'Saúde e bem-estar dos colaboradores', 'Segurança da informação', 'Processos, tecnologia e infraestrutura'] },
  { nome: 'Empresa O', setor: 'Construção Civil', temas: ['Gestão de resíduos de construção', 'Emissão de gases de efeito estufa', 'Qualidade e segurança em obras', 'Adaptação a mudanças climáticas', 'Impacto nas comunidades do entorno'] },
  { nome: 'Humanizadas', setor: 'Construção Civil', temas: ['Processos, tecnologia e infraestrutura', 'Qualidade e segurança em obras', 'Gestão de Pessoas', 'Estrutura organizacional', 'Segurança da informação'] },
];

const NOSSA_EMPRESA = 'Humanizadas';
const OUTRAS_EMPRESAS = PLAYERS.filter(p => p.nome !== NOSSA_EMPRESA);

function frequenciaTema(tema: string, players: Player[]): number {
  return players.filter(p => p.temas.includes(tema)).length;
}

function CompanyPicker({ active, onToggle, onAll, onNone }: {
  active: string[];
  onToggle: (nome: string) => void;
  onAll: () => void;
  onNone: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const allSelected = active.length === OUTRAS_EMPRESAS.length;
  const summary = allSelected ? 'Todas as empresas' : active.length === 0 ? 'Só a minha empresa' : `Humanizadas + ${active.length}`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <span>Comparar empresas</span>
        <span className="rounded border border-primary/20 bg-primary/5 px-1.5 py-px text-[10px] font-semibold text-primary">{summary}</span>
        <ChevronDown className={cn('size-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[320px] rounded-xl border border-border bg-popover p-2 shadow-[0_12px_28px_rgba(0,0,0,0.10)]">
          <div className="mb-1 flex items-center justify-between border-b border-muted px-1.5 pb-2 pt-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Concorrentes na tabela</span>
            <div className="flex gap-1">
              <button onClick={onAll} className="rounded-md border border-border bg-background px-2 py-[3px] text-xs font-semibold text-primary">Todos</button>
              <button onClick={onNone} className="rounded-md border border-border bg-background px-2 py-[3px] text-xs font-semibold text-muted-foreground">Limpar</button>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg bg-primary/5 px-2.5 py-2 mb-1">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-primary bg-primary">
              <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
            </span>
            <span className="text-sm font-bold text-primary">Humanizadas</span>
            <span className="ml-auto rounded px-1.5 py-px text-[10px] font-semibold text-primary/70">sua empresa · fixa</span>
          </div>
          <div className="flex flex-col gap-0.5 max-h-[280px] overflow-y-auto">
            {OUTRAS_EMPRESAS.map(p => {
              const isActive = active.includes(p.nome);
              return (
                <div
                  key={p.nome}
                  onClick={() => onToggle(p.nome)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-[120ms]',
                    isActive ? 'bg-primary/10' : 'bg-muted/40 hover:bg-primary/5',
                  )}
                >
                  <span className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px]',
                    isActive ? 'border-[1.5px] border-primary bg-primary' : 'border-[1.5px] border-stone-300 bg-background',
                  )}>
                    {isActive && <Check className="size-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <span className={cn('flex-1 text-sm', isActive ? 'font-bold text-foreground' : 'font-medium text-muted-foreground')}>
                    {p.nome}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BenchmarkPage() {
  const [selecionadas, setSelecionadas] = React.useState<string[]>(OUTRAS_EMPRESAS.map(p => p.nome));
  const [framework, setFramework] = React.useState('Todos');
  const [destaque, setDestaque] = React.useState<string | null>(null);

  const toggleEmpresa = (nome: string) => setSelecionadas(prev => prev.includes(nome) ? prev.filter(n => n !== nome) : [...prev, nome]);

  const nossaEmpresa = PLAYERS.find(p => p.nome === NOSSA_EMPRESA)!;
  const filtrados = [nossaEmpresa, ...OUTRAS_EMPRESAS.filter(p => selecionadas.includes(p.nome))];

  const temasFiltrados = framework === 'Todos' ? TEMAS : TEMAS.filter(t => TEMA_SASB[t] === framework);
  const temasOrdenados = [...temasFiltrados].sort(
    (a, b) => frequenciaTema(b, filtrados) - frequenciaTema(a, filtrados),
  );

  return (
    <>
      <PageHeader
        title={<MaterialidadeBreadcrumb current="Benchmark · Temas Materiais" />}
      />

      <div className="flex flex-col gap-6 px-8 pt-6 pb-8">

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Players analisados', value: filtrados.length },
            { label: 'Setores representados', value: new Set(filtrados.map(p => p.setor)).size },
            { label: 'Tema mais recorrente', value: temasOrdenados[0] ?? '—' },
          ].map(c => (
            <ShadCard key={c.label} className="p-[14px_16px] border-t-2 border-t-primary/25">
              <CardContent className="p-0">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-tight">
                  {c.label}
                </div>
                <div className={cn(
                  'font-display font-black leading-tight tracking-[-0.02em] text-foreground',
                  typeof c.value === 'number' ? 'text-[28px] tabular-nums' : 'text-sm',
                )}>
                  {c.value}
                </div>
              </CardContent>
            </ShadCard>
          ))}
        </div>

        {/* Tabela de presença */}
        <ShadCard className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                Comparativo de temas
              </div>
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <span className="inline-block h-3 w-3 rounded-sm bg-primary/20 border border-primary/40"/>
                = presente · passe o cursor para destacar
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 flex-wrap">
                {SASB_FRAMEWORKS.map(f => (
                  <button
                    key={f}
                    onClick={() => setFramework(f)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                      framework === f
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {f === 'Todos' ? f : SASB_LABEL[f] ?? f}
                  </button>
                ))}
              </div>
              <CompanyPicker active={selecionadas} onToggle={toggleEmpresa} onAll={() => setSelecionadas(OUTRAS_EMPRESAS.map(p => p.nome))} onNone={() => setSelecionadas([])}/>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-max w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40">
                  <th className="sticky left-0 z-10 bg-muted/40 px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap border-b border-border min-w-[180px]">
                    Tema
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-muted-foreground whitespace-nowrap border-b border-border min-w-[150px]">
                    Framework
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-muted-foreground whitespace-nowrap border-b border-border min-w-[60px]">
                    Freq.
                  </th>
                  {filtrados.map(p => (
                    <th
                      key={p.nome}
                      onMouseEnter={() => setDestaque(p.nome)}
                      onMouseLeave={() => setDestaque(null)}
                      className={cn(
                        'px-2 py-3 text-center font-semibold whitespace-nowrap border-b border-border min-w-[80px] transition-colors cursor-default',
                        p.nome === NOSSA_EMPRESA ? 'text-primary bg-primary/5' : 'text-muted-foreground',
                        destaque === p.nome && 'bg-muted',
                      )}
                    >
                      <div>{p.nome}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {temasOrdenados.map((tema, ri) => {
                  const freq = frequenciaTema(tema, filtrados);
                  return (
                    <tr
                      key={tema}
                      className={cn('border-b border-border last:border-0', ri % 2 === 0 ? 'bg-background' : 'bg-muted/20')}
                    >
                      <td className={cn(
                        'sticky left-0 z-10 px-4 py-2.5 font-medium text-foreground leading-snug border-r border-border',
                        ri % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                      )}>
                        {tema}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Tooltip>
                          <TooltipTrigger render={<span className="cursor-help" />}>
                            <span className={cn('rounded px-1.5 py-px text-[10px] font-semibold whitespace-nowrap', SASB_COLOR[TEMA_SASB[tema]] ?? 'bg-muted text-muted-foreground')}>
                              {SASB_LABEL[TEMA_SASB[tema]] ?? TEMA_SASB[tema]}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Categoria SASB: {TEMA_SASB[tema]}
                          </TooltipContent>
                        </Tooltip>
                      </td>
                      <td className="px-3 py-2.5 text-center tabular-nums font-semibold text-muted-foreground">
                        {freq}/{filtrados.length}
                      </td>
                      {filtrados.map(p => {
                        const presente = p.temas.includes(tema);
                        const isNossa = p.nome === NOSSA_EMPRESA;
                        return (
                          <td
                            key={p.nome}
                            onMouseEnter={() => setDestaque(p.nome)}
                            onMouseLeave={() => setDestaque(null)}
                            className={cn(
                              'py-2.5 text-center transition-colors',
                              destaque === p.nome && 'bg-muted/60',
                              isNossa && presente && 'bg-primary/8',
                            )}
                          >
                            {presente && (
                              <span className={cn(
                                'inline-flex h-5 w-5 items-center justify-center rounded-sm text-[10px] font-bold',
                                isNossa ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground/60',
                              )}>
                                ✓
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ShadCard>
      </div>
    </>
  );
}
