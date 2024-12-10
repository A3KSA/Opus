import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { CloseConnectionsGuard } from '../core/guards/closeConnections.guard';
import { NewArticleComponent } from './components/articles/new-article/new-article.component';
import { SearchListArticlesComponent } from './components/search-list-articles/search-list-articles.component';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  { path: 'wiki', component: HomePageComponent, canActivate: [AuthGuard, CloseConnectionsGuard] },
  { path: 'newArticle', component: NewArticleComponent, canActivate: [CloseConnectionsGuard] },
  { path: 'searchArticle', component: SearchListArticlesComponent, canActivate: [CloseConnectionsGuard] },
];

@NgModule({
  imports: [
      RouterModule.forChild(routes)
  ],
  exports: [
      RouterModule
  ]
})
export class WikiRoutingModule { }
