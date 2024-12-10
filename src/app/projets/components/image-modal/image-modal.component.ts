import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { catchError, map, Observable, switchMap } from 'rxjs';
import { CDP_ProjetsService } from 'src/app/core/services/projets/projet.service';
import { CDP_RapportsService } from 'src/app/core/services/projets/rapport.service';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss']
})
export class ImageModalComponent {
selectedFile!: File;
imageUrl: string | ArrayBuffer = "";

constructor(@Inject(MAT_DIALOG_DATA) public data: any,private projetService: CDP_ProjetsService, private rapportService: CDP_RapportsService){
}

onFileSelected(event: any): void {
  const file: File = event.target.files[0];
  if (file) {
    this.selectedFile = file; // Stockez le fichier pour un envoi ultérieur
  console.log("file: "+this.selectedFile);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result; // Utilisé pour l'affichage de la prévisualisation
    };
    reader.readAsDataURL(file);
  }
}

onSubmit(): void {
  if (this.selectedFile) {
    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name);
    formData.append('projectNumber', this.data.projectId);
    formData.append('lineId', this.data.rowId);
    this.rapportService.insertNewImage(formData);
  }
}
  
}
