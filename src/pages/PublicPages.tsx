import React, { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Flame,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Zap,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  Star,
  Calendar,
  Award,
  Heart,
  Mail,
  MessageCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { apiCall, formatCurrency, formatDate } from "@/lib/api";
import { SiteLayout, GradeProdutos, ShareButtons } from "@/components/SiteLayout";

export function HomePage() {
  const { data: destaques = [] } = useQuery({
    queryKey: ["home-destaques"],
    queryFn: () =>
      apiCall<any[]>("list_produtos", {
        publicadoOnly: true,
        destaqueOnly: true,
        limit: 4,
      }),
  });

  const { data: recentes = [] } = useQuery({
    queryKey: ["home-recentes"],
    queryFn: () =>
      apiCall<any[]>("list_produtos", {
        publicadoOnly: true,
        limit: 8,
      }),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["home-categorias"],
    queryFn: () => apiCall<any[]>("list_categorias"),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["home-posts"],
    queryFn: () =>
      apiCall<any[]>("list_posts", {
        publicadoOnly: true,
        limit: 2,
      }),
  });

  useEffect(() => {
    document.title = "DNA Ofertas — As Melhores Ofertas Selecionadas Para Você";
  }, []);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-gradient-to-br from-foreground via-foreground to-foreground/95 text-background">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, hsl(16 95% 52%) 0%, transparent 50%), radial-gradient(circle at 80% 80%, hsl(152 69% 38%) 0%, transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/40 text-primary px-3.5 py-1 rounded-full text-xs font-semibold mb-5">
              <Flame className="w-3.5 h-3.5" /> OFERTAS VERIFICADAS HOJE
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl leading-[1.08] tracking-tight mb-5">
              Economize de verdade nas <span className="text-primary">melhores ofertas</span> da internet.
            </h1>
            <p className="text-base sm:text-lg text-background/75 mb-8 max-w-2xl">
              Curadoria diária de promoções das principais lojas do Brasil com descontos reais verificados pela nossa equipe.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/produtos"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/30"
              >
                Ver Ofertas de Hoje <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 bg-background/10 hover:bg-background/20 text-background font-semibold px-6 py-3.5 rounded-xl border border-background/20 transition-all"
              >
                Guias de Compra
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-background/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm">Lojas Confiáveis</div>
                <div className="text-xs text-background/60">Apenas varejistas oficiais</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm">Descontos Reais</div>
                <div className="text-xs text-background/60">Histórico de preço conferido</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm">Atualização Diária</div>
                <div className="text-xs text-background/60">Novas ofertas toda hora</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Em Alta
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl mt-1">
              Ofertas em Destaque
            </h2>
          </div>
          <Link
            to="/produtos"
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <GradeProdutos produtos={destaques} />
      </section>

      <section className="container mx-auto px-4 py-8">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl mb-6">
          Explorar por Categoria
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categorias.map((c: any) => (
            <Link
              key={c.id}
              to={`/categoria/${c.slug}`}
              className="group bg-card hover:bg-primary hover:text-primary-foreground border border-border rounded-2xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="font-display font-bold text-base mb-1">{c.nome}</div>
              <div className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 line-clamp-2">
                {c.descricao}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Acabaram de chegar
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl mt-1">
              Últimas Ofertas Publicadas
            </h2>
          </div>
          <Link
            to="/produtos"
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <GradeProdutos produtos={recentes} />
      </section>

      {posts.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Conteúdo
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl mt-1">
                Guias &amp; Dicas de Compra
              </h2>
            </div>
            <Link
              to="/blog"
              className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Ver blog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((p: any) => (
              <Link
                key={p.id}
                to={`/blog/${p.slug}`}
                className="group bg-card rounded-2xl border border-border overflow-hidden flex flex-col sm:flex-row hover:shadow-xl transition-all"
              >
                {p.imagem_capa && (
                  <img
                    src={p.imagem_capa}
                    alt={p.titulo}
                    className="sm:w-48 h-48 sm:h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {p.titulo}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {p.resumo}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary mt-4 inline-flex items-center gap-1">
                    Ler artigo <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

export function ProdutosPage() {
  const [categoriaId, setCategoriaId] = useState<string>("todas");
  const [ordenar, setOrdenar] = useState<string>("recentes");

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias-filtro"],
    queryFn: () => apiCall<any[]>("list_categorias"),
  });

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["produtos-lista", categoriaId, ordenar],
    queryFn: () =>
      apiCall<any[]>("list_produtos", {
        publicadoOnly: true,
        categoriaId: categoriaId !== "todas" ? categoriaId : null,
        ordenar,
      }),
  });

  useEffect(() => {
    document.title = "Todas as Ofertas — DNA Ofertas";
  }, []);

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl mb-2">
            Todas as Ofertas
          </h1>
          <p className="text-muted-foreground">
            Explore nossa seleção completa de promoções verificadas.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoriaId("todas")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                categoriaId === "todas"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              Todas
            </button>
            {categorias.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setCategoriaId(c.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  categoriaId === c.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                {c.nome}
              </button>
            ))}
          </div>

          <select
            value={ordenar}
            onChange={(e) => setOrdenar(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-muted border border-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="recentes">Mais recentes</option>
            <option value="desconto">Maior desconto</option>
            <option value="menor-preco">Menor preço</option>
            <option value="maior-preco">Maior preço</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            Carregando ofertas...
          </div>
        ) : (
          <GradeProdutos produtos={produtos} />
        )}
      </div>
    </SiteLayout>
  );
}

export function ProdutoDetalhePage() {
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["produto-slug", slug],
    queryFn: () => apiCall<any>("produto_by_slug", { slug }),
  });

  const produto = data?.produto;
  const relacionados = data?.relacionados || [];

  useEffect(() => {
    if (produto) {
      document.title = `${produto.titulo} — DNA Ofertas`;
    }
  }, [produto]);

  const handleCopyCupom = () => {
    if (!produto?.cupom) return;
    navigator.clipboard.writeText(produto.cupom);
    setCopied(true);
    toast.success("Cupom copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Carregando oferta...
        </div>
      </SiteLayout>
    );
  }

  if (!produto) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-display font-bold text-2xl mb-4">
            Oferta não encontrada
          </h1>
          <Link to="/produtos" className="text-primary font-semibold hover:underline">
            Voltar para ofertas
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/produtos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para ofertas
        </Link>

        <div className="bg-card rounded-3xl border border-border p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl p-8 flex items-center justify-center relative border border-border/60 aspect-square max-h-[480px]">
            <img
              src={produto.imagem_principal}
              alt={produto.titulo}
              className="max-h-full max-w-full object-contain"
            />
            {produto.desconto_percentual && produto.desconto_percentual > 0 ? (
              <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-bold px-3.5 py-1.5 rounded-full shadow-lg">
                -{produto.desconto_percentual}% OFF
              </span>
            ) : null}
          </div>

          <div className="flex flex-col">
            {produto.categorias ? (
              <Link
                to={`/categoria/${produto.categorias.slug}`}
                className="text-xs font-bold uppercase tracking-wider text-primary mb-2 w-fit hover:underline"
              >
                {produto.categorias.nome}
              </Link>
            ) : null}

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl leading-tight mb-3">
              {produto.titulo}
            </h1>

            {produto.avaliacao ? (
              <div className="flex items-center gap-1.5 mb-4">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${
                        idx < Math.round(Number(produto.avaliacao))
                          ? "fill-current"
                          : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {produto.avaliacao} / 5.0
                </span>
              </div>
            ) : null}

            {produto.descricao_curta ? (
              <p className="text-muted-foreground mb-6">{produto.descricao_curta}</p>
            ) : null}

            <div className="bg-muted/60 rounded-2xl p-5 mb-6 border border-border">
              {produto.preco_antigo && produto.preco_antigo > produto.preco_atual ? (
                <div className="text-sm text-muted-foreground line-through">
                  De {formatCurrency(produto.preco_antigo)}
                </div>
              ) : null}
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-sm text-muted-foreground">Por apenas</span>
                <span className="font-display font-extrabold text-3xl sm:text-4xl text-accent">
                  {formatCurrency(produto.preco_atual)}
                </span>
              </div>
              {produto.preco_antigo && produto.preco_antigo > produto.preco_atual ? (
                <div className="text-xs font-semibold text-accent">
                  Economia de{" "}
                  {formatCurrency(
                    Number(produto.preco_antigo) - Number(produto.preco_atual)
                  )}
                </div>
              ) : null}
            </div>

            {produto.cupom ? (
              <div className="mb-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Cupom de desconto disponível:
                </div>
                <button
                  onClick={handleCopyCupom}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border-2 border-dashed border-primary bg-primary/5 hover:bg-primary/10 font-mono font-bold text-primary flex items-center justify-between gap-4 transition-colors"
                >
                  <span>{produto.cupom}</span>
                  <span className="text-xs font-sans font-semibold flex items-center gap-1 bg-primary text-primary-foreground px-2.5 py-1 rounded-md">
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar
                      </>
                    )}
                  </span>
                </button>
              </div>
            ) : null}

            <a
              href={`/ir/${produto.id}`}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-lg py-4 px-8 rounded-2xl transition-all shadow-lg shadow-primary/25 hover:shadow-xl"
            >
              Ir para a Loja e Aproveitar <ExternalLink className="w-5 h-5" />
            </a>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-accent" /> Redirecionamento seguro para a loja oficial
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Publicado em{" "}
                {formatDate(produto.data_publicacao)}
              </span>
            </div>

            <div className="mt-5 pt-5 border-t border-border">
              <ShareButtons
                title={`🔥 ${produto.titulo} por ${formatCurrency(produto.preco_atual)}`}
                path={`/produto/${produto.slug}`}
              />
            </div>

            {produto.descricao_completa ? (
              <div className="mt-8 pt-6 border-t border-border">
                <h2 className="font-display font-bold text-lg mb-3">
                  Sobre o produto
                </h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {produto.descricao_completa}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {relacionados.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display font-extrabold text-2xl mb-6">
              Ofertas Relacionadas
            </h2>
            <GradeProdutos produtos={relacionados} />
          </section>
        )}
      </div>
    </SiteLayout>
  );
}

