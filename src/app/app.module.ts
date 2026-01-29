import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { NgChartsModule } from 'ng2-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    NgChartsModule,
    RouterModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
