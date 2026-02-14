import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


interface Company {
  name: string;
  image: string;
  category: 'phones' | 'computers' | 'smartwatch' | 'camera' | 'headphones' | 'gaming';
}

interface CategoryItem { 
  name: string; 
  image?: string; 
  specs?: string; 
  details?: string; 
}

interface Product { 
  name: string; 
  images: string[]; 
  price: number; 
  rating: number; 
  description?: string; 
}

@Component({
  selector: 'app-category-page',
  templateUrl: './category-page.component.html',
  styleUrls: ['./category-page.component.scss']
})
export class CategoryPageComponent implements OnInit, AfterViewChecked {
  @ViewChild('productsSection') productsSection!: ElementRef;

  categoryName: string = '';
  categorySubtitle: string = '';
  selectedCompany: string = '';
  categoryItems: CategoryItem[] = [];
  selectedCompanyProducts: Product[] = [];

  

  selectedSubCategories: { [key: string]: string } = {};
  scrollToProducts: boolean = false;
   selectedPaymentMethod: string = '';


  categoriesConfig: { [key: string]: string[] } = {
    phones: ['Smartphones', 'Featurephones', 'Foldablephones'],
    computers: ['Laptops', 'Desktops', 'Gaming PCs', 'Workstations', 'Monitors', 'Accessories'],
    smartwatch: ['Fitness Trackers', 'Luxury', 'Wear OS', 'GPS', 'Waterproof'],
    camera: ['DSLR', 'Mirrorless', 'Point & Shoot', 'Action Cameras', 'Lenses', 'Accessories'],
    headphones: ['Over-ear', 'In-ear', 'Wireless', 'Noise Cancelling', 'Gaming Headsets', 'Studio'],
    gaming: ['Consoles', 'Gaming Laptops', 'GPU', 'Peripherals', 'Controllers', 'Games']
  };

  companies: Company[] = [
    // Phones
    { name: 'Apple', image: 'assets/images/products/apple.webp', category: 'phones' },
    { name: 'Samsung', image: 'assets/images/products/samsung.png', category: 'phones' },
    { name: 'Xiaomi', image: 'assets/images/products/xiaomi.jpg', category: 'phones' },
    { name: 'OnePlus', image: 'assets/images/products/oneplus.png', category: 'phones' },
    { name: 'Oppo', image: 'assets/images/products/oppo.png', category: 'phones' },
    { name: 'Vivo', image: 'assets/images/products/vivo.png', category: 'phones' },
    { name: 'RealMe', image: 'assets/images/products/realme.webp', category: 'phones' },
    { name: 'Google Pixel', image: 'assets/images/products/googlep.png', category: 'phones' },
    { name: 'Sony', image: 'assets/images/products/sony.png', category: 'phones' },

    // Computers
    { name: 'Apple Computers', image: 'assets/images/products/apple.webp', category: 'computers' },
    { name: 'Dell', image: 'assets/images/products/dell.png', category: 'computers' },
    { name: 'HP', image: 'assets/images/products/hp.png', category: 'computers' },
    { name: 'Lenovo', image: 'assets/images/products/lenovo.png', category: 'computers' },
    { name: 'Asus', image: 'assets/images/products/asus.png', category: 'computers' },
    { name: 'Acer', image: 'assets/images/products/acer.jpg', category: 'computers' },

    // Smartwatch
    { name: 'Apple Watch', image: 'assets/images/products/apple.webp', category: 'smartwatch' },
    { name: 'Samsung Watch', image: 'assets/images/products/samsung.png', category: 'smartwatch' },
    { name: 'Fossil', image: 'assets/images/products/fossil.png', category: 'smartwatch' },
    { name: 'Garmin', image: 'assets/images/products/garmin.jpg', category: 'smartwatch' },
    { name: 'Fitbit', image: 'assets/images/products/fitbit.jpg', category: 'smartwatch' },

    // Camera
    { name: 'Canon', image: 'assets/images/products/canon.png', category: 'camera' },
    { name: 'Nikon', image: 'assets/images/products/nikon.png', category: 'camera' },
    { name: 'Sony Cameras', image: 'assets/images/products/sony.png', category: 'camera' },

    // Headphones
    { name: 'Bose', image: 'assets/images/products/bose.svg', category: 'headphones' },
    { name: 'Sony Audio', image: 'assets/images/products/sony.png', category: 'headphones' },
    { name: 'Sennheiser', image: 'assets/images/products/Sennheiser.png', category: 'headphones' },

    // Gaming
    { name: 'Asus ROG', image: 'assets/images/products/rog.png', category: 'gaming' },
    { name: 'MSI', image: 'assets/images/products/msi.png', category: 'gaming' },
    { name: 'Razer', image: 'assets/images/products/razer.png', category: 'gaming' }
  ];


