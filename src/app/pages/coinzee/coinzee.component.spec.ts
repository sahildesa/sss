import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinzeeComponent } from './coinzee.component';

describe('CoinzeeComponent', () => {
  let component: CoinzeeComponent;
  let fixture: ComponentFixture<CoinzeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoinzeeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoinzeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
