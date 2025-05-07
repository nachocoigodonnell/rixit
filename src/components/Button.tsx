import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => (
  <button
    {...props}
    className={clsx(
      'px-4 py-2 rounded-lg shadow-card font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
      className,
    )}
  >
    {children}
  </button>
);

export default Button; 