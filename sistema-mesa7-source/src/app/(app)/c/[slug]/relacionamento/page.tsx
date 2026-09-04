import { requireClientAccess } from "@/lib/access";
import { PageHead, Tiles, Tile, Card } from "@/components/ui";
import { LineChart } from "@/components/charts/LineChart";
import { latestTwoPeriods, seriesFor, pctDelta, formatNumber, formatDeltaLabel, deltaTone } from "@/lib/metrics";

const KEYS = ["clientes_ativos_crm", "taxa_recompra"];

export default async function RelacionamentoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { client } = await requireClientAccess(slug);

  const m = await latestTwoPeriods(client.id, KEYS);
  const ativos = await seriesFor(client.id, "clientes_ativos_crm");
  const recompra = await seriesFor(client.id, "taxa_recompra");

  return (
    <div style={{ padding: "26px 28px 60px", maxWidth: 1180 }}>
      <PageHead
        kicker="Método CVR"
        title={`Relacionamento — ${client.name}`}
        description="CRM, RePediu, base de clientes, WhatsApp, SMS, programa de fidelidade e recuperação de clientes — a fidelização."
      />

      <Tiles>
        <Tile
          label="Clientes ativos (CRM)"
          value={formatNumber(m.clientes_ativos_crm.current)}
          deltaLabel={formatDeltaLabel(pctDelta(m.clientes_ativos_crm.current, m.clientes_ativos_crm.previous))}
          deltaTone={deltaTone(pctDelta(m.clientes_ativos_crm.current, m.clientes_ativos_crm.previous))}
          caption="Semana atual"
        />
        <Tile
          label="Taxa de recompra"
          value={m.taxa_recompra.current ? `${formatNumber(m.taxa_recompra.current, 1)}%` : "—"}
          deltaLabel={formatDeltaLabel(pctDelta(m.taxa_recompra.current, m.taxa_recompra.previous))}
          deltaTone={deltaTone(pctDelta(m.taxa_recompra.current, m.taxa_recompra.previous))}
        />
      </Tiles>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title="Clientes ativos na base CRM" subtitle="Últimas 8 semanas · preenchimento manual">
          <LineChart
            series={[{ name: "Clientes ativos", color: "var(--series-1)", values: ativos.values }]}
            xLabels={ativos.xLabels}
            format="number"
            aria="Clientes ativos por semana"
          />
        </Card>
        <Card title="Taxa de recompra" subtitle="Últimas 8 semanas · preenchimento manual">
          <LineChart
            series={[{ name: "Recompra", color: "var(--series-5)", values: recompra.values }]}
            xLabels={recompra.xLabels}
            format="percent0"
            aria="Taxa de recompra por semana"
          />
        </Card>
      </div>
    </div>
  );
}
