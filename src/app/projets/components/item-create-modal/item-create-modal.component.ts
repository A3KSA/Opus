import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Utilisateur } from 'src/app/core/models/projets/utilisateur.model';
import { CDP_ProjetsService } from 'src/app/core/services/projets/projet.service';
import { SearchEnteteComponent, User } from '../entite-create/search-fonction/search-entete/search-entete.component';

@Component({
  selector: 'app-item-create-modal',
  templateUrl: './item-create-modal.component.html',
  styleUrls: ['./item-create-modal.component.scss']
})
export class ItemCreateModalComponent {
  @ViewChild('myForm') myForm!: ElementRef;
  isVisibleOnPrint: boolean = false; // Valeur initiale
  public errorMessage: string = '';

  listOuvrages!: string[];
  listInstallations!: string[];
  listStatuts: string[] = ['info', 'à faire', 'en cours', 'urgent', 'en attente', 'en retard'];
  listResponsables!: string[];

  selectedUser: User = {
    Nom: '',
    Prenom: '',
    Entreprise: '',
    Initiales: '',
    Poste: '',
    Email: '',
    Telephone: ''
  };
  

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private projetService: CDP_ProjetsService, public dialog: MatDialog, private dialogRef: MatDialogRef<ItemCreateModalComponent>) {
    this.listOuvrages = data.listOuvrages;
    this.listInstallations = data.listInstallations;
    this.listResponsables = data.listEntetes;
    console.log("Liste des responsables: ",this.listResponsables);
  }

  onSubmit() {
    const formData = this.getDataForm();

    if (formData) {
    this.projetService.insertNewLine(formData).subscribe(() => {
      this.dialogRef.close(true); // Fermer la boîte de dialogue avec un résultat positif
    }
    );
  }
}

  // Fonction pour formater la date en "yyyy-MM-dd HH:mm:ss"
  formatDate(date: Date): string {
    if (date === null || date === undefined || date.toString().trim() === '') {
      return '';
    }

    const currentDate = new Date();
    const hours = this.padNumber(currentDate.getHours());
    const minutes = this.padNumber(currentDate.getMinutes());
    const seconds = this.padNumber(currentDate.getSeconds());
    const dateStringWithTime = date + ` ${hours}:${minutes}:${seconds}`;

    return dateStringWithTime;
  }

  // Fonction pour ajouter un zéro devant les nombres inférieurs à 10
  padNumber(num: number): string {
    return (num < 10 ? '0' : '') + num;
  }

  getTodayDate(): string {
    // Obtenir la date du jour
    const currentDate = new Date();
    // Formater la date en format yyyy-mm-dd
    const formattedDate = currentDate.toISOString().slice(0, 10);
    return formattedDate;
  }

  getDataForm(): any {
    const form = this.myForm.nativeElement;
  
    const DateCreation = form.querySelector('[name="creation"]').value;
    const Delai = form.querySelector('[name="delai"]').value;
    const Statut = form.querySelector('[name="triSelectStatuts"]').value;
    const Designation = form.querySelector('[type="input"]').value;
    const Installation = form.querySelector('[list="instllationsOptions"]').value;
    const PartieOuvrage = form.querySelector('[list="ouvragesOptions"]').value;
    const Responsable = form.querySelector('[name="triSelectResp"]').value;
    const Avancement = form.querySelector('[name="avancement"]').value;
    const isVisibleOnPrintValue = this.isVisibleOnPrint ? 1 : 0;
  
    const descriptifElement = document.querySelector('.input2') as HTMLTextAreaElement;
    const Descriptif = descriptifElement.value;
  
    // Remplacer les retours à la ligne par "\n"
    const DescriptifAvecNouvellesLignes = Descriptif.replace(/\n/g, '\\n');
  
    // Validation des données
    if (DateCreation.trim() === '' || Statut.trim() === '' || Designation.trim() === '' || Installation.trim() === '' ||
      PartieOuvrage.trim() === '' || Responsable.trim() === '' || Avancement.trim() === '') {
      // Mettez à jour la propriété errorMessage avec le message approprié
      this.errorMessage = 'Veuillez vérifier les champs obligatoires.';
      // Affichez un message d'erreur ou prenez une autre action en cas de données invalides
      console.error('Données invalides. Veuillez vérifier les champs obligatoires.');
      return;
    }
  
    if (isNaN(Avancement) || Avancement < 0 || Avancement > 100) {
      // Mettez à jour la propriété errorMessage avec le message approprié
      this.errorMessage = "L'avancement n'est pas possible.";
      // Affichez un message d'erreur ou prenez une autre action en cas de données invalides
      console.error('Données invalides. Veuillez vérifier les champs.');
      return;
    }
  
    // Réinitialisez errorMessage s'il n'y a pas d'erreur
    this.errorMessage = '';
  
    const formData = {
      FK_Project: this.data.projectNumber,
      DateCreation: this.formatDate(DateCreation),
      Delai: this.formatDate(Delai),
      Statut: Statut,
      Designation: this.escapeString(Designation),
      Installation: Installation,
      PartieOuvrage: PartieOuvrage,
      Responsable: Responsable,
      Avancement: (Avancement / 100).toString(),
      Descriptif: this.escapeString(DescriptifAvecNouvellesLignes),
      Impression: isVisibleOnPrintValue.toString(),
      Utilisateur: localStorage.getItem('param2')
    };
  
    // Afficher les données dans la console
    console.log('Form Data:', formData);
  
    // Fermez le dialogue actuel
    this.dialogRef.close();
  
    return formData;
  }

  private escapeString(input: string): string {
    return input.replace(/'/g, "''");
  }

  opensearchFonction(): void {
    const dialogRef = this.dialog.open(SearchEnteteComponent, {
    });
    // Écoute les données renvoyées par la boîte de dialogue une fois qu'elle est fermée
    dialogRef.afterClosed().subscribe((result: { selectedUser: User, existingAbbreviations: string[] }) => {
      if (result) {
        this.selectedUser = result.selectedUser;
        console.log(this.selectedUser);
      }
    });
  }

}
