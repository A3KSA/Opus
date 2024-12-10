import { Injectable } from '@angular/core';
import { Authentification } from '../models/authentification.model';
import { BehaviorSubject, Observable, catchError, map, of, retry, switchMap, take, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LogService } from './log.service';
import { User } from './projets/projet.service';
import { Utilisateur } from '../models/projets/utilisateur.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token!: string;
  private user: any;
  private readonly SESSION_KEY = 'user_session';

  private baseUrlAPI = '';
  private auth$!: Observable<Authentification>;

  //Chemin d'accès au fichier de config JSON.
  private _jsonURL = '../../../assets/CONFIG/serverAddress.json';

  private isLogged = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLogged.asObservable();

  public redirectUrl: string | null = null;

  constructor(private http: HttpClient, private logger: LogService) {
    this.isLogged.next(true);
  }

  login(user: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.auth$ = this.checkAuthentificationApp(user);
      this.auth$.subscribe(response => {
        console.log(response);
        if (response.auth === 'OK') {
          console.log("Authentification OK !");
          const userSession = {
            user: user,
            token: response.token // Remplacez par le jeton réel reçu de l'API
          };
          console.log(userSession);
          sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(userSession));
          this.isLogged.next(true);
          this.logger.info("Login successfully with user " + user);
          resolve(true);
        } else {
          console.log("Authentification NOK !");
          /*this.logger.info("Login failed with user " + user);*/
          resolve(false);
        }
      }, error => {
        reject(error);
      });
    });
  }


  isLoggedIn(): boolean {
    return sessionStorage.getItem(this.SESSION_KEY) !== null;
  }

  getUserSession(): any {
    const session = sessionStorage.getItem(this.SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }

  loggedOut(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.isLogged.next(false);
  }

  getCurrentFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    const seconds = this.padZero(date.getSeconds());
    return `${day}.${month}.${year} - ${hours}:${minutes}:${seconds}`;
  }

  padZero(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

  /**
   * Fonction permettant d'envoyer une requête à l'API Node-red afin de contrôler les identifiants entré par l'utilisateur
   * @param user 
   * @param mdp 
   * @returns Retourne un JSON avec "OK" ainsi qu'un token afin de valider la connexion ou simplement un "NOK",
   */
  /*checkAuthentification(user: string): Observable<Authentification> {
    return this.readServeurAdress().pipe(
      tap((response) => console.log('Server address:', response)), // Log server address
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.get<Authentification>(`${this.baseUrlAPI}/api/cdp/processLogin?user=${user}`).pipe(
          catchError((error) => {
            console.log(error);
            this.logger.error("Request to Nodejs API to check authentication failed");
            this.logger.info("Check your installation, maybe restart the service.");
            return of();
          })
        );
      }),
    );
  }*/

  checkAuthentificationApp(user: string): Observable<Authentification> {
    return this.readServeurAdress().pipe(
      tap((response) => console.log('Server address:', response)), // Log server address
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.get<Authentification>(`${this.baseUrlAPI}/api/admin/processLogin?user=${user}`).pipe(
          catchError((error) => {
            console.log(error);
            this.logger.error("Request to Nodejs API to check authentication failed");
            this.logger.info("Check your installation, maybe restart the service.");
            return of();
          })
        );
      }),
    );
  }

  getInfosLoggedUser(user: string): Observable<any> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.get<any>(`${this.baseUrlAPI}/api/admin/getInfosUser?user=${user}`).pipe(
          tap((data) => {
            console.log("getInfosLoggedUser response:", data);
          }),
          catchError((error) => {
            console.log(error);
            this.logger.error("Request to Nodejs API to check authentication failed");
            this.logger.info("Check your installation, maybe restart the service.");
            return of();
          })
        );
      })
    );
  }

  readServeurAdress(): Observable<string> {
    return this.http.get<string>(`${this._jsonURL}`).pipe(
      map((response: any) => response.serverAddress)
    );
  }
}