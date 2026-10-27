import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Menu,
  X,
  ShieldCheck,
  Facebook,
  Instagram,
  Music2,
  MessageCircle,
  Send,
  Twitter,
  Copy,
} from "lucide-react";
import {
  apiCall,
  formatMoeda,
  calcularDesconto,
  gerarLinksCompartilhamento,
  getStoredUser,
} from "@/lib/api";
import { Button, Input, Badge, cn } from "@/components/ui";

export const LOGO_URL = "/dna-ofertas-logo.jpg";

export function ShareButtons({
  titulo,
  url,
  preco,
}: {
  titulo: string;
  url: string;
  preco?: number | null;
}) {
  const [copiado, setCopiado] = useState(false);
  const links = gerarLinksCompartilhamento({ titulo, url, preco });

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  const redes = [
    { href: links.whatsapp, Icon: MessageCircle, nome: "WhatsApp" },
    { href: links.facebook, Icon: Facebook, nome: "Facebook" },
    { href: links.twitter, Icon: Twitter, nome: "X" },
    { href: links.telegram, Icon: Send, nome: "Telegram" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Compartilhar:</span>
      {redes.map(({ href, Icon, nome }) => (
        <Button
          key={nome}
          asChild
          variant="outline"
          size="icon"
          aria-label={`Compartilhar no ${nome}`}
        >
          <a href={href} target="_blank" rel="noopener noreferrer">
            <Icon className="size-4" />
          </a>
        </Button>
      ))}
      <Button variant="outline" size="sm" onClick={copiar}>
        <Copy className="size-4" />
        {copiado ? "Link copiado!" : "Copiar link"}
      </Button>
    </div>
  );
}

export function CardProduto({ produto }: { produto: any }) {
  const desconto = calcularDesconto(produto.preco, produto.preco_original);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-md border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link
        to={`/produto/${produto.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="aspect-square overflow-hidden bg-muted">
          {produto.imagem_url ? (
            <img
              src={produto.imagem_url}
              alt={produto.titulo}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid size-full place-items-center text-xs text-muted-foreground">
              Sem imagem
            </div>
          )}
        </div>
      </Link>
      {desconto !== null && (
        <Badge className="absolute left-2 top-2 bg-success text-success-foreground">
          {desconto}% OFF
        </Badge>
      )}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {produto.preco_original && desconto !== null && (
          <span className="text-xs text-muted-foreground line-through">
            {formatMoeda(produto.preco_original)}
          </span>
        )}
        <span className="text-xl font-semibold leading-none text-price">
          {formatMoeda(produto.preco)}
        </span>
        <Link
          to={`/produto/${produto.slug}`}
          className="mt-1 line-clamp-3 text-sm text-muted-foreground hover:text-primary"
        >
          {produto.titulo}
        </Link>
        {produto.loja && (
          <span className="mt-auto pt-2 text-xs text-muted-foreground">
            Vendido em {produto.loja}
          </span>
        )}
      </div>
    </article>
  );
}

export function GradeProdutos({
  produtos,
  mensagemVazia,
}: {
  produtos: any[];
  mensagemVazia?: string;
}) {
  if (produtos.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {mensagemVazia ?? "Nenhum produto encontrado por aqui."}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {produtos.map((p) => (
        <CardProduto key={p.id} produto={p} />
      ))}
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const [termo, setTermo] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => apiCall<any[]>("list_categorias"),
  });

  const { data: config } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: () => apiCall<any>("get_configuracoes"),
  });

  const user = getStoredUser();
  const ehAdmin = Boolean(user);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = termo.trim().slice(0, 120);
    if (q) {
      setMenuAberto(false);
      navigate(`/busca?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-brand text-brand-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir menu"
            onClick={() => setMenuAberto(true)}
            className="shrink-0 text-brand-foreground hover:bg-brand-foreground/10 md:hidden"
          >
            <Menu className="size-5" />
          </Button>

          {menuAberto && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="fixed inset-0 z-50 bg-black/80"
                onClick={() => setMenuAberto(false)}
              />
              <div className="fixed inset-y-0 left-0 z-50 h-full w-72 border-r bg-background p-6 shadow-lg text-foreground">
                <button
                  type="button"
                  onClick={() => setMenuAberto(false)}
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
                <nav
                  className="mt-8 flex flex-col gap-1"
                  aria-label="Navegação principal"
                >
                  <Link
                    to="/produtos"
                    onClick={() => setMenuAberto(false)}
                    className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-muted"
                  >
                    Todas as ofertas
                  </Link>
                  <Link
                    to="/blog"
                    onClick={() => setMenuAberto(false)}
                    className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-muted"
                  >
                    Blog
                  </Link>
                  <span className="mt-4 px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Categorias
                  </span>
                  {categorias.map((c: any) => (
                    <Link
                      key={c.id}
                      to={`/categoria/${c.slug}`}
                      onClick={() => setMenuAberto(false)}
                      className="rounded-md px-3 py-2 text-sm hover:bg-muted"
                    >
                      {c.nome}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          )}

          <Link
            to="/"
            aria-label={config?.nome_site ?? "DNA Ofertas"}
            className="flex shrink-0 items-center gap-2 font-extrabold tracking-tight"
          >
            <img
              src={LOGO_URL}
              alt={`Logotipo ${config?.nome_site ?? "DNA Ofertas"}`}
              width={36}
              height={36}
              className="size-9 rounded-full bg-card object-cover"
            />
            <span className="hidden text-lg sm:inline">
              {config?.nome_site ?? "DNA Ofertas"}
            </span>
          </Link>

          <form onSubmit={handleSearch} className="relative flex-1" role="search">
            <label htmlFor="busca-site" className="sr-only">
              Buscar produtos
            </label>
            <Input
              id="busca-site"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              maxLength={120}
              placeholder="Buscar ofertas, marcas e produtos"
              className="h-10 border-transparent bg-card pr-10 text-foreground shadow-sm"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute right-0 top-0 grid h-10 w-10 place-items-center text-muted-foreground hover:text-foreground"
            >
              <Search className="size-4" />
            </button>
          </form>

          {ehAdmin ? (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="hidden shrink-0 sm:flex"
            >
              <Link to="/admin">
                <ShieldCheck className="size-4" />
                Painel
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="hidden shrink-0 text-brand-foreground hover:bg-brand-foreground/10 sm:flex"
            >
              <Link to="/auth">{user ? "Minha conta" : "Entrar"}</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="border-b border-border bg-brand/85 text-brand-foreground">
        <nav
          aria-label="Categorias"
          className="mx-auto hidden max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1.5 text-sm md:flex"
        >
          <Link
            to="/produtos"
            className="whitespace-nowrap rounded px-2.5 py-1 font-semibold hover:bg-brand-foreground/10"
          >
            Todas as ofertas
          </Link>
          {categorias.map((c: any) => (
            <Link
              key={c.id}
              to={`/categoria/${c.slug}`}
              className={cn(
                "whitespace-nowrap rounded px-2.5 py-1 hover:bg-brand-foreground/10"
              )}
            >
              {c.nome}
            </Link>
          ))}
          <Link
            to="/blog"
            className="whitespace-nowrap rounded px-2.5 py-1 hover:bg-brand-foreground/10"
          >
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const { data: config } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: () => apiCall<any>("get_configuracoes"),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => apiCall<any[]>("list_categorias"),
  });

  const redes = [
    {
      url: config?.whatsapp
        ? config.whatsapp.startsWith("http")
          ? config.whatsapp
          : `https://wa.me/${config.whatsapp.replace(/\D/g, "")}`
        : null,
      Icon: MessageCircle,
      nome: "WhatsApp",
    },
    {
      url: config?.instagram
        ? config.instagram.startsWith("http")
          ? config.instagram
          : `https://instagram.com/${config.instagram.replace(/^@/, "")}`
        : null,
      Icon: Instagram,
      nome: "Instagram",
    },
    {
      url: config?.facebook
        ? config.facebook.startsWith("http")
          ? config.facebook
          : `https://facebook.com/${config.facebook}`
        : null,
      Icon: Facebook,
      nome: "Facebook",
    },
    {
      url: config?.tiktok
        ? config.tiktok.startsWith("http")
          ? config.tiktok
          : `https://tiktok.com/@${config.tiktok.replace(/^@/, "")}`
        : null,
      Icon: Music2,
      nome: "TikTok",
    },
  ].filter((r) => Boolean(r.url));

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img
              src={LOGO_URL}
              alt={`Logotipo ${config?.nome_site ?? "DNA Ofertas"}`}
              width={40}
              height={40}
              loading="lazy"
              className="size-10 rounded-full object-cover"
            />
            <p className="text-base font-extrabold">
              {config?.nome_site ?? "DNA Ofertas"}
            </p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {config?.descricao_site}
          </p>
          {redes.length > 0 && (
            <div className="mt-4 flex gap-2">
              {redes.map(({ url, Icon, nome }) => (
                <a
                  key={nome}
                  href={url!}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  aria-label={nome}
                  className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-bold">Categorias</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {categorias.slice(0, 6).map((c: any) => (
              <li key={c.id}>
                <Link to={`/categoria/${c.slug}`} className="hover:text-primary">
                  {c.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold">Navegar</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/produtos" className="hover:text-primary">
                Todas as ofertas
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-primary">
                Blog
              </Link>
            </li>
            <li>
              <Link to="/sobre" className="hover:text-primary">
                Sobre o site
              </Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-primary">
                Contato
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold">Divulgação de afiliados</p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {config?.aviso_afiliado}
          </p>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {config?.nome_site ?? "DNA Ofertas"}. Preços
        e disponibilidade podem mudar sem aviso.
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
