import { Component, Input } from '@angular/core';
import { Projet } from 'src/app/core/models/steps/projet.model';
import { Step } from 'src/app/core/models/steps/step.model';
import { STEPService } from 'src/app/core/services/step.service';

@Component({
  selector: 'app-projets-section',
  templateUrl: './projets-section.component.html',
  styleUrls: ['./projets-section.component.scss']
})
export class ProjetsSectionComponent {

  projets: Projet[] = [];
  listAuteurs: string[] = [];
  listeSuivis: string[] = [];
  selectedAuteur: string = "";
  selectedSuivi: string = "";
  //Permet de séparer chaque checkbox de statuts avec des propriétés indépendantes pour chaque.
  statusEntries: { etatProjet: string, color: string }[] = [];
  statusFilters: { [key: string]: boolean } = {};

  @Input() selectedStep!: Step;

  //Injection du service pour les STEP
  constructor(private stepService: STEPService) {
  }

  ngOnInit() {
    this.stepService.getAllEtatsProjects().subscribe((data) => {
      this.statusEntries = data;
      this.initializeStatusFilters();
    });
    this.stepService.getCollaborateursFilter().subscribe(
      data => {
        this.listAuteurs = data;
        this.listeSuivis = data;
      },
      error => {
        console.error(error);
      }
    );
    this.getAllProjetsFromSelectedStep();
  }

  /**
   * Fonction permettant de mettre à jour la liste des interventions lors d'un changement de sélection de STEP
   */
  ngOnChanges() {
    this.getAllProjetsFromSelectedStep();
  }

  onCategrorieValueChange() {
    this.getAllProjetsFromSelectedStep();
  }

  // fonction appelée lors de changements de sélection de statut de ligne de projets
  onStatutChange(status: string): void {
    const normalizedStatus = status;
    this.statusFilters[normalizedStatus] = !this.statusFilters[normalizedStatus]; // Toggle the filter status
    // You can add additional logic to handle filter changes here
    this.getAllProjetsFromSelectedStep();
  }

  initializeStatusFilters(): void {
    this.statusEntries.forEach(status => {
      this.statusFilters[status.etatProjet] = false; // Initialize all filters as false
    });
  }
  /**
   * Fonction permettant de récupérer les interventions d'une certaine STEP via les fonctions du service.
   */
  getAllProjetsFromSelectedStep() {
    const etatProjets = Object.keys(this.statusFilters).filter(key => this.statusFilters[key]);
    const params = {
      nomStep: this.selectedStep.titre, // À remplacer par la valeur réelle
      etatProjets: etatProjets,
      auteur: this.selectedAuteur,
      suivi: this.selectedSuivi,
    };
    this.stepService.getAllProjetsFromSelectedSTEP(params).subscribe(
      data => {
        this.projets = data.map(item => this.stepService.transformArrayToProjects(item));
      },
      error => {
        console.error(error);
      }
    );
  }

  getStatusColor(etatProjet: string): string {
    const status = this.statusEntries.find(s => s.etatProjet === etatProjet);
    return status ? status.color : '#000'; // Default color if status not found
  }

  resetFilters() {
    this.selectedAuteur = "";
    this.selectedSuivi = "";
    this.statusFilters = {};
    this.getAllProjetsFromSelectedStep();
  }

}
