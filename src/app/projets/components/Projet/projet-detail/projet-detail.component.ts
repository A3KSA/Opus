import { Component, ElementRef, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Ligne } from 'src/app/core/models/projets/ligne.model';
import { CDP_ProjetsService } from 'src/app/core/services/projets/projet.service';
import { ItemModalComponent } from '../../item-modal/item-modal.component';
import { GestionEntitesComponent } from '../../gestion-entites/gestion-entites.component';
import { GenerateRapportComponent } from '../../generate-rapport/generate-rapport.component';
import { CDP_RapportsService } from 'src/app/core/services/projets/rapport.service';
import { EnteteRapport } from 'src/app/core/models/projets/enteteRapport.model';
import { LogService } from 'src/app/core/services/log.service';
import { ItemCreateModalComponent } from '../../item-create-modal/item-create-modal.component';
import { NoteModalComponent } from '../../Notes/note-modal/note-modal.component';

@Component({
  selector: 'app-projet-detail',
  templateUrl: './projet-detail.component.html',
  styleUrls: ['./projet-detail.component.scss']
})
export class ProjetDetailComponent implements OnInit {
  projectId!: number;
  projectTitre!: string | null;
  isExpanded = false; // Par défaut, le volet des filtres est fermé
  listlines!: (Ligne)[]; //Liste de Projets avec propriété hasNotes
  filteredLines: Ligne[] = [];
  isFilterActive: boolean = false;
  dateCreationAffichage!: string;

  listeOuvrages!: string[];
  listeInstallations!: string[];
  ListeEntitees!: string[];
  listeStatuts!: string[];
  listeResponsables: string[] = [];
  listEntetes!: EnteteRapport[]; //Liste de Projets

  constructor(private elementRef: ElementRef, private projetService: CDP_ProjetsService, private rapportService: CDP_RapportsService, public logger: LogService, private route: ActivatedRoute, public dialog: MatDialog) { }

  ngOnInit() {
    // Récupérer l'ID du projet à partir des paramètres de l'URL
    this.route.params.subscribe(params => {
      this.projectId = +params['id']; // '+params['id']' convertit la chaîne en nombre
    });
    let titreProjet = localStorage.getItem('param1');
    this.projectTitre = titreProjet;
    //Permet d'envoyer l'ID du projet au service
    this.projetService.setProjectId(this.projectId);
    //Permet de lancer la requête de récupération des lignes de projets du service
    this.projetService.getLinesWithoutFilter().subscribe(() => {
    });
    //Ensuite on s'abonne à la liste des lignes du projets stockées dans le service (permet qu'à chaque changment, ce soit mis à jour)
    this.getListLinesProjectInRealTime();

    this.projetService.getResponsablesToInsertNewLine().subscribe({
      next: (responsables) => {
        responsables.forEach(responsable => {
          const combinedString = this.combineNameAndInitials(responsable.Nom, responsable.Prenom, responsable.Initiales);
          this.listeResponsables.push(combinedString);
        });
      },
      error: (error) => {
        console.error('Error fetching responsables:', error);
      }
    });
    // S'abonner aux critères de recherche
    this.projetService.searchTerms$.subscribe(({ term1, term2 }) => {
      this.applySearchFilters(term1, term2);
    });
  }

  onFilterStatusChanged(status: boolean) {
    this.isFilterActive = status;
  }

  /**
 * fonction d'abonnement au service qui récupère la liste de ligne en temps réel
 */
  getListLinesProjectInRealTime() {
    this.projetService.allLines$.subscribe(
      (data: Ligne[]) => {
        this.listlines = this.removeDuplicates(data);
        this.filteredLines = [...this.listlines]; // Initialisation des lignes filtrées
        // Remplir les listes sans doublons
        this.listeOuvrages = this.getUniqueItems(this.listlines.map(ligne => ligne.ouvrage));
        this.listeInstallations = this.getUniqueItems(this.listlines.map(ligne => ligne.installation));
        this.listeStatuts = this.getUniqueItems(this.listlines.map(ligne => ligne.statut));
        this.ListeEntitees = this.getUniqueItems(this.listlines.map(ligne => ligne.entite));
        //this.listeResponsables = this.getUniqueItems(this.listlines.map(ligne => this.combineNameAndInitials(ligne.nom_responsable, ligne.prenom_responsable, ligne.initiales_responsable)));
      },
      (error) => {
        this.logger.error("Erreur lors de la récupération des lignes: ", error);
      }
    );
  }

  applySearchFilters(term1: string, term2: string) {
    this.filteredLines = this.filtrerDonnees(term1, term2);
  }

  // Fonction pour filtrer les données en fonction des filtres
  filtrerDonnees(term1: string, term2: string): Ligne[] {
    if (!this.listlines) {
      return [];
    }
    return this.listlines.filter(line =>
      line.designation.toLowerCase().includes(term1.toLowerCase()) &&
      line.description.toLowerCase().includes(term2.toLowerCase())
    );
  }

