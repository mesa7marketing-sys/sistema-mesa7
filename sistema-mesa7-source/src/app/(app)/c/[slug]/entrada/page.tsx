import { requireClientAccess } from "@/lib/access";
import { PageHead, Card } from "@/components/ui";
import { valuesForWeek, mondayOf } from "@/lib/metrics";
import { manualMetricDefs, PILLAR_LABEL } from "@/lib/metric-defs";
import { saveWeeklyEntry } from "./actions";
import { redirect } from "next/navigation";

export default async function EntradaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { session, client } = await requireClientAccess(slug);

  if (session.user.role === "client") {
    redirect(`/c/${slug}/resumo`);
  }

  const defs = manualMetricDefs();
  const periodStart = mondayOf(new Date());
  const current = await valuesForWeek(client.id, defs.map((d) => d.key), periodStart);

  const pillars = Array.from(new Set(defs.map((d) => d.pillar)));

  return (
    <div style={{ padding: "26px 28px 60px", maxWidth: 780 }}>
      <PageHead
        kicker="Preenchimento semanal"
        title={`Lançar dados — ${client.name}`}
        description={`Semana de referência: ${new Date(periodStart + "T00:00:00").toLocaleDateString("pt-BR")}. Só é preciso preencher o que não vem de API automaticamente.`}
      />

      <form action={saveWeeklyEntry}>
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="periodStart" value={periodStart} />
        {pillars.map((pillar) => (
          <Card key={pillar} title={PILLAR_LABEL[pillar]}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {defs
                .filter((d) => d.pillar === pillar)
                .map((d) => (
                  <label key={d.key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <span style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 700 }}>
                      {d.label} {d.unit && <span style={{ color: "var(--text-muted)" }}>({d.unit})</span>}
                    </span>
                    <input
                      name={d.key}
                      type="text"
                      inputMode="decimal"
                      defaultValue={current[d.key] ?? ""}
                      placeholder="—"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border-strong)",
                        borderRadius: 9,
                        padding: "9px 11px",
                        color: "var(--text-primary)",
                        fontSize: 14,
                        fontFamily: "inherit",
                        maxWidth: 260,
                      }}
                    />
                  </label>
                ))}
            </div>
          </Card>
        ))}

        <button
          type="submit"
          style={{
            background: "var(--accent)",
            color: "var(--accent-ink)",
            border: "none",
            borderRadius: 9,
            padding: "11px 20px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Salvar dados da semana
        </button>
      </form>
    </div>
  );
}
