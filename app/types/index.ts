export interface SliderItem {
  id: number;
  icon: string;
  title: string;
  desc: string;
}

export interface FeatureItem {
  id: number;
  icon: string;
  colorClass: string;
  title: string;
  desc: string;
}

export interface Product {
  id: string | number;
  title: string;
  price: number;
  images: string[];
  quantity: number;
  unit: string;
  status: string;
  description?: string;
  location?: {
    address: string;
    lat: number;
    lng: number;
  };
  address?: string;
  latitude?: number;
  longitude?: number;
  sellerName?: string;
  sellerRating: number;
  views?: number;
  delivery?: string;
  deliveryDetails?: string;
  category?: string;
  sellerPhone?: string;
  created_at?: string;
}

export interface MobileMenuItem {
  to: string;
  iconName: string;
  linkLabel: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  subcategories: { id: string; name: string }[];
}
