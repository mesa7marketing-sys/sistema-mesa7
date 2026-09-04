import { requireClientAccess } from "@/lib/access";
import { PageHead, Tiles, Tile, Card } from "@/components/ui";
import { latestTwoPeriods, pctDelta, formatBRL, formatNumber, formatDeltaLabel, deltaTone } from "@/lib/metrics";
import { db } from "@/db";
import { actionItems, insights } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const KEYS = [
  "faturamento_total",
  "ticket_medio",
  "meta_investimento",
  "meta_roas",
  "instagram_seguidores",
  "avaliacoes_google_nota",
  "taxa_recompra",
  "clientes_ativos_crm",
];

export default async function ResumoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { client } = await requireClientAccess(slug);

  const m = await latestTwoPeriods(client.id, KEYS);

  const openActions = await db
    .select()
    .from(actionItems)
    .where(eq(actionItems.clientId, client.id))
    .orderBy(desc(actionItems.createdAt))
    .limit(5);

  const recentInsights = await db
    .select()
    .from(insights)
    .where(eq(insights.clientId, client.id))
    .orderBy(desc(insights.periodStart))
    .limit(3);

  return (
    <div style={{ padding: "26px 28px 60px", maxWidth: 1180 }}>
      <PageHead
        kicker="Visão geral"
        title={`Resumo Executivo — ${client.name}`}
        description="Panorama da semana mais recente em todos os pilares do Método CVR: Conversão, Valor e Relacionamento."
      />

      <Tiles>
        <Tile
          label="Faturamento total"
          value={formatBRL(m.faturamento_total.current)}
          deltaLabel={formatDeltaLabel(pctDelta(m.faturamento_total.current, m.faturamento_total.previous))}
          deltaTone={deltaTone(pctDelta(m.faturamento_total.current, m.faturamento_total.previous))}
          caption="Semana atual"
        />
        <Tile
          label="Ticket médio"
          value={formatBRL(m.ticket_medio.current)}
          deltaLabel={formatDeltaLabel(pctDelta(m.ticket_medio.current, m.ticket_medio.previous))}
          deltaTone={deltaTone(pctDelta(m.ticket_medio.current, m.ticket_medio.previous))}
        />
        <Tile
          label="Investimento Meta Ads"
          value={formatBRL(m.meta_investimento.current)}
          deltaLabel={formatDeltaLabel(pctDelta(m.meta_investimento.current, m.meta_investimento.previous))}
          deltaTone={deltaTone(pctDelta(m.meta_investimento.current, m.meta_investimento.previous))}
        />
        <Tile
          label="ROAS"
          value={m.meta_roas.current ? `${formatNumber(m.meta_roas.current, 1)}x` : "—"}
          deltaLabel={formatDeltaLabel(pctDelta(m.meta_roas.current, m.meta_roas.previous))}
          deltaTone={deltaTone(pctDelta(m.meta_roas.current, m.meta_roas.previous))}
        />
        <Tile
          label="Seguidores Instagram"
          value={formatNumber(m.instagram_seguidores.current)}
          deltaLabel={formatDeltaLabel(pctDelta(m.instagram_seguidores.current, m.instagram_seguidores.previous))}
          deltaTone={deltaTone(pctDelta(m.instagram_seguidores.current, m.instagram_seguidores.previous))}
        />
        <Tile
          label="Nota Google"
          value={m.avaliacoes_google_nota.current ? formatNumber(m.avaliacoes_google_nota.current, 1) : "—"}
          caption="Google Meu Negócio"
        />
        <Tile
          label="Taxa de recompra"
          value={m.taxa_recompra.current ? `${formatNumber(m.taxa_recompra.current, 1)}%` : "—"}
          deltaLabel={formatDeltaLabel(pctDelta(m.taxa_recompra.current, m.taxa_recompra.previous))}
          deltaTone={deltaTone(pctDelta(m.taxa_recompra.current, m.taxa_recompra.previous))}
        />
        <Tile
          label="Clientes ativos (CRM)"
          value={formatNumber(m.clientes_ativos_crm.current)}
          deltaLabel={formatDeltaLabel(pctDelta(m.clientes_ativos_crm.current, m.clientes_ativos_crm.previous))}
          deltaTone={deltaTone(pctDelta(m.clientes_ativos_crm.current, m.clientes_ativos_crm.previous))}
        />
      </Tiles>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14, alignItems: "start" }}>
        <Card title="Plano de ação — em aberto" subtitle="Itens mais recentes">
          {openActions.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhum item cadastrado ainda.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.8 }}>
              <tbody>
                {openActions.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "9px 6px", color: "var(--text-primary)" }}>{a.title}</td>
                    <td style={{ padding: "9px 6px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {a.responsible}
                    </td>
                    <td style={{ padding: "9px 6px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "4px 9px",
                          borderRadius: 99,
                          color:
                            a.status === "concluido"
                              ? "var(--status-good)"
                              : a.status === "atrasado"
                                ? "var(--status-critical)"
                                : "var(--series-1)",
                          background:
                            a.status === "concluido"
                              ? "var(--status-good-bg)"
                              : a.status === "atrasado"
                                ? "var(--status-critical-bg)"
                                : "rgba(57,135,229,0.16)",
                        }}
                      >
                        {a.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Insights" subtitle="Observações da semana">
          {recentInsights.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhum insight registrado ainda.</div>
          ) : (
            recentInsights.map((i) => (
              <p key={i.id} style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, margin: "0 0 10px" }}>
                {i.text}
              </p>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
