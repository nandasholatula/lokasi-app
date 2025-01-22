import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/app/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    console.log(req.body);
    const { id, nama_lokasi, alamat, lat, lng } = req.body;

    if (!nama_lokasi || !alamat || !lat || !lng) {
      return res.status(400).json({ error: "GAGAL" });
    }
   
    try {
      await db.query('INSERT INTO locations (id,nama_lokasi, alamat, lat, lng) VALUES (?, ?, ?, ?,?)', [
        id,
        nama_lokasi,
        alamat,
        lat,
        lng,
      ]);
      res.status(201).json({ message: 'berhasil di submit.' });
    } catch (error) {
      const errorMessage = (error as Error).message;
      res.status(500).json({ error: 'Gagal, Data Kosong 500.', details: errorMessage });
    }
  } else {
    res.status(405).json({ error: 'Gagal, Data Kosong 300.' });
  }
}
