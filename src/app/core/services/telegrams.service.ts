/*
 * Ce service permet de faire toutes les interractions avec les données venant des API ou autre.
*/
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Telegram } from '../models/telegram.model';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { LogService } from './log.service';

//Permet de définir cette classe comme un service.
@Injectable({
  //dit à Angular d'enregistrer ce service à la racine de l'application. permet de s'assurer de n'avoir qu'une seule instance du service, partagée par tous les partis intéressés.
  providedIn: 'root'
})
export class TelegramsService {
  //Adresse pour accès à l'API
  private baseUrlAPI = '';

  //Ancienne adresse serveur backend pour fichier JSON
  //private baseUrlLocalhostConfig = 'http://localhost:3000/stores';

  //Chemin d'accès au fichier de config JSON.
  private _jsonURLSRV = '../../../assets/CONFIG/serverAddress.json';

  //Chemin d'accès au fichier de config JSON.
  private _jsonURL = '../../../assets/CONFIG/config-stores.json';

  constructor(private http: HttpClient, private logger: LogService) { }

  /**
   * Fonction permettant de récupérer un télégramme en fonction de l'adresse de groupe reçue en paramètre.
   * @param groupAddress string définissant l'adresse de groupe KNX d'un télégramme
   * @returns un Observable de type "Telegram".
   */
  getTelegramByGroupAddress(groupAddress: string): Observable<Telegram> {
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;

        return this.http.get<Telegram>(`${this.baseUrlAPI}/api/knx/state?groupAddress=${groupAddress}`).pipe(
          catchError(() => {
            this.logger.error("Request to Node-REd KNX API failed");
            this.logger.info("check your Node-Red installation, maybe restart the service.");
            return of(); // Retourne un tableau vide en cas d'erreur
          })
        );
      })
    );
  }

  /**
   * Fonction permettant de récupérer les stores définis dans un fichier de config en fonction de l'id de l'étage reçu en paramètre.
   * @param idFloor number définissant l'id de l'étage que l'on veut récupérer
   * @returns un Observable contenant une liste d'objets de type "StoreA3k"
   */
  getStoresByFloor(idFloor: number): Observable<StoreA3k[]> {
    return this.http.get<StoreA3k[]>(`${this._jsonURL}`).pipe(
      map((response: any) => response.stores),
      map((stores: any[]) => stores.filter((store: any) => store.stage === idFloor)),
      catchError(() => {
        this.logger.error("Request to config file for element 'store' doesn't work.");
        this.logger.info("check the path ot your file or the structure of the content.");
        return of([]); // Retourne un tableau vide en cas d'erreur
      })
    );
  }

  /**
   * Fonction permettant de modifier la valeur de l'adresse de groupe concernant "ValueHB".
   * @param startGroupAddressOfStore string définissant la première adresse de groupe du store à modifier (On se base sur cette adresse pour trouver le bon télégramme à modifier)
   * @param valueHB number définissant la nouvelle valeur.
   * @returns Un Observable contenant le télégramme modifié.
   */
  setValueHB(startGroupAddressOfStore: string, valueHB: number): Observable<Telegram> {
    const lastNumberOfTelegramString = parseInt(startGroupAddressOfStore.split("/").pop() || "0");
    //Ajouter 2 pour tomber sur l'adresse de la valeur H/B.
    const newLastNumber = lastNumberOfTelegramString + 2;
    //Retransformation en string pour retour
    const groupAddressValueHB = startGroupAddressOfStore.substring(0, startGroupAddressOfStore.lastIndexOf("/") + 1) + newLastNumber;

    const telegram: Telegram = { address: groupAddressValueHB, dpt: 5.001, devicename: "", payload: valueHB };

    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post<Telegram>(`${this.baseUrlAPI}/api/knx/state?groupAddress=${groupAddressValueHB}&datapoint=5.001&value=${valueHB}`, telegram).pipe(
          tap(() => {
            this.logger.info(`Request to KNX API to write new ouverture value to group address: ${groupAddressValueHB} succeeded`);
          }),
          catchError(() => {
            this.logger.error("Request to Node-Red KNX API to write new HB value failed");
            this.logger.info("check your Node-Red installation, maybe restart the service.");
            return of(); // Retourne un tableau vide en cas d'erreur
          })
        );
      })
    );
  }

  /**
  * Fonction permettant de modifier la valeur de l'adresse de groupe concernant "ValueIncl".
  * @param startGroupAddressOfStore string définissant la première adresse de groupe du store à modifier (On se base sur cette adresse pour trouver le bon télégramme à modifier)
  * @param valueIncl number définissant la nouvelle valeur.
  * @returns Un Observable contenant le télégramme modifié.
  */
  setValueIncl(startGroupAddressOfStore: string, valueIncl: number): Observable<Telegram> {
    const lastNumber = parseInt(startGroupAddressOfStore.split("/").pop() || "0");
    //Ajouter 2 pour tomber sur l'adresse de la valeur H/B.
    const newLastNumber = lastNumber + 3;
    //Retransformation en string pour retour
    const groupAddressValueHB = startGroupAddressOfStore.substring(0, startGroupAddressOfStore.lastIndexOf("/") + 1) + newLastNumber;

    const telegram: Telegram = { address: groupAddressValueHB, dpt: 5.001, devicename: "", payload: valueIncl };

    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post<Telegram>(`${this.baseUrlAPI}/api/knx/state?groupAddress=${groupAddressValueHB}&datapoint=5.001&value=${valueIncl}`, telegram).pipe(
          tap(() => {
            this.logger.info(`Request to KNX API to write new incl value to group address: ${groupAddressValueHB} succeeded`);
          }),
          catchError(() => {
            this.logger.error("Request to Node-Red KNX API to write new incl value failed");
            this.logger.info("check your Node-Red installation, maybe restart the service.");
            return of(); // Retourne un tableau vide en cas d'erreur
          })
        );
      })
    );
  }

  /**
   * Fonction permettant de modifier la valeur de l'adresse de groupe concernant "Blocage".
   * @param startGroupAddressOfStore string définissant la première adresse de groupe du store à modifier (On se base sur cette adresse pour trouver le bon télégramme à modifier)
   * @param valueBlocage number définissant la nouvelle valeur.
   * @returns Un Observable contenant le télégramme modifié.
   */
  setValueBlocage(startGroupAddressOfStore: string, valueBlocage: number): Observable<Telegram> {
    const lastNumber = parseInt(startGroupAddressOfStore.split("/").pop() || "0");
    //Ajouter 2 pour tomber sur l'adresse de la valeur H/B.
    const newLastNumber = lastNumber + 1;
    //Retransformation en string pour retour
    const groupAddressValueHB = startGroupAddressOfStore.substring(0, startGroupAddressOfStore.lastIndexOf("/") + 1) + newLastNumber;

    const telegram: Telegram = { address: groupAddressValueHB, dpt: 1.003, devicename: "", payload: valueBlocage };

    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post<Telegram>(`${this.baseUrlAPI}/api/knx/state?groupAddress=${groupAddressValueHB}&datapoint=1.003&value=${valueBlocage}`, telegram).pipe(
          tap(() => {
            this.logger.info(`Request to KNX API to write new blocage state to group address: ${groupAddressValueHB} succeeded`);
          }),
          catchError(() => {
            this.logger.error("Request to Node-Red KNX API to change new blocage state failed");
            this.logger.info("check your Node-Red installation, maybe restart the service.");
            return of(); // Retourne un tableau vide en cas d'erreur
          })
        );
      })
    );
  }

  readServeurAdress(): Observable<string> {
    return this.http.get<string>(`${this._jsonURLSRV}`).pipe(
      map((response: any) => response.serverAddress)
    );
  }
}