  productsDatabase: { [company: string]: Product[] } = {
    'Apple': [
      // iPhone 15 Series
      { name: 'iPhone 15 Pro Max', images: ['assets/images/products/iPhone15ProMax.webp'], price: 1199, rating: 4.8, description: 'Titanium frame, A17 Pro chip, 48MP camera.' },
      { name: 'iPhone 15 Pro', images: ['assets/images/products/iPhone15Pro.webp'], price: 999, rating: 4.7, description: 'Titanium design with Pro camera system.' },
      { name: 'iPhone 15 Plus', images: ['assets/images/products/iPhone15Plus.webp'], price: 899, rating: 4.6, description: 'Large display with long battery life.' },
      { name: 'iPhone 15', images: ['assets/images/products/iPhone15.webp'], price: 799, rating: 4.6, description: 'Latest iPhone 15 with Dynamic Island.' },
      // iPhone 14 Series
      { name: 'iPhone 14 Pro Max', images: ['assets/images/products/iPhone14ProMax.webp'], price: 1099, rating: 4.8, description: 'Flagship iPhone with Dynamic Island.' },
      { name: 'iPhone 14 Pro', images: ['assets/images/products/iPhone14Pro.jpg'], price: 999, rating: 4.7, description: 'Pro camera system and A15 chip.' },
      { name: 'iPhone 14 Plus', images: ['assets/images/products/iPhone14Plus.jpg'], price: 799, rating: 4.6, description: 'Large-screen iPhone 14 Plus.' },
      { name: 'iPhone 14', images: ['assets/images/products/iPhone14.webp'], price: 699, rating: 4.5, description: 'iPhone 14 with A15 Bionic chip.' },
      // iPhone 13 Series
      { name: 'iPhone 13 Pro Max', images: ['assets/images/products/iPhone13ProMax.webp'], price: 999, rating: 4.8, description: 'Triple camera and OLED display.' },
      { name: 'iPhone 13 Pro', images: ['assets/images/products/iPhone13Pro.jpeg'], price: 899, rating: 4.7, description: 'iPhone 13 Pro with triple camera system.' },
      { name: 'iPhone 13', images: ['assets/images/products/iPhone13.webp'], price: 599, rating: 4.5, description: 'iPhone 13 with A15 chip.' },
      { name: 'iPhone 13 mini', images: ['assets/images/products/iPhone13mini.webp'], price: 499, rating: 4.4, description: 'Compact iPhone 13 mini.' },
      // iPhone 12 Series
      { name: 'iPhone 12 Pro Max', images: ['assets/images/products/iPhone12ProMax.webp'], price: 899, rating: 4.7, description: 'iPhone 12 Pro Max with OLED display.' },
      { name: 'iPhone 12 Pro', images: ['assets/images/products/iPhone12Pro.webp'], price: 799, rating: 4.6, description: 'Triple camera iPhone 12 Pro.' },
      { name: 'iPhone 12', images: ['assets/images/products/iphone12.jpg'], price: 499, rating: 4.4, description: 'iPhone 12 with OLED display.' },
      { name: 'iPhone 12 mini', images: ['assets/images/products/iPhone12mini.jpg'], price: 429, rating: 4.3, description: 'Compact iPhone 12 mini.' },
      // iPhone 11 Series
      { name: 'iPhone 11 Pro Max', images: ['assets/images/products/iPhone11ProMax.jpg'], price: 799, rating: 4.6, description: 'iPhone 11 Pro Max triple camera.' },
      { name: 'iPhone 11 Pro', images: ['assets/images/products/iPhone11Pro.webp'], price: 699, rating: 4.5, description: 'iPhone 11 Pro triple camera.' },
      { name: 'iPhone 11', images: ['assets/images/products/iPhone11.webp'], price: 399, rating: 4.3, description: 'iPhone 11 dual camera.' },
      // iPhone X Series
      { name: 'iPhone XS Max', images: ['assets/images/products/iPhoneXSMax.jpg'], price: 699, rating: 4.4, description: 'Larger OLED display.' },
      { name: 'iPhone XS', images: ['assets/images/products/iPhoneXS.webp'], price: 599, rating: 4.3, description: 'iPhone XS OLED display.' },
      { name: 'iPhone XR', images: ['assets/images/products/iPhoneXR.jpg'], price: 399, rating: 4.1, description: 'iPhone XR Liquid Retina display.' },
      { name: 'iPhone X', images: ['assets/images/products/iPhoneX.webp'], price: 499, rating: 4.2, description: 'iPhone X edge-to-edge display.' },
      // iPhone 8 Series
      { name: 'iPhone 8 Plus', images: ['assets/images/products/iPhone8Plus.jpg'], price: 399, rating: 4.1, description: 'Dual camera iPhone 8 Plus.' },
      { name: 'iPhone 8', images: ['assets/images/products/iPhone8.png'], price: 299, rating: 4.0, description: 'iPhone 8 with glass back.' },
      // iPhone 7 Series
      { name: 'iPhone 7 Plus', images: ['assets/images/products/iPhone7Plus.webp'], price: 299, rating: 4.0, description: 'iPhone 7 Plus dual camera.' },
      { name: 'iPhone 7', images: ['assets/images/products/iPhone7.jpg'], price: 199, rating: 3.9, description: 'iPhone 7 with A10 chip.' },
      // Older models
      { name: 'iPhone SE (3rd Gen)', images: ['assets/images/products/iPhoneSE3rd.avif'], price: 429, rating: 4.3, description: 'iPhone SE 3rd Gen.' },
      { name: 'iPhone SE (2nd Gen)', images: ['assets/images/products/iPhoneSE2nd.webp'], price: 299, rating: 4.0, description: 'iPhone SE 2nd Gen.' },
      { name: 'iPhone SE (1st Gen)', images: ['assets/images/products/iPhoneSE1st.jpg'], price: 129, rating: 3.7, description: 'Original iPhone SE.' },
      { name: 'iPhone 6s Plus', images: ['assets/images/products/iPhone6sPlus.webp'], price: 179, rating: 3.9, description: 'iPhone 6s Plus.' },
      { name: 'iPhone 6s', images: ['assets/images/products/iPhone6s.jpg'], price: 149, rating: 3.8, description: 'iPhone 6s.' }
    ],

    'Samsung': [
      // Galaxy S Series newest to oldest
      { name: 'Galaxy S23 Ultra', images: ['assets/images/products/galaxys23ultra.jpg'], price: 1099, rating: 4.8, description: 'Galaxy S23 Ultra flagship.' },
      { name: 'Galaxy S23+', images: ['assets/images/products/galaxys23plus.webp'], price: 899, rating: 4.7, description: 'Galaxy S23 Plus.' },
      { name: 'Galaxy S23', images: ['assets/images/products/galaxys23.jpg'], price: 799, rating: 4.6, description: 'Galaxy S23.' },
      // Galaxy Note series
      { name: 'Galaxy Note 20 Ultra', images: ['assets/images/products/galaxynote.jpg'], price: 1099, rating: 4.7, description: 'Galaxy Note 20 Ultra.' },
      { name: 'Galaxy Note 20', images: ['assets/images/products/galaxynote20.webp'], price: 899, rating: 4.5, description: 'Galaxy Note 20.' },
      // Galaxy Z series (foldables)
      { name: 'Galaxy Z Fold 5', images: ['assets/images/products/zfold5.webp'], price: 1799, rating: 4.6, description: 'Latest foldable Z Fold 5.' },
      { name: 'Galaxy Z Fold 4', images: ['assets/images/products/zfold4.webp'], price: 1499, rating: 4.5, description: 'Foldable Z Fold 4.' },
      { name: 'Galaxy Z Flip 5', images: ['assets/images/products/zflip5.webp'], price: 999, rating: 4.5, description: 'Latest Z Flip 5.' },
      { name: 'Galaxy Z Flip 4', images: ['assets/images/products/zflip4.webp'], price: 899, rating: 4.4, description: 'Z Flip 4 foldable.' }
      // Continue adding A, M, F series and older J/C/E models
    ],

    'Xiaomi': [
      { name: 'Xiaomi 14', images: ['assets/images/products/Xiaomi 14.webp'], price: 799, rating: 4.5, description: 'Xiaomi 14 flagship.' },
      { name: 'Xiaomi 13', images: ['assets/images/products/Xiaomi13.jpg'], price: 699, rating: 4.4, description: 'Xiaomi 13 series.' },
      { name: 'Xiaomi 12', images: ['assets/images/products/Xiaomi12.png'], price: 599, rating: 4.3, description: 'Xiaomi 12.' },
      { name: 'Redmi Note 13', images: ['assets/images/products/RedmiNote13.jpg'], price: 399, rating: 4.3, description: 'Redmi Note 13.' },
      { name: 'Redmi Note 12', images: ['assets/images/products/RedmiNote12.webp'], price: 349, rating: 4.2, description: 'Redmi Note 12.' },
      { name: 'POCO F5', images: ['assets/images/products/pocof5.webp'], price: 429, rating: 4.4, description: 'POCO F5.' }
    ],

    'OnePlus': [
    { name: 'OnePlus 12', images: ['assets/images/products/OnePlus12.jpg'], price: 799, rating: 4.7, description: 'Latest OnePlus 12 flagship.' },
    { name: 'OnePlus 11 5G', images: ['assets/images/products/OnePlus11.jpg'], price: 699, rating: 4.6, description: 'Snapdragon 8 Gen 2, Hasselblad camera.' },
    { name: 'OnePlus 10T', images: ['assets/images/products/OnePlus10T.webp'], price: 649, rating: 4.5, description: '120Hz AMOLED display with fast charging.' },
    { name: 'OnePlus 10 Pro', images: ['assets/images/products/OnePlus10pro.webp'], price: 599, rating: 4.5, description: 'Flagship OnePlus 10.' },
    { name: 'OnePlus 9 Pro', images: ['assets/images/products/OnePlus9Pro.jpg'], price: 549, rating: 4.4, description: 'Pro-level camera and performance.' },
    { name: 'OnePlus 9', images: ['assets/images/products/OnePlus9.jpg'], price: 499, rating: 4.3, description: 'Smooth AMOLED display.' },
    { name: 'OnePlus 9R', images: ['assets/images/products/OnePlus9r.jpg'], price: 449, rating: 4.2, description: 'Affordable 9 series option.' },
    { name: 'OnePlus Nord 3', images: ['assets/images/products/OnePlusNord3.webp'], price: 449, rating: 4.4, description: 'Mid-range Nord 3 flagship.' },
    { name: 'OnePlus Nord CE 3', images: ['assets/images/products/OnePlusNordCE3.webp'], price: 399, rating: 4.3, description: 'Nord CE 3 with AMOLED display.' },
    { name: 'OnePlus Nord 2T', images: ['assets/images/products/OnePlusNord2T.webp'], price: 349, rating: 4.2, description: 'Affordable Nord 2T.' },
    { name: 'OnePlus Nord 2', images: ['assets/images/products/OnePlusNord2.png'], price: 329, rating: 4.1, description: 'Nord 2 flagship.' }
  ],

  'Oppo': [
    { name: 'Oppo Find X6 Pro', images: ['assets/images/products/OppoFindX6Pro.webp'], price: 999, rating: 4.6, description: 'Flagship triple camera with Hasselblad.' },
    { name: 'Oppo Find X5 Pro', images: ['assets/images/products/OppoFindX5Pro.webp'], price: 899, rating: 4.5, description: 'Find X5 Pro with AMOLED display.' },
    { name: 'Oppo Reno10 Pro+ 5G', images: ['assets/images/products/OppoReno10Pro+.png'], price: 649, rating: 4.4, description: 'Telephoto camera and 100W fast charging.' },
    { name: 'Oppo Reno10 Pro', images: ['assets/images/products/OppoReno10Pro.jpg'], price: 599, rating: 4.3, description: 'Reno 10 Pro with sleek design.' },
    { name: 'Oppo Reno 12', images: ['assets/images/products/OppoReno12.webp'], price: 499, rating: 4.2, description: 'Reno 12 with AMOLED display.' },
    { name: 'Oppo A78', images: ['assets/images/products/OppoA78.jpg'], price: 299, rating: 4.1, description: 'A78 budget-friendly smartphone.' },
    { name: 'Oppo A77', images: ['assets/images/products/OppoA77.webp'], price: 249, rating: 4.0, description: 'Oppo A77 smartphone.' },
    { name: 'Oppo A57', images: ['assets/images/products/OppoA57.webp'], price: 199, rating: 3.9, description: 'Affordable Oppo A57.' }
  ],

  'Vivo': [
    { name: 'Vivo X100', images: ['assets/images/products/VivoX100.png'], price: 899, rating: 4.7, description: 'Vivo X100 flagship.' },
    { name: 'Vivo X90 Pro', images: ['assets/images/products/VivoX90Pro.webp'], price: 799, rating: 4.6, description: 'Zeiss camera system.' },
    { name: 'Vivo X80', images: ['assets/images/products/VivoX80.png'], price: 699, rating: 4.5, description: 'Vivo X80 with AMOLED display.' },
    { name: 'Vivo V29', images: ['assets/images/products/VivoV29.webp'], price: 449, rating: 4.4, description: 'Curved AMOLED display.' },
    { name: 'Vivo V28', images: ['assets/images/products/VivoV28.jpg'], price: 399, rating: 4.3, description: 'Vivo V28.' },
    { name: 'Vivo V27', images: ['assets/images/products/VivoV27.webp'], price: 349, rating: 4.2, description: 'Vivo V27.' },
    { name: 'Vivo Y100', images: ['assets/images/products/VivoY100.png'], price: 299, rating: 4.1, description: 'Vivo Y100 budget phone.' },
    { name: 'Vivo Y90', images: ['assets/images/products/VivoY90.webp'], price: 249, rating: 4.0, description: 'Vivo Y90.' },
    { name: 'Vivo Y75', images: ['assets/images/products/VivoY75.webp'], price: 199, rating: 3.9, description: 'Vivo Y75.' }
  ],

  'RealMe': [
    { name: 'Realme GT 5 Pro', images: ['assets/images/products/RealmeGT5Pro.webp'], price: 649, rating: 4.5, description: 'Flagship Realme GT 5 Pro.' },
    { name: 'Realme GT 3', images: ['assets/images/products/realmegt3.png'], price: 599, rating: 4.4, description: 'Realme GT 3.' },
    { name: 'Realme GT Neo 5', images: ['assets/images/products/RealmeGTNeo5.webp'], price: 549, rating: 4.3, description: 'Realme GT Neo 5.' },
    { name: 'Realme GT Neo 3', images: ['assets/images/products/RealmeGTNeo3.jpg'], price: 499, rating: 4.2, description: 'Realme GT Neo 3.' },
    { name: 'Realme Narzo 60', images: ['assets/images/products/RealmeNarzo60.webp'], price: 229, rating: 4.3, description: 'Realme Narzo 60 5G.' },
    { name: 'Realme Narzo 50', images: ['assets/images/products/RealmeNarzo50.webp'], price: 199, rating: 4.1, description: 'Realme Narzo 50.' },
    { name: 'Realme Narzo 30', images: ['assets/images/products/RealmeNarzo30.jpg'], price: 179, rating: 4.0, description: 'Realme Narzo 30.' },
    { name: 'Realme C55', images: ['assets/images/products/RealmeC55.jpg'], price: 159, rating: 3.9, description: 'Realme C55 budget phone.' },
    { name: 'Realme C35', images: ['assets/images/products/RealmeC35.webp'], price: 129, rating: 3.8, description: 'Realme C35.' },
    { name: 'Realme C31', images: ['assets/images/products/RealmeC31.webp'], price: 99, rating: 3.7, description: 'Realme C31.' }
  ],

  'Google Pixel': [
    { name: 'Pixel 8 Pro', images: ['assets/images/products/Pixel8Pro.jpg'], price: 999, rating: 4.7, description: 'Pixel 8 Pro with Tensor G3 chip.' },
    { name: 'Pixel 8', images: ['assets/images/products/Pixel8.webp'], price: 899, rating: 4.6, description: 'Pixel 8 flagship.' },
    { name: 'Pixel 7 Pro', images: ['assets/images/products/pixel7pro.webp'], price: 799, rating: 4.5, description: 'Pixel 7 Pro.' },
    { name: 'Pixel 7a', images: ['assets/images/products/pixel7a.png'], price: 499, rating: 4.5, description: 'Affordable Pixel 7a.' },
    { name: 'Pixel 6', images: ['assets/images/products/pixel6.jpg'], price: 599, rating: 4.4, description: 'Pixel 6.' },
    { name: 'Pixel 6a', images: ['assets/images/products/pixel6a.jpg'], price: 449, rating: 4.3, description: 'Pixel 6a.' },
    { name: 'Pixel 5', images: ['assets/images/products/pixel5.webp'], price: 399, rating: 4.2, description: 'Pixel 5.' },
    { name: 'Pixel 4a', images: ['assets/images/products/pixel4a.jpg'], price: 349, rating: 4.1, description: 'Pixel 4a.' },
    { name: 'Pixel 4', images: ['assets/images/products/pixel4.webp'], price: 299, rating: 4.0, description: 'Pixel 4.' },
    { name: 'Pixel 3a', images: ['assets/images/products/pixel3a.jpg'], price: 249, rating: 3.9, description: 'Pixel 3a.' },
    { name: 'Pixel 3', images: ['assets/images/products/pixel3.webp'], price: 199, rating: 3.8, description: 'Pixel 3.' }
  ],

  
  'Sony': [
    { name: 'Sony Xperia 1 V', images: ['assets/images/products/SonyXperia1V.webp'], price: 1199, rating: 4.5, description: 'Cinematic 4K OLED display.' },
    { name: 'Sony Xperia 1 IV', images: ['assets/images/products/SonyXperia1IV.webp'], price: 1099, rating: 4.4, description: 'Xperia 1 IV flagship.' },
    { name: 'Sony Xperia 1 III', images: ['assets/images/products/SonyXperia1iii.webp'], price: 999, rating: 4.3, description: 'Xperia 1 III.' },
    { name: 'Sony Xperia 5 IV', images: ['assets/images/products/SonyXperia5V.jpg'], price: 799, rating: 4.3, description: 'Xperia 5 IV.' },
    { name: 'Sony Xperia 10 V', images: ['assets/images/products/SonyXperia5V.jpg'], price: 499, rating: 4.2, description: 'Xperia 10 V.' },
    { name: 'Sony Xperia 10 IV', images: ['assets/images/products/SonyXperia10 IV.jpg'], price: 399, rating: 4.1, description: 'Xperia 10 IV.' }
  ],
  // Computers database
    'Apple Computers': [
      { name: 'MacBook Pro 16', images: ['assets/images/products/macbook16.jpg'], price: 2399, rating: 4.8, description: '16GB RAM, 512GB SSD, M2 Pro chip' },
      { name: 'MacBook Air M2', images: ['assets/images/products/macbookairm2.webp'], price: 1499, rating: 4.7, description: 'Lightweight, M2 chip, Retina display' }
    ],
    'Dell': [
      { name: 'Dell XPS 13', images: ['assets/images/products/DellXPS13.jpg'], price: 1199, rating: 4.6, description: '13-inch ultrabook, 8GB RAM, 256GB SSD' },
      { name: 'Dell Inspiron 15', images: ['assets/images/products/DellInspiron15.webp'], price: 899, rating: 4.5, description: '15-inch laptop, 16GB RAM, 512GB SSD' }
    ],
    'HP': [
      { name: 'HP Spectre x360', images: ['assets/images/products/HPSpectrex360.webp'], price: 1399, rating: 4.7, description: 'Convertible laptop, 16GB RAM, 512GB SSD' },
      { name: 'HP Pavilion 14', images: ['assets/images/products/HPPavilion14.webp'], price: 799, rating: 4.4, description: '14-inch laptop, Intel i5, 256GB SSD' }
    ],
    'Lenovo': [
      { name: 'Lenovo ThinkPad X1', images: ['assets/images/products/LenovoThinkPad.jpg'], price: 1299, rating: 4.6, description: 'Business laptop, 16GB RAM, 512GB SSD' },
      { name: 'Lenovo IdeaPad 3', images: ['assets/images/products/LenovoIdeaPad3.webp'], price: 699, rating: 4.3, description: 'Affordable everyday laptop' }
    ],
    'Asus': [
      { name: 'Asus ROG Zephyrus', images: ['assets/images/products/AsusROGZephyr.webp'], price: 1499, rating: 4.7, description: 'Gaming laptop, RTX 4070, 16GB RAM' }
    ],
    'Acer': [
      { name: 'Acer Swift 3', images: ['assets/images/products/AcerSwift3.webp'], price: 899, rating: 4.5, description: 'Lightweight ultrabook, 8GB RAM, 512GB SSD' }
    ],


    // Smartwatch
'Apple Watch': [
  { name: 'Apple Watch Series 9', images: ['assets/images/products/applewatch9.webp'], price: 399, rating: 4.8, description: 'Waterproof, GPS, LTE' },
  { name: 'Apple Watch SE', images: ['assets/images/products/applewatchse.avif'], price: 249, rating: 4.5, description: 'Affordable watch with essentials' }
],
'Samsung Watch': [
  { name: 'Galaxy Watch 6', images: ['assets/images/products/samsungwatch6.avif'], price: 349, rating: 4.7, description: 'GPS, Fitness tracking' }
],
'Fossil': [
  { name: 'Fossil Gen 7', images: ['assets/images/products/FossilGen7.webp'], price: 299, rating: 4.4, description: 'Stylish smartwatch with Wear OS' }
],
'Garmin': [
  { name: 'Garmin Venu 3', images: ['assets/images/products/GarminVenu3.jpg'], price: 399, rating: 4.6, description: 'Advanced fitness smartwatch' }
],
'Fitbit': [
  { name: 'Fitbit Versa 4', images: ['assets/images/products/FitbitVersa4.webp'], price: 229, rating: 4.5, description: 'Health and fitness tracking' }
],

// Camera 
'Canon': [
  { name: 'Canon EOS R6', images: ['assets/images/products/CanonEOSR6.webp'], price: 2499, rating: 4.8, description: 'Full-frame mirrorless DSLR, 20MP, 4K video' },
  { name: 'Canon EOS 5D Mark IV', images: ['assets/images/products/EOS5DMark5.webp'], price: 2999, rating: 4.9, description: 'Professional DSLR camera, 30MP' }
],
'Nikon': [
  { name: 'Nikon Z9', images: ['assets/images/products/NikonZ9.webp'], price: 5499, rating: 4.9, description: 'Full-frame mirrorless, 45.7MP, 8K video' },
  { name: 'Nikon D850', images: ['assets/images/products/NikonD850.jpg'], price: 2999, rating: 4.8, description: 'DSLR, 45MP, professional photography' }
],
'Sony Cameras': [
  { name: 'Sony Alpha 7 IV', images: ['assets/images/products/SonyAlpha7IV.avif'], price: 2499, rating: 4.8, description: 'Mirrorless camera, 33MP, 4K video' },
  { name: 'Sony Alpha 7R V', images: ['assets/images/products/SonyAlpha7RV.webp'], price: 3499, rating: 4.9, description: 'High-res mirrorless, 61MP' }
],
    

// Headphones
'Bose': [
  { name: 'Bose QuietComfort 45', images: ['assets/images/products/BoseQuietComfort45.webp'], price: 329, rating: 4.7, description: 'Noise cancelling over-ear headphones' },
  { name: 'Bose Headphones 700', images: ['assets/images/products/headphone.webp'], price: 379, rating: 4.8, description: 'Premium noise cancelling headphones' },
  { name: 'Bose Sport Earbuds', images: ['assets/images/products/BoseSportEarburd.jpg'], price: 179, rating: 4.5, description: 'Wireless in-ear sports earbuds' }
],

'Sony Audio': [
  { name: 'Sony WH-1000XM5', images: ['assets/images/products/SonyWH1000XM5.jpg'], price: 349, rating: 4.8, description: 'Industry leading noise cancellation' },
  { name: 'Sony WF-1000XM4', images: ['assets/images/products/SonyWF1000XM4.webp'], price: 249, rating: 4.7, description: 'True wireless noise cancelling earbuds' },
  { name: 'Sony MDR-Z1R', images: ['assets/images/products/SonyMDRZ1R.webp'], price: 1999, rating: 4.9, description: 'High-end over-ear audiophile headphones' }
],

'Sennheiser': [
  { name: 'Sennheiser HD 560S', images: ['assets/images/products/SennheiserHD56.jpg'], price: 199, rating: 4.6, description: 'Open-back studio headphones' },
  { name: 'Sennheiser Momentum 4', images: ['assets/images/products/SennheiserMomentum4.webp'], price: 349, rating: 4.8, description: 'Premium wireless headphones' },
  { name: 'Sennheiser CX Plus True Wireless', images: ['assets/images/products/SennheiserCXP.jpg'], price: 129, rating: 4.5, description: 'Noise cancelling in-ear earbuds' }
],

// Gaming
'Asus ROG': [
  { name: 'Asus ROG Strix Scar 18', images: ['assets/images/products/AsusROGStrix.jpg '], price: 2499, rating: 4.9, description: 'High-end gaming laptop with RTX 4090' }
],
'MSI': [
  { name: 'MSI GE76 Raider', images: ['assets/images/products/MSIGE76Raider.webp'], price: 2399, rating: 4.8, description: 'Powerful gaming laptop with RTX 4080' }
],
'Razer': [
  { name: 'Razer Blade 18', images: ['assets/images/products/RazerBlade18.jpg'], price: 2699, rating: 4.9, description: 'Premium Razer gaming laptop' }
]

  };

