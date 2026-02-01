import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { NgChartsModule } from 'ng2-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ThreedModelDirective } from './threed-model.directive';

import { AppComponent } from './app.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CoinzeeComponent } from './pages/coinzee/coinzee.component';
import { ProductColumnsComponent } from './pages/products/product-columns/product-columns.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailsComponent } from './pages/products/product-details/product-details.component';
import { UploadDesignComponent } from './pages/coinzee/upload-design/upload-design.component';
import { TermsComponent } from './pages/terms/terms.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { AuthComponent } from './pages/auth/auth.component';
import { FooterComponent } from './pages/footer/footer.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { HomeComponent } from './pages/home/home.component';
import { CategoryPageComponent } from './pages/category-page/category-page.component';
import { NextPageComponent } from './pages/next-page/next-page.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { LoginComponent } from './login/login.component';
import { SignupPendingDialogComponent } from './login/signup-pending-dialog/signup-pending-dialog.component';
import { DashboardLayoutComponent } from './pages/dashboard-layout/dashboard-layout.component';
import { DashboardUsersComponent } from './pages/dashboard-layout/dashboard-users/dashboard-users.component';
import { DashboardProductsComponent } from './pages/dashboard-layout/dashboard-products/dashboard-products.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    FooterComponent,
    AboutUsComponent,
    DashboardComponent,
    ProductColumnsComponent,
    CoinzeeComponent,
    ProductsComponent,
    ProductDetailsComponent,
    UploadDesignComponent,
    ThreedModelDirective,
    TermsComponent,
    PrivacyComponent,
    HomeComponent,
    CategoryPageComponent,
    NextPageComponent,
    AdminDashboardComponent,
    LoginComponent,
    SignupPendingDialogComponent,
    DashboardLayoutComponent,
    DashboardUsersComponent,
    DashboardProductsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    NgChartsModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDialogModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
