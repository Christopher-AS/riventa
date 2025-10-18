"use client";

import { useState } from "react";

type SourceBadgeProps = {
  sources: Array<{ name: string; url: string }>;
};

export default function SourceBadge({ sources }: SourceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        className="text-blue-600 font-medium cursor-pointer hover:underline"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        Fonte
      </span>

      {showTooltip && (
        <div
          className="bg-gray-900 text-white p-3 rounded-lg max-w-xs absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 shadow-lg"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="space-y-2">
            {sources.map((source, index) => (
              <div key={index}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline block"
                >
                  {source.name}
                </a>
              </div>
            ))}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </span>
  );
}
