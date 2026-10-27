import pg from "pg";

const { Pool, types } = pg;
// Parse numeric (OID 1700) as float so preco_atual and preco_antigo are numbers in JSON
types.setTypeParser(1700, (val: string) => parseFloat(val));

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://dnaofertas:DnaOfertas_Pg2026_1a2b3c4d5e6f7a8b9c@187.77.231.106:15433/dnaofertas",
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

function slugify(str: string): string {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function scrapeProductUrl(targetUrl: string) {
  const res = await fetch(targetUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    },
    redirect: "follow",
  });
  const html = await res.text();

  const getMeta = (prop: string): string | null => {
    const r1 = new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      "i"
    );
    const m1 = html.match(r1);
    if (m1?.[1]) return m1[1];
    const r2 = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
      "i"
    );
    const m2 = html.match(r2);
    return m2?.[1] || null;
  };

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const rawTitle =
    getMeta("og:title") ||
    getMeta("twitter:title") ||
    (titleMatch ? titleMatch[1].trim() : "") ||
    "Produto Importado";

  const rawDesc =
    getMeta("og:description") ||
    getMeta("description") ||
    getMeta("twitter:description") ||
    "";

  const rawImage =
    getMeta("og:image") ||
    getMeta("twitter:image") ||
    "";

  let precoAtual: number | null = null;
  const priceMeta =
    getMeta("product:price:amount") ||
    getMeta("og:price:amount");
  if (priceMeta) {
    const parsed = parseFloat(priceMeta.replace(",", "."));
    if (!isNaN(parsed) && parsed > 0) precoAtual = parsed;
  }
  if (!precoAtual) {
    const brlMatch = html.match(/R\$\s*([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2})/);
    if (brlMatch?.[1]) {
      const parsed = parseFloat(brlMatch[1].replace(/\./g, "").replace(",", "."));
      if (!isNaN(parsed) && parsed > 0) precoAtual = parsed;
    }
  }

  return {
    titulo: rawTitle.replace(/\s+/g, " ").trim().slice(0, 180),
    descricao_curta: rawDesc.replace(/\s+/g, " ").trim().slice(0, 300) || null,
    preco_atual: precoAtual || 0,
    preco_antigo: null,
    imagem_principal: rawImage,
    link_afiliado: targetUrl,
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let client;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { action } = body;
    client = await pool.connect();

    // 1. Auth SignIn
    if (action === "auth_signin") {
      const { email, password } = body;
      const { rows } = await client.query(
        `SELECT id, email, role FROM public.app_users
         WHERE lower(email) = lower($1) AND password_hash = crypt($2, password_hash)
         LIMIT 1`,
        [email || "", password || ""]
      );
      if (rows.length === 0) {
        return res.status(401).json({ error: "E-mail ou senha inválidos." });
      }
      return res.status(200).json({ user: rows[0] });
    }

    // 2. Public / Admin: list_categorias
    if (action === "list_categorias") {
      const { rows } = await client.query(
        `SELECT * FROM public.categorias ORDER BY nome ASC`
      );
      return res.status(200).json({ data: rows });
    }

    // 3. Public: categoria_by_slug
    if (action === "categoria_by_slug") {
      const { slug } = body;
      const { rows: catRows } = await client.query(
        `SELECT * FROM public.categorias WHERE slug = $1 LIMIT 1`,
        [slug]
      );
      if (catRows.length === 0) {
        return res.status(200).json({ data: null });
      }
      const categoria = catRows[0];
      const { rows: prodRows } = await client.query(
        `SELECT p.*,
                CASE WHEN c.id IS NOT NULL THEN json_build_object('nome', c.nome, 'slug', c.slug) ELSE NULL END AS categorias
         FROM public.produtos p
         LEFT JOIN public.categorias c ON c.id = p.categoria_id
         WHERE p.categoria_id = $1 AND p.publicado = true
         ORDER BY p.data_publicacao DESC`,
        [categoria.id]
      );
      return res.status(200).json({
        data: { categoria, produtos: prodRows },
      });
    }

    // 4. Public: list_produtos
    if (action === "list_produtos") {
      const {
        publicadoOnly = true,
        destaqueOnly = false,
        categoriaId = null,
        busca = null,
        ordenar = "recentes",
        limit = null,
      } = body;

      const conditions: string[] = [];
      const params: any[] = [];

      if (publicadoOnly) {
        conditions.push(`p.publicado = true`);
      }
      if (destaqueOnly) {
        conditions.push(`p.destaque = true`);
      }
      if (categoriaId) {
        params.push(categoriaId);
        conditions.push(`p.categoria_id = $${params.length}`);
      }
      if (busca && String(busca).trim()) {
        params.push(`%${String(busca).trim()}%`);
        conditions.push(
          `(p.titulo ILIKE $${params.length} OR COALESCE(p.descricao_curta, '') ILIKE $${params.length})`
        );
      }

      const whereSql =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      let orderSql = `ORDER BY p.data_publicacao DESC`;
      if (ordenar === "desconto") {
        orderSql = `ORDER BY COALESCE(p.desconto_percentual, 0) DESC, p.data_publicacao DESC`;
      } else if (ordenar === "menor-preco") {
        orderSql = `ORDER BY p.preco_atual ASC`;
      } else if (ordenar === "maior-preco") {
        orderSql = `ORDER BY p.preco_atual DESC`;
      }

      let limitSql = "";
      if (limit && Number(limit) > 0) {
        params.push(Number(limit));
        limitSql = `LIMIT $${params.length}`;
      }

      const { rows } = await client.query(
        `SELECT p.*,
                CASE WHEN c.id IS NOT NULL THEN json_build_object('nome', c.nome, 'slug', c.slug) ELSE NULL END AS categorias
         FROM public.produtos p
         LEFT JOIN public.categorias c ON c.id = p.categoria_id
         ${whereSql}
         ${orderSql}
         ${limitSql}`,
        params
      );
      return res.status(200).json({ data: rows });
    }

    // 5. Public: produto_by_slug
    if (action === "produto_by_slug") {
      const { slug } = body;
      const { rows } = await client.query(
        `SELECT p.*,
                CASE WHEN c.id IS NOT NULL THEN json_build_object('nome', c.nome, 'slug', c.slug) ELSE NULL END AS categorias
         FROM public.produtos p
         LEFT JOIN public.categorias c ON c.id = p.categoria_id
         WHERE p.slug = $1
         LIMIT 1`,
        [slug]
      );
      const produto = rows[0] || null;
      if (!produto) {
        return res.status(200).json({ data: null });
      }
      let relacionados: any[] = [];
      if (produto.categoria_id) {
        const { rows: relRows } = await client.query(
          `SELECT p.*,
                  CASE WHEN c.id IS NOT NULL THEN json_build_object('nome', c.nome, 'slug', c.slug) ELSE NULL END AS categorias
           FROM public.produtos p
           LEFT JOIN public.categorias c ON c.id = p.categoria_id
           WHERE p.publicado = true AND p.categoria_id = $1 AND p.id <> $2
           ORDER BY p.data_publicacao DESC
           LIMIT 4`,
          [produto.categoria_id, produto.id]
        );
        relacionados = relRows;
      }
      return res.status(200).json({ data: { produto, relacionados } });
    }

    // 6. Public / Admin: list_posts
    if (action === "list_posts") {
      const { publicadoOnly = true, limit = null } = body;
      const params: any[] = [];
      const whereSql = publicadoOnly ? `WHERE publicado = true` : "";
      let limitSql = "";
      if (limit && Number(limit) > 0) {
        params.push(Number(limit));
        limitSql = `LIMIT $${params.length}`;
      }
      const { rows } = await client.query(
        `SELECT * FROM public.posts ${whereSql} ORDER BY data_publicacao DESC ${limitSql}`,
        params
      );
      return res.status(200).json({ data: rows });
    }

    // 7. Public: post_by_slug
    if (action === "post_by_slug") {
      const { slug } = body;
      const { rows } = await client.query(
        `SELECT * FROM public.posts WHERE slug = $1 LIMIT 1`,
        [slug]
      );
      const post = rows[0] || null;
      if (!post) {
        return res.status(200).json({ data: null });
      }
      const { rows: prodRows } = await client.query(
        `SELECT p.*,
                CASE WHEN c.id IS NOT NULL THEN json_build_object('nome', c.nome, 'slug', c.slug) ELSE NULL END AS categorias
         FROM public.produtos p
         LEFT JOIN public.categorias c ON c.id = p.categoria_id
         WHERE p.publicado = true AND p.destaque = true
         ORDER BY p.data_publicacao DESC
         LIMIT 4`
      );
      return res.status(200).json({ data: { post, produtos: prodRows } });
    }

    // 8. Public / Admin: get_configuracoes
    if (action === "get_configuracoes") {
      const { rows } = await client.query(
        `SELECT * FROM public.configuracoes LIMIT 1`
      );
      return res.status(200).json({ data: rows[0] || null });
    }

    // 9. Admin: summary
    if (action === "admin_summary") {
      const { rows: prodStats } = await client.query(
        `SELECT
           COUNT(*)::int AS total_produtos,
           COUNT(*) FILTER (WHERE publicado = true)::int AS total_publicados,
           COALESCE(SUM(cliques_total), 0)::int AS total_cliques
         FROM public.produtos`
      );
      const { rows: postStats } = await client.query(
        `SELECT COUNT(*)::int AS total_posts FROM public.posts`
      );
      return res.status(200).json({
        data: {
          produtos: prodStats[0]?.total_produtos || 0,
          publicados: prodStats[0]?.total_publicados || 0,
          cliques: prodStats[0]?.total_cliques || 0,
          posts: postStats[0]?.total_posts || 0,
        },
      });
    }

    // 10. Admin: import_url
    if (action === "import_url") {
      const { url } = body;
      if (!url) {
        return res.status(400).json({ error: "URL obrigatória" });
      }
      const scraped = await scrapeProductUrl(url);
      return res.status(200).json({ data: scraped });
    }

    // 11. Admin: upsert_produto
    if (action === "upsert_produto") {
      const p = body.produto || {};
      const precoAtual = Number(p.preco_atual) || 0;
      const precoAntigo =
        p.preco_antigo !== null && p.preco_antigo !== undefined && p.preco_antigo !== ""
          ? Number(p.preco_antigo)
          : null;
      const desconto =
        precoAntigo && precoAntigo > precoAtual
          ? Math.round(((precoAntigo - precoAtual) / precoAntigo) * 100)
          : null;

      if (p.id) {
        const { rows } = await client.query(
          `UPDATE public.produtos
           SET titulo = $1,
               descricao_curta = $2,
               descricao_completa = $3,
               preco_atual = $4,
               preco_antigo = $5,
               desconto_percentual = $6,
               imagem_principal = $7,
               link_afiliado = $8,
               categoria_id = $9,
               destaque = $10,
               publicado = $11,
               cupom = $12,
               avaliacao = $13
           WHERE id = $14
           RETURNING *`,
          [
            p.titulo,
            p.descricao_curta || null,
            p.descricao_completa || null,
            precoAtual,
            precoAntigo,
            desconto,
            p.imagem_principal,
            p.link_afiliado,
            p.categoria_id || null,
            Boolean(p.destaque),
            p.publicado !== undefined ? Boolean(p.publicado) : true,
            p.cupom || null,
            p.avaliacao ? Number(p.avaliacao) : null,
            p.id,
          ]
        );
        return res.status(200).json({ data: rows[0] });
      } else {
        let baseSlug = slugify(p.titulo || "produto");
        if (!baseSlug) baseSlug = "produto";
        const { rows: existing } = await client.query(
          `SELECT id FROM public.produtos WHERE slug = $1 LIMIT 1`,
          [baseSlug]
        );
        if (existing.length > 0) {
          baseSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
        }
        const { rows } = await client.query(
          `INSERT INTO public.produtos (
             titulo, slug, descricao_curta, descricao_completa,
             preco_atual, preco_antigo, desconto_percentual,
             imagem_principal, link_afiliado, categoria_id,
             destaque, publicado, cupom, avaliacao
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
           RETURNING *`,
          [
            p.titulo,
            baseSlug,
            p.descricao_curta || null,
            p.descricao_completa || null,
            precoAtual,
            precoAntigo,
            desconto,
            p.imagem_principal,
            p.link_afiliado,
            p.categoria_id || null,
            Boolean(p.destaque),
            p.publicado !== undefined ? Boolean(p.publicado) : true,
            p.cupom || null,
            p.avaliacao ? Number(p.avaliacao) : null,
          ]
        );
        return res.status(200).json({ data: rows[0] });
      }
    }

    // 12. Admin: delete_produto
    if (action === "delete_produto") {
      const { id } = body;
      await client.query(`DELETE FROM public.produtos WHERE id = $1`, [id]);
      return res.status(200).json({ data: { ok: true } });
    }

    // 13. Admin: create_categoria
    if (action === "create_categoria") {
      const { nome, descricao, icone } = body;
      let slug = slugify(nome || "categoria");
      const { rows } = await client.query(
        `INSERT INTO public.categorias (nome, slug, descricao, icone)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [nome, slug, descricao || null, icone || null]
      );
      return res.status(200).json({ data: rows[0] });
    }

    // 14. Admin: delete_categoria
    if (action === "delete_categoria") {
      const { id } = body;
      await client.query(`DELETE FROM public.categorias WHERE id = $1`, [id]);
      return res.status(200).json({ data: { ok: true } });
    }

    // 15. Admin: upsert_post
    if (action === "upsert_post") {
      const post = body.post || {};
      if (post.id) {
        const { rows } = await client.query(
          `UPDATE public.posts
           SET titulo = $1,
               resumo = $2,
               conteudo = $3,
               imagem_capa = $4,
               publicado = $5
           WHERE id = $6
           RETURNING *`,
          [
            post.titulo,
            post.resumo || null,
            post.conteudo || null,
            post.imagem_capa || null,
            post.publicado !== undefined ? Boolean(post.publicado) : false,
            post.id,
          ]
        );
        return res.status(200).json({ data: rows[0] });
      } else {
        let slug = slugify(post.titulo || "post");
        const { rows: existing } = await client.query(
          `SELECT id FROM public.posts WHERE slug = $1 LIMIT 1`,
          [slug]
        );
        if (existing.length > 0) {
          slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        }
        const { rows } = await client.query(
          `INSERT INTO public.posts (titulo, slug, resumo, conteudo, imagem_capa, publicado)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            post.titulo,
            slug,
            post.resumo || null,
            post.conteudo || null,
            post.imagem_capa || null,
            post.publicado !== undefined ? Boolean(post.publicado) : false,
          ]
        );
        return res.status(200).json({ data: rows[0] });
      }
    }

    // 16. Admin: delete_post
    if (action === "delete_post") {
      const { id } = body;
      await client.query(`DELETE FROM public.posts WHERE id = $1`, [id]);
      return res.status(200).json({ data: { ok: true } });
    }

    // 17. Admin: update_configuracoes
    if (action === "update_configuracoes") {
      const cfg = body.configuracoes || {};
      const { rows } = await client.query(
        `UPDATE public.configuracoes
         SET nome_site = $1,
             descricao_site = $2,
             texto_rodape = $3,
             aviso_afiliado = $4,
             email_contato = $5,
             link_whatsapp = $6,
             link_telegram = $7,
             link_instagram = $8
         WHERE id = $9
         RETURNING *`,
        [
          cfg.nome_site,
          cfg.descricao_site || null,
          cfg.texto_rodape || null,
          cfg.aviso_afiliado || null,
          cfg.email_contato || null,
          cfg.link_whatsapp || null,
          cfg.link_telegram || null,
          cfg.link_instagram || null,
          cfg.id,
        ]
      );
      return res.status(200).json({ data: rows[0] });
    }

    return res.status(400).json({ error: `Ação desconhecida: ${action}` });
  } catch (err: any) {
    console.error("API DB error:", err);
    return res.status(500).json({ error: err.message || "Erro interno no servidor" });
  } finally {
    if (client) client.release();
  }
}
