import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Menu,
  X,
  ExternalLink,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { apiCall, formatCurrency } from "@/lib/api";

export const LOGO_URL = "/dna-ofertas-logo.jpg";

export function ShareButtons({
  title,
  path,
  compact = false,
}: {
  title: string;
  path?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const getFullUrl = () => {
    if (typeof window === "undefined") return path || "";
    return path ? `${window.location.origin}${path}` : window.location.href;
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getFullUrl();
    const text = encodeURIComponent(`${title}\n\n${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleTelegram = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = encodeURIComponent(getFullUrl());
    const text = encodeURIComponent(title);
    window.open(
      `https://t.me/share/url?url=${url}&text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getFullUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getFullUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {}
    } else {
      handleCopy(e);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleWhatsApp}
          title="Compartilhar no WhatsApp"
          aria-label="Compartilhar no WhatsApp"
          className="w-8 h-8 rounded-lg bg-muted hover:bg-[#25D366] hover:text-white text-muted-foreground flex items-center justify-center transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleCopy}
          title="Copiar link"
          aria-label="Copiar link"
          className="w-8 h-8 rounded-lg bg-muted hover:bg-foreground hover:text-background text-muted-foreground flex items-center justify-center transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-accent" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mr-1">
        <Share2 className="w-3.5 h-3.5" /> Compartilhar:
      </span>
      <button
        type="button"
        onClick={handleWhatsApp}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
      </button>
      <button
        type="button"
        onClick={handleTelegram}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc] hover:text-white transition-colors"
      >
        <Send className="w-3.5 h-3.5" /> Telegram
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-foreground hover:bg-foreground hover:text-background transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-accent" /> Copiado!
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" /> Copiar link
          </>
        )}
      </button>
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-foreground hover:bg-foreground hover:text-background transition-colors md:hidden"
        >
          <Share2 className="w-3.5 h-3.5" /> Mais
        </button>
      )}
    </div>
  );
}

