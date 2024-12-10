import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalCreateInfoComponent } from '../popups/modal-create-info/modal-create-info.component';
import { STEPService } from 'src/app/core/services/step.service';
import { ModalCreateDocComponent } from '../popups/modal-create-doc/modal-create-doc.component';
import { ModalUpdateStepComponent } from '../popups/modal-update-step/modal-update-step.component';
import { ModalUpdateExploitComponent } from '../popups/modal-update-exploit/modal-update-exploit.component';
import { ModalCreateExploitComponent } from '../popups/modal-create-exploit/modal-create-exploit.component';
import { SidebarService } from 'src/app/core/services/sidebar.service';

@Component({
  selector: 'app-step-details',
  templateUrl: './step-details.component.html',
  styleUrls: ['./step-details.component.scss']
})
export class StepDetailsComponent {

  private _selectedStep: any;
  @Output() backToColumn = new EventEmitter<void>(); // Émetteur d'événement pour indiquer le retour à la colonne de gauche

  startDate!: string;
  endDate!: string;
  texteSearch: string = '';

  @Input() 
  set selectedStep(step: any) {
    this._selectedStep = step;
    if (step) {
      this.getAllNotes(); // Assurez-vous que `numero` est la bonne propriété pour identifier le step
    }
  }

  ngOnInit(): void {
    this.stepService.notes$.subscribe(notes => {
      this.notes = notes
    });
    this.getAllNotes();
  }
  
  get selectedStep(): any {
    return this._selectedStep;
  }

  editableText: string = '';
  notes: any[] = []; // Propriété pour stocker les notes

  constructor(public dialog: MatDialog, private stepService: STEPService, private sidebarService: SidebarService){
    // Initialisez les dates au 1er du mois courant et à la date actuelle
  const currentDate = new Date();
  this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().substr(0, 10);
  this.endDate = currentDate.toISOString().substr(0, 10);
  }

  getAllNotes(){
    console.log("getAllNotes");
    this.stepService.getAllNotesFromSpecificSTEP(this.startDate, this.endDate, this.texteSearch, this._selectedStep.numero).subscribe(
      (data: any[]) => {
        this.notes = data;
        this.stepService.setNotes(data);
      },
      (error) => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
  }

  refreshExploitants(): void {
    this.stepService.getStepbyId(this._selectedStep.numero).subscribe(
      data => {
        if (Array.isArray(data) && data.length > 0) {
          this._selectedStep = this.stepService.transformArrayToStep(data[0]);
        }
      },
      error => {
        console.error('Erreur lors de la récupération des données du step', error);
      }
    );
  }

  deleteExistingExploitant(){
    const userConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet exploitant ?");
      if (userConfirmed) {
        this.stepService.deleteExploitant(this._selectedStep.numero, this.selectedStep.exploitant.length).subscribe(
          response => {
            console.log(response.message);
            this.refreshExploitants(); // Rafraîchissez les exploitants après la suppression
          },
          error => {
            console.error('Erreur lors de la suppression de l\'exploitant', error);
          }
        );
      } else {
        console.log("Suppression annulée par l'utilisateur.");
      }
  }

  onCategrorieValueChange() {
    this.getAllNotes();
  }

  resetFilters() {
    const currentDate = new Date();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().substr(0, 10);
     this.endDate = currentDate.toISOString().substr(0, 10);
     this.texteSearch = '';
  }

  openModalAddExploitant(): void {
    const dialogRef = this.dialog.open(ModalCreateExploitComponent, {
      data: {
        idClient: this._selectedStep.numero,
        exploitantsCount: this.selectedStep.exploitant.length
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshExploitants();
      }
    });
  }

  openModalUpdateExistingExploitant(exploitant: any): void {
    const dialogRef = this.dialog.open(ModalUpdateExploitComponent, {
      data: {
        idClient: this._selectedStep.numero,
        exploitantsCount: this.selectedStep.exploitant.length,
        exploitant: exploitant
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // Si le résultat est défini, cela signifie que le projet a été ajouté
      if (result) {
        this.refreshExploitants();
      }
    });
  }

  openModalUpdateInfosStep(): void {
    const dialogRef = this.dialog.open(ModalUpdateStepComponent, {
      data: {
        step: this._selectedStep
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // Si le résultat est défini, cela signifie que le projet a été ajouté
      if (result) {
      }
    });
  }

  openModalNewNote(): void {
    const dialogRef = this.dialog.open(ModalCreateInfoComponent, {
      data: {
        STEPId: this.selectedStep.numero
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllNotes();
      }
    });
  }

  openModalNewDocument(): void {
    const dialogRef = this.dialog.open(ModalCreateDocComponent, {
      data: {
        nomStep: this.selectedStep.titre
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // Si le résultat est défini, cela signifie que le projet a été ajouté
      if (result) {
      }
    });
  }

  /**
   * Fonction permettant de générer un évnement pour indiquer le clic du bouton (retour) au composant parent (list-steps)
   */
  goBackToColumn() {
    this.sidebarService.setSidebarState(false); // Ferme la barre de navigation en mode mobile
    // Émettre un événement pour indiquer au composant parent de revenir à la colonne de gauche
    this.backToColumn.emit();
  }
}
