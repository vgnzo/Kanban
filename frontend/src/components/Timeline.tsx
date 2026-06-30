import { useState } from 'react';

export interface HistoricoItem {
  id: string;
  usuarioNome: string;
  colunaOrigem: string | null;
  colunaDestino: string | null;
  observacao: string;
  criadoEm: string;
}

interface TimelineProps {
  historico: HistoricoItem[];
  loading?: boolean;
  // função opcional que define a cor da bolinha de cada evento.
  // recebe o nome da coluna de destino; se não for passada, usa uma cor padrão.
  corDoEvento?: (colunaDestino: string | null) => string;
  // quantos eventos mostrar antes do "ver mais" (padrão 5)
  limite?: number;
}

// formata "2026-06-26T08:33:22" para "26/06 08:33"
function formatarData(iso: string): string {
  const d = new Date(iso);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes} ${hora}:${min}`;
}

export default function Timeline({
  historico,
  loading = false,
  corDoEvento,
  limite = 5,
}: TimelineProps) {
  const [expandido, setExpandido] = useState(false);

  const cor = (colunaDestino: string | null) =>
    corDoEvento ? corDoEvento(colunaDestino) : 'rgba(255,255,255,0.4)';

  if (loading) {
    return <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Carregando...</div>;
  }

  if (historico.length === 0) {
    return <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Sem movimentações registradas.</div>;
  }

  const temMais = historico.length > limite;
  const visiveis = expandido ? historico : historico.slice(-limite);

  const botaoStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 500,
    cursor: 'pointer', padding: '7px 12px',
    transition: 'background 0.18s ease, border-color 0.18s ease',
  };

  const onHoverIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
  };
  const onHoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
  };

  return (
    <div style={{
      maxHeight: expandido ? '260px' : 'none',
      overflowY: expandido ? 'auto' : 'visible',
      paddingRight: expandido ? '6px' : '0'
    }}>
      {temMais && !expandido && (
        <button
          onClick={() => setExpandido(true)}
          onMouseEnter={onHoverIn}
          onMouseLeave={onHoverOut}
          style={{ ...botaoStyle, marginBottom: '14px' }}
        >
          <span style={{ fontSize: '13px' }}>↑</span>
          ver histórico completo
          <span style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '20px', padding: '1px 7px', fontSize: '10px'
          }}>{historico.length}</span>
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {visiveis.map((h, i) => (
          <div key={h.id} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{
                width: '10px', height: '10px',
                borderRadius: '50%',
                backgroundColor: cor(h.colunaDestino),
                boxShadow: `0 0 6px ${cor(h.colunaDestino)}`,
                flexShrink: 0,
                marginTop: '3px'
              }} />
              {i < visiveis.length - 1 && (
                <span style={{
                  width: '2px',
                  flex: 1,
                  background: 'rgba(255,255,255,0.12)',
                  marginTop: '2px'
                }} />
              )}
            </div>
            <div style={{ paddingBottom: '16px', minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>
                {h.observacao}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>
                {h.usuarioNome} · {formatarData(h.criadoEm)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {temMais && expandido && (
        <button
          onClick={() => setExpandido(false)}
          onMouseEnter={onHoverIn}
          onMouseLeave={onHoverOut}
          style={{ ...botaoStyle, marginTop: '4px' }}
        >
          <span style={{ fontSize: '13px' }}>↓</span>
          recolher
        </button>
      )}
    </div>
  );
}