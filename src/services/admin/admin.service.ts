import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface UserRole {
  role: string;
  isApproved: boolean;
}

export interface User {
  entityKey: string;
  email: string;
  roles: UserRole[];
  phone?: string | null;
  firstName: string;
  lastName: string;
  companyName?: string | null;
  about?: string | null;
  address?: string | null;
  isActive: boolean;
  isVerified: boolean;
  isDeclined: boolean;
  approvedRoles: string[];
  pendingRoles: string[];
  createdAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  activatedAt?: string;
  declinedAt?: string;
  rejectionReason?: string;
  declinedBy?: string;
  
  // Computed properties
  isVendor?: boolean;
  vendorStatus?: 'pending' | 'approved' | 'declined' | 'active';
  selected?: boolean;
  
  // Legacy properties for backward compatibility
  role?: string;
  isApproved?: boolean;
}

export interface VendorListResponse {
  count: number;
  users: User[];
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ApproveUserPayload {
  entityKey: string;
  isApproved: boolean;
  role: string;
}

export interface DeclineUserPayload {
  entityKey: string;
  reason?: string;
  role?: string;
  isDeclined?: boolean;
}

export interface ActivateUserPayload {
  entityKey: string;
  role?: string;
}

export interface ListUsersPayload {
  isApproved?: boolean;
  roles?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl.endsWith('/') 
      ? environment.apiUrl 
      : `${environment.apiUrl}/`;
    
    console.log('AdminService initialized with API URL:', this.apiUrl);
  }

  // Get all vendors with proper response handling
  getAllVendors(): Observable<User[]> {
    const url = `${this.apiUrl}auth/listUsers/`;
    
    const payload: ListUsersPayload = {
      isApproved: false,
      roles: ["Vendor"]
    };
    
    console.log('Request URL:', url);
    console.log('Request Payload:', payload);
    
    return this.http.post<VendorListResponse>(url, payload).pipe(
      tap(response => {
        console.log('Raw API Response:', response);
      }),
      map(response => {
        console.log('Processing response...');
        
        if (!response) {
          console.warn('Empty API response');
          return [];
        }
        
        if (!response.users || !Array.isArray(response.users)) {
          console.warn('Invalid API response format - missing users array:', response);
          return [];
        }
        
        console.log(`Found ${response.users.length} total users`);
        
        const vendorUsers = response.users
          .filter(user => this.hasVendorRole(user))
          .map(user => this.transformUser(user));
        
        console.log(`Found ${vendorUsers.length} vendor users after filtering`);
        
        return vendorUsers;
      }),
      catchError(error => {
        console.error('Error in getAllVendors:', error);
        return this.handleError(error);
      })
    );
  }

  // Get all users (unfiltered)
  getAllUsers(): Observable<User[]> {
    const url = `${this.apiUrl}auth/listUsers/`;
    
    const payload: ListUsersPayload = {};
    
    console.log('Get All Users URL:', url);
    console.log('Get All Users Payload:', payload);
    
    return this.http.post<VendorListResponse>(url, payload).pipe(
      tap(response => {
        console.log('All users response:', response);
      }),
      map(response => {
        if (!response || !response.users) {
          return [];
        }
        return response.users.map(user => this.transformUser(user));
      }),
      catchError(error => {
        console.error('Error in getAllUsers:', error);
        return this.handleError(error);
      })
    );
  }

  /** Get users list as { count, users }. All API user keys are patched to the table. */
  getUsersList(payload: ListUsersPayload = {}): Observable<VendorListResponse> {
    const url = `${this.apiUrl}auth/listUsers/`;
    return this.http.post<VendorListResponse>(url, payload).pipe(
      map(response => {
        if (!response) return { count: 0, users: [] };
        const rawUsers = response.users || [];
        const users: User[] = rawUsers.map(u => this.normalizeListUser(u));
        return { count: response.count ?? users.length, users };
      }),
      catchError(error => {
        console.error('Error in getUsersList:', error);
        return this.handleError(error);
      })
    );
  }