   categoryBackgrounds: { [key: string]: string } = {
    phones: 'assets/images/products/hero-bg.jpg',
    computers: 'assets/images/products/computers-bg.jpg',
    smartwatch: 'assets/images/products/smartwatches-bg.webp',
    camera: 'assets/images/products/cameras-bg.jpg',
    headphones: 'assets/images/products/headphones-bg.jpg',
    gaming: 'assets/images/products/gaming-bg.jpg'
  };

constructor(private route: ActivatedRoute, private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
}

  ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const name = params.get('name');
    if (name) this.categoryName = name.toLowerCase();
    this.loadCategoryItems();
    this.selectedCompany = '';
    this.selectedCompanyProducts = [];

    // Scroll to top after the DOM renders
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  });
}


  ngAfterViewChecked(): void {
    if (this.scrollToProducts && this.productsSection) {
      this.productsSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.scrollToProducts = false;
    }
  }
changeCategory(category: string) {
  this.categoryName = category;
  this.selectedCompany = '';
  this.selectedCompanyProducts = [];
}

  loadCategoryItems(): void {
  const itemsMap: { [key: string]: CategoryItem[] } = {
    phones: [
      { name: 'Flagship Phones' },
      { name: 'Mid-range Phones' },
      { name: 'Budget Phones' },
      { name: 'Foldables' }
    ],
    computers: [
      { name: 'Laptops' },
      { name: 'Desktops' },
      { name: 'Gaming PCs' },
      { name: 'Workstations' },
      { name: 'Monitors' },
      { name: 'Accessories' }
    ],
    smartwatch: [
      { name: 'Fitness Trackers' },
      { name: 'Luxury' },
      { name: 'Wear OS' },
      { name: 'GPS' },
      { name: 'Waterproof' }
    ],
    camera: [
      { name: 'DSLR' },
      { name: 'Mirrorless' },
      { name: 'Point & Shoot' },
      { name: 'Action Cameras' },
      { name: 'Lenses' },
      { name: 'Accessories' }
    ],
    headphones: [
      { name: 'Over-ear' },
      { name: 'In-ear' },
      { name: 'Wireless' },
      { name: 'Noise Cancelling' },
      { name: 'Gaming Headsets' },
      { name: 'Studio' }
    ],
    gaming: [
      { name: 'Consoles' },
      { name: 'Gaming Laptops' },
      { name: 'GPU' },
      { name: 'Peripherals' },
      { name: 'Controllers' },
      { name: 'Games' }
    ]
  };

  this.categoryItems = itemsMap[this.categoryName] || [];
  this.categorySubtitle = `Discover ${this.categoryName} products`;
}

