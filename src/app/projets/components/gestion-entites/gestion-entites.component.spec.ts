import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionEntitesComponent } from './gestion-entites.component';

describe('GestionEntitesComponent', () => {
  let component: GestionEntitesComponent;
  let fixture: ComponentFixture<GestionEntitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionEntitesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionEntitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
