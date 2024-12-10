// db.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(private http: HttpClient) { }

  //Adresse pour accès à l'API
  private baseUrlAPI = '';

  //Chemin d'accès au fichier de config JSON.
  private _jsonURLSRV = '../../../assets/CONFIG/serverAddress.json';

  /**
* fonction pour lire le fichier de config contenant l'adresse du serveur Node-Red.
* @returns response si atteignable ou non.
*/
  readServeurAdress(): Observable<string> {
    return this.http.get<string>(`${this._jsonURLSRV}`).pipe(
      map((response: any) => response.serverAddress)
    );
  }

  closeConnections(): Observable<any> {
    console.log("closeConnections to all databases")
    return this.readServeurAdress().pipe(
      switchMap((response) => {
        this.baseUrlAPI = response;
        return this.http.post(`${this.baseUrlAPI}/api/close-connections`, {}).pipe(
          catchError((error) => {
            console.log(error);
            // Logique d'erreur spécifique ou retourne un Observable qui indique une erreur
            return of(error); // Vous pouvez décider de retourner un Observable vide ou l'erreur
          })
        );
      })
    );
  }
}