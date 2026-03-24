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
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  sellerName?: string;
  sellerRating: number;
}
