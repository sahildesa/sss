import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ViewChildren, QueryList, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as bootstrap from 'bootstrap';
import { HttpClient } from '@angular/common/http';


gsap.registerPlugin(ScrollTrigger);

export interface Product {
  name: string;
  image: string;
  model: string;
}

@Component({
  selector: 'app-coinzee',
  templateUrl: './coinzee.component.html',
  styleUrls: ['./coinzee.component.scss']
})
export class CoinzeeComponent implements OnInit, AfterViewInit, OnDestroy {
  showTrademarkPopup: boolean = false;
  currentSlide = 0;
  slideInterval: any;
  activeCategory: string = 'Popular';
  uploadedImage: string | ArrayBuffer | null = null;
  hoveredCard: any = null;
  hoveredVideo: string | null = null;
  enquiryForm: FormGroup;
  currentStep = 1;
  hoveredCategory: string | null = null;
  showPopup: boolean = false;
  showControls: boolean = true;
  isPlaying: boolean = false;
  currentTime = '00:00';
  duration = '00:00';
  selectedProduct: Product | null = null;
  showPersonalizePopup: boolean = false;
  showEnquiryForm: boolean = false;
  imageFile!: File;
  private moldImagesAnimated = false; // Added back for the animateMoldImagesOnce method
  previewUrl: string | ArrayBuffer | null | undefined = null;
  countryCodes: { cca2: string; phoneCode: string }[] = [];

  uploadedFiles: string[] = [];

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement> | undefined;
  @ViewChild('progressBar') progressBar!: ElementRef<HTMLInputElement> | undefined;
  @ViewChildren('productCard', { read: ElementRef }) productCards!: QueryList<ElementRef> | undefined;
  @ViewChildren('animatedSections', { read: ElementRef }) animatedSections!: QueryList<ElementRef> | undefined;

  @ViewChild('navbar3d', { static: false }) navbar3d!: ElementRef | undefined;
  @ViewChild('makingSection', { static: true }) makingSection!: ElementRef | undefined;
  @ViewChild('featuresSection', { static: true }) featuresSection!: ElementRef | undefined;
  @ViewChild('moldSection', { static: true }) moldSection!: ElementRef | undefined;
  @ViewChild('mainMoldImage', { static: false }) mainMoldImage!: ElementRef | undefined;
  @ViewChild('additionalMoldImage', { static: false }) additionalMoldImage!: ElementRef | undefined;
  @ViewChild('craftedSection', { static: true }) craftedSection!: ElementRef | undefined;
  @ViewChild('productSection', { static: true }) productSection!: ElementRef | undefined;
  @ViewChild('personalizeSection', { static: true }) personalizeSection!: ElementRef | undefined;
  @ViewChild('clientSection', { static: true }) clientSection!: ElementRef | undefined;
  @ViewChild('bannerSection', { static: true }) bannerSection!: ElementRef | undefined;
  @ViewChild('topSection', { static: true }) topSection!: ElementRef | undefined;

  sectionOrder: { name: string; dir: string }[] = [];

  // Data
  features = [
    { icon: 'fa-solid fa-lock', title: 'Security', description: 'Military-grade encryption and multi-factor authentication for enhanced security.' },
    { icon: 'fa-solid fa-wallet', title: 'Crypto Wallets', description: 'Easily manage your digital assets with our secure and user-friendly wallets.' },
    { icon: 'fa-solid fa-sync', title: 'Real-Time Sync', description: 'Your data stays updated across all your devices in real-time.' },
    { icon: 'fa-solid fa-chart-line', title: 'Market Analysis', description: 'Get real-time charts and analysis to make informed investment decisions.' },
    { icon: 'fa-solid fa-mobile-alt', title: 'Mobile App', description: 'Access your portfolio on the go with our fully featured mobile application.' },
    { icon: 'fa-solid fa-coins', title: 'Multi-Currency Support', description: 'Supports all major cryptocurrencies including Bitcoin, Ethereum, and more.' },
    { icon: 'fa-solid fa-shield-alt', title: 'Insurance', description: 'Your assets are insured up to $250,000 against online threats and breaches.' },
    { icon: 'fa-solid fa-clock', title: '24/7 Support', description: 'Our support team is available round-the-clock to assist you.' }
  ];

