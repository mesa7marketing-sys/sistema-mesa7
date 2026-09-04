import { redirect } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/access";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export default async function HomePage() {
  const session = await requireSession();

  if (session.user.role === "client" && session.user.clientId) {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, session.user.clientId))
      .limit(1);
    if (client) redirect(`/c/${client.slug}/resumo`);
  }

  const allClients = await db
    .select()
    .from(clients)
    .where(eq(clients.active, true))
    .orderBy(asc(clients.name));

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--page)",
        color: "var(--text-primary)",
        padding: "40px",
      }}
    >
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Clientes</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
        Selecione um cliente para ver o relatório.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 12, maxWidth: 900 }}>
        {allClients.map((c) => (
          <Link
            key={c.id}
            href={`/c/${c.slug}/resumo`}
            style={{
              display: "block",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "18px 16px",
              color: "var(--text-primary)",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 14.5,
            }}
          >
            {c.name}
          </Link>
        ))}
        {allClients.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: 13.5 }}>
            Nenhum cliente cadastrado ainda.
          </div>
        )}
      </div>
    </main>
  );
}
