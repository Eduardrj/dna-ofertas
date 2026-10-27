import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import {
  HomePage,
  ProdutosPage,
  ProdutoDetalhePage,
  CategoriaDetalhePage,
  BuscaPage,
  BlogIndexPage,
  BlogPostPage,
  SobrePage,
  ContatoPage,
} from "@/pages/PublicPages";
import {
  AuthPage,
  AdminLayout,
  AdminDashboardPage,
  AdminProdutosPage,
  AdminCategoriasPage,
  AdminPostsPage,
  AdminConfiguracoesPage,
} from "@/pages/AdminPages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/produto/:slug" element={<ProdutoDetalhePage />} />
          <Route path="/categoria/:slug" element={<CategoriaDetalhePage />} />
          <Route path="/busca" element={<BuscaPage />} />
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/sobre" element={<SobrePage />} />
          <Route path="/contato" element={<ContatoPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="produtos" element={<AdminProdutosPage />} />
            <Route path="categorias" element={<AdminCategoriasPage />} />
            <Route path="posts" element={<AdminPostsPage />} />
            <Route path="configuracoes" element={<AdminConfiguracoesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
