import React, { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Flame,
  ArrowRight,
  Sparkles,
  Tag,
  ExternalLink,
  Store,
  Truck,
  ShieldCheck,
  MessageCircle,
  Instagram,
} from "lucide-react";
import {
  apiCall,
  formatMoeda,
  calcularDesconto,
  formatData,
  truncar,
} from "@/lib/api";
import { Button, Badge, Separator, cn } from "@/components/ui";
import { SiteLayout, GradeProdutos, ShareButtons } from "@/components/SiteLayout";

export function HomePage() {
  const { data: destaques = [] } = useQuery({
    queryKey: ["home-destaques"],
    queryFn: () =>
      apiCall<any[]>("list_produtos", {
        publicadoOnly: true,
        destaqueOnly: true,
        limit: 8,
      }),
  });

  const { data: recentes = [] } = useQuery({
    queryKey: ["home-recentes"],
    queryFn: () =>
      apiCall<any[]>("list_produtos", {
        publicadoOnly: true,
        limit: 12,
      }),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => apiCall<any[]>("list_categorias"),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["home-posts"],
    queryFn: () =>
      apiCall<any[]>("list_posts", {
        publicadoOnly: true,
      }),
  });

  useEffect(() => {
    document.title = "DNA Ofertas — as melhores promoções do dia";
  }, []);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-[1.2fr_1fr] md:items-center md:py-14">
          <div className="text-primary-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              <Flame className="size-3.5" /> Ofertas do dia
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Garimpamos as promoções. Você só aproveita.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed opacity-90 sm:text-base">
              Comparamos preços todos os dias e listamos apenas o que tem
              desconto de verdade. Clique, confira na loja e compre com
              segurança.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <Link to="/produtos">
                  Ver todas as ofertas
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {destaques.slice(0, 4).map((e: any) => (
              <Link
                key={e.id}
                to={`/produto/${e.slug}`}
                className="overflow-hidden rounded-md bg-card shadow-sm"
              >
                <div className="aspect-square bg-muted">
                  {e.imagem_url && (
                    <img
                      src={e.imagem_url}
                      alt={e.titulo}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
        <section aria-labelledby="titulo-categorias">
          <h2
            id="titulo-categorias"
            className="text-xl font-extrabold tracking-tight"
          >
            Navegue por categoria
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categorias.map((e: any) => (
              <Link
                key={e.id}
                to={`/categoria/${e.slug}`}
                className="flex items-center gap-2 rounded-md border border-border bg-card p-4 text-sm font-semibold shadow-sm transition-colors hover:border-primary hover:text-primary"
              >
                <Tag className="size-4 shrink-0 text-primary" />
                {e.nome}
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="titulo-destaques">
          <div className="flex items-end justify-between gap-4">
            <h2
              id="titulo-destaques"
              className="text-xl font-extrabold tracking-tight"
            >
              <Sparkles className="mr-1 inline size-5 text-primary" />
              Selecionados da semana
            </h2>
            <Link
              to="/produtos"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Ver tudo
            </Link>
          </div>
          <div className="mt-4">
            <GradeProdutos produtos={destaques} />
          </div>
        </section>

        <section aria-labelledby="titulo-recentes">
          <h2
            id="titulo-recentes"
            className="text-xl font-extrabold tracking-tight"
          >
            Adicionados recentemente
          </h2>
          <div className="mt-4">
            <GradeProdutos produtos={recentes} />
          </div>
        </section>

        {posts.length > 0 && (
          <section aria-labelledby="titulo-blog">
            <div className="flex items-end justify-between gap-4">
              <h2
                id="titulo-blog"
                className="text-xl font-extrabold tracking-tight"
              >
                Guias de compra
              </h2>
              <Link
                to="/blog"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Ver o blog
              </Link>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {posts.slice(0, 2).map((e: any) => (
                <Link
                  key={e.id}
                  to={`/blog/${e.slug}`}
                  className="group overflow-hidden rounded-md border border-border bg-card shadow-sm"
                >
                  {e.capa_url && (
                    <img
                      src={e.capa_url}
                      alt={e.titulo}
                      loading="lazy"
                      className="h-44 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground">
                      {formatData(e.publicado_em)}
                    </p>
                    <h3 className="mt-1 font-bold leading-snug group-hover:text-primary">
                      {e.titulo}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {truncar(e.resumo ?? e.conteudo, 140)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}

const opcoesOrdenacao = [
  { valor: "recentes", rotulo: "Mais recentes" },
  { valor: "desconto", rotulo: "Maior desconto" },
  { valor: "menor-preco", rotulo: "Menor preço" },
  { valor: "maior-preco", rotulo: "Maior preço" },
];

export function ProdutosPage() {
  const [searchParams] = useSearchParams();
  const ordem = searchParams.get("ordem") || "recentes";

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos-lista", ordem],
    queryFn: () =>
      apiCall<any[]>("list_produtos", {
        publicadoOnly: true,
        ordenar: ordem,
        limit: 48,
      }),
  });

  useEffect(() => {
    document.title = "Todas as ofertas — DNA Ofertas";
  }, []);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Todas as ofertas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {produtos.length}{" "}
          {produtos.length === 1
            ? "produto disponível"
            : "produtos disponíveis"}
        </p>

        <nav aria-label="Ordenação" className="mt-5 flex flex-wrap gap-2">
          {opcoesOrdenacao.map((n) => (
            <Link
              key={n.valor}
              to={`/produtos?ordem=${n.valor}`}
              className={
                n.valor === ordem
                  ? "rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground"
                  : "rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary"
              }
            >
              {n.rotulo}
            </Link>
          ))}
        </nav>

        <div className="mt-6">
          <GradeProdutos produtos={produtos} />
        </div>
      </div>
    </SiteLayout>
  );
}

export function ProdutoDetalhePage() {
  const { slug } = useParams();

  const { data: t, isLoading } = useQuery({
    queryKey: ["produto-slug", slug],
    queryFn: () => apiCall<any>("produto_by_slug", { slug }),
  });

  const { data: destaques = [] } = useQuery({
    queryKey: ["produto-destaques-rel"],
    queryFn: () =>
      apiCall<any[]>("list_produtos", {
        publicadoOnly: true,
        destaqueOnly: true,
        limit: 4,
      }),
  });

  useEffect(() => {
    if (t) {
      document.title = `${truncar(t.titulo, 55)} — DNA Ofertas`;
    }
  }, [t]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-4 py-12 text-center text-sm text-muted-foreground">
          Carregando oferta…
        </div>
      </SiteLayout>
    );
  }

  if (!t) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h1 className="text-2xl font-extrabold">Produto não encontrado</h1>
          <Link
            to="/produtos"
            className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Ver todas as ofertas
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const d = calcularDesconto(t.preco, t.preco_original);
  const f =
    typeof window !== "undefined"
      ? window.location.href
      : `/produto/${t.slug}`;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <nav aria-label="Trilha" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Início
          </Link>
          <span className="mx-1.5">/</span>
          {t.categorias ? (
            <>
              <Link
                to={`/categoria/${t.categorias.slug}`}
                className="hover:text-primary"
              >
                {t.categorias.nome}
              </Link>
              <span className="mx-1.5">/</span>
            </>
          ) : null}
          <span className="text-foreground">{truncar(t.titulo, 50)}</span>
        </nav>

        <div className="mt-4 grid gap-6 rounded-md border border-border bg-card p-4 shadow-sm md:grid-cols-2 md:p-6">
          <div className="overflow-hidden rounded-md bg-muted">
            {t.imagem_url ? (
              <img
                src={t.imagem_url}
                alt={t.titulo}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="grid aspect-square place-items-center text-sm text-muted-foreground">
                Sem imagem
              </div>
            )}
          </div>

          <div className="flex flex-col">
            {t.categorias && (
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {t.categorias.nome}
              </span>
            )}
            <h1 className="mt-1 text-2xl font-bold leading-snug tracking-tight">
              {t.titulo}
            </h1>

            <div className="mt-5 flex flex-wrap items-end gap-3">
              {t.preco_original && d !== null && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatMoeda(t.preco_original)}
                </span>
              )}
              <span className="text-4xl font-semibold leading-none text-price">
                {formatMoeda(t.preco)}
              </span>
              {d !== null && (
                <Badge className="bg-success text-success-foreground">
                  {d}% OFF
                </Badge>
              )}
            </div>

            <Button asChild size="lg" className="mt-6 h-12 text-base">
              <a
                href={`/ir/${t.id}`}
                rel="nofollow sponsored noopener"
                target="_blank"
              >
                Ver oferta na loja
                <ExternalLink className="size-4" />
              </a>
            </Button>

            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              {t.loja && (
                <li className="flex items-center gap-2">
                  <Store className="size-4 text-primary" />
                  Vendido e entregue por {t.loja}
                </li>
              )}
              <li className="flex items-center gap-2">
                <Truck className="size-4 text-primary" />
                Prazo e frete conforme a loja parceira
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Compra feita direto no site oficial da loja
              </li>
            </ul>

            <Separator className="my-5" />
            <ShareButtons titulo={t.titulo} url={f} preco={t.preco} />
          </div>
        </div>

        {t.descricao && (
          <section className="mt-6 rounded-md border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-bold">Sobre este produto</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {t.descricao}
            </p>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-xl font-extrabold tracking-tight">
            Você também pode gostar
          </h2>
          <div className="mt-4">
            <GradeProdutos
              produtos={destaques.filter((e: any) => e.id !== t.id)}
            />
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

export function CategoriaDetalhePage() {
  const { slug } = useParams();

  const { data: c, isLoading } = useQuery({
    queryKey: ["categoria-detalhe", slug],
    queryFn: () => apiCall<any>("categoria_by_slug", { slug }),
  });

  useEffect(() => {
    if (c?.categoria) {
      document.title = `${c.categoria.nome} — DNA Ofertas`;
    }
  }, [c]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-4 py-12 text-center text-sm text-muted-foreground">
          Carregando…
        </div>
      </SiteLayout>
    );
  }

  if (!c?.categoria) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h1 className="text-2xl font-extrabold">Categoria não encontrada</h1>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {c.categoria.nome}
        </h1>
        {c.categoria.descricao && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {c.categoria.descricao}
          </p>
        )}
        <div className="mt-6">
          <GradeProdutos
            produtos={c.produtos}
            mensagemVazia="Ainda não há ofertas nesta categoria. Volte em breve!"
          />
        </div>
      </div>
    </SiteLayout>
  );
}

export function BuscaPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const { data: s = [] } = useQuery({
    queryKey: ["busca", q],
    queryFn: () =>
      q.trim()
        ? apiCall<any[]>("list_produtos", {
            publicadoOnly: true,
            busca: q.trim(),
            limit: 48,
          })
        : Promise.resolve([]),
  });

  useEffect(() => {
    document.title = q ? `Resultados para “${q}” — DNA Ofertas` : "Busca — DNA Ofertas";
  }, [q]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Resultados para “{q}”
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {s.length}{" "}
          {s.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
        <div className="mt-6">
          <GradeProdutos
            produtos={s}
            mensagemVazia="Nada encontrado com esse termo. Tente uma palavra mais curta ou navegue pelas categorias."
          />
        </div>
      </div>
    </SiteLayout>
  );
}

export function BlogIndexPage() {
  const { data: e = [] } = useQuery({
    queryKey: ["blog-lista"],
    queryFn: () => apiCall<any[]>("list_posts", { publicadoOnly: true }),
  });

  useEffect(() => {
    document.title = "Guias de compra — DNA Ofertas";
  }, []);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Guias de compra
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Comparativos, análises e dicas para gastar melhor.
        </p>

        {e.length === 0 ? (
          <p className="mt-8 rounded-md border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Nenhum post publicado ainda.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {e.map((post: any) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group flex flex-col gap-4 overflow-hidden rounded-md border border-border bg-card shadow-sm sm:flex-row"
              >
                {post.capa_url && (
                  <img
                    src={post.capa_url}
                    alt={post.titulo}
                    loading="lazy"
                    className="h-44 w-full object-cover sm:h-auto sm:w-56"
                  />
                )}
                <div className="p-4">
                  <p className="text-xs text-muted-foreground">
                    {formatData(post.publicado_em)}
                  </p>
                  <h2 className="mt-1 text-lg font-bold leading-snug group-hover:text-primary">
                    {post.titulo}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {truncar(post.resumo ?? post.conteudo, 180)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function renderBoldInline(str: string) {
  return str.split(/(\*\*[^*]+\*\*)/g).map((part, idx) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={idx} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

function MarkdownContent({
  texto,
  className,
}: {
  texto: string;
  className?: string;
}) {
  const blocos = (texto || "")
    .split(/\n{2,}/)
    .filter((b) => b.trim().length > 0);
  return (
    <div
      className={cn(
        "space-y-4 text-[15px] leading-relaxed text-foreground",
        className
      )}
    >
      {blocos.map((e, t) => {
        const n = e.split("\n");
        const r = `${t}-${e.slice(0, 12)}`;
        if (e.startsWith("## ")) {
          return (
            <h2 key={r} className="pt-2 text-xl font-bold tracking-tight">
              {e.replace(/^##\s+/, "")}
            </h2>
          );
        }
        if (e.startsWith("### ")) {
          return (
            <h3 key={r} className="pt-1 text-lg font-bold tracking-tight">
              {e.replace(/^###\s+/, "")}
            </h3>
          );
        }
        if (n.every((l) => /^[-*]\s+/.test(l.trim()))) {
          return (
            <ul
              key={r}
              className="list-disc space-y-1.5 pl-5 text-muted-foreground"
            >
              {n.map((l, idx) => (
                <li key={`${r}-${idx}`}>
                  {renderBoldInline(l.replace(/^[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={r} className="text-muted-foreground">
            {renderBoldInline(e)}
          </p>
        );
      })}
    </div>
  );
}

export function BlogPostPage() {
  const { slug } = useParams();

  const { data: a, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => apiCall<any>("post_by_slug", { slug }),
  });

  useEffect(() => {
    if (a?.post) {
      document.title = `${a.post.titulo} — DNA Ofertas`;
    }
  }, [a]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-12 text-center text-sm text-muted-foreground">
          Carregando artigo…
        </div>
      </SiteLayout>
    );
  }

  if (!a?.post) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-2xl font-extrabold">Post não encontrado</h1>
        </div>
      </SiteLayout>
    );
  }

  const { post: f, relacionados: p = [] } = a;
  const m =
    typeof window !== "undefined"
      ? window.location.href
      : `/blog/${f.slug}`;

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-xs text-muted-foreground">
          {formatData(f.publicado_em)}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight">
          {f.titulo}
        </h1>
        {f.resumo && (
          <p className="mt-3 text-base text-muted-foreground">{f.resumo}</p>
        )}
        {f.capa_url && (
          <img
            src={f.capa_url}
            alt={f.titulo}
            className="mt-6 aspect-video w-full rounded-md object-cover"
          />
        )}
        <MarkdownContent texto={f.conteudo} className="mt-6" />
        <div className="mt-8 border-t border-border pt-6">
          <ShareButtons titulo={f.titulo} url={m} />
        </div>
      </article>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <h2 className="text-xl font-extrabold tracking-tight">
          Ofertas citadas na vitrine
        </h2>
        <div className="mt-4">
          <GradeProdutos produtos={p} />
        </div>
      </section>
    </SiteLayout>
  );
}

export function SobrePage() {
  useEffect(() => {
    document.title = "Sobre o DNA Ofertas";
  }, []);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Sobre o DNA Ofertas
        </h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Somos uma vitrine independente de promoções. Todos os dias
            acompanhamos os preços das principais lojas do Brasil e publicamos
            apenas o que realmente tem desconto — sem "promoção" inflada nem
            preço de referência inventado.
          </p>
          <h2 className="pt-4 text-xl font-bold text-foreground">
            Como escolhemos as ofertas
          </h2>
          <p>
            Comparamos o preço atual com o histórico recente do produto,
            verificamos a reputação da loja e confirmamos se o produto está
            disponível antes de publicar. Ofertas que expiram saem da vitrine.
          </p>
          <h2 className="pt-4 text-xl font-bold text-foreground">
            Como ganhamos dinheiro
          </h2>
          <p>
            Participamos de programas de afiliados. Quando você clica em um link
            e compra, podemos receber uma comissão da loja — sem nenhum custo
            extra para você. Isso nunca influencia a avaliação de um produto: a
            comissão não muda o preço que você paga.
          </p>
          <h2 className="pt-4 text-xl font-bold text-foreground">
            Preços e disponibilidade
          </h2>
          <p>
            Preços e estoque são de responsabilidade das lojas parceiras e podem
            mudar a qualquer momento. Sempre confirme o valor final na página da
            loja antes de finalizar a compra.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}

export function ContatoPage() {
  const { data: e } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: () => apiCall<any>("get_configuracoes"),
  });

  useEffect(() => {
    document.title = "Fale com a gente — DNA Ofertas";
  }, []);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Fale com a gente
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          É uma loja e quer divulgar seus produtos? Encontrou um preço errado?
          Quer sugerir um produto para a vitrine? Use um dos canais abaixo.
        </p>

        <div className="mt-8 space-y-3">
          {e?.whatsapp && (
            <Button asChild size="lg" className="w-full justify-start">
              <a
                href={`https://wa.me/${e.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" />
                Conversar no WhatsApp
              </a>
            </Button>
          )}
          {e?.instagram && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full justify-start"
            >
              <a
                href={`https://instagram.com/${e.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="size-4" />
                Mandar DM no Instagram
              </a>
            </Button>
          )}
        </div>

        <p className="mt-8 rounded-md border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
          Respondemos em até 2 dias úteis. Não conseguimos alterar pedidos,
          prazos de entrega ou trocas — essas solicitações precisam ser feitas
          diretamente com a loja onde a compra foi concluída.
        </p>
      </div>
    </SiteLayout>
  );
}
