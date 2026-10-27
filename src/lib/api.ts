export async function apiCall<T = any>(
  action: string,
  payload: Record<string, any> = {}
): Promise<T> {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || `Erro HTTP ${res.status}`);
  }
  return (json.data !== undefined ? json.data : json) as T;
}

export function formatMoeda(valor: number | null | undefined): string {
  if (valor == null || Number.isNaN(Number(valor))) return "Preço a consultar";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor));
}

export function calcularDesconto(
  preco: number | null | undefined,
  precoOriginal: number | null | undefined
): number | null {
  const p = Number(preco);
  const po = Number(precoOriginal);
  if (!p || !po || po <= p) return null;
  return Math.round(((po - p) / po) * 100);
}

export function formatData(dataStr: string | null | undefined): string {
  if (!dataStr) return "";
  const d = new Date(dataStr);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(d);
}

export function truncar(texto: string | null | undefined, max = 160): string {
  if (!texto) return "";
  const limpo = texto.replace(/\s+/g, " ").trim();
  if (limpo.length <= max) return limpo;
  return `${limpo.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

export function gerarLinksCompartilhamento({
  titulo,
  url,
  preco,
}: {
  titulo: string;
  url: string;
  preco?: number | null;
}) {
  const texto = preco ? `${titulo} — ${formatMoeda(preco)}` : titulo;
  const encTexto = encodeURIComponent(texto);
  const encUrl = encodeURIComponent(url);
  return {
    whatsapp: `https://wa.me/?text=${encTexto}%20${encUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encTexto}&url=${encUrl}`,
    telegram: `https://t.me/share/url?url=${encUrl}&text=${encUrl}`,
  };
}

export function normalizarImagemOg(url: string | null | undefined): string | null {
  if (!url?.startsWith("https://")) return null;
  if (url.includes("mlstatic.com/") && url.endsWith(".webp")) {
    return `${url.slice(0, -5)}.jpg`;
  }
  return url;
}

export function gerarMensagemWhatsapp(e: {
  titulo: string;
  preco?: number | null;
  precoOriginal?: number | null;
  chamada?: string | null;
  cupons?: string[] | null;
  formaPagamento?: string | null;
  url: string;
}): string {
  const linhas: string[] = [];
  if (e.chamada) linhas.push(`🔥 ${e.chamada.toUpperCase()}`, "");
  linhas.push(`*${e.titulo}*`, "");
  const pag = e.formaPagamento ? ` ${e.formaPagamento}` : "";
  if (e.preco && e.precoOriginal && e.precoOriginal > e.preco) {
    linhas.push(
      `~DE ${formatMoeda(e.precoOriginal)}~ | *POR ${formatMoeda(e.preco)}${pag}*`
    );
  } else if (e.preco) {
    linhas.push(`*POR ${formatMoeda(e.preco)}${pag}*`);
  }
  const cupons = (e.cupons ?? []).map((c) => c.trim()).filter(Boolean);
  for (const c of cupons) {
    linhas.push(`🎟️ CUPOM: *${c}*`);
  }
  linhas.push("", e.url);
  return linhas.join("\n");
}

export function gerarLegendaRedes(e: {
  titulo: string;
  preco?: number | null;
  precoOriginal?: number | null;
  url: string;
  categoria?: string | null;
}): string {
  const { titulo, preco, precoOriginal, url, categoria } = e;
  const linhas = [`🔥 ${titulo}`];
  if (preco && precoOriginal && precoOriginal > preco) {
    const desc = Math.round(((precoOriginal - preco) / precoOriginal) * 100);
    linhas.push(`💰 De ${formatMoeda(precoOriginal)} por ${formatMoeda(preco)} (${desc}% OFF)`);
  } else if (preco) {
    linhas.push(`💰 ${formatMoeda(preco)}`);
  }
  linhas.push("", `👉 Acesse: ${url}`, "");
  const tags = ["#dnaofertas", "#promocao", "#oferta", "#desconto", "#comprasonline"];
  if (categoria) {
    tags.unshift(
      `#${categoria
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}`
    );
  }
  linhas.push(tags.join(" "));
  return linhas.join("\n");
}

const AUTH_STORAGE_KEY = "dna_ofertas_session";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {}
}
