import React from 'react';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '~/components/page-header';
import { Card as ShadCard, CardContent } from '~/components/ui/card';
import { MaterialidadeBreadcrumb } from '~/materialidade/components';
import { PUBLICOS, THEMES, CARGOS, POPULACAO_ESTIMADA, ALTA_LIDERANCA_N } from '~/materialidade/data';
import { cn } from '~/lib/utils';

function computeStakeholders() {
  const seen = new Map<string, number>([['alta_lideranca', ALTA_LIDERANCA_N]]);
  THEMES.forEach(t => {
    t.por_publico.forEach(pp => {
      seen.set(pp.publico, Math.max(seen.get(pp.publico) ?? 0, pp.n_amostra));
    });
    seen.set('investidores', Math.max(seen.get('investidores') ?? 0, t.investidores.n_amostra));
  });
  return seen;
}

// Divisão genérica (ilustrativa de demo) do total de respondentes de um público entre suas
// subcategorias — em produção, viria diretamente da pesquisa de cada empresa.
function subgrupos(pubId: string, total: number) {
  const cargos = CARGOS[pubId];
  if (!cargos || cargos.length === 0 || total <= 0) return null;
  const weights = cargos.map((_, i) => cargos.length - i);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  let assigned = 0;
  return cargos.map((c, i) => {
    const isLast = i === cargos.length - 1;
    const n = isLast ? total - assigned : Math.round((weights[i] / weightSum) * total);
    assigned += n;
    return { id: c.id, label: c.label, n };
  });
}

export default function StakeholdersPage() {
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const counts = React.useMemo(computeStakeholders, []);
  const total = Array.from(counts.values()).reduce((s, v) => s + v, 0);

  const rows = PUBLICOS.map(p => {
    const n = counts.get(p.id) ?? 0;
    const populacao = POPULACAO_ESTIMADA[p.id] ?? 0;
    return {
      ...p,
      n,
      populacao,
      atingimento: populacao > 0 ? Math.round((n / populacao) * 100) : null,
      sub: subgrupos(p.id, n),
    };
  }).sort((a, b) => b.n - a.n);

  const toggle = (id: string) => setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <>
      <PageHeader title={<MaterialidadeBreadcrumb current="Stakeholders consultados" />} />

      <div className="flex flex-col gap-6 px-8 pt-6 pb-8">

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total de stakeholders', value: total.toLocaleString('pt-BR') },
            { label: 'Grupos consultados', value: String(rows.filter(r => r.n > 0).length) },
            { label: 'Alta Liderança consultada', value: `${ALTA_LIDERANCA_N} executivos` },
          ].map(c => (
            <ShadCard key={c.label} className="p-[14px_16px] border-t-2 border-t-primary/25">
              <CardContent className="p-0">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-tight">
                  {c.label}
                </div>
                <div className={cn(
                  'font-display font-black leading-tight tracking-[-0.02em] text-foreground',
                  /^\d/.test(c.value) && !c.value.includes(' ') ? 'text-[28px] tabular-nums' : 'text-sm',
                )}>
                  {c.value}
                </div>
              </CardContent>
            </ShadCard>
          ))}
        </div>

        <ShadCard className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              Distribuição por público
            </div>
            <p className="text-sm text-muted-foreground">
              Respondentes, população estimada e atingimento da amostra por grupo consultado.
              <span className="ml-1 text-muted-foreground/70">População e subcategorias são estimativas genéricas de demo — em uma implementação real seriam personalizadas por empresa.</span>
            </p>
          </div>

          <div className="flex items-center gap-4 px-5 py-2 bg-muted/40 border-b border-border text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <div className="w-40 shrink-0">Público</div>
            <div className="w-24 text-right">Respondentes</div>
            <div className="w-28 text-right">População (est.)</div>
            <div className="flex-1" />
            <div className="w-16 text-right">Atingimento</div>
          </div>

          <div className="divide-y divide-border">
            {rows.map(r => {
              const isOpen = expanded.includes(r.id);
              return (
                <div key={r.id}>
                  <div
                    onClick={() => r.sub && toggle(r.id)}
                    className={cn('flex items-center gap-4 px-5 py-4', r.sub && 'cursor-pointer hover:bg-muted/30')}
                  >
                    <div className="w-40 shrink-0 flex items-center gap-1.5">
                      {r.sub && (
                        <ChevronRight className={cn('size-3.5 text-muted-foreground transition-transform shrink-0', isOpen && 'rotate-90')} />
                      )}
                      <div className="text-sm font-medium text-foreground">{r.label}</div>
                    </div>
                    <div className="w-24 text-right tabular-nums text-sm font-semibold text-foreground">
                      {r.n.toLocaleString('pt-BR')}
                    </div>
                    <div className="w-28 text-right tabular-nums text-sm text-muted-foreground">
                      {r.populacao ? r.populacao.toLocaleString('pt-BR') : '—'}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all"
                          style={{ width: `${Math.min(100, r.atingimento ?? 0)}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-xs font-semibold text-muted-foreground">
                      {r.atingimento != null ? `${r.atingimento}%` : '—'}
                    </div>
                  </div>
                  {isOpen && r.sub && (
                    <div className="bg-muted/20 px-5 py-2 pl-[52px] flex flex-col gap-1.5">
                      {r.sub.map(s => (
                        <div key={s.id} className="flex items-center justify-between text-xs text-muted-foreground py-1">
                          <span>{s.label}</span>
                          <span className="font-semibold text-foreground tabular-nums">{s.n.toLocaleString('pt-BR')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ShadCard>

      </div>
    </>
  );
}
