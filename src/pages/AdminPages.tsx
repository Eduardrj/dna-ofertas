import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Settings,
  ExternalLink,
  LogOut,
  MousePointerClick,
  Eye,
  Plus,
  X,
  Link2,
  Loader2,
  Pencil,
  Trash2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import {
  apiCall,
  formatCurrency,
  getStoredUser,
  setStoredUser,
} from "@/lib/api";
import { LOGO_URL } from "@/components/SiteLayout";

export function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login Administrativo — DNA Ofertas";
    const user = getStoredUser();
    if (user) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiCall<{ user: any }>("auth_signin", {
        email,
        password,
      });
      setStoredUser(res.user);
      toast.success("Bem-vindo ao painel!");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message || "Falha na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={LOGO_URL}
            alt="DNA Ofertas"
            className="h-14 w-auto object-contain rounded-xl mb-3"
          />
          <h1 className="font-display font-extrabold text-2xl">
            Painel DNA Ofertas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Entre com sua conta de administrador
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin@dnaofertas.com.br"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            {loading ? "Aguarde..." : "Entrar no Painel"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-border text-center">
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground inline-block"
          >
            ← Voltar para o site público
          </Link>
        </div>
      </div>
    </div>
  );
}

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { to: "/admin/posts", label: "Blog / Posts", icon: FileText },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminLayout() {
  const [user, setUser] = useState(() => getStoredUser());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      navigate("/auth");
    } else {
      setUser(stored);
    }
  }, [navigate]);

  const handleLogout = () => {
    setStoredUser(null);
    toast.success("Sessão encerrada");
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-foreground text-background p-5 flex flex-col shrink-0">
        <div className="flex items-center gap-2.5 mb-8">
          <img
            src={LOGO_URL}
            alt="DNA Ofertas"
            className="h-10 w-auto object-contain rounded-lg"
          />
          <div>
            <div className="font-display font-extrabold text-sm leading-none">
              Painel
            </div>
            <div className="text-[11px] text-background/50">Admin</div>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-background/70 hover:bg-background/10 hover:text-background"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-background/15 space-y-2 mt-6">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 text-xs text-background/70 hover:text-background px-3 py-2"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Ver site público
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs text-destructive hover:bg-destructive/10 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair ({user.email})
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["admin-resumo"],
    queryFn: () => apiCall<any>("admin_summary"),
  });

  const { data: topProdutos = [] } = useQuery({
    queryKey: ["admin-top-produtos"],
    queryFn: async () => {
      const list = await apiCall<any[]>("list_produtos", {
        publicadoOnly: false,
      });
      return [...list]
        .sort((a, b) => (b.cliques_total || 0) - (a.cliques_total || 0))
        .slice(0, 5);
    },
  });

  const cards = [
    {
      label: "Total de Produtos",
      val: stats?.produtos ?? 0,
      icon: Package,
      color: "text-primary",
    },
    {
      label: "Ofertas Publicadas",
      val: stats?.publicados ?? 0,
      icon: Eye,
      color: "text-accent",
    },
    {
      label: "Total de Cliques em Afiliados",
      val: stats?.cliques ?? 0,
      icon: MousePointerClick,
      color: "text-primary",
    },
    {
      label: "Artigos no Blog",
      val: stats?.posts ?? 0,
      icon: FileText,
      color: "text-foreground",
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Visão geral de desempenho do DNA Ofertas
          </p>
        </div>
        <Link
          to="/admin/produtos"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 rounded-xl hover:opacity-90"
        >
          + Nova Oferta
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground">
                  {c.label}
                </span>
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div className="font-display font-extrabold text-3xl">
                {c.val}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-display font-bold text-lg mb-4">
          Ofertas Mais Clicadas
        </h2>
        <div className="divide-y divide-border">
          {topProdutos.map((p: any) => (
            <div
              key={p.id}
              className="py-3 flex items-center justify-between gap-4 text-sm"
            >
              <span className="font-medium truncate">{p.titulo}</span>
              <span className="font-mono font-bold text-primary shrink-0">
                {p.cliques_total || 0} cliques
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const emptyProduto = {
  id: "",
  titulo: "",
  descricao_curta: "",
  descricao_completa: "",
  preco_atual: "",
  preco_antigo: "",
  imagem_principal: "",
  link_afiliado: "",
  categoria_id: "",
  destaque: false,
  publicado: true,
  cupom: "",
  avaliacao: "4.8",
};

export function AdminProdutosPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>(emptyProduto);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [urlImport, setUrlImport] = useState("");
  const [importing, setImporting] = useState(false);

  const { data: produtos = [] } = useQuery({
    queryKey: ["admin-produtos"],
    queryFn: () => apiCall<any[]>("list_produtos", { publicadoOnly: false }),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["admin-categorias-select"],
    queryFn: () => apiCall<any[]>("list_categorias"),
  });

  const handleImportUrl = async () => {
    if (!urlImport.trim()) {
      toast.error("Cole o link do produto primeiro");
      return;
    }
    setImporting(true);
    try {
      const data = await apiCall<any>("import_url", { url: urlImport.trim() });
      setForm((prev: any) => ({
        ...prev,
        titulo: data.titulo || prev.titulo,
        descricao_curta: data.descricao_curta || prev.descricao_curta,
        preco_atual: data.preco_atual ? String(data.preco_atual) : prev.preco_atual,
        preco_antigo: data.preco_antigo ? String(data.preco_antigo) : prev.preco_antigo,
        imagem_principal: data.imagem_principal || prev.imagem_principal,
        link_afiliado: data.link_afiliado || urlImport.trim(),
      }));
      toast.success("Dados importados! Confira os campos antes de salvar.");
    } catch (err: any) {
      toast.error(
        err.message ||
          "Não foi possível extrair os dados automaticamente. Preencha manualmente."
      );
      setForm((prev: any) => ({
        ...prev,
        link_afiliado: prev.link_afiliado || urlImport.trim(),
      }));
    } finally {
      setImporting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiCall("upsert_produto", { produto: form });
      toast.success(form.id ? "Produto atualizado!" : "Produto cadastrado!");
      queryClient.invalidateQueries({ queryKey: ["admin-produtos"] });
      setModalOpen(false);
      setForm(emptyProduto);
      setUrlImport("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: any) => {
    setForm({
      id: p.id,
      titulo: p.titulo,
      descricao_curta: p.descricao_curta || "",
      descricao_completa: p.descricao_completa || "",
      preco_atual: String(p.preco_atual),
      preco_antigo: p.preco_antigo ? String(p.preco_antigo) : "",
      imagem_principal: p.imagem_principal,
      link_afiliado: p.link_afiliado,
      categoria_id: p.categoria_id || "",
      destaque: p.destaque,
      publicado: p.publicado,
      cupom: p.cupom || "",
      avaliacao: p.avaliacao ? String(p.avaliacao) : "4.8",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta oferta?")) return;
    try {
      await apiCall("delete_produto", { id });
      toast.success("Produto excluído");
      queryClient.invalidateQueries({ queryKey: ["admin-produtos"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todas as ofertas afiliadas
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyProduto);
            setUrlImport("");
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl">
                {form.id ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-5 p-3.5 rounded-xl bg-primary/5 border border-primary/20">
              <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1.5 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Importar produto por link (Amazon, Mercado Livre, Shopee, etc.)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={urlImport}
                  onChange={(e) => setUrlImport(e.target.value)}
                  placeholder="Cole a URL do produto aqui para preencher automaticamente..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-card border border-border text-sm"
                />
                <button
                  type="button"
                  onClick={handleImportUrl}
                  disabled={importing}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shrink-0"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando...
                    </>
                  ) : (
                    "Puxar Dados"
                  )}
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Título *
                </label>
                <input
                  required
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Preço Atual (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.preco_atual}
                    onChange={(e) =>
                      setForm({ ...form, preco_atual: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Preço Antigo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.preco_antigo}
                    onChange={(e) =>
                      setForm({ ...form, preco_antigo: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Categoria
                  </label>
                  <select
                    value={form.categoria_id}
                    onChange={(e) =>
                      setForm({ ...form, categoria_id: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
                  >
                    <option value="">Sem categoria</option>
                    {categorias.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  URL da Imagem Principal *
                </label>
                <input
                  required
                  value={form.imagem_principal}
                  onChange={(e) =>
                    setForm({ ...form, imagem_principal: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Link de Afiliado *
                </label>
                <input
                  required
                  value={form.link_afiliado}
                  onChange={(e) =>
                    setForm({ ...form, link_afiliado: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Cupom (opcional)
                  </label>
                  <input
                    value={form.cupom}
                    onChange={(e) =>
                      setForm({ ...form, cupom: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Avaliação (0 a 5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.avaliacao}
                    onChange={(e) =>
                      setForm({ ...form, avaliacao: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Descrição Curta
                </label>
                <input
                  value={form.descricao_curta}
                  onChange={(e) =>
                    setForm({ ...form, descricao_curta: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Descrição Completa
                </label>
                <textarea
                  rows={3}
                  value={form.descricao_completa}
                  onChange={(e) =>
                    setForm({ ...form, descricao_completa: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.destaque}
                    onChange={(e) =>
                      setForm({ ...form, destaque: e.target.checked })
                    }
                  />
                  Destaque na Home
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.publicado}
                    onChange={(e) =>
                      setForm({ ...form, publicado: e.target.checked })
                    }
                  />
                  Publicado
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-muted text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
                >
                  {saving ? "Salvando..." : "Salvar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4">Produto</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Cliques</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {produtos.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={p.imagem_principal}
                      alt={p.titulo}
                      className="w-10 h-10 rounded-lg object-contain bg-white border border-border"
                    />
                    <div>
                      <div className="font-semibold line-clamp-1 max-w-xs">
                        {p.titulo}
                      </div>
                      {p.destaque && (
                        <span className="text-[10px] font-bold text-primary uppercase">
                          ★ Destaque
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {p.categorias?.nome || "—"}
                  </td>
                  <td className="p-4 font-bold text-accent">
                    {formatCurrency(p.preco_atual)}
                  </td>
                  <td className="p-4 font-mono">{p.cliques_total || 0}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        p.publicado
                          ? "bg-accent/15 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.publicado ? "Publicado" : "Rascunho"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 hover:bg-muted rounded-lg text-foreground"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminCategoriasPage() {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const { data: categorias = [] } = useQuery({
    queryKey: ["admin-categorias"],
    queryFn: () => apiCall<any[]>("list_categorias"),
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCall("create_categoria", { nome, descricao });
      toast.success("Categoria criada!");
      setNome("");
      setDescricao("");
      queryClient.invalidateQueries({ queryKey: ["admin-categorias"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta categoria?")) return;
    try {
      await apiCall("delete_categoria", { id });
      toast.success("Categoria excluída");
      queryClient.invalidateQueries({ queryKey: ["admin-categorias"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-card border border-border rounded-2xl p-6 h-fit">
        <h2 className="font-display font-bold text-lg mb-4">Nova Categoria</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Nome *</label>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Descrição
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Adicionar Categoria
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Descrição</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categorias.map((c: any) => (
              <tr key={c.id}>
                <td className="p-4 font-semibold">{c.nome}</td>
                <td className="p-4 font-mono text-xs text-muted-foreground">
                  {c.slug}
                </td>
                <td className="p-4 text-muted-foreground">{c.descricao}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const emptyPost = {
  id: "",
  titulo: "",
  resumo: "",
  conteudo: "",
  imagem_capa: "",
  publicado: true,
};

export function AdminPostsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>(emptyPost);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: posts = [] } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => apiCall<any[]>("list_posts", { publicadoOnly: false }),
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCall("upsert_post", { post: form });
      toast.success(form.id ? "Artigo atualizado!" : "Artigo publicado!");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este artigo?")) return;
    try {
      await apiCall("delete_post", { id });
      toast.success("Artigo excluído");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl">Blog / Posts</h1>
          <p className="text-sm text-muted-foreground">
            Artigos, reviews e listas de compras
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyPost);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Novo Artigo
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl">
                {form.id ? "Editar Artigo" : "Novo Artigo"}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Título *
                </label>
                <input
                  required
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  URL da Imagem de Capa
                </label>
                <input
                  value={form.imagem_capa}
                  onChange={(e) =>
                    setForm({ ...form, imagem_capa: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Resumo
                </label>
                <textarea
                  rows={2}
                  value={form.resumo}
                  onChange={(e) => setForm({ ...form, resumo: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Conteúdo
                </label>
                <textarea
                  rows={8}
                  value={form.conteudo}
                  onChange={(e) =>
                    setForm({ ...form, conteudo: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.publicado}
                  onChange={(e) =>
                    setForm({ ...form, publicado: e.target.checked })
                  }
                />
                Publicado
              </label>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-muted text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-4">Título</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((p: any) => (
              <tr key={p.id}>
                <td className="p-4 font-semibold">{p.titulo}</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      p.publicado
                        ? "bg-accent/15 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.publicado ? "Publicado" : "Rascunho"}
                  </span>
                </td>
                <td className="p-4 text-right space-x-1">
                  <button
                    onClick={() => {
                      setForm({
                        id: p.id,
                        titulo: p.titulo,
                        resumo: p.resumo || "",
                        conteudo: p.conteudo || "",
                        imagem_capa: p.imagem_capa || "",
                        publicado: p.publicado,
                      });
                      setModalOpen(true);
                    }}
                    className="p-2 hover:bg-muted rounded-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminConfiguracoesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>(null);

  const { data } = useQuery({
    queryKey: ["admin-config"],
    queryFn: () => apiCall<any>("get_configuracoes"),
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCall("update_configuracoes", { configuracoes: form });
      toast.success("Configurações salvas!");
      queryClient.invalidateQueries({ queryKey: ["configuracoes"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!form) {
    return (
      <div className="text-muted-foreground">Carregando configurações...</div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-extrabold text-2xl mb-1">
        Configurações do Site
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Textos institucionais, rodapé e redes sociais
      </p>

      <form
        onSubmit={handleSave}
        className="bg-card border border-border rounded-2xl p-6 space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold mb-1">
            Nome do Site
          </label>
          <input
            value={form.nome_site || ""}
            onChange={(e) => setForm({ ...form, nome_site: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">
            Descrição do Site
          </label>
          <textarea
            rows={2}
            value={form.descricao_site || ""}
            onChange={(e) =>
              setForm({ ...form, descricao_site: e.target.value })
            }
            className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">
            Aviso de Afiliado (Rodapé)
          </label>
          <textarea
            rows={3}
            value={form.aviso_afiliado || ""}
            onChange={(e) =>
              setForm({ ...form, aviso_afiliado: e.target.value })
            }
            className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">
            Texto de Copyright (Rodapé)
          </label>
          <input
            value={form.texto_rodape || ""}
            onChange={(e) => setForm({ ...form, texto_rodape: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              E-mail de Contato
            </label>
            <input
              value={form.email_contato || ""}
              onChange={(e) =>
                setForm({ ...form, email_contato: e.target.value })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Link Grupo WhatsApp
            </label>
            <input
              value={form.link_whatsapp || ""}
              onChange={(e) =>
                setForm({ ...form, link_whatsapp: e.target.value })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Link Canal Telegram
            </label>
            <input
              value={form.link_telegram || ""}
              onChange={(e) =>
                setForm({ ...form, link_telegram: e.target.value })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Link Instagram
            </label>
            <input
              value={form.link_instagram || ""}
              onChange={(e) =>
                setForm({ ...form, link_instagram: e.target.value })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-primary text-primary-foreground font-bold text-sm px-6 py-2.5 rounded-xl"
        >
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}
