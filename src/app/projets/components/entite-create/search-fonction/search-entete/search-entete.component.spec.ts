import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchEnteteComponent } from './search-entete.component';

describe('SearchEnteteComponent', () => {
  let component: SearchEnteteComponent;
  let fixture: ComponentFixture<SearchEnteteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchEnteteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchEnteteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
