import { db } from '../../../lib/db';

export default function handler(req, res) {
  return res.status(200).json({ listings: db.listings, opportunities: db.opportunities });
}