export function CardProduto({ produto }: { produto: any }) {
  const [copiedCupom, setCopiedCupom] = useState(false);

  const handleCopyCupom = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!produto.cupom) return;
    navigator.clipboard.writeText(produto.cupom);
    setCopiedCupom(true);
    toast.success(`Cupom "${produto.cupom}" copiado!`);
    setTimeout(() => setCopiedCupom(false), 2000);
  };

  return (
    <article className="group bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
      <Link
        to={`/produto/${produto.slug}`}
        className="relative aspect-square bg-white p-4 overflow-hidden flex items-center justify-center"
      >
        <img
          src={produto.imagem_principal}
          alt={produto.titulo}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        {produto.desconto_percentual && produto.desconto_percentual > 0 ? (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            -{produto.desconto_percentual}%
          </span>
        ) : null}
        {produto.destaque ? (
          <span className="absolute top-3 right-3 bg-foreground text-background text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Destaque
          </span>
        ) : null}
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1">
          {produto.categorias ? (
            <Link
              to={`/categoria/${produto.categorias.slug}`}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors truncate"
            >
              {produto.categorias.nome}
            </Link>
          ) : (
            <span />
          )}
          <ShareButtons
            title={`🔥 ${produto.titulo} por ${formatCurrency(produto.preco_atual)}`}
            path={`/produto/${produto.slug}`}
            compact
          />
        </div>

        <Link to={`/produto/${produto.slug}`} className="mb-2">
          <h3 className="font-display font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base leading-snug">
            {produto.titulo}
          </h3>
        </Link>

        {produto.descricao_curta ? (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {produto.descricao_curta}
          </p>
        ) : null}

        <div className="mt-auto pt-2 border-t border-border/60">
          {produto.preco_antigo && produto.preco_antigo > produto.preco_atual ? (
            <div className="text-xs text-muted-foreground line-through">
              De {formatCurrency(produto.preco_antigo)}
            </div>
          ) : null}
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-xs text-muted-foreground">Por</span>
            <span className="font-display font-extrabold text-xl sm:text-2xl text-accent">
              {formatCurrency(produto.preco_atual)}
            </span>
          </div>

          {produto.cupom ? (
            <button
              type="button"
              onClick={handleCopyCupom}
              className="w-full mb-2 px-3 py-1.5 rounded-lg border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 text-xs font-mono font-semibold text-primary flex items-center justify-between transition-colors"
            >
              <span>CUPOM: {produto.cupom}</span>
              {copiedCupom ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          ) : null}

          <Link
            to={`/produto/${produto.slug}`}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Ver Oferta <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function GradeProdutos({
  produtos,
  vazio = "Nenhuma oferta encontrada.",
}: {
  produtos: any[];
  vazio?: string;
}) {
  if (!produtos.length) {
    return (
      <div className="text-center py-16 bg-card rounded-2xl border border-border">
        <p className="text-muted-foreground">{vazio}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {produtos.map((p) => (
        <CardProduto key={p.id} produto={p} />
      ))}
    </div>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [searchInput, setSearchInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias-nav"],
    queryFn: () => apiCall<any[]>("list_categorias"),
  });

  const { data: config } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: () => apiCall<any>("get_configuracoes"),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchInput.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="bg-foreground text-background text-xs py-2 px-4 text-center font-medium">
        🔥 Ofertas verificadas diariamente • Descontos reais das melhores lojas
      </div>

      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src={LOGO_URL}
              alt={config?.nome_site || "DNA Ofertas"}
              className="h-11 w-auto object-contain rounded-lg"
            />
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar ofertas, produtos, marcas..."
                className="w-full pl-10 pr-24 py-2.5 rounded-full bg-muted/70 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-card transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
              >
                Buscar
              </button>
            </div>
          </form>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-primary transition-colors">
              Início
            </Link>
            <Link to="/produtos" className="hover:text-primary transition-colors">
              Ofertas
            </Link>
            <Link to="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
            <Link to="/sobre" className="hover:text-primary transition-colors">
              Sobre
            </Link>
            <Link to="/contato" className="hover:text-primary transition-colors">
              Contato
            </Link>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className="border-t border-border/60 bg-muted/30 overflow-x-auto">
          <div className="container mx-auto px-4 py-2 flex items-center gap-2 text-xs font-medium whitespace-nowrap">
            <span className="text-muted-foreground mr-1">Categorias:</span>
            {categorias.map((c: any) => (
              <Link
                key={c.id}
                to={`/categoria/${c.slug}`}
                className="px-3 py-1 rounded-full bg-card hover:bg-primary hover:text-primary-foreground border border-border transition-colors"
              >
                {c.nome}
              </Link>
            ))}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card px-4 py-4 space-y-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar ofertas..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-muted border border-border text-sm"
                />
              </div>
            </form>
            <div className="flex flex-col gap-2 text-sm font-medium pt-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-primary"
              >
                Início
              </Link>
              <Link
                to="/produtos"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-primary"
              >
                Ofertas
              </Link>
              <Link
                to="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-primary"
              >
                Blog
              </Link>
              <Link
                to="/sobre"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-primary"
              >
                Sobre
              </Link>
              <Link
                to="/contato"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-primary"
              >
                Contato
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-foreground text-background mt-20">
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src={LOGO_URL}
                alt={config?.nome_site || "DNA Ofertas"}
                className="h-12 w-auto object-contain rounded-lg"
              />
            </div>
            <p className="text-sm text-background/70 max-w-md mb-4">
              {config?.descricao_site}
            </p>
            <p className="text-xs text-background/50 max-w-lg leading-relaxed">
              {config?.aviso_afiliado}
            </p>
          </div>
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-3 text-background/90">
              Navegação
            </h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link
                  to="/produtos"
                  className="hover:text-primary transition-colors"
                >
                  Todas as Ofertas
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primary transition-colors">
                  Blog e Dicas
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-primary transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  to="/contato"
                  className="hover:text-primary transition-colors"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-3 text-background/90">
              Categorias
            </h4>
            <ul className="space-y-2 text-sm text-background/70">
              {categorias.slice(0, 5).map((c: any) => (
                <li key={c.id}>
                  <Link
                    to={`/categoria/${c.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {c.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-background/10 py-5 text-center text-xs text-background/50">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>{config?.texto_rodape}</span>
            <Link
              to="/admin"
              className="hover:text-background/80 transition-colors"
            >
              Área Administrativa
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
