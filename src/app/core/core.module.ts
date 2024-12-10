import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpInterceptorProviders } from './interceptors';
import { RouterModule } from '@angular/router';
import { NewNavigationBarComponent } from './components/new-navigation-bar/new-navigation-bar/new-navigation-bar.component';
import { FooterComponent } from './components/footer/footer/footer.component';
import { FiltreLignesComponent } from './components/filtre-lignes/filtre-lignes.component';
import { FormsModule } from '@angular/forms';
import { FiltresLignesPcComponent } from './components/filtres-lignes-pc/filtres-lignes-pc.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginComponent } from './components/login/login.component';



@NgModule({
  declarations: [
    NewNavigationBarComponent,
    FooterComponent,
    FiltreLignesComponent,
    FiltresLignesPcComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatSnackBarModule
  ],
  exports: [
    NewNavigationBarComponent,
    FiltreLignesComponent,
    FiltresLignesPcComponent

  ],
  providers: [
    httpInterceptorProviders
  ]
})
export class CoreModule { }
