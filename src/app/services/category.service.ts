import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  selectedCategory: Category | null = null;

  constructor() {}

  setSelectedCategory(category: Category) {
    this.selectedCategory = category;
  }

  getSelectedCategory(): Category | null {
    return this.selectedCategory;
  }

  clearSelectedCategory() {
    this.selectedCategory = null;
  }
}
