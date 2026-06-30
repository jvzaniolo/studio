import React from 'react';
import { PageHeader } from '~/components/page-header';
import { Card as ShadCard, CardContent } from '~/components/ui/card';
import { PUBLICOS, THEMES } from '~/materialidade/data';
import { cn } from '~/lib/utils';

function sentColor(v: number) {
  if (v >= 15) return 'text-green-600 bg-green-50';
  if (v <= -15) return 'text-red-600 bg-red-50';
  return 'text-amber-600 bg-amber-50';
}

export default function ComentariosPage() {
  const byPublico = React.useMemo(() => {
    const map = new Map<string, { n: number; sentTotal: number; sentCount: number }>();
    THEMES.forEach(t => {
      t.por_publico.forEach(pp => {
        if (pp.sentimento == null) return;
        const cur = map.get(pp.publico) ?? { n: 0, sentTotal: 0, sentCount: 0 };
        map.set(pp.publico, {
          n: cur.n + pp.n_amostra,
          sentTotal: cur.sentTotal + pp.sentimento * pp.n_amostra,
          sentCount: cur.sentCount + pp.n_amostra,
        });
      });
    });
    return map;
  }, []);

  const total = Array.from(byPublico.values()).reduce((s, v) => s + v.n, 0);

  const rows = PUBLICOS
    .filter(p => byPublico.has(p.id))
    .map(p => {
      const d = byPublico.get(p.id)!;
      return {
        ...p,
        n: d.n,
        pct: Math.round((d.n / total) * 100),
        sentMedio: Math.round(d.sentTotal / d.sentCount),
      };
    })
    .sort((a, b) => b.n - a.n);

  const sentGeral = Math.round(
    rows.reduce((s, r) => s + r.sentMedio * r.n, 0) / rows.reduce((s, r) => s + r.n, 0)
  );

  return (
    <>
      <PageHeader title="Comentários analisados" />

      <div className="flex flex-col gap-6 px-8 pt-6 pb-8">

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total de comentários', value: total > 999 ? `${(total / 1000).toFixed(1)}k` : String(total) },
            { label: 'Grupos com dados qualitativos', value: rows.length },
            { label: 'Sentimento geral', value: sentGeral > 0 ? `+${sentGeral}` : String(sentGeral) },
          ].map(c => (
            <ShadCard key={c.label} className="p-[14px_16px] border-t-2 border-t-primary/25">
              <CardContent className="p-0">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-tight">
                  {c.label}
                </div>
                <div className="font-display text-[28px] font-black leading-tight tracking-[-0.02em] tabular-nums text-foreground">
                  {c.value}
                </div>
              </CardContent>
            </ShadCard>
          ))}
        </div>

        <ShadCard className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              Comentários por público
            </div>
            <p className="text-sm text-muted-foreground">
              Volume de respostas qualitativas e sentimento médio ponderado por grupo consultado.
            </p>
          </div>
          <div className="divide-y divide-border">
            {rows.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-40 shrink-0">
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
                <div className="w-24 text-right tabular-nums text-sm font-semibold text-foreground">
                  {r.n.toLocaleString('pt-BR')}
                </div>
                <div className="w-14 text-right">
                  <span className={cn(
                    'inline-block rounded px-2 py-0.5 text-xs font-bold tabular-nums',
                    sentColor(r.sentMedio),
                  )}>
                    {r.sentMedio > 0 ? '+' : ''}{r.sentMedio}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ShadCard>

        <ShadCard className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              Sentimento por tema
            </div>
            <p className="text-sm text-muted-foreground">
              Sentimento médio geral de cada tema calculado a partir dos comentários coletados.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Tema</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground whitespace-nowrap">ESG</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground whitespace-nowrap">Sentimento</th>
                </tr>
              </thead>
              <tbody>
                {[...THEMES]
                  .filter(t => t.sentimento != null)
                  .sort((a, b) => (a.sentimento ?? 0) - (b.sentimento ?? 0))
                  .map((t, i) => (
                    <tr key={t.id} className={cn('border-b border-border last:border-0', i % 2 === 0 ? 'bg-background' : 'bg-muted/20')}>
                      <td className="px-5 py-2.5 text-sm font-medium text-foreground">{t.nome}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={cn(
                          'inline-block rounded px-1.5 py-px text-[10px] font-bold',
                          t.esg === 'E' ? 'bg-green-100 text-green-700' : t.esg === 'S' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700',
                        )}>
                          {t.esg}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={cn(
                          'inline-block rounded px-2 py-0.5 text-xs font-bold tabular-nums',
                          sentColor(t.sentimento!),
                        )}>
                          {t.sentimento! > 0 ? '+' : ''}{t.sentimento}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </ShadCard>

      </div>
    </>
  );
}
