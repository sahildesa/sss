import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/signup/`, userData, { observe: 'response' });
  }

  getPendingUsers(): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/listUsers/`, {});
  }

  updateUserStatus(userId: number,isActive: boolean,isApproved: boolean): Observable<any> {
    const payload = {entityKey: userId,isActive: isActive,isApproved: isApproved};
    return this.http.post(`${this.apiUrl}approveUser/`,payload,{  headers: { 'Content-Type': 'application/json' } });
  }
}
