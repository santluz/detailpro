'use client';
import { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

export function CurrencyInput({ value, onChange, className = '', placeholder = 'R$ 0,00' }: CurrencyInputProps) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    if (value === 0) { setDisplay(''); return; }
    setDisplay(formatDisplay(value * 100));
  }, []);

  function formatDisplay(cents: number): string {
    const str = cents.toString().padStart(3, '0');
    const reais = str.slice(0, -2);
    const centavos = str.slice(-2);
    const reaisFormatted = Number(reais).toLocaleString('pt-BR');
    return `R$ ${reaisFormatted},${centavos}`;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) { setDisplay(''); onChange(0); return; }
    const cents = parseInt(raw, 10);
    setDisplay(formatDisplay(cents));
    onChange(cents / 100);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      className={className}
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
}
