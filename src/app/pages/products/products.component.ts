import { Component } from '@angular/core';
import { PRODUCTS } from './product-data';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent {
  [x: string]: any;
  goToProductManagement() {
    this['router'].navigate(['/product-management']);
  }
  
    expandedIndex: number | null = null;
    hoveredIndex: number = -1;
  
    toggleRow(index: number): void {
      this.expandedIndex = this.expandedIndex === index ? null : index;
    }
  
    products = PRODUCTS;

}
