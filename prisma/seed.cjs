const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Resetando tabelas...");

  // Apaga dados em ordem para evitar erros de chave estrangeira
  await prisma.postLike.deleteMany();
  await prisma.post.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Tabelas limpas.");

  // Cria usuário fixo
  const user = await prisma.user.create({
    data: {
      id: "c9afb578-aa78-4bc9-9e4a-76279602d977",
      email: "alice@demo.com",
      password: "hashed_password_demo",
      profile: {
        create: {
          name: "Alice Demo",
          bio: "Usuária inicial para testes",
          avatarUrl: "https://placehold.co/100x100"
        }
      }
    },
  });

  // Cria post vinculado ao usuário
  const post = await prisma.post.create({
    data: {
      content: "Primeiro post do feed 🎯",
      authorId: user.id,
    },
  });

  console.log("👤 Usuário criado:", user.email);
  console.log("📝 Post criado:", post.content);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
