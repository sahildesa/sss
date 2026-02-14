import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-design',
  templateUrl: './upload-design.component.html',
  styleUrls: ['./upload-design.component.scss']
})
export class UploadDesignComponent implements OnInit {
  constructor(private router: Router) {}

  uploadedImage: string | null = null;
  storedImage: string | null = null;

  productName: string = 'USA made plastic bike water bottle push spout 20 oz';
  description: string = '';
  note: string = '';

  colors: string[] = ['Black', 'White', 'Red', 'Blue'];
  sizes: string[] = ['20 oz'];
  newColor: string = '';

  selectedColor: string | null = null;
  selectedSize: string | null = null;

  ngOnInit(): void {
    this.storedImage = localStorage.getItem('uploadedImage');
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedImage = reader.result as string;
        localStorage.setItem('uploadedImage', this.uploadedImage);
      };
      reader.readAsDataURL(file);
    }
  }

  removeUploadedImage(): void {
    this.uploadedImage = null;
    localStorage.removeItem('uploadedImage');
  }

  goToPopup(): void {
    const imageToUse = this.uploadedImage || this.storedImage;
    if (imageToUse) {
      localStorage.setItem('uploadedProductImage', imageToUse);
      this.router.navigate(['/customizedesgine']);
    } else {
      alert('Please upload an image first.');
    }
  }

  selectColor(color: string): void {
    this.selectedColor = color;
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  isSelectedColor(color: string): boolean {
    return this.selectedColor === color;
  }

  isSelectedSize(size: string): boolean {
    return this.selectedSize === size;
  }

  addColor(): void {
    const color = this.newColor.trim();
    if (color && !this.colors.includes(color)) {
      this.colors.push(color);
      this.selectedColor = color;
    }
    this.newColor = '';
  }
}
