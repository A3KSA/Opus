import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Complement } from 'src/app/core/models/projets/complement.model';
import { CDP_ProjetsService } from 'src/app/core/services/projets/projet.service';
import { ComplementCreateComponent } from '../complement-create/complement-create.component';

@Component({
  selector: 'app-complements-historique',
  templateUrl: './complements-historique.component.html',
  styleUrls: ['./complements-historique.component.scss']
})
export class ComplementsHistoriqueComponent {
  listComplement: Complement[] = []; //Liste de Projets avec propriété hasNotes
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private projetService: CDP_ProjetsService, public dialog: MatDialog, private dialogRef: MatDialogRef<ComplementsHistoriqueComponent>) {
    this.getComplements(data.ligneId);
  }

  getComplements(lineId: number): void {
    this.projetService.getComplementFromSpecificLine(lineId).subscribe(
      (data: Complement[]) => {
        this.listComplement = data.map(Complements => ({
          ...Complements
        }));
      }
    );
  }

  
  // Fonction pour formater la date avec le mois en lettres
  formatDateCustom(isoDate: string): string {
    const date = new Date(isoDate);
    
    // Tableau des noms des mois
    const monthNames = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} à ${hours}:${minutes}:${seconds}`;
  }

  openComplementModal(): void {
    const dialogRef = this.dialog.open(ComplementCreateComponent, {
      data: {
        ligneId: this.data.ligneId,
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getComplements(this.data.ligneId);
    }
  );
  }
}