  features1 = [
    { icon: 'fas fa-box', title: 'CUSTOMIZABLE', description: 'Trademarked and Patented Coin', colorClass: 'text-warning' },
    { icon: 'fas fa-cubes', title: 'PRECISION', description: 'Finest molding in the industry', colorClass: 'text-info' },
    { icon: 'fas fa-gem', title: 'EMBELLISHED', description: 'Classy Metal Coin', colorClass: 'text-info' },
    { icon: 'fas fa-certificate', title: 'TRADEMARKED', description: '100% protected', colorClass: 'text-success' },
    { icon: 'fas fa-star', title: 'UNIQUE', description: 'Unmatchable identity', colorClass: 'text-warning' },
    { icon: 'fas fa-glass-cheers', title: 'LUXURY', description: 'Refreshing & Elegant', colorClass: 'text-light' },
    { icon: 'fas fa-th', title: 'VARIETY', description: 'Many styles', colorClass: 'text-info' },
    { icon: 'fas fa-chart-line', title: '5 BILLION+', description: 'Trades done to date', colorClass: 'text-light' },
  ];

  heroImages: string[] = [
    'assets/images/2. 300 ML Can Renders/300 ML CAN 1.png',
    'assets/images/3. Slim Can Renders/Slim Can 1.png',
    'assets/images/4. Bottle Renders/Bottle 1.png',
    'assets/images/5. 16oz Can Renders/16oz Can 1.png',
    'assets/images/6. Pint Glass Renders/Pint Glass 1.png',
    'assets/images/7. Wine Cooler Renders/Wine Cooler 1.png'
  ];

  images: string[] = [
    'assets/images/Hero Image-01.png',
    'assets/images/Hero Image-02.png',
    'assets/images/Hero Image-03.png'
  ];

  categories: string[] = ['Popular', '300 ML Can Cooler', 'Slim Can Cooler', 'Bottle Cooler', '16 OZ Can Cooler', 'Pint Glass Cooler', 'Wine Cooler', 'See All'];

  allProducts: Product[] = [
    { name: '300 ML Can Cooler', image: 'assets/images/2. 300 ML Can Renders/300 ML CAN 1.png', model: 'assets/images/COINZEE 300ML CAN GLB FILE.glb' },
    { name: 'Slim Can Cooler', image: 'assets/images/3. Slim Can Renders/Slim Can 1.png', model: 'assets/images/COINZEE SLIM CAN GLB FILE.glb' },
    { name: 'Bottle Cooler', image: 'assets/images/4. Bottle Renders/Bottle 1.png', model: 'assets/images/COINZEE BOTTLE GLB FILE.glb' },
    { name: '16 OZ Can Cooler', image: 'assets/images/5. 16oz Can Renders/16oz Can 1.png', model: 'assets/images/COINZEE 16OZ CAN GLB FILE.glb' },
    { name: 'Pint Glass Cooler', image: 'assets/images/6. Pint Glass Renders/Pint Glass 1.png', model: 'assets/images/COINZEE PINT GLASS GLB FILE.glb' },
    { name: 'Wine Cooler', image: 'assets/images/7. Wine Cooler Renders/Wine Cooler 1.png', model: 'assets/images/COINZEE WINE COOLER GLB FILE.glb' },
  ];

  products: Product[] = [...this.allProducts];

  categoryLimit = 6;
  productLimit = 8;
  showAllCategories = false;
  showAllProducts = false;

  get visibleCategories() {
    return this.showAllCategories ? this.categories : this.categories.slice(0, this.categoryLimit);
  }

  get visibleProducts() {
    return this.showAllProducts ? this.products : this.products.slice(0, this.productLimit);
  }

