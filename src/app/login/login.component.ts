import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService, SignupPayload } from '../../services/auth/auth.service';
import { SignupPendingDialogComponent } from './signup-pending-dialog/signup-pending-dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements AfterViewInit, OnDestroy {

  @ViewChild('container') container!: ElementRef;
  isSignUpMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isPendingApproval: boolean = false;
  /** True after user has attempted signup submit; used to show confirm-password errors only after submit */
  signupSubmitAttempted: boolean = false;

  loginForm!: FormGroup;
  signupForm!: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
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
      phone: new FormControl(''),
      companyName: new FormControl(''),
      address: new FormControl(''),
      about: new FormControl(''),
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
    this.signupSubmitAttempted = false;
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
      console.log('Login Payload', this.loginForm.value);

      this.authService.login(email, password)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            
            if (response.user) {
              const user = response.user;
              if (user.approvedRoles && user.approvedRoles.length > 0) {
                this.navigateBasedOnRole(user);
              } else if (user.pendingRoles && user.pendingRoles.length > 0) {
                this.isPendingApproval = true;
                this.errorMessage = 'Your account is pending admin approval. You will be notified once approved.';
              } else {
                this.errorMessage = 'Your account has no assigned roles. Please contact administrator.';
              }
            } else {
              this.errorMessage = response.message || 'Login failed. Please try again.';
            }
          },
          error: (error) => {
            this.isLoading = false;
            
            if (error.status === 401) {
              this.errorMessage = 'Invalid email or password';
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

  /** Signup API binding: build SignupPayload from form and call AuthService.signup(). */
  onSignUpSubmit(): void {
    this.signupSubmitAttempted = true;
    this.signupForm.updateValueAndValidity();

    if (this.signupForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      const formData = this.signupForm.value;
      const nameParts = (formData.username || '').trim().split(/\s+/);
      const signupPayload: SignupPayload = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone || '',
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        companyName: formData.companyName || '',
        address: formData.address || '',
        about: formData.about || ''
      };

      this.authService.signup(signupPayload).subscribe({
        next: (response) => {
          this.isLoading = false;
          // API returns { message, user } on success – treat as success when user is present
          if (response && response.user != null) {
            const dialogRef = this.dialog.open(SignupPendingDialogComponent, {
              width: '420px',
              disableClose: false
            });
            dialogRef.afterClosed().subscribe(() => {
              this.switchToSignIn();
              this.signupForm.reset();
            });
          } else if (response && response.message) {
            this.errorMessage = response.message;
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          const body = error?.error;
          if (error?.status === 400) {
            this.errorMessage = (body?.message) || body?.email?.[0] || 'User with this email already exists.';
          } else if (error?.status === 500) {
            const msg = typeof body === 'string' ? body : (body?.error || body?.message);
            if (msg && typeof msg === 'string' && msg.includes('User may already exist')) {
              this.errorMessage = 'User may already exist';
            } else {
              this.errorMessage = msg || 'Server error. Please try again later.';
            }
          } else {
            this.errorMessage = (typeof body === 'string' ? body : (body?.message || body?.error)) || 'An error occurred during registration. Please try again.';
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

  private navigateBasedOnRole(user: any): void {
    if (user.approvedRoles.includes('SuperAdmin')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (user.approvedRoles.includes('Vendor') || user.approvedRoles.includes('Distributor')) {
      // Dashboard layout with Analytics, Users, Products tabs
      this.router.navigate(['/dashboard']);
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