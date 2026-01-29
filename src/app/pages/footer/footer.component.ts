import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @ViewChild('footerSection', { static: true }) footerSection!: ElementRef;

  ngAfterViewInit(): void {
    this.setupFooterAnimation();
  }

  setupFooterAnimation() {
    const footer = this.footerSection.nativeElement;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          footer.classList.add('in-left');
          footer.classList.remove('out-left');
        } else {
          footer.classList.remove('in-left');
          footer.classList.add('out-left');
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(footer);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
