import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

async function authenticate(formData: FormData) {
  "use server";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--page)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "32px 28px",
          boxShadow: "var(--shadow)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-ink)",
              fontFamily: '"Bodoni Moda", serif',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            M7
          </div>
          <div>
            <div style={{ fontFamily: '"Bodoni Moda", serif', fontSize: 20 }}>Sistema Mesa7</div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Painel de relatórios
            </div>
          </div>
        </div>

        {params.error && (
          <div
            style={{
              background: "var(--status-critical-bg)",
              color: "var(--status-critical)",
              fontSize: 13,
              padding: "10px 12px",
              borderRadius: 9,
              marginBottom: 16,
            }}
          >
            E-mail ou senha inválidos.
          </div>
        )}

        <form action={authenticate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input type="hidden" name="callbackUrl" value={params.callbackUrl || "/"} />
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 700 }}>
              E-mail
            </span>
            <input
              name="email"
              type="email"
              required
              autoFocus
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-strong)",
                borderRadius: 9,
                padding: "10px 12px",
                color: "var(--text-primary)",
                fontSize: 14,
                fontFamily: "inherit",
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 700 }}>
              Senha
            </span>
            <input
              name="password"
              type="password"
              required
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-strong)",
                borderRadius: 9,
                padding: "10px 12px",
                color: "var(--text-primary)",
                fontSize: 14,
                fontFamily: "inherit",
              }}
            />
          </label>
          <button
            type="submit"
            style={{
              marginTop: 6,
              background: "var(--accent)",
              color: "var(--accent-ink)",
              border: "none",
              borderRadius: 9,
              padding: "11px 12px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
