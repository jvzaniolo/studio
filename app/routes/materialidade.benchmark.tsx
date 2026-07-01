import React from 'react';
import { PageHeader } from '~/components/page-header';
import { cn } from '~/lib/utils';
import { Card as ShadCard, CardContent } from '~/components/ui/card';
import { MaterialidadeBreadcrumb } from '~/materialidade/components';

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

const SETORES = ['Todos', ...Array.from(new Set(PLAYERS.map(p => p.setor)))];

const SETOR_COLOR: Record<string, string> = {
  'Construção Civil': 'bg-violet-100 text-violet-700',
  'Infraestrutura':  'bg-blue-100 text-blue-700',
  'Incorporação':    'bg-amber-100 text-amber-700',
  'Facilities':      'bg-green-100 text-green-700',
};

function frequenciaTema(tema: string, players: Player[]): number {
  return players.filter(p => p.temas.includes(tema)).length;
}

export default function BenchmarkPage() {
  const [setor, setSetor] = React.useState('Todos');
  const [destaque, setDestaque] = React.useState<string | null>(null);

  const filtrados = setor === 'Todos' ? PLAYERS : PLAYERS.filter(p => p.setor === setor);

  const temasOrdenados = [...TEMAS].sort(
    (a, b) => frequenciaTema(b, filtrados) - frequenciaTema(a, filtrados),
  );

  return (
    <>
      <PageHeader
        title={<MaterialidadeBreadcrumb current="Benchmark · Temas Materiais" />}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {SETORES.map(s => (
              <button
                key={s}
                onClick={() => setSetor(s)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                  setor === s
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        }
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
          <div className="px-5 py-4 border-b border-border">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              Comparativo de temas
            </div>
            <p className="text-sm text-muted-foreground">
              Temas materiais identificados por cada player — ordenados por frequência no setor selecionado.
              <span className="ml-2 inline-flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-primary/20 border border-primary/40"/>
                = presente · passe o cursor para destacar
              </span>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-max w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40">
                  <th className="sticky left-0 z-10 bg-muted/40 px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap border-b border-border min-w-[180px]">
                    Tema
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
                      <div className={cn('text-[10px] font-normal mt-0.5', SETOR_COLOR[p.setor] ? '' : 'text-muted-foreground')}>
                        <span className={cn('rounded px-1 py-px', SETOR_COLOR[p.setor] ?? 'bg-muted text-muted-foreground')}>
                          {p.setor}
                        </span>
                      </div>
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
