import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltreLignesComponent } from './filtre-lignes.component';

describe('FiltreLignesComponent', () => {
  let component: FiltreLignesComponent;
  let fixture: ComponentFixture<FiltreLignesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiltreLignesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltreLignesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
