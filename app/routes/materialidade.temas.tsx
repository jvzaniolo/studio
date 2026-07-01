import React from 'react';
import { Link } from 'react-router';
import { PageHeader } from '~/components/page-header';
import { Card as ShadCard } from '~/components/ui/card';
import { MaterialidadeBreadcrumb } from '~/materialidade/components';
import { THEMES, themeStatus } from '~/materialidade/data';
import { cn } from '~/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  danger:  'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-green-100 text-green-700',
  neutral: 'bg-muted text-muted-foreground',
};

const ESG_COLOR: Record<string, string> = {
  E: 'bg-green-100 text-green-700',
  S: 'bg-blue-100 text-blue-700',
  G: 'bg-violet-100 text-violet-700',
};

export default function TemasPage() {
  const [filter, setFilter] = React.useState<'todos' | 'E' | 'S' | 'G'>('todos');

  const temas = THEMES
    .map(t => ({ ...t, status: themeStatus(t, t.x, t.y, t.sentimento) }))
    .filter(t => filter === 'todos' || t.esg === filter)
    .sort((a, b) => (b.x + b.y) - (a.x + a.y));

  const counts = { E: 0, S: 0, G: 0 };
  THEMES.forEach(t => { counts[t.esg]++; });

  return (
    <>
      <PageHeader
        title={<MaterialidadeBreadcrumb current="Temas identificados" />}
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-[3px]">
            {(['todos', 'E', 'S', 'G'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap',
                  filter === f
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f === 'todos' ? `Todos (${THEMES.length})` : `${f} (${counts[f]})`}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex flex-col gap-3 px-8 pt-6 pb-8">
        {temas.map(t => {
          const isPrioritario = t.x >= 75 && t.y >= 65;
          return (
            <Link key={t.id} to={`/materialidade/tema/${t.id}`} className="block">
              <ShadCard className="p-0 transition-shadow hover:shadow-md cursor-pointer border-l-4 overflow-hidden"
                style={{ borderLeftColor: isPrioritario ? 'var(--color-primary)' : 'transparent' }}
              >
                <div className="flex items-center gap-4 px-5 py-4 w-full">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {String(t.id).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground leading-snug">{t.nome}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{t.descricao}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('rounded px-1.5 py-px text-[10px] font-bold', ESG_COLOR[t.esg])}>
                    {t.esg}
                  </span>
                  <span className={cn('rounded px-2 py-0.5 text-[10px] font-semibold', STATUS_COLOR[t.status.tone])}>
                    {t.status.label}
                  </span>
                  {isPrioritario && (
                    <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary">
                      Prioritário
                    </span>
                  )}
                </div>
                <div className="flex gap-3 shrink-0 text-xs text-muted-foreground">
                  <div className="text-center">
                    <div className="font-bold text-foreground tabular-nums">{t.x}</div>
                    <div>Impacto</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground tabular-nums">{t.y}</div>
                    <div>Relevância</div>
                  </div>
                </div>
                </div>
              </ShadCard>
            </Link>
          );
        })}
      </div>
    </>
  );
}
