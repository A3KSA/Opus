import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Utilisateur } from 'src/app/core/models/projets/utilisateur.model';
import { CDP_AdminService } from 'src/app/core/services/projets/admin.service';
import { UserCreateComponent } from '../user-create/user-create.component';

@Component({
  selector: 'app-gestion-users',
  templateUrl: './gestion-users.component.html',
  styleUrls: ['./gestion-users.component.scss']
})
export class GestionUsersComponent {

  listUsers: Utilisateur[] = [];

  constructor(private cdp_adminService: CDP_AdminService, public dialog: MatDialog){}

  ngOnInit(){
    this.getAllUsers();
  }

  getAllUsers() {
    console.log("liste des utilisateurs");
    this.cdp_adminService.getAllUsers().subscribe(
      (data: Utilisateur[]) => {
        this.listUsers = data;
      },
      (error) => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
  }

  deleteSpecificUser(lineId: number) {
    const userConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?");
    if (userConfirmed) {
        this.cdp_adminService.deleteSpecificUser(lineId).subscribe(
            (error) => {
                console.error("Erreur lors de la suppression de la ligne : ", error);
                // Vous pouvez gérer l'erreur ici, par exemple en affichant un message à l'utilisateur.
            }
        );
    } else {
        console.log("Suppression annulée par l'utilisateur.");
    }
}

openEditUser(event: MouseEvent, user: Utilisateur): void {
  event.stopPropagation(); // Empêche la propagation de l'événement de clic au parent
  const dialogRef = this.dialog.open(UserCreateComponent, {
    data: {
      user: user
    }
  });
  dialogRef.afterClosed().subscribe(result => {
  });
}

  getBackgroundColor(fk_privilege: number): string {
    switch (fk_privilege) {
      case 1:
        return 'rgb(2, 166, 118)'; // Couleur pour le privilège 1
      case 2:
        return 'rgb(8, 151, 180)'; // Couleur pour le privilège 2
      case 3:
        return 'rgb(237, 139, 22)'; // Couleur pour le privilège 2
      // Ajoutez d'autres cas ici
      default:
        return 'black'; // Couleur par défaut
    }
  }
}
