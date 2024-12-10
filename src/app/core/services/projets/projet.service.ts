import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LogService } from "../log.service";
import { Projet } from "../../models/projets/projet.model";
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from "rxjs";
import { Ligne } from "../../models/projets/ligne.model";
import { Note } from "../../models/projets/note.model";
import { Complement } from "../../models/projets/complement.model";
import { Router } from "@angular/router";

//Permet de définir cette classe comme un service.
@Injectable({
    //dit à Angular d'enregistrer ce service à la racine de l'application. permet de s'assurer de n'avoir qu'une seule instance du service, partagée par tous les partis intéressés.
    providedIn: 'root'
})
export class CDP_ProjetsService {
    //Adresse pour accès à l'API
    private baseUrlAPI = '';

    //Chemin d'accès au fichier de config JSON.
    private _jsonURLSRV = '../../../assets/CONFIG/serverAddress.json';

    private allLinesSubject: BehaviorSubject<Ligne[]> = new BehaviorSubject<Ligne[]>([]);
    public allLines$: Observable<Ligne[]> = this.allLinesSubject.asObservable();

    private notesSubjectListener = new BehaviorSubject<any[]>([]);
    notesListener = this.notesSubjectListener.asObservable();

    private complementSubjectListener = new BehaviorSubject<any[]>([]);
    complementListener = this.complementSubjectListener.asObservable();

    private searchTermsSubject = new BehaviorSubject<{ term1: string, term2: string }>({ term1: '', term2: '' });
    searchTerms$ = this.searchTermsSubject.asObservable();

    private projectId!: number;


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
     * Fonction qui permet de recevoir le numéro du projet sélectioné
     * @param FK_Project Numéro du projet
     */
    setProjectId(FK_Project: number) {
        this.projectId = FK_Project;
    }

    /**
     * Fonction qui permet de garder la liste des lignes à jour avec ou sans filtres.
     * @param lines liste des lignes résultantes d'une requête SQL
     */
    updateAllLines(lines: Ligne[]) {
        this.allLinesSubject.next(lines);
    }

    updateNotes(notes: any[]) {
        this.notesSubjectListener.next(notes);
    }

    updateComplement(complements: any[]) {
        this.complementSubjectListener.next(complements);
    }

