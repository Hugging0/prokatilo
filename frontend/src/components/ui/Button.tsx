import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', fullWidth = false, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-3xl font-black transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none py-5 px-6";
    
    const variants = {
      primary: "bg-slate-900 text-white shadow-xl hover:bg-slate-800",
      secondary: "bg-rose-500 text-white shadow-xl shadow-rose-200 hover:bg-rose-600",
      outline: "border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-800",
      ghost: "bg-transparent hover:bg-slate-100 text-slate-700"
    };
    
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
