"use client";

import { useState } from "react";

type Source = {
  name: string;
  url: string;
};

type NewsCardProps = {
  title: string;
  subtitle: string;
  imageUrl: string;
  content: string;
  sources: Source[];
};

export default function NewsCard({
  title,
  subtitle,
  imageUrl,
  content,
  sources,
}: NewsCardProps) {
  const [showSources, setShowSources] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-2xl mx-auto">
      {/* Imagem no topo */}
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Conteúdo */}
      <div className="p-6 space-y-4">
        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

        {/* Subtítulo */}
        <p className="text-gray-600 text-sm">{subtitle}</p>

        {/* Conteúdo HTML */}
        <div
          className="prose prose-sm max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Rodapé com Fontes */}
        <div className="relative pt-4 border-t border-gray-200">
          <button
            onMouseEnter={() => setShowSources(true)}
            onMouseLeave={() => setShowSources(false)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">
              Fontes ({sources.length})
            </span>
          </button>

          {/* Dropdown de Fontes */}
          {showSources && sources.length > 0 && (
            <div
              className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[250px] z-10"
              onMouseEnter={() => setShowSources(true)}
              onMouseLeave={() => setShowSources(false)}
            >
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">
                Fontes
              </p>
              <ul className="space-y-2">
                {sources.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <span>{source.name}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
