import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposComponent } from './tipos.component';

describe('TiposComponent', () => {
  let component: TiposComponent;
  let fixture: ComponentFixture<TiposComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiposComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
