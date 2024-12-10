import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { STEPService } from 'src/app/core/services/step.service';

@Component({
  selector: 'app-modal-update-step',
  templateUrl: './modal-update-step.component.html',
  styleUrls: ['./modal-update-step.component.scss']
})
export class ModalUpdateStepComponent {

  public nomStep:string = "";
  public adresse:string = "";
  public noPostal:string = "";
  public localite:string = "";

  selectedFile: File | null = null;
  public selectedFileName: string = "Aucun fichier sélectionné";
  public errorMessage: string = '';

  constructor(private stepService: STEPService, @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ModalUpdateStepComponent>) {
    this.nomStep = this.data.step.titre;
    this.adresse = this.data.step.rue;
    this.noPostal = this.data.step.npa;
    this.localite = this.data.step.localite;
  }

  onSubmit() {
    const formData = this.getDataForm();

    if (formData) {
      this.stepService.updateExistingStep(formData).subscribe(() => {
        this.dialogRef.close(true); // Fermer la boîte de dialogue avec un résultat positif
      }
      );
    }
  }

  
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.selectedFileName = event.target.files[0].name;
    }
    const reader = new FileReader();
    reader.onload = () => {
      console.log(this.selectedFile);
      // Ajoutez ici tout autre traitement que vous devez effectuer avec le fichier chargé
    };
    reader.onerror = () => {
      console.error('Erreur de chargement du fichier');
      this.errorMessage = 'Erreur de chargement du fichier';
    };
    
    if (this.selectedFile) {
      reader.readAsDataURL(this.selectedFile);
    }
  }

  getDataForm(): any {

    // Validation des données
    if (this.nomStep.trim() === '') {
      // Mettez à jour la propriété errorMessage avec le message approprié
      this.errorMessage = 'Veuillez vérifier le nom de la STEP.';
      return;
    }

    // Réinitialisez errorMessage s'il n'y a pas d'erreur
    this.errorMessage = '';

    const formData = new FormData();

    formData.append('NOM', this.escapeString(this.nomStep));
    formData.append('ID_CLIENT', this.data.step.numero);
    formData.append('ADRESSE_01', this.escapeString(this.adresse));
    formData.append('NO_POSTALE', this.noPostal);
    formData.append('LOCALITE', this.escapeString(this.localite));

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    return formData;
  }

  private escapeString(input: string): string {
    return input.replace(/'/g, "''");
  }

}
