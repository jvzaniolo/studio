import React from 'react';
import { Icon, Pill, Btn } from './icons';
import { Card, PageHeader, EmptyState } from './components';
import { MAPEAMENTOS, FONTES, THEME_BY_ID, fmtDate, type Mapeamento } from './data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

export function Mapeamentos({ onPickTheme }: { onPickTheme: (id: number) => void }) {
  const [fonteFiltro, setFonteFiltro] = React.useState('todas');
  const [mostraPausados, setMostraPausados] = React.useState(true);

  const items = MAPEAMENTOS.filter(m =>
    (fonteFiltro === 'todas' || m.fonte === fonteFiltro) &&
    (mostraPausados || m.ativo)
  );

  const totalActives = MAPEAMENTOS.filter(m => m.ativo).length;
  const totalThemes  = new Set(MAPEAMENTOS.flatMap(m => m.tema_ids)).size;

  return (
    <div className="hu-fade" data-screen-label="Materialidade · Mapeamentos">
      <PageHeader
        eyebrow="Materialidade · auxiliar"
        title="Mapeamentos de sinais operacionais"
        subtitle="Configure quais pesquisas, KPIs e canais alimentam a aba Evolução temporal de cada tema material. Sem mapeamento ativo, a matriz não evolui entre ciclos."
        breadcrumbs={[
          { label: 'Sustentabilidade' },
          { label: 'Materialidade' },
          { label: 'Mapeamentos' },
        ]}
        actions={
          <>
            <Btn variant="secondary" icon="download">Exportar</Btn>
            <Btn variant="primary" icon="plus">Novo mapeamento</Btn>
          </>
        }
      />

      <div className="px-8 pb-4 flex items-center gap-3.5 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Fonte:</span>
          <Select value={fonteFiltro} onValueChange={setFonteFiltro}>
            <SelectTrigger className="min-w-40 h-9 text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as fontes</SelectItem>
              {Object.entries(FONTES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <Checkbox
            checked={mostraPausados}
            onCheckedChange={(checked) => setMostraPausados(checked === true)}
          />
          <span onClick={() => setMostraPausados(v => !v)}>Mostrar pausados</span>
        </label>

        <div className="ml-auto text-xs text-muted-foreground">
          <b className="text-foreground font-bold">{items.length}</b> mapeamentos · {totalActives} ativos · {totalThemes} temas cobertos
        </div>
      </div>

      <div className="px-8 pb-4">
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Fonte</TableHead>
                <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Periodicidade</TableHead>
                <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Temas vinculados</TableHead>
                <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground text-right">Peso</TableHead>
                <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Última ingestão</TableHead>
                <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState icon="filter" title="Nenhum mapeamento corresponde aos filtros"/>
                  </TableCell>
                </TableRow>
              )}
              {items.map((m) => {
                const f = FONTES[m.fonte] || { icon: 'database', label: m.fonte };
                return (
                  <MapRow key={m.id} m={m} f={f} onPickTheme={onPickTheme}/>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="px-8 pb-9">
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex gap-3 items-start">
          <Icon name="info" size={16} className="text-primary mt-0.5 shrink-0"/>
          <p className="text-sm text-primary/80 leading-relaxed">
            <b className="text-primary">Como funciona:</b> cada mapeamento vincula uma fonte operacional (pesquisa, KPI, canal) a um ou mais temas materiais. Quando novos dados chegam à fonte, a plataforma os ingere e atualiza a aba Evolução temporal dos temas vinculados — sem necessidade de gerar uma nova matriz. O peso permite dar maior ou menor influência ao sinal na composição do sentimento agregado.
          </p>
        </div>
      </div>
    </div>
  );
}

function MapRow({
  m,
  f,
  onPickTheme,
}: {
  m: Mapeamento;
  f: { icon: string; label: string };
  onPickTheme: (id: number) => void;
}) {
  const visibleThemes = m.tema_ids.slice(0, 4);
  const moreCount = m.tema_ids.length - visibleThemes.length;

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell>
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg shrink-0 bg-background border border-border flex items-center justify-center">
            <Icon name={f.icon} size={14} className="text-primary"/>
          </span>
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold text-foreground">{m.nome}</div>
            <div className="text-xs text-muted-foreground">{f.label}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Pill tone="info" size="sm">{m.periodicidade}</Pill>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {visibleThemes.map(id => {
            const t = THEME_BY_ID[id];
            return (
              <span
                key={id}
                onClick={() => onPickTheme(id)}
                className="text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full cursor-pointer whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis hover:bg-primary/20 transition-colors"
              >
                {String(id).padStart(2, '0')} · {t ? t.nome.split(' ').slice(0, 2).join(' ') + '…' : id}
              </span>
            );
          })}
          {moreCount > 0 && (
            <span className="text-xs font-semibold text-muted-foreground px-1.5 py-0.5">
              +{moreCount}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right font-bold text-foreground text-sm tabular-nums">
        {m.peso.toFixed(1)}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground tabular-nums">
        {fmtDate(m.ultima_ingestao)}
      </TableCell>
      <TableCell>
        <Pill tone={m.ativo ? 'success' : 'warning'} size="sm">
          {m.ativo ? 'Ativo' : 'Pausado'}
        </Pill>
      </TableCell>
      <TableCell>
        <div className="flex justify-end">
          <button className="bg-transparent border-0 cursor-pointer p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Icon name="edit" size={14}/>
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}
