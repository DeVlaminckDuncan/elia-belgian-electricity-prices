import { format } from 'date-fns';
import { ElectricityPriceResponse } from '../types';

const BASE_URL = import.meta.env.DEV 
  ? '/api/elia'
  : 'https://griddata.elia.be';

export const fetchElectricityPrices = async (date: Date): Promise<ElectricityPriceResponse[]> => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const response = await fetch(
    `${BASE_URL}/eliabecontrols.prod/interface/Interconnections/daily/auctionresultsqh/${formattedDate}`,
    {
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch prices for ${formattedDate}`);
  }

  return response.json();
};