  /** Normalize listUsers item so all keys are present for table; preserves every API key. */
  private normalizeListUser(u: any): User {
    return {
      ...u,
      entityKey: u.entityKey ?? '',
      email: u.email ?? '',
      roles: Array.isArray(u.roles) ? u.roles : [],
      phone: u.phone ?? null,
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      companyName: u.companyName ?? null,
      about: u.about ?? null,
      address: u.address ?? null,
      isActive: !!u.isActive,
      isVerified: !!u.isVerified,
      isDeclined: !!u.isDeclined,
      approvedRoles: Array.isArray(u.approvedRoles) ? u.approvedRoles : [],
      pendingRoles: Array.isArray(u.pendingRoles) ? u.pendingRoles : []
    };
  }

  // Get users with custom filter
  getUsersWithFilter(filter: ListUsersPayload): Observable<User[]> {
    const url = `${this.apiUrl}auth/listUsers/`;
    
    console.log('Get Users With Filter URL:', url);
    console.log('Filter:', filter);
    
    return this.http.post<VendorListResponse>(url, filter).pipe(
      map(response => {
        if (!response || !response.users) {
          return [];
        }
        return response.users.map(user => this.transformUser(user));
      }),
      catchError(error => {
        console.error('Error in getUsersWithFilter:', error);
        return this.handleError(error);
      })
    );
  }

  // Approve user (specifically approve Vendor role)
  approveUser(payload: ApproveUserPayload): Observable<ApiResponse> {
    const url = `${this.apiUrl}auth/approveUser/`;
    
    console.log('Approve User URL:', url);
    console.log('Approve User Payload:', payload);
    
    return this.http.post<ApiResponse>(url, payload).pipe(
      tap(response => {
        console.log('Approve User Response:', response);
      }),
      catchError(error => {
        console.error('Error in approveUser:', error);
        return this.handleError(error);
      })
    );
  }

  // Decline user (specifically decline Vendor role)
  declineUser(payload: DeclineUserPayload): Observable<ApiResponse> {
    const url = `${this.apiUrl}auth/declineUser/`;
    
    const declinePayload = {
      entityKey: payload.entityKey,
      reason: payload.reason || '',
      role: payload.role || 'Vendor',
      isDeclined: true
    };
    
    console.log('Decline User URL:', url);
    console.log('Decline User Payload:', declinePayload);
    
    return this.http.post<ApiResponse>(url, declinePayload).pipe(
      tap(response => {
        console.log('Decline User Response:', response);
      }),
      catchError(error => {
        console.error('Error in declineUser:', error);
        return this.handleError(error);
      })
    );
  }

  // Decline vendor (convenience method)
  declineVendor(entityKey: string, reason?: string): Observable<ApiResponse> {
    return this.declineUser({
      entityKey,
      reason,
      role: 'Vendor'
    });
  }

  // Activate user - FIXED: Use updateUser endpoint with isActive: true
  activateUser(payload: ActivateUserPayload): Observable<ApiResponse> {
    // Use the updateUser endpoint with isActive: true (auth/{entityKey}/updateUser/)
    const url = `${this.apiUrl}auth/${payload.entityKey}/updateUser/`;
    
    // Update payload to set isActive: true
    const activatePayload = {
      isActive: true,
      role: payload.role || 'Vendor'
    };
    
    console.log('Activate User URL:', url);
    console.log('Activate User Payload:', activatePayload);
    console.log('Using PATCH to updateUser endpoint with isActive: true');
    
    return this.http.patch<ApiResponse>(url, activatePayload).pipe(
      tap(response => {
        console.log('Activate User Response:', response);
      }),
      catchError(error => {
        console.error('Error in activateUser:', error);
        return this.handleError(error);
      })
    );
  }

  // Activate vendor (convenience method)
  activateVendor(entityKey: string): Observable<ApiResponse> {
    return this.activateUser({
      entityKey,
      role: 'Vendor'
    });
  }

  // Delete user
  deleteUser(entityKey: string): Observable<ApiResponse> {
    const url = `${this.apiUrl}auth/deleteUser/${entityKey}`;
    
    console.log('Delete User URL:', url);
    
    return this.http.delete<ApiResponse>(url).pipe(
      tap(response => {
        console.log('Delete User Response:', response);
      }),
      catchError(error => {
        console.error('Error in deleteUser:', error);
        return this.handleError(error);
      })
    );
  }

