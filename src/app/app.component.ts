import { Component, HostListener, NgZone, Renderer2 } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import gsap from 'gsap';
import * as bootstrap from 'bootstrap';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('navbar3d', { static: false }) navbar3d!: ElementRef;
  private animation!: gsap.core.Tween;
  isNavbarExpanded = false;
  isAuthRoute: boolean = false;
  hover = '';

constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(() => {
        // Wait until Angular finished rendering
        this.ngZone.onStable.subscribe(() => {
          const fragment = this.route.snapshot.fragment;

          if (fragment) {
            // scroll to the fragment element if it exists
            const element = document.getElementById(fragment);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } else {
            // otherwise scroll to top
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          }
        });
      });
  }

  ngAfterViewInit(): void {
    this.animation = gsap.to(this.navbar3d.nativeElement, {
      rotationX: 5,
      scale: 1.03,
      duration: 1.5,
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true,
      paused: true,
      transformOrigin: 'top center',
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.animation.play();
        } else {
          this.animation.pause();
        }
      },
      { threshold: 0.1 } 
    );

    observer.observe(this.navbar3d.nativeElement);
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAuthRoute = event.urlAfterRedirects.includes('/auth');
      }
    });
  }

  navLinks = [
     { path: '/home', label: 'Home' },
    // { path: '/about', label: 'About Us' },
    // { path: '/about', label: 'Our Services' },
    { path: '/coinzee', label: 'Coinzee' },
    { path: '/about', label: 'About Us' },
    { path: '/terms', label: 'Terms' },
    { path: '/privacy', label: 'Privacy' },
   {path:'/login', label:'Login'}
  ];

  aboutUsLinks = [
    { path: "/terms", label: "Terms" },
    { path: "/privacy", label: "Privacy" },
  ];


  shouldShowNavbar(): boolean {
    const url = this.router.url;
    const mode = new URLSearchParams(url.split('?')[1]).get('mode');
    const path = url.split('?')[0];
    const hideOnRoutes = ['/auth', '/auth/OTP'];
    const hideOnModes = ['login', 'signup'];

    const shouldHide =
      hideOnRoutes.includes(path) ||
      (path === '/auth' && hideOnModes.includes(mode ?? '')) ||
      path.startsWith('/admin'); // Hide on all dashboard routes
    return !shouldHide;
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.hover === path;
  }

  shouldShowFooter(): boolean {
    return (
      !this.router.url.startsWith('/auth') &&
      !this.router.url.startsWith('/admin')
    );
  }

  isAuthPageWithoutButtons(): boolean {
    const route = this.router.url;
    return (
      route.includes('/password-reset') || route.includes('/some-other-path')
    );
  }


  toggleNavbar() {
    this.isNavbarExpanded = !this.isNavbarExpanded;
  }

  collapseNavbar() {
    const navbar = document.getElementById('navbarNav');
    if (navbar?.classList.contains('show')) {
      const bsCollapse = new bootstrap.Collapse(navbar, { toggle: false });
      bsCollapse.hide();  // ✅ force hide when clicking close or link
    }
  }

  navigateToAuth(): void {
    this.collapseNavbar(); // if needed
    this.router.navigate(['/auth'] );
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const navbar = document.querySelector('.sticky-navbar');
    if (window.scrollY > 10) {
      navbar?.classList.add('stuck');
    } else {
      navbar?.classList.remove('stuck');
    }
  }

}
