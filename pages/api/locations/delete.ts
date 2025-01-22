import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/app/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing required field: id.' });
    }

    try {
      await db.query('DELETE FROM locations WHERE id = ?', [id]);
      res.status(200).json({ message: 'Location deleted successfully.' });
    } catch (error: unknown) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete location.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