    setSearchTerms(term1: string, term2: string) {
        this.searchTermsSubject.next({ term1, term2 });
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
    getAllProjects(): Observable<Projet[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<Projet[]>(`${this.baseUrlAPI}/api/cdp/projets/getProjets`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getAllProjects');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                    map((data: any[]) => this.mapDataToProjects(data))
                );
            })
        );
    }

    /**
* Fonction permettant de récupérer toutes les STEP de la base de données des Heures JPiller
* @returns un Observable avec toutes les STEP sous forme de array.
*/
    getFavProjects(initiales: string): Observable<Projet[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<Projet[]>(`${this.baseUrlAPI}/api/cdp/favoris/getFavoris?utilisateur=${initiales}`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getFavProjects');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                    map((data: any[]) => this.mapDataToProjects(data))
                );
            })
        );
    }

    /**
* Fonction permettant de récupérer toutes les STEP de la base de données des Heures JPiller
* @returns un Observable avec toutes les STEP sous forme de array.
*/
    setFavProjects(data: {}): Observable<Projet> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<Projet>(`${this.baseUrlAPI}/api/cdp/favoris/setFavori`, data).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'setFavProjects');
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
    removeFavProject(data: {}): Observable<Projet> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<Projet>(`${this.baseUrlAPI}/api/cdp/favoris/removeFavori`, data).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'removeFavProject');
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
    checkIsFavProjects(data: {}): Observable<{ isFavori: number }> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<{ isFavori: number }>(`${this.baseUrlAPI}/api/cdp/favoris/checkIsFavori`, data).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'checkIsFavProjects');
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
     * @returns tableau d'objets projets
     */
    private mapDataToProjects(data: any[]): Projet[] {
        // Effectuez le mappage des données JSON en objets de type Projet
        return data.map((projetData: any) => {
            let iconePath = projetData.Icone;
            if (iconePath == null) {
                iconePath = '../../../../assets/img/projets/Defaut.jpg';
            }
            const projet = new Projet(
                projetData.PK_Projet,
                projetData.Numero,
                projetData.Projet,
                projetData.Localite,
                projetData.Description,
                iconePath,
                projetData.DateCreation,
                projetData.DateModification
            );
            return projet;
        });
    }

    /**
* Fonction permettant de récupérer toutes les notes d'une ligne ouvrage spécifique
* @returns un Observable avec toutes les notes de l'ouvrage
*/
    getNotesFromSpecificLigne(ligneId: number): Observable<Note[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<Note[]>(`${this.baseUrlAPI}/api/cdp/notes/getNotes?ligneId=${ligneId}`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getNotesFromSpecificLigne');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                    map((data: any[]) => this.mapDataToNote(data))
                );
            })
        );
    }

    /**
 * Fonction permettant de récupérer les données reçues (JSON) et les transformer en modèle de note
 * @param data JSON reçu par la requête HTTP
 * @returns tableau d'objets note
 */
    private mapDataToNote(data: any[]): Note[] {
        // Effectuez le mappage des données JSON en objets de type Projet
        return data.map((noteData: any) => {
            const note = new Note(
                noteData.PK_Notes,
                noteData.Date,
                noteData.Note,
                noteData.Initiales,
            );
            return note;
        });
    }

    getHasNotesForAllLignes(ligneId: number): Observable<number> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<number>(`${this.baseUrlAPI}/api/cdp/notes/areThereNotes?ligneId=${ligneId}`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getHasNotesForAllLignes');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                );
            })
        );
    }

    deleteSpecificNote(noteId: number): Observable<number> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<number>(`${this.baseUrlAPI}/api/cdp/notes/deleteNote?noteId=${noteId}`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'deleteSpecificNote');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                );
            })
        );
    }

    insertNewNote(newNote: {}): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/cdp/notes/addNote`, newNote).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'insertNewNote');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    /**
       * Fonction permettant de récupérer toutes les lignes du projet sélectioné depuis SQL.
       * @returns un Observable avec toutes les Lignes de porjet sous forme de array.
       */
    getLinesWithoutFilter(): Observable<Ligne[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<Ligne[]>(`${this.baseUrlAPI}/api/cdp/projets/${this.projectId}`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getLinesWithoutFilter');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                    map((data: any[]) => {
                        const lines = this.mapDataToLines(data);
                        this.updateAllLines(lines); // Mettre à jour la liste des lignes stockées 
                        return lines;
                    })
                );
            })
        );
    }

    /**
   * Fonction permettant de récupérer toutes les lignes du projet sélectioné depuis SQL.
   * @returns un Observable avec toutes les Lignes de porjet sous forme de array.
   */
    getResponsablesToInsertNewLine(): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/cdp/lines/getResponsables?projectId=${this.projectId}`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getLinesWithoutFilter');
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
    deleteSpecificLine(lineId: number): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.delete<any>(`${this.baseUrlAPI}/api/cdp/lines/deleteLine?lineId=${lineId}`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'deleteSpecificLine');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                    tap(() => { this.getLinesWithoutFilter().subscribe(); })
                );
            })
        );
    }

    /**
       * Fonction permettant de récupérer toutes les STEP de la base de données des Heures JPiller
       * @returns un Observable avec toutes les STEP sous forme de array.
       */
    getInstallationsFilter(FK_Project: number): Observable<String[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<String[]>(`${this.baseUrlAPI}/api/cdp/filter/getInstallations`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getInstallationsFilter');
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

    /**
       * Fonction permettant de récupérer toutes les STEP de la base de données des Heures JPiller
       * @returns un Observable avec toutes les STEP sous forme de array.
       */
    getOuvragesFilter(FK_Project: number): Observable<String[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<String[]>(`${this.baseUrlAPI}/api/cdp/filter/getOuvrages`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getOuvragesFilter');
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

    /**
       * Fonction permettant de récupérer toutes les STEP de la base de données des Heures JPiller
       * @returns un Observable avec toutes les STEP sous forme de array.
       */
    getResponsablesFilter(FK_Project: number): Observable<String[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<String[]>(`${this.baseUrlAPI}/api/cdp/filter/getResponsables`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getResponsablesFilter');
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

    /**
   * Fonction permettant de récupérer toutes les STEP de la base de données des Heures JPiller
   * @returns un Observable avec toutes les STEP sous forme de array.
   */
    getEntitesFilter(FK_Project: number): Observable<String[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<String[]>(`${this.baseUrlAPI}/api/cdp/filter/getEntites`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getEntitesFilter');
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

    /**
       * Fonction permettant de récupérer toutes les lignes du projet en fonction des statuts qui ont été sélectionné
       * @returns un Observable avec toutes les lignes qui correspondent au statut.
       */
    getFilteredList(FK_Project: number, statusFilters: string[], Installation: string, Ouvrage: string, Responsable: string, Entite: string): Observable<Ligne[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;

                // Encode each parameter individually
                const encodedInstallation = encodeURIComponent(Installation);
                const encodedOuvrage = encodeURIComponent(Ouvrage);
                const encodedResponsable = encodeURIComponent(Responsable);
                const encodedEntite = encodeURIComponent(Entite);
                // Construct status filters part only if statusFilters is defined and not empty
                const encodedStatusFilters = statusFilters && statusFilters.length > 0
                    ? statusFilters.map(status => `status=${encodeURIComponent(status)}`).join('&')
                    : '';

                // Construct the URL with encoded parameters
                const url = `${this.baseUrlAPI}/api/cdp/filter/applyFilters?projectId=${FK_Project}&${encodedStatusFilters}&installation=${encodedInstallation}&ouvrage=${encodedOuvrage}&responsable=${encodedResponsable}&entite=${encodedEntite}`;

                return this.http.get<Ligne[]>(url).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getFilteredList');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                    map((data: any[]) => {
                        const lines = this.mapDataToLines(data); // Transforme chaque résultat en objet ligne
                        this.updateAllLines(lines); // Mettre à jour la liste des lignes stockées 
                        return lines;
                    })
                );
            })
        );
    }


    /**
   * Fonction permettant de récupérer toutes les lignes du projet en fonction des statuts qui ont été sélectionné
   * @returns un Observable avec toutes les lignes qui correspondent au statut.
   */
    insertNewLine(newLine: FormData): Observable<any> {
        console.log(newLine);
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/cdp/lines/insertLine`, newLine).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'insertNewLine');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                    tap(() => {
                        // Après une mise à jour réussie, récupérer les lignes actualisées
                        this.getLinesWithoutFilter().subscribe();
                    })
                );
            })
        );
    }

    /**
* Fonction permettant de récupérer toutes les lignes du projet en fonction des statuts qui ont été sélectionné
* @returns un Observable avec toutes les lignes qui correspondent au statut.
*/
    updateExistingLine(updatingLine: FormData): Observable<any> {
        console.log("formData: ", updatingLine)
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/cdp/lines/updateLine`, updatingLine).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'updateExistingLine');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                    tap(() => {
                        // Après une mise à jour réussie, récupérer les lignes actualisées
                        this.getLinesWithoutFilter().subscribe();
                    })
                );
            })
        );
    }

    updateLinestoSetLateStatus(FK_Project: number): Observable<any> {
        console.log(FK_Project);
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get(`${this.baseUrlAPI}/api/cdp/lines/setLateLines?FK_Project=${FK_Project}`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'updateLinestoSetLateStatus');
                        this.handleError(error);
                        // Logique d'erreur spécifique ou retourne un Observable qui indique une erreur
                        return of(); // Vous pouvez décider de retourner un Observable vide ou l'erreur
                    })
                );
            })
        );
    }

    searchResponsable(): Observable<User[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                const endpointUrl = `${this.baseUrlAPI}/api/cdp/rapport/getResponsables`;
                return this.http.get(endpointUrl).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'searchResponsable');
                        this.handleError(error);
                        // Logique d'erreur spécifique ou retourne un Observable qui indique une erreur
                        return of(error); // Vous pouvez décider de retourner un Observable vide ou l'erreur
                    })
                );
            })
        );
    }

    uploadImageToProject(image: File, projetName: string): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('image', image, image.name);
        formData.append('projetName', projetName);
        console.log(image.name);
        console.log(projetName);
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                const endpointUrl = `${this.baseUrlAPI}/cdp/projet/uploadImage`;
                return this.http.post(endpointUrl, formData).pipe(
                    catchError((error) => {
                        this.logger.error("Failed to update Rapport Entete");
                        this.logger.info("Check your Node-Red installation, maybe restart the service.");
                        // Logique d'erreur spécifique ou retourne un Observable qui indique une erreur
                        return of(error); // Vous pouvez décider de retourner un Observable vide ou l'erreur
                    })
                );
            })
        );
    }

    /**
* Fonction permettant de récupérer toutes les lignes du projet en fonction des statuts qui ont été sélectionné
* @returns un Observable avec toutes les lignes qui correspondent au statut.
*/
    insertNewProject(projectData: FormData): Observable<any> {
        console.log(projectData);
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/cdp/projets/newProjet`, projectData).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'insertNewProject');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    /**
* Fonction permettant de récupérer toutes les lignes du projet en fonction des statuts qui ont été sélectionné
* @returns un Observable avec toutes les lignes qui correspondent au statut.
*/
    updateExistingProject(projectData: FormData): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/cdp/projets/updateProjet`, projectData).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'updateExistingProject');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                );
            })
        );
    }

    getComplementFromSpecificLine(ligneId: number): Observable<Complement[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<Complement[]>(`${this.baseUrlAPI}/api/cdp/complements/getComplements?lineId=${ligneId}`).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'getComplementFromSpecificLine');
                        this.handleError(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                    map((data: any[]) => {
                        const lines = this.mapDataToComplement(data); // Transforme chaque résultat en objet ligne
                        return lines;
                    })
                );
            })
        );
    }

    insertComplementFromSpecificLine(newComplement: {}): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/cdp/complements/addComplement`, newComplement).pipe(
                    catchError((error) => {
                        this.handleAuthError(error, 'insertComplementFromSpecificLine');
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
     * @returns tableau d'objets Ligne
     */
    private mapDataToComplement(data: any[]): Complement[] {
        // Effectuez le mappage des données JSON en objets de type Projet
        return data.map((ComplementData: any) => {
            const line = new Complement(
                ComplementData.PK_Complement,
                ComplementData.Date,
                ComplementData.Description,
                ComplementData.Type,
                ComplementData.Color,
                ComplementData.FK_Ligne
            );
            return line;
        });
    }
}


export interface User {
    Nom: string;
    Prenom: string;
    Entreprise: string;
    Initiales: string;
    Poste: string;
    Email: string;
    Telephone: string;
    // Ajoutez d'autres propriétés si nécessaire
}