import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Step } from 'src/app/core/models/steps/step.model';
import { SidebarService } from 'src/app/core/services/sidebar.service';
import { STEPService } from 'src/app/core/services/step.service';

@Component({
  selector: 'app-list-steps',
  templateUrl: './list-steps.component.html',
  styleUrls: ['./list-steps.component.scss']
})
export class ListStepsComponent {
  selectedStep: Step | null = null; //Enregistre la step sélectionnée
  listSteps: Step[] = []; //Liste de STEPs
  searchText: string = ''; // Propriété pour stocker le texte de recherche
  isMobileWidth!: boolean;

  //Injection du service pour les STEP
  constructor(private stepService: STEPService, private sidebarService: SidebarService, private cdr: ChangeDetectorRef, private route: ActivatedRoute){}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.checkIsMobileWidth();
    this.getAllSteps();
    });
    this.stepService.refreshSteps();
  }

  ngAfterViewInit(){
    this.getAllSteps();
  }

  // Test si on lance l'application sur un mobile ou non
  checkIsMobileWidth() {
    this.isMobileWidth = window.innerWidth <= 1170; // 768px est la largeur de l'écran mobile
  }

  getAllSteps() {
    this.stepService.steps$.subscribe(
      data => {
        this.listSteps = Array.isArray(data) ? data.map(item => this.stepService.transformArrayToStep(item)) : [];
      },
      error => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
  }

  get filteredSteps(): any[] {
    if (this.searchText.trim() !== '') {
      return this.listSteps.filter((step) => {
        // Filtrez les étapes en fonction du texte de recherche
        return step.titre.toLowerCase().includes(this.searchText.toLowerCase());
      });
    } else {
      return this.listSteps;
    }
  }

  selectStep(step: Step) {
    this.selectedStep = step;
    if (this.isMobileWidth) {
      this.sidebarService.setSidebarState(false); // Ferme la barre de navigation en mode mobile
    }
    this.cdr.detectChanges(); // Force la détection des changements
  }

  /**
   * Fonction permettant de réinitialiser la sélection des STEP (Permet de changer de screen sur mobile)
   */
  goBackToColumn() {
    // Réinitialisez la sélection pour revenir à la colonne de gauche
    this.selectedStep = null;
  }

  toggleSidebar() {
    console.log('toggleMenu called'); // Log pour débogage
    this.sidebarService.setSidebarState(true);
  }
}
