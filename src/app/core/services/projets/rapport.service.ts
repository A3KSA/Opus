import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from "rxjs";
import { LogService } from "../log.service";
import { EnteteRapport } from "../../models/projets/enteteRapport.model";
import { Ligne } from "../../models/projets/ligne.model";
import { Router } from "@angular/router";

//Permet de définir cette classe comme un service.
@Injectable({
    //dit à Angular d'enregistrer ce service à la racine de l'application. permet de s'assurer de n'avoir qu'une seule instance du service, partagée par tous les partis intéressés.
    providedIn: 'root'
})
export class CDP_RapportsService {
    //Adresse pour accès à l'API
    private baseUrlAPI = '';

    //Chemin d'accès au fichier de config JSON.
    private _jsonURLSRV = '../../../assets/CONFIG/serverAddress.json';

    private allLinesSubject: BehaviorSubject<EnteteRapport[]> = new BehaviorSubject<EnteteRapport[]>([]);
    public allLines$: Observable<EnteteRapport[]> = this.allLinesSubject.asObservable();

    private entetesSubject = new BehaviorSubject<EnteteRapport[]>([]);
    entetes$ = this.entetesSubject.asObservable();


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

    /**
 * Fonction qui permet de garder la liste des lignes à jour avec ou sans filtres.
 * @param lines liste des lignes résultantes d'une requête SQL
 */
    updateAllLines(lines: EnteteRapport[]) {
        this.allLinesSubject.next(lines);
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
* Fonction permettant de récupérer toutes les entêtes d'un projet
* @returns un Observable avec toutes les etêtes sous forme de array.
*/
    getAllEntetes(projectId: number): Observable<EnteteRapport[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<EnteteRapport[]>(`${this.baseUrlAPI}/api/cdp/rapport/getEntetes?projectId=${projectId}`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, "getAllEntetes");
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                    map((data: any[]) => this.mapDataToEntetes(data)),
                    tap(entetes => {
                        this.entetesSubject.next(entetes);
                    })
                );
            })
        );
    }

    /**
* Fonction permettant de récupérer toutes les entêtes d'un projet
* @returns un Observable avec toutes les etêtes sous forme de array.
*/
    getAllEntites(projectId: number): Observable<string[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<string[]>(`${this.baseUrlAPI}/api/cdp/rapport/getEntites?projectId=${projectId}`).pipe(
                    map((data: any[]) => data.map(entite => entite.Libelle)), // Transformation ici
                    catchError((error) => {
                        this.handleAuthError(error, "getAllEntites");
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    /**
 * Fonction permettant de récupérer les données reçues (JSON) et les transformer en modèle de projet
 * @param data JSON reçu par la requête HTTP
 * @returns tableau d'objets EnteteRapport
 */
    private mapDataToEntetes(data: any[]): EnteteRapport[] {
        // Effectuez le mappage des données JSON en objets de type Projet
        return data.map((projetData: any) => {
            const projet = new EnteteRapport(
                projetData.PK_Rapport_Entete,
                projetData.Present,
                projetData.Absent,
                projetData.Excuse,
                projetData.Convoque,
                projetData.Distribution,
                projetData.Nom,
                projetData.Prenom,
                projetData.Initiales,
                projetData.Email,
                projetData.Telephone,
                projetData.Poste,
                projetData.Libelle,
                projetData.Entreprise
            );
            return projet;
        });
    }

    /**
     * Fonction permettant de modifier les checkbox des entêtes pour la génération des rapports
     * @param checkbox définit quel checkbox a été modifiée
     * @param valueCheckbox la nouvelle valeure
     * @param idEnteteRapport quel entête doit être modifiée
     * @returns un observable qui indique si cela s'est bien passé ou non
     */
    updateRapportEntete(checkbox: string, valueCheckbox: boolean, idEnteteRapport: number): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                const endpointUrl = `${this.baseUrlAPI}/api/cdp/rapport/updateSelectboxEntetes`;
                const body = { checkbox, valueCheckbox, idEnteteRapport };

                return this.http.post(endpointUrl, body).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, "updateRapportEntete");
                        this.handleError(error);
                        // Logique d'erreur spécifique ou retourne un Observable qui indique une erreur
                        return of(error); // Vous pouvez décider de retourner un Observable vide ou l'erreur
                    })
                );
            })
        );
    }

    insertNewImage(formData: FormData): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                const endpointUrl = `${this.baseUrlAPI}/api/cdp/rapport/insertImage`;
                return this.http.post<any>(endpointUrl, formData).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, "insertNewImage");
                        this.handleError(error);
                        // Logique d'erreur spécifique ou retourne un Observable qui indique une erreur
                        return of(error); // Vous pouvez décider de retourner un Observable vide ou l'erreur
                    })
                );
            })
        );
    }

    /**
   * Fonction permettant de récupérer toutes les lignes du projet sélectioné depuis SQL.
   * @returns un Observable avec toutes les Lignes de porjet sous forme de array.
   */
    getLinesForRapport(projectId: number): Observable<Ligne[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<Ligne[]>(`${this.baseUrlAPI}/api/cdp/rapport/getLines?projectId=${projectId}`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, "getLinesForRapport");
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                    map((data: any[]) => {
                        const lines = this.mapDataToLines(data);
                        return lines;
                    })
                );
            })
        );
    }

    /**
    * Fonction permettant de récupérer les données reçues (JSON) et les transformer en modèle de projet
    * @param data JSON reçu par la requête HTTP
    * @returns tableau d'objets Ligne
    */
    private mapDataToLines(data: any[]): Ligne[] {
        // Effectuez le mappage des données JSON en objets de type Projet
        return data.map((lineData: any) => {
            const line = new Ligne(
                lineData.PK_Ligne,
                lineData.DateCreation,
                lineData.DateModification,
                lineData.Ouvrage,
                lineData.Installation,
                lineData.Designation,
                lineData.Description,
                lineData.ResponsableNom,
                lineData.ResponsablePrenom,
                lineData.ResponsableInitiales,
                lineData.Delai,
                lineData.DateFin,
                lineData.FK_Projet,
                lineData.Impression,
                lineData.FK_Utilisateur,
                lineData.FK_ModifUser,
                lineData.Avancement,
                lineData.StatutType,
                lineData.Color,
                lineData.Libelle,
                []
            );
            return line;
        });
    }

    /**
   * Fonction permettant de récupérer toutes les lignes du projet sélectioné depuis SQL.
   * @returns un Observable avec toutes les Lignes de porjet sous forme de array.
   */
    getEmailsList(projectId: number): Observable<String[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<String[]>(`${this.baseUrlAPI}/api/cdp/rapport/getEmailsList?projectId=${projectId}`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, "getEmailsList");
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                    map((data: any[]) => {
                        return data;
                    })
                );
            })
        );
    }
}