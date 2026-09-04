import "dotenv/config";
import { db } from "./index";
import { clients, users } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function upsertClient(name: string, slug: string) {
  const [existing] = await db.select().from(clients).where(eq(clients.slug, slug)).limit(1);
  if (existing) {
    console.log(`cliente já existe: ${name} (${slug})`);
    return existing;
  }
  const [created] = await db.insert(clients).values({ name, slug }).returning();
  console.log(`cliente criado: ${name} (${slug})`);
  return created;
}

async function upsertUser({
  name,
  email,
  password,
  role,
}: {
  name: string;
  email: string;
  password: string;
  role: (typeof users.$inferInsert)["role"];
}) {
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    console.log(`usuário já existe: ${name} <${email}>`);
    return existing;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [created] = await db
    .insert(users)
    .values({ name, email, passwordHash, role })
    .returning();
  console.log(`usuário criado: ${name} <${email}> (${role}) — senha: ${password}`);
  return created;
}

async function main() {
  console.log("=== Clientes Fase 1 ===");
  await upsertClient("Bionatural", "bionatural");
  await upsertClient("La Pizza D'Caio", "la-pizza-dcaio");
  await upsertClient("Paçocas - Unidade 1", "pacocas-unidade-1");
  await upsertClient("Paçocas - Unidade 2", "pacocas-unidade-2");
  await upsertClient("Garage 84", "garage-84");

  console.log("\n=== Equipe Mesa7 ===");
  await upsertUser({ name: "Samuel", email: "samuel@mesa7.com", password: "mesa7samuel", role: "cs" });
  await upsertUser({ name: "Manoel", email: "manoel@mesa7.com", password: "mesa7manoel", role: "trafego" });
  await upsertUser({ name: "Julia Braz", email: "julia@mesa7.com", password: "mesa7julia", role: "social" });
  await upsertUser({ name: "Nicole", email: "nicole@mesa7.com", password: "mesa7nicole", role: "design" });
  await upsertUser({ name: "Emerson", email: "emerson@mesa7.com", password: "mesa7emerson", role: "cardapio" });

  console.log("\n=== Desativando cliente de exemplo ===");
  await db.update(clients).set({ active: false }).where(eq(clients.slug, "sabor-e-brasa"));
  console.log("Sabor & Brasa (exemplo) desativado.");

  console.log("\nConcluído.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
