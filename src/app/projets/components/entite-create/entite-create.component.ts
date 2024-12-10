import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SearchEnteteComponent, User } from './search-fonction/search-entete/search-entete.component';
import { Observable } from 'rxjs';
import { CDP_EnteteService } from 'src/app/core/services/projets/entete.service';

@Component({
  selector: 'app-entite-create',
  templateUrl: './entite-create.component.html',
  styleUrls: ['./entite-create.component.scss']
})
export class EntiteCreateComponent {

  listEntreprises!: string[];
  listLibelleEntites!: string[];
  selectedUser: User = {
    Nom: '',
    Prenom: '',
    Entreprise: '',
    Initiales: '',
    Poste: '',
    Email: '',
    Telephone: ''
  };
  existingAbbreviations: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, public enteteService: CDP_EnteteService, private dialogRef: MatDialogRef<EntiteCreateComponent>) {
    this.listEntreprises = data.entreprises;
    this.listLibelleEntites = data.listEntetes;
    console.log(this.listEntreprises);
  }

  private escapeString(input: string): string {
    return input.replace(/'/g, "''");
  }

  generateAbbreviation() {
    // Utilisez les valeurs de selectedUser, sinon, vérifiez les valeurs d'entrée manuelles
    const nom = this.selectedUser.Nom || (document.querySelector('input[name="nom"]') as HTMLInputElement).value;
    const prenom = this.selectedUser.Prenom || (document.querySelector('input[name="prenom"]') as HTMLInputElement).value;

    if (!nom || !prenom) {
      return;
    }

    let abbreviation = (prenom[0] + nom.substring(0, 2)).toUpperCase();
    let suffix = 1;

    // Vérifier si l'abréviation existe déjà
    while (this.existingAbbreviations.includes(abbreviation)) {
      abbreviation = (prenom[0] + nom.substring(0, 2) + suffix).toUpperCase();
      suffix++;
    }

    this.selectedUser.Initiales = abbreviation;
    this.existingAbbreviations.push(abbreviation); // Ajouter l'abréviation générée à la liste des abréviations existantes
  }

  opensearchFonction(): void {
    const dialogRef = this.dialog.open(SearchEnteteComponent, {
    });
    // Écoute les données renvoyées par la boîte de dialogue une fois qu'elle est fermée
    dialogRef.afterClosed().subscribe((result: { selectedUser: User, existingAbbreviations: string[] }) => {
      if (result) {
        this.selectedUser = result.selectedUser;
        this.existingAbbreviations = result.existingAbbreviations;
        console.log(this.selectedUser);
        this.generateAbbreviation();
      }
    });
  }

  insertNewEntete(): void {
    const entityName = (document.querySelector('input[name="entite"]') as HTMLInputElement).value;
    const responsableName = this.selectedUser.Nom || (document.querySelector('input[name="nom"]') as HTMLInputElement).value;
    const responsableLastName = this.selectedUser.Prenom || (document.querySelector('input[name="prenom"]') as HTMLInputElement).value;
    const companyName = this.selectedUser.Entreprise || (document.querySelector('input[name="entreprise"]') as HTMLInputElement).value;
    const responsableFonction = this.selectedUser.Poste || (document.querySelector('input[name="fonction"]') as HTMLInputElement).value;
    const responsableAbbreviation = this.selectedUser.Initiales || (document.querySelector('input[name="abbreviation"]') as HTMLInputElement).value;
    const responsableCourriel = this.selectedUser.Email || (document.querySelector('input[name="courriel"]') as HTMLInputElement).value;
    const responsableTelephone = this.selectedUser.Telephone || (document.querySelector('input[name="telephone"]') as HTMLInputElement).value;

    if (!entityName || !companyName) {
      return;
    }

    const entity = { name: this.escapeString(entityName), projectNumber: this.data.projectId };
    const company = { name: this.escapeString(companyName) };
    const responsable = {
      name: this.escapeString(responsableName),
      lastName: this.escapeString(responsableLastName),
      abbreviation: this.escapeString(responsableAbbreviation),
      courriel: this.escapeString(responsableCourriel),
      telephone: this.escapeString(responsableTelephone),
      fonction: this.escapeString(responsableFonction),
      company: this.escapeString(companyName)
    };
    const checkInfos = {
      entity,
      company,
      responsable
    };

    this.enteteService.checkInfosAndInsertNewEntete(checkInfos).subscribe({
      next: () => {
        // Actions à effectuer après que la requête a réussi
        this.enteteService.triggerRefresh();
        this.dialogRef.close();
      },
      error: (err) => {
        // Gérer l'erreur si nécessaire
        console.error('Erreur lors de l\'exécution de checkInfosAndInsertNewEntete', err);
      }
    });
  }

}
