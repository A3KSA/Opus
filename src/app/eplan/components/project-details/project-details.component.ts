import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { EPLAN_ProjetctService } from 'src/app/core/services/eplan/project.service';
import { ModalSegmentsComponent } from '../modals/modal-segments/modal-segments.component';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent {
  projectId: number = 0;
  projectTitre!: string | null;
  selectedSchema: any = null;

  schemasMap: Map<number, any[]> = new Map(); // Pour stocker les cellules pour chaque partie d'ouvrage
  cellsMap: Map<number, any[]> = new Map(); // Pour stocker les cellules pour chaque partie d'ouvrage
  equipmentsMap: Map<number, any[]> = new Map();
  visiblePartsMap: Map<number, boolean> = new Map();
  visibleCellsMap: Map<number, boolean> = new Map();
  visibleScehmasMap: Map<number, boolean> = new Map();
  visibleEquipMap: Map<number, boolean> = new Map();

  designationPartOfWorks: string = '';
  descriptionPartOfWorks: string = '';

  designationCell: string = '';
  descriptionCell: string = '';

  designationSchema: string = '';
  descriptionSchema: string = '';

  designationEquip: string = '';
  descriptionEquip: string = '';
  posPCTSchema: string = '';


  listPartOfWorks: any[] = [];

  selectedType: string = '';
  selectedMarque: string = '';
  filteredMarques: any[] = [];
  marques: any[] = [];

  // Stocke l'index et le champ en cours d'édition pour chaque partOfWork
  editingField: { index: number, field: string } | null = null;
  hasNoEquipmentsMap: Map<number, boolean> = new Map();;

  constructor(private route: ActivatedRoute, private eplan_service: EPLAN_ProjetctService, private router: Router, public dialog: MatDialog) { }

  ngOnInit(): void {
    // Récupération de l'id depuis l'URL
    const id = this.route.snapshot.paramMap.get('id');
    this.projectId = id !== null ? Number(id) : 0;

    let titreProjet = localStorage.getItem('param1');
    this.projectTitre = titreProjet;

    this.loadPartOfWorks();

    this.eplan_service.getAllBrands().subscribe((marques) => {
      this.marques = marques;
      console.log("Liste des marques: ", marques)
    });
  }

  loadPartOfWorks() {
    this.eplan_service.getPartOfWorksFromSpecificProject(this.projectId).subscribe((response: any) => {
      this.listPartOfWorks = response;

      // Initialisation de la visibilité pour chaque partie d'ouvrage
      this.listPartOfWorks.forEach(partOfWork => {
        this.visiblePartsMap.set(partOfWork.PK_Ouvrage, false);
      });
    });
  }

  togglePartVisibility(ouvrageId: number) {
    const currentVisibility = this.visiblePartsMap.get(ouvrageId) || false;
    this.visiblePartsMap.set(ouvrageId, !currentVisibility);

    this.eplan_service.getCellulesFromSpecificPartOfWork(ouvrageId).subscribe((response: any) => {
      this.cellsMap.set(ouvrageId, response);

      // Initialiser la visibilité des cellules
      response.forEach((cell: any) => {
        this.visibleCellsMap.set(cell.PK_Cellule, false);
      });
    });
  }

  toggleCellVisibility(cellId: number) {
    const currentVisibility = this.visibleCellsMap.get(cellId) || false;
    this.visibleCellsMap.set(cellId, !currentVisibility);

    this.eplan_service.getSchemasFromSpecificCellule(cellId).subscribe((response: any) => {
      console.log(response);
      this.schemasMap.set(cellId, response);

      // Initialiser la visibilité des cellules
      response.forEach((schema: any) => {
        this.visibleScehmasMap.set(schema.PK_Schema, false);
      });
    });
  }

  toggleSchemaVisibility(schemaId: number) {
    const currentVisibility = this.visibleScehmasMap.get(schemaId) || false;
    this.visibleScehmasMap.set(schemaId, !currentVisibility);

    this.eplan_service.getEquipmentsFromSpecificSchema(schemaId).subscribe((response: any) => {
      // Mettre à jour le equipmentsMap avec les équipements récupérés
      this.equipmentsMap.set(schemaId, response);

      // Vérifier si le schéma a des équipements
      if (response && response.length > 0) {
        // Si le schéma a 1 ou plus d'équipements, on cache 'rowAction'
        this.hasNoEquipmentsMap.set(schemaId, false);
      } else {
        // Si le schéma n'a pas d'équipements, on affiche 'rowAction'
        this.hasNoEquipmentsMap.set(schemaId, true);
      }

      // Initialiser la visibilité des équipements
      response.forEach((equip: any) => {
        this.visibleEquipMap.set(equip.PK_Equipement, false);
      });
    });
  }


  onTypeChange() {
    console.log('Selected Type:', this.selectedType);
    if (this.selectedType === '') {
      this.filteredMarques = [];
    } else if (this.selectedType === 'disjoncteur') {
      this.filteredMarques = this.marques.filter(marque =>
        marque.Type.trim() === 'disjoncteur' || marque.Type.trim() === 'both'
      );
    } else if (this.selectedType === 'variateur') {
      this.filteredMarques = this.marques.filter(marque =>
        marque.Type.trim() === 'variateur' || marque.Type.trim() === 'both'
      );
    }
    console.log('Filtered Marques:', this.filteredMarques);
    this.selectedMarque = '';
  }

  addPartOfWork(designationInput: any, descriptionInput: any) {
    // Vérifie si les champs sont valides
    if (designationInput.invalid || descriptionInput.invalid) {
      // Marquer les champs comme "touchés" pour afficher les messages d'erreur
      designationInput.control.markAsTouched();
      descriptionInput.control.markAsTouched();
      return;
    }

    const newPartOfWork = {
      designation: this.designationPartOfWorks,
      description: this.descriptionPartOfWorks,
      numProjet: this.projectId
    };

    this.eplan_service.addPartOfWorksFromSpecificProject(newPartOfWork).subscribe(response => {
      console.log('Response:', response);
      this.loadPartOfWorks();
      // Réinitialiser les champs après l'ajout
      this.designationPartOfWorks = '';
      this.descriptionPartOfWorks = '';
      // Réinitialiser les messages d'erreur
      designationInput.reset();
      descriptionInput.reset();
      // Gérez la réponse du service ici, par exemple, afficher un message de succès, vider les inputs, etc.
    }, error => {
      console.error('Error:', error);
      // Gérez les erreurs ici, par exemple afficher un message d'erreur.
    });
  }

  deletePartOfWork(partOfWorkId: number) {
    const userConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette partie d'ouvrage ?");
    if (userConfirmed) {
      this.eplan_service.deleteSpecificPartOfWorks(partOfWorkId).subscribe(
        response => {
          console.log(response.message);
          // Mettre à jour la liste localement après la suppression
          this.listPartOfWorks = this.listPartOfWorks.filter(partOfWork => partOfWork.PK_Ouvrage !== partOfWorkId);
        },
        error => {
          console.error('Erreur lors de la suppression de l\'a partie d\'ouvrage', error);
        }
      );
    } else {
      console.log("Suppression annulée par l'utilisateur.");
    }
  }

  addCellule(ouvrageId: any, designationInput: any, descriptionInput: any) {
    // Vérifie si les champs sont valides
    if (designationInput.invalid || descriptionInput.invalid) {
      // Marquer les champs comme "touchés" pour afficher les messages d'erreur
      designationInput.control.markAsTouched();
      descriptionInput.control.markAsTouched();
      return;
    }

    const newCellule = {
      designation: this.designationCell,
      description: this.descriptionCell,
      ouvrageId: ouvrageId
    };

    this.eplan_service.addCellFromSpecificOuvrage(newCellule).subscribe(response => {
      // Ajoute directement la nouvelle cellule à la liste
      const addedCell = response;

      // Mettez à jour la liste des cellules pour cette partie d'ouvrage
      const currentCells = this.cellsMap.get(ouvrageId) || [];
      this.cellsMap.set(ouvrageId, [...currentCells, addedCell]);
      // Assurez-vous que la partie d'ouvrage reste ouverte
      // Affichez le contenu mis à jour dans la console
      console.log('Mise à jour de cellsMap:', this.cellsMap);

      this.visiblePartsMap.set(ouvrageId, true);

      // Réinitialiser les champs après l'ajout
      this.designationCell = '';
      this.descriptionCell = '';
      // Réinitialiser les messages d'erreur
      designationInput.reset();
      descriptionInput.reset();
      // Gérez la réponse du service ici, par exemple, afficher un message de succès, vider les inputs, etc.
    }, error => {
      console.error('Error:', error);
      // Gérez les erreurs ici, par exemple afficher un message d'erreur.
    });
  }

  deleteCellule(partOfWorkId: number, cellId: number) {
    const userConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette cellule ?");
    if (userConfirmed) {
      this.eplan_service.deleteSpecificCell(cellId).subscribe(
        response => {
          // Récupérer la liste des équipements pour le schemaId donné
          let currentCells = this.cellsMap.get(partOfWorkId);
          if (currentCells) {
            // Filtrer l'équipement supprimé de la liste
            currentCells = currentCells.filter(cell => cell.PK_Cellule !== cellId);
            // Mettre à jour la map avec la liste filtrée
            this.cellsMap.set(partOfWorkId, currentCells);
          }
        },
        error => {
          console.error('Erreur lors de la suppression de la cellule', error);
        }
      );
    } else {
      console.log("Suppression annulée par l'utilisateur.");
    }
  }

  addSchema(cellId: any, designationInput: any, descriptionInput: any) {
    // Vérifie si les champs sont valides
    if (designationInput.invalid || descriptionInput.invalid) {
      // Marquer les champs comme "touchés" pour afficher les messages d'erreur
      designationInput.control.markAsTouched();
      descriptionInput.control.markAsTouched();
      return;
    }

    const newSchema = {
      designation: this.designationSchema,
      description: this.descriptionSchema,
      pos_pct: this.posPCTSchema,
      celluleId: cellId
    };

    this.eplan_service.addSchemaFromSpecificCell(newSchema).subscribe(response => {
      // Ajoute directement la nouvelle cellule à la liste
      const addedCell = response.details;
      this.addEquipement(addedCell.PK_Schema);
      // Mettez à jour la liste des cellules pour cette partie d'ouvrage
      const currentCells = this.schemasMap.get(cellId) || [];
      this.schemasMap.set(cellId, [...currentCells, addedCell]);
      // Assurez-vous que la partie d'ouvrage reste ouverte
      // Affichez le contenu mis à jour dans la console
      console.log('Mise à jour de schemasMap:', this.schemasMap);
      this.visibleCellsMap.set(cellId, true);

      // Réinitialiser les champs après l'ajout
      this.designationSchema = '';
      this.descriptionSchema = '';
      this.posPCTSchema = '';
      // Réinitialiser les messages d'erreur
      designationInput.reset();
      descriptionInput.reset();
      // Gérez la réponse du service ici, par exemple, afficher un message de succès, vider les inputs, etc.
    }, error => {
      console.error('Error:', error);
      // Gérez les erreurs ici, par exemple afficher un message d'erreur.
    });
  }

  deleteSchema(celluleId: number, schemaId: number) {
    const userConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce schéma ?");
    if (userConfirmed) {
      this.eplan_service.deleteSpecificSchema(schemaId).subscribe(
        response => {
          // Récupérer la liste des équipements pour le schemaId donné
          let currentSchemas = this.schemasMap.get(celluleId);
          if (currentSchemas) {
            // Filtrer l'équipement supprimé de la liste
            currentSchemas = currentSchemas.filter(schema => schema.PK_Schema !== schemaId);
            // Mettre à jour la map avec la liste filtrée
            this.schemasMap.set(celluleId, currentSchemas);
          }
        },
        error => {
          console.error('Erreur lors de la suppression du schéma', error);
        }
      );
    } else {
      console.log("Suppression annulée par l'utilisateur.");
    }
  }

  isEquipmentListValid(schemaId: any): boolean {
    const equipments = this.equipmentsMap.get(schemaId);
    console.log(equipments ? equipments.length <= 1 : true);
    return equipments ? equipments.length <= 1 : true;  // Si la liste est null, on considère qu'il n'y a pas d'équipement
  }

  addEquipement(schemaId: any) {
    // Log pour confirmer l'appel
  console.log("Ajout de l'équipement pour le schéma :", schemaId);

    const newEquip = {
      designation: this.designationSchema,
      description: this.descriptionSchema,
      pos_pct: this.posPCTSchema,
      schemaId: schemaId,
      marqueId: parseInt(this.posPCTSchema, 10),
    };

    console.log('Nouvel équipement à ajouter :', newEquip);

    this.eplan_service.addEquipmentFromSpecificSchema(newEquip).subscribe(response => {
      // Ajoute directement la nouvelle cellule à la liste
      console.log("nouvelle data: ", response.details);
      // Gérez la réponse du service ici, par exemple, afficher un message de succès, vider les inputs, etc.
    }, error => {
      console.error('Error:', error);
      // Gérez les erreurs ici, par exemple afficher un message d'erreur.
    });
  }

  deleteEquipment(schemaId: number, equipmentId: number) {
    const userConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?");
    if (userConfirmed) {
      this.eplan_service.deleteSpecificEquipment(equipmentId).subscribe(
        response => {
          // Récupérer la liste des équipements pour le schemaId donné
          let currentEquipments = this.equipmentsMap.get(schemaId);
          if (currentEquipments) {
            // Filtrer l'équipement supprimé de la liste
            currentEquipments = currentEquipments.filter(equip => equip.PK_Equipement !== equipmentId);
            // Mettre à jour la map avec la liste filtrée
            this.equipmentsMap.set(schemaId, currentEquipments);
            // Mettre à jour la carte 'hasNoEquipmentsMap' en fonction de la nouvelle taille de la liste
            if (currentEquipments.length === 0) {
              // Si la liste est vide après suppression, afficher rowAction
              this.hasNoEquipmentsMap.set(schemaId, true);
            } else {
              // Si la liste contient encore des équipements, ne pas afficher rowAction
              this.hasNoEquipmentsMap.set(schemaId, false);
            }
          }
        },
        error => {
          console.error('Erreur lors de la suppression de l\'équipement', error);
        }
      );
    } else {
      console.log("Suppression annulée par l'utilisateur.");
    }
  }

  onPartOfWorkClick(idPartOfWork: number, partOfWorkName: string) {
    localStorage.setItem('partOfWorkName', partOfWorkName);
    this.router.navigate(['/eplangenerator', idPartOfWork]);
  }

  openModalSegments(): void {
    const dialogRef = this.dialog.open(ModalSegmentsComponent, {
      autoFocus: false,
      data: {
        projectId: this.projectId,
        projectTitre: this.projectTitre
      }
    });

    // Actions à exécuter après la fermeture du dialogue
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  // Méthode pour activer l'édition d'un champ spécifique d'un partOfWork
  enableEdit(index: number, field: string) {
    this.editingField = { index, field };
  }

  // Méthode pour désactiver l'édition
  disableEdit() {
    this.editingField = null;
  }

  // Méthode pour savoir si un champ est en mode édition
  isEditing(index: number, field: string): boolean {
    return this.editingField !== null && this.editingField.index === index && this.editingField.field === field;
  }

  // Désactiver l'édition lorsqu'on appuie sur Enter
  onEnterPress(event: Event, entityType: string, entityId: any, column: any, newValue: any) {
    const keyboardEvent = event as KeyboardEvent;  // Cast l'Event en KeyboardEvent
    if (keyboardEvent.key === 'Enter') {

      const data = {
        entityType: entityType,
        entityId: entityId,
        column: column,
        newValue: newValue
      };

      console.log(data);

      this.eplan_service.updateSpecificEntity(data).subscribe(response => {
        console.log('Response:', response);
        this.disableEdit();
      }, error => {
        console.error('Error:', error);
        // Gérez les erreurs ici, par exemple afficher un message d'erreur.
      });
    }
  }

}
