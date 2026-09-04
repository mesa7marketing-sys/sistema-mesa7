import { requireClientAccess } from "@/lib/access";
import { PageHead, Card } from "@/components/ui";
import { db } from "@/db";
import { actionItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  atrasado: "Atrasado",
};

export default async function PlanoDeAcaoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { client } = await requireClientAccess(slug);

  const items = await db
    .select()
    .from(actionItems)
    .where(eq(actionItems.clientId, client.id))
    .orderBy(desc(actionItems.createdAt));

  return (
    <div style={{ padding: "26px 28px 60px", maxWidth: 1180 }}>
      <PageHead
        kicker="Operação"
        title={`Plano de Ação — ${client.name}`}
        description="Itens em andamento definidos com o cliente, com responsável e status."
      />
      <Card>
        {items.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13.5 }}>
            Nenhum item cadastrado ainda.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.8 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 800, padding: "0 10px 8px", borderBottom: "1px solid var(--border-strong)" }}>Ação</th>
                <th style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 800, padding: "0 10px 8px", borderBottom: "1px solid var(--border-strong)" }}>Responsável</th>
                <th style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 800, padding: "0 10px 8px", borderBottom: "1px solid var(--border-strong)" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "9px 10px", color: "var(--text-primary)" }}>{a.title}</td>
                  <td style={{ padding: "9px 10px", color: "var(--text-muted)" }}>{a.responsible}</td>
                  <td style={{ padding: "9px 10px" }}>{STATUS_LABEL[a.status] ?? a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
