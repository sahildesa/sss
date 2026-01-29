import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { CoinzeeComponent } from './pages/coinzee/coinzee.component';
import { UploadDesignComponent } from './pages/coinzee/upload-design/upload-design.component';
import { TermsComponent } from './pages/terms/terms.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { CategoryPageComponent } from './pages/category-page/category-page.component';
import { AuthComponent } from './pages/auth/auth.component';

// Admin Components
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';

// Auth Guards
import { AuthGuard, SuperAdminGuard } from '../services/auth/auth.guard';
import { LoginComponent } from './login/login.component';

const routes: Routes = [

  /* ================= PUBLIC ROUTES ================= */
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutUsComponent },
  { path: 'coinzee', component: CoinzeeComponent },
  { path: 'upload-design', component: UploadDesignComponent, data: { scrollTop: true } },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'login', component: LoginComponent },

  /* Dynamic Category Page */
  { path: 'category/:name', component: CategoryPageComponent },

  /* ================= ADMIN ROUTES (PROTECTED) ================= */
  {
    path: 'admin',
    canActivate: [AuthGuard, SuperAdminGuard], // Protect entire admin section
    data: { role: 'SuperAdmin' },
    children: [
      { 
        path: 'dashboard', 
        component: AdminDashboardComponent
      },
      // { 
      //   path: 'products', 
      //   component: AdminProductsComponent
      // },
      // { 
      //   path: 'orders', 
      //   component: AdminOrdersComponent
      // },
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full'
      }
    ]
  },

  /* ================= VENDOR ROUTES (PROTECTED) - Add when needed ================= */
  // {
  //   path: 'vendor',
  //   canActivate: [AuthGuard, VendorGuard],
  //   data: { role: 'Vendor' },
  //   children: [
  //     { 
  //       path: 'dashboard', 
  //       component: VendorDashboardComponent
  //     },
  //     { 
  //       path: '', 
  //       redirectTo: 'dashboard', 
  //       pathMatch: 'full'
  //     }
  //   ]
  // },

  /* ================= DISTRIBUTOR ROUTES (PROTECTED) - Add when needed ================= */
  // {
  //   path: 'distributor',
  //   canActivate: [AuthGuard, DistributorGuard],
  //   data: { role: 'Distributor' },
  //   children: [
  //     { 
  //       path: 'dashboard', 
  //       component: DistributorDashboardComponent
  //     },
  //     { 
  //       path: '', 
  //       redirectTo: 'dashboard', 
  //       pathMatch: 'full'
  //     }
  //   ]
  // },

  /* ================= DEFAULT ROUTES ================= */
  { path: '', component: CoinzeeComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
      scrollOffset: [0, 0]
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}