import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

export interface User {
  entityKey: string;
  email: string;
  roles: {
    role: string;
    isApproved: boolean;
  }[];
  firstName: string;
  lastName: string;
  phone: string | null;
  companyName: string | null;
  about: string | null;
  address: string | null;
  isActive: boolean;
  isVerified: boolean;
  isDeclined: boolean;
  approvedRoles: string[];
  pendingRoles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isLoggedInSubject = new BehaviorSubject<boolean>(false); 
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private cookieService: CookieService,
    private router: Router
  ) {
    this.checkLoginStatus();
  }

  login(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { email, password };
    
    return new Observable(observer => {
      this.http.post(`${this.apiUrl}auth/login/`, body, { headers }).subscribe(
        (response: any) => {
          if (response.user) {
            // Ensure arrays exist
            response.user.approvedRoles = response.user.approvedRoles || [];
            response.user.pendingRoles = response.user.pendingRoles || [];
            
            this.setUserInCookie(response.user);
            this.currentUserSubject.next(response.user);
            this.isLoggedInSubject.next(true);
            
            // Navigate based on role
            this.navigateBasedOnRole(response.user);
            
            observer.next(response);
            observer.complete();
          } else {
            observer.error({ error: { message: 'Invalid response from server' } });
          }
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }

  signup(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    // Prepare data for signup based on your backend requirements
    const nameParts = userData.username.split(' ');
    const signupPayload = {
      email: userData.email,
      password: userData.password,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' ') || '',
      role: userData.role,
      phone: userData.phone || '',
      companyName: userData.companyName || '',
      address: userData.address || ''
    };
    
    return this.http.post(`${this.apiUrl}auth/signup/`, signupPayload, { headers });
  }

  getPendingUsers(): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/listUsers/`, {});
  }

  updateUserStatus(userId: number, isActive: boolean, isApproved: boolean): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const payload = { entityKey: userId, isActive: isActive, isApproved: isApproved };
    return this.http.post(`${this.apiUrl}auth/approveUser/`, payload, { headers });
  }

  getUserInfo(): User | null {
    const userCookie = this.cookieService.get('user');
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        // Ensure arrays exist
        user.approvedRoles = user.approvedRoles || [];
        user.pendingRoles = user.pendingRoles || [];
        this.currentUserSubject.next(user);
        return user;
      } catch (error) {
        console.error('Error parsing user cookie:', error);
        this.logout();
        return null;
      }
    }
    return null;
  } 
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  checkLoginStatus() {
    const user = this.getUserInfo();
    if (user) {
      this.isLoggedInSubject.next(true);
    } else {
      this.isLoggedInSubject.next(false);
    }
  }

  logout() {
    this.cookieService.delete('user', '/');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/auth']);
  }

  private setUserInCookie(user: User): void {
    // Ensure arrays exist before storing
    user.approvedRoles = user.approvedRoles || [];
    user.pendingRoles = user.pendingRoles || [];
    
    this.cookieService.set('user', JSON.stringify(user), {
      path: '/',
      expires: 7 // 7 days
    });
  }

  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.approvedRoles?.includes('SuperAdmin') || false;
  }

  isVendor(): boolean {
    const user = this.getCurrentUser();
    return user?.approvedRoles?.includes('Vendor') || false;
  }

  isDistributor(): boolean {
    const user = this.getCurrentUser();
    return user?.approvedRoles?.includes('Distributor') || false;
  }

  hasApprovedRole(): boolean {
    const user = this.getCurrentUser();
    return Boolean(user?.approvedRoles?.length);
  }

  hasPendingRole(): boolean {
    const user = this.getCurrentUser();
    return Boolean(user?.pendingRoles?.length);
  }

  navigateBasedOnRole(user?: User): void {
    const currentUser = user || this.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/auth']);
      return;
    }

    // Ensure arrays exist
    currentUser.approvedRoles = currentUser.approvedRoles || [];
    currentUser.pendingRoles = currentUser.pendingRoles || [];

    if (currentUser.approvedRoles.includes('SuperAdmin')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (currentUser.approvedRoles.includes('Vendor')) {
      this.router.navigate(['/home']);
    } else if (currentUser.approvedRoles.includes('Distributor')) {
      this.router.navigate(['/home']);
    } else if (currentUser.pendingRoles && currentUser.pendingRoles.length > 0) {
      // User has pending approval
      this.router.navigate(['/auth'], { queryParams: { pending: true } });
    } else {
      // No approved roles
      this.router.navigate(['/auth']);
    }
  }

  // Encryption methods
  private SECRET_KEY = "ThisIsA32ByteLongSecretKey1234!!";
  private FIXED_NONCE = new TextEncoder().encode("1234567890123456");

  async encryptText(plainText: string): Promise<string> {
    const key = await this.importKey();
    const encoder = new TextEncoder();

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: this.FIXED_NONCE },
      key,
      encoder.encode(plainText)
    );

    const ciphertext = new Uint8Array(encrypted);
    const tag = ciphertext.slice(-16);
    const encryptedContent = ciphertext.slice(0, -16);

    const combined = new Uint8Array([...this.FIXED_NONCE, ...tag, ...encryptedContent]);
    return btoa(String.fromCharCode(...combined));
  }

  async decryptText(encryptedText: string): Promise<string> {
    const key = await this.importKey();
    
    const encryptedData = Uint8Array.from(atob(encryptedText), (c: string) => c.charCodeAt(0));

    const nonce = encryptedData.slice(0, 16);
    const tag = encryptedData.slice(16, 32);
    const ciphertext = encryptedData.slice(32);

    const fullCiphertext = new Uint8Array([...ciphertext, ...tag]);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce },
      key,
      fullCiphertext
    );

    return new TextDecoder().decode(decrypted);
  }

  private async importKey(): Promise<CryptoKey> {
    const keyData = new TextEncoder().encode(this.SECRET_KEY);
    return crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  }
}