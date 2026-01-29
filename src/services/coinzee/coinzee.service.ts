import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CoinzeeService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient){} 

    sendEnquiry(enquiryData: any): Observable<any> {
      return this.http.post(`${this.apiUrl}enquiry/`, enquiryData);
    }
  
    listEnquiries(): Observable<any> {
      return this.http.get(`${this.apiUrl}enquiry/`);
    }
}
