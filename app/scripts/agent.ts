// scripts/agent.ts
import "dotenv/config";
import fs from "fs";
import path from "path";
import { exec as cpExec } from "child_process";
import { promisify } from "util";
import OpenAI from "openai";

const exec = promisify(cpExec);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ===== Util =====
function lastLines(s: string | undefined, n = 4000) {
  if (!s) return "";
  return s.slice(-n);
}

// ===== System prompt =====
const SYSTEM = `Você é o Codex (agente local) do projeto Riventa.
- Objetivo: automatizar tarefas de backend (Prisma/Next.js/Postgres) até os testes passarem.
- Você pode chamar ferramentas: exec, write_file, read_file, list_dir.
- Antes de executar um comando, diga qual comando vai rodar.
- Produza mudanças idempotentes, pequenas e bem explicadas.`;

const playbook = fs.existsSync("AGENTS.md")
  ? fs.readFileSync("AGENTS.md", "utf8")
  : "";

// ===== Tool router =====
async function toolRouter(name: string, argsStr: string) {
  const args = argsStr ? JSON.parse(argsStr) : {};
  if (name === "exec") {
    const cmd: string = args.cmd;
    const cwd: string = args.cwd || process.cwd();
    if (!cmd) return { ok: false, error: "cmd vazio" };
    try {
      const { stdout, stderr } = await exec(cmd, {
        cwd,
        maxBuffer: 1024 * 1024 * 16,
      });
      return { ok: true, stdout: lastLines(stdout), stderr: lastLines(stderr) };
    } catch (e: any) {
      return {
        ok: false,
        error: String(e?.message ?? e),
        stdout: lastLines(e?.stdout),
        stderr: lastLines(e?.stderr),
      };
    }
  }
  if (name === "write_file") {
    const filePath: string = args.path;
    const content: string = args.content ?? "";
    if (!filePath) return { ok: false, error: "path vazio" };
    const abs = path.resolve(filePath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
    return { ok: true, path: abs, bytes: Buffer.byteLength(content) };
  }
  if (name === "read_file") {
    const filePath: string = args.path;
    try {
      const content = fs.readFileSync(path.resolve(filePath), "utf8");
      return { ok: true, content: lastLines(content, 8000) };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }
  if (name === "list_dir") {
    const dir: string = args.path || ".";
    try {
      const items = fs
        .readdirSync(path.resolve(dir), { withFileTypes: true })
        .map((d) => (d.isDirectory() ? d.name + "/" : d.name));
      return { ok: true, items };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }
  return { ok: false, error: `tool desconhecida: ${name}` };
}

// ===== Tools (schema esperado pela API) =====
const tools: any[] = [
  {
    type: "function",
    name: "exec",
    description: "Executa comando de shell",
    parameters: {
      type: "object",
      properties: {
        cmd: { type: "string" },
        cwd: { type: "string" },
      },
      required: ["cmd"],
    },
  },
  {
    type: "function",
    name: "write_file",
    description: "Escreve arquivo (cria pastas)",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string" },
        content: { type: "string" },
      },
      required: ["path", "content"],
    },
  },
  {
    type: "function",
    name: "read_file",
    description: "Lê arquivo",
    parameters: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
    },
  },
  {
    type: "function",
    name: "list_dir",
    description: "Lista diretório",
    parameters: { type: "object", properties: { path: { type: "string" } } },
  },
];

// ===== Loop =====
async function run(goal: string) {
  let messages: any[] = [
    { role: "system", content: SYSTEM },
    { role: "user", content: `Playbook:\n${playbook}\n\nTarefa:\n${goal}` },
  ];

  for (let step = 0; step < 24; step++) {
    const res = await openai.responses.create({
      model: "gpt-5-codex",
      input: messages,
      tools,
      parallel_tool_calls: true,
    });

    // A API pode retornar múltiplos "output" (razão + várias function_calls)
    const outputs: any[] = Array.isArray(res.output) ? res.output : [];
    const functionCalls = outputs.filter((o) => o.type === "function_call");
    const reasonings = outputs.filter((o) => o.type === "reasoning");
    const texts = outputs.filter(
      (o) => o.type === "message" || o.type === "output_text"
    );

    // imprime qualquer texto/explicação
    const outText =
      res.output_text ||
      texts
        .map((t: any) => t.text)
        .filter(Boolean)
        .join("\n") ||
      "";
    if (outText.trim()) console.log("\n🤖 Codex:\n" + outText.trim());

    // se não tem function_call, acabou
    if (!functionCalls.length) break;

    // executa todas as tool calls retornadas neste passo
    for (const fc of functionCalls) {
      const name = fc.name;
      const args = fc.arguments ?? "{}";
      console.log(`\n🔧 ${name} -> ${args}`);
      const result = await toolRouter(name, args);
      messages.push({
        role: "tool",
        tool_call_id: fc.call_id || fc.id || name + "_" + Date.now(),
        content: JSON.stringify(result),
      });
      // feedback de resultado no console
      console.log("   ↳ result:", JSON.stringify(result).slice(0, 800));
    }
  }
}

// ===== Objetivo default =====
const goal =
  process.argv.slice(2).join(" ") ||
  `Valide ambiente:
- rode "npx prisma generate"
- rode "npm run dev" se não estiver rodando
- teste com curl: GET http://localhost:3000/api/feed?userId=c9afb578-aa78-4bc9-9e4a-76279602d977&limit=5
Se falhar, proponha e aplique correções.`;

run(goal).catch((e) => {
  console.error(e);
  process.exit(1);
});
