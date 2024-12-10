import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CDP_AdminService } from 'src/app/core/services/projets/admin.service';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss']
})
export class UserCreateComponent {
  @ViewChild('myForm') myForm!: ElementRef;
  public errorMessage: string = '';
  imageUrl: string | null = null;
  projectName: string = '';
  selectedFile: File | null = null;

  constructor(private adminService: CDP_AdminService, private dialogRef: MatDialogRef<UserCreateComponent>) { }

  onSubmit() {
    /*this.projectService.insertNewProject(this.getDataForm()).subscribe(() => {
      this.dialogRef.close(true); // Fermer la boîte de dialogue avec un résultat positif
    });*/
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
      return;
    }

    // Réinitialisez errorMessage s'il n'y a pas d'erreur
    this.errorMessage = '';

    const currentDate = this.getCurrentFormattedDate();

    const newProjet = {
      DateCreation: currentDate,
      NumeroProjet: NumeroProjet,
      TitreProjet: this.escapeString(TitreProjet),
      LocaliteProjet:  this.escapeString(LocaliteProjet),
      DescriptifProjet:  this.escapeString(Descriptif)
    }
    return newProjet;
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
