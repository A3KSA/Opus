import { Component, ElementRef, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Projet } from 'src/app/core/models/projets/projet.model';
import { CDP_ProjetsService } from 'src/app/core/services/projets/projet.service';

@Component({
  selector: 'app-projet-edit',
  templateUrl: './projet-edit.component.html',
  styleUrls: ['./projet-edit.component.scss']
})
export class ProjetEditComponent {
  @ViewChild('myForm') myForm!: ElementRef;
  @Output() projectUpdated = new EventEmitter<void>();
  public errorMessage: string = '';
  imageUrl: string | null = null;
  projectName: string = '';
  selectedFile: File | null = null;
  projet!: Projet;
  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private projectService: CDP_ProjetsService, private dialogRef: MatDialogRef<ProjetEditComponent>) {
    this.projet = data.projet;
  }

  onFileSelected(event: any): void {
    this.isLoading = true;
    this.selectedFile = event.target.files[0];
    
    const reader = new FileReader();
    reader.onload = () => {
      console.log(this.selectedFile);
      this.isLoading = false;
      // Ajoutez ici tout autre traitement que vous devez effectuer avec le fichier chargé
    };
    reader.onerror = () => {
      console.error('Erreur de chargement du fichier');
      this.errorMessage = 'Erreur de chargement du fichier';
      this.isLoading = false;
    };
    
    if (this.selectedFile) {
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.isLoading = false; // Arrête le spinner si aucun fichier n'est sélectionné
    }
  }

  onSubmit() {
    const formData = this.getDataForm();

    if (formData) {
      this.projectService.updateExistingProject(formData).subscribe(() => {
        this.projectUpdated.emit(); // Émettre l'événement
        this.dialogRef.close(true); // Fermer la boîte de dialogue avec un résultat positif
      }
      );
    }
  }

  getDataForm(): any {
    const form = this.myForm.nativeElement;
    const TitreProjet = form.querySelector('[name="titre"]').value;
    const LocaliteProjet = form.querySelector('[name="localite"]').value;
    const descriptifElement = document.querySelector('.input2') as HTMLTextAreaElement;
    const Descriptif = descriptifElement.value;

    // Validation des données
    if (TitreProjet.trim() === '') {
      // Mettez à jour la propriété errorMessage avec le message approprié
      this.errorMessage = 'Veuillez vérifier les champs obligatoires.';
      return;
    }

    // Réinitialisez errorMessage s'il n'y a pas d'erreur
    this.errorMessage = '';

    const currentDate = this.getCurrentFormattedDate();

    const formData = new FormData();
    formData.append('NumeroProjet', this.projet.numero.toString());
    formData.append('DateCreation', currentDate);
    formData.append('TitreProjet', this.escapeString(TitreProjet));
    formData.append('LocaliteProjet', this.escapeString(LocaliteProjet));
    formData.append('DescriptifProjet', this.escapeString(Descriptif));

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    return formData;
  }

  getCurrentFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    const seconds = this.padZero(date.getSeconds());
    return `${day} ${month} ${year} - ${hours}:${minutes}:${seconds}`;
  }

  padZero(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

  private escapeString(input: string): string {
    return input.replace(/'/g, "''");
  }
}
