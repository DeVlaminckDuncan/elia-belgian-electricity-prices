import { format } from 'date-fns';
import { ElectricityPriceResponse } from '../types';

export const fetchElectricityPrices = async (date: Date): Promise<ElectricityPriceResponse[]> => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const response = await fetch(
    `https://griddata.elia.be/eliabecontrols.prod/interface/Interconnections/daily/auctionresultsqh/${formattedDate}`,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch prices for ${formattedDate}`);
  }

  return response.json();
};