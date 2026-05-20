import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  stroke?: number;
}

export function Icon({ name, size = 16, color = 'currentColor', stroke = 1.75 }: IconProps) {
  const s = size;
  const common = {
    width: s, height: s, viewBox: '0 0 24 24' as const, fill: 'none' as const,
    stroke: color, strokeWidth: stroke,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    style: { flexShrink: 0 as const, display: 'block' as const },
  };
  switch (name) {
    case 'chevron-down':      return <svg {...common}><polyline points="6 9 12 15 18 9"/></svg>;
    case 'chevron-up':        return <svg {...common}><polyline points="18 15 12 9 6 15"/></svg>;
    case 'chevron-right':     return <svg {...common}><polyline points="9 6 15 12 9 18"/></svg>;
    case 'chevron-left':      return <svg {...common}><polyline points="15 6 9 12 15 18"/></svg>;
    case 'chevrons-up-down':  return <svg {...common}><polyline points="7 15 12 20 17 15"/><polyline points="7 9 12 4 17 9"/></svg>;
    case 'layout':    return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
    case 'target':    return <svg {...common}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    case 'grid':      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case 'clock':     return <svg {...common}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case 'info':      return <svg {...common}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
    case 'alert':     return <svg {...common}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    case 'arrow-right': return <svg {...common}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case 'arrow-left':  return <svg {...common}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
    case 'arrow-up':    return <svg {...common}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
    case 'arrow-down':  return <svg {...common}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>;
    case 'sparkles':  return <svg {...common}><path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16 10.1 11.4 5.5 9.5 10.1 7.6 12 3z"/><path d="M19 15l.7 1.7 1.8.7-1.8.7L19 19.8l-.7-1.7-1.8-.7 1.8-.7L19 15z"/></svg>;
    case 'plus':      return <svg {...common}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'users':     return <svg {...common}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
    case 'briefcase': return <svg {...common}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>;
    case 'settings':  return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H2a2 2 0 010-4h.09A1.65 1.65 0 003.6 8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H8a1.65 1.65 0 001-1.51V2a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V8a1.65 1.65 0 001.51 1H22a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
    case 'leaf':      return <svg {...common}><path d="M11 20A7 7 0 014 13V5a2 2 0 012-2h14a2 2 0 012 2v8a7 7 0 01-7 7"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>;
    case 'pie-chart': return <svg {...common}><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>;
    case 'trending-up':   return <svg {...common}><polyline points="22 7 13.5 15.5 8.5 10.5 1 18"/><polyline points="16 7 22 7 22 13"/></svg>;
    case 'trending-down': return <svg {...common}><polyline points="22 17 13.5 8.5 8.5 13.5 1 6"/><polyline points="16 17 22 17 22 11"/></svg>;
    case 'check':         return <svg {...common}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'check-circle':  return <svg {...common}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    case 'circle':        return <svg {...common}><circle cx="12" cy="12" r="10"/></svg>;
    case 'x':             return <svg {...common}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'search':        return <svg {...common}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'filter':        return <svg {...common}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
    case 'download':      return <svg {...common}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
    case 'edit':          return <svg {...common}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case 'history':       return <svg {...common}><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-7 3L3 8"/><polyline points="3 3 3 8 8 8"/><polyline points="12 7 12 12 15 14"/></svg>;
    case 'link':          return <svg {...common}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
    case 'message':       return <svg {...common}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>;
    case 'list':          return <svg {...common}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
    case 'flag':          return <svg {...common}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
    case 'file-text':     return <svg {...common}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
    case 'compass':       return <svg {...common}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
    case 'shield':        return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case 'external':      return <svg {...common}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
    case 'eye':           return <svg {...common}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'database':      return <svg {...common}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
    case 'zap':           return <svg {...common}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    case 'plug':          return <svg {...common}><path d="M9 2v6"/><path d="M15 2v6"/><path d="M6 8h12v3a4 4 0 01-4 4h-4a4 4 0 01-4-4V8z"/><path d="M12 15v7"/></svg>;
    case 'bar-chart':     return <svg {...common}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
    case 'globe':         return <svg {...common}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
    case 'minus':         return <svg {...common}><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'thumbs-up':     return <svg {...common}><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>;
    case 'thumbs-down':   return <svg {...common}><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zM17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>;
    case 'more':          return <svg {...common}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>;
    case 'home':          return <svg {...common}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'calendar':      return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case 'thermometer':   return <svg {...common}><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4 4 0 105 0z"/></svg>;
    case 'percent':       return <svg {...common}><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>;
    case 'dot':           return <svg {...common}><circle cx="12" cy="12" r="3" fill={color} stroke="none"/></svg>;
    default:              return <svg {...common}><circle cx="12" cy="12" r="2"/></svg>;
  }
}

