import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { EPLAN_ProjetctService } from 'src/app/core/services/eplan/project.service';

@Component({
  selector: 'app-modal-project',
  templateUrl: './modal-project.component.html',
  styleUrl: './modal-project.component.scss'
})
export class ModalProjectComponent {

  numProjet: string = '';
 nomProjet: string = '';
  responsable: string = '';

  constructor(public dialogRef: MatDialogRef<ModalProjectComponent>,private eplan_service: EPLAN_ProjetctService) { }

  addProject() {

    if(this.numProjet === '' && this.nomProjet === ''){
    }

    const newProjet = {
      numProjet: this.numProjet,
      nomProjet: this.nomProjet,
      responsable: this.responsable
    };

    console.log(newProjet);

    this.eplan_service.addProject(newProjet).subscribe(response => {
      console.log('Response:', response);
    }, error => {
      console.error('Error:', error);
      // Gérez les erreurs ici, par exemple afficher un message d'erreur.
    });
    this.dialogRef.close();
  }
}
