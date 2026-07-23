import React from 'react';
import { Link } from 'react-router';
import { PageHeader } from '~/components/page-header';
import { Card as ShadCard, CardContent } from '~/components/ui/card';
import { MaterialidadeBreadcrumb } from '~/materialidade/components';
import { THEMES } from '~/materialidade/data';
import { cn } from '~/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

const ESG_COLOR: Record<string, string> = {
  E: 'bg-green-100 text-green-700',
  S: 'bg-blue-100 text-blue-700',
  G: 'bg-violet-100 text-violet-700',
};

const ESG_LABEL: Record<string, string> = {
  E: 'Ambiental',
  S: 'Social',
  G: 'Governança',
};

function sentColor(v: number | null) {
  if (v == null) return 'bg-muted text-muted-foreground';
  if (v >= 15) return 'bg-green-100 text-green-700';
  if (v <= -15) return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-700';
}

export default function PrioritariosPage() {
  const prioritarios = THEMES
    .filter(t => t.x >= 75 && t.y >= 65)
    .sort((a, b) => (b.x + b.y) - (a.x + a.y));

  const criticos = prioritarios.filter(t => t.sentimento != null && t.sentimento < -10);
  const saudaveis = prioritarios.filter(t => t.sentimento != null && t.sentimento >= 10);

  return (
    <>
      <PageHeader title={<MaterialidadeBreadcrumb current="Temas prioritários" />} />

      <div className="flex flex-col gap-6 px-8 pt-6 pb-8">

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Temas prioritários', value: prioritarios.length },
            { label: 'Sentimento crítico', value: criticos.length },
            { label: 'Sentimento positivo', value: saudaveis.length },
          ].map(c => (
            <ShadCard key={c.label} className="p-[14px_16px] border-t-2 border-t-primary/25">
              <CardContent className="p-0">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-tight">
                  {c.label}
                </div>
                <div className="font-display text-[28px] font-black leading-tight tracking-[-0.02em] tabular-nums text-foreground">
                  {String(c.value).padStart(2, '0')}
                </div>
              </CardContent>
            </ShadCard>
          ))}
        </div>

        <p className="text-xs text-muted-foreground -mt-2">
          Temas com impacto nos negócios ≥ 75 e relevância para stakeholders ≥ 65 na matriz atual.
        </p>

        <div className="flex flex-col gap-3">
          {prioritarios.map((t, i) => (
            <Link key={t.id} to={`/materialidade/tema/${t.id}`} className="block">
              <ShadCard className="p-0 transition-shadow hover:shadow-md cursor-pointer border-l-4 border-l-primary overflow-hidden">
              <div className="flex items-start gap-4 px-5 py-5 w-full">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{t.nome}</span>
                    <Tooltip>
                      <TooltipTrigger render={<span className="cursor-help" />}>
                        <span className={cn('rounded px-1.5 py-px text-[10px] font-bold', ESG_COLOR[t.esg])}>
                          {t.esg}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Dimensão ESG: {ESG_LABEL[t.esg] ?? t.esg}</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-xs text-muted-foreground leading-snug">{t.descricao}</div>
                  {t.gri.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {t.gri.map(g => (
                        <Tooltip key={g}>
                          <TooltipTrigger render={<span className="cursor-help" />}>
                            <span className="rounded bg-muted px-1.5 py-px text-[10px] text-muted-foreground font-medium">
                              {g}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Norma GRI (Global Reporting Initiative) referenciada por este tema.</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Tooltip>
                    <TooltipTrigger render={<span className="cursor-help" />}>
                      <span className={cn('rounded px-2 py-0.5 text-xs font-bold tabular-nums', sentColor(t.sentimento))}>
                        {t.sentimento == null ? 'Sem dado' : (t.sentimento > 0 ? `+${t.sentimento}` : String(t.sentimento))}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Sentimento agregado dos stakeholders sobre este tema (escala −100 a +100).</TooltipContent>
                  </Tooltip>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <div className="text-center">
                      <div className="font-bold text-foreground tabular-nums">{t.x}</div>
                      <div>Financeira</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-foreground tabular-nums">{t.y}</div>
                      <div>Impacto</div>
                    </div>
                  </div>
                </div>
              </div>
              </ShadCard>
            </Link>
          ))}
        </div>

      </div>
    </>
  );
}
