import { Component, HostListener, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
declare var bootstrap: any;

// Interfaces
interface Category {
  name: string;
  icon: string;
}

interface Slide {
  image: string;
  title: string;
  subtitle?: string;
  exploreBtn?: string;
  topThumbnails?: string[];
  bottomImages?: string[];
  miniCard?: {
    image: string;
    name: string;
    description: string;
    time: string;
  };
}

interface Product {
  image: string;
  title: string;
  discounted: number;
  original: number;
  rating: number;
  reviews: number;
}

interface ProcessStep {
  title: string;
  image: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  searchQuery: string = '';

  // 🔹 Categories
  categories: Category[] = [
    { name: 'Phones', icon: 'assets/images/home/mobile.png' },
    { name: 'Computers', icon: 'assets/images/home/computer.png' },
    { name: 'SmartWatch', icon: 'assets/images/home/smartwatch.png' },
    { name: 'Camera', icon: 'assets/images/home/camera.png' },
    { name: 'HeadPhones', icon: 'assets/images/home/headphone.svg' },
    { name: 'Gaming', icon: 'assets/images/home/gaming.webp' },
  ];
  selectedCategoryIndex: number | null = null;

  // 🔹 Slides for carousel
  slides: Slide[] = [
    {
      image: 'assets/images/cups-cover.jpg',
      title: 'Every Sip Like Your First',
      subtitle: 'STTOKE Limited Edition Leakproof Ceramic Insulated Cup Powder Coating 16oz',
      exploreBtn: 'Explore More',
      miniCard: {
        image: 'assets/images/orange-cup.webp',
        name: 'STTOKE Limited Edition',
        description: 'Leakproof Cup Powder Coating 16oz',
        time: '1 hour ago'
      }
    },
    {
      image: 'assets/images/coffee-mug.jpg',
      title: 'Sip In Style',
      subtitle: 'Artisan Handmade Ceramic Mug Collection',
      exploreBtn: 'Discover Now',
      topThumbnails: ['assets/images/mug1.jpeg', 'assets/images/mug2.jpeg'],
      bottomImages: ['assets/images/mug3.jpeg', 'assets/images/mug4.jpeg', 'assets/images/mug5.jpeg'],
      miniCard: {
        image: 'assets/images/blue-mug.webp',
        name: 'Handmade Ceramic Mug',
        description: 'Limited Edition Collection',
        time: '2 hours ago'
      }
    }
  ];

  // 🔹 Inspired Products
  inspiredProducts: Product[] = [
    { image: 'assets/images/home/bagpack1.jpg', title: 'Blast Travel Backpack', discounted: 370, original: 400, rating: 5, reviews: 99 },
    { image: 'assets/images/home/freeskocup.webp', title: 'Freesko Reusable Cups', discounted: 370, original: 400, rating: 4, reviews: 87 },
    { image: 'assets/images/home/PorcelainMugs.jpg', title: 'Porcelain Mugs', discounted: 370, original: 400, rating: 5, reviews: 120 },
    { image: 'assets/images/home/bakeryboxes.jpg', title: 'Bakery Boxes', discounted: 370, original: 400, rating: 3, reviews: 45 },
    { image: 'assets/images/home/planter.jpg', title: 'Modern Pure Black Plastic Round Indoor Planter (5-Pack)', discounted: 370, original: 400, rating: 5, reviews: 150 },
    { image: 'assets/images/home/monitor.png', title: 'IPS LCD Gaming Monitor', discounted: 120, original: 160, rating: 4, reviews: 60 },
    { image: 'assets/images/home/orange-cup.webp', title: 'Luxury Coffee Mug', discounted: 45, original: 60, rating: 5, reviews: 220 },
    { image: 'assets/images/home/plasticbox.webp', title: 'Plastic Product', discounted: 75, original: 95, rating: 4, reviews: 80 },
    { image: 'assets/images/home/games.png', title: 'Remote Control Games', discounted: 55, original: 70, rating: 5, reviews: 130 },
    { image: 'assets/images/home/men-buckle.webp', title: 'Mens Buckles', discounted: 65, original: 85, rating: 4, reviews: 99 }
  ];

  // 🔹 Process Steps
  processSteps: ProcessStep[] = [
    { title: 'Supply Chain & Warehousing', image: 'assets/images/home/warehouse.png' },
    { title: 'Graphic Design & Marketing', image: 'assets/images/home/marketing.png' },
    { title: 'Shipping & Logistics', image: 'assets/images/home/services.png' },
    { title: 'Product Development & Sourcing', image: 'assets/images/home/production.webp' },
  ];

  // 🔹 Testimonials
  testimonials = [
    { quote: "Fantastic customer service. I shifted from a traditional bank to Sable [and] Sable's customer service helped me answer all the questions that I needed to switch.", author: "K Oiwake" },
    { quote: "The best bank for immigrants in the US. Thank you Sable! I have nothing but good things to say about you!", author: "E Berhe" },
    { quote: "Sable has revolutionized my financial life. Their simple and efficient process made opening an account a breeze.", author: "A. Patel" },
    { quote: "The app is intuitive and the support team is always there to help. I highly recommend Sable to anyone new to the country.", author: "S. Chen" }
  ];

  stars: number[] = Array(5).fill(0);

  // 🔹 Contact
  website = 'www.southernsourcingsupply.com';
  email = 'info@southernsourcingsupply.com';

  constructor(private router: Router) {}

  // 🔹 Category click → highlight + navigate
  selectCategory(index: number): void {
    this.selectedCategoryIndex = index;
    const category = this.categories[index];
    this.router.navigate(['/category', category.name]);
  }

  // 🔹 Search
  onSearch(): void {
    if (this.searchQuery.trim() === '') {
      alert('Please enter a search query');
      return;
    }
    console.log('Searching for:', this.searchQuery);
  }

  // 🔹 Explore button
  onExplore(): void {
    console.log('Explore More clicked!');
    const categorySection = document.querySelector('.category-section');
    if (categorySection) {
      categorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // 🔹 Signup
  onSignUp(): void {
    console.log('Sign-up button clicked');
  }

  // 🔹 Contact methods
  sendEmail() {
    window.location.href = `mailto:${this.email}`;
  }

  openWebsite() {
    const url = this.website.startsWith('http') ? this.website : 'https://' + this.website;
    window.open(url, '_blank');
  }

  // 🔹 Deselect category on click outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.category-card')) {
      this.selectedCategoryIndex = null;
    }
  }

  // 🔹 Bootstrap carousel init
  ngAfterViewInit(): void {
    const carouselEl = document.getElementById('exploreCarousel');
    if (carouselEl) {
      new bootstrap.Carousel(carouselEl, {
        interval: 2000,
        ride: 'carousel',
        pause: 'false',
        wrap: true
      });
    }
  }

  // 🔹 Optimize ngFor rendering for testimonials
  trackByAuthor(index: number, testimonial: any): string {
    return testimonial.author;
  }
}
