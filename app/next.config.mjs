/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Não falhar o build por erros de lint
    ignoreDuringBuilds: true,
  },
  // Se algum dia o TypeScript travar o build, dá pra liberar também:
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
