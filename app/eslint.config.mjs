import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  // Reaproveita as configs “legado” do Next usando FlatCompat
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Desliga regras que conflitam com formatação (equivalente ao eslint-config-prettier)
  prettierConfig,

  // Liga o plugin do Prettier e falha no lint se algo estiver fora do padrão
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    plugins: { prettier: prettierPlugin },
    rules: {
      "prettier/prettier": "error",
    },
  },
];
