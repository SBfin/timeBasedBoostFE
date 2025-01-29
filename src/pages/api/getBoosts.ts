import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!process.env.DUNE_API_KEY) {
      throw new Error('DUNE_API_KEY is not defined');
    }

    const response = await fetch('https://api.dune.com/api/v1/query/4638590/results', {
      method: 'GET',
      headers: {
        'x-dune-api-key': process.env.DUNE_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Dune API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dune API response:', data); // Debug log

    res.status(200).json(data.result?.rows || []);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch boosts' });
  }
}