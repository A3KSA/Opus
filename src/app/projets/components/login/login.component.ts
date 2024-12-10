import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { Utilisateur } from 'src/app/core/models/projets/utilisateur.model';
import { LogService } from 'src/app/core/services/log.service';
import { GestionProjetsComponent } from '../gestion-projets/gestion-projets.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/projets/user.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private baseUrlAPI = '';
  //Chemin d'accès au fichier de config JSON.
  private _jsonURLSRV = '../../../assets/CONFIG/serverAddress.json';

  errorMessage: string = '';
  private credentialsAreValid: boolean = false;

  constructor(private http: HttpClient, private logger: LogService, public dialog: MatDialog, private router: Router, private userService: UserService, private authService: AuthService) {
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

  async onLoginNew(initiales: string){
    if (initiales) {
      this.credentialsAreValid = await this.authService.login(initiales);
      if(this.credentialsAreValid == true){
        this.router.navigate(['/projets']);
      }
    }
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

  private escapeString(input: string): string {
    return input.replace(/'/g, "''");
  }
}