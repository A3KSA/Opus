import { Component, ElementRef, Input, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { LogService } from 'src/app/core/services/log.service';
import { CDP_ProjetsService } from 'src/app/core/services/projets/projet.service';
import { CDP_RapportsService } from 'src/app/core/services/projets/rapport.service';
import { Ligne } from 'src/app/core/models/projets/ligne.model';
import { NoteModalComponent } from '../../Notes/note-modal/note-modal.component';
import { Note } from 'src/app/core/models/projets/note.model';

@Component({
  selector: 'app-ligne-item',
  templateUrl: './ligne-item.component.html',
  styleUrls: ['./ligne-item.component.scss']
})
export class LigneItemComponent {
  @Input() ligne!: Ligne;
  isExpanded = false; // Par défaut, le volet des filtres est fermé
  hasNotes: boolean = false;

  constructor(private elementRef: ElementRef, private projetService: CDP_ProjetsService, private rapportService: CDP_RapportsService,
    public logger: LogService, private route: ActivatedRoute, public dialog: MatDialog) {}

    ngOnInit() {
      this.checkIfLigneHasNotes();
    }

    ngOnChanges(){
      this.checkIfLigneHasNotes();
    }
  
    checkIfLigneHasNotes(): void {
      if (this.ligne && this.ligne.pk_ligne) {
        this.projetService.getNotesFromSpecificLigne(this.ligne.pk_ligne).subscribe({
          next: (notes: Note[]) => {
            this.hasNotes = notes.length > 0;
            //console.log('hasNotes:', this.hasNotes);  // Log the hasNotes value
          },
          error: (error) => {
            console.error('Error checking for notes', error);
            this.hasNotes = false;
          }
        });
      }
    }

    deleteSpecificLine(lineId: number) {
      const userConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette Ligne ?");
      if (userConfirmed) {
        this.projetService.deleteSpecificLine(lineId).subscribe();
      } else {
        console.log("Suppression annulée par l'utilisateur.");
      }
    }
    

    openNotesList(ligne: Ligne): void {
      const dialogRef = this.dialog.open(NoteModalComponent, {
        data: {
          ligne: ligne,
        }
      });
      dialogRef.afterClosed().subscribe(() => {
      });
    }

  /**
   * Fonction pour formater une date avec des options personnalisées
   */
  formatDate(dateString: string): string {
    const formattedDate = new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
      // Ajoutez d'autres options selon vos besoins
    });
    return formattedDate;
  }

  formatDescription(description: string): string {
    // Restaurez les retours à la ligne
    const DescriptifAvecRetoursALaLigne = description.replace(/\\n/g, '\n');
    return DescriptifAvecRetoursALaLigne;
  }

  initializeProgressBarWidth(avancement: number): string {
    //Format de l'avancement
    const newAvancement = avancement * 100;
    return newAvancement + "%";
  }
}
