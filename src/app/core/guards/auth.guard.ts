import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from '../services/auth.service';
import { DbService } from '../services/db.service';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard {

  constructor(private auth: AuthService, private router: Router, private dbService: DbService) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (this.auth.isLoggedIn()) {
      console.log("canActivate: YES");
      return true;
    } else {
      console.log("canActivate: NO");
      return this.dbService.closeConnections().pipe(
        map(() => {
          // Sauvegarder l'URL avant redirection
          console.log(state.url);
          this.auth.redirectUrl = state.url;
          this.router.navigateByUrl('/login');
          return false;
        }),
        catchError(err => {
          console.error('Failed to close connections', err);
          this.router.navigateByUrl('/login');
          return of(false);
        })
      );
    }
  }
}