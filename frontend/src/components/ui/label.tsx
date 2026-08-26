import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <label 
      className={`text-sm font-bold text-slate-700 dark:text-white/80 block mb-1.5 ${className}`} 
      {...props}
    >
      {children}
    </label>
  );
}