  // Update user (auth/{entityKey}/updateUser/)
  updateUser(entityKey: string, updates: any): Observable<ApiResponse> {
    const url = `${this.apiUrl}auth/${entityKey}/updateUser/`;
    
    console.log('Update User URL:', url);
    console.log('Update User Data:', updates);
    
    return this.http.patch<ApiResponse>(url, updates).pipe(
      tap(response => {
        console.log('Update User Response:', response);
      }),
      catchError(error => {
        console.error('Error in updateUser:', error);
        return this.handleError(error);
      })
    );
  }

  // Create secondary role
  createSecondaryRole(payload: any): Observable<ApiResponse> {
    const url = `${this.apiUrl}auth/createSecondaryRole/`;
    
    console.log('Create Secondary Role URL:', url);
    console.log('Create Secondary Role Payload:', payload);
    
    return this.http.post<ApiResponse>(url, payload).pipe(
      tap(response => {
        console.log('Create Secondary Role Response:', response);
      }),
      catchError(error => {
        console.error('Error in createSecondaryRole:', error);
        return this.handleError(error);
      })
    );
  }

  // Helper method to check if user has Vendor role
  private hasVendorRole(user: User): boolean {
    const hasRole = user.roles?.some(role => role.role === 'Vendor');
    const hasApprovedRole = user.approvedRoles?.includes('Vendor');
    const hasPendingRole = user.pendingRoles?.includes('Vendor');
    
    return hasRole || hasApprovedRole || hasPendingRole;
  }

  // Helper method to transform user data for easier consumption
  private transformUser(user: User): User {
    const vendorRole = user.roles?.find(role => role.role === 'Vendor');
    const isVendorApproved = vendorRole?.isApproved || user.approvedRoles?.includes('Vendor');
    
    const legacyRole = user.roles?.find(r => r.role === 'Vendor')?.role || 'Vendor';
    const legacyIsApproved = isVendorApproved;
    
    const vendorStatus = this.getVendorStatus(user, isVendorApproved);
    
    return {
      ...user,
      isVendor: true,
      vendorStatus: vendorStatus,
      role: legacyRole,
      isApproved: legacyIsApproved,
      phone: user.phone || null,
      companyName: user.companyName || null,
      about: user.about || null,
      address: user.address || null,
      approvedAt: user.approvedAt || undefined,
      approvedBy: user.approvedBy || undefined,
      activatedAt: user.activatedAt || undefined,
      declinedAt: user.declinedAt || undefined,
      rejectionReason: user.rejectionReason || undefined,
      declinedBy: user.declinedBy || undefined,
      createdAt: user.createdAt || new Date().toISOString()
    };
  }

  // Helper method to determine vendor status
  private getVendorStatus(user: User, isVendorApproved: boolean): 'pending' | 'approved' | 'declined' | 'active' {
    if (user.isDeclined) return 'declined';
    if (user.isActive && isVendorApproved) return 'active';
    if (isVendorApproved) return 'approved';
    return 'pending';
  }

  // Get vendor-specific details
  getVendorDetails(user: User): {
    isVendor: boolean;
    isVendorApproved: boolean;
    vendorRole: UserRole | undefined;
    status: string;
    displayStatus: string;
  } {
    const vendorRole = user.roles?.find(role => role.role === 'Vendor');
    const isVendorApproved = vendorRole?.isApproved || user.approvedRoles?.includes('Vendor');
    const status = this.getVendorStatus(user, isVendorApproved);
    
    const statusLabels = {
      'pending': 'Pending Approval',
      'approved': 'Approved (Not Active)',
      'active': 'Active',
      'declined': 'Declined'
    };
    
    return {
      isVendor: this.hasVendorRole(user),
      isVendorApproved: isVendorApproved,
      vendorRole: vendorRole,
      status: status,
      displayStatus: statusLabels[status]
    };
  }

  // Get filtered vendors by status
  getVendorsByStatus(vendors: User[], status: 'pending' | 'approved' | 'declined' | 'active'): User[] {
    return vendors.filter(vendor => vendor.vendorStatus === status);
  }

  // Get vendor by entity key
  getVendorByKey(vendors: User[], entityKey: string): User | undefined {
    return vendors.find(vendor => vendor.entityKey === entityKey);
  }

