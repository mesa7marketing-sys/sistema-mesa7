import { requireClientAccess } from "@/lib/access";
import { PageHead, Tiles, Tile, Card } from "@/components/ui";
import { LineChart } from "@/components/charts/LineChart";
import { latestTwoPeriods, seriesFor, pctDelta, formatNumber, formatDeltaLabel, deltaTone } from "@/lib/metrics";

const KEYS = ["instagram_seguidores", "avaliacoes_google_nota"];

export default async function ValorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { client } = await requireClientAccess(slug);

  const m = await latestTwoPeriods(client.id, KEYS);
  const seguidores = await seriesFor(client.id, "instagram_seguidores");
  const nota = await seriesFor(client.id, "avaliacoes_google_nota");

  return (
    <div style={{ padding: "26px 28px 60px", maxWidth: 1180 }}>
      <PageHead
        kicker="Método CVR"
        title={`Valor — ${client.name}`}
        description="Social media, conteúdo, experiência, ambiente, avaliações e posicionamento — a construção da marca."
      />

      <Tiles>
        <Tile
          label="Seguidores Instagram"
          value={formatNumber(m.instagram_seguidores.current)}
          deltaLabel={formatDeltaLabel(pctDelta(m.instagram_seguidores.current, m.instagram_seguidores.previous))}
          deltaTone={deltaTone(pctDelta(m.instagram_seguidores.current, m.instagram_seguidores.previous))}
          caption="Semana atual"
        />
        <Tile
          label="Nota Google"
          value={m.avaliacoes_google_nota.current ? formatNumber(m.avaliacoes_google_nota.current, 1) : "—"}
          deltaLabel={formatDeltaLabel(pctDelta(m.avaliacoes_google_nota.current, m.avaliacoes_google_nota.previous))}
          deltaTone={deltaTone(pctDelta(m.avaliacoes_google_nota.current, m.avaliacoes_google_nota.previous))}
          caption="Google Meu Negócio"
        />
      </Tiles>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title="Seguidores no Instagram" subtitle="Últimas 8 semanas · preenchimento manual">
          <LineChart
            series={[{ name: "Seguidores", color: "var(--series-5)", values: seguidores.values }]}
            xLabels={seguidores.xLabels}
            format="number"
            aria="Seguidores no Instagram por semana"
          />
        </Card>
        <Card title="Nota média no Google" subtitle="Últimas 8 semanas · origem: Google Meu Negócio">
          <LineChart
            series={[{ name: "Nota", color: "var(--series-7)", values: nota.values }]}
            xLabels={nota.xLabels}
            format="decimal1"
            aria="Nota média no Google por semana"
          />
        </Card>
      </div>
    </div>
  );
}
