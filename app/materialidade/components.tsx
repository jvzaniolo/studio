import React from 'react';
import { Icon, Btn } from './icons';
import { sentColor, sentLabel, fmtSent, ORG } from './data';

/* ----- Card ----- */
interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  accent?: string;
  hoverable?: boolean;
}

export function Card({ children, style, onClick, accent, hoverable }: CardProps) {
  const [hov, setHov] = React.useState(false);
  const elevated = '0 4px 12px rgba(60,3,102,0.10), 0 1px 2px rgba(60,3,102,0.04)';
  const base = '0 1px 3px rgba(60,3,102,0.06), 0 1px 2px rgba(60,3,102,0.03)';
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => (onClick || hoverable) && setHov(true)}
      onMouseLeave={() => (onClick || hoverable) && setHov(false)}
      style={{
        position: 'relative',
        background: '#fff',
        borderRadius: 16,
        border: '1px solid var(--hu-border)',
        boxShadow: hov ? elevated : base,
        transition: 'box-shadow 200ms cubic-bezier(0.22,0.61,0.36,1), transform 200ms',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        ...style,
      }}>
      {accent && <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent,
      }}/>}
      {children}
    </div>
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
    <div style={{ padding: '24px 32px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {breadcrumbs && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--hu-muted)', flexWrap: 'wrap' }}>
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Icon name="chevron-right" size={11} color="#AA95BE"/>}
              <span
                onClick={b.onClick}
                style={{
                  cursor: b.onClick ? 'pointer' : 'default',
                  color: i === breadcrumbs.length - 1 ? 'var(--hu-text)' : 'var(--hu-muted)',
                  fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                }}>
                {b.label}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {eyebrow && (
            <div style={{
              fontFamily: 'var(--hu-font-body)',
              fontSize: 11, fontWeight: 700,
              letterSpacing: '0.10em', textTransform: 'uppercase',
              color: 'var(--hu-purple)', marginBottom: 8,
            }}>{eyebrow}</div>
          )}
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap',
            marginBottom: subtitle ? 8 : 0,
          }}>
            <h1 style={{
              fontFamily: 'var(--hu-font-display)',
              fontWeight: 900, fontSize: 30, lineHeight: 1.1,
              color: 'var(--hu-text)', letterSpacing: '-0.02em',
              margin: 0,
            }}>{title}</h1>
            {titlePill && (
              <span style={{ alignSelf: 'center', display: 'inline-flex' }}>{titlePill}</span>
            )}
          </div>
          {subtitle && (
            <div style={{ fontSize: 14, color: 'var(--hu-muted)', maxWidth: 760, lineHeight: 1.5 }}>{subtitle}</div>
          )}
        </div>
        {actions && <div className="mat-page-actions">{actions}</div>}
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
}

export function SectionTitle({ eyebrow, children, action, style }: SectionTitleProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      gap: 14, marginBottom: 12, ...style,
    }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <div style={{
            fontFamily: 'var(--hu-font-body)',
            fontSize: 11, fontWeight: 600,
            letterSpacing: '0.10em', textTransform: 'uppercase',
            color: 'var(--hu-muted)', marginBottom: 4,
          }}>{eyebrow}</div>
        )}
        <h2 style={{
          fontFamily: 'var(--hu-font-display)',
          fontWeight: 700, fontSize: 18, lineHeight: 1.25,
          color: 'var(--hu-text)', letterSpacing: '-0.01em',
          margin: 0,
        }}>{children}</h2>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
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

