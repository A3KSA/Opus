import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WikiRoutingModule } from './wiki-routing.module';
import { HomePageComponent } from './components/home-page/home-page.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ContentComponent } from './components/content/content.component';
import { ArticleItemComponent } from './components/articles/article-item/article-item.component';
import { NewArticleComponent } from './components/articles/new-article/new-article.component';
import { QuillModule } from 'ngx-quill';
import Quill from 'quill';
import ImageResize from 'quill-image-resize';
import { SearchListArticlesComponent } from './components/search-list-articles/search-list-articles.component';

Quill.register('modules/imageResize', ImageResize);

@NgModule({
  declarations: [
    HomePageComponent,
    ContentComponent,
    ArticleItemComponent,
    NewArticleComponent,
    SearchListArticlesComponent
  ],
  imports: [
    CommonModule,
    WikiRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    QuillModule.forRoot()

  ],
  exports: [
    HomePageComponent
  ]
})
export class WikiModule { }
