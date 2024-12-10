import { Component, Input } from '@angular/core';
import { Projet } from 'src/app/core/models/projets/projet.model';
import { CDP_ProjetsService } from 'src/app/core/services/projets/projet.service';
import { ProjetEditComponent } from '../projet-edit/projet-edit.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-projet-item',
  templateUrl: './projet-item.component.html',
  styleUrls: ['./projet-item.component.scss']
})
export class ProjetItemComponent {
  @Input() projet!: Projet; // Input pour recevoir les données du projet
  svgColor: string = '#D2E8E3'; // Remplacez 'initialColor' par la couleur initiale de votre SVG
  defaultColor: string = '#D2E8E3'; // Conservez la couleur par défaut ici
  defaultIcon: string = '../../../../assets/img/projets/Defaut.jpg'; // Chemin de l'image par défaut
  isFavori: boolean = false;

  constructor(private projectService: CDP_ProjetsService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.checkIsFavProject();
  }

  openEditProjet(event: MouseEvent): void {
    event.stopPropagation(); // Empêche la propagation de l'événement de clic au parent
    const dialogRef = this.dialog.open(ProjetEditComponent, {
      data: {
        projet: this.projet
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  setFavoriProject() {
    const data = {
      PK_Projet: this.projet.pk_projet,
      PK_User: localStorage.getItem("param2")
    }
    if (this.isFavori) {
      this.projectService.removeFavProject(data).subscribe(() => {
        this.isFavori = false;
        this.svgColor = this.defaultColor;
      });
    } else {
      this.projectService.setFavProjects(data).subscribe(() => {
        this.isFavori = true;
        this.svgColor = '#FEE700';
      });
    }
  }

  checkIsFavProject() {
    const data = {
      PK_Projet: this.projet.pk_projet,
      PK_User: localStorage.getItem("param2")
    }
    this.projectService.checkIsFavProjects(data).subscribe(
      (response: { isFavori: number }) => {
        if ( response.isFavori === 1) {
          this.isFavori = true;
          this.svgColor = '#FEE700';
        } else {
          this.isFavori = false;
          this.svgColor = this.defaultColor;
        }
      }
    );
  }

  changeColor(event: MouseEvent) {
    event.stopPropagation(); // Empêche la propagation de l'événement de clic au parent
    this.setFavoriProject();
  }

  getBackgroundImage(icone: string | null): string {
    const imageUrl = icone ? icone : this.defaultIcon;
    const encodedUrl = imageUrl.replace(/ /g, '%20');
    return `url(${encodedUrl})`;
  }

}
