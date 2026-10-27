import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://dnaofertas:DnaOfertas_Pg2026_1a2b3c4d5e6f7a8b9c@187.77.231.106:15433/dnaofertas",
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export default async function handler(req: any, res: any) {
  const id = req.query?.id;
  if (!id || typeof id !== "string") {
    res.writeHead(302, { Location: "/" });
    return res.end();
  }

  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query(
      `UPDATE public.produtos
       SET cliques_total = COALESCE(cliques_total, 0) + 1
       WHERE id = $1
       RETURNING link_afiliado`,
      [id]
    );
    if (rows.length > 0 && rows[0].link_afiliado) {
      res.writeHead(302, { Location: rows[0].link_afiliado });
      return res.end();
    }
  } catch (err) {
    console.error("Redirect error:", err);
  } finally {
    if (client) client.release();
  }

  res.writeHead(302, { Location: "/" });
  return res.end();
}
