import React from 'react';
import {
  AlertTriangle, ArrowDown, ArrowLeft, ArrowRight, ArrowUp,
  BarChart2, Briefcase, Calendar, Check, CheckCircle,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown,
  Circle, Clock, Compass, Database, Dot, Download, Eye, ExternalLink,
  FileText, Filter, Flag, Globe, Grid2x2, History, Home, Info,
  Layout, Leaf, Link2, List, MessageSquare, Minus, MoreHorizontal,
  Pencil, Percent, PieChart, Plug, Plus, Search, Settings, Shield,
  Sparkles, Target, Thermometer, ThumbsDown, ThumbsUp,
  TrendingDown, TrendingUp, Users, X, Zap, type LucideIcon,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';

/* ----- Icon (lucide-react wrapper) ----- */
const ICON_MAP: Record<string, LucideIcon> = {
  'chevron-down':     ChevronDown,
  'chevron-up':       ChevronUp,
  'chevron-right':    ChevronRight,
  'chevron-left':     ChevronLeft,
  'chevrons-up-down': ChevronsUpDown,
  'layout':           Layout,
  'target':           Target,
  'grid':             Grid2x2,
  'clock':            Clock,
  'info':             Info,
  'alert':            AlertTriangle,
  'arrow-right':      ArrowRight,
  'arrow-left':       ArrowLeft,
  'arrow-up':         ArrowUp,
  'arrow-down':       ArrowDown,
  'sparkles':         Sparkles,
  'plus':             Plus,
  'users':            Users,
  'briefcase':        Briefcase,
  'settings':         Settings,
  'leaf':             Leaf,
  'pie-chart':        PieChart,
  'trending-up':      TrendingUp,
  'trending-down':    TrendingDown,
  'check':            Check,
  'check-circle':     CheckCircle,
  'circle':           Circle,
  'x':                X,
  'search':           Search,
  'filter':           Filter,
  'download':         Download,
  'edit':             Pencil,
  'history':          History,
  'link':             Link2,
  'message':          MessageSquare,
  'list':             List,
  'flag':             Flag,
  'file-text':        FileText,
  'compass':          Compass,
  'shield':           Shield,
  'external':         ExternalLink,
  'eye':              Eye,
  'database':         Database,
  'zap':              Zap,
  'plug':             Plug,
  'bar-chart':        BarChart2,
  'globe':            Globe,
  'minus':            Minus,
  'thumbs-up':        ThumbsUp,
  'thumbs-down':      ThumbsDown,
  'more':             MoreHorizontal,
  'home':             Home,
  'calendar':         Calendar,
  'thermometer':      Thermometer,
  'percent':          Percent,
  'dot':              Dot,
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  stroke?: number;
  className?: string;
}

export function Icon({ name, size = 16, color, className }: IconProps) {
  const LIcon = ICON_MAP[name];
  if (!LIcon) return null;
  return (
    <LIcon
      style={{ width: size, height: size, color: color || 'currentColor', flexShrink: 0 }}
      className={className}
    />
  );
}

/* ----- Pill (Badge-style) ----- */
interface PillProps {
  children: React.ReactNode;
  tone?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand' | 'opportunity' | 'weakness';
  size?: 'sm' | 'md' | 'lg';
  solid?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const PILL_CLASSES: Record<string, string> = {
  success:     'bg-green-100 text-green-800 border border-green-200',
  danger:      'bg-red-100 text-red-800 border border-red-200',
  warning:     'bg-amber-100 text-amber-800 border border-amber-200',
  info:        'bg-blue-100 text-blue-800 border border-blue-200',
  neutral:     'bg-muted text-muted-foreground border border-border',
  brand:       'bg-primary/10 text-primary border border-primary/20',
  opportunity: 'bg-green-600 text-white border border-green-600',
  weakness:    'bg-amber-600 text-white border border-amber-600',
};

const PILL_SOLID_CLASSES: Record<string, string> = {
  success:  'bg-green-600 text-white border border-green-600',
  danger:   'bg-destructive text-destructive-foreground border border-destructive',
  warning:  'bg-amber-500 text-white border border-amber-500',
  info:     'bg-blue-600 text-white border border-blue-600',
  neutral:  'bg-muted-foreground text-white border border-muted-foreground',
  brand:    'bg-primary text-primary-foreground border border-primary',
};

export function Pill({ children, tone = 'neutral', size, solid = false, style, className }: PillProps) {
  const cls = solid && PILL_SOLID_CLASSES[tone]
    ? PILL_SOLID_CLASSES[tone]
    : PILL_CLASSES[tone] || PILL_CLASSES.neutral;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        cls,
        size === 'lg' && 'px-3 py-1 text-sm',
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}

/* ----- StatusDot ----- */
interface StatusDotProps {
  tone?: 'success' | 'danger' | 'warning' | 'info' | 'brand' | 'neutral';
  size?: number;
}

const DOT_COLORS: Record<string, string> = {
  success: 'bg-green-500',
  danger:  'bg-destructive',
  warning: 'bg-amber-500',
  info:    'bg-blue-500',
  brand:   'bg-primary',
  neutral: 'bg-muted-foreground/50',
};

export function StatusDot({ tone = 'neutral', size = 8 }: StatusDotProps) {
  return (
    <span
      className={cn('inline-block shrink-0 rounded-full', DOT_COLORS[tone] || DOT_COLORS.neutral)}
      style={{ width: size, height: size }}
    />
  );
}

/* ----- Btn (Button wrapper) ----- */
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
  className?: string;
}

const BTN_VARIANT_MAP = {
  primary:   'default',
  secondary: 'outline',
  ghost:     'ghost',
  danger:    'destructive',
} as const;

const BTN_SIZE_MAP = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
} as const;

export function Btn({ children, variant = 'secondary', size = 'md', icon, iconRight, onClick, disabled, style, title, className }: BtnProps) {
  const iconSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;
  return (
    <Button
      variant={BTN_VARIANT_MAP[variant] || 'outline'}
      size={BTN_SIZE_MAP[size] || 'default'}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={style}
      className={className}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </Button>
  );
}
