
import React, { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { 
  maskCPF, 
  maskCNPJ, 
  maskCEP, 
  maskPhone, 
  maskRG
} from '@/utils/masks';

type MaskType = 'cpf' | 'cnpj' | 'cep' | 'phone' | 'rg';

interface InputMaskProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: MaskType;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

const maskMap: Record<MaskType, (val: string) => string> = {
  cpf: maskCPF,
  cnpj: maskCNPJ,
  cep: maskCEP,
  phone: maskPhone,
  rg: maskRG,
};

export const InputMask = React.forwardRef<HTMLInputElement, InputMaskProps>(
  ({ mask, value, onChange, label, error, className, id, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const maskedValue = maskMap[mask](rawValue);
      
      // Só chama o onChange se o valor mudou (evita loops e respeita o limite da máscara)
      if (maskedValue !== value || rawValue === '') {
        onChange(maskedValue);
      }
    };

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-bold text-gray-700 ml-1"
          >
            {label}
          </label>
        )}
        <input
          {...props}
          ref={ref}
          id={id}
          value={value}
          onChange={handleChange}
          className={cn(
            "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            error ? "border-red-500 focus-visible:ring-red-500" : "hover:border-blue-400",
            className
          )}
        />
        {error && (
          <p className="text-[11px] font-bold text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputMask.displayName = 'InputMask';
