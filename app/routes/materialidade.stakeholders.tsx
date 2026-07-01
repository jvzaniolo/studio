import React from 'react';
import { PageHeader } from '~/components/page-header';
import { Card as ShadCard, CardContent } from '~/components/ui/card';
import { MaterialidadeBreadcrumb } from '~/materialidade/components';
import { PUBLICOS, THEMES } from '~/materialidade/data';
import { cn } from '~/lib/utils';

const ESG_COLOR: Record<string, string> = {
  E: 'bg-green-100 text-green-700',
  S: 'bg-blue-100 text-blue-700',
  G: 'bg-violet-100 text-violet-700',
};

function computeStakeholders() {
  const seen = new Map<string, number>();
  THEMES.forEach(t => t.por_publico.forEach(pp => {
    seen.set(pp.publico, Math.max(seen.get(pp.publico) ?? 0, pp.n_amostra));
  }));
  return seen;
}

export default function StakeholdersPage() {
  const counts = React.useMemo(computeStakeholders, []);
  const total = Array.from(counts.values()).reduce((s, v) => s + v, 0);

  const rows = PUBLICOS.map(p => ({
    ...p,
    n: counts.get(p.id) ?? 0,
    pct: Math.round(((counts.get(p.id) ?? 0) / total) * 100),
  })).sort((a, b) => b.n - a.n);

  return (
    <>
      <PageHeader title={<MaterialidadeBreadcrumb current="Stakeholders consultados" />} />

      <div className="flex flex-col gap-6 px-8 pt-6 pb-8">

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total de stakeholders', value: total.toLocaleString('pt-BR') },
            { label: 'Grupos consultados', value: rows.filter(r => r.n > 0).length },
            { label: 'Maior grupo', value: rows[0]?.label ?? '—' },
          ].map(c => (
            <ShadCard key={c.label} className="p-[14px_16px] border-t-2 border-t-primary/25">
              <CardContent className="p-0">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-tight">
                  {c.label}
                </div>
                <div className={cn(
                  'font-display font-black leading-tight tracking-[-0.02em] text-foreground',
                  typeof c.value === 'number' || /^\d/.test(String(c.value)) ? 'text-[28px] tabular-nums' : 'text-sm',
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
              Número máximo de respondentes identificado por grupo ao longo dos temas pesquisados.
            </p>
          </div>
          <div className="divide-y divide-border">
            {rows.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-36 shrink-0">
                  <div className="text-sm font-medium text-foreground">{r.label}</div>
                </div>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/70 transition-all"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 text-right tabular-nums text-sm font-semibold text-foreground">
                  {r.n.toLocaleString('pt-BR')}
                </div>
                <div className="w-10 text-right text-xs text-muted-foreground">
                  {r.pct}%
                </div>
              </div>
            ))}
          </div>
        </ShadCard>

      </div>
    </>
  );
}
