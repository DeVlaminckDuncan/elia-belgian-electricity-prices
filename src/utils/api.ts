import { format } from 'date-fns';
import { ElectricityData, ElectricityPriceResponse } from '../types';

export const fetchElectricityPrices = async (date: Date): Promise<ElectricityPriceResponse[]> => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const targetUrl = `https://griddata.elia.be/eliabecontrols.prod/interface/Interconnections/daily/auctionresultsqh/${formattedDate}`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

  const response = await fetch(proxyUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch prices for ${formattedDate}`);
  }

  const data = await response.json();
  
  if (!data.contents) {
    throw new Error('No data received from the server');
  }

  try {
    // The API returns the data wrapped in a 'contents' property as a string
    const parsedContents = JSON.parse(data.contents);
    return Array.isArray(parsedContents) ? parsedContents : [];
  } catch (error) {
    console.error('Failed to parse response:', error);
    throw new Error('Invalid data format received from the server');
  }
};