export function Donut({ value, size = 140, stroke = 14, color = '#7401C3', track = '#F4F4F5', label, sublabel }: DonutProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeDashoffset={c/4}
          strokeLinecap="round"
          transform={`rotate(0 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dasharray 400ms cubic-bezier(0.22,0.61,0.36,1)' }}/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 2,
      }}>
        <div style={{
          fontFamily: 'var(--hu-font-display)',
          fontWeight: 900, fontSize: size * 0.26, lineHeight: 1,
          color: 'var(--hu-text)', letterSpacing: '-0.02em',
        }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: 'var(--hu-muted)' }}>{sublabel}</div>}
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
  const r  = size * 0.40;
  const sw = size * 0.10;

  const v = value == null ? 0 : Math.max(-100, Math.min(100, value));
  const angle = Math.PI * (1 - (v + 100) / 200);
  const needleLen = r - sw * 0.55;
  const nx = cx + Math.cos(angle) * needleLen;
  const ny = cy - Math.sin(angle) * needleLen;

  const arcX1 = cx - r, arcY1 = cy;
  const arcX2 = cx + r;
  const fg = value == null ? '#AA95BE' : sentColor(value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={W} height={H + 12} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`sg-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#E03131"/>
            <stop offset="38%"  stopColor="#F59E0B"/>
            <stop offset="62%"  stopColor="#A8D85E"/>
            <stop offset="100%" stopColor="#00A970"/>
          </linearGradient>
        </defs>
        <path d={`M ${arcX1} ${arcY1} A ${r} ${r} 0 0 1 ${arcX2} ${cy}`}
          fill="none" stroke={`url(#sg-${size})`} strokeWidth={sw} strokeLinecap="round"/>
        {[-100, -50, 0, 50, 100].map(t => {
          const a = Math.PI * (1 - (t + 100) / 200);
          const x1 = cx + Math.cos(a) * (r - sw/2 - 2);
          const y1 = cy - Math.sin(a) * (r - sw/2 - 2);
          const x2 = cx + Math.cos(a) * (r + sw/2 + 4);
          const y2 = cy - Math.sin(a) * (r + sw/2 + 4);
          const tx = cx + Math.cos(a) * (r + sw/2 + 14);
          const ty = cy - Math.sin(a) * (r + sw/2 + 14);
          return (
            <g key={t}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={1.5} opacity={t === 0 ? 1 : 0.6}/>
              <text x={tx} y={ty + 3} textAnchor="middle" fontSize="9" fill="#AA95BE" fontWeight="600">{t}</text>
            </g>
          );
        })}
        {value != null && (
          <g style={{ transition: 'transform 400ms cubic-bezier(0.22,0.61,0.36,1)' }}>
            <line x1={cx} y1={cy} x2={nx} y2={ny}
              stroke="#0A0A0A" strokeWidth={2.5} strokeLinecap="round"/>
            <circle cx={cx} cy={cy} r={5} fill="#0A0A0A"/>
          </g>
        )}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{
          fontFamily: 'var(--hu-font-display)', fontWeight: 900, fontSize: 36, lineHeight: 1,
          color: fg, letterSpacing: '-0.02em',
        }}>{fmtSent(value)}</div>
        <div style={{ fontSize: 11.5, color: 'var(--hu-muted)', fontWeight: 600 }}>{sentLabel(value)}</div>
      </div>
    </div>
  );
}

/* ----- Tabs ----- */
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
    <div style={{
      display: 'flex', alignItems: 'stretch',
      borderBottom: '1px solid var(--hu-border)',
      background: '#fff',
      gap: 2,
      paddingLeft: 8,
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <button key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 16px 12px',
              border: 0, background: 'transparent',
              borderBottom: `2px solid ${isActive ? 'var(--hu-purple)' : 'transparent'}`,
              marginBottom: -1,
              color: isActive ? 'var(--hu-purple)' : 'var(--hu-muted)',
              fontWeight: isActive ? 700 : 500, fontSize: 13.5,
              cursor: 'pointer',
              transition: 'color 150ms, border-color 150ms',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--hu-text)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--hu-muted)'; }}
          >
            {t.icon && <Icon name={t.icon} size={15} color="currentColor"/>}
            <span>{t.label}</span>
            {t.badge != null && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? 'var(--hu-purple-light)' : '#F4F4F5',
                color: isActive ? 'var(--hu-purple-active)' : 'var(--hu-muted)',
                fontSize: 11, fontWeight: 700,
                padding: '1px 7px', borderRadius: 999, minWidth: 18,
              }}>{t.badge}</span>
            )}
          </button>
        );
      })}
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
}

export function AIInsight({ title, sintese, prioridades, tone = 'brand', compact = false, style }: AIInsightProps) {
  const palette: Record<string, { from: string; to: string; border: string; accent: string; accentBg: string; dot: string }> = {
    brand:   { from: '#FAF5FE', to: '#F6EDFB', border: '#E8D9F2', accent: '#7401C3', accentBg: '#EFE3F8', dot: '#7401C3' },
    warning: { from: '#FFFBEB', to: '#FEF3C7', border: '#FDE68A', accent: '#92400E', accentBg: '#FEF3C7', dot: '#F59E0B' },
    danger:  { from: '#FEF2F2', to: '#FEE2E2', border: '#FECACA', accent: '#991B1B', accentBg: '#FEE2E2', dot: '#E03131' },
  };
  const c = palette[tone] || palette.brand;
  return (
    <div style={{
      background: `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)`,
      border: `1px solid ${c.border}`,
      borderRadius: 16,
      padding: compact ? '14px 18px' : '20px 24px',
      display: 'flex', flexDirection: 'column', gap: compact ? 8 : 14,
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: 8,
          background: '#fff', border: `1px solid ${c.border}`,
        }}>
          <Icon name="sparkles" size={15} color={c.accent}/>
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: c.accentBg, color: c.accent,
          fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em',
          padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: c.dot }}/>
          IA · Análise
        </span>
        {title && (
          <span style={{ fontFamily: 'var(--hu-font-display)', fontWeight: 700, fontSize: 14.5, color: c.accent }}>
            {title}
          </span>
        )}
      </div>
      {sintese && (
        <div style={{
          fontSize: compact ? 13 : 13.5, lineHeight: 1.55,
          color: '#3F2454',
        }}>
          {sintese}
        </div>
      )}
      {prioridades && prioridades.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
            color: c.accent, opacity: 0.8,
          }}>Próximas prioridades</div>
          {prioridades.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                background: '#fff', color: c.accent,
                border: `1.5px solid ${c.accent}`,
                fontFamily: 'var(--hu-font-display)', fontWeight: 900, fontSize: 11,
              }}>{i + 1}</span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: '#3F2454', paddingTop: 2 }}>{p}</span>
            </div>
          ))}
        </div>
      )}
    </div>
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
}

