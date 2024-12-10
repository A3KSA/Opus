import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { STEPService } from 'src/app/core/services/step.service';

@Component({
  selector: 'app-modal-create-doc',
  templateUrl: './modal-create-doc.component.html',
  styleUrls: ['./modal-create-doc.component.scss']
})
export class ModalCreateDocComponent {

  Nomdocument: string = '';
  DescriptionDocument: string = '';
  LienDocument: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private stepService: STEPService, private dialogRef: MatDialogRef<ModalCreateDocComponent>) { }

  addDocument() {
    const selectedStep = this.data.nomStep;
    this.stepService.insertNewDocumentIntoSelectedSTEP(selectedStep, this.Nomdocument, this.DescriptionDocument, this.LienDocument).subscribe(
      (response) => {
        // Réinitialisez les valeurs des champs de saisie après avoir ajouté un document
        this.Nomdocument = '';
        this.DescriptionDocument = '';
        this.LienDocument = '';

        // Notify that a document has been added
        this.stepService.notifyDocumentAdded();
      },
      error => {
        console.error(error);
      }
    );
    this.dialogRef.close();
  }
}
