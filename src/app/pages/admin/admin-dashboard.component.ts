import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, User } from '../../../services/admin/admin.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  
  allVendors: User[] = [];
  pendingVendors: User[] = [];
  approvedVendors: User[] = [];
  declinedVendors: User[] = [];
  activeVendors: User[] = [];
  
  isLoading = false;
  selectedTab: 'pending' | 'approved' | 'declined' | 'active' = 'pending';
  
  searchTerm: string = '';
  filterStatus: string = 'all';
  
  selectedVendor: User | null = null;
  selectedVendors: Set<string> = new Set();
  selectAll: boolean = false;
  
  errorMessage: string = '';

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllVendors();
  }

  // Load all vendors with proper error handling
  loadAllVendors(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.adminService.getAllVendors().subscribe({
      next: (vendors: User[]) => {
        console.log('Loaded vendors:', vendors);
        
        this.allVendors = vendors;
        
        // Categorize vendors
        this.categorizeVendors(vendors);
        
        this.isLoading = false;
        
        if (vendors.length === 0) {
          this.showNotification('info', 'No Vendors', 'No vendors found in the system');
        } else {
          this.showNotification('success', 'Loaded', `${vendors.length} vendors loaded successfully`);
        }
      },
      error: (error: Error) => {
        console.error('Load vendors error:', error);
        this.errorMessage = error.message;
        this.showNotification('error', 'Error', error.message);
        this.isLoading = false;
      }
    });
  }

  // Categorize vendors based on status
  private categorizeVendors(vendors: User[]): void {
    this.pendingVendors = vendors.filter(v => v.vendorStatus === 'pending');
    this.approvedVendors = vendors.filter(v => v.vendorStatus === 'approved');
    this.declinedVendors = vendors.filter(v => v.vendorStatus === 'declined');
    this.activeVendors = vendors.filter(v => v.vendorStatus === 'active');
    
    console.log('Categorized vendors:', {
      pending: this.pendingVendors.length,
      approved: this.approvedVendors.length,
      declined: this.declinedVendors.length,
      active: this.activeVendors.length
    });
  }

  // Helper method to get vendor details
  getVendorDetails(vendor: User): any {
    return this.adminService.getVendorDetails(vendor);
  }

  // Approve a vendor
  approveVendor(vendor: User): void {
    const vendorName = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.email;
    
    if (!confirm(`Approve ${vendorName} as Vendor?`)) return;

    const payload = {
      entityKey: vendor.entityKey,
      isApproved: true,
      role: 'Vendor'
    };

    this.adminService.approveUser(payload).subscribe({
      next: (response) => {
        this.showNotification('success', 'Success', 'Vendor approved successfully');
        this.loadAllVendors();
        this.selectedVendor = null;
      },
      error: (error: Error) => {
        this.showNotification('error', 'Error', error.message);
        console.error('Approve vendor error:', error);
      }
    });
  }

  // Reject a vendor
  rejectVendor(vendor: User): void {
    const reason = prompt('Enter rejection reason (optional):');
    
    if (reason === null) return;
    
    const payload = {
      entityKey: vendor.entityKey,
      reason: reason || 'Not specified'
    };

    this.adminService.declineUser(payload).subscribe({
      next: (response) => {
        this.showNotification('warning', 'Vendor Rejected', 'Vendor has been declined');
        this.loadAllVendors();
        this.selectedVendor = null;
      },
      error: (error: Error) => {
        this.showNotification('error', 'Error', error.message);
        console.error('Reject vendor error:', error);
      }
    });
  }

  // Activate a vendor
  activateVendor(vendor: User): void {
    const payload = {
      entityKey: vendor.entityKey
    };

    this.adminService.activateUser(payload).subscribe({
      next: (response) => {
        this.showNotification('success', 'Activated', 'Vendor is now active and can login');
        this.loadAllVendors();
        this.selectedVendor = null;
      },
      error: (error: Error) => {
        this.showNotification('error', 'Error', error.message);
        console.error('Activate vendor error:', error);
      }
    });
  }

  // Delete a vendor
  deleteVendor(vendor: User): void {
    if (!confirm(`Permanently delete ${vendor.email}? This cannot be undone.`)) return;

    this.adminService.deleteUser(vendor.entityKey).subscribe({
      next: (response) => {
        this.showNotification('success', 'Deleted', 'Vendor removed permanently');
        this.loadAllVendors();
        this.selectedVendor = null;
      },
      error: (error: Error) => {
        this.showNotification('error', 'Error', error.message);
        console.error('Delete vendor error:', error);
      }
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

    if (!confirm(`Approve ${selected.length} selected vendors?`)) return;

    const promises = selected.map(vendor => {
      const payload = {
        entityKey: vendor.entityKey,
        isApproved: true,
        role: 'Vendor'
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
        this.showNotification('success', 'Bulk Approved', `${selected.length} vendors approved`);
      }, 1000);
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

  // Helper method to get current vendors based on selected tab
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

  // Search vendors
  searchVendors(): User[] {
    const vendors = this.getCurrentVendors();
    
    if (!this.searchTerm.trim()) {
      return vendors;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    
    return vendors.filter(vendor => 
      vendor.email.toLowerCase().includes(term) ||
      vendor.firstName?.toLowerCase().includes(term) ||
      vendor.lastName?.toLowerCase().includes(term) ||
      vendor.companyName?.toLowerCase().includes(term) ||
      vendor.phone?.includes(term)
    );
  }

  // Notification helper
  private showNotification(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    console.log(`${type.toUpperCase()}: ${title} - ${message}`);
    
    if (type === 'error') {
      this.errorMessage = message;
    } else {
      this.errorMessage = '';
    }
    
    // You can use a toast notification service here
    const alertTitle = type === 'error' ? '❌' : 
                      type === 'warning' ? '⚠️' : 
                      type === 'info' ? 'ℹ️' : '✅';
    
    alert(`${alertTitle} ${title}\n${message}`);
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