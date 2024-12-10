import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { DbService } from '../services/db.service';

@Injectable({
  providedIn: 'root'
})
export class CloseConnectionsGuard  {

  constructor(private dbService: DbService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.dbService.closeConnections().pipe(
      tap(() => true), // Si la fermeture est réussie, permet la navigation
      catchError((error) => {
        console.error('Failed to close connections', error);
        return [true]; // Permet la navigation même si la fermeture échoue
      })
    );
  }
}
