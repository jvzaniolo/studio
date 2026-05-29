import React from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, ArrowRight, X } from 'lucide-react';
import { cn } from '~/lib/utils';
import { sentColor, sentLabel, fmtSent } from './data';
import {
  Card as ShadCard,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import {
  Tabs as ShadTabs,
  TabsList,
  TabsTrigger,
} from '~/components/ui/tabs';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '~/components/ui/empty';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';

/* ----- Card ----- */
interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  accent?: string;
  hoverable?: boolean;
  className?: string;
}

export function Card({ children, style, onClick, accent, hoverable, className }: CardProps) {
  return (
    <ShadCard
      onClick={onClick}
      className={cn(
        'relative overflow-hidden',
        (onClick || hoverable) && 'cursor-pointer transition-shadow hover:shadow-md',
        className,
      )}
      style={style}
    >
      {accent && (
        <div className="absolute inset-y-0 left-0 w-[3px]" style={{ background: accent }} />
      )}
      {children}
    </ShadCard>
  );
}

/* ----- PageHeader ----- */
interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  titlePill?: React.ReactNode;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, titlePill, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="px-8 pt-6 pb-5 flex flex-col gap-3">
      {breadcrumbs && (
        <nav className="flex items-center gap-1.5 flex-wrap">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-muted-foreground/40 text-xs">›</span>}
              <span
                onClick={b.onClick}
                className={cn(
                  'text-xs',
                  i === breadcrumbs.length - 1
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground',
                  b.onClick && 'cursor-pointer hover:text-foreground',
                )}
              >
                {b.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              {eyebrow}
            </p>
          )}
          <div className="flex items-baseline gap-3 flex-wrap mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            {titlePill && <span className="self-center">{titlePill}</span>}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="mat-page-actions flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}

