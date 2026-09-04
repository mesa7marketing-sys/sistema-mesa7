import { requireClientAccess } from "@/lib/access";
import { PageHead, Tiles, Tile, Card } from "@/components/ui";
import { LineChart } from "@/components/charts/LineChart";
import { latestTwoPeriods, seriesFor, pctDelta, formatNumber, formatDeltaLabel, deltaTone } from "@/lib/metrics";

const KEYS = ["cardapio_visualizacoes", "cardapio_conversao"];

export default async function CardapioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { client } = await requireClientAccess(slug);

  const m = await latestTwoPeriods(client.id, KEYS);
  const visualizacoes = await seriesFor(client.id, "cardapio_visualizacoes");
  const conversao = await seriesFor(client.id, "cardapio_conversao");

  return (
    <div style={{ padding: "26px 28px 60px", maxWidth: 1180 }}>
      <PageHead
        kicker="Operação"
        title={`Cardápio — ${client.name}`}
        description="Visualizações e conversão do cardápio digital. A Curva ABC por item (itens mais vendidos, ticket por prato) entra numa próxima etapa, quando o histórico de vendas por item estiver integrado."
      />

      <Tiles>
        <Tile
          label="Visualizações do cardápio"
          value={formatNumber(m.cardapio_visualizacoes.current)}
          deltaLabel={formatDeltaLabel(pctDelta(m.cardapio_visualizacoes.current, m.cardapio_visualizacoes.previous))}
          deltaTone={deltaTone(pctDelta(m.cardapio_visualizacoes.current, m.cardapio_visualizacoes.previous))}
          caption="Semana atual"
        />
        <Tile
          label="Conversão do cardápio"
          value={m.cardapio_conversao.current ? `${formatNumber(m.cardapio_conversao.current, 1)}%` : "—"}
          deltaLabel={formatDeltaLabel(pctDelta(m.cardapio_conversao.current, m.cardapio_conversao.previous))}
          deltaTone={deltaTone(pctDelta(m.cardapio_conversao.current, m.cardapio_conversao.previous))}
          caption="Visualização → pedido"
        />
      </Tiles>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title="Visualizações" subtitle="Últimas 8 semanas · origem: Cardápio Web">
          <LineChart
            series={[{ name: "Visualizações", color: "var(--series-7)", values: visualizacoes.values }]}
            xLabels={visualizacoes.xLabels}
            format="number"
            aria="Visualizações do cardápio por semana"
          />
        </Card>
        <Card title="Conversão" subtitle="Últimas 8 semanas · origem: Cardápio Web">
          <LineChart
            series={[{ name: "Conversão", color: "var(--series-2)", values: conversao.values }]}
            xLabels={conversao.xLabels}
            format="percent0"
            aria="Conversão do cardápio por semana"
          />
        </Card>
      </div>
    </div>
  );
}
