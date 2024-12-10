import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LogService } from "../log.service";
import { catchError, map, Observable, of, switchMap, tap } from "rxjs";

//Permet de définir cette classe comme un service.
@Injectable({
    //dit à Angular d'enregistrer ce service à la racine de l'application. permet de s'assurer de n'avoir qu'une seule instance du service, partagée par tous les partis intéressés.
    providedIn: 'root'
})
export class EPLAN_ProjetctService {
    //Adresse pour accès à l'API
    private baseUrlAPI = '';
    //Chemin d'accès au fichier de config JSON.
    private _jsonURLSRV = '../../../assets/CONFIG/serverAddress.json';


    constructor(private http: HttpClient, private logger: LogService) { }

    /**
    * Fonction permettant de récupérer toutes les STEP de la base de données des Heures JPiller
    * @returns un Observable avec toutes les STEP sous forme de array.
    */
    getAllProjects(): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getAllProjects`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    addProject(data: {}): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/eplan/addProject`, data).pipe(
                    catchError((error) => {
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    deleteProject(projectId: any): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                const params = new HttpParams().set('projectId', projectId);
                return this.http.delete<any>(`${this.baseUrlAPI}/api/eplan/deleteProject`, { params }).pipe(
                    catchError((error) => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne null en cas d'erreur pour correspondre au type Observable<number>
                    }),
                );
            })
        );
    }

    getAllBrands(): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getAllBrands`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
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
    getPartOfWorksFromSpecificProject(projectNumber: number): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getPartOfWorks?projectNumber=${projectNumber}`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    getSpecificPartOfWork(partOfWorkId: number): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getSpecificPartOfWork?partOfWorkId=${partOfWorkId}`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    addPartOfWorksFromSpecificProject(newPartOfWork: {}): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/eplan/addPartOfWork`, newPartOfWork).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    deleteSpecificPartOfWorks(partOfWorkId: number): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                const params = new HttpParams().set('ouvrageId', partOfWorkId);
                return this.http.delete<any>(`${this.baseUrlAPI}/api/eplan/deletePartOfWork`, { params }).pipe(
                    catchError((error) => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne null en cas d'erreur pour correspondre au type Observable<number>
                    }),
                );
            })
        );
    }

    /**
* Fonction permettant de récupérer toutes les STEP de la base de données des Heures JPiller
* @returns un Observable avec toutes les STEP sous forme de array.
*/
    getCellulesFromSpecificPartOfWork(ouvrageId: number): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getCells?ouvrageId=${ouvrageId}`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    addCellFromSpecificOuvrage(newCellule: {}): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/eplan/addCell`, newCellule).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    deleteSpecificCell(cellId: number): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                const params = new HttpParams().set('celluleId', cellId);
                return this.http.delete<any>(`${this.baseUrlAPI}/api/eplan/deleteCell`, { params }).pipe(
                    catchError((error) => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne null en cas d'erreur pour correspondre au type Observable<number>
                    }),
                );
            })
        );
    }

    /**
* Fonction permettant de récupérer toutes les STEP de la base de données des Heures JPiller
* @returns un Observable avec toutes les STEP sous forme de array.
*/
    getSchemasFromSpecificCellule(celluleId: number): Observable<any[]> {
        console.log("ID de la cellule: ", celluleId);
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getSchemas?celluleId=${celluleId}`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    addSchemaFromSpecificCell(newSchema: {}): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/eplan/addSchema`, newSchema).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    deleteSpecificSchema(schemaId: number): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                const params = new HttpParams().set('schemaId', schemaId);
                return this.http.delete<any>(`${this.baseUrlAPI}/api/eplan/deleteSchema`, { params }).pipe(
                    catchError((error) => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne null en cas d'erreur pour correspondre au type Observable<number>
                    }),
                );
            })
        );
    }

    /**
* Fonction permettant de récupérer toutes les STEP de la base de données des Heures JPiller
* @returns un Observable avec toutes les STEP sous forme de array.
*/
    getEquipmentsFromSpecificSchema(schemaId: number): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getEquipements?schemaId=${schemaId}`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    addEquipmentFromSpecificSchema(newEquip: {}): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/eplan/addEquipement`, newEquip).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    deleteSpecificEquipment(equipmentId: number): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                const params = new HttpParams().set('equipmentId', equipmentId);
                return this.http.delete<any>(`${this.baseUrlAPI}/api/eplan/deleteEquipement`, { params }).pipe(
                    catchError((error) => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne null en cas d'erreur pour correspondre au type Observable<number>
                    }),
                );
            })
        );
    }

    getSchemasFromSpecificPartOfWork(partOfWorkId: number): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getSchemasToCreateTables?partOfWorkId=${partOfWorkId}`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    generateExcelForSpecificPartOfWork(partOfWorkId: number): Observable<Blob> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get(`${this.baseUrlAPI}/api/eplan/getAllDatasToCreateExcelFile`, {
                    params: { partOfWorkId: partOfWorkId.toString() },
                    responseType: 'blob' // Important : pour indiquer que la réponse est un fichier binaire
                }).pipe(
                    catchError((error) => {
                        this.logger.error("Request to API failed", error);
                        this.logger.info("Check your API or server status.");
                        return of(new Blob()); // Retourne un blob vide en cas d'erreur
                    })
                );
            })
        );
    }
    

    getAllSegmentsStructure(): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getAllSegmentsStructure`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    getAllTypesMachine(): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getAllTypesMachine`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    getAllTypesCable(): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getAllTypesCable`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    getAllSectionsCable(): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getAllSectionsCable`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    getAllAuxiliaireArticles(): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getAllAuxiliaireArticles`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    getAllDisjoncteursArticles(): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getAllDisjoncteursArticles`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    getAllContacteursArticles(): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getAllContacteursArticles`).pipe(
                    catchError(() => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    updateSpecificSchemaEquipments(data: {}): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/eplan/updateSpecificSchemaAndEquipments`, data).pipe(
                    catchError((error) => {
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    getUsedTiNumbersForCellule(celluleId: number, segementAbbrev: string, code_equipement: number): Observable<any[]> {
        //console.log("cellId: ", celluleId, " segment: ", segementAbbrev, " code: ", code_equipement);
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getAllNumeroTi?celluleId=${celluleId}&segementAbbrev=${segementAbbrev}&code_equipement=${code_equipement}`).pipe(
                    tap((data) => {
                        //console.log("Réponse reçue :", data); // Affiche les données reçues
                    }),
                    catchError((error) => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        console.log(error);
                        return of([]); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }    

    getUsedDesignationNumbersForCellule(celluleId: number, fkSegment: string): Observable<any[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.get<any[]>(`${this.baseUrlAPI}/api/eplan/getAllDesignation?celluleId=${celluleId}&fkSegment=${fkSegment}`).pipe(
                    tap((data) => {
                        //console.log("Réponse reçue pour :", data); // Affiche les données reçues
                    }),
                    catchError((error) => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        console.log(error);
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    addSegmentFromSpecificProject(data: {}): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/eplan/addSegment`, data).pipe(
                    catchError((error) => {
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    deleteSegmentFromSpecificProject(segmentId: number): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                const params = new HttpParams().set('segmentId', segmentId);
                return this.http.delete<any>(`${this.baseUrlAPI}/api/eplan/deleteSegment`, { params }).pipe(
                    catchError((error) => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne null en cas d'erreur pour correspondre au type Observable<number>
                    }),
                );
            })
        );
    }

    updateSpecificEntity(data: {}): Observable<any> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<any>(`${this.baseUrlAPI}/api/eplan/updateSpecificEntity`, data).pipe(
                    catchError((error) => {
                        this.logger.error("Request to Node-Red KNX API failed");
                        this.logger.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne null en cas d'erreur pour correspondre au type Observable<number>
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