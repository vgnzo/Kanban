import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

// ===== CARD ARRASTÁVEL =====
// Torna qualquer conteúdo "agarrável" pelo dnd-kit.
// Só precisa do id (pra identificar o item) e se pode arrastar.
// O visual do card vem como children — o componente não sabe nem se importa
// com o que está dentro (equipamento, tarefa, qualquer coisa).
export function CardArrastavel({ id, podeArrastar, children }: {
  id: string;
  podeArrastar: boolean;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled: !podeArrastar,
  });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.5 : 1,
    cursor: podeArrastar ? 'grab' : 'pointer',
    touchAction: 'none',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

// ===== COLUNA QUE RECEBE O DROP =====
// Marca uma área como "zona de soltar", identificada por um id (o id da coluna).
// Acende de roxo quando um card está pairando por cima (isOver).
export function ColunaDroppavel({ colunaId, children }: {
  colunaId: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: colunaId });

  return (
    <div ref={setNodeRef} style={{
      flex: 1,
      overflowY: 'auto',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      background: isOver ? 'rgba(102,126,234,0.12)' : 'transparent',
      transition: 'background 0.15s ease',
    }}>
      {children}
    </div>
  );
}