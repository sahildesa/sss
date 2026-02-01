import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AdminService, User, VendorListResponse } from '../../../../services/admin/admin.service';

/** All API user keys – patch with: this.dataSource.data = response.users; this.count = response.count; */
export const USERS_TABLE_COLUMNS: (keyof User)[] = [
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
  selector: 'app-dashboard-users',
  templateUrl: './dashboard-users.component.html',
  styleUrls: ['./dashboard-users.component.scss']
})
export class DashboardUsersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  /** API response shape – when API is bound, set dataSource.data = response.users and count = response.count */
  count = 0;
  dataSource = new MatTableDataSource<User>([]);
  displayedColumns = USERS_TABLE_COLUMNS;
  isLoading = false;
  errorMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (row: User, prop: string) => {
      const val = (row as any)[prop];
      if (prop === 'roles' && Array.isArray(val)) return this.formatRoles(val).replace(/,/g, ' ');
      if (Array.isArray(val)) return (val as string[]).join(', ') || '';
      if (typeof val === 'boolean') return val ? '1' : '0';
      return val ?? '';
    };
  }

  /** Load users from API. All response.users are patched to the table with all keys. */
  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService.getUsersList({}).subscribe({
      next: (response: VendorListResponse) => {
        this.count = response.count ?? 0;
        this.dataSource.data = response.users ?? [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || err?.message || 'Failed to load users.';
        this.dataSource.data = [];
        this.count = 0;
        this.isLoading = false;
      }
    });
  }

  /** Display array fields (e.g. approvedRoles, pendingRoles) as comma-separated. */
  formatArray(value: string[] | null | undefined): string {
    if (!value || !Array.isArray(value)) return '–';
    return value.length ? value.join(', ') : '–';
  }

  /** Display roles array ({ role, isApproved }[]) as "Role (approved/pending), ...". */
  formatRoles(roles: { role?: string; isApproved?: boolean }[] | null | undefined): string {
    if (!roles || !Array.isArray(roles)) return '–';
    if (roles.length === 0) return '–';
    return roles.map(r => `${r?.role ?? ''} (${r?.isApproved ? 'approved' : 'pending'})`).filter(Boolean).join(', ');
  }
}
