import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if user is logged in
    const user = this.authService.getUserInfo();
    
    if (!user) {
      // User is not logged in, redirect to auth page
      this.router.navigate(['/auth']);
      return false;
    }
    
    // Check if user is active
    if (!user.isActive) {
      this.router.navigate(['/auth'], { 
        queryParams: { 
          error: 'Your account is not active. Please contact administrator.' 
        } 
      });
      return false;
    }
    
    // Check if user has any approved roles (having an approved role counts as "verified" for dashboard access)
    if (!user.approvedRoles || user.approvedRoles.length === 0) {
      // If user has pending roles, show pending message
      if (user.pendingRoles && user.pendingRoles.length > 0) {
        this.router.navigate(['/auth'], { 
          queryParams: { 
            pending: true 
          } 
        });
      } else {
        // No roles assigned
        this.router.navigate(['/auth'], { 
          queryParams: { 
            error: 'Your account has no assigned roles. Please contact administrator.' 
          } 
        });
      }
      return false;
    }
    
    // Check role-based access if specific role is required
    const requiredRole = route.data['role'] as string;
    
    if (requiredRole) {
      // Check if user has the required role in approvedRoles
      if (!user.approvedRoles.includes(requiredRole)) {
        // User doesn't have required role, redirect to appropriate dashboard based on their role
        this.redirectToUserDashboard(user);
        return false;
      }
    }
    
    return true;
  }
  
  private redirectToUserDashboard(user: any): void {
    if (user.approvedRoles.includes('SuperAdmin')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (user.approvedRoles.includes('Vendor') || user.approvedRoles.includes('Distributor')) {
      this.router.navigate(['/dashboard']);
    } else {
      // No valid role, redirect to auth
      this.router.navigate(['/auth']);
    }
  }
}

// Optional: Create separate guards for specific roles if needed
@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authService.getUserInfo();
    
    if (!user) {
      this.router.navigate(['/auth']);
      return false;
    }
    
    if (user.approvedRoles && user.approvedRoles.includes('SuperAdmin')) {
      return true;
    }
    
    // Redirect to dashboard layout (Analytics, Users, Products) for non-SuperAdmin
    if (user.approvedRoles && (user.approvedRoles.includes('Vendor') || user.approvedRoles.includes('Distributor'))) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth']);
    }
    
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class VendorGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authService.getUserInfo();
    
    if (!user) {
      this.router.navigate(['/auth']);
      return false;
    }
    
    if (user.approvedRoles && user.approvedRoles.includes('Vendor')) {
      return true;
    }
    
    // Redirect to appropriate dashboard based on user's role
    if (user.approvedRoles && user.approvedRoles.includes('SuperAdmin')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (user.approvedRoles && user.approvedRoles.includes('Distributor')) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth']);
    }
    
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class DistributorGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authService.getUserInfo();
    
    if (!user) {
      this.router.navigate(['/auth']);
      return false;
    }
    
    if (user.approvedRoles && user.approvedRoles.includes('Distributor')) {
      return true;
    }
    
    // Redirect to appropriate dashboard based on user's role
    if (user.approvedRoles && user.approvedRoles.includes('SuperAdmin')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (user.approvedRoles && user.approvedRoles.includes('Vendor')) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth']);
    }
    
    return false;
  }
}