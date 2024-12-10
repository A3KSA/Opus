import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchListArticlesComponent } from './search-list-articles.component';

describe('SearchListArticlesComponent', () => {
  let component: SearchListArticlesComponent;
  let fixture: ComponentFixture<SearchListArticlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchListArticlesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchListArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
