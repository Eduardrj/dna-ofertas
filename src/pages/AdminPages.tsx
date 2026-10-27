import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Package,
  LayoutGrid,
  FileText,
  Settings,
  LogOut,
  Eye,
  MousePointerClick,
  Plus,
  X,
  Link2,
  LoaderCircle,
  Pencil,
  Trash2,
  Download,
  Share2,
  WandSparkles,
  MessageCircle,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import {
  apiCall,
  formatMoeda,
  normalizarImagemOg,
  gerarMensagemWhatsapp,
  gerarLegendaRedes,
  getStoredUser,
  setStoredUser,
} from "@/lib/api";
import { Button, Input, Label, Textarea, Switch } from "@/components/ui";

export function AuthPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Painel administrativo — DNA Ofertas";
    const u = getStoredUser();
    if (u) navigate("/admin", { replace: true });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) {
      toast.error("A senha precisa ter ao menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const res = await apiCall<{ user: any }>("auth_signin", {
        email: email.trim(),
        password: senha,
      });
      setStoredUser(res.user);
      navigate("/admin", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
        <Link
          to="/"
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Voltar para a vitrine
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
          Painel administrativo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Entre para gerenciar produtos, categorias e posts.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              maxLength={255}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              autoComplete="current-password"
              minLength={6}
              maxLength={72}
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <LoaderCircle className="size-4 animate-spin" />}
            Entrar
          </Button>
        </form>
      </div>
    </main>
  );
}

const navLinks = [
  { to: "/admin", rotulo: "Visão geral", Icon: BarChart3, exact: true },
  { to: "/admin/produtos", rotulo: "Produtos", Icon: Package, exact: false },
  {
    to: "/admin/categorias",
    rotulo: "Categorias",
    Icon: LayoutGrid,
    exact: false,
  },
  { to: "/admin/posts", rotulo: "Blog", Icon: FileText, exact: false },
  {
    to: "/admin/configuracoes",
    rotulo: "Configurações",
    Icon: Settings,
    exact: false,
  },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      navigate("/auth", { replace: true });
    } else {
      setUser(u);
    }
  }, [navigate]);

  async function handleLogout() {
    await queryClient.cancelQueries();
    queryClient.clear();
    setStoredUser(null);
    navigate("/auth", { replace: true });
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b border-border bg-brand">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="font-extrabold tracking-tight text-brand-foreground"
          >
            DNA Ofertas
          </Link>
          <span className="rounded-full bg-brand-foreground/10 px-2 py-0.5 text-xs font-semibold text-brand-foreground">
            Painel
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="ml-auto text-brand-foreground hover:bg-brand-foreground/10"
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl gap-6 px-4 py-6 md:flex">
        <nav className="mb-4 flex gap-2 overflow-x-auto md:mb-0 md:w-56 md:shrink-0 md:flex-col">
          {navLinks.map(({ to, rotulo, Icon, exact }) => {
            const active = exact
              ? location.pathname === to
              : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={
                  active
                    ? "flex items-center gap-2 whitespace-nowrap rounded-md border border-primary bg-card px-3 py-2 text-sm font-semibold text-primary"
                    : "flex items-center gap-2 whitespace-nowrap rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                }
              >
                <Icon className="size-4" />
                {rotulo}
              </Link>
            );
          })}
        </nav>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data: a, isLoading: f } = useQuery({
    queryKey: ["admin", "resumo"],
    queryFn: () => apiCall<any>("admin_summary"),
  });

  const cards = [
    { rotulo: "Produtos cadastrados", valor: a?.produtos, Icon: Package },
    { rotulo: "Publicados na vitrine", valor: a?.publicados, Icon: Eye },
    {
      rotulo: "Cliques em ofertas",
      valor: a?.cliques,
      Icon: MousePointerClick,
    },
    { rotulo: "Posts no blog", valor: a?.posts, Icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Visão geral</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumo da vitrine e atalhos para as tarefas do dia a dia.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ rotulo, valor, Icon }) => (
          <div
            key={rotulo}
            className="rounded-md border border-border bg-card p-4 shadow-sm"
          >
            <Icon className="size-4 text-primary" />
            <p className="mt-3 text-2xl font-bold">{f ? "—" : valor ?? 0}</p>
            <p className="text-xs text-muted-foreground">{rotulo}</p>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-card p-5 shadow-sm">
        <h2 className="font-bold">Comece por aqui</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cole o link de um produto e o importador preenche título, imagem e
          preço automaticamente.
        </p>
        <Button asChild className="mt-4">
          <Link to="/admin/produtos">Importar produto</Link>
        </Button>
      </div>
    </div>
  );
}

