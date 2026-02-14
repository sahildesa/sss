import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /** True if current user is SuperAdmin (show Users tab only for SuperAdmin). */
  get isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  onLogout(): void {
    this.authService.logoutApi().subscribe({
      next: () => this.authService.logout(),
      error: () => this.authService.logout() // Clear session and redirect even if API fails
    });
  }
}
