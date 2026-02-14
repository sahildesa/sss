import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

/** Payload for signup API binding. Matches API: email, password, role, phone, firstName, lastName, companyName, address, about. */
export interface SignupPayload {
  email: string;
  password: string;
  role: string;
  phone?: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  address?: string;
  about?: string;
}

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
            // Ensure arrays exist; derive approvedRoles/pendingRoles from roles if missing
            this.normalizeUserRoles(response.user);
            
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

  /** Signup API binding: POST to auth/signup/ with SignupPayload. Ready for backend. */
  signup(payload: SignupPayload): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}auth/signup/`;
    return this.http.post(url, payload, { headers });
  }

  getPendingUsers(): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/listUsers/`, {});
  }

  updateUserStatus(userId: number, isActive: boolean, isApproved: boolean): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const payload = { entityKey: userId, isActive: isActive, isApproved: isApproved };
    return this.http.post(`${this.apiUrl}auth/approveUser/`, payload, { headers });
  }

  /** Set approvedRoles/pendingRoles from roles when missing; normalize isActive/isVerified (support API snake_case). */
  private normalizeUserRoles(user: any): void {
    user.approvedRoles = user.approvedRoles || [];
    user.pendingRoles = user.pendingRoles || [];
    if (user.roles && Array.isArray(user.roles) && user.approvedRoles.length === 0 && user.pendingRoles.length === 0) {
      user.approvedRoles = user.roles.filter((r: any) => r && r.isApproved && r.role).map((r: any) => r.role);
      user.pendingRoles = user.roles.filter((r: any) => r && !r.isApproved && r.role).map((r: any) => r.role);
    }
    // Support API snake_case and coerce to boolean so AuthGuard doesn't block when backend sends is_active/is_verified
    const active = user.isActive ?? user.is_active;
    const verified = user.isVerified ?? user.is_verified;
    user.isActive = active === true || active === 'true' || active === 1;
    user.isVerified = verified === true || verified === 'true' || verified === 1;
  }

  getUserInfo(): User | null {
    const userCookie = this.cookieService.get('user');
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        this.normalizeUserRoles(user);
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

  /** Hardcoded logout API binding: POST to auth/logout/ then clear session and redirect */
  logoutApi(): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}auth/logout/`;
    return this.http.post(url, {}, { headers });
  }

  logout() {
    this.cookieService.delete('user', '/');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
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
    } else if (currentUser.approvedRoles.includes('Vendor') || currentUser.approvedRoles.includes('Distributor')) {
      // Dashboard layout with Analytics, Users, Products tabs
      this.router.navigate(['/dashboard']);
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