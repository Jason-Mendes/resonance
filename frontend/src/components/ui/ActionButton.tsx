import { ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";

import { Button } from "./Button";

export interface ActionButtonProps {
  label: string;
  loadingLabel: string;
  isLoading: boolean;
  /** Held back for a reason other than loading, such as an incomplete form. */
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  loadingLabel,
  isLoading,
  disabled = false,
  className,
  icon,
  onClick,
  type = "button",
}) => (
  <Button type={type} onClick={onClick} disabled={isLoading || disabled} className={className}>
    {isLoading ? (
      <>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>{loadingLabel}</span>
      </>
    ) : (
      <>
        {icon}
        <span>{label}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </>
    )}
  </Button>
);
