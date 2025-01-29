import { DuneClient } from '@duneanalytics/client-sdk';
import "dotenv/config";

const DUNE_API_KEY = process.env.DUNE_API_KEY as string;
if (!DUNE_API_KEY) throw new Error('Missing DUNE_API_KEY');

async function testQuery() {
  const client = new DuneClient(DUNE_API_KEY);
  const queryId = 4638590; // Your query ID from Dune
  
  try {
    const result = await client.runQuery({
      queryId,
      query_parameters: []
    });
    console.log('Query results:', result.result?.rows);
  } catch (error) {
    console.error('Error:', error);
  }
}

testQuery();
