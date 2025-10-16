export interface SellerProfile {
  id: string;
  name: string;
  phoneE164: string;
  waPreset: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleWithSeller {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  priceARS: number | null;
  km: number | null;
  fuel: string | null;
  gearbox: string | null;
  location: string | null;
  description: string | null;
  images: string[];
  sellerId: string;
  seller: SellerProfile;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
