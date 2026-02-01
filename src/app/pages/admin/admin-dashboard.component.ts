import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminService, User, VendorListResponse } from '../../../services/admin/admin.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Product } from '../products/product';

type UserStatus = 'pending' | 'approved' | 'active' | 'declined';

/** All API user keys as table columns (Vendor, Distributor, SuperAdmin – all users). */
export const ADMIN_TABLE_COLUMNS: (keyof User)[] = [
  'entityKey',
  'email',
  'firstName',
  'lastName',
  'companyName',
  'phone',
  'roles',
  'approvedRoles',
  'pendingRoles',
  'about',
  'address',
  'isActive',
  'isVerified',
  'isDeclined'
];

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  
  /** All users from listUsers API (Vendor, Distributor, SuperAdmin – every role). */
  allUsers: User[] = [];
  totalCount = 0;

  /** Categorized by status (all users, not only Vendor). */
  allVendors: User[] = [];
  pendingVendors: User[] = [];
  approvedVendors: User[] = [];
  declinedVendors: User[] = [];
  activeVendors: User[] = [];

  displayedColumns = ADMIN_TABLE_COLUMNS;

  /** Sidebar: 'users' = all user-related info, 'products' = all products-related info */
  adminSection: 'users' | 'products' = 'users';
  
  isLoading = false;
  selectedTab: 'pending' | 'approved' | 'declined' | 'active' = 'pending';
  
  searchTerm: string = '';
  filterStatus: string = 'all';

  /** Sort: column key or null, direction */
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  /** Mobile: sidebar open/closed */
  sidebarOpen = false;
  
  selectedVendor: User | null = null;
  selectedVendors: Set<string> = new Set();
  selectAll: boolean = false;

  /** Update user modal */
  userToUpdate: User | null = null;
  updateFirstName = '';
  updateLastName = '';
  updateCompanyName = '';
  updatePhone = '';
  updateAddress = '';
  updateAbout = '';
  updateSaving = false;
  
  errorMessage: string = '';

  /** Products section (wire to products API when ready) */
  products: Product[] = [];
  productsLoading = false;
  productCount = 0;
  inStockCount = 0;
  lowStockCount = 0;
  outOfStockCount = 0;

  constructor(
    private adminService: AdminService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllUsers();
  }

  /** Bind all users from AdminService.getUsersList() – no role filter; all users irrespective of role. */
  loadAllUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService.getUsersList({}).subscribe({
      next: (response: VendorListResponse) => {
        this.totalCount = response.count ?? 0;
        this.allUsers = response.users ?? [];
        const withStatus = this.assignStatusToAllUsers(this.allUsers);
        this.allVendors = withStatus;
        this.categorizeUsers(withStatus);
        this.isLoading = false;
        //this.showNotification('success', 'Loaded', `${this.totalCount} users (all roles)`);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.showNotification('error', 'Error', error.message);
        this.allUsers = [];
        this.allVendors = [];
        this.categorizeUsers([]);
        this.isLoading = false;
      }
    });
  }

  loadAllVendors(): void {
    this.loadAllUsers();
  }

  /** Load products for Products tab (placeholder – wire to products API when ready) */
  loadProducts(): void {
    this.productsLoading = true;
    this.products = [];
    this.productCount = 0;
    this.inStockCount = 0;
    this.lowStockCount = 0;
    this.outOfStockCount = 0;
    // TODO: call products API and set this.products, then compute counts
    setTimeout(() => {
      this.productsLoading = false;
      this.productCount = this.products.length;
      this.inStockCount = this.products.filter(p => p.availability === 'In stock').length;
      this.lowStockCount = this.products.filter(p => p.availability === 'Low stock').length;
      this.outOfStockCount = this.products.filter(p => p.availability === 'Out of stock').length;
    }, 300);
  }

  /** Assign status to every user (Vendor, Distributor, SuperAdmin) from API keys. */
  private assignStatusToAllUsers(users: User[]): User[] {
    return users.map(u => ({
      ...u,
      vendorStatus: this.computeUserStatus(u)
    }));
  }

  private computeUserStatus(u: User): UserStatus {
    if (u.isDeclined) return 'declined';
    const hasApproved = (u.approvedRoles?.length ?? 0) > 0;
    if (u.isActive && hasApproved) return 'active';
    if (hasApproved) return 'approved';
    return 'pending';
  }

  private categorizeUsers(users: User[]): void {
    this.pendingVendors = users.filter(v => v.vendorStatus === 'pending');
    this.approvedVendors = users.filter(v => v.vendorStatus === 'approved');
    this.declinedVendors = users.filter(v => v.vendorStatus === 'declined');
    this.activeVendors = users.filter(v => v.vendorStatus === 'active');
  }

  formatArray(value: string[] | null | undefined): string {
    if (!value || !Array.isArray(value)) return '–';
    return value.length ? value.join(', ') : '–';
  }

  formatRoles(roles: { role?: string; isApproved?: boolean }[] | null | undefined): string {
    if (!roles || !Array.isArray(roles)) return '–';
    if (roles.length === 0) return '–';
    return roles.map(r => `${r?.role ?? ''} (${r?.isApproved ? 'approved' : 'pending'})`).filter(Boolean).join(', ');
  }

  /** Primary role label for button text (Vendor, Distributor, SuperAdmin, etc.). */
  getRoleLabel(user: User | null): string {
    if (!user) return 'User';
    if (user.approvedRoles?.length) return user.approvedRoles[0];
    if (user.pendingRoles?.length) return user.pendingRoles[0];
    const first = user.roles?.[0]?.role;
    return first || 'User';
  }

  /** True if user has SuperAdmin role (edit is not allowed for SuperAdmin). */
  isSuperAdmin(user: User | null): boolean {
    if (!user) return false;
    const check = (r: string) => r?.toLowerCase() === 'superadmin';
    if (user.approvedRoles?.some(check)) return true;
    if (user.pendingRoles?.some(check)) return true;
    if (user.roles?.some(r => check(r?.role ?? ''))) return true;
    return false;
  }

  // Helper method to get vendor details
  getVendorDetails(vendor: User): any {
    return this.adminService.getVendorDetails(vendor);
  }

  // Approve a vendor
  approveVendor(vendor: User): void {
    const vendorName = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.email;

    const roleLabel = this.getRoleLabel(vendor);
    Swal.fire({
      title: 'Approve user?',
      text: `Approve ${vendorName} as ${roleLabel}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, approve'
    }).then((result) => {
      if (!result.isConfirmed) return;

      const payload = {
        entityKey: vendor.entityKey,
        isApproved: true,
        role: roleLabel
      };

      this.adminService.approveUser(payload).subscribe({
        next: () => {
          this.showNotification('success', 'Success', `${roleLabel} approved successfully`);
          this.loadAllVendors();
          this.selectedVendor = null;
        },
        error: (error: Error) => {
          this.showNotification('error', 'Error', error.message);
          console.error('Approve vendor error:', error);
        }
      });
    });
  }

  // Reject a vendor
  rejectVendor(vendor: User): void {
    const vendorName = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.email;

    Swal.fire({
      title: 'Reject user?',
      text: `Reject ${vendorName}? Enter reason (optional):`,
      icon: 'warning',
      input: 'textarea',
      inputPlaceholder: 'Rejection reason (optional)',
      inputValue: '',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Reject'
    }).then((result) => {
      if (!result.isConfirmed) return;

      const payload = {
        entityKey: vendor.entityKey,
        reason: (result.value && String(result.value).trim()) || 'Not specified'
      };

      this.adminService.declineUser(payload).subscribe({
        next: () => {
          this.showNotification('warning', `${this.getRoleLabel(vendor)} Rejected`, `${this.getRoleLabel(vendor)} has been declined`);
          this.loadAllVendors();
          this.selectedVendor = null;
        },
        error: (error: Error) => {
          this.showNotification('error', 'Error', error.message);
          console.error('Reject vendor error:', error);
        }
      });
    });
  }

  // Activate a vendor
  activateVendor(vendor: User): void {
    const vendorName = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.email;

    Swal.fire({
      title: 'Activate user?',
      text: `Activate ${vendorName}? They will be able to login.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, activate'
    }).then((result) => {
      if (!result.isConfirmed) return;

      const payload = { entityKey: vendor.entityKey };

      this.adminService.activateUser(payload).subscribe({
        next: () => {
          this.showNotification('success', 'Activated', `${this.getRoleLabel(vendor)} is now active and can login`);
          this.loadAllVendors();
          this.selectedVendor = null;
        },
        error: (error: Error) => {
          this.showNotification('error', 'Error', error.message);
          console.error('Activate vendor error:', error);
        }
      });
    });
  }

  // Delete a vendor
  deleteVendor(vendor: User): void {
    Swal.fire({
      title: 'Delete permanently?',
      text: `Delete ${vendor.email}? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.adminService.deleteUser(vendor.entityKey).subscribe({
        next: () => {
          this.showNotification('success', 'Deleted', `${this.getRoleLabel(vendor)} removed permanently`);
          this.loadAllVendors();
          this.selectedVendor = null;
        },
        error: (error: Error) => {
          this.showNotification('error', 'Error', error.message);
          console.error('Delete vendor error:', error);
        }
      });
    });
  }

  // Bulk approve vendors
  bulkApprove(): void {
    const currentVendors = this.getCurrentVendors();
    const selected = currentVendors.filter(v => v.selected);

    if (selected.length === 0) {
      this.showNotification('warning', 'No Selection', 'Please select vendors to approve');
      return;
    }

    Swal.fire({
      title: 'Bulk approve?',
      text: `Approve ${selected.length} selected vendor(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, approve all'
    }).then((result) => {
      if (!result.isConfirmed) return;

      const promises = selected.map(vendor => {
        const payload = {
          entityKey: vendor.entityKey,
          isApproved: true,
          role: this.getRoleLabel(vendor)
        };

        return new Promise((resolve, reject) => {
          this.adminService.approveUser(payload).subscribe({
            next: () => {
              vendor.selected = false;
              this.selectedVendors.delete(vendor.entityKey);
              resolve(true);
            },
            error: (error: Error) => {
              this.showNotification('error', 'Error', `Failed to approve ${vendor.email}: ${error.message}`);
              reject(error);
            }
          });
        });
      });

      Promise.all(promises).then(() => {
        setTimeout(() => {
          this.loadAllVendors();
          this.selectAll = false;
          this.showNotification('success', 'Bulk Approved', `${selected.length} user(s) approved`);
        }, 1000);
      });
    });
  }

  // View vendor details
  viewVendorDetails(vendor: User): void {
    this.selectedVendor = vendor;
  }

  // Close details view
  closeDetails(): void {
    this.selectedVendor = null;
  }

  // Open update user modal
  openUpdateModal(user: User): void {
    this.userToUpdate = user;
    this.updateFirstName = user.firstName ?? '';
    this.updateLastName = user.lastName ?? '';
    this.updateCompanyName = user.companyName ?? '';
    this.updatePhone = user.phone ?? '';
    this.updateAddress = user.address ?? '';
    this.updateAbout = user.about ?? '';
  }

  // Close update user modal
  closeUpdateModal(): void {
    this.userToUpdate = null;
    this.updateSaving = false;
  }

  // Save updated user (PATCH updateUser with entityKey in URL)
  saveUpdateUser(): void {
    const user = this.userToUpdate;
    if (!user?.entityKey) return;

    const payload = {
      firstName: this.updateFirstName?.trim() ?? '',
      lastName: this.updateLastName?.trim() ?? '',
      companyName: this.updateCompanyName?.trim() ?? '',
      phone: this.updatePhone?.trim() ?? '',
      address: this.updateAddress?.trim() ?? '',
      about: this.updateAbout?.trim() ?? ''
    };

    this.updateSaving = true;
    this.adminService.updateUser(user.entityKey, payload).subscribe({
      next: () => {
        this.showNotification('success', 'Updated', 'User information updated successfully');
        this.closeUpdateModal();
        this.loadAllVendors();
        if (this.selectedVendor?.entityKey === user.entityKey) {
          const updated = this.allUsers.find(u => u.entityKey === user.entityKey);
          if (updated) this.selectedVendor = { ...updated, vendorStatus: this.computeUserStatus(updated) };
        }
      },
      error: (error: Error) => {
        this.updateSaving = false;
        this.showNotification('error', 'Error', error.message);
      }
    });
  }

  /** Current tab users with search + sort applied – for table rows. */
  getTabUsers(): User[] {
    let list = this.searchVendors();
    if (this.sortColumn) {
      list = [...list].sort((a, b) => this.compareUser(a, b, this.sortColumn!, this.sortDirection));
    }
    return list;
  }

  setSort(col: string): void {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

  private compareUser(a: User, b: User, col: string, dir: 'asc' | 'desc'): number {
    const va = this.getUserCellValue(a, col);
    const vb = this.getUserCellValue(b, col);
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return dir === 'asc' ? cmp : -cmp;
  }

  private getUserCellValue(u: User, col: string): string | number {
    const v = (u as any)[col];
    if (col === 'roles') return this.formatRoles(u.roles);
    if (Array.isArray(v)) return (v as string[]).join(', ') || '';
    if (typeof v === 'boolean') return v ? '1' : '0';
    return (v ?? '') + '';
  }

  private getCurrentVendors(): User[] {
    switch (this.selectedTab) {
      case 'pending': return this.pendingVendors;
      case 'approved': return this.approvedVendors;
      case 'declined': return this.declinedVendors;
      case 'active': return this.activeVendors;
      default: return [];
    }
  }

  // Toggle select all vendors in current tab
  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.selectAll = checked;
    
    const currentVendors = this.getCurrentVendors();
    
    if (checked) {
      currentVendors.forEach(vendor => {
        vendor.selected = true;
        this.selectedVendors.add(vendor.entityKey);
      });
    } else {
      currentVendors.forEach(vendor => {
        vendor.selected = false;
        this.selectedVendors.delete(vendor.entityKey);
      });
    }
  }

  // Select/deselect individual vendor
  onSelectVendor(vendor: User): void {
    vendor.selected = !vendor.selected;
    
    if (vendor.selected) {
      this.selectedVendors.add(vendor.entityKey);
    } else {
      this.selectedVendors.delete(vendor.entityKey);
    }
    
    // Update selectAll checkbox state
    const currentVendors = this.getCurrentVendors();
    this.selectAll = currentVendors.length > 0 && 
                     currentVendors.every(v => v.selected);
  }

  // Search all fields of users table
  searchVendors(): User[] {
    const vendors = this.getCurrentVendors();
    if (!this.searchTerm.trim()) return vendors;

    const term = this.searchTerm.toLowerCase().trim();
    return vendors.filter(u => {
      const email = (u.email || '').toLowerCase();
      const firstName = (u.firstName || '').toLowerCase();
      const lastName = (u.lastName || '').toLowerCase();
      const companyName = (u.companyName || '').toLowerCase();
      const phone = (u.phone || '') + '';
      const entityKey = (u.entityKey || '').toLowerCase();
      const rolesStr = this.formatRoles(u.roles).toLowerCase();
      const approvedStr = this.formatArray(u.approvedRoles).toLowerCase();
      const pendingStr = this.formatArray(u.pendingRoles).toLowerCase();
      const about = (u.about || '').toLowerCase();
      const address = (u.address || '').toLowerCase();
      const active = u.isActive ? 'yes' : 'no';
      const verified = u.isVerified ? 'yes' : 'no';
      const declined = u.isDeclined ? 'yes' : 'no';
      return email.includes(term) || firstName.includes(term) || lastName.includes(term) ||
        companyName.includes(term) || phone.includes(term) || entityKey.includes(term) ||
        rolesStr.includes(term) || approvedStr.includes(term) || pendingStr.includes(term) ||
        about.includes(term) || address.includes(term) || active.includes(term) ||
        verified.includes(term) || declined.includes(term);
    });
  }

  // Notification helper – uses SweetAlert2
  private showNotification(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    if (type === 'error') {
      this.errorMessage = message;
    } else {
      this.errorMessage = '';
    }

    Swal.fire({
      title,
      text: message,
      icon: type,
      confirmButtonColor: type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#198754'
    });
  }

  getInitials(user: { firstName?: string; lastName?: string; email?: string } | null): string {
    if (!user) return '?';
    const first = (user.firstName || '').trim().charAt(0);
    const last = (user.lastName || '').trim().charAt(0);
    if (first || last) return (first + last).toUpperCase() || (user.email || '?').charAt(0).toUpperCase();
    return (user.email || '?').charAt(0).toUpperCase();
  }

  getCurrentUserLabel(): string {
    const u = this.authService.getCurrentUser();
    if (!u) return '';
    const name = ((u.firstName || '') + ' ' + (u.lastName || '')).trim();
    return name ? `${name} · ${u.email}` : (u.email || '');
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  // Clear error messages
  clearError(): void {
    this.errorMessage = '';
  }
}