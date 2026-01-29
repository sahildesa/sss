import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements AfterViewInit, OnDestroy {

  @ViewChild('container') container!: ElementRef;
  isSignUpMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isPendingApproval: boolean = false;

  loginForm!: FormGroup;
  signupForm!: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.initializeForms();
    
    // Check query params for pending approval message
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['pending'] === 'true') {
          this.isPendingApproval = true;
          this.errorMessage = 'Your account is pending admin approval. You will be notified once approved.';
        }
      });

    // Check if user is already logged in
    if (this.authService.isLoggedIn$) {
      const user = this.authService.getCurrentUser();
      if (user && user.approvedRoles && user.approvedRoles.length > 0) {
        this.navigateBasedOnRole(user);
      }
    }
  }

  private initializeForms(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });

    this.signupForm = new FormGroup({
      role: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', Validators.required),
      agreeTerms: new FormControl(false, Validators.requiredTrue)
    });

    this.signupForm.setValidators(this.passwordMatchValidator());
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const form = control as FormGroup;
      const password = form.get('password');
      const confirmPassword = form.get('confirmPassword');

      if (!password || !confirmPassword || password.value === null || confirmPassword.value === null) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ mismatch: true });
        return { 'passwordsMismatch': true };
      } else {
        if (confirmPassword.hasError('mismatch')) {
          confirmPassword.setErrors(null);
        }
        return null;
      }
    };
  }

  ngAfterViewInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const mode = params['mode'];
        this.isSignUpMode = (mode === 'signup');
        if (this.container && this.container.nativeElement) {
          if (this.isSignUpMode) {
            this.container.nativeElement.classList.add('sign-up-mode');
          } else {
            this.container.nativeElement.classList.remove('sign-up-mode');
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  switchToSignUp(): void {
    this.isSignUpMode = true;
    this.isPendingApproval = false;
    if (this.container && this.container.nativeElement) {
      this.container.nativeElement.classList.add('sign-up-mode');
    }
    this.clearMessages();
  }

  switchToSignIn(): void {
    this.isSignUpMode = false;
    this.isPendingApproval = false;
    if (this.container && this.container.nativeElement) {
      this.container.nativeElement.classList.remove('sign-up-mode');
    }
    this.clearMessages();
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.clearMessages();
      
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            
            if (response.user) {
              this.handleLoginResponse(response.user);
            } else {
              this.errorMessage = response.message || 'Login failed. Please try again.';
            }
          },
          error: (error) => {
            this.isLoading = false;
            
            if (error.status === 401) {
              this.errorMessage = 'Invalid email or password';
               this.router.navigate(['/admin'] );
            } else if (error.status === 403) {
              this.errorMessage = 'Account not approved yet. Please wait for admin approval.';
            } else if (error.status === 400) {
              this.errorMessage = error.error?.message || 'Invalid request';
            } else {
              this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
            }
          }
        });
    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields correctly';
    }
  }

  onSignUpSubmit(): void {
    this.signupForm.updateValueAndValidity();

    if (this.signupForm.valid) {
      this.isLoading = true;
      this.clearMessages();
      
      const formData = this.signupForm.value;
      
      this.authService.signup(formData)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            
            if (response.success) {
              this.successMessage = 'Registration successful! Your account is pending admin approval.';
              
              // Switch to login mode after successful registration
              setTimeout(() => {
                this.switchToSignIn();
                this.signupForm.reset();
              }, 3000);
            } else {
              this.errorMessage = response.message || 'Registration failed. Please try again.';
            }
          },
          error: (error) => {
            this.isLoading = false;
            
            if (error.status === 400) {
              this.errorMessage = error.error?.message || 'User with this email already exists.';
            } else if (error.status === 500) {
              this.errorMessage = 'Server error. Please try again later.';
            } else {
              this.errorMessage = error.error?.message || 'An error occurred during registration. Please try again.';
            }
          }
        });
    } else {
      this.signupForm.markAllAsTouched();
      
      if (this.signupForm.hasError('passwordsMismatch')) {
        this.errorMessage = 'Passwords do not match';
      } else if (!this.signupForm.get('agreeTerms')?.value) {
        this.errorMessage = 'You must agree to the terms and conditions';
      } else {
        this.errorMessage = 'Please fill in all required fields correctly';
      }
    }
  }

  private handleLoginResponse(user: any): void {
    // Check if user has approved roles
    if (user.approvedRoles && user.approvedRoles.length > 0) {
      this.navigateBasedOnRole(user);
    } else if (user.pendingRoles && user.pendingRoles.length > 0) {
      // User has pending approval
      this.isPendingApproval = true;
      this.errorMessage = 'Your account is pending admin approval. You will be notified once approved.';
    } else {
      // No roles assigned
      this.errorMessage = 'Your account has no assigned roles. Please contact administrator.';
    }
  }

  private navigateBasedOnRole(user: any): void {
    if (user.approvedRoles.includes('SuperAdmin')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (user.approvedRoles.includes('Vendor')) {
      this.router.navigate(['/vendor/dashboard']);
    } else if (user.approvedRoles.includes('Distributor')) {
      this.router.navigate(['/distributor/dashboard']);
    } else {
      this.errorMessage = 'No dashboard available for your role. Please contact administrator.';
    }
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isPendingApproval = false;
  }

  onForgotPassword(): void {
    // Implement forgot password functionality
    console.log('Forgot password clicked');
    // You can navigate to forgot password page or show a modal
    this.errorMessage = 'Forgot password functionality coming soon';
  }
}