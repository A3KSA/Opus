import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CDP_ProjetsService } from 'src/app/core/services/projets/projet.service';

@Component({
  selector: 'app-projet-create',
  templateUrl: './projet-create.component.html',
  styleUrls: ['./projet-create.component.scss']
})
export class ProjetCreateComponent {
  @ViewChild('myForm') myForm!: ElementRef;
  public errorMessage: string = '';
  imageUrl: string | null = null;
  projectName: string = '';
  selectedFile: File | null = null;
  isLoading: boolean = false;

  constructor(private projectService: CDP_ProjetsService, private dialogRef: MatDialogRef<ProjetCreateComponent>) { }

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
      this.projectService.insertNewProject(formData).subscribe(() => {
        this.dialogRef.close(true); // Fermer la boîte de dialogue avec un résultat positif
      }
      );
    }
  }

  getDataForm(): any {
    const form = this.myForm.nativeElement;
    const NumeroProjet = form.querySelector('[name="numero"]').value;
    const TitreProjet = form.querySelector('[name="titre"]').value;
    const LocaliteProjet = form.querySelector('[name="localite"]').value;
    const descriptifElement = document.querySelector('.input2') as HTMLTextAreaElement;
    const Descriptif = descriptifElement.value;

    // Validation des données
    if (NumeroProjet.trim() === '' || TitreProjet.trim() === '') {
      // Mettez à jour la propriété errorMessage avec le message approprié
      this.errorMessage = 'Veuillez vérifier les champs obligatoires.';
      return null;
    }

    // Réinitialisez errorMessage s'il n'y a pas d'erreur
    this.errorMessage = '';

    const currentDate = this.getCurrentFormattedDate();

    const formData = new FormData();
    formData.append('DateCreation', currentDate);
    formData.append('NumeroProjet', NumeroProjet);
    formData.append('TitreProjet', this.escapeString(TitreProjet));
    formData.append('LocaliteProjet', this.escapeString(LocaliteProjet));
    formData.append('DescriptifProjet', this.escapeString(Descriptif));

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else {
      this.errorMessage = 'Veuillez sélectionner une image.';
      return null; // Assurez-vous de retourner null si l'image n'est pas sélectionnée
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
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  padZero(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

  private escapeString(input: string): string {
    return input.replace(/'/g, "''");
  }

}
