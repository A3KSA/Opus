import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LogService } from 'src/app/core/services/log.service';
import { CDP_ProjetsService } from 'src/app/core/services/projets/projet.service';

@Component({
  selector: 'app-search-entete',
  templateUrl: './search-entete.component.html',
  styleUrls: ['./search-entete.component.scss']
})
export class SearchEnteteComponent {

  people!: User[];
  filtres = {Nom: '', Prenom: '', Entreprise: ''};
  selectedUser!: User;
  selectedRowIndex: number = -1;
  existingAbbreviations: string[] = [];

  constructor(private projectService: CDP_ProjetsService, public logger: LogService, public dialog: MatDialog, private dialogRef: MatDialogRef<SearchEnteteComponent>){}

  ngOnInit(){
    this.projectService.searchResponsable().subscribe(
      (data: User[]) => {
        this.people = data;
        console.log(data);
        this.existingAbbreviations = this.people.map(person => person.Initiales); // Extraire les abréviations existantes
        console.log('Existing Abbreviations:', this.existingAbbreviations);
      },
      (error) => {
        this.logger.error("Erreur lors de la récupération des entêtes: ", error);
      }
    );
  }

  toggleRowColor(index: number) {
    this.selectedRowIndex = index;
    this.selectedUser = this.people[index]; // Stocker les informations de l'utilisateur sélectionné
  }

  // Fonction pour filtrer les données en fonction des filtres
  get filtrerDonnees() {
    if (!this.people) {
      return [];
    }
    return this.people.filter(person =>
      person.Nom.toLowerCase().includes(this.filtres.Nom.toLowerCase()) &&
      person.Prenom.toLowerCase().includes(this.filtres.Prenom.toLowerCase()) &&
      person.Entreprise.toLowerCase().includes(this.filtres.Entreprise.toLowerCase())
    );
  }

  selectPerson(): void {
    this.dialogRef.close({
      selectedUser: this.selectedUser,
      existingAbbreviations: this.existingAbbreviations
    });
  }

}

export interface User {
  Nom: string;
  Prenom: string;
  Entreprise: string;
  Initiales: string;
  Poste: string;
  Email: string;
  Telephone: string;
  // Ajoutez d'autres propriétés si nécessaire
}
