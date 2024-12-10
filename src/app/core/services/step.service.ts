import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Step } from "../models/steps/step.model";
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from "rxjs";
import { LogService } from "./log.service";
import { Exploitant } from "../models/steps/exploitant.model";
import { Intervention } from "../models/steps/intervention.model";
import { Projet } from "../models/steps/projet.model";
import { Document } from "../models/steps/document.model";
import { Router } from "@angular/router";

//Permet de définir cette classe comme un service.
@Injectable({
  //dit à Angular d'enregistrer ce service à la racine de l'application. permet de s'assurer de n'avoir qu'une seule instance du service, partagée par tous les partis intéressés.
  providedIn: 'root'
})
export class STEPService {
  //Adresse pour accès à l'API
  private baseUrlAPI = '';

  //Chemin d'accès au fichier de config JSON.
  private _jsonURLSRV = '../../../assets/CONFIG/serverAddress.json';

  private interventions: Intervention[] = [];

  private projets: Projet[] = [];

  private documents: Document[] = [];

  private notesSubject = new BehaviorSubject<any[]>([]);
  notes$: Observable<any[]> = this.notesSubject.asObservable();

  private documentAddedSource = new BehaviorSubject<void>(undefined);
  documentAdded$ = this.documentAddedSource.asObservable();

  private stepsSubject = new BehaviorSubject<any[]>([]);
  steps$ = this.stepsSubject.asObservable();

  constructor(private http: HttpClient, private logger: LogService, private router: Router) { }

  setNotes(notes: any[]): void {
    this.notesSubject.next(notes);
  }

  deleteNote(noteId: number): void {
    const currentNotes = this.notesSubject.value;
    const updatedNotes = currentNotes.filter(note => note.PK_Information !== noteId);
    console.log("updatedNotes", currentNotes);
    this.notesSubject.next(updatedNotes);
  }

  notifyDocumentAdded() {
    this.documentAddedSource.next();
  }

  /**
   * Fonction pour récupérer les steps depuis le serveur
   */
  refreshSteps(): void {
    this.getAllSTEPs().subscribe(
      (steps) => this.stepsSubject.next(steps),
      (error) => {
        console.error('Erreur lors de la récupération des steps', error);
      }
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
  getAllSTEPs(): Observable<Step[]> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.get<Step[]>(`${this.baseUrlAPI}/api/steps/getAllSteps`).pipe(
          catchError((error) => {
            this.handleAuthError(error, "getAllSTEPs");
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
  getStepbyId(stepId: string): Observable<Step> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.get<Step>(`${this.baseUrlAPI}/api/steps/getStepByID?stepId=${stepId}`).pipe(
          catchError((error) => {
            this.handleAuthError(error, "getStepbyId");
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
  getCollaborateursFilter(): Observable<string[]> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.get<string[]>(`${this.baseUrlAPI}/api/steps/getCollaborateurs`).pipe(
          catchError((error) => {
            this.handleAuthError(error, "getCollaborateursFilter");
            this.handleError(error);
            return of(); // Retourne un tableau vide en cas d'erreur
          })
        );
      })
    );
  }

  getInfosSpecificSTEP(idClient: {}): Observable<Step[]> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post<Step[]>(`${this.baseUrlAPI}/step/getInfosSpecificSTEP`, idClient).pipe(
          catchError((error) => {
            this.handleAuthError(error, "getInfosSpecificSTEP");
            this.handleError(error);
            return of(); // Retourne un tableau vide en cas d'erreur
          })
        );
      })
    );
  }

  /**
 * Fonction pour transformer les STEPs reçues en array en modèle de STEP
 * @param item Element de l'array des STEP
 * @returns modèle de STEP avec infos
 */
  transformArrayToStep(item: any): Step {
    let iconePath = item.ICONE;
    if (iconePath == null) {
      iconePath = '../../../../assets/img/steps/Defaut.jpg';
    }
    const projets: Projet[] = []; // Ajoutez ici la logique pour la correspondance des projets
    const step: Step = new Step(
      item.ID_CLIENT,
      item.NOM,
      item.ADRESSE_01,
      item.LOCALITE,
      item.NO_POSTALE,
      item.LATITUDE,
      item.LONGITUDE,
      item.MAIL_01,
      item.NO_TELEPHONE_01,
      iconePath,
      this.getExploitantsFromStep(item),
      item.INFOS_INSTALL, // Ajoutez ici la correspondance pour la remarque
      this.interventions,
      projets
    );
    return step;
  }

