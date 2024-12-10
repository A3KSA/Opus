import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EPLAN_ProjetctService } from 'src/app/core/services/eplan/project.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalProjectComponent } from '../modals/modal-project/modal-project.component';

@Component({
  selector: 'app-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss']
})
export class ProjectsListComponent {
  listProjects: any[] = [];
  filteredProjects: any[] = []; // Liste filtrée à afficher

  // Valeurs pour les filtres
  selectedResponsable: string = '';
  searchProjectNumber: string = '';
  searchProjectName: string = '';

  constructor(private router: Router, private EPLAN_ProjectService: EPLAN_ProjetctService, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.getAllProjects();
  }

  getAllProjects() {
    this.EPLAN_ProjectService.getAllProjects().subscribe((response: any) => {
      this.listProjects = response;
      this.filteredProjects = this.listProjects; // Initialiser la liste filtrée avec la liste complète
    });
  }

  // Méthode pour filtrer les projets
  filterProjects() {
    // Extraire les initiales du responsable sélectionné (texte entre parenthèses)
    const selectedInitials = this.selectedResponsable.match(/\(([^)]+)\)/)?.[1].toLowerCase() || '';

    this.filteredProjects = this.listProjects.filter(project => {
      return (
        // Vérifie si le responsable correspond
        (this.selectedResponsable === '' || project.Createur.toLowerCase() === selectedInitials) &&
        // Vérifie si le numéro de projet contient la recherche
        (this.searchProjectNumber === '' || project.Number.toString().includes(this.searchProjectNumber)) &&
        // Vérifie si le nom du projet contient la recherche
        (this.searchProjectName === '' || project.Name.toLowerCase().includes(this.searchProjectName.toLowerCase()))
      );
    });
  }

  // Méthode appelée lors du changement de sélection dans le dropdown
  onResponsableChange(event: any) {
    this.selectedResponsable = event.target.value;
    this.filterProjects();
  }

  // Méthode appelée lors de la saisie du numéro de projet
  onProjectNumberInput(event: any) {
    this.searchProjectNumber = event.target.value;
    this.filterProjects();
  }

  // Méthode appelée lors de la saisie du nom de projet
  onProjectNameInput(event: any) {
    this.searchProjectName = event.target.value;
    this.filterProjects();
  }

  resetFilters(){
    this.selectedResponsable = '';
    this.searchProjectNumber = '';
    this.searchProjectName = '';
    this.filteredProjects = this.listProjects; // Restaurer la liste complète
  }


  onCardClick(projectId: number, projetTitre: string) {
    localStorage.setItem('param1', projetTitre);
    this.router.navigate(['/eplan', projectId]);
  }

  openModalNewProject(): void {
    const dialogRef = this.dialog.open(ModalProjectComponent, { autoFocus: false, data: {} });
    // Actions à exécuter après la fermeture du dialogue
    dialogRef.afterClosed().subscribe(result => {
      this.getAllProjects();
    });
  }

  deleteProject(projectId: any) {
    console.log(projectId);
    const userConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Toutes les données internes seront également supprimées.");
    if (userConfirmed) {
      this.EPLAN_ProjectService.deleteProject(projectId).subscribe(
        response => {
          console.log(response.message);
          // Mettre à jour la liste localement après la suppression
          this.listProjects = this.listProjects.filter(project => project.PK_Project !== projectId);
        },
        error => {
          console.error('Erreur lors de la suppression du projet', error);
        }
      );
    } else {
      console.log("Suppression annulée par l'utilisateur.");
    }
  }

}
