/** @type {import('next').NextConfig} */
const nextConfig = {
  // Nova configuração para Turbopack no Next.js 15
  turbopack: {
    resolveAlias: {
      "@": "./src",
      "@/components": "./src/components",
      "@/lib": "./src/lib",
      "@/app": "./src/app",
      "@/types": "./src/types",
    },
  },
  // Webpack fallback para casos onde Turbopack não é usado
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": "./src",
      "@/components": "./src/components",
      "@/lib": "./src/lib",
      "@/app": "./src/app",
      "@/types": "./src/types",
    };

    return config;
  },
  // Otimizações para produção (removido swcMinify que foi depreciado)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
