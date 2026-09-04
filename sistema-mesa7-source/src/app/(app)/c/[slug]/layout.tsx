import { requireClientAccess } from "@/lib/access";
import { Sidebar } from "@/components/Sidebar";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administração",
  cs: "Customer Success",
  trafego: "Tráfego",
  social: "Social Media",
  cardapio: "Gestão de Cardápio",
  crm: "CRM",
  design: "Design",
  google: "Google",
  client: "Cliente",
};

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { session } = await requireClientAccess(slug);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "252px 1fr", minHeight: "100vh" }}>
      <Sidebar
        clientSlug={slug}
        userName={session.user.name ?? ""}
        userRole={ROLE_LABEL[session.user.role] ?? session.user.role}
        showEntrada={session.user.role !== "client"}
      />
      <main style={{ minWidth: 0 }}>{children}</main>
    </div>
  );
}
