'use client';

import React, { useState, useEffect } from 'react';
import { Info, AlertCircle, CheckCircle } from 'lucide-react';

interface StockSelectorProps {
  maxValue: number;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
}

export default function StockSelector({ 
  maxValue, 
  unit, 
  value, 
  onChange,
  label = 'Cantidad',
  disabled = false
}: StockSelectorProps) {
  const [isValid, setIsValid] = useState(true);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (maxValue > 0) {
      const pct = Math.min((value / maxValue) * 100, 100);
      setPercentage(pct);
    }
    setIsValid(value <= maxValue);
  }, [value, maxValue]);

  const handleQuickSelect = (fraction: number) => {
    const newValue = Math.min(maxValue * fraction, maxValue);
    onChange(Math.round(newValue * 1000) / 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 0) {
      onChange(Math.min(val, maxValue));
    } else if (e.target.value === '') {
      onChange(0);
    }
  };

  const getStatusColor = () => {
    if (disabled) return 'border-gray-200 bg-gray-100';
    if (!isValid) return 'border-red-500 bg-red-50';
    if (percentage === 100) return 'border-green-500 bg-green-50';
    if (percentage > 75) return 'border-yellow-500 bg-yellow-50';
    return 'border-gray-200 bg-gray-50';
  };

  const getStatusMessage = () => {
    if (disabled) {
      return {
        icon: <Info size={14} className="text-gray-400" />,
        text: `Stock disponible: ${maxValue} ${unit}`,
        color: 'text-gray-400'
      };
    }
    if (maxValue === 0) {
      return {
        icon: <AlertCircle size={14} className="text-red-500" />,
        text: `⚠️ Stock agotado (0 ${unit} disponibles)`,
        color: 'text-red-600'
      };
    }
    if (!isValid) {
      return {
        icon: <AlertCircle size={14} className="text-red-500" />,
        text: `⚠️ La cantidad excede el stock disponible (${maxValue} ${unit})`,
        color: 'text-red-600'
      };
    }
    if (percentage === 100) {
      return {
        icon: <CheckCircle size={14} className="text-green-500" />,
        text: `✅ Usando el 100% del stock (${maxValue} ${unit})`,
        color: 'text-green-600'
      };
    }
    if (percentage > 75) {
      return {
        icon: <Info size={14} className="text-yellow-500" />,
        text: `ℹ️ Usando ${percentage.toFixed(0)}% del stock disponible`,
        color: 'text-yellow-600'
      };
    }
    return {
      icon: null,
      text: `Disponible: ${maxValue} ${unit}`,
      color: 'text-gray-400'
    };
  };

  const status = getStatusMessage();

  return (
    <div className="space-y-3">
      <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest">
        {label}
        {maxValue > 0 && (
          <span className="ml-2 text-[10px] font-normal text-gray-400">
            Stock: {maxValue} {unit}
          </span>
        )}
      </label>

      {/* Botones de cantidad rápida */}
      {maxValue > 0 && !disabled && (
        <div className="flex gap-2">
          {[
            { label: '¼', value: 0.25 },
            { label: '½', value: 0.5 },
            { label: '¾', value: 0.75 },
            { label: 'Max', value: 1 },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleQuickSelect(option.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                Math.abs(value - maxValue * option.value) < 0.01 && value > 0
                  ? 'bg-[var(--brand)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Barra de progreso */}
      {maxValue > 0 && !disabled && (
        <div className="space-y-1">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                percentage === 100 ? 'bg-green-500' : 'bg-[var(--brand)]'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-medium text-gray-400">
            <span>0 {unit}</span>
            <span>{maxValue} {unit}</span>
          </div>
        </div>
      )}

      {/* Input con unidad */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="number"
            step="0.001"
            min="0"
            max={maxValue}
            value={value || ''}
            onChange={handleInputChange}
            disabled={disabled || maxValue === 0}
            className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors ${getStatusColor()} ${
              (disabled || maxValue === 0) ? 'cursor-not-allowed opacity-60' : ''
            }`}
            placeholder="0.000"
          />
          {maxValue > 0 && !disabled && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-400">
                / {maxValue}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-[80px]">
          <span className="text-sm font-bold text-gray-500 uppercase">{unit}</span>
        </div>
      </div>

      {/* Mensaje de estado */}
      <div className={`flex items-center gap-1.5 text-xs font-medium ${status.color}`}>
        {status.icon}
        <span>{status.text}</span>
      </div>
    </div>
  );
}