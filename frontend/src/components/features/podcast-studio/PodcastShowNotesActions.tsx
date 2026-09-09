import { Download } from "lucide-react";
import * as React from "react";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface PodcastShowNotesActionsProps {
  /** Null while the audio is still rendering, which disables the download. */
  audioUrl: string | null;
  fileName: string;
}

const BUTTON_CLASS = "w-full gap-1.5 bg-black hover:bg-zinc-800 text-white";

/**
 * An anchor carrying `download`, so the browser saves the file itself. Styled
 * with buttonVariants rather than the Button component, which renders a
 * <button> and cannot become a link.
 */
export const PodcastShowNotesActions: React.FC<PodcastShowNotesActionsProps> = ({
  audioUrl,
  fileName,
}) =>
  audioUrl ? (
    <a
      href={audioUrl}
      download={fileName}
      className={cn(buttonVariants({ size: "sm" }), BUTTON_CLASS)}
    >
      <Download className="h-3 w-3" />
      <span>Download audio</span>
    </a>
  ) : (
    <span
      aria-disabled
      className={cn(buttonVariants({ size: "sm" }), BUTTON_CLASS, "opacity-40 cursor-default")}
    >
      <Download className="h-3 w-3" />
      <span>Audio still rendering</span>
    </span>
  );