export function CategoriaDetalhePage() {
  const { slug } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["categoria-detalhe", slug],
    queryFn: () => apiCall<any>("categoria_by_slug", { slug }),
  });

  useEffect(() => {
    if (data?.categoria) {
      document.title = `${data.categoria.nome} — Ofertas | DNA Ofertas`;
    }
  }, [data]);

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            Carregando...
          </div>
        ) : !data?.categoria ? (
          <div className="text-center py-16">Categoria não encontrada.</div>
        ) : (
          <>
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Categoria
              </span>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl mt-1 mb-2">
                {data.categoria.nome}
              </h1>
              {data.categoria.descricao ? (
                <p className="text-muted-foreground">
                  {data.categoria.descricao}
                </p>
              ) : null}
            </div>
            <GradeProdutos
              produtos={data.produtos}
              vazio="Nenhuma oferta publicada nesta categoria ainda."
            />
          </>
        )}
      </div>
    </SiteLayout>
  );
}

export function BuscaPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["busca", q],
    queryFn: () =>
      q.trim()
        ? apiCall<any[]>("list_produtos", {
            publicadoOnly: true,
            busca: q.trim(),
          })
        : Promise.resolve([]),
  });

  useEffect(() => {
    document.title = q ? `Busca por "${q}" — DNA Ofertas` : "Busca — DNA Ofertas";
  }, [q]);

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl mb-2">
          Resultados para: <span className="text-primary">"{q}"</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {produtos.length} oferta(s) encontrada(s)
        </p>
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            Buscando...
          </div>
        ) : (
          <GradeProdutos
            produtos={produtos}
            vazio={`Nenhuma oferta encontrada para "${q}".`}
          />
        )}
      </div>
    </SiteLayout>
  );
}

