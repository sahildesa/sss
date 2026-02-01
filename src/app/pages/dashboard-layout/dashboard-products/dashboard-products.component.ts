import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../products/product';
import { ProductsService } from '../../../../services/products/products.service';

@Component({
  selector: 'app-dashboard-products',
  templateUrl: './dashboard-products.component.html',
  styleUrls: ['./dashboard-products.component.scss']
})
export class DashboardProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  viewMode: 'grid' | 'detail' | 'create' = 'grid';
  selectedProduct: Product | null = null;
  productForm: FormGroup;
  formSaving = false;
  searchTerm = '';

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      buyingPrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, [Validators.min(0)]],
      quantity: ['0', Validators.required],
      threshold: ['0', Validators.required],
      expiry: [''],
      category: [''],
      brand: [''],
      sku: [''],
      imageUrl: [''],
      availability: ['In stock' as const]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productsService.getSuperAdminProductList('SuperAdmin').subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res) ? res : (res?.products ?? res?.data ?? []);
        this.normalizeProducts();
        this.loading = false;
      },
      error: () => {
        this.products = this.getSampleProducts();
        this.loading = false;
      }
    });
  }

  private normalizeProducts(): void {
    this.products = this.products.map((p: any) => ({
      id: p.id ?? p.entityKey,
      name: p.name ?? '',
      description: p.description ?? '',
      buyingPrice: p.buyingPrice ?? p.price ?? 0,
      sellingPrice: p.sellingPrice ?? p.price ?? 0,
      quantity: String(p.quantity ?? '0'),
      threshold: String(p.threshold ?? '0'),
      expiry: p.expiry ?? '',
      availability: this.mapAvailability(p),
      imageUrl: p.imageUrl ?? p.images?.[0] ?? '',
      category: p.category ?? '',
      brand: p.brand ?? p.manufacturer ?? '',
      sku: p.sku ?? '',
      rating: p.rating ?? 0,
      reviewCount: p.reviewCount ?? 0
    }));
  }

  private mapAvailability(p: any): 'In stock' | 'Out of stock' | 'Low stock' {
    const a = p.availability;
    if (a === 'In stock' || a === 'Low stock' || a === 'Out of stock') return a;
    const q = parseInt(String(p.quantity ?? 0), 10);
    const t = parseInt(String(p.threshold ?? 0), 10);
    if (q <= 0) return 'Out of stock';
    if (t > 0 && q <= t) return 'Low stock';
    return 'In stock';
  }

  private getSampleProducts(): Product[] {
    return [
      {
        id: '1',
        name: 'Wireless Bluetooth Headphones',
        description: 'Noise-cancelling over-ear headphones with 30hr battery. Comfortable for all-day use.',
        buyingPrice: 45,
        sellingPrice: 79.99,
        quantity: '120',
        threshold: '20',
        expiry: '2026-12-31',
        availability: 'In stock',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        category: 'Electronics',
        brand: 'SoundMax',
        sku: 'WH-100',
        rating: 4.5,
        reviewCount: 128
      },
      {
        id: '2',
        name: 'Stainless Steel Water Bottle',
        description: '1L insulated bottle, keeps cold 24hrs and hot 12hrs. BPA-free.',
        buyingPrice: 12,
        sellingPrice: 24.99,
        quantity: '8',
        threshold: '10',
        expiry: '',
        availability: 'Low stock',
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
        category: 'Accessories',
        brand: 'HydroLife',
        sku: 'SB-500',
        rating: 4.8,
        reviewCount: 256
      },
      {
        id: '3',
        name: 'Organic Cotton T-Shirt',
        description: 'Unisex crew neck, soft fabric. Available in multiple colors.',
        buyingPrice: 8,
        sellingPrice: 19.99,
        quantity: '0',
        threshold: '15',
        expiry: '',
        availability: 'Out of stock',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        category: 'Apparel',
        brand: 'EcoWear',
        sku: 'TS-ORG-M',
        rating: 4.3,
        reviewCount: 89
      }
    ];
  }

  get filteredProducts(): Product[] {
    if (!this.searchTerm.trim()) return this.products;
    const t = this.searchTerm.toLowerCase();
    return this.products.filter(
      p =>
        (p.name ?? '').toLowerCase().includes(t) ||
        (p.description ?? '').toLowerCase().includes(t) ||
        (p.category ?? '').toLowerCase().includes(t) ||
        (p.brand ?? '').toLowerCase().includes(t) ||
        (p.sku ?? '').toLowerCase().includes(t)
    );
  }

  openDetail(product: Product): void {
    this.selectedProduct = product;
    this.viewMode = 'detail';
  }

  openCreate(): void {
    this.selectedProduct = null;
    this.productForm.reset({
      name: '',
      description: '',
      buyingPrice: 0,
      sellingPrice: 0,
      quantity: '0',
      threshold: '0',
      expiry: '',
      category: '',
      brand: '',
      sku: '',
      imageUrl: '',
      availability: 'In stock'
    });
    this.viewMode = 'create';
  }

  backToGrid(): void {
    this.viewMode = 'grid';
    this.selectedProduct = null;
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    this.formSaving = true;
    const value = this.productForm.value;
    const payload = {
      name: value.name,
      description: value.description || undefined,
      buyingPrice: value.buyingPrice,
      sellingPrice: value.sellingPrice || undefined,
      quantity: value.quantity,
      threshold: value.threshold,
      expiry: value.expiry || undefined,
      category: value.category || undefined,
      brand: value.brand || undefined,
      sku: value.sku || undefined,
      imageUrl: value.imageUrl || undefined,
      availability: value.availability
    };
    this.productsService.createProduct(payload).subscribe({
      next: () => {
        this.formSaving = false;
        this.backToGrid();
        this.loadProducts();
      },
      error: () => {
        this.formSaving = false;
        this.backToGrid();
        this.loadProducts();
      }
    });
  }

  displayPrice(p: Product): number {
    return p.sellingPrice ?? p.buyingPrice ?? 0;
  }

  availabilityClass(availability: string): string {
    if (availability === 'In stock') return 'in-stock';
    if (availability === 'Low stock') return 'low-stock';
    return 'out-of-stock';
  }
}
