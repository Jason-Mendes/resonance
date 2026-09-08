import * as React from "react";
import { Download, Rss, CheckCircle2, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PodcastEpisode } from "@/types/podcast";

export interface PodcastShowNotesProps {
  episode: PodcastEpisode;
}

export const PodcastShowNotes: React.FC<PodcastShowNotesProps> = ({ episode }) => {
  const [copiedFeed, setCopiedFeed] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);

  const handleCopyFeed = () => {
    navigator.clipboard.writeText(`https://resonance.media/podcasts/episodes/${episode.id}.xml`);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2000);
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Audio file "${episode.title}.mp3" downloaded.`);
    }, 800);
  };

  return (
    <div className="space-y-3">
      {/* Show Notes Content */}
      <div className="border border-zinc-200 bg-white p-3.5 space-y-2.5 rounded-none">
        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider">
          <FileText className="h-3.5 w-3.5 text-black" />
          <span>Notes</span>
        </div>
        <p className="text-xs text-zinc-700 leading-relaxed">
          {episode.showNotes}
        </p>

        {/* Takeaways */}
        <div className="pt-2 border-t border-zinc-100 space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Key Points:
          </span>
          <ul className="space-y-1">
            {episode.keyTakeaways.map((takeaway, idx) => (
              <li
                key={idx}
                className="flex items-start gap-1.5 text-xs text-zinc-600"
              >
                <CheckCircle2 className="h-3 w-3 text-black shrink-0 mt-0.5" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyFeed}
          className="h-8 gap-1.5 text-xs border-zinc-200 hover:border-black rounded-none"
        >
          {copiedFeed ? (
            <Check className="h-3 w-3 text-black" />
          ) : (
            <Rss className="h-3 w-3 text-black" />
          )}
          <span>{copiedFeed ? "Copied" : "RSS Feed"}</span>
        </Button>

        <Button
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
          className="h-8 gap-1.5 text-xs bg-black hover:bg-zinc-800 text-white rounded-none"
        >
          <Download className="h-3 w-3" />
          <span>{downloading ? "Exporting..." : "Download MP3"}</span>
        </Button>
      </div>
    </div>
  );
};