selectCompany(company: Company) {
  this.selectedCompany = company.name;
  this.selectedCompanyProducts = this.productsDatabase[company.name] || [];



  

  // Trigger scroll
  this.scrollToProducts = true;
}


  swapImage(product: Product, img: string): void {
    const index = this.selectedCompanyProducts.indexOf(product);
    if (index !== -1) {
      this.selectedCompanyProducts[index] = {
        ...this.selectedCompanyProducts[index],
        images: [img, ...this.selectedCompanyProducts[index].images.filter(i => i !== img)]
      };
    }
  }

  getBackgroundImage(): string {
    return this.categoryBackgrounds[this.categoryName] || 'assets/images/bg/default-bg.jpg';
  }

  get filteredCompanies(): Company[] {
    return this.companies.filter(c => c.category === this.categoryName);
  }

  get browseOptions(): string[] {
    return this.categoriesConfig[this.categoryName] || [];
  }

  // Returns unique companies for the current category
getUniqueCompanies(): Company[] {
  const filtered = this.companies.filter(c => c.category === this.categoryName);
  const uniqueMap: { [name: string]: Company } = {};
  filtered.forEach(c => { uniqueMap[c.name] = c; });
  return Object.values(uniqueMap);
}

// Returns unique products for the selected company
getUniqueProducts(): Product[] {
  if (!this.selectedCompanyProducts) return [];
  const uniqueMap: { [name: string]: Product } = {};
  this.selectedCompanyProducts.forEach(p => { uniqueMap[p.name] = p; });
  return Object.values(uniqueMap);
}



