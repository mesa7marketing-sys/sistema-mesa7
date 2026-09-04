"use server";

import { requireClientAccess } from "@/lib/access";
import { mondayOf } from "@/lib/metrics";
import { manualMetricDefs } from "@/lib/metric-defs";
import { db } from "@/db";
import { weeklyMetrics } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function saveWeeklyEntry(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const { session, client } = await requireClientAccess(slug);

  if (session.user.role === "client") {
    throw new Error("Apenas a equipe Mesa7 pode lançar dados manuais.");
  }

  const periodStart = (formData.get("periodStart") as string) || mondayOf(new Date());
  const defs = manualMetricDefs();

  for (const def of defs) {
    const raw = formData.get(def.key);
    if (raw === null || raw === "") continue;
    const value = String(raw).replace(",", ".");
    if (Number.isNaN(Number(value))) continue;

    await db
      .insert(weeklyMetrics)
      .values({
        clientId: client.id,
        periodStart,
        pillar: def.pillar,
        metricKey: def.key,
        metricValue: value,
        origem: def.origem,
        createdBy: session.user.id,
      })
      .onConflictDoUpdate({
        target: [weeklyMetrics.clientId, weeklyMetrics.periodStart, weeklyMetrics.metricKey],
        set: { metricValue: value, origem: def.origem, createdBy: session.user.id, updatedAt: new Date() },
      });
  }

  revalidatePath(`/c/${slug}`, "layout");
}
