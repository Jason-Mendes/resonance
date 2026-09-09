import * as React from "react";

export interface SocialHashtagsProps {
  hashtags: string[];
}

/**
 * The hashtag block. Stored bare, so the "#" is added here: it is how the tag
 * is drawn, not part of the tag.
 */
export const SocialHashtags: React.FC<SocialHashtagsProps> = ({ hashtags }) => {
  if (hashtags.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {hashtags.map((tag) => (
        <li key={tag} className="bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
          #{tag}
        </li>
      ))}
    </ul>
  );
};
