import { Component, Input } from '@angular/core';
import { Document } from 'src/app/core/models/steps/document.model';
import { Step } from 'src/app/core/models/steps/step.model';
import { PopupService } from 'src/app/core/services/popup.service';
import { STEPService } from 'src/app/core/services/step.service';

@Component({
  selector: 'app-documents-section',
  templateUrl: './documents-section.component.html',
  styleUrls: ['./documents-section.component.scss']
})
export class DocumentsSectionComponent {

  documents: Document[] = [];

  @Input() selectedStep!: Step;
  displayedColumns: string[] = ['name', 'weight', 'symbol'];

  //Injection du service pour les STEP
  constructor(private stepService: STEPService, private popupService: PopupService) {
  }

  ngOnInit() {
    this.getAllDocumentsFromSelectedStep();

    this.stepService.documentAdded$.subscribe(() => {
      this.getAllDocumentsFromSelectedStep();
    });
  }

    /**
   * Fonction permettant de mettre à jour la liste des interventions lors d'un changement de sélection de STEP
   */
    ngOnChanges() {
      this.getAllDocumentsFromSelectedStep();
      this.stepService.documentAdded$.subscribe(() => {
        this.getAllDocumentsFromSelectedStep();
      });
    }

  /**
   * Fonction permettant de récupérer les interventions d'une certaine STEP via les fonctions du service.
   */

  getAllDocumentsFromSelectedStep() {
    this.stepService.getAllDocumentsFromSelectedSTEP(this.selectedStep.titre).subscribe(
      data => {
        this.documents = data.map(item => this.stepService.transformArrayToDocuments(item));
      },
      error => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
  }

  deleteSpecificDocument(lineId: number) {
    const userConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce lien ?");
    if (userConfirmed) {
      this.stepService.deleteSpecificDocument(lineId).subscribe(
        () => {
          // Recharger la liste des documents après la suppression réussie
          this.getAllDocumentsFromSelectedStep();
        },
        error => {
          console.error('Erreur lors de la suppression du document:', error);
          // Gérez l'erreur si nécessaire
        }
      );
    } else {
      console.log("Suppression annulée par l'utilisateur.");
    }
  }
}