  constructor(private fb: FormBuilder,private http:HttpClient, private router: Router, private renderer: Renderer2)
  {
    this.enquiryForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['', Validators.required], 
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{6,15}$/)]],
      company: ['', Validators.required],
      address: ['', Validators.required]
    });
  }


    ngOnInit(): void {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    this.enquiryForm.reset();
    localStorage.removeItem('token');
    localStorage.removeItem('enquiryFormData');
    localStorage.removeItem('step1Data');
    localStorage.removeItem('step2Logo');
    localStorage.removeItem('enquiryFormData');
    localStorage.removeItem('productCommonColor');
    localStorage.removeItem('logoColor');
    localStorage.removeItem('finalMockup');
     this.http.get<any[]>('https://restcountries.com/v3.1/all?fields=cca2,idd')
      .subscribe(data => {
        this.countryCodes = data.flatMap(country =>
          country.idd?.root
            ? country.idd.suffixes.map((suffix: string) => ({
                cca2: country.cca2,
                phoneCode: country.idd.root + suffix
              }))
            : []
        );
      this.countryCodes.sort((a, b) => a.cca2.localeCompare(b.cca2));
      if (this.countryCodes.length > 0) {
        this.enquiryForm.patchValue({ countryCode: this.countryCodes[0].phoneCode });
      }
    });
    const step1 = localStorage.getItem('step1Data');
    if (step1) {
      this.enquiryForm.setValue(JSON.parse(step1));
    }

    const step2 = localStorage.getItem('step2Logo');
    if (step2) {
      this.uploadedFiles = [step2];
    }
  }

  ngAfterViewInit(): void {
    this.initializeSectionOrder();
    this.setupSectionAnimations();
    this.setupCraftedAnimations();
    this.startSliding();
    this.initAnimations();
    this.setupVideoEvents();
  }

  initializeSectionOrder() {
    const sectionNames = [
      'topSection',
      'makingSection',
      'moldSection',
      'craftedSection',
      'productSection',
      'personalizeSection',
      'clientSection',
      'bannerSection',
    ];

    const directions = ['left', 'right', 'right', 'left', 'left', 'right', 'right', 'left'];

    this.sectionOrder = sectionNames.map((name, index) => ({
      name,
      dir: directions[index % directions.length],
    }));
  }

  setupSectionAnimations() {
    this.sectionOrder.forEach((section) => {
      const sectionRef = this[section.name as keyof this] as ElementRef | undefined;
      if (!sectionRef || !sectionRef.nativeElement) return;

      const direction = section.dir;
      const el = sectionRef.nativeElement;

      const observer = new IntersectionObserver(
        ([entry], observer) => {
          if (entry.isIntersecting) {
            this.renderer.removeClass(el, 'out-' + direction);
            this.renderer.addClass(el, 'in-' + direction);
            observer.unobserve(el);
          }
        },
        { threshold: 0.2 }
      );

      observer.observe(el);
    });
  }

  setupCraftedAnimations() {
    if (!this.craftedSection || !this.craftedSection.nativeElement) return;
    const boxes = this.craftedSection.nativeElement.querySelectorAll('.process-box');
    const directions = ['left', 'right', 'left'];

    boxes.forEach((box: HTMLElement, index: number) => {
      const direction = directions[index % directions.length];

      const observer = new IntersectionObserver(
        ([entry], observer) => {
          if (entry.isIntersecting) {
            box.classList.add(`in-${direction}`);
            box.classList.remove(`out-${direction}`);
            observer.unobserve(box);
          }
        },
        { threshold: 0.3 }
      );

      observer.observe(box);
    });
  }

  private animateMoldImagesOnce() {
    if (this.moldImagesAnimated || !this.mainMoldImage || !this.additionalMoldImage) return;

    this.moldImagesAnimated = true;

    gsap.fromTo(
      this.mainMoldImage.nativeElement,
      { opacity: 0, y: -100 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out'
      }
    );

    gsap.fromTo(
      this.additionalMoldImage.nativeElement,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out'
      }
    );
  }

  // --- CAROUSEL ---
  startSliding(): void {
    this.stopSliding();
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.images.length;
    }, 3000);
  }

  stopSliding(): void {
    clearInterval(this.slideInterval);
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.startSliding();
  }

  // --- CATEGORY ---
  setCategory(category: string): void {
    this.activeCategory = category;

    if (category === 'See All' || category === 'Popular') {
      this.products = [...this.allProducts];
    } else {
      this.products = this.allProducts.filter(p => p.name === category);
    }
  }

  // --- VIDEO PLAYER ---
  setupVideoEvents(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;

    video.addEventListener('loadedmetadata', () => this.initDuration());
    video.addEventListener('timeupdate', () => this.updateTime());

    video.addEventListener('play', () => {
      this.isPlaying = true;
      this.showControls = true;
    });

    video.addEventListener('pause', () => {
      this.isPlaying = false;
    });
  }

  initDuration(): void {
    if (!this.videoPlayer || !this.progressBar) return;
    const video = this.videoPlayer.nativeElement;
    this.duration = this.formatTime(video.duration);
    this.progressBar.nativeElement.max = video.duration.toString();
  }

  updateTime(): void {
    if (!this.videoPlayer || !this.progressBar) return;
    const video = this.videoPlayer.nativeElement;
    this.currentTime = this.formatTime(video.currentTime);
    this.progressBar.nativeElement.value = video.currentTime.toString();
  }

  formatTime(sec: number): string {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  togglePlayPause(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  }

  rewind(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - 5, 0);
  }

  forward(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 5, video.duration);
  }

  seekVideo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.videoPlayer) return;
    this.videoPlayer.nativeElement.currentTime = parseFloat(input.value);
  }

  fullscreen(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    video.requestFullscreen();
  }

  showHoverTime(event: MouseEvent): void {
    const bar = this.progressBar?.nativeElement;
    const hoverBox = document.getElementById('hoverTime');
    const video = this.videoPlayer?.nativeElement;
    if (!bar || !hoverBox || !video) return;

    const rect = bar.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const percentage = mouseX / rect.width;
    const previewTime = percentage * video.duration;

    hoverBox.innerText = this.formatTime(previewTime);
    hoverBox.style.left = `${event.clientX}px`;
    hoverBox.style.display = 'block';
  }

  hideHoverTime(): void {
    const hoverBox = document.getElementById('hoverTime');
    if (hoverBox) hoverBox.style.display = 'none';
  }

  // --- GSAP ANIMATIONS ---
  initAnimations(): void {
    if (this.productCards) {
      gsap.from(this.productCards.map(el => el.nativeElement), {
        duration: 0.8,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        stagger: 0.1
      });
    }

    this.animatedSections?.forEach(section => {
      gsap.from(section.nativeElement, {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section.nativeElement,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  // --- FILE UPLOAD ---
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    //console.log("File Uploaded", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result;
        const img = new Image();
        img.onload = () => {
          this.autoCropImage(img);
        };
        img.src = this.previewUrl as string;
      };
      reader.readAsDataURL(file);
    }
  }

  private autoCropImage(img: HTMLImageElement): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('2D context not available');
      return;
    }

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let minX = canvas.width,
      minY = canvas.height,
      maxX = 0,
      maxY = 0;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    const croppedWidth = maxX - minX;
    const croppedHeight = maxY - minY;

    if (croppedWidth <= 0 || croppedHeight <= 0) {
      console.warn('The uploaded image is fully transparent or has no visible content.');
      this.uploadedFiles = [];
      localStorage.removeItem('step2Logo');
      return;
    }

    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) {
      console.error('2D context not available for cropped canvas');
      return;
    }

    croppedCanvas.width = croppedWidth;
    croppedCanvas.height = croppedHeight;

    croppedCtx.drawImage(
      canvas,
      minX,
      minY,
      croppedWidth,
      croppedHeight,
      0,
      0,
      croppedWidth,
      croppedHeight
    );

    const croppedDataUrl = croppedCanvas.toDataURL('image/png');

    this.uploadedFiles = [croppedDataUrl];
    localStorage.setItem('step2Logo', croppedDataUrl);
  }

  goToUploadDesign(): void {
    if (this.uploadedImage) {
      this.router.navigate(['/upload-design']);
    } else {
      alert('Please upload an image first.');
    }
  }

  onContactUs(): void {
    alert('Contact Us clicked!');
  }

  getButtonStyle(index: number): { [key: string]: string } {
    if (index === 0 || index === 1) {
      return { top: '55%', left: '50px', transform: 'translateY(-50%)' };
    } else if (index === 2) {
      return { top: '55%', right: '30px', transform: 'translateY(-50%)' };
    } else {
      return { bottom: '30px', left: '50%', transform: 'translateX(-50%)' };
    }
  }

  onNextStep(): void {
    if (this.enquiryForm.valid) {
      const step1Data = this.enquiryForm.value;
      localStorage.setItem('step1Data', JSON.stringify(step1Data));
      this.currentStep = 2;
    } else {
      this.enquiryForm.markAllAsTouched();
    }
  }

  isInvalid(field: string): boolean {
    const control = this.enquiryForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  openPopup(product: any): void {
    this.selectedProduct = product;
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
    this.selectedProduct = null;
  }

  goToMockupPage(): void {
    const enquiryData = {
      fullName: this.enquiryForm.value.fullName,
      email: this.enquiryForm.value.email,
      contact: `${this.enquiryForm.value.countryCode}${this.enquiryForm.value.phone}`,
      companyName: this.enquiryForm.value.company,
      address: this.enquiryForm.value.address,
      description: ''
    };

    // Store as JSON string
    localStorage.setItem('enquiryFormData', JSON.stringify(enquiryData));
    this.router.navigate(['/upload-design']).then(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }

  toggleCategoryView() {
    this.showAllCategories = !this.showAllCategories;
  }

  toggleProductView() {
    this.showAllProducts = !this.showAllProducts;
  }

  contactUs() {
    this.router.navigate(['/coinzee']);
  }

  openProductModel(product: Product): void {
    this.selectedProduct = product;

    if (!this.selectedProduct.model) {
      console.error('Error: The selected product does not have a 3D model file path.');
      return;
    }

    const modalEl = document.getElementById('productImageModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  closeProductImageModal(): void {
    this.selectedProduct = null;
    const modalEl = document.getElementById('productImageModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) {
        modal.hide();
      }
    }
  }

  onFeatureClick(title: string): void {
    if (title === 'TRADEMARKED') {
      this.showTrademarkPopup = true;
    }
  }

  closeTrademarkPopup(): void {
    this.showTrademarkPopup = false;
  }

  onPersonalizeClick(): void {
    this.showPersonalizePopup = true;
  }

  closePersonalizePopup(): void {
    this.showPersonalizePopup = false;
  }

  onFileUpload(event: any): void {
    const file = event.target.files[0];
    console.log('Uploaded file:', file);
  }

  closeModal() {
    const modalElement = document.getElementById('productImageModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  ngOnDestroy(): void {
    this.stopSliding();
  }
}