export function AIFlat({ title, sintese, tone, action, footer = true, style }: AIFlatProps) {
  const toneMap: Record<string, { bg: string; border: string; iconBg: string; iconFg: string; label: string }> = {
    danger:  { bg: '#FEF2F2', border: '#FECACA', iconBg: '#FEE2E2', iconFg: '#991B1B', label: 'Alerta IA' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', iconBg: '#FEF3C7', iconFg: '#92400E', label: 'Atenção IA' },
    neutral: { bg: '#FAFAFA', border: '#E5E5E5', iconBg: '#F4F4F5', iconFg: '#525252', label: 'Análise IA' },
  };
  const c = toneMap[tone || 'neutral'] || toneMap.neutral;
  const [useful, setUseful] = React.useState<'up' | 'down' | null>(null);
  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      padding: '16px 20px',
      display: 'flex', flexDirection: 'column', gap: 12,
      ...style,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, paddingBottom: 10, borderBottom: `1px solid ${c.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="sparkles" size={14} color={c.iconFg}/>
          <span style={{ fontSize: 13, fontWeight: 600, color: c.iconFg }}>{title || c.label}</span>
        </div>
        {action}
      </div>
      {sintese && (
        <div style={{ fontSize: 13.5, lineHeight: 1.55, color: '#1a1a1a' }}>{sintese}</div>
      )}
      {footer && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 12, color: '#737373', marginTop: 2,
        }}>
          <span>Esta informação foi útil?</span>
          <button onClick={() => setUseful(useful === 'up' ? null : 'up')}
            aria-label="Útil"
            style={{
              width: 24, height: 24, padding: 0, borderRadius: 6, cursor: 'pointer',
              border: '1px solid transparent', background: 'transparent',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: useful === 'up' ? '#00A970' : '#737373',
              transition: 'background 120ms, border-color 120ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.background = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}>
            <Icon name="thumbs-up" size={13} color="currentColor"/>
          </button>
          <button onClick={() => setUseful(useful === 'down' ? null : 'down')}
            aria-label="Não útil"
            style={{
              width: 24, height: 24, padding: 0, borderRadius: 6, cursor: 'pointer',
              border: '1px solid transparent', background: 'transparent',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: useful === 'down' ? '#C81E1E' : '#737373',
              transition: 'background 120ms, border-color 120ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.background = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}>
            <Icon name="thumbs-down" size={13} color="currentColor"/>
          </button>
        </div>
      )}
    </div>
  );
}

/* ----- FloatingAIButton + Drawer ----- */
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
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 60,
          width: 56, height: 56, borderRadius: 999,
          background: '#7401C3', color: '#fff',
          border: 0, cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(116, 1, 195, 0.3)',
          transition: 'transform 180ms cubic-bezier(0.22,0.61,0.36,1), box-shadow 180ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(116, 1, 195, 0.42)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(116, 1, 195, 0.3)'; }}>
        <Icon name="sparkles" size={24} color="#fff"/>
      </button>
      {open && <AIDrawer themeName={themeName} suggestions={suggestions} onClose={() => setOpen(false)}/>}
    </>
  );
}

interface AIDrawerProps {
  themeName?: string;
  suggestions?: string[];
  onClose: () => void;
}

export function AIDrawer({ themeName, suggestions, onClose }: AIDrawerProps) {
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
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.32)',
        zIndex: 70, animation: 'hu-fade-in 180ms both',
      }}/>
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, maxWidth: '100vw',
        background: '#fff', zIndex: 80,
        boxShadow: '-12px 0 32px rgba(60,3,102,0.18)',
        display: 'flex', flexDirection: 'column',
        animation: 'hu-slide-in 220ms cubic-bezier(0.22,0.61,0.36,1) both',
      }}>
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid #E5E5E5',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: '#7401C3', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="sparkles" size={18} color="#fff"/>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A' }}>Assistente IA</div>
            <div style={{ fontSize: 12, color: '#737373', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              Tema · {themeName}
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar"
            style={{
              width: 32, height: 32, borderRadius: 8, cursor: 'pointer', padding: 0,
              background: 'transparent', border: '1px solid #E5E5E5',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#525252',
            }}>
            <Icon name="x" size={14} color="currentColor"/>
          </button>
        </div>
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {thread.length === 0 && (
            <div style={{
              background: '#FAFAFA', border: '1px solid #E5E5E5', borderRadius: 12,
              padding: '14px 16px',
              fontSize: 13, lineHeight: 1.55, color: '#1a1a1a',
            }}>
              Olá! Posso ajudar você a explorar este tema material. Use uma das sugestões abaixo ou faça uma pergunta direta.
            </div>
          )}
          {thread.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: m.role === 'user' ? '#EDE9FE' : '#FAFAFA',
              border: m.role === 'user' ? '1px solid #DDD6FE' : '1px solid #E5E5E5',
              borderRadius: 12, padding: '10px 14px',
              fontSize: 13, lineHeight: 1.5, color: '#1a1a1a',
            }}>{m.text}</div>
          ))}
          <div style={{
            marginTop: 4,
            fontSize: 11, fontWeight: 600, color: '#737373',
            letterSpacing: '0.02em', textTransform: 'uppercase',
          }}>Sugestões</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {sugs.map((s, i) => (
              <button key={i} onClick={() => submit(s)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', borderRadius: 999, cursor: 'pointer',
                  background: '#fff', border: '1px solid #E5E5E5',
                  fontSize: 12.5, color: '#3C0366', fontWeight: 500,
                  transition: 'background 120ms, border-color 120ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F6EDFB'; e.currentTarget.style.borderColor = '#DDD6FE'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E5E5E5'; }}>
                <Icon name="sparkles" size={11} color="#7401C3"/>
                {s}
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); submit(input); }}
          style={{
            padding: '14px 16px', borderTop: '1px solid #E5E5E5',
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#FAFAFA',
          }}>
          <input value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo sobre este tema..."
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              border: '1px solid #E5E5E5', background: '#fff',
              fontSize: 13, color: '#1a1a1a', outline: 'none',
            }}/>
          <button type="submit"
            disabled={!input.trim()}
            style={{
              padding: '10px 14px', borderRadius: 10, cursor: input.trim() ? 'pointer' : 'not-allowed',
              border: 0, background: input.trim() ? '#7401C3' : '#E5E5E5',
              color: '#fff', fontSize: 13, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
            <Icon name="arrow-right" size={14} color="#fff"/>
          </button>
        </form>
      </aside>
    </>
  );
}

/* ----- EmptyState ----- */
interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export function EmptyState({ icon = 'info', title, subtitle, action, style }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '36px 24px', gap: 12, textAlign: 'center', ...style,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 999,
        background: 'var(--hu-purple-light)', color: 'var(--hu-purple)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={22} color="var(--hu-purple)"/>
      </div>
      <div style={{
        fontFamily: 'var(--hu-font-display)', fontWeight: 700, fontSize: 15.5,
        color: 'var(--hu-text)',
      }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: 13, color: 'var(--hu-muted)', maxWidth: 380, lineHeight: 1.55 }}>{subtitle}</div>
      )}
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
}

/* ----- MiniStat ----- */
interface MiniStatProps {
  icon: string;
  iconColor?: string;
  label: string;
  value: React.ReactNode;
}

export function MiniStat({ icon, iconColor = '#7401C3', label, value }: MiniStatProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: `${iconColor}1A`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={16} color={iconColor}/>
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: 'var(--hu-muted)', fontWeight: 500 }}>{label}</div>
        <div style={{
          fontFamily: 'var(--hu-font-display)', fontWeight: 900, fontSize: 18, lineHeight: 1.2,
          color: 'var(--hu-text)', letterSpacing: '-0.01em',
        }}>{value}</div>
      </div>
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

export function Chip({ icon, label, value, color = '#7401C3' }: ChipProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: '8px 12px', borderRadius: 10,
      background: '#fff', border: '1px solid var(--hu-border)',
      minWidth: 100,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'var(--hu-muted)',
      }}>
        {icon && <Icon name={icon} size={11} color="#AA95BE"/>}
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--hu-font-display)', fontWeight: 700, fontSize: 13,
        color, letterSpacing: '-0.01em',
      }}>{value}</div>
    </div>
  );
}