export function BlogIndexPage() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-lista"],
    queryFn: () => apiCall<any[]>("list_posts", { publicadoOnly: true }),
  });

  useEffect(() => {
    document.title = "Blog & Guias de Compra — DNA Ofertas";
  }, []);

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Blog DNA Ofertas
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl mt-1 mb-2">
            Guias de Compra, Reviews e Dicas para Economizar
          </h1>
          <p className="text-muted-foreground">
            Análises imparciais e comparativos para você escolher sempre o melhor custo-benefício.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            Carregando artigos...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border text-muted-foreground">
            Nenhum artigo publicado ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p: any) => (
              <Link
                key={p.id}
                to={`/blog/${p.slug}`}
                className="group bg-card rounded-2xl border border-border overflow-hidden flex flex-col hover:shadow-xl transition-all"
              >
                {p.imagem_capa && (
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={p.imagem_capa}
                      alt={p.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-xs text-muted-foreground mb-2">
                    {formatDate(p.data_publicacao)}
                  </span>
                  <h2 className="font-display font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                    {p.titulo}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {p.resumo}
                  </p>
                  <span className="mt-auto text-xs font-semibold text-primary inline-flex items-center gap-1">
                    Ler artigo completo <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

export function BlogPostPage() {
  const { slug } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => apiCall<any>("post_by_slug", { slug }),
  });

  useEffect(() => {
    if (data?.post) {
      document.title = `${data.post.titulo} — DNA Ofertas`;
    }
  }, [data]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Carregando artigo...
        </div>
      </SiteLayout>
    );
  }

  if (!data?.post) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-display font-bold text-2xl mb-3">
            Artigo não encontrado
          </h1>
          <Link to="/blog" className="text-primary font-semibold hover:underline">
            Voltar ao blog
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const { post, produtos } = data;

  return (
    <SiteLayout>
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o blog
        </Link>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Calendar className="w-3.5 h-3.5" /> Publicado em{" "}
          {formatDate(post.data_publicacao)}
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl leading-tight mb-4">
          {post.titulo}
        </h1>

        {post.resumo ? (
          <p className="text-lg text-muted-foreground mb-6">{post.resumo}</p>
        ) : null}

        <div className="mb-8">
          <ShareButtons title={post.titulo} path={`/blog/${post.slug}`} />
        </div>

        {post.imagem_capa ? (
          <img
            src={post.imagem_capa}
            alt={post.titulo}
            className="w-full rounded-2xl mb-8 max-h-[420px] object-cover border border-border"
          />
        ) : null}

        <div className="bg-card rounded-2xl border border-border p-6 sm:p-10 text-base leading-relaxed whitespace-pre-line text-foreground/90">
          {post.conteudo}
        </div>
      </article>

      {produtos.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <h2 className="font-display font-extrabold text-2xl mb-6">
            Ofertas Recomendadas
          </h2>
          <GradeProdutos produtos={produtos} />
        </section>
      )}
    </SiteLayout>
  );
}

