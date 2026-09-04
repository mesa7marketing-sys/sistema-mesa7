// Carga única de "Investimento Meta Ads" (última semana), puxada manualmente
// via conexão Meta Ads do Claude em 04/09/2026. Registra também o mapeamento
// clientId -> ad_account_id em meta_ads_accounts, pra reaproveitar quando o
// job automático (semanal, via token) for ligado.
import "dotenv/config";
import { db } from "./index";
import { clients, weeklyMetrics, metaAdsAccounts } from "./schema";
import { eq } from "drizzle-orm";
import { mondayOf } from "../lib/metrics";

const DATA: { slug: string; adAccountId: string; spend: number }[] = [
  { slug: "bionatural", adAccountId: "1496987041795612", spend: 326.02 },
  { slug: "garage-84", adAccountId: "601116868837577", spend: 517.24 },
  { slug: "pacocas-unidade-1", adAccountId: "4031861550265484", spend: 572.29 },
  { slug: "pacocas-unidade-2", adAccountId: "450453267826337", spend: 933.93 },
  { slug: "la-pizza-dcaio", adAccountId: "450813192306889", spend: 670.11 },
];

async function main() {
  const periodStart = mondayOf(new Date());

  for (const row of DATA) {
    const [client] = await db.select().from(clients).where(eq(clients.slug, row.slug)).limit(1);
    if (!client) {
      console.log(`cliente não encontrado: ${row.slug} — pulando`);
      continue;
    }

    const [existingAcc] = await db
      .select()
      .from(metaAdsAccounts)
      .where(eq(metaAdsAccounts.clientId, client.id))
      .limit(1);
    if (!existingAcc) {
      await db.insert(metaAdsAccounts).values({ clientId: client.id, adAccountId: row.adAccountId });
      console.log(`conta Meta registrada: ${row.slug} -> ${row.adAccountId}`);
    }

    await db
      .insert(weeklyMetrics)
      .values({
        clientId: client.id,
        periodStart,
        pillar: "conversao",
        metricKey: "meta_investimento",
        metricValue: row.spend.toFixed(2),
        origem: "meta_ads",
      })
      .onConflictDoUpdate({
        target: [weeklyMetrics.clientId, weeklyMetrics.periodStart, weeklyMetrics.metricKey],
        set: { metricValue: row.spend.toFixed(2), origem: "meta_ads", updatedAt: new Date() },
      });
    console.log(`investimento gravado: ${row.slug} = R$ ${row.spend.toFixed(2)}`);
  }

  console.log("\nConcluído.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
