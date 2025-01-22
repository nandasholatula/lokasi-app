import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/app/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const [rows] = await db.query('SELECT * FROM locations');
      res.status(200).json(rows);
    } catch (error: unknown) {
      console.error(error);
      res.status(500).json({ error: 'ERROR, Data tidak ditemukan.' });
    }
  } else {
    res.status(405).json({ error: 'ERROR, Data tidak ditemukan.' });
  }
}