export function SobrePage() {
  useEffect(() => {
    document.title = "Sobre Nós — DNA Ofertas";
  }, []);

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Quem Somos
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl mt-1 mb-6">
          Nosso DNA é encontrar economia real para você.
        </h1>
        <div className="bg-card border border-border rounded-3xl p-8 space-y-5 text-muted-foreground leading-relaxed">
          <p>
            O <strong className="text-foreground">DNA Ofertas</strong> nasceu com uma missão simples: separar promoções reais de falsos descontos. Todos os dias, nossa equipe monitora preços nas maiores e mais confiáveis lojas do Brasil para destacar apenas oportunidades que realmente valem o seu clique.
          </p>
          <p>
            Trabalhamos com programas de afiliados oficiais (como Amazon, Mercado Livre, Magazine Luiza e Shopee). Isso significa que quando você compra através de um link nosso, podemos receber uma pequena comissão —{" "}
            <strong className="text-foreground">
              sem nenhum custo adicional para você
            </strong>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-card border border-border rounded-2xl p-6">
            <ShieldCheck className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display font-bold text-lg mb-2">
              100% Transparente
            </h3>
            <p className="text-sm text-muted-foreground">
              Nunca alteramos preços. Você compra diretamente no site oficial da loja.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <Award className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-display font-bold text-lg mb-2">
              Curadoria Manual
            </h3>
            <p className="text-sm text-muted-foreground">
              Analisamos avaliações, reputação do vendedor e histórico de preço.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <Heart className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display font-bold text-lg mb-2">
              Foco no Consumidor
            </h3>
            <p className="text-sm text-muted-foreground">
              Só recomendamos o que nós mesmos compraríamos.
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

export function ContatoPage() {
  const { data: config } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: () => apiCall<any>("get_configuracoes"),
  });

  useEffect(() => {
    document.title = "Contato — DNA Ofertas";
  }, []);

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Fale Conosco
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl mt-1 mb-4">
          Entre em Contato
        </h1>
        <p className="text-muted-foreground mb-8">
          Tem alguma dúvida, sugestão de oferta ou proposta de parceria? Fale com a nossa equipe pelos canais abaixo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-2xl p-6">
            <Mail className="w-7 h-7 text-primary mb-3" />
            <h3 className="font-display font-bold text-lg mb-1">E-mail</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Respondemos em até 24h úteis
            </p>
            <a
              href={`mailto:${config?.email_contato || "contato@dnaofertas.com.br"}`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {config?.email_contato || "contato@dnaofertas.com.br"}
            </a>
          </div>

          {config?.link_whatsapp ? (
            <a
              href={config.link_whatsapp}
              target="_blank"
              rel="noreferrer"
              className="bg-card border border-border rounded-2xl p-6 hover:border-accent transition-colors"
            >
              <MessageCircle className="w-7 h-7 text-accent mb-3" />
              <h3 className="font-display font-bold text-lg mb-1">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                Entre no nosso grupo VIP de ofertas
              </p>
            </a>
          ) : null}

          {config?.link_telegram ? (
            <a
              href={config.link_telegram}
              target="_blank"
              rel="noreferrer"
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary transition-colors"
            >
              <Send className="w-7 h-7 text-primary mb-3" />
              <h3 className="font-display font-bold text-lg mb-1">Telegram</h3>
              <p className="text-sm text-muted-foreground">
                Receba alertas instantâneos
              </p>
            </a>
          ) : null}
        </div>
      </div>
    </SiteLayout>
  );
}
