import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/app/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id, nama_lokasi, alamat, lat, lng } = req.body;

    if (!id || !nama_lokasi || !alamat || !lat || !lng) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    try {
      await db.query(
        'UPDATE locations SET nama_lokasi = ?, alamat = ?, lat = ?, lng = ? WHERE id = ?',
        [nama_lokasi, alamat, lat, lng, id]
      );
      res.status(200).json({ message: 'Location updated successfully.' });
    } catch {
      res.status(500).json({ error: 'Failed to update location.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
