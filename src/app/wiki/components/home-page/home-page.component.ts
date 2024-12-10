import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Utilisateur } from 'src/app/core/models/projets/utilisateur.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { DbService } from 'src/app/core/services/db.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  utilisateur: Utilisateur = { pk_utilisateur: 0, nom: '', prenom: '', initiale: '', derniere_connexion: new Date(), fk_privilege_CDP: 0, fk_privilege_WIKI: 0, fk_privilege_EPLAN:0 };
  tags: string[] = ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5'];
  selectedTags: string[] = [];
  tagsString: string = '';
  showPopup: boolean = false;
  startDate!: string;

  searchTerm: string = '';

  constructor(private router: Router, private authService: AuthService, private dbService: DbService) {
    const currentDate = new Date();
    this.startDate = currentDate.toISOString().substr(0, 10);
  }

  ngOnInit() {
    this.dbService.closeConnections().subscribe(() => {
      console.log("Connections closed, now fetching user info.");
      this.getInfosUser(); // Appeler cette fonction après la fermeture des connexions
    }, (error) => {
      console.error("Error closing connections", error);
    });
  }


  onSearch() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/searchArticle'], { queryParams: { term: this.searchTerm } });
    }
  }

  togglePopup(): void {
    this.showPopup = !this.showPopup;
  }

  onTagChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const tag = inputElement.value;
    if (inputElement.checked) {
      if (!this.selectedTags.includes(tag)) {
        this.selectedTags.push(tag);
      }
    } else {
      const index = this.selectedTags.indexOf(tag);
      if (index >= 0) {
        this.selectedTags.splice(index, 1);
      }
    }
    this.updateTagsString();
  }

  updateTagsString(): void {
    this.tagsString = this.selectedTags.join(', ');
  }

  getInfosUser(){
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
}
