import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject, catchError, map, of, switchMap, tap, throwError } from "rxjs";
import { LogService } from "../log.service";
import { CDP_RapportsService } from "./rapport.service";
import { Router } from "@angular/router";

//Permet de définir cette classe comme un service.
@Injectable({
    //dit à Angular d'enregistrer ce service à la racine de l'application. permet de s'assurer de n'avoir qu'une seule instance du service, partagée par tous les partis intéressés.
    providedIn: 'root'
})
export class CDP_EnteteService {
    //Adresse pour accès à l'API
    private baseUrlAPI = '';

    //Chemin d'accès au fichier de config JSON.
    private _jsonURLSRV = '../../../assets/CONFIG/serverAddress.json';

    //Refresh pour les entêtes
    private refreshNeeded$ = new Subject<void>();
    get refreshNeeded() {
        return this.refreshNeeded$.asObservable();
    }
    triggerRefresh() {
        this.refreshNeeded$.next();
    }

    constructor(private http: HttpClient, private logger: LogService, private rapportService: CDP_RapportsService, private router: Router) { }

    /**
  * fonction pour lire le fichier de config contenant l'adresse du serveur Node-Red.
  * @returns response si atteignable ou non.
  */
    readServeurAdress(): Observable<string> {
        return this.http.get<string>(`${this._jsonURLSRV}`).pipe(
            map((response: any) => response.serverAddress)
        );
    }

    private handleAuthError(error: any, fonctionName: string): Observable<any> {
        if (error.status === 401 && (error.error.message === 'Token expired. Please log in again.' || error.error.message === 'Token invalid. Please log in again.')) {
            sessionStorage.removeItem('user_session'); // Supprimez le token stocké
            this.router.navigate(['/login']); // Redirigez vers la page de connexion
        } else {
            this.logger.error("Request '" + fonctionName + "' to API failed");
            this.logger.info("check your installation, maybe restart the service.");
        }
        console.log(error);
        return throwError(error);
    }

    private handleError(error: any) {
        // Handle different error statuses
        if (error.status === 400) {
            this.logger.error('Bad Request: ' + error.error.message);
        } else if (error.status === 401) {
            this.logger.error('Unauthorized: ' + error.error.message);
        } else if (error.status === 500) {
            this.logger.error('Internal Server Error: ' + error.error.message);
        } else {
            this.logger.error('An unknown error occurred: ' + error.message);
        }
    }

    /**
     * Fonction qui va contrôler si le nom de l'entité inséré par l'utilisateur existe déjà ou non dans la base de données
     * @param entityName 
     * @returns 
     */
    checkInfosAndInsertNewEntete(checkInfos: {}): Observable<any> {
        console.log(checkInfos);
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/cdp/rapport/checkInfosNewEntete`, checkInfos).pipe(
                    map((result) => {
                        return result && result.length > 0;
                    }),
                    catchError((error) => {
                        this.handleAuthError(error, 'getAllProjects');
                        this.handleError(error);
                        return of(false); // Retourne false en cas d'erreur
                    })
                );
            })
        );
    }
}