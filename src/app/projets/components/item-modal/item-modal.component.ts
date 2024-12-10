import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Note } from 'src/app/core/models/projets/note.model';
import { CDP_ProjetsService } from 'src/app/core/services/projets/projet.service';
import { ImageModalComponent } from '../image-modal/image-modal.component';
import { Complement } from 'src/app/core/models/projets/complement.model';
import { ComplementsHistoriqueComponent } from '../Ligne/complements-historique/complements-historique.component';

@Component({
  selector: 'app-item-modal',
  templateUrl: './item-modal.component.html',
  styleUrls: ['./item-modal.component.scss']
})
export class ItemModalComponent {
  @ViewChild('myForm') myForm!: ElementRef;
  listResponsables!: string[];
  listOuvrages!: string[];
  listInstallations!: string[];
  listStatuts: string[] = ["Info", "À faire", "En cours", "Urgent", "En retard", "En attente"];
  listNotes!: Note[]; //Liste de Projets
  isVisibleOnPrint!: boolean; // Valeur initiale
  hasComplementInfo: boolean = false;
  public errorMessage: string = '';
  hasNotes: boolean = false;
  description: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private projetService: CDP_ProjetsService, public dialog: MatDialog, private dialogRef: MatDialogRef<ItemModalComponent>) {
    this.listResponsables = data.listEntetes;
    this.listOuvrages = data.listOuvrages;
    this.listInstallations = data.listInstallations;
    // Utiliser la méthode filter pour enlever "Terminé" de la liste
    this.listStatuts = this.listStatuts.filter(status => status !== 'Terminé');
    this.getAllNotes(data.ligne.pk_ligne);
    this.isVisibleOnPrint = data.ligne.impression;
  }

  ngOnInit() {
    this.description = this.formatDescription(this.data.ligne.description);
    console.log("statut: ",this.data.ligne.statut);
    this.checkIfLigneHasComplements();
  }

  ngOnChanges() {
    this.checkIfLigneHasComplements();
  }

  updateLine(): void {
    const formData = this.getDataForm();

    if (formData) {
    this.projetService.updateExistingLine(formData).subscribe(() => {
      this.dialogRef.close(true); // Fermer la boîte de dialogue avec un résultat positif
    }
    );
  }
}

  finishTask(): void {
    const userConfirmed = window.confirm("Voulez-vous vraiment clore cette tâche ?");
      if (userConfirmed) {
        this.projetService.updateExistingLine(this.getDataForm(true)).subscribe(() => {
          this.dialogRef.close();
        });
      }
  }

  checkIfLigneHasComplements(): void {
    if (this.data.ligne && this.data.ligne.pk_ligne) {
      this.projetService.getComplementFromSpecificLine(this.data.ligne.pk_ligne).subscribe({
        next: (complements: Complement[]) => {
          this.hasComplementInfo = complements.length > 0;
          //console.log('hasNotes:', this.hasNotes);  // Log the hasNotes value
        },
        error: (error) => {
          console.error('Error checking for notes', error);
          this.hasNotes = false;
        }
      });
    }
  }

  private escapeString(input: string): string {
    return input.replace(/'/g, "''");
  }

  // Fonction pour formater la date avec le mois en lettres
  formatDateCustom(isoDate: string): string {
    const date = new Date(isoDate);

    // Tableau des noms des mois
    const monthNames = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];

    const day = date.getDate().toString().padStart(2, '0');
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${day} ${month} ${year} à ${hours}:${minutes}:${seconds}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    // Récupérez les composants de la date
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Les mois commencent à 0
    const day = ('0' + date.getDate()).slice(-2);
    // Formatez la date au format 'YYYY-MM-DD'
    return `${year}-${month}-${day}`;
  }

  getCurrentDateISO(): Date {
    const currentDate = new Date();
    return currentDate;
  }

  formatDescription(description: string): string {
    // Restaurez les retours à la ligne
    const DescriptifAvecRetoursALaLigne = description.replace(/\\n/g, '\n');
    return DescriptifAvecRetoursALaLigne;
  }

  initializeProgressBarWidth(avancement: number): string {
    return avancement + '%';
  }

  getDataForm(markAsCompleted: boolean = false): any {
    const form = this.myForm.nativeElement;

    const DateCreation = form.querySelector('[name="creation"]').value;
    const Delai = form.querySelector('[name="delai"]').value;
    const Statut = markAsCompleted ? 'Terminé' : form.querySelector('[name="status"]').value;
    const Designation = form.querySelector('[name="designation"]').value;
    const Installation = form.querySelector('[name="installation"]').value;
    const PartieOuvrage = form.querySelector('[name="ouvrage"]').value;
    const Responsable = form.querySelector('[name="responsable"]').value;
    const Avancement = form.querySelector('[name="avancement"]').value;
    const isVisibleOnPrintValue = this.isVisibleOnPrint ? 1 : 0;

    // Remplacer les retours à la ligne par "\n"
    const DescriptifAvecNouvellesLignes = this.description.replace(/\n/g, '\\n');

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

    const newLine = {
      FK_Project: this.data.projectNumber,
      DateCreation: this.formatDate(DateCreation),
      DateModification: this.getCurrentDateISO(),
      Delai: this.formatDate(Delai),
      Statut: Statut,
      Designation: this.escapeString(Designation),
      Installation: Installation,
      PartieOuvrage: PartieOuvrage,
      Responsable: Responsable,
      Avancement: (Avancement / 100).toString(),
      Descriptif: this.escapeString(DescriptifAvecNouvellesLignes),
      Impression: isVisibleOnPrintValue.toString(),
      DateFin: this.getCurrentDateISO(),
      PK_Ligne: this.data.ligne.pk_ligne
    };

        // Afficher les données dans la console
        console.log('Form Data:', newLine);

    // Fermez le dialogue actuel
    this.dialogRef.close();

    return newLine;
  }

  /**
* fonction d'abonnement au service qui récupère la liste des notes
*/
  getAllNotes(ligneId: number) {
    this.projetService.getNotesFromSpecificLigne(ligneId).subscribe(
      (data: Note[]) => {
        this.listNotes = data;
      },
      (error) => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
  }

  openImageModal(): void {
    // Fermez d'abord le dialogue actuel
    //this.dialogRef.close();

    const dialogRef = this.dialog.open(ImageModalComponent, {
      data: { projectId: this.data.projectNumber,
              rowId: this.data.ligne.pk_ligne
       }
    });
    dialogRef.afterClosed().subscribe(() => {
      // Actions à réaliser après la fermeture du dialogue, si nécessaire
    });
  }

  openComplementHistoriqueModal(): void {
    const dialogRef = this.dialog.open(ComplementsHistoriqueComponent, {
      data: {
        ligneId: this.data.ligne.pk_ligne,
      }
    });
  }
}
