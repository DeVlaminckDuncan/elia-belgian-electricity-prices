// Types matching the exact API response
export interface ElectricityPriceResponse {
  dateTime: string;
  price: number;
  isVisible: boolean;
}

export interface ElectricityData {
  data: ElectricityPriceResponse[];
}