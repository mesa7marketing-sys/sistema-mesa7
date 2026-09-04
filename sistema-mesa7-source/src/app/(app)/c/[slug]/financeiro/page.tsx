import { requireClientAccess } from "@/lib/access";
import { PageHead, Tiles, Tile, Card } from "@/components/ui";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { latestTwoPeriods, seriesFor, pctDelta, formatBRL, formatDeltaLabel, deltaTone } from "@/lib/metrics";

const KEYS = ["faturamento_total", "ticket_medio"];

export default async function FinanceiroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { client } = await requireClientAccess(slug);

  const m = await latestTwoPeriods(client.id, KEYS);
  const faturamento = await seriesFor(client.id, "faturamento_total");
  const ticket = await seriesFor(client.id, "ticket_medio");

  return (
    <div style={{ padding: "26px 28px 60px", maxWidth: 1180 }}>
      <PageHead
        kicker="Operação"
        title={`Financeiro — ${client.name}`}
        description="Faturamento, ticket médio e demais indicadores financeiros do período."
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
      </Tiles>

      <Card title="Faturamento por semana" subtitle="Últimas 8 semanas · preenchimento manual">
        <BarChart
          data={faturamento.xLabels.map((label, i) => ({ label, value: faturamento.values[i], color: "var(--series-3)" }))}
          format="currency-k"
          aria="Faturamento por semana"
        />
      </Card>
      <Card title="Ticket médio" subtitle="Últimas 8 semanas">
        <LineChart
          series={[{ name: "Ticket médio", color: "var(--series-4)", values: ticket.values }]}
          xLabels={ticket.xLabels}
          format="currency"
          aria="Ticket médio por semana"
        />
      </Card>
    </div>
  );
}
