import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  manufacturer: string;
  addedOn: string;
  addedBy: string;
  images: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  createProduct(productData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}product/`, productData);
  }

  getPendingProducts(): Observable<any> {
    return this.http.post(`${this.apiUrl}product/listProducts/`, { isApproved: false });
  }

  approveProduct(productId: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const requestBody = { entityKey: productId, isApproved: true };

    return this.http.post(`${this.apiUrl}product/approveProduct/`, requestBody, { headers });
  }

  declineProduct(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}product/${productId}/`);
  }

  updateProduct(productId: string, productData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}product/${productId}/`, productData);
  }

  deleteProduct(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}product/${productId}/`);
  }

  getSuperAdminProductList(role: string, addedBy?:string, isApproved?: boolean): Observable<Product[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const requestBody: any = { role: role };
    if (isApproved !== undefined) {
      requestBody.isApproved = isApproved;
    }
    if (addedBy) {
      requestBody.addedBy = addedBy;
    }
    return this.http.post<Product[]>(`${this.apiUrl}product/superadminProductList/`, requestBody, { headers });
  }
  
  getDistributorProductList(addedBy: string): Observable<any> {
    const requestBody = {
      role: 'Distributor',  
      addedBy: addedBy  
    };
    return this.http.post(`${this.apiUrl}product/distributorProductList/`, requestBody, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  getVendorProductList() {
    return this.http.post(`${this.apiUrl}product/vendorProductList/`, {
      role: 'Vendor'
    });
  }

}
