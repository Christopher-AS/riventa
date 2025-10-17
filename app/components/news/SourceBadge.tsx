"use client";

import { useState } from "react";

type SourceBadgeProps = {
  sourceNumber: number;
  sourceName: string;
  sourceUrl: string;
};

export default function SourceBadge({
  sourceNumber,
  sourceName,
  sourceUrl,
}: SourceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-medium cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        [{sourceNumber}]
      </span>

      {showTooltip && (
        <div
          className="bg-gray-900 text-white p-2 rounded shadow-lg absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap z-10"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {sourceName}
          </a>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </span>
  );
}
