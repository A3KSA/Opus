import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CDP_ProjetsService } from 'src/app/core/services/projets/projet.service';

@Component({
  selector: 'app-note-create',
  templateUrl: './note-create.component.html',
  styleUrls: ['./note-create.component.scss']
})
export class NoteCreateComponent {
  @ViewChild('myForm') myForm!: ElementRef;
  ligneId!: number;
  commentaire: string = ''; // Propriété pour stocker le contenu du textarea

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private projetService: CDP_ProjetsService, private dialogRef: MatDialogRef<NoteCreateComponent>) {
    this.ligneId = data.ligneId;
  }

  insertNewComment(){
    if(this.commentaire != '') {
      const checkInfos = {
        DateNote: this.getCurrentDateISO(),
        ContentNote: this.escapeString(this.commentaire),
        IdLigne: this.ligneId
      };
      this.projetService.insertNewNote(checkInfos).subscribe(() => {
        console.log("Insertion dans base de données");
        this.dialogRef.close();
      });
    }
  }

  private escapeString(input: string): string {
    return input.replace(/'/g, "''");
  }

  getCurrentDateISO(): string {
    const currentDate = new Date();
    return currentDate.toISOString();
  }

  formatDescription(description: string): string{
    // Restaurez les retours à la ligne
    const DescriptifAvecRetoursALaLigne = description.replace(/\\n/g, '\n');
    return DescriptifAvecRetoursALaLigne;
}

}
