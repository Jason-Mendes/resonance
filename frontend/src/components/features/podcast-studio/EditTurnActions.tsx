import { Trash2, Check } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/Button";

export interface EditTurnActionsProps {
  onCancel: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export const EditTurnActions: React.FC<EditTurnActionsProps> = ({ onCancel, onSave, onDelete }) => (
  <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
    {onDelete ? (
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 gap-1 rounded-none px-2"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Delete Turn</span>
      </Button>
    ) : (
      <div />
    )}

    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onCancel}
        className="text-xs border-zinc-200 rounded-none px-3"
      >
        Cancel
      </Button>
      <Button
        size="sm"
        onClick={onSave}
        className="text-xs bg-black text-white hover:bg-zinc-800 gap-1 rounded-none px-4"
      >
        <Check className="h-3.5 w-3.5" />
        <span>Save Changes</span>
      </Button>
    </div>
  </div>
);
