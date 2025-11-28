import React from 'react';

// 3D Card Container
export const Card3D: React.FC<{ 
  children?: React.ReactNode, 
  className?: string, 
  onClick?: () => void,
  key?: string | number // Allow key prop explicit typing
}> = ({ 
  children, 
  className = '', 
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        glass-panel 
        relative 
        rounded-xl 
        p-6 
        transition-all 
        duration-300 
        hover:-translate-y-2 
        hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)]
        border-t border-l border-white/10
        border-b border-r border-black/20
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// 3D Button
export const Button3D = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  type = 'button',
  disabled = false
}: { 
  children?: React.ReactNode, 
  variant?: 'primary' | 'danger' | 'success' | 'ghost', 
  onClick?: () => void,
  className?: string,
  type?: 'button' | 'submit' | 'reset',
  disabled?: boolean
}) => {
  const baseStyles = "relative px-6 py-2.5 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider";
  
  const variants = {
    primary: "bg-gradient-to-br from-legal-800 to-legal-900 text-white border border-legal-700 shadow-[0_4px_0_0_#0f172a] hover:shadow-[0_2px_0_0_#0f172a] hover:translate-y-[2px]",
    danger: "bg-gradient-to-br from-red-700 to-red-900 text-white border border-red-800 shadow-[0_4px_0_0_#7f1d1d] hover:shadow-[0_2px_0_0_#7f1d1d] hover:translate-y-[2px]",
    success: "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border border-emerald-700 shadow-[0_4px_0_0_#064e3b] hover:shadow-[0_2px_0_0_#064e3b] hover:translate-y-[2px]",
    ghost: "text-legal-gold hover:bg-white/5 border border-transparent hover:border-white/5"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Input Field with 3D inset look - Hardened against Extensions
export const Input3D = ({ 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange,
  disabled = false,
  name
}: { 
  label: string, 
  type?: string, 
  placeholder?: string, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  disabled?: boolean,
  name?: string
}) => {
  return (
    <div className="mb-4">
      <label className="block text-xs font-serif text-legal-gold mb-1 uppercase tracking-widest">{label}</label>
      <div className="relative group">
        <input 
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          // Attributes to prevent extensions from messing with the DOM
          spellCheck={false}
          data-lpignore="true" // Ignores LastPass
          autoComplete="off" // Reduces browser interference
          data-form-type="other" // Generic hint
          className={`
            w-full 
            bg-[#0a0f1c] 
            text-slate-200 
            px-4 py-3 
            rounded-lg 
            border border-slate-700 
            focus:border-legal-gold 
            focus:ring-1 
            focus:ring-legal-gold 
            outline-none 
            shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] 
            transition-all
            disabled:opacity-50
          `}
        />
        {/* Glow effect on bottom */}
        <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-legal-gold to-transparent opacity-0 group-hover:opacity-50 transition-opacity" />
      </div>
    </div>
  );
};

// Select Input
export const Select3D = ({
  label,
  value,
  onChange,
  options,
  name
}: {
  label: string,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  options: { label: string, value: string }[],
  name?: string
}) => {
  return (
    <div className="mb-4">
      <label className="block text-xs font-serif text-legal-gold mb-1 uppercase tracking-widest">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="
            w-full 
            bg-[#0a0f1c] 
            text-slate-200 
            px-4 py-3 
            rounded-lg 
            border border-slate-700 
            focus:border-legal-gold 
            focus:ring-1 
            focus:ring-legal-gold 
            outline-none 
            shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] 
            transition-all
            appearance-none
        "
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// Badge
export const Badge = ({ active, text }: { active: boolean, text: string }) => (
  <span className={`
    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
    ${active 
      ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' 
      : 'bg-red-900/30 text-red-400 border-red-500/30'}
  `}>
    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
    {text}
  </span>
);