  removeDuplicates(lines: Ligne[]): Ligne[] {
    const seen = new Set();
    return lines.filter(line => {
      const duplicate = seen.has(line.pk_ligne);
      seen.add(line.pk_ligne);
      return !duplicate;
    });
  }

  getAllEntetes(projectId: number, callback: () => void): void {
    this.rapportService.getAllEntetes(projectId).subscribe(
      (data: EnteteRapport[]) => {
        this.listEntetes = data;
        callback(); // Exécutez la fonction de rappel après avoir assigné les données
      },
      (error) => {
        this.logger.error("Erreur lors de la récupération des entêtes: ", error);
      }
    );
  }

  setLinesToLate(projectId: number) {
    // Demande une confirmation à l'utilisateur
    const confirmation = window.confirm("Toutes les lignes présentes dans la liste actuelle et qui ont un délai dépassé deveindront 'En retard' !");
    // Vérifie la réponse de l'utilisateur
    if (confirmation) {
      this.projetService.updateLinestoSetLateStatus(projectId).subscribe();
      // Rechargez la page après confirmation
      window.location.reload();
    }
  }

  // Fonction générique pour récupérer une liste sans doublons
  getUniqueItems<T>(items: T[]): T[] {
    return items.filter((value, index, self) => self.indexOf(value) === index);
  }

  // Fonction pour combiner nom, prénom et initiales
  combineNameAndInitials(nom: string, prenom: string, initiales: string): string {
    return `${nom} ${prenom} (${initiales})`;
  }

  /**
   * Fonction qui permet de gérer l'ouverture du volet des filtres
   */
  sliddingFiltersComponent() {
    this.isExpanded = !this.isExpanded;
    const divFiltres = this.elementRef.nativeElement.querySelector('.filtres');
    const contenuFiltres = this.elementRef.nativeElement.querySelector('.boxFiltre');
    if (this.isExpanded) {
      divFiltres.style.height = "45%";
      contenuFiltres.style.opacity = "1"; // Rendre le contenu visible
    } else {
      divFiltres.style.height = "6%";
      contenuFiltres.style.opacity = "0"; // Rendre le contenu visible
    }
  }

  openDialog(ligne: Ligne): void {
    console.log(ligne.statut);
    if (ligne.statut != "Terminé") {
      const dialogRef = this.dialog.open(ItemModalComponent, {
        data: {
          ligne: ligne,
          projectNumber: this.projectId,
          listOuvrages: this.listeOuvrages,
          listInstallations: this.listeInstallations,
          listStatuts: this.listeStatuts,
          listEntetes: this.getUniqueItems(this.listeResponsables) // Maintenant garanti d'être à jour
        }
      });
      dialogRef.afterClosed().subscribe(() => {
      });
    } else {
      window.alert("La tâche est terminée et ne peux plus être éditée.");
    }
  }

  openItemCreate(): void {
    const dialogRef = this.dialog.open(ItemCreateModalComponent, {
      data: {
        projectNumber: this.projectId,
        listOuvrages: this.listeOuvrages,
        listInstallations: this.listeInstallations,
        listStatuts: this.listeStatuts,
        listEntetes: this.getUniqueItems(this.listeResponsables)
      }
    });
    dialogRef.afterClosed().subscribe(() => {
    });
  }

  openEntites(projectId: number): void {
    const dialogRef = this.dialog.open(GestionEntitesComponent, {
      data: { projectId: projectId }
    });
    dialogRef.afterClosed().subscribe(() => {
      // Actions à réaliser après la fermeture du dialogue, si nécessaire
    });
  }

  openEntitesForRapport(projectId: number): void {
    const dialogRef = this.dialog.open(GestionEntitesComponent, {
      data: {
        projectId: projectId,
        projectTitre: this.projectTitre,
        btnGenerateRapport: 'true'
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      // Actions à réaliser après la fermeture du dialogue, si nécessaire
    });
  }

  openGenerateList(projectId: number): void {
    this.getAllEntetes(projectId, () => {
      // Cette fonction de rappel est exécutée après la complétion de getAllEntetes
      const dialogRef = this.dialog.open(GenerateRapportComponent, {
        data: {
          projectId: projectId,
          projectTitre: this.projectTitre,
          listEntetes: this.listEntetes, // Maintenant garanti d'être à jour
          listLines: this.listlines,
          popupRapportOrList: false
        }
      });

      dialogRef.afterClosed().subscribe(() => {
        // Actions à réaliser après la fermeture du dialogue, si nécessaire
      });
    });
  }

  openNotesList(ligne: Ligne): void {
    const dialogRef = this.dialog.open(NoteModalComponent, {
      data: {
        ligne: ligne,
      }
    });
    dialogRef.afterClosed().subscribe(() => {
    });
  }
}


