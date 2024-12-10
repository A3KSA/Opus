import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WIKI_ArticleService } from 'src/app/core/services/wiki/article.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent {
  allCategories: string[]= [];
  allTags: string[]= [];

  articlesByDate: any[] = [];
  articlesByPopularity: any[] = [];

  constructor(private router: Router, private WIKI_ArticleService: WIKI_ArticleService) {}

  ngOnInit(){
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
        this.allTags = data.map(tag => tag.Name);
      },
      error => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
    this.getPopulaireArticles();
    this.getDateArticles();
  }

  getPopulaireArticles(): void{
    this.WIKI_ArticleService.getAllArticlesByPopularity().subscribe(
      data => {
        this.articlesByPopularity = data;
      },
      error => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
  }

  getDateArticles(): void{
    this.WIKI_ArticleService.getAllArticlesByDate().subscribe(
      data => {
        this.articlesByDate = data;
      },
      error => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
  }

  navigateToNouvelArticle() {
    this.router.navigate(['/newArticle']);
  }
  
}