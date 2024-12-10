import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Projet } from 'src/app/core/models/projets/projet.model';
import { CDP_ProjetsService, User } from 'src/app/core/services/projets/projet.service';
import { MatDialog } from '@angular/material/dialog';
import { ProjetCreateComponent } from '../Projet/projet-create/projet-create.component';
import { Utilisateur } from 'src/app/core/models/projets/utilisateur.model';
import { GestionUsersComponent } from '../Admin/gestion-users/gestion-users.component';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-gestion-projets',
  templateUrl: './gestion-projets.component.html',
  styleUrls: ['./gestion-projets.component.scss']
})
export class GestionProjetsComponent {
  utilisateur: Utilisateur = { pk_utilisateur: 0, nom: '', prenom: '', initiale: '', derniere_connexion: new Date(), fk_privilege_CDP: 0, fk_privilege_WIKI: 0, fk_privilege_EPLAN: 0 };
  listProjets: Projet[] = []; //Liste de Projets
  showingFavorites: boolean = false;  // Nouvelle propriété pour suivre l'état


  constructor(private router: Router, private projetService: CDP_ProjetsService, public dialog: MatDialog, private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit() {
    const userSession = this.authService.getUserSession();

    if (userSession && userSession.user) {
      const user = userSession.user;

      this.authService.getInfosLoggedUser(user).subscribe(
        utilisateurs => {
          if (Array.isArray(utilisateurs) && utilisateurs.length > 0) {
            const utilisateur = utilisateurs[0]; // Accéder au premier utilisateur du tableau
            // Mapper les propriétés de l'utilisateur retourné par l'API à votre modèle
            this.utilisateur = this.mapToUtilisateurModel(utilisateur);
            localStorage.setItem('param2', this.utilisateur.initiale.toLocaleLowerCase());
            this.refreshProjectList();
          } else {
            console.warn('Aucun utilisateur trouvé dans la réponse.');
          }
        },
        error => {
          console.error('Erreur lors de la récupération des informations de l\'utilisateur', error);
        }
      );
    } else {
      console.error('Aucun utilisateur enregistré dans la session.');
    }
  }

  /**
   * fonction d'abonnement au service qui récupère la liste des projets
   */
  getAllProjets() {
    this.projetService.getAllProjects().subscribe(
      (data: Projet[]) => {
        this.listProjets = data;
        this.showingFavorites = false;  // Mettre à jour l'état
      },
      (error) => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
  }

  // Fonction pour mapper les propriétés de l'objet API à votre modèle
  private mapToUtilisateurModel(data: any): Utilisateur {
    return {
      pk_utilisateur: data.PK_Utilisateur, // Assurez-vous que ces clés correspondent aux clés de l'objet retourné par l'API
      nom: data.Nom,
      prenom: data.Prenom,
      initiale: data.Initiales,
      derniere_connexion: data.DerniereConnexion,
      fk_privilege_EPLAN: data.fk_privilege_EPLAN,
      fk_privilege_WIKI: data.fk_privilege_WIKI,
      fk_privilege_CDP: data.fk_privilege_CDP
      // Ajoutez d'autres mappages selon vos besoins
    };
  }

  getFavProjects() {
    console.log("liste des favoris");
    this.projetService.getFavProjects(this.utilisateur.initiale.toLocaleLowerCase()).subscribe(
      (data: Projet[]) => {
        this.listProjets = data;
        this.showingFavorites = true;  // Mettre à jour l'état
      },
      (error) => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
  }

  openNewProjetDialog(): void {
    const dialogRef = this.dialog.open(ProjetCreateComponent, {
    });

    dialogRef.afterClosed().subscribe(result => {
      // Si le résultat est défini, cela signifie que le projet a été ajouté
      if (result) {
        this.getAllProjets();
      }
    });
  }

  openEditUsers(): void {
    const dialogRef = this.dialog.open(GestionUsersComponent, {
    });
    dialogRef.afterClosed().subscribe(result => {
      // Si le résultat est défini, cela signifie que le projet a été ajouté
      if (result) {
        //this.getAllProjets();
      }
    });
  }

  refreshProjectList() {
    this.getAllProjets();
  }

  onCardClick(projectId: number, projetTitre: string) {
    localStorage.setItem('param1', projetTitre);
    localStorage.setItem('param2', this.utilisateur.initiale);
    this.router.navigate(['/projets', projectId]);
  }

}
