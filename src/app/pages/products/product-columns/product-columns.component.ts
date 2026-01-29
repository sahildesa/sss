import { Component } from '@angular/core';
import { Product } from './product-management';

@Component({
  selector: 'app-product-columns',
  templateUrl: './product-columns.component.html',
  styleUrls: ['./product-columns.component.scss']
})
export class ProductColumnsComponent {
  products: Product[] = [
    {
      id: 1,
      name: 'Apple',
      description: '2020 Apple MacBook Air Laptop: Apple M1 Chip, 13"',
      price: '$1024.99+',
      discount: '35% Off',
      image: 'assets/images/macbook1.png', // ✅ Corrected path
      badge: 'Winner',
      isActive: true
    },
    {
      id: 2,
      name: 'Google',
      description: '2020 Apple MacBook Air Laptop: Apple M1 Chip, 13"',
      price: '$1024.99+',
      discount: '35% Off',
      image: 'assets/images/macbook1.png',
      isActive: true
    },
    {
      id: 3,
      name: 'Asus',
      description: '2020 Apple MacBook Air Laptop: Apple M1 Chip, 13"',
      price: '$1024.99+',
      discount: '35% Off',
      image: 'assets/images/macbook1.png',
      isActive: false
    },
    {
      id: 4,
      name: 'Lenevo',
      description: '2020 Apple MacBook Air Laptop: Apple M1 Chip, 13"',
      price: '$1024.99+',
      discount: '35% Off',
      image: 'assets/images/macbook1.png',
      isActive: true
    },
    {
      id: 1,
      name: 'Apple',
      description: '2020 Apple MacBook Air Laptop: Apple M1 Chip, 13"',
      price: '$1024.99+',
      discount: '35% Off',
      image: 'assets/images/macbook1.png', // ✅ Corrected path
      badge: 'Winner',
      isActive: true
    },
    {
      id: 2,
      name: 'Google',
      description: '2020 Apple MacBook Air Laptop: Apple M1 Chip, 13"',
      price: '$1024.99+',
      discount: '35% Off',
      image: 'assets/images/macbook1.png',
      isActive: true
    },
    {
      id: 3,
      name: 'Asus',
      description: '2020 Apple MacBook Air Laptop: Apple M1 Chip, 13"',
      price: '$1024.99+',
      discount: '35% Off',
      image: 'assets/images/macbook1.png',
      isActive: false
    },
    {
      id: 4,
      name: 'Lenevo',
      description: '2020 Apple MacBook Air Laptop: Apple M1 Chip, 13"',
      price: '$1024.99+',
      discount: '35% Off',
      image: 'assets/images/macbook1.png',
      isActive: true
    }
  ];

}

