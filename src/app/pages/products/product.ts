export interface Product {
    name: string;
    buyingPrice: number;
    quantity: string;
    threshold: string;
    expiry: string;
    availability: 'In stock' | 'Out of stock' | 'Low stock';
  }

