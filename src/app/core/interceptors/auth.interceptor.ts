import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly SESSION_KEY = 'user_session';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const userSessionString = sessionStorage.getItem(this.SESSION_KEY);
    let userSession = null;

    if (userSessionString) {
      try {
        userSession = JSON.parse(userSessionString);
      } catch (e) {
        console.error('Error parsing user session from sessionStorage', e);
      }
    }

    if (userSession && userSession.token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${userSession.token}`)
      });
      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
  }
}