import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Note } from 'src/app/core/models/projets/note.model';
import { CDP_ProjetsService } from 'src/app/core/services/projets/projet.service';

@Component({
  selector: 'app-note-item',
  templateUrl: './note-item.component.html',
  styleUrls: ['./note-item.component.scss']
})
export class NoteItemComponent {
  @Input() note!: Note; // Input pour recevoir les données du projet
  @Output() noteDeleted = new EventEmitter<number>();

  constructor(private projetService: CDP_ProjetsService, private dialogRef: MatDialogRef<NoteItemComponent>) {
  }

  deleteSpecificNote(noteId: number) {
    const userConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette note ?");
    if (userConfirmed) {
        this.projetService.deleteSpecificNote(noteId).subscribe(
            () => {
                this.noteDeleted.emit(noteId);
            },
            (error) => {
                console.error("Erreur lors de la suppression de la note : ", error);
                // Vous pouvez gérer l'erreur ici, par exemple en affichant un message à l'utilisateur.
            }
        );
    } else {
        console.log("Suppression annulée par l'utilisateur.");
    }
}
}
