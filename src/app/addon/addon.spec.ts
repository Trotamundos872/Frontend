import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addon } from './addon';

describe('Addon', () => {
  let component: Addon;
  let fixture: ComponentFixture<Addon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
