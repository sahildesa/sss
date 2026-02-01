export interface Product {
  id?: string;
  name: string;
  description?: string;
  buyingPrice: number;
  sellingPrice?: number;
  quantity: string;
  threshold: string;
  expiry: string;
  availability: 'In stock' | 'Out of stock' | 'Low stock';
  imageUrl?: string;
  category?: string;
  brand?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
}

