import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EPLAN_ProjetctService } from 'src/app/core/services/eplan/project.service';

@Component({
  selector: 'app-modal-segments',
  templateUrl: './modal-segments.component.html',
  styleUrl: './modal-segments.component.scss'
})
export class ModalSegmentsComponent {
  segmentsStructure: any[] = [];
  abbreviation: string = '';
  name: string = '';


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private eplan_service: EPLAN_ProjetctService) { }

  ngOnInit() {
    this.getAllSegments();
  }

  getAllSegments(): void {
    this.eplan_service.getAllSegmentsStructure().subscribe(
      (data: any[]) => {
        this.segmentsStructure = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des segments', error);
      }
    );
  }

  deleteSegment(segmentId: any) {
    const userConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce segment ?");
    if (userConfirmed) {
      this.eplan_service.deleteSegmentFromSpecificProject(segmentId).subscribe(
        response => {
          console.log(response.message);
          // Mettre à jour la liste localement après la suppression
        this.segmentsStructure = this.segmentsStructure.filter(segment => segment.PK_Segment !== segmentId);
        },
        error => {
          console.error('Erreur lors de la suppression de l\'a partie d\'ouvrage', error);
        }
      );
    } else {
      console.log("Suppression annulée par l'utilisateur.");
    }
  }

  addSegment(abbrevInput: any, nomInput: any) {
    // Vérifie si les champs sont valides
    if (abbrevInput.invalid || nomInput.invalid) {
      // Marquer les champs comme "touchés" pour afficher les messages d'erreur
      abbrevInput.control.markAsTouched();
      nomInput.control.markAsTouched();
      return;
    }

    const newSegment = {
      abbreviation: this.abbreviation,
      description: this.name,
      numProjet: this.data.projectId
    };

    console.log(newSegment);

    this.eplan_service.addSegmentFromSpecificProject(newSegment).subscribe(response => {
      console.log('Response:', response);
      this.getAllSegments();
      // Réinitialiser les champs après l'ajout
      this.abbreviation = '';
      this.name = '';
      // Réinitialiser les messages d'erreur
      abbrevInput.reset();
      nomInput.reset();
      // Gérez la réponse du service ici, par exemple, afficher un message de succès, vider les inputs, etc.
    }, error => {
      console.error('Error:', error);
      // Gérez les erreurs ici, par exemple afficher un message d'erreur.
    });
  }
}
