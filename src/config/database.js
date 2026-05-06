import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function getStreetsWithDates({street, date}, limit = 10) {
    const result = await pool.query(
        `SELECT * FROM public.streetswithdates 
         WHERE ($1::text IS NULL OR street_name ILIKE $1)
           AND ($2::date IS NULL OR date = $2)
         LIMIT $3`,
        [street ? `%${street}%` : null, date || null, limit]
    );
    return result.rows;
}