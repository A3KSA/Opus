import { Component, Inject, Input, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { STEPService } from 'src/app/core/services/step.service';

@Component({
  selector: 'app-modal-create-info',
  templateUrl: './modal-create-info.component.html',
  styleUrls: ['./modal-create-info.component.scss']
})
export class ModalCreateInfoComponent {
  editableText: string = '';
  StepID: number = 0;
  titre: string = '';

  @ViewChild('quillEditor', { static: false }) quillEditor: any;

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // Ajoute des options de mise en forme de texte
      [{ 'list': 'ordered'}, { 'list': 'bullet' }], // Ajoute des options de liste ordonnée et non ordonnée
      [{ 'header': [1, 2, 3, false] }], // Ajoute des options de titres
      [{'indent': '-1'}, {'indent': '+1'}], // Option d'indentation
      [{'size': ['small', false, 'large', 'huge']}], // Taille du texte
      [{'align': []}], //Allignement du texte
      ['clean'] // Ajoute une option pour nettoyer la mise en forme
    ]
  };

  constructor(private stepService: STEPService, @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ModalCreateInfoComponent>) {
    this.StepID = data.STEPId;
  }

  saveContent() {
    const editorContent = this.quillEditor.quillEditor.root.innerHTML; // Récupérez le contenu HTML
    console.log(editorContent);
      const data = {
        IdClient: this.StepID,
        Content: editorContent,
        Date: this.getCurrentDateISO(),
        Titre: this.titre
      };
      this.stepService.insertNewNoteIntoSpecificSTEP(data).subscribe(() => {
          this.dialogRef.close(true);
      });
  }

  getCurrentDateISO(): string {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().substr(0, 10);
    return formattedDate;
  }
}
