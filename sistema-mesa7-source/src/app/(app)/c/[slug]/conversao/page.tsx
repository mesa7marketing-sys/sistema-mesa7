import { requireClientAccess } from "@/lib/access";
import { PageHead, Tiles, Tile, Card } from "@/components/ui";
import { LineChart } from "@/components/charts/LineChart";
import { latestTwoPeriods, seriesFor, pctDelta, formatBRL, formatNumber, formatDeltaLabel, deltaTone } from "@/lib/metrics";

const KEYS = ["meta_investimento", "meta_leads", "meta_roas"];

export default async function ConversaoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { client } = await requireClientAccess(slug);

  const m = await latestTwoPeriods(client.id, KEYS);
  const investimento = await seriesFor(client.id, "meta_investimento");
  const leads = await seriesFor(client.id, "meta_leads");
  const roas = await seriesFor(client.id, "meta_roas");

  return (
    <div style={{ padding: "26px 28px 60px", maxWidth: 1180 }}>
      <PageHead
        kicker="Método CVR"
        title={`Conversão — ${client.name}`}
        description="Meta Ads, Google Ads, cardápio digital, landing pages, Google Meu Negócio e estratégias de oferta — tudo que gera vendas."
      />

      <Tiles>
        <Tile
          label="Investimento Meta Ads"
          value={formatBRL(m.meta_investimento.current)}
          deltaLabel={formatDeltaLabel(pctDelta(m.meta_investimento.current, m.meta_investimento.previous))}
          deltaTone={deltaTone(pctDelta(m.meta_investimento.current, m.meta_investimento.previous))}
          caption="Semana atual"
        />
        <Tile
          label="Leads"
          value={formatNumber(m.meta_leads.current)}
          deltaLabel={formatDeltaLabel(pctDelta(m.meta_leads.current, m.meta_leads.previous))}
          deltaTone={deltaTone(pctDelta(m.meta_leads.current, m.meta_leads.previous))}
        />
        <Tile
          label="ROAS"
          value={m.meta_roas.current ? `${formatNumber(m.meta_roas.current, 1)}x` : "—"}
          deltaLabel={formatDeltaLabel(pctDelta(m.meta_roas.current, m.meta_roas.previous))}
          deltaTone={deltaTone(pctDelta(m.meta_roas.current, m.meta_roas.previous))}
        />
      </Tiles>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title="Investimento em Meta Ads" subtitle="Últimas 8 semanas · origem: Meta Ads">
          <LineChart
            series={[{ name: "Investimento", color: "var(--series-1)", values: investimento.values }]}
            xLabels={investimento.xLabels}
            format="currency-k"
            aria="Investimento em Meta Ads por semana"
          />
        </Card>
        <Card title="Leads gerados" subtitle="Últimas 8 semanas · origem: Meta Ads">
          <LineChart
            series={[{ name: "Leads", color: "var(--series-2)", values: leads.values }]}
            xLabels={leads.xLabels}
            format="number"
            aria="Leads gerados por semana"
          />
        </Card>
      </div>
      <Card title="ROAS" subtitle="Retorno sobre investimento em anúncios · últimas 8 semanas">
        <LineChart
          series={[{ name: "ROAS", color: "var(--series-3)", values: roas.values }]}
          xLabels={roas.xLabels}
          format="multiplier1"
          aria="ROAS por semana"
        />
      </Card>
    </div>
  );
}
