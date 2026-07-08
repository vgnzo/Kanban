import { useState } from 'react';

interface EditarCardProps {
  card: {
    id: string;
    titulo: string;
    descricao: string;
    prioridade: string;
  };
  onSalvar: (cardAtualizado: any) => void;
  onCancelar: () => void;
}

export default function EditarCardModal({ card, onSalvar, onCancelar }: EditarCardProps) {
  const [titulo, setTitulo] = useState(card.titulo);
  const [descricao, setDescricao] = useState(card.descricao);
  // Removi o 'setPrioridade' porque não estava sendo usado no seu código
  const [prioridade] = useState(card.prioridade);
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      // Usando 'prioridade' que é o estado lido acima
      await onSalvar({ ...card, titulo, descricao, prioridade });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '550px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#1a1a2e',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }}>
        
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>Editar Card</h3>
          <button 
            onClick={onCancelar}
            style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '18px' }}
          >
            ✕
          </button>
        </div>

        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '6px' }}>
              Título
            </label>
            <input 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: 'white',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '6px' }}>
              Descrição
            </label>
            <textarea 
              rows={4}
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: 'white',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          flexShrink: 0
        }}>
          <button 
            onClick={onCancelar}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          
          <button 
            onClick={handleSalvar}
            disabled={salvando}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#00adb5',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {salvando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}