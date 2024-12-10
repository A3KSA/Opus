import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, map, of, switchMap } from "rxjs";
import { LogService } from "../log.service";
import { CDP_RapportsService } from "./rapport.service";
import { Utilisateur } from "../../models/projets/utilisateur.model";

//Permet de définir cette classe comme un service.
@Injectable({
    //dit à Angular d'enregistrer ce service à la racine de l'application. permet de s'assurer de n'avoir qu'une seule instance du service, partagée par tous les partis intéressés.
    providedIn: 'root'
})
export class CDP_AdminService {
    //Adresse pour accès à l'API
    private baseUrlAPI = '';
    //Chemin d'accès au fichier de config JSON.
    private _jsonURLSRV = '../../../assets/CONFIG/serverAddress.json';


    constructor(private http: HttpClient, private logger: LogService) { }   
   
   /**
   * Fonction permettant de récupérer toutes les STEP de la base de données des Heures JPiller
   * @returns un Observable avec toutes les STEP sous forme de array.
   */
    getAllUsers(): Observable<Utilisateur[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<Utilisateur[]>(`${this.baseUrlAPI}/api/cdp/admin/getUsers`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    }),
                    map((data: any[]) => this.mapDataToUtilisateur(data))
                );
            })
        );
    }

        /**
     * Fonction permettant de récupérer les données reçues (JSON) et les transformer en modèle de projet
     * @param data JSON reçu par la requête HTTP
     * @returns tableau d'objets projets
     */
        private mapDataToUtilisateur(data: any[]): Utilisateur[] {
            // Effectuez le mappage des données JSON en objets de type Projet
            return data.map((projetData: any) => {
                const projet = new Utilisateur(
                    projetData.PK_Utilisateur,
                    projetData.Nom,
                    projetData.Prenom,
                    projetData.Initiales,
                    projetData.DerniereConnexion,
                    projetData.fk_privilege_CDP,
                    projetData.fk_privilege_WIKI,
                    projetData.fk_privilege_EPLAN
                );
                return projet;
            });
        }

        deleteSpecificUser(userId: number): Observable<number> {
            return this.readServeurAdress().pipe(
                switchMap((response) => {
                    this.baseUrlAPI = response;
                    return this.http.get<number>(`${this.baseUrlAPI}/cdp/admin/deleteUser?userId=${userId}`).pipe(
                        catchError(() => {
                            this.logger.error("Request to Node-Red KNX API failed");
                            this.logger.info("check your Node-Red installation, maybe restart the service.");
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