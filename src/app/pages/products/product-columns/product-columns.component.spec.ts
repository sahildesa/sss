import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductColumnsComponent } from './product-columns.component';

describe('ProductColumnsComponent', () => {
  let component: ProductColumnsComponent;
  let fixture: ComponentFixture<ProductColumnsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductColumnsComponent]
    });
    fixture = TestBed.createComponent(ProductColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
