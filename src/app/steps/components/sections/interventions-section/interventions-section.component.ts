import { Component, Input, SimpleChanges } from '@angular/core';
import { switchMap } from 'rxjs';
import { Intervention } from 'src/app/core/models/steps/intervention.model';
import { Step } from 'src/app/core/models/steps/step.model';
import { STEPService } from 'src/app/core/services/step.service';

@Component({
  selector: 'app-interventions-section',
  templateUrl: './interventions-section.component.html',
  styleUrls: ['./interventions-section.component.scss']
})
export class InterventionsSectionComponent {

  interventions: Intervention[] = [];
  collaborateurs: string[] = [];

  startDate!: string;
  endDate!: string;
  selectedCollaborateur: string = "";

  @Input()selectedStep!: Step;

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'remarque'];

  //Injection du service pour les STEP
  constructor(private stepService: STEPService){
  // Initialisez les dates au 1er du mois courant et à la date actuelle
  const currentDate = new Date();
  this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().substr(0, 10);
  this.endDate = currentDate.toISOString().substr(0, 10);
}

  /**
   * Fonction permettant de charger les interventions à l'initialisation de ce composant
   */
  ngOnInit() {
    this.stepService.getCollaborateursFilter().subscribe(
      data => {
        this.collaborateurs = data;
      },
      error => {
        console.error(error);
      }
    );
    this.getFilteredInterventions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedStep'] && changes['selectedStep'].currentValue) {
      this.getFilteredInterventions();
    }
  }

  onCategrorieValueChange() {
    this.getFilteredInterventions();
  }

  resetFilters() {
    const currentDate = new Date();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().substr(0, 10);
     this.endDate = currentDate.toISOString().substr(0, 10);
     this.selectedCollaborateur = "";
     this.getFilteredInterventions();
  }

  /**
   * Fonction permettant de récupérer les interventions dans une plage de date donnée d'une certaine STEP via les fonctions du service.
   * Par défaut: 1er du mois à la date courante
   */
  getFilteredInterventions() {
    this.stepService.getFilteredInterventionsFromSelectedSTEP(this.selectedStep.titre, this.startDate, this.endDate, this.extractTextBetweenParentheses(this.selectedCollaborateur)).subscribe(
      data => {
        this.interventions = data.map(item => this.stepService.transformArrayToInterventions(item));
      },
      error => {
        console.error(error);
      }
    );
  }

  extractTextBetweenParentheses(input: string): string {
    const match = input.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
  }
}