function ModalWhatsappProduto({ produto }: { produto: any }) {
  const [open, setOpen] = useState(false);
  const url = `${typeof window !== "undefined" ? window.location.origin : "https://dna-ofertas.com"}/produto/${produto.slug}`;
  const imgOg = normalizarImagemOg(produto.imagem_url);
  const [msg, setMsg] = useState(() =>
    gerarMensagemWhatsapp({
      titulo: produto.titulo,
      preco: produto.preco,
      precoOriginal: produto.preco_original,
      chamada: produto.chamada,
      cupons:
        Array.isArray(produto.cupons) && produto.cupons.length > 0
          ? produto.cupons
          : produto.cupom
          ? [produto.cupom]
          : [],
      formaPagamento: produto.forma_pagamento,
      url,
    })
  );

  async function copiar(texto: string, aviso: string) {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success(aviso);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Gerar mensagem WhatsApp"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="size-4" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 z-50 bg-black/80"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                Mensagem para WhatsApp
              </h3>
            </div>
            <div className="overflow-hidden rounded-md border border-border bg-muted">
              {imgOg ? (
                <img
                  src={imgOg}
                  alt={produto.titulo}
                  referrerPolicy="no-referrer"
                  className="aspect-video w-full bg-card object-contain"
                />
              ) : (
                <div className="grid aspect-video place-items-center text-xs text-muted-foreground">
                  Adicione uma imagem ao produto para gerar a prévia.
                </div>
              )}
              <div className="p-2 text-xs text-muted-foreground">
                <p className="line-clamp-1 font-semibold text-foreground">
                  {produto.titulo}
                </p>
                dna-ofertas.com
              </div>
            </div>
            <Textarea
              rows={9}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => void copiar(msg, "Mensagem copiada.")}
              >
                <Copy className="size-4" /> Copiar mensagem
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void copiar(url, "Link copiado.")}
              >
                <Link2 className="size-4" /> Copiar link
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(msg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" /> Abrir no WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const formInicialProduto = {
  id: undefined as string | undefined,
  titulo: "",
  descricao: "",
  preco: "",
  preco_original: "",
  imagem_url: "",
  link_afiliado: "",
  loja: "",
  chamada: "",
  cupons: [""],
  forma_pagamento: "",
  categoria_id: "",
  destaque: false,
  publicado: true,
};