/* ----- SectionTitle ----- */
interface SectionTitleProps {
  eyebrow?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function SectionTitle({ eyebrow, children, action, style, className }: SectionTitleProps) {
  return (
    <div className={cn('flex items-end justify-between gap-3 mb-3', className)} style={style}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{children}</h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ----- Donut ----- */
interface DonutProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: React.ReactNode;
  sublabel?: string;
}

export function Donut({ value, size = 140, stroke = 14, color = 'var(--primary)', track = 'var(--muted)', label, sublabel }: DonutProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeDashoffset={c / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 400ms cubic-bezier(0.22,0.61,0.36,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <div className="font-bold text-foreground" style={{ fontSize: size * 0.26, lineHeight: 1 }}>{label}</div>
        {sublabel && <div className="text-[11px] text-muted-foreground">{sublabel}</div>}
      </div>
    </div>
  );
}

/* ----- SentimentGauge ----- */
interface SentimentGaugeProps {
  value: number | null;
  size?: number;
}

export function SentimentGauge({ value, size = 180 }: SentimentGaugeProps) {
  const W = size;
  const H = size * 0.62;
  const cx = W / 2;
  const cy = H * 0.92;
  const r = size * 0.40;
  const sw = size * 0.10;

  const v = value == null ? 0 : Math.max(-100, Math.min(100, value));
  const angle = Math.PI * (1 - (v + 100) / 200);
  const needleLen = r - sw * 0.55;
  const nx = cx + Math.cos(angle) * needleLen;
  const ny = cy - Math.sin(angle) * needleLen;

  const arcX1 = cx - r;
  const arcX2 = cx + r;
  const fg = value == null ? 'var(--muted-foreground)' : sentColor(value);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={W} height={H + 12} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`sg-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E03131" />
            <stop offset="38%" stopColor="#F59E0B" />
            <stop offset="62%" stopColor="#A8D85E" />
            <stop offset="100%" stopColor="#00A970" />
          </linearGradient>
        </defs>
        <path d={`M ${arcX1} ${cy} A ${r} ${r} 0 0 1 ${arcX2} ${cy}`}
          fill="none" stroke={`url(#sg-${size})`} strokeWidth={sw} strokeLinecap="round" />
        {[-100, -50, 0, 50, 100].map(t => {
          const a = Math.PI * (1 - (t + 100) / 200);
          const x1 = cx + Math.cos(a) * (r - sw / 2 - 2);
          const y1 = cy - Math.sin(a) * (r - sw / 2 - 2);
          const x2 = cx + Math.cos(a) * (r + sw / 2 + 4);
          const y2 = cy - Math.sin(a) * (r + sw / 2 + 4);
          const tx = cx + Math.cos(a) * (r + sw / 2 + 14);
          const ty = cy - Math.sin(a) * (r + sw / 2 + 14);
          return (
            <g key={t}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={1.5} opacity={t === 0 ? 1 : 0.6} />
              <text x={tx} y={ty + 3} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)" fontWeight="600">{t}</text>
            </g>
          );
        })}
        {value != null && (
          <g>
            <line x1={cx} y1={cy} x2={nx} y2={ny}
              stroke="var(--foreground)" strokeWidth={2.5} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r={5} fill="var(--foreground)" />
          </g>
        )}
      </svg>
      <div className="flex flex-col items-center gap-0.5">
        <div className="text-4xl font-bold tracking-tight" style={{ color: fg, lineHeight: 1 }}>
          {fmtSent(value)}
        </div>
        <div className="text-xs font-semibold text-muted-foreground">{sentLabel(value)}</div>
      </div>
    </div>
  );
}

/* ----- Tabs (tab-bar only, content rendered by parent) ----- */
interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: number | string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="border-b border-border bg-background">
      <ShadTabs value={active} onValueChange={onChange} className="w-full">
        <TabsList variant="line" className="h-auto w-full justify-start rounded-none px-4 pb-0 gap-0">
          {tabs.map(t => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="flex items-center gap-2 pb-3 pt-3 px-4 rounded-none border-b-2 data-active:border-primary data-active:text-primary border-transparent"
            >
              <span>{t.label}</span>
              {t.badge != null && (
                <Badge
                  variant={t.id === active ? 'default' : 'secondary'}
                  className="h-4 min-w-4 px-1 text-[10px]"
                >
                  {t.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </ShadTabs>
    </div>
  );
}

/* ----- AIInsight ----- */
interface AIInsightProps {
  title?: string;
  sintese?: string;
  prioridades?: string[];
  tone?: 'brand' | 'warning' | 'danger';
  compact?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function AIInsight({ title, sintese, prioridades, tone = 'brand', compact = false, style, className }: AIInsightProps) {
  const toneClasses = {
    brand:   'from-primary/5 via-card to-card ring-1 ring-primary/15',
    warning: 'from-amber-50 via-card to-card ring-1 ring-amber-200',
    danger:  'from-red-50 via-card to-card ring-1 ring-red-200',
  };
  const toneText = {
    brand:   'text-primary',
    warning: 'text-amber-700',
    danger:  'text-red-700',
  };
  const toneBadge = {
    brand:   'bg-primary/10 text-primary',
    warning: 'bg-amber-100 text-amber-700',
    danger:  'bg-red-100 text-red-700',
  };
  return (
    <ShadCard
      className={cn(
        'relative overflow-hidden bg-linear-to-br',
        toneClasses[tone] || toneClasses.brand,
        className,
      )}
      style={style}
    >
      <CardContent className={cn('flex flex-col gap-4', compact ? 'p-4' : 'p-5')}>
        <div className="flex items-center gap-2.5">
          <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg border bg-background', `border-current/20`)}>
            <Sparkles className={cn('size-3.5', toneText[tone] || toneText.brand)} />
          </div>
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', toneBadge[tone] || toneBadge.brand)}>
            <span className={cn('size-1.5 rounded-full', tone === 'brand' ? 'bg-primary' : tone === 'warning' ? 'bg-amber-500' : 'bg-destructive')} />
            IA · Análise
          </span>
          {title && (
            <span className={cn('font-semibold text-sm', toneText[tone] || toneText.brand)}>{title}</span>
          )}
        </div>

        {sintese && (
          <p className={cn('text-sm leading-relaxed', toneText[tone] === 'text-primary' ? 'text-foreground/80' : toneText[tone])}>
            {sintese}
          </p>
        )}

        {prioridades && prioridades.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className={cn('text-[10px] font-bold uppercase tracking-widest opacity-70', toneText[tone] || toneText.brand)}>
              Próximas prioridades
            </p>
            {prioridades.map((p, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold bg-background',
                  toneText[tone] || toneText.brand,
                )}>
                  {i + 1}
                </span>
                <span className="text-sm leading-snug text-foreground/80 pt-0.5">{p}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </ShadCard>
  );
}

/* ----- AIFlat ----- */
interface AIFlatProps {
  title?: string;
  sintese?: React.ReactNode;
  tone?: 'danger' | 'warning' | 'neutral';
  action?: React.ReactNode;
  footer?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function AIFlat({ title, sintese, tone, action, footer = true, style, className }: AIFlatProps) {
  const toneClasses = {
    danger:  'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    neutral: 'bg-muted/50 border-border',
  };
  const iconClass = {
    danger:  'text-red-700',
    warning: 'text-amber-700',
    neutral: 'text-muted-foreground',
  };
  const t = tone || 'neutral';
  const [useful, setUseful] = React.useState<'up' | 'down' | null>(null);
  return (
    <div
      className={cn('rounded-xl border p-4 flex flex-col gap-3', toneClasses[t] || toneClasses.neutral, className)}
      style={style}
    >
      <div className={cn('flex items-center justify-between gap-2 pb-3 border-b', t === 'danger' ? 'border-red-200' : t === 'warning' ? 'border-amber-200' : 'border-border')}>
        <div className="flex items-center gap-2">
          <Sparkles className={cn('size-3.5', iconClass[t] || iconClass.neutral)} />
          <span className={cn('text-sm font-semibold', iconClass[t] || iconClass.neutral)}>
            {title || (t === 'danger' ? 'Alerta IA' : t === 'warning' ? 'Atenção IA' : 'Análise IA')}
          </span>
        </div>
        {action}
      </div>
      {sintese && (
        <div className="text-sm leading-relaxed text-foreground">{sintese}</div>
      )}
      {footer && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span>Esta informação foi útil?</span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setUseful(useful === 'up' ? null : 'up')}
            className={useful === 'up' ? 'text-green-600' : ''}
            aria-label="Útil"
          >
            <ThumbsUp className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setUseful(useful === 'down' ? null : 'down')}
            className={useful === 'down' ? 'text-destructive' : ''}
            aria-label="Não útil"
          >
            <ThumbsDown className="size-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ----- FloatingAIButton + AIDrawer (via Sheet) ----- */
interface FloatingAIButtonProps {
  themeName?: string;
  suggestions?: string[];
}

export function FloatingAIButton({ themeName, suggestions }: FloatingAIButtonProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Assistente IA"
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
      >
        <Sparkles className="size-6" />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[480px] max-w-full flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b flex-row items-center gap-3 space-y-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-sm font-semibold text-left">Assistente IA</SheetTitle>
              <p className="text-xs text-muted-foreground truncate">Tema · {themeName}</p>
            </div>
          </SheetHeader>
          <AIDrawerBody themeName={themeName} suggestions={suggestions} onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}

interface AIDrawerBodyProps {
  themeName?: string;
  suggestions?: string[];
  onClose: () => void;
}

function AIDrawerBody({ suggestions, onClose: _onClose }: AIDrawerBodyProps) {
  const [input, setInput] = React.useState('');
  const [thread, setThread] = React.useState<{ role: string; text: string }[]>([]);
  const submit = (text: string) => {
    if (!text.trim()) return;
    setThread(t => [...t, { role: 'user', text }]);
    setInput('');
  };
  const sugs = suggestions || [
    'Compare com a Matriz 2024',
    'Sumarize as percepções dos fornecedores',
    'Identifique citações divergentes',
    'Sugira conexões com outros temas',
  ];
  return (
    <>
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        {thread.length === 0 && (
          <div className="rounded-xl border bg-muted/50 p-4 text-sm leading-relaxed text-foreground">
            Olá! Posso ajudar você a explorar este tema material. Use uma das sugestões abaixo ou faça uma pergunta direta.
          </div>
        )}
        {thread.map((m, i) => (
          <div key={i} className={cn(
            'max-w-[85%] rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed',
            m.role === 'user'
              ? 'self-end bg-primary/10 border-primary/20 text-foreground'
              : 'self-start bg-muted/50 border-border text-foreground',
          )}>
            {m.text}
          </div>
        ))}
        <Separator className="my-1" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sugestões</p>
        <div className="flex flex-wrap gap-2">
          {sugs.map((s, i) => (
            <button
              key={i}
              onClick={() => submit(s)}
              className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-primary/5 hover:border-primary/30"
            >
              <Sparkles className="size-3 text-primary" />
              {s}
            </button>
          ))}
        </div>
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); submit(input); }}
        className="flex items-center gap-2 border-t bg-muted/30 px-4 py-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte algo sobre este tema..."
          className="flex-1 bg-background"
        />
        <Button type="submit" disabled={!input.trim()} size="icon">
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </>
  );
}

export function AIDrawer({ themeName, suggestions, onClose }: { themeName?: string; suggestions?: string[]; onClose: () => void }) {
  return <AIDrawerBody themeName={themeName} suggestions={suggestions} onClose={onClose} />;
}

/* ----- EmptyState ----- */
interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export function EmptyState({ title, subtitle, action, style }: EmptyStateProps) {
  return (
    <Empty style={style}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Sparkles className="size-5 text-primary" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {subtitle && <EmptyDescription>{subtitle}</EmptyDescription>}
      </EmptyHeader>
      {action}
    </Empty>
  );
}

/* ----- MiniStat ----- */
interface MiniStatProps {
  icon: string;
  iconColor?: string;
  label: string;
  value: React.ReactNode;
}

export function MiniStat({ label, value }: MiniStatProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-lg font-bold tracking-tight text-foreground">{value}</span>
    </div>
  );
}

/* ----- Chip ----- */
interface ChipProps {
  icon?: string;
  label: string;
  value: React.ReactNode;
  color?: string;
}

export function Chip({ label, value, color }: ChipProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card px-3 py-2 min-w-[100px]">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-sm font-bold tracking-tight" style={{ color: color || 'var(--primary)' }}>
        {value}
      </span>
    </div>
  );
}
