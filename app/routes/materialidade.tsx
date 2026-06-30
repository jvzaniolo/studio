import React from 'react';
import { useNavigate } from 'react-router';
import { Overview } from '~/materialidade/matrix';
import { PageHeader } from '~/components/page-header';
import { VERSOES, PUBLICOS } from '~/materialidade/data';
import { ChevronDown, Check, Filter } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
import { Button } from '~/components/ui/button';

function CycleDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const current = VERSOES.find(v => v.id === value) ?? VERSOES.find(v => v.atual)!;

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const statusLabel: Record<string, string> = { publicada: 'atual', arquivada: 'arquivada', rascunho: 'rascunho' };
  const statusColor: Record<string, string> = {
    publicada: 'text-green-600 bg-green-50 border-green-200',
    arquivada: 'text-muted-foreground bg-muted border-border',
    rascunho:  'text-amber-600 bg-amber-50 border-amber-200',
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <span>Ciclo {current.curto}</span>
        <span className={cn('rounded border px-1.5 py-px text-[10px] font-semibold', statusColor[current.status] ?? statusColor.arquivada)}>
          {statusLabel[current.status] ?? current.status}
        </span>
        <ChevronDown className={cn('size-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[260px] rounded-xl border border-border bg-popover p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
          <p className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Selecionar ciclo
          </p>
          {VERSOES.map(v => (
            <button
              key={v.id}
              onClick={() => { onChange(v.id); setOpen(false); }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted/60',
                value === v.id && 'bg-primary/5',
              )}
            >
              <span className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded-full border',
                value === v.id ? 'border-primary bg-primary' : 'border-muted-foreground/30 bg-background',
              )}>
                {value === v.id && <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-foreground">{v.label}</span>
                <span className="text-xs text-muted-foreground">Publicada em {v.publicada_em}</span>
              </span>
              <span className={cn('rounded border px-1.5 py-px text-[10px] font-semibold', statusColor[v.status] ?? statusColor.arquivada)}>
                {statusLabel[v.status] ?? v.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FiltersSheet({ active, onToggle, onAll, onNone }: {
  active: string[];
  onToggle: (id: string) => void;
  onAll: () => void;
  onNone: () => void;
}) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm">
            <Filter data-icon="inline-start" />
            Filtros
          </Button>
        }
      />
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>
            Filtre os dados por público consultado.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Público
            </span>
            <div className="flex gap-2">
              <button onClick={onAll} className="text-xs text-primary hover:underline">Todos</button>
              <button onClick={onNone} className="text-xs text-muted-foreground hover:underline">Nenhum</button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {PUBLICOS.map(p => {
              const checked = active.includes(p.id);
              return (
                <label key={p.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-muted/60">
                  <span className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                    checked ? 'border-primary bg-primary' : 'border-muted-foreground/40 bg-background',
                  )}>
                    {checked && <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />}
                  </span>
                  <input type="checkbox" className="sr-only" checked={checked} onChange={() => onToggle(p.id)} />
                  <span className="text-sm text-foreground">{p.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function MaterialidadePage() {
  const navigate = useNavigate();
  const [cycle, setCycle] = React.useState('v2025');
  const [active, setActive] = React.useState(() => PUBLICOS.map(p => p.id));

  const toggle = (id: string) => setActive(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  const selectAll = () => setActive(PUBLICOS.map(p => p.id));
  const selectNone = () => setActive([]);

  return (
    <>
      <PageHeader
        title="Matriz de Materialidade"
        actions={
          <div className="flex items-center gap-2">
            <CycleDropdown value={cycle} onChange={setCycle} />
            <FiltersSheet active={active} onToggle={toggle} onAll={selectAll} onNone={selectNone} />
          </div>
        }
      />
      <Overview
        onPickTheme={id => navigate(`/materialidade/tema/${id}`)}
        activeCycle={cycle}
        externalActive={active}
        onExternalToggle={toggle}
        onExternalSelectAll={selectAll}
        onExternalSelectNone={selectNone}
      />
    </>
  );
}