function parseMoeda(v: string): number | null {
  const s = String(v || "")
    .replace(/\s/g, "")
    .replace(",", ".");
  if (!s) return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

export function AdminProdutosPage() {
  const queryClient = useQueryClient();
  const [linkImportar, setLinkImportar] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [C, setC] = useState(formInicialProduto);

  const { data: T = [], isLoading: D } = useQuery({
    queryKey: ["admin", "produtos"],
    queryFn: () => apiCall<any[]>("list_produtos", { publicadoOnly: false }),
  });

  const { data: O = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => apiCall<any[]>("list_categorias"),
  });

  function setCampo(chave: string, valor: any) {
    setC((prev) => ({ ...prev, [chave]: valor }));
  }

  const importarMut = useMutation({
    mutationFn: (url: string) => apiCall<any>("import_url", { url }),
    onSuccess: (e) => {
      setC({
        ...formInicialProduto,
        titulo: e.titulo ?? "",
        descricao: e.descricao ?? "",
        preco: e.preco ? String(e.preco) : "",
        preco_original: e.preco_original ? String(e.preco_original) : "",
        imagem_url: e.imagem_url ?? "",
        link_afiliado: e.link_afiliado,
        loja: e.loja ?? "",
      });
      setDialogAberto(true);
      setLinkImportar("");
      toast.success(
        e.titulo
          ? "Dados importados! Revise antes de salvar."
          : "Página lida, mas sem metadados. Preencha manualmente."
      );
    },
    onError: () =>
      toast.error("Não foi possível ler esse link. Cadastre manualmente."),
  });

  const salvarMut = useMutation({
    mutationFn: () =>
      apiCall("upsert_produto", {
        produto: {
          id: C.id,
          titulo: C.titulo.trim(),
          descricao: C.descricao.trim() || null,
          preco: parseMoeda(C.preco),
          preco_original: parseMoeda(C.preco_original),
          imagem_url: C.imagem_url.trim() || null,
          link_afiliado: C.link_afiliado.trim(),
          loja: C.loja.trim() || null,
          chamada: C.chamada.trim() || null,
          cupons: C.cupons.map((c) => c.trim()).filter(Boolean),
          forma_pagamento: C.forma_pagamento.trim() || null,
          categoria_id: C.categoria_id || null,
          destaque: C.destaque,
          publicado: C.publicado,
        },
      }),
    onSuccess: () => {
      toast.success("Produto salvo.");
      setDialogAberto(false);
      setC(formInicialProduto);
      queryClient.invalidateQueries();
    },
    onError: (err: any) =>
      toast.error(err.message || "Falha ao salvar o produto."),
  });

  const removerMut = useMutation({
    mutationFn: (id: string) => apiCall("delete_produto", { id }),
    onSuccess: () => {
      toast.success("Produto removido.");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Falha ao remover o produto."),
  });

  function abrirEdicao(e: any) {
    setC({
      id: e.id,
      titulo: e.titulo,
      descricao: e.descricao ?? "",
      preco: e.preco ? String(e.preco) : "",
      preco_original: e.preco_original ? String(e.preco_original) : "",
      imagem_url: e.imagem_url ?? "",
      link_afiliado: e.link_afiliado,
      loja: e.loja ?? "",
      chamada: e.chamada ?? "",
      cupons:
        Array.isArray(e.cupons) && e.cupons.length > 0
          ? e.cupons
          : e.cupom
          ? [e.cupom]
          : [""],
      forma_pagamento: e.forma_pagamento ?? "",
      categoria_id: e.categoria_id ?? "",
      destaque: e.destaque,
      publicado: e.publicado,
    });
    setDialogAberto(true);
  }

  async function copiarLegenda(e: any) {
    const t = gerarLegendaRedes({
      titulo: e.titulo,
      preco: e.preco,
      precoOriginal: e.preco_original,
      url: `${window.location.origin}/produto/${e.slug}`,
    });
    try {
      await navigator.clipboard.writeText(t);
      toast.success("Legenda copiada para Instagram, Facebook ou TikTok.");
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente o link do produto.");
    }
  }

  function exportarCsv() {
    const cab = [
      "titulo",
      "preco",
      "preco_original",
      "loja",
      "link_afiliado",
      "cliques",
    ];
    const linhas = T.map((e: any) =>
      [
        e.titulo,
        e.preco ?? "",
        e.preco_original ?? "",
        e.loja ?? "",
        e.link_afiliado,
        e.cliques_total,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[cab.join(","), ...linhas].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "produtos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Produtos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {T.length} cadastrados — importe por link ou cadastre manualmente.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportarCsv}
            disabled={T.length === 0}
          >
            <Download className="size-4" />
            Exportar CSV
          </Button>
          <Button
            onClick={() => {
              setC(formInicialProduto);
              setDialogAberto(true);
            }}
          >
            Novo produto
          </Button>
        </div>
      </div>

      <form
        className="rounded-md border border-border bg-card p-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const t = linkImportar.trim();
          if (!/^https?:\/\/.+/i.test(t)) {
            toast.error("Cole um link completo começando com https://");
            return;
          }
          importarMut.mutate(t);
        }}
      >
        <Label htmlFor="link-importar" className="font-semibold">
          Importar produto por link
        </Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Cole o link de afiliado. Buscamos título, imagem e preço da página
          automaticamente.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            id="link-importar"
            type="url"
            inputMode="url"
            maxLength={1000}
            placeholder="https://loja.com/produto/..."
            value={linkImportar}
            onChange={(e) => setLinkImportar(e.target.value)}
          />
          <Button type="submit" disabled={importarMut.isPending}>
            {importarMut.isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <WandSparkles className="size-4" />
            )}
            Importar
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
        {D ? (
          <p className="p-6 text-sm text-muted-foreground">
            Carregando produtos…
          </p>
        ) : T.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            Nenhum produto ainda. Importe o primeiro link acima.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {T.map((e: any) => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 p-3">
                <div className="size-14 shrink-0 overflow-hidden rounded bg-muted">
                  {e.imagem_url && (
                    <img
                      src={e.imagem_url}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{e.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoeda(e.preco)} · {e.loja ?? "loja não informada"} ·{" "}
                    {e.cliques_total} cliques
                    {!e.publicado && " · rascunho"}
                    {e.destaque && " · destaque"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <ModalWhatsappProduto produto={e} />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Copiar legenda para redes sociais"
                    onClick={() => void copiarLegenda(e)}
                  >
                    <Share2 className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar produto"
                    onClick={() => abrirEdicao(e)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir produto"
                    onClick={() => {
                      if (window.confirm(`Remover "${e.titulo}"?`)) {
                        removerMut.mutate(e.id);
                      }
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {dialogAberto && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 z-50 bg-black/80"
            onClick={() => setDialogAberto(false)}
          />
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:max-w-lg sm:rounded-lg">
            <button
              type="button"
              onClick={() => setDialogAberto(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                {C.id ? "Editar produto" : "Novo produto"}
              </h3>
              <p className="text-sm text-muted-foreground">
                O preço original é usado para calcular o selo de desconto.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                salvarMut.mutate();
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  required
                  maxLength={200}
                  value={C.titulo}
                  onChange={(e) => setCampo("titulo", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="link">Link de afiliado</Label>
                <Input
                  id="link"
                  type="url"
                  required
                  maxLength={1000}
                  value={C.link_afiliado}
                  onChange={(e) => setCampo("link_afiliado", e.target.value)}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    inputMode="decimal"
                    value={C.preco}
                    onChange={(e) => setCampo("preco", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="preco-original">Preço original (R$)</Label>
                  <Input
                    id="preco-original"
                    inputMode="decimal"
                    value={C.preco_original}
                    onChange={(e) => setCampo("preco_original", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="chamada">Chamada (WhatsApp)</Label>
                  <Input
                    id="chamada"
                    maxLength={120}
                    placeholder="NÃO SOFRA COM O CALOR"
                    value={C.chamada}
                    onChange={(e) => setCampo("chamada", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="cupom-0">Cupons (opcional)</Label>
                    {C.cupons.length < 10 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setCampo("cupons", [...C.cupons, ""])}
                      >
                        <Plus className="size-4" /> Adicionar cupom
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {C.cupons.map((cupomVal, idx) => (
                      <div key={`cupom-${idx}`} className="flex gap-2">
                        <Input
                          id={`cupom-${idx}`}
                          maxLength={60}
                          placeholder="BARATINHO"
                          value={cupomVal}
                          onChange={(ev) => {
                            const arr = [...C.cupons];
                            arr[idx] = ev.target.value;
                            setCampo("cupons", arr);
                          }}
                        />
                        {C.cupons.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={`Remover cupom ${idx + 1}`}
                            onClick={() =>
                              setCampo(
                                "cupons",
                                C.cupons.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            <X className="size-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pagamento">Forma de pagamento</Label>
                  <Input
                    id="pagamento"
                    maxLength={60}
                    placeholder="no Pix"
                    value={C.forma_pagamento}
                    onChange={(e) =>
                      setCampo("forma_pagamento", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="imagem">URL da imagem</Label>
                <Input
                  id="imagem"
                  type="url"
                  maxLength={1000}
                  value={C.imagem_url}
                  onChange={(e) => setCampo("imagem_url", e.target.value)}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="loja">Loja</Label>
                  <Input
                    id="loja"
                    maxLength={80}
                    value={C.loja}
                    onChange={(e) => setCampo("loja", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="categoria">Categoria</Label>
                  <select
                    id="categoria"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={C.categoria_id}
                    onChange={(e) => setCampo("categoria_id", e.target.value)}
                  >
                    <option value="">Sem categoria</option>
                    {O.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  rows={4}
                  maxLength={4000}
                  value={C.descricao}
                  onChange={(e) => setCampo("descricao", e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={C.publicado}
                    onCheckedChange={(v) => setCampo("publicado", v)}
                  />
                  Publicado
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={C.destaque}
                    onCheckedChange={(v) => setCampo("destaque", v)}
                  />
                  Destaque na home
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogAberto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvarMut.isPending}>
                  {salvarMut.isPending && (
                    <LoaderCircle className="size-4 animate-spin" />
                  )}
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminCategoriasPage() {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const { data: v = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => apiCall<any[]>("list_categorias"),
  });

  const criarMut = useMutation({
    mutationFn: () =>
      apiCall("create_categoria", {
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        ordem: v.length,
      }),
    onSuccess: () => {
      toast.success("Categoria criada.");
      setNome("");
      setDescricao("");
      queryClient.invalidateQueries();
    },
    onError: (err: any) => toast.error(err.message || "Falha ao salvar."),
  });

  const removerMut = useMutation({
    mutationFn: (id: string) => apiCall("delete_categoria", { id }),
    onSuccess: () => {
      toast.success("Categoria removida.");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Falha ao remover."),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Categorias</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada categoria gera uma página própria, indexável no Google.
        </p>
      </div>

      <form
        className="space-y-3 rounded-md border border-border bg-card p-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          if (nome.trim().length < 2) {
            toast.error("Informe um nome com pelo menos 2 caracteres.");
            return;
          }
          criarMut.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="nome-categoria">Nome</Label>
          <Input
            id="nome-categoria"
            maxLength={60}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="descricao-categoria">Descrição (usada no SEO)</Label>
          <Input
            id="descricao-categoria"
            maxLength={500}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={criarMut.isPending}>
          {criarMut.isPending && (
            <LoaderCircle className="size-4 animate-spin" />
          )}
          Adicionar categoria
        </Button>
      </form>

      <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card shadow-sm">
        {v.map((e: any) => (
          <li key={e.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{e.nome}</p>
              <p className="truncate text-xs text-muted-foreground">
                /categoria/{e.slug}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Excluir categoria"
              onClick={() => {
                if (window.confirm(`Remover "${e.nome}"?`)) {
                  removerMut.mutate(e.id);
                }
              }}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const postInicial = {
  id: undefined as string | undefined,
  titulo: "",
  resumo: "",
  conteudo: "",
  capa_url: "",
  publicado: false,
};

export function AdminPostsPage() {
  const queryClient = useQueryClient();
  const [C, setC] = useState(postInicial);

  const { data: T = [] } = useQuery({
    queryKey: ["admin", "posts"],
    queryFn: () => apiCall<any[]>("list_posts", { publicadoOnly: false }),
  });

  const salvarMut = useMutation({
    mutationFn: () =>
      apiCall("upsert_post", {
        post: {
          id: C.id,
          titulo: C.titulo.trim(),
          resumo: C.resumo.trim() || null,
          conteudo: C.conteudo.trim(),
          capa_url: C.capa_url.trim() || null,
          publicado: C.publicado,
        },
      }),
    onSuccess: () => {
      toast.success("Post salvo.");
      setC(postInicial);
      queryClient.invalidateQueries();
    },
    onError: (err: any) =>
      toast.error(err.message || "Falha ao salvar o post."),
  });

  const removerMut = useMutation({
    mutationFn: (id: string) => apiCall("delete_post", { id }),
    onSuccess: () => {
      toast.success("Post removido.");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Falha ao remover o post."),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Blog</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Guias de compra atraem tráfego orgânico do Google. Use `## Título` e
          `- item` no conteúdo.
        </p>
      </div>

      <form
        className="space-y-3 rounded-md border border-border bg-card p-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          if (C.titulo.trim().length < 3 || C.conteudo.trim().length < 10) {
            toast.error("Preencha título e conteúdo.");
            return;
          }
          salvarMut.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="titulo-post">Título</Label>
          <Input
            id="titulo-post"
            maxLength={200}
            value={C.titulo}
            onChange={(e) => setC({ ...C, titulo: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="resumo-post">Resumo (meta description)</Label>
          <Input
            id="resumo-post"
            maxLength={400}
            value={C.resumo}
            onChange={(e) => setC({ ...C, resumo: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="capa-post">URL da capa</Label>
          <Input
            id="capa-post"
            type="url"
            maxLength={1000}
            value={C.capa_url}
            onChange={(e) => setC({ ...C, capa_url: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="conteudo-post">Conteúdo</Label>
          <Textarea
            id="conteudo-post"
            rows={10}
            maxLength={40000}
            value={C.conteudo}
            onChange={(e) => setC({ ...C, conteudo: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={C.publicado}
            onCheckedChange={(v) => setC({ ...C, publicado: v })}
          />
          Publicar agora
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={salvarMut.isPending}>
            {salvarMut.isPending && (
              <LoaderCircle className="size-4 animate-spin" />
            )}
            {C.id ? "Salvar alterações" : "Criar post"}
          </Button>
          {C.id && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setC(postInicial)}
            >
              Cancelar edição
            </Button>
          )}
        </div>
      </form>

      <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card shadow-sm">
        {T.map((e: any) => (
          <li key={e.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{e.titulo}</p>
              <p className="text-xs text-muted-foreground">
                {e.publicado ? "Publicado" : "Rascunho"} · /blog/{e.slug}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Editar post"
              onClick={() =>
                setC({
                  id: e.id,
                  titulo: e.titulo,
                  resumo: e.resumo ?? "",
                  conteudo: e.conteudo,
                  capa_url: e.capa_url ?? "",
                  publicado: e.publicado,
                })
              }
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Excluir post"
              onClick={() => {
                if (window.confirm(`Remover "${e.titulo}"?`)) {
                  removerMut.mutate(e.id);
                }
              }}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminConfiguracoesPage() {
  const queryClient = useQueryClient();
  const { data: n } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: () => apiCall<any>("get_configuracoes"),
  });

  const [form, setForm] = useState<any>({
    nome_site: "",
    descricao_site: "",
    whatsapp: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    aviso_afiliado: "",
  });

  useEffect(() => {
    if (n) {
      setForm({
        nome_site: n.nome_site ?? "",
        descricao_site: n.descricao_site ?? "",
        whatsapp: n.whatsapp ?? "",
        instagram: n.instagram ?? "",
        facebook: n.facebook ?? "",
        tiktok: n.tiktok ?? "",
        aviso_afiliado: n.aviso_afiliado ?? "",
      });
    }
  }, [n]);

  const salvarMut = useMutation({
    mutationFn: () =>
      apiCall("update_configuracoes", {
        configuracoes: {
          nome_site: form.nome_site.trim(),
          descricao_site: form.descricao_site.trim(),
          whatsapp: form.whatsapp.trim() || null,
          instagram: form.instagram.trim() || null,
          facebook: form.facebook.trim() || null,
          tiktok: form.tiktok.trim() || null,
          aviso_afiliado: form.aviso_afiliado.trim(),
        },
      }),
    onSuccess: () => {
      toast.success("Configurações atualizadas.");
      queryClient.invalidateQueries();
    },
    onError: (err: any) => toast.error(err.message || "Falha ao salvar."),
  });

  const campos = [
    { chave: "nome_site", rotulo: "Nome do site", max: 80 },
    {
      chave: "whatsapp",
      rotulo: "WhatsApp (só números, com DDI)",
      max: 30,
    },
    { chave: "instagram", rotulo: "Instagram (usuário)", max: 60 },
    { chave: "facebook", rotulo: "Facebook (página)", max: 120 },
    { chave: "tiktok", rotulo: "TikTok (usuário)", max: 60 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Identidade do site e canais usados nos botões de compartilhamento.
        </p>
      </div>

      <form
        className="space-y-4 rounded-md border border-border bg-card p-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          salvarMut.mutate();
        }}
      >
        {campos.map(({ chave, rotulo, max }) => (
          <div key={chave} className="space-y-1.5">
            <Label htmlFor={chave}>{rotulo}</Label>
            <Input
              id={chave}
              maxLength={max}
              value={form[chave] || ""}
              onChange={(e) => setForm({ ...form, [chave]: e.target.value })}
            />
          </div>
        ))}

        <div className="space-y-1.5">
          <Label htmlFor="descricao_site">Descrição do site (SEO)</Label>
          <Textarea
            id="descricao_site"
            rows={2}
            maxLength={300}
            value={form.descricao_site || ""}
            onChange={(e) =>
              setForm({ ...form, descricao_site: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="aviso_afiliado">Aviso de afiliados (rodapé)</Label>
          <Textarea
            id="aviso_afiliado"
            rows={3}
            maxLength={600}
            value={form.aviso_afiliado || ""}
            onChange={(e) =>
              setForm({ ...form, aviso_afiliado: e.target.value })
            }
          />
        </div>

        <Button type="submit" disabled={salvarMut.isPending}>
          {salvarMut.isPending && (
            <LoaderCircle className="size-4 animate-spin" />
          )}
          Salvar configurações
        </Button>
      </form>
    </div>
  );
}
