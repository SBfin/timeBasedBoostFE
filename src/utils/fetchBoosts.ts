import { DuneClient } from '@duneanalytics/client-sdk';
import "dotenv/config";
import { BoostData } from '../types/boostData';

export async function fetchBoosts(): Promise<BoostData[]> {
  // 4638590
  /*
    SELECT *
    FROM boost_v2_base.BoostCore_evt_BoostCreated
    WHERE boostId >= 477
    AND owner = X'EA36661C0DdcEDe369D05DaE7483d7e257E26dE4'
    ORDER BY boostId DESC
  */

  const DUNE_API_KEY = process.env.NEXT_PUBLIC_DUNE_API_KEY as string;
  const client = new DuneClient(DUNE_API_KEY);
  
  const result = await client.runQuery({
    queryId: 4638590,
    query_parameters: []
  });
  
  return (result.result?.rows ?? []) as unknown as BoostData[];
}
