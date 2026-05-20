import React from 'react';
import { Icon, Pill, Btn } from './icons';
import { Card, PageHeader, EmptyState } from './components';
import { MAPEAMENTOS, FONTES, THEME_BY_ID, fmtDate, type Mapeamento } from './data';

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

      <div style={{ padding: '0 32px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <SelectBox
          label="Fonte"
          value={fonteFiltro}
          onChange={setFonteFiltro}
          options={[
            { v: 'todas', l: 'Todas as fontes' },
            ...Object.entries(FONTES).map(([k, v]) => ({ v: k, l: v.label })),
          ]}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#525252', cursor: 'pointer' }}>
          <span
            onClick={() => setMostraPausados(v => !v)}
            style={{
              width: 18, height: 18, borderRadius: 5,
              background: mostraPausados ? '#7401C3' : '#fff',
              border: `1.5px solid ${mostraPausados ? '#7401C3' : '#D6D3D1'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            {mostraPausados && <Icon name="check" size={11} color="#fff" stroke={3}/>}
          </span>
          <span onClick={() => setMostraPausados(v => !v)}>Mostrar pausados</span>
        </label>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--hu-muted)' }}>
          <b style={{ color: '#0A0A0A', fontWeight: 700 }}>{items.length}</b> mapeamentos · {totalActives} ativos · {totalThemes} temas cobertos
        </div>
      </div>

      <div style={{ padding: '0 32px 16px' }}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2.3fr 110px 1.6fr 70px 110px 110px 60px',
            gap: 0,
            padding: '14px 20px',
            background: '#FAFAFA',
            borderBottom: '1px solid var(--hu-border)',
            fontSize: 10.5, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--hu-muted)',
          }}>
            <span>Fonte</span>
            <span>Periodicidade</span>
            <span>Temas vinculados</span>
            <span style={{ textAlign: 'right' }}>Peso</span>
            <span>Última ingestão</span>
            <span>Status</span>
            <span/>
          </div>
          {items.length === 0 && (
            <EmptyState icon="filter" title="Nenhum mapeamento corresponde aos filtros"/>
          )}
          {items.map((m, i) => {
            const f = FONTES[m.fonte] || { icon: 'database', label: m.fonte };
            return (
              <MapRow key={m.id} m={m} f={f} first={i === 0} onPickTheme={onPickTheme}/>
            );
          })}
        </Card>
      </div>

      <div style={{ padding: '0 32px 36px' }}>
        <div style={{
          padding: '14px 18px', borderRadius: 12,
          background: '#F6EDFB', border: '1px solid #E8D9F2',
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <Icon name="info" size={16} color="#5A0992" stroke={1.75}/>
          <div style={{ fontSize: 12.5, color: '#3F2454', lineHeight: 1.55 }}>
            <b style={{ color: '#5A0992' }}>Como funciona:</b> cada mapeamento vincula uma fonte operacional (pesquisa, KPI, canal) a um ou mais temas materiais. Quando novos dados chegam à fonte, a plataforma os ingere e atualiza a aba Evolução temporal dos temas vinculados — sem necessidade de gerar uma nova matriz. O peso permite dar maior ou menor influência ao sinal na composição do sentimento agregado.
          </div>
        </div>
      </div>
    </div>
  );
}

function MapRow({
  m,
  f,
  first,
  onPickTheme,
}: {
  m: Mapeamento;
  f: { icon: string; label: string };
  first: boolean;
  onPickTheme: (id: number) => void;
}) {
  const [hov, setHov] = React.useState(false);
  const visibleThemes = m.tema_ids.slice(0, 4);
  const moreCount = m.tema_ids.length - visibleThemes.length;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '2.3fr 110px 1.6fr 70px 110px 110px 60px',
        alignItems: 'center', gap: 0,
        padding: '14px 20px',
        borderTop: first ? 'none' : '1px solid #F4F4F5',
        background: hov ? '#FAFAFA' : 'transparent',
        transition: 'background 120ms',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: '#fff', border: '1px solid var(--hu-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={f.icon} size={14} color="#7401C3"/>
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0A0A0A' }}>{m.nome}</div>
          <div style={{ fontSize: 11, color: 'var(--hu-muted)' }}>{f.label}</div>
        </div>
      </div>
      <div><Pill tone="info" size="sm">{m.periodicidade}</Pill></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {visibleThemes.map(id => {
          const t = THEME_BY_ID[id];
          return (
            <span key={id}
              onClick={() => onPickTheme(id)}
              style={{
                fontSize: 10.5, fontWeight: 600,
                color: '#5A0992', background: '#F6EDFB',
                padding: '2px 7px', borderRadius: 999,
                cursor: 'pointer', whiteSpace: 'nowrap',
                maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
              {String(id).padStart(2, '0')} · {t ? t.nome.split(' ').slice(0, 2).join(' ') + '…' : id}
            </span>
          );
        })}
        {moreCount > 0 && (
          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#737373', padding: '2px 7px' }}>
            +{moreCount}
          </span>
        )}
      </div>
      <div style={{
        textAlign: 'right',
        fontFamily: 'var(--hu-font-display)', fontWeight: 700,
        color: '#0A0A0A', fontSize: 13, fontVariantNumeric: 'tabular-nums',
      }}>
        {m.peso.toFixed(1)}
      </div>
      <div style={{ fontSize: 12, color: 'var(--hu-muted)', fontVariantNumeric: 'tabular-nums' }}>
        {fmtDate(m.ultima_ingestao)}
      </div>
      <div>
        <Pill tone={m.ativo ? 'success' : 'warning'} size="sm">
          {m.ativo ? 'Ativo' : 'Pausado'}
        </Pill>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{
          background: 'transparent', border: 0, cursor: 'pointer', padding: 6, borderRadius: 6,
          color: '#737373',
        }}>
          <Icon name="edit" size={14} color="#737373"/>
        </button>
      </div>
    </div>
  );
}

function SelectBox({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: '#525252', fontWeight: 600 }}>{label}:</span>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            appearance: 'none',
            padding: '7px 30px 7px 12px',
            borderRadius: 8, border: '1px solid var(--hu-border)',
            background: '#fff', fontSize: 13, fontWeight: 500, color: '#0A0A0A',
            cursor: 'pointer', minWidth: 160,
          }}>
          {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <Icon name="chevron-down" size={13} color="#737373"/>
        </span>
      </div>
    </label>
  );
}
