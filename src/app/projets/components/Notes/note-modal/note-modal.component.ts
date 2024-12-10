import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Note } from 'src/app/core/models/projets/note.model';
import { CDP_ProjetsService } from 'src/app/core/services/projets/projet.service';
import { NoteCreateComponent } from '../note-create/note-create.component';

@Component({
  selector: 'app-note-modal',
  templateUrl: './note-modal.component.html',
  styleUrls: ['./note-modal.component.scss']
})
export class NoteModalComponent {

  listNotes: Note[] = []; //Liste de Projets

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private projetService: CDP_ProjetsService, public dialog: MatDialog, private dialogRef: MatDialogRef<NoteModalComponent>) {
    this.getAllNotes(data.ligne.pk_ligne);
  }


  /**
* fonction d'abonnement au service qui récupère la liste des notes
*/
  getAllNotes(ligneId: number) {
    this.projetService.getNotesFromSpecificLigne(ligneId).subscribe(
      (data: Note[]) => {
        console.log("la ligne n°: " + ligneId);
        console.log("Liste des notes: ", data);
        this.listNotes = data.map(note => ({
          ...note,
          date: this.formatDate(note.date)
        }));
      },
      (error) => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
  }

  openNewNoteDialog(): void {
    const dialogRef = this.dialog.open(NoteCreateComponent, {
      data: {ligneId: this.data.ligne.pk_ligne}
    });
    dialogRef.afterClosed().subscribe(() => {
      console.log("mise à jour");
      this.getAllNotes(this.data.ligne.pk_ligne);
    }
    );
  }

  handleNoteDeleted(noteId: number) {
    this.getAllNotes(this.data.ligne.pk_ligne);
  }

  formatDate(isoDateString: string): string {
    const date = new Date(isoDateString);

    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin",
      "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    const month = monthNames[date.getMonth()]; // Utilisation du nom du mois
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${day} ${month} ${year} - ${hours}:${minutes}:${seconds}`;
  }

}
