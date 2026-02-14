import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent {
  productId: any;
  product: any;

  constructor(private route: ActivatedRoute) {
    this.productId = this.route.snapshot.paramMap.get('id');

    // Dummy product
    this.product = {
      id: this.productId,
      title: 'Apple 2020 MacBook Air M1',
      rating: '4.7★',
      reviews: '17,332',
      totalReviews: '1,353',
      price: '5230',
      stockLeft: 1,
      deliveryDate: '11 PM Tomorrow',
      offers: [
        '5% Unlimited Cashback on Flipkart Axis Bank Credit Card',
        '10% Instant discount on SBI Credit Card EMI Transactions',
        '10% off on Axis Bank Credit Card EMI Txns above ₹7,490'
      ],
      exchangeAmount: 462,
      ssds: ['256 GB', '512 GB'],
      highlights: [
        'Stylish & Portable Thin and Light Laptop',
        '13.3 inch Quad LED Backlit IPS Display',
        'Light Laptop without Optical Disk Drive'
      ],
      images: [
        'assets/images/macbook1.png',
        'assets/images/macbook3.png',
        'assets/images/macbook4.png',
        'assets/images/macbook5.png',
        'assets/images/macbook6.png',
      ],
      mainImage: 'assets/images/macbook1.png',
      colors: ['#000000', '#f5e0dc', '#f0e2de', '#e8e8e8', '#2b2b2b']
    };
  }

}
