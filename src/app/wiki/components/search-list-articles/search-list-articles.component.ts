import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WIKI_ArticleService } from 'src/app/core/services/wiki/article.service';

@Component({
  selector: 'app-search-list-articles',
  templateUrl: './search-list-articles.component.html',
  styleUrl: './search-list-articles.component.scss'
})
export class SearchListArticlesComponent {
  showPopup: boolean = false;
  startDate!: string;
  dateModified: boolean = false; // Pour vérifier si la date a été modifiée par l'utilisateur
  categories: string[] = []; // Vous pouvez initialiser les catégories ici
  authors: string[] = []; // Vous pouvez initialiser les auteurs ici
  selectedCategory: string = '';
  selectedAuthor: string = '';
  selectedDate: string = ''; // Date sélectionnée par l'utilisateur

  allTags: any[]= [];
  selectedTags: string[] = [];
  tagsString: string = '';

  allCategories: string[]= [];

  articlesSearch: any[] = [];
  searchTerm: string = '';

  constructor(private WIKI_ArticleService: WIKI_ArticleService, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['term'] || '';
      console.log("Termes recherchés: ", this.searchTerm);
      this.searchArticles();
      this.setDefaultDate();
      console.log(this.articlesSearch);
    });
    this.WIKI_ArticleService.getAllCategories().subscribe(
      data => {
        this.allCategories = data.map(category => category.Name);
      },
      error => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
    this.WIKI_ArticleService.getAllTags().subscribe(
      data => {
        this.allTags = data;
      },
      error => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      console.log("Nouveaux termes recherchés: ", this.searchTerm);
      this.searchArticles();
    }
  }

  searchArticles() {
    let selectedDate = '';
    // Ajouter la date seulement si elle a été modifiée ou si elle est définie
    if (this.dateModified || this.startDate) {
      selectedDate = this.startDate;
    }

    this.WIKI_ArticleService.searchArticles(this.searchTerm, this.selectedCategory, this.selectedAuthor, selectedDate, this.selectedTags)
      .subscribe((response: any) => {
        console.log(response);
        this.articlesSearch = response;
      });
  }

  onDateChange() {
    this.dateModified = true; // Indique que la date a été modifiée par l'utilisateur
    this.onFilterChange();
  }

  setDefaultDate() {
    const currentDate = new Date();
    this.startDate = currentDate.toISOString().substr(0, 10);
    this.selectedDate = this.startDate;
  }

  onFilterChange() {
    this.searchArticles();
  }

  togglePopup(): void {
    this.showPopup = !this.showPopup;
  }

  onTagChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const tag = inputElement.value;
    if (inputElement.checked) {
      if (!this.selectedTags.includes(tag)) {
        this.selectedTags.push(tag);
      }
    } else {
      const index = this.selectedTags.indexOf(tag);
      if (index >= 0) {
        this.selectedTags.splice(index, 1);
      }
    }
    this.updateTagsString();
  }

  updateTagsString(): void {
    this.tagsString = this.selectedTags.join(', ');
  }

  navigateToNouvelArticle() {
    this.router.navigate(['/newArticle']);
  }
}