/* ----- Pill ----- */
interface PillProps {
  children: React.ReactNode;
  tone?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand' | 'opportunity' | 'weakness';
  size?: 'sm' | 'md' | 'lg';
  solid?: boolean;
  style?: React.CSSProperties;
}

export function Pill({ children, tone = 'neutral', size = 'md', solid = false, style }: PillProps) {
  const map: Record<string, { bg: string; fg: string; solidBg?: string; solidFg?: string }> = {
    success:     { bg: '#D1FAE5', fg: '#065F46', solidBg: '#00A970', solidFg: '#fff' },
    danger:      { bg: '#FEE2E2', fg: '#991B1B', solidBg: '#E03131', solidFg: '#fff' },
    warning:     { bg: '#FEF3C7', fg: '#92400E', solidBg: '#F59E0B', solidFg: '#fff' },
    info:        { bg: '#DBEAFE', fg: '#1E3A8A', solidBg: '#2563EB', solidFg: '#fff' },
    neutral:     { bg: '#F4F4F5', fg: '#525252', solidBg: '#737373', solidFg: '#fff' },
    brand:       { bg: '#EDE9FE', fg: '#5B21B6', solidBg: '#7401C3', solidFg: '#fff' },
    opportunity: { bg: '#00A970', fg: '#fff' },
    weakness:    { bg: '#E07B00', fg: '#fff' },
  };
  const c = map[tone] || map.neutral;
  const bg = solid && c.solidBg ? c.solidBg : c.bg;
  const fg = solid && c.solidFg ? c.solidFg : c.fg;
  const sz = size === 'sm'
    ? { fontSize: 11, padding: '2px 9px', fontWeight: 500 }
    : size === 'lg'
      ? { fontSize: 13, padding: '5px 14px', fontWeight: 600 }
      : { fontSize: 11.5, padding: '3px 10px', fontWeight: 600 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      borderRadius: 999,
      background: bg, color: fg,
      lineHeight: 1.3,
      whiteSpace: 'nowrap',
      ...sz, ...style,
    }}>{children}</span>
  );
}

/* ----- StatusDot ----- */
interface StatusDotProps {
  tone?: 'success' | 'danger' | 'warning' | 'info' | 'brand' | 'neutral';
  size?: number;
}

export function StatusDot({ tone = 'neutral', size = 8 }: StatusDotProps) {
  const map: Record<string, string> = {
    success: '#00A970',
    danger:  '#E03131',
    warning: '#F59E0B',
    info:    '#2563EB',
    brand:   '#7401C3',
    neutral: '#AA95BE',
  };
  return (
    <span style={{
      display: 'inline-block', flexShrink: 0,
      width: size, height: size, borderRadius: 999,
      background: map[tone] || map.neutral,
    }}/>
  );
}

/* ----- Button ----- */
interface BtnProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconRight?: string;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  title?: string;
}

export function Btn({ children, variant = 'secondary', size = 'md', icon, iconRight, onClick, disabled, style, title }: BtnProps) {
  const variants: Record<string, { bg: string; fg: string; bd: string; hoverBg: string }> = {
    primary:   { bg: '#7401C3', fg: '#fff',    bd: '#7401C3',    hoverBg: '#5A0992' },
    secondary: { bg: '#fff',    fg: '#3C0366', bd: '#E7E0EB',    hoverBg: '#F6EDFB' },
    ghost:     { bg: 'transparent', fg: '#5A0992', bd: 'transparent', hoverBg: '#F6EDFB' },
    danger:    { bg: '#E03131', fg: '#fff',    bd: '#E03131',    hoverBg: '#B91C1C' },
  };
  const v = variants[variant] || variants.secondary;
  const sizes: Record<string, { fontSize: number; padding: string; radius: number; iconSize: number }> = {
    sm: { fontSize: 12,   padding: '5px 10px',  radius: 8,  iconSize: 13 },
    md: { fontSize: 13,   padding: '8px 14px',  radius: 10, iconSize: 14 },
    lg: { fontSize: 14.5, padding: '11px 20px', radius: 10, iconSize: 16 },
  };
  const s = sizes[size] || sizes.md;
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        background: disabled ? '#F4F4F5' : (hov ? v.hoverBg : v.bg),
        color: disabled ? '#A8A29E' : v.fg,
        border: `1px solid ${disabled ? '#E7E5E4' : v.bd}`,
        borderRadius: s.radius,
        padding: s.padding, fontSize: s.fontSize, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background 150ms cubic-bezier(0.22,0.61,0.36,1), border-color 150ms',
        ...style,
      }}>
      {icon && <Icon name={icon} size={s.iconSize} color="currentColor"/>}
      {children}
      {iconRight && <Icon name={iconRight} size={s.iconSize} color="currentColor"/>}
    </button>
  );
}