// Cart Management
cart: any[] = [];

addToCart(product: any) {
  const existing = this.cart.find(item => item.name === product.name);
  if (existing) {
    existing.quantity += 1;
  } else {
    this.cart.push({ ...product, quantity: 1 });
  }
}

removeFromCart(index: number) {
  this.cart.splice(index, 1);
}

increaseQuantity(index: number) {
  this.cart[index].quantity += 1;
}

decreaseQuantity(index: number) {
  if (this.cart[index].quantity > 1) {
    this.cart[index].quantity -= 1;
  } else {
    this.removeFromCart(index);
  }
}

getCartTotal() {
  return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
}



showCheckout: boolean = false;
showLogin: boolean = false;
showSignup: boolean = false;

checkout() {
  this.showCheckout = true;
  this.showLogin = false;
  this.showSignup = false;
}

openLogin() {

  this.showLogin = true;
  this.showCheckout = false;
  this.showSignup = false;
}

openSignup() {
  this.showSignup = true;
  this.showLogin = false;
  this.showCheckout = false;
}

closeSection() {
  this.showCheckout = false;
  this.showLogin = false;
  this.showSignup = false;
}

onSignupSubmit(event: Event) {
  event.preventDefault();
  alert('Sign up form submitted!');
  this.closeSection();
}

getButtonLabel(): string {
    switch (this.selectedPaymentMethod) {
      case 'creditCard':
        return 'Pay ₹1,310.00 Now';
      case 'upi':
        return 'Pay via UPI';
      case 'netBanking':
        return 'Proceed to Net Banking';
      case 'cod':
        return 'Place Order (Cash on Delivery)';
      default:
        return 'Select a Payment Method';
    }
  }
}