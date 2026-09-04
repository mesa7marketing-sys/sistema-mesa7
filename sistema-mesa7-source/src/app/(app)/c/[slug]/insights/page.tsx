import { requireClientAccess } from "@/lib/access";
import { PageHead, Card } from "@/components/ui";
import { db } from "@/db";
import { insights } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function InsightsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { client } = await requireClientAccess(slug);

  const items = await db
    .select()
    .from(insights)
    .where(eq(insights.clientId, client.id))
    .orderBy(desc(insights.periodStart));

  return (
    <div style={{ padding: "26px 28px 60px", maxWidth: 1180 }}>
      <PageHead
        kicker="Operação"
        title={`Insights — ${client.name}`}
        description="Observações qualitativas registradas pela equipe a cada período."
      />
      {items.length === 0 ? (
        <Card>
          <div style={{ color: "var(--text-muted)", fontSize: 13.5 }}>
            Nenhum insight registrado ainda.
          </div>
        </Card>
      ) : (
        items.map((i) => (
          <Card key={i.id} subtitle={new Date(i.periodStart).toLocaleDateString("pt-BR")}>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              {i.text}
            </p>
          </Card>
        ))
      )}
    </div>
  );
}
