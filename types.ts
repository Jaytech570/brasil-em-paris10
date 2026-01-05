export enum TabType {
  HOME = 'HOME',
  JOBS = 'VAGAS',
  MARKET = 'MERCADO',
  PLACES = 'GUIA',
  FAVORITES = 'SALVOS'
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  is_premium: boolean;
  created_at?: string;
}

export interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  image_url: string;
  rating: number;
  description: string;
  maps_url: string;
  is_premium: boolean;
  created_at?: string;
}

export interface MarketItem {
  id: string;
  title: string;
  category: string;
  price: string;
  whatsapp: string;
  description: string;
  is_premium: boolean;
  clicks: number;
  created_at?: string;
}
