import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject, catchError, map, of, switchMap, tap, throwError } from "rxjs";
import { LogService } from "../log.service";
import { Router } from "@angular/router";

//Permet de définir cette classe comme un service.
@Injectable({
    //dit à Angular d'enregistrer ce service à la racine de l'application. permet de s'assurer de n'avoir qu'une seule instance du service, partagée par tous les partis intéressés.
    providedIn: 'root'
})
export class WIKI_ArticleService {
    //Adresse pour accès à l'API
    private baseUrlAPI = '';

    //Chemin d'accès au fichier de config JSON.
    private _jsonURLSRV = '../../../assets/CONFIG/serverAddress.json';

    constructor(private http: HttpClient, private logger: LogService, private router: Router) { }

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
* Fonction permettant de récupérer toutes les STEP de la base de données des Heures JPiller
* @returns un Observable avec toutes les STEP sous forme de array.
*/
    getAllArticlesByPopularity(): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/wiki/getAllArticlesByPopularity`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getAllArticlesByPopularity');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    /**
* Fonction permettant de récupérer toutes les STEP de la base de données des Heures JPiller
* @returns un Observable avec toutes les STEP sous forme de array.
*/
    getAllArticlesByDate(): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/wiki/getAllArticlesByDate`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getAllArticlesByDate');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    getAllCategories(): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/wiki/getAllCategories`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getAllCategories');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    getAllTags(): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/wiki/getAllTags`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getAllTags');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }


    // Méthode pour sauvegarder l'article
    saveNewArticle(article: any): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post(`${this.baseUrlAPI}/api/wiki/newArticle`, article).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'saveNewArticle');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    // Méthode pour uploader l'image
    uploadImageArticle(file: File, articleId: string): Observable<any> {
        const formData = new FormData();
        formData.append('image', file);
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post(`${this.baseUrlAPI}/api/wiki/uploadNewImage/${articleId}`, formData).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'uploadImageArticle');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    searchArticles(term: string, category: string, author: string, date: string, tags: string[]): Observable<any[]> {
        let params = new HttpParams();
        if (term) {
          params = params.set('term', term);
        }
        if (category) {
          params = params.set('category', category);
        }
        if (author) {
          params = params.set('author', author);
        }
        if (date) {
            console.log(date);
          params = params.set('date', date);
        }
        if (tags && tags.length > 0) {
          params = params.set('tags', tags.join(','));
        }
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/wiki/searchArticles`, { params }).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'uploadImageArticle');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }
}