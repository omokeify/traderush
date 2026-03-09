"use client";

import { useEffect, useState } from "react";

export interface ProfileLink {
  label: string;
  href: string;
}

interface ProfileLinksProps {
  coinId: string;
  fallbackHomepage?: string | null;
  fallbackTelegram?: string | null;
  className?: string;
}

const LABELS: Record<string, string> = {
  homepage: "Website",
  twitter: "Twitter",
  telegram: "Telegram",
  reddit: "Reddit",
  github: "GitHub",
  blockchain_explorer: "Explorer",
  whitepaper: "Whitepaper",
};

export default function ProfileLinks({
  coinId,
  fallbackHomepage,
  fallbackTelegram,
  className = "",
}: ProfileLinksProps) {
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/coins/${coinId}/links`)
      .then((r) => r.json())
      .then((data) => {
        const result: ProfileLink[] = [];
        const raw = data.error ? {} : data;

        if (raw.homepage) result.push({ label: LABELS.homepage, href: raw.homepage });
        else if (fallbackHomepage) result.push({ label: LABELS.homepage, href: fallbackHomepage });

        if (raw.twitter) result.push({ label: LABELS.twitter, href: raw.twitter });
        if (raw.telegram) result.push({ label: LABELS.telegram, href: raw.telegram });
        else if (fallbackTelegram)
          result.push({ label: LABELS.telegram, href: `https://t.me/${fallbackTelegram.replace(/^@/, "")}` });
        if (raw.reddit) result.push({ label: LABELS.reddit, href: raw.reddit });
        if (raw.github) result.push({ label: LABELS.github, href: raw.github });
        if (raw.blockchain_explorer) result.push({ label: LABELS.blockchain_explorer, href: raw.blockchain_explorer });
        if (raw.whitepaper) result.push({ label: LABELS.whitepaper, href: raw.whitepaper });

        setLinks(result);
      })
      .catch(() => {
        const result: ProfileLink[] = [];
        if (fallbackHomepage) result.push({ label: LABELS.homepage, href: fallbackHomepage });
        if (fallbackTelegram)
          result.push({ label: LABELS.telegram, href: `https://t.me/${fallbackTelegram.replace(/^@/, "")}` });
        setLinks(result);
      })
      .finally(() => setLoading(false));
  }, [coinId, fallbackHomepage, fallbackTelegram]);

  if (loading) return <p className={`text-sm text-gray-500 ${className}`}>Loading links...</p>;
  if (links.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-xs text-gray-500 uppercase font-bold mb-2">Profile Links</p>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-brand-orange/20 hover:border-brand-orange transition-colors"
          >
            {link.label} →
          </a>
        ))}
      </div>
    </div>
  );
}
