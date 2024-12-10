import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EnteteRapport } from 'src/app/core/models/projets/enteteRapport.model';
import { LogService } from 'src/app/core/services/log.service';
import { CDP_RapportsService } from 'src/app/core/services/projets/rapport.service';
import { GenerateRapportComponent } from '../generate-rapport/generate-rapport.component';
import { EntiteCreateComponent } from '../entite-create/entite-create.component';
import { delay } from 'rxjs';
import { CDP_EnteteService } from 'src/app/core/services/projets/entete.service';

@Component({
  selector: 'app-gestion-entites',
  templateUrl: './gestion-entites.component.html',
  styleUrls: ['./gestion-entites.component.scss']
})
export class GestionEntitesComponent {
  listEntetes: EnteteRapport[] = []; //Liste de Projets
  btnForRapport: any;
  listeEntreprises!: string[];
  listeLibelleEntites!: string[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private rapportService: CDP_RapportsService, private enteteService: CDP_EnteteService, public logger: LogService, public dialog: MatDialog, private dialogRef: MatDialogRef<GestionEntitesComponent>) { }

  ngOnInit() {
    this.enteteService.refreshNeeded.subscribe(() => {
      this.getAllEntetes(this.data.projectId);
    });
    // Initial data load
    this.getAllEntetes(this.data.projectId);
    this.btnForRapport = this.data.btnGenerateRapport;
  }

  getAllEntetes(projectId: number): void {
    this.rapportService.getAllEntetes(projectId).subscribe(
      (data: EnteteRapport[]) => {
        this.listEntetes = data;
        const entreprisesSet = new Set<string>();

        data.forEach(entete => {
          entreprisesSet.add(entete.entreprise);
        });

        this.listeEntreprises = Array.from(entreprisesSet);
      },
      (error) => {
        console.error("Erreur lors de la récupération des entêtes: ", error);
      }
    );
    this.rapportService.getAllEntites(projectId).subscribe(
      (data: string[]) => {
        this.listeLibelleEntites = data;
      }
    )
  }

  updateCheckboxEntete(checkboxName: string, checkboxValue: boolean, idEntete: number): void {
    this.rapportService.updateRapportEntete(checkboxName, checkboxValue, idEntete).subscribe({
      next: (response) => {
        this.logger.info('Mise à jour de lentête réussie', response);
      },
      error: (error) => {
        this.logger.error('Erreur lors de la mise à jour de lentête: ', error);
      }
    });
  }

  openGenerateRapport(): void {
    // Fermez d'abord le dialogue actuel
    this.dialogRef.close();

    const dialogRef = this.dialog.open(GenerateRapportComponent, {
      data: {
        projectId: this.data.projectId,
        projectTitre: this.data.projectTitre,
        listEntetes: this.listEntetes,
        popupRapportOrList: true
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      // Actions à réaliser après la fermeture du dialogue, si nécessaire
    });
  }

  openAddEntitee(): void {
    const dialogRef = this.dialog.open(EntiteCreateComponent, {
      data: {
        projectId: this.data.projectId,
        entreprises: this.listeEntreprises,
        listEntetes: this.listeLibelleEntites
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Modale fermée');
    });
  }
}
