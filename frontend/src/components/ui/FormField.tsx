import * as React from "react";

export interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children }) => (
  <div>
    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
      {label}
    </label>
    {children}
  </div>
);