  // Handle HTTP errors
  private handleError(error: any): Observable<never> {
    console.error('AdminService Error:', error);
    
    let errorMessage = 'An unknown error occurred!';
    
    if (error instanceof HttpErrorResponse) {
      errorMessage = this.getServerErrorMessage(error);
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Get user-friendly error messages
  private getServerErrorMessage(error: HttpErrorResponse): string {
    if (!error) {
      return 'Unknown server error';
    }
    
    let detailedMessage = '';
    if (error.error) {
      if (typeof error.error === 'object') {
        if (error.error.message) {
          detailedMessage = error.error.message;
        } else if (error.error.detail) {
          detailedMessage = error.error.detail;
        } else if (error.error.error) {
          detailedMessage = error.error.error;
        } else if (error.error.errors) {
          detailedMessage = JSON.stringify(error.error.errors);
        }
      } else if (typeof error.error === 'string') {
        detailedMessage = error.error;
      }
    }
    
    console.error('Full error response:', error.error);
    
    let endpointInfo = '';
    if (error.url) {
      if (error.url.includes('listUsers')) {
        endpointInfo = 'listUsers endpoint expects POST: {"isApproved": false, "roles": ["Vendor"]}';
      } else if (error.url.includes('declineUser')) {
        endpointInfo = 'declineUser endpoint expects POST: {"entityKey": "...", "reason": "...", "role": "Vendor", "isDeclined": true}';
      } else if (error.url.includes('approveUser')) {
        endpointInfo = 'approveUser endpoint expects POST: {"entityKey": "...", "isApproved": true, "role": "Vendor"}';
      } else if (error.url.includes('activateUser')) {
        endpointInfo = 'activateUser uses updateUser endpoint with PATCH: {"isActive": true, "role": "Vendor"} to /updateUser/{entityKey}/';
      } else if (error.url.includes('updateUser')) {
        endpointInfo = 'updateUser endpoint expects PATCH: {"isActive": true, "role": "Vendor"} or other user fields';
      }
    }
    
    switch (error.status) {
      case 0:
        return 'Unable to connect to server. Please check your internet connection and ensure the backend server is running.';
      case 400:
        if (error.url && error.url.includes('declineUser')) {
          if (error.error && typeof error.error === 'object') {
            if (error.error.isDeclined) {
              return `Missing required parameter: isDeclined. Please include isDeclined: true in the payload.`;
            }
            const errors = [];
            if (error.error.entityKey) errors.push(`entityKey: ${error.error.entityKey}`);
            if (error.error.reason) errors.push(`reason: ${error.error.reason}`);
            if (error.error.role) errors.push(`role: ${error.error.role}`);
            if (errors.length > 0) {
              return `Validation errors: ${errors.join(', ')}`;
            }
          }
          return detailedMessage || `Bad request (400). declineUser endpoint expects: {"entityKey": "...", "reason": "...", "role": "Vendor", "isDeclined": true}`;
        }
        return detailedMessage || `Bad request (400). ${endpointInfo || 'Please check the payload structure.'}`;
      case 401:
        return 'Unauthorized. Your session may have expired. Please login again.';
      case 403:
        return 'Forbidden. You do not have permission to perform this action.';
      case 404:
        if (error.url && error.url.includes('activateUser')) {
          return `Endpoint not found. Activating a user is done through the updateUser endpoint.`;
        }
        return 'Resource not found. The requested endpoint does not exist.';
      case 405:
        if (error.url && error.url.includes('activateUser')) {
          return `Method not allowed. The activateUser endpoint doesn't exist. Use updateUser endpoint instead.`;
        }
        return `Method not allowed for ${error.url}. The server expects a different HTTP method. ${endpointInfo || ''}`;
      case 409:
        return 'Conflict. The resource already exists or is in an invalid state.';
      case 422:
        return detailedMessage || 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        if (typeof error.error === 'string' && error.error.includes('APPEND_SLASH')) {
          return 'Server configuration error: URL requires trailing slash. Please contact your administrator.';
        }
        return detailedMessage || 'Internal server error. Please try again later.';
      case 502:
        return 'Bad gateway. The server received an invalid response.';
      case 503:
        return 'Service unavailable. The server is temporarily unable to handle the request.';
      case 504:
        return 'Gateway timeout. The request took too long to complete.';
      default:
        return detailedMessage || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
  }

  // Get vendor statistics
  getVendorStatistics(vendors: User[]): {
    total: number;
    pending: number;
    approved: number;
    active: number;
    declined: number;
  } {
    const pending = vendors.filter(v => v.vendorStatus === 'pending').length;
    const approved = vendors.filter(v => v.vendorStatus === 'approved').length;
    const active = vendors.filter(v => v.vendorStatus === 'active').length;
    const declined = vendors.filter(v => v.vendorStatus === 'declined').length;
    
    return {
      total: vendors.length,
      pending,
      approved,
      active,
      declined
    };
  }

  // Format vendor data for display
  formatVendorForDisplay(vendor: User): any {
    const details = this.getVendorDetails(vendor);
    
    return {
      name: `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || 'Unknown',
      email: vendor.email,
      phone: vendor.phone || 'N/A',
      company: vendor.companyName || 'N/A',
      status: details.displayStatus,
      registeredDate: vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A',
      approvedDate: vendor.approvedAt ? new Date(vendor.approvedAt).toLocaleDateString() : null,
      activatedDate: vendor.activatedAt ? new Date(vendor.activatedAt).toLocaleDateString() : null,
      declinedDate: vendor.declinedAt ? new Date(vendor.declinedAt).toLocaleDateString() : null,
      rejectionReason: vendor.rejectionReason,
      entityKey: vendor.entityKey
    };
  }

  // Check if vendor can be approved
  canApproveVendor(vendor: User): boolean {
    return vendor.vendorStatus === 'pending' || vendor.vendorStatus === 'declined';
  }

  // Check if vendor can be activated
  canActivateVendor(vendor: User): boolean {
    return vendor.vendorStatus === 'approved' && !vendor.isActive;
  }

  // Check if vendor can be declined
  canDeclineVendor(vendor: User): boolean {
    return vendor.vendorStatus !== 'declined';
  }

  // Check if vendor can be deleted
  canDeleteVendor(vendor: User): boolean {
    return vendor.vendorStatus === 'declined';
  }

  // Test API connectivity
  testApiConnection(): Observable<any> {
    const url = `${this.apiUrl}auth/health/`;
    console.log('Testing API connection at:', url);
    
    return this.http.get(url).pipe(
      tap(response => {
        console.log('API Connection Test Success:', response);
      }),
      catchError(error => {
        console.error('API Connection Test Failed:', error);
        return throwError(() => new Error('API connection failed'));
      })
    );
  }

  // Test the listUsers endpoint with debugging
  testListUsersEndpoint(): Observable<any> {
    const url = `${this.apiUrl}auth/listUsers/`;
    
    const correctPayload = {
      isApproved: false,
      roles: ["Vendor"]
    };
    
    console.log('Testing endpoint with correct payload:', correctPayload);
    
    return this.http.post(url, correctPayload).pipe(
      tap(response => {
        console.log('Success with correct payload! Response:', response);
      }),
      catchError(error => {
        console.error('Failed with correct payload:', error);
        
        const testPayloads = [
          { roles: ["Vendor"] },
          { isApproved: false },
          { role: "Vendor" },
          { filter: { roles: ["Vendor"] } },
          {}
        ];
        
        console.log('Trying alternative payloads...');
        
        const tests = testPayloads.map(payload => 
          this.http.post(url, payload).pipe(
            tap(res => console.log(`Payload ${JSON.stringify(payload)} worked!`, res)),
            catchError(err => {
              console.log(`Payload ${JSON.stringify(payload)} failed:`, err.status);
              return throwError(() => err);
            })
          )
        );
        
        return new Observable(observer => {
          let completed = 0;
          const errors: any[] = [];
          
          tests.forEach((test, index) => {
            test.subscribe({
              next: (response) => {
                observer.next({
                  success: true,
                  payload: testPayloads[index],
                  response: response
                });
                observer.complete();
              },
              error: (error) => {
                completed++;
                errors.push(error);
                if (completed === tests.length) {
                  observer.error(errors[errors.length - 1]);
                }
              }
            });
          });
        });
      })
    );
  }

  // Try GET request if POST doesn't work
  tryGetRequest(): Observable<any> {
    const url = `${this.apiUrl}auth/listUsers/`;
    console.log('Trying GET request to:', url);
    
    return this.http.get(url).pipe(
      tap(response => {
        console.log('GET request successful:', response);
      }),
      catchError(error => {
        console.error('GET request failed:', error);
        return this.handleError(error);
      })
    );
  }

  // Test activateUser endpoint with different patterns - UPDATED
  testActivateUserEndpoint(entityKey: string): Observable<any> {
    console.log('Testing activateUser endpoint for entityKey:', entityKey);
    
    const testPatterns = [
      { 
        url: `${this.apiUrl}auth/${entityKey}/updateUser/`, 
        method: 'PATCH', 
        payload: { isActive: true, role: 'Vendor' },
        description: 'PATCH to updateUser with isActive: true' 
      },
      { 
        url: `${this.apiUrl}auth/activateUser/`, 
        method: 'PATCH', 
        payload: { entityKey, role: 'Vendor' },
        description: 'PATCH to activateUser' 
      },
      { 
        url: `${this.apiUrl}auth/activateUser/`, 
        method: 'POST', 
        payload: { entityKey, role: 'Vendor' },
        description: 'POST to activateUser' 
      },
      { 
        url: `${this.apiUrl}auth/activateUser/${entityKey}/`, 
        method: 'PATCH', 
        payload: { role: 'Vendor' },
        description: 'PATCH to activateUser with entityKey in URL' 
      },
    ];
    
    const testResults: any[] = [];
    
    return new Observable(observer => {
      let completed = 0;
      
      testPatterns.forEach((pattern, index) => {
        console.log(`Testing pattern ${index + 1}: ${pattern.description}`);
        console.log(`URL: ${pattern.url}, Method: ${pattern.method}`);
        
        let request: Observable<any>;
        switch (pattern.method) {
          case 'PATCH': request = this.http.patch(pattern.url, pattern.payload); break;
          case 'PUT': request = this.http.put(pattern.url, pattern.payload); break;
          case 'POST': request = this.http.post(pattern.url, pattern.payload); break;
          default: request = this.http.post(pattern.url, pattern.payload);
        }
        
        request.subscribe({
          next: (response) => {
            testResults.push({ 
              pattern: pattern.description, 
              success: true, 
              response 
            });
            console.log(`Pattern ${index + 1} successful:`, response);
          },
          error: (error) => {
            testResults.push({ 
              pattern: pattern.description, 
              success: false, 
              error: error.status,
              errorDetails: error.error 
            });
            console.log(`Pattern ${index + 1} failed:`, error.status);
          },
          complete: () => {
            completed++;
            if (completed === testPatterns.length) {
              console.log('All activateUser tests completed:', testResults);
              observer.next(testResults);
              observer.complete();
            }
          }
        });
      });
    });
  }

  // Test declineUser endpoint
  testDeclineUserEndpoint(entityKey: string): Observable<any> {
    const url = `${this.apiUrl}auth/declineUser/`;
    
    const testPayloads = [
      { entityKey, reason: 'Test reason', role: 'Vendor', isDeclined: true },
      { entityKey, reason: 'Test reason', isDeclined: true },
      { entityKey, role: 'Vendor', isDeclined: true },
      { entityKey, reason: 'Test reason', role: 'Vendor' },
    ];
    
    console.log('Testing declineUser endpoint:', url);
    
    const testResults: any[] = [];
    
    return new Observable(observer => {
      let completed = 0;
      
      testPayloads.forEach((payload, index) => {
        console.log(`Trying payload ${index + 1}:`, payload);
        
        this.http.post(url, payload).subscribe({
          next: (response) => {
            testResults.push({ payload, success: true, response });
            console.log(`Payload ${index + 1} successful:`, response);
          },
          error: (error) => {
            testResults.push({ 
              payload, 
              success: false, 
              error: error.status,
              errorDetails: error.error 
            });
            console.log(`Payload ${index + 1} failed:`, error.status, error.error);
          },
          complete: () => {
            completed++;
            if (completed === testPayloads.length) {
              console.log('All declineUser tests completed:', testResults);
              observer.next(testResults);
              observer.complete();
            }
          }
        });
      });
    });
  }
}