  /**
   * fonction permettant de récupérer toutes les interventions d'une STEP sélectionnée dans une plage de date donnée.
   * @returns un observable avec la liste des interventions d'une STEP donnée dans cette plage.
   */
  getFilteredInterventionsFromSelectedSTEP(nomStep: string, startDate: string, endDate: string, collaborateur: string): Observable<Intervention[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      nomStep: nomStep,
      startDate: startDate,
      endDate: endDate,
      collaborateur: collaborateur
    };
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post<Intervention[]>(`${this.baseUrlAPI}/api/steps/getInterventions`, body, { headers: headers }).pipe(
          catchError((error) => {
            this.handleAuthError(error, "getFilteredInterventionsFromSelectedSTEP");
            this.handleError(error);
            return of(); // Retourne un tableau vide en cas d'erreur
          })
        );
      })
    );
  }

  /**
 * Fonction pour transformer les STEPs reçues en array en modèle d'Interventions
 * @param item Element de l'array des STEP
 * @returns modèle de STEP avec infos
 */
  transformArrayToInterventions(item: any): Intervention {
    var date = item.DATE;
    var dateFinale = date.replace('T00:00:00.000Z', '');
    var time = Number((item.DUREE).toFixed(1));

    const intervention: Intervention = new Intervention(
      item.INIT_COLLABORATEUR.toUpperCase(),
      item.NOM,
      item.PRENOM,
      this.formatDate(dateFinale),
      time,
      item.DONNEUR_ORDRE,
      item.REMARQUE,
    );
    //Ajuoute l'interventon dans la liste des interventions
    this.interventions.push(intervention);
    //console.log("Récupération de toutes les interventions + modif en modèle");
    return intervention;
  }

  /**
   * fonction permettant de récupérer toutes les interventions d'une STEP sélectionnée dans une plage de date donnée.
   * @returns un observable avec la liste des interventions d'une STEP donnée dans cette plage.
   */
  insertNewDocumentIntoSelectedSTEP(nomStep: string, nomDocument: string, description: string, lien: string): Observable<Document> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      nomStep: nomStep,
      nomDocument: nomDocument,
      description: description,
      lien: lien
    };
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post<Document>(`${this.baseUrlAPI}/api/steps/insertNewDocument`, body, { headers: headers }).pipe(
          catchError((error) => {
            this.handleAuthError(error, "insertNewDocumentIntoSelectedSTEP");
            this.handleError(error);
            return of(); // Retourne un tableau vide en cas d'erreur
          })
        );
      })
    );
  }

  /**
  * fonction permettant de récupérer toutes les interventions d'une STEP sélectionnée.
  * @returns un observable avec la liste des interventions d'une STEP donnée.
  */
  getAllProjetsFromSelectedSTEP(params: any): Observable<Projet[]> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post<Projet[]>(`${this.baseUrlAPI}/api/steps/getProjects`, params).pipe(
          catchError((error) => {
            this.handleAuthError(error, "getAllProjetsFromSelectedSTEP");
            this.handleError(error);
            return of(); // Retourne un tableau vide en cas d'erreur
          })
        );
      })
    );
  }

  /**
* fonction permettant de récupérer toutes les interventions d'une STEP sélectionnée.
* @returns un observable avec la liste des interventions d'une STEP donnée.
*/
  getAllEtatsProjects(): Observable<{ etatProjet: string, color: string }[]> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.get<{ etatProjet: string, color: string }[]>(`${this.baseUrlAPI}/api/steps/getAllEtatsProjects`).pipe(
          catchError((error) => {
            this.handleAuthError(error, "getAllEtatsProjects");
            this.handleError(error);
            return of([]); // Returns an empty array in case of error
          })
        );
      })
    );
  }

  /**
   * fonction permettant de récupérer toutes les documents d'une STEP sélectionnée.
   * @returns un observable avec la liste des documents d'une STEP donnée.
   */
  getAllDocumentsFromSelectedSTEP(nomStep: string): Observable<Document[]> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post<Document[]>(`${this.baseUrlAPI}/api/steps/getDocuments`, { nomStep }).pipe(
          catchError((error) => {
            this.handleAuthError(error, "getAllDocumentsFromSelectedSTEP");
            this.handleError(error);
            return of(); // Retourne un tableau vide en cas d'erreur
          })
        );
      })
    );
  }

  /**
 * Fonction pour transformer les STEPs reçues en array en modèle de Documents
 * @param item Element de l'array des STEP
 * @returns modèle de STEP avec infos
 */
  transformArrayToDocuments(item: any): Document {

    const document: Document = new Document(
      item.PK_Document,
      item.Nom,
      item.Description,
      item.Lien,
      item.Createur,
      item.Step
    );
    //Ajuoute l'interventon dans la liste des interventions
    this.documents.push(document);
    return document;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois sont de 0 à 11
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }


  deleteSpecificDocument(documentId: number): Observable<number> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        const params = new HttpParams().set('documentId', documentId);
        return this.http.delete<number>(`${this.baseUrlAPI}/api/steps/deleteDocument`, { params }).pipe(
          catchError((error) => {
            this.handleAuthError(error, 'deleteSpecificDocument');
            this.handleError(error);
            return of(); // Retourne null en cas d'erreur pour correspondre au type Observable<number>
          }),
        );
      })
    );
  }


  /**
   * Fonction pour transformer les STEPs reçues en array en modèle de Projects
   * @param item Element de l'array des STEP
   * @returns modèle de STEP avec infos
   */
  transformArrayToProjects(item: any): Projet {
    var date = item.DATE;
    var dateFinale = date.replace('T00:00:00.000Z', '');

    const projet: Projet = new Projet(
      item.ID_PROJET,
      item.OBJET,
      item.DESCRIPTION,
      this.formatDate(dateFinale),
      item.INITIALE_AUTEUR.toUpperCase(),
      item.INITIALE_SUIVI.toUpperCase(),
      item.ETAT_PROJET.toUpperCase(),
    );
    //Ajuoute l'interventon dans la liste des interventions
    this.projets.push(projet);

    return projet;
  }

  /**
   * Fonction pour récupérer les exploitants et les transformer en modèle d'exploitant
   * @param item Element de l'array des STEP 
   * @returns un tableau d'exploitatns pour une STEP sélectionnée.
   */
  getExploitantsFromStep(item: any): Exploitant[] {
    const exploitants: Exploitant[] = [];

    for (let i = 1; i <= 3; i++) {
      const contactNom = item[`CONTACT_NOM_0${i}`];
      const telephone = item[`NO_TELEPHONE_0${i}`];
      const mobile = item[`NO_PORTABLE_0${i}`];
      const fonction = item[`FONCTION_0${i}`];
      const email = item[`MAIL_0${i}`];

      if (contactNom) {
        const exploitant: Exploitant = {
          nom: contactNom,
          telephone: telephone || '',
          mobile: mobile || '',
          fonction: fonction || '',
          email: email || ''
        };

        exploitants.push(exploitant);
      }
    }
    return exploitants;
  }

  insertNewNoteIntoSpecificSTEP(newNote: {}): Observable<any> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post<any>(`${this.baseUrlAPI}/api/steps/insertNewNote`, newNote).pipe(
          catchError((error) => {
            this.handleAuthError(error, "insertNewNoteIntoSpecificSTEP");
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
  updateExistingNote(noteData: FormData): Observable<any> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post<any>(`${this.baseUrlAPI}/api/steps/updateNote`, noteData).pipe(
          catchError((error) => {
            this.handleAuthError(error, 'updateExistingNote');
            this.handleError(error);
            return of(); // Retourne un tableau vide en cas d'erreur
          }),
        );
      })
    );
  }

  /**
 * Fonction pour ajouter un nouvel exploitant
 * @param exploitantsCount Le nombre actuel d'exploitants
 * @returns un Observable avec le nouvel exploitant
 */
  deleteSpecificNote(noteId: string): Observable<any> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        const params = new HttpParams().set('noteId', noteId);
        return this.http.delete<any>(`${this.baseUrlAPI}/api/steps/deleteNote`, { params }).pipe(
          catchError((error) => {
            this.handleAuthError(error, 'deleteSpecificNote');
            this.handleError(error);
            return of(); // Retourne un tableau vide en cas d'erreur
          }),
        );
      })
    );
  }
  getAllNotesFromSpecificSTEP(startDate: string, endDate: string, searchText: string, stepId: string): Observable<any[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      stepId: stepId,
      startDate: startDate,
      endDate: endDate,
      textSearch: searchText
    };
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post<any[]>(`${this.baseUrlAPI}/api/steps/getNotes`, body, { headers: headers }).pipe(
          catchError((error) => {
            this.handleAuthError(error, "getAllNotesFromSpecificSTEP");
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
  updateExistingStep(stepData: FormData): Observable<any> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post<any>(`${this.baseUrlAPI}/api/steps/updateStep`, stepData).pipe(
          tap(() => {
            // Après la mise à jour, récupérer la liste des steps mise à jour
            this.refreshSteps();
          }),
          catchError((error) => {
            this.handleAuthError(error, 'updateExistingStep');
            this.handleError(error);
            return of(); // Retourne un tableau vide en cas d'erreur
          }),
        );
      })
    );
  }

  /**
   * Fonction pour ajouter un nouvel exploitant
   * @param exploitantsCount Le nombre actuel d'exploitants
   * @returns un Observable avec le nouvel exploitant
   */
  addExploitant(formData: FormData): Observable<any> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post<any>(`${this.baseUrlAPI}/api/steps/addNewExploitant`, formData).pipe(
          catchError((error) => {
            this.handleAuthError(error, 'addExploitant');
            this.handleError(error);
            return of(); // Retourne un tableau vide en cas d'erreur
          }),
        );
      })
    );
  }

  /**
 * Fonction pour ajouter un nouvel exploitant
 * @param exploitantsCount Le nombre actuel d'exploitants
 * @returns un Observable avec le nouvel exploitant
 */
  deleteExploitant(idClient: string, exploitantsCount: number): Observable<any> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        const body = { idClient, exploitantsCount };
        return this.http.post<any>(`${this.baseUrlAPI}/api/steps/deleteExploitant`, body).pipe(
          catchError((error) => {
            this.handleAuthError(error, 'deleteExploitant');
            this.handleError(error);
            return of(); // Retourne un tableau vide en cas d'erreur
          }),
        );
      })
    );
  }

  /**
* Fonction permettant de récupérer toutes les lignes du projet en fonction des statuts qui ont été sélectionné
* @returns un Observable avec toutes les lignes qui correspondent au statut.
*/
  updateExistingExploitant(stepData: FormData): Observable<any> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post<any>(`${this.baseUrlAPI}/api/steps/updateExploitant`, stepData).pipe(
          tap(() => {
            // Après la mise à jour, récupérer la liste des steps mise à jour
            this.refreshSteps();
          }),
          catchError((error) => {
            this.handleAuthError(error, 'updateExistingExploitant');
            this.handleError(error);
            return of(); // Retourne un tableau vide en cas d'erreur
          }),
        );
      })
    );
  }

  /**
   * fonction pour lire le fichier de config contenant l'adresse du serveur Node-Red.
   * @returns response si atteignable ou non.
   */
  readServeurAdress(): Observable<string> {
    return this.http.get<string>(`${this._jsonURLSRV}`).pipe(
      map((response: any) => response.serverAddress)
    );
  }
}