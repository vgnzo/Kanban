import { useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  children,
  fullWidth = false,
  disabled = false,
  style,
  ...rest
}: ButtonProps) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  // estilo base, comum a todos os botões
  const base: React.CSSProperties = {
    fontFamily: "'Segoe UI', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '9px 16px',
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    outline: 'none',
    // a transição é o que dá a sensação "suave" no hover
    transition: 'transform 0.12s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease, opacity 0.18s ease',
    // levanta levemente no hover, afunda no clique
    transform: pressed ? 'translateY(1px)' : hover && !disabled ? 'translateY(-1px)' : 'translateY(0)',
    opacity: disabled ? 0.55 : 1,
  };

  // estilos específicos de cada variante (normal e hover)
  const variants: Record<Variant, { normal: React.CSSProperties; hover: React.CSSProperties }> = {
    primary: {
      normal: {
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        border: 'none',
        color: 'white',
        boxShadow: '0 2px 8px rgba(102,126,234,0.25)',
      },
      hover: {
        boxShadow: '0 6px 18px rgba(102,126,234,0.45)',
      },
    },
    secondary: {
      normal: {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.18)',
        color: 'rgba(255,255,255,0.85)',
      },
      hover: {
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.32)',
      },
    },
    ghost: {
      normal: {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.7)',
      },
      hover: {
        background: 'rgba(255,255,255,0.1)',
        color: 'white',
      },
    },
    icon: {
      normal: {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: 'white',
        width: '32px',
        height: '32px',
        padding: 0,
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      hover: {
        background: 'rgba(255,255,255,0.14)',
        border: '1px solid rgba(255,255,255,0.3)',
      },
    },
  };

  const v = variants[variant];

  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        ...base,
        ...v.normal,
        ...(hover && !disabled ? v.hover : {}),
        ...style, // permite ajuste pontual por tela (ex: flex, marginTop)
      }}
      {...rest}
    >
      {children}
    </button>
  );
}