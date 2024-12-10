import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { EPLAN_ProjetctService } from 'src/app/core/services/eplan/project.service';
import { EquipDetailComponent } from '../equip-detail/equip-detail.component';

@Component({
  selector: 'app-table-generator',
  templateUrl: './table-generator.component.html',
  styleUrl: './table-generator.component.scss'
})
export class TableGeneratorComponent {
  [x: string]: any;
  partOfWorkId: number = 0;
  partOfWorkTitre!: string | null;
  partOfWorkDesignation: string = '';

  listSchemas: any[] = [];
  visiblePartsMap: Map<number, boolean> = new Map();
  groupedSchemas: any[] = [];
  segments: any[] = [];
  typesMachine: any[] = [];
  availableNumbers: string[] = [];
  selectedEquipNumero: string = ''; // Numéro TI actuellement sélectionné
  availableEquipNumbers: any[] = [];
  marques: any[] = [];
  disjoncteurBrands: any[] = [];
  variateurBrands: any[] = [];
  selectedDisjoncteurBrand: string = '';
  selectedVariateurBrand: string = '';

  constructor(private route: ActivatedRoute, private eplan_service: EPLAN_ProjetctService, private router: Router, public dialog: MatDialog, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Récupération de l'id depuis l'URL
    const id = this.route.snapshot.paramMap.get('idPartOfWork');
    this.partOfWorkId = id !== null ? Number(id) : 0;

    let titreProjet = localStorage.getItem('partOfWorkName');
    this.partOfWorkTitre = titreProjet;

    this.eplan_service.getSpecificPartOfWork(this.partOfWorkId).subscribe((response: any) => {
      this.partOfWorkDesignation = response[0].Designation;
      this.selectedDisjoncteurBrand = response[0].FK_Disjoncteur;
      this.selectedVariateurBrand = response[0].FK_Variateur;
    });

    this.eplan_service.getAllBrands().subscribe((marques) => {
      this.marques = marques;
      this.disjoncteurBrands = this.marques.filter(marque =>
        marque.Type.trim() === 'disjoncteur' || marque.Type.trim() === 'both');
      this.variateurBrands = this.marques.filter(marque =>
        marque.Type.trim() === 'variateur' || marque.Type.trim() === 'both');
    });

    this.loadSchemasWithCellules();
    this.getSegments();
    this.getAllTypesMachine();
  }

  sendData(cellule: any, schema: any) {
    // Construire un mappage des numéros utilisés par paire (SegmentStructure, EquipDesignation)
    const usedNumbersMap: Record<string, string[]> = {};

    // Itérer sur les équipements pour collecter les numéros déjà utilisés
    schema.equipments.forEach((equip: any) => {
      const pairKey = `${schema.SegmentStructure}-${equip.EquipCode}`;
      if (!usedNumbersMap[pairKey]) {
        usedNumbersMap[pairKey] = [];
      }
      if (equip.EquipNumero_Ti) {
        usedNumbersMap[pairKey].push(equip.EquipNumero_Ti);
      }
    });

    console.log("Mapping des numéros déjà utilisés :", usedNumbersMap);

    // Itérer sur chaque équipement pour valider ou attribuer un numéro
    schema.equipments.forEach((equip: any) => {
      const pairKey = `${schema.SegmentStructure}-${equip.EquipCode}`;

      // Vérifier si le numéro actuel est déjà utilisé
      if (usedNumbersMap[pairKey].includes(equip.EquipNumero_Ti)) {
        console.log(`Numéro ${equip.EquipNumero_Ti} déjà utilisé pour la paire ${pairKey}. Attribution d'un nouveau numéro.`);

        // Trouver un numéro disponible
        const allNumbers = Array.from({ length: 30 }, (_, i) => (i + 1).toString().padStart(2, '0'));
        const availableNumbers = allNumbers.filter(num => !usedNumbersMap[pairKey].includes(num));

        if (availableNumbers.length > 0) {
          equip.EquipNumero_Ti = availableNumbers[0]; // Attribuer le premier numéro disponible
          usedNumbersMap[pairKey].push(availableNumbers[0]); // Ajouter ce numéro aux utilisés
          console.log(`Nouveau numéro attribué : ${equip.EquipNumero_Ti}`);
        } else {
          console.error(`Aucun numéro disponible pour la paire ${pairKey}`);
        }
      }

      // Construire les données à envoyer
      const dataToSend = {
        PK_Schema: schema.SchemaId, // ID du schéma
        PK_Project: localStorage.getItem('param1'), // ID du projet depuis localStorage
        segmentName: schema.SegmentStructure,
        PK_Equipment: equip.EquipId, // ID de l'équipement
        Numero_Ti: equip.EquipNumero_Ti,
        Machine_Type: equip.TypeMachineDesignation,
        Intensite: equip.EquipIntensite,
        Puissance: equip.EquipPuissance
      };

      // Envoyer les données via le service
      this.eplan_service.updateSpecificSchemaEquipments(dataToSend).subscribe({
        next: (response) => {
          this.getAvailableDesignationNumbers(cellule, schema);
          this.cdr.detectChanges(); // Mettre à jour la vue
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du numéro TI', error);
        }
      });
    });
  }

  onDisjoncteurBrandChange() {
    // Recherche de la PK de la marque sélectionnée
    const selectedDisjoncteurBrand = this.marques.find(marque => String(marque.PK_TypeEquipement) === String(this.selectedDisjoncteurBrand));

    const data = {
      entityType: 'partOfWork',
      entityId: this.partOfWorkId,
      column: "FK_Disjoncteur",
      newValue: selectedDisjoncteurBrand.PK_TypeEquipement.toString(),
    };

    this.eplan_service.updateSpecificEntity(data).subscribe(response => {
      console.log('Response:', response);
    }, error => {
      console.error('Error:', error);
      // Gérez les erreurs ici, par exemple afficher un message d'erreur.
    });
  }

  onVariateurBrandChange() {
    // Recherche de la PK de la marque sélectionnée
    const selectedVariateurBrand = this.marques.find(marque =>
      String(marque.PK_TypeEquipement) === String(this.selectedVariateurBrand)
    );

    const data = {
      entityType: 'partOfWork',
      entityId: this.partOfWorkId,
      column: "FK_Variateur",
      newValue: selectedVariateurBrand.PK_TypeEquipement.toString(),
    };

    this.eplan_service.updateSpecificEntity(data).subscribe(response => {
      console.log('Response:', response);
    }, error => {
      console.error('Error:', error);
      // Gérez les erreurs ici, par exemple afficher un message d'erreur.
    });
  }

  loadSchemasWithCellules() {
    this.eplan_service.getSchemasFromSpecificPartOfWork(this.partOfWorkId).subscribe((response: any) => {
      this.listSchemas = response;
      this.listSchemas.forEach(schema => {
        this.visiblePartsMap.set(schema.PK_Ouvrage, false);
      });
      this.groupedSchemas = this.groupSchemasByCellule(response);  // On regroupe les schémas par cellule
      // Appeler la fonction pour récupérer les numéros disponibles pour chaque schéma
      this.groupedSchemas.forEach((cell: any) => {
        cell.schemas.forEach((schema: any) => {
          this.getAvailableDesignationNumbers(cell, schema);
          this.getAvailableEquipNumbers(cell, schema);
        });
      });
    });
  }

  // Fonction pour regrouper les schémas par cellule
  groupSchemasByCellule(listSchemas: any) {
    const groupedData: any = [];

    listSchemas.forEach((schema: any) => {
      const foundCellule = groupedData.find((cell: any) => cell.CelluleId === schema.CelluleId);

      if (foundCellule) {
        // Chercher si le schéma existe déjà pour éviter les doublons
        const foundSchema = foundCellule.schemas.find((s: any) => s.SchemaDesignation === schema.SchemaDesignation);

        if (foundSchema) {
          // Si le schéma existe déjà, ajouter l'équipement
          foundSchema.equipments.push({
            EquipId: schema.EquipId,
            EquipDescription: schema.EquipDescription,
            EquipNumero_Ti: schema.EquipNumero_Ti,
            EquipDesignation: schema.EquipDesignation,
            EquipPuissance: schema.EquipPuissance,
            EquipIntensite: schema.EquipIntensite,
            EquipPlageMesure: schema.EquipPlageMesure,
            EquipCode: schema.EquipCode,
            TypeCableDesignation: schema.TypeCableDesignation,
            NbreConnCable: schema.NbreConnCable,
            SectionCableValeur: schema.SectionCableValeur,
            Nom_Disjoncteur: schema.Nom_Disjoncteur,
            Nom_Auxiliaire1: schema.Nom_Auxiliaire1,
            Nom_Auxiliaire2: schema.Nom_Auxiliaire2,
            Nom_Contacteur1: schema.Nom_Contacteur1,
            Nom_Auxiliaire1Contacteur1: schema.Nom_Auxiliaire1Contacteur1,
            Nom_Auxiliaire2Contacteur1: schema.Nom_Auxiliaire2Contacteur1,
            Nom_Contacteur2: schema.Nom_Contacteur2,
            Nom_Auxiliaire1Contacteur2: schema.Nom_Auxiliaire1Contacteur2,
            Nom_Auxiliaire2Contacteur2: schema.Nom_Auxiliaire2Contacteur2,
            TypeMachineDesignation: schema.TypeMachineDesignation,
            AvailableEquipNumbers: [],
            AvailableEquipDesignationNumbers: []
          });

        } else {
          // Si le schéma n'existe pas, ajouter le schéma et l'équipement
          foundCellule.schemas.push({
            SchemaId: schema.SchemaId,
            SchemaDesignation: schema.SchemaDesignation,
            SchemaDescription: schema.SchemaDescription,
            SegmentStructure: schema.SegmentStructure,
            equipments: [{
              EquipId: schema.EquipId,
              EquipDescription: schema.EquipDescription,
              EquipDesignation: schema.EquipDesignation,
              EquipNumero_Ti: schema.EquipNumero_Ti,
              EquipPuissance: schema.EquipPuissance,
              EquipIntensite: schema.EquipIntensite,
              EquipPlageMesure: schema.EquipPlageMesure,
              EquipCode: schema.EquipCode,
              TypeCableDesignation: schema.TypeCableDesignation,
              SectionCableValeur: schema.SectionCableValeur,
              NbreConnCable: schema.NbreConnCable,
              Nom_Disjoncteur: schema.Nom_Disjoncteur,
              Nom_Auxiliaire1: schema.Nom_Auxiliaire1,
              Nom_Auxiliaire2: schema.Nom_Auxiliaire2,
              Nom_Contacteur1: schema.Nom_Contacteur1,
              Nom_Auxiliaire1Contacteur1: schema.Nom_Auxiliaire1Contacteur1,
              Nom_Auxiliaire2Contacteur1: schema.Nom_Auxiliaire2Contacteur1,
              Nom_Contacteur2: schema.Nom_Contacteur2,
              Nom_Auxiliaire1Contacteur2: schema.Nom_Auxiliaire1Contacteur2,
              Nom_Auxiliaire2Contacteur2: schema.Nom_Auxiliaire2Contacteur2,
              TypeMachineDesignation: schema.TypeMachineDesignation,
              AvailableEquipNumbers: [],
              AvailableEquipDesignationNumbers: []
            }]
          });
        }

      } else {
        // Si la cellule n'existe pas encore, la créer avec le schéma et l'équipement
        groupedData.push({
          CelluleId: schema.CelluleId,
          CelluleDesignation: schema.CelluleDesignation,
          CelluleDescription: schema.CelluleDescription,
          schemas: [{
            SchemaId: schema.SchemaId,
            SchemaDesignation: schema.SchemaDesignation,
            SchemaDescription: schema.SchemaDescription,
            SegmentStructure: schema.SegmentStructure,
            equipments: [{
              EquipId: schema.EquipId,
              EquipDescription: schema.EquipDescription,
              EquipDesignation: schema.EquipDesignation,
              EquipNumero_Ti: schema.EquipNumero_Ti,
              EquipPuissance: schema.EquipPuissance,
              EquipIntensite: schema.EquipIntensite,
              EquipPlageMesure: schema.EquipPlageMesure,
              EquipCode: schema.EquipCode,
              TypeCableDesignation: schema.TypeCableDesignation,
              SectionCableValeur: schema.SectionCableValeur,
              NbreConnCable: schema.NbreConnCable,
              Nom_Disjoncteur: schema.Nom_Disjoncteur,
              Nom_Auxiliaire1: schema.Nom_Auxiliaire1,
              Nom_Auxiliaire2: schema.Nom_Auxiliaire2,
              Nom_Contacteur1: schema.Nom_Contacteur1,
              Nom_Auxiliaire1Contacteur1: schema.Nom_Auxiliaire1Contacteur1,
              Nom_Auxiliaire2Contacteur1: schema.Nom_Auxiliaire2Contacteur1,
              Nom_Contacteur2: schema.Nom_Contacteur2,
              Nom_Auxiliaire1Contacteur2: schema.Nom_Auxiliaire1Contacteur2,
              Nom_Auxiliaire2Contacteur2: schema.Nom_Auxiliaire2Contacteur2,
              TypeMachineDesignation: schema.TypeMachineDesignation,
              AvailableEquipNumbers: [],
              AvailableEquipDesignationNumbers: []
            }]
          }]
        });
      }
    });
    this.cdr.detectChanges()
    return groupedData;
  }

  /**
   * Fonction pour obtenir les numéros TI disponibles pour tous les équipements du schéma.
   * @param schema 
   */
  getAvailableEquipNumbers(cell: any, schema: any): void {
    const celluleId = cell.CelluleId; // Utiliser CelluleId du schéma
    const segment = schema.SegmentStructure; // Structure de segment
    const designation = schema.equipments[0]?.EquipCode; // Désignation de l'équipement (par exemple)

    // Appel du service pour récupérer les numéros déjà utilisés pour cette cellule
    this.eplan_service.getUsedTiNumbersForCellule(celluleId, segment, designation).subscribe({
      next: (usedNumbers: UsedNumber[]) => {
        const allNumbers = Array.from({ length: 30 }, (_, i) => (i + 1).toString().padStart(2, '0')); // Numéros TI de '01' à '30'

        // Créer une structure pour suivre les numéros déjà utilisés par paire (SegmentStructure, EquipDesignation)
        const usedNumbersMap: Record<string, string[]> = {};

        // Peupler la structure avec les numéros déjà utilisés
        usedNumbers.forEach(numObj => {
          const pairKey = `${segment}-${designation}`;
          if (!usedNumbersMap[pairKey]) {
            usedNumbersMap[pairKey] = [];
          }
          usedNumbersMap[pairKey].push(numObj.Numero_Ti);
        });

        if (schema.equipments && Array.isArray(schema.equipments)) {
          schema.equipments.forEach((equip: any) => {
            const equipPairKey = `${segment}-${equip.EquipCode}`;

            // Initialiser la liste des numéros déjà utilisés pour cette paire
            if (!usedNumbersMap[equipPairKey]) {
              usedNumbersMap[equipPairKey] = [];
            }

            // Calculer les numéros disponibles en excluant ceux déjà utilisés
            const availableNumbers = allNumbers.filter(num => !usedNumbersMap[equipPairKey].includes(num));

            // Toujours inclure le numéro actuel s'il n'est pas déjà dans la liste
            /*if (equip.EquipNumero_Ti && !availableNumbers.includes(equip.EquipNumero_Ti)) {
              availableNumbers.push(equip.EquipNumero_Ti);
            }*/

            // Assigner les numéros disponibles
            equip.AvailableEquipNumbers = availableNumbers.sort(); // Tri pour lisibilité

            // S'assurer que le numéro TI est formaté correctement
            if (equip.EquipNumero_Ti) {
              equip.EquipNumero_Ti = equip.EquipNumero_Ti.toString().padStart(2, '0');
            }
          });
        }

        // Forcer la mise à jour de la vue
        this.cdr.detectChanges();
        //console.log("Initialisation de AvailableEquipNumber:", schema.equipments[0].AvailableEquipNumbers)
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des numéros TI utilisés pour la cellule', error);
      }
    });
  }

  onOldTiNumberFocus(equip: any) {
    equip.PreviousNumero_Ti = equip.EquipNumero_Ti; // Sauvegarder l'ancien numéro
  }

  updateAvailableEquipNumbers(equip: any, previousTiNumber: string | null, newTiNumber: string) {
    console.log("Ancien numéro TI :", previousTiNumber);
  
    // Initialiser la liste si elle n'existe pas
    if (!equip.AvailableEquipNumbers) {
      equip.AvailableEquipNumbers = [];
      console.log("Initialisation de AvailableEquipNumbers :", equip.AvailableEquipNumbers);
    }
  
    // Ajouter l'ancien numéro à la liste s'il n'est pas déjà présent
    if (previousTiNumber && !equip.AvailableEquipNumbers.includes(previousTiNumber)) {
      equip.AvailableEquipNumbers.push(previousTiNumber);
      console.log("Ancien numéro ajouté :", previousTiNumber);
    }
  
    // Retirer le nouveau numéro de la liste
    equip.AvailableEquipNumbers = equip.AvailableEquipNumbers.filter((num: any) => num !== newTiNumber);
  
    // Trier la liste pour maintenir l'ordre
    equip.AvailableEquipNumbers.sort((a: string, b: string) => parseInt(a, 10) - parseInt(b, 10));
  
    console.log("Liste mise à jour et triée des numéros disponibles :", equip.AvailableEquipNumbers);
  }
  


  onTiNumberChange(event: Event, cellule: any, schema: any, equip: any) {
    const target = event.target as HTMLSelectElement;
    const newValue = target.value;

    if (!newValue) {
      return; // Ne rien faire si la valeur est vide
    }

    // Récupérer le type de la selectbox (designation ou tiNumber)
    const type = target.getAttribute('data-type');
    const previousTiNumber = equip.PreviousNumero_Ti;

    if (type === 'tiNumber') {
      // Mettre à jour le numéro sélectionné
      equip.EquipNumero_Ti = newValue;

      // Mettre à jour la liste des numéros disponibles
      this.updateAvailableEquipNumbers(equip, previousTiNumber, newValue);

      // Forcer la mise à jour de la vue pour s'assurer que les modifications sont visibles
      this.cdr.detectChanges();

      // Préparer les données pour l'envoi
      const dataToSend = {
        PK_Schema: schema.SchemaId, // ID du schéma
        PK_Project: localStorage.getItem('param1'), // ID du projet depuis localStorage
        segmentName: schema.SegmentStructure,
        PK_Equipment: equip.EquipId, // ID de l'équipement
        Numero_Ti: newValue, // Envoyer le nouveau numéro
        Code_Equipment: equip.EquipCode
      };

      console.log("data to send: ", dataToSend);

      // Appeler le service Angular pour enregistrer le changement
      this.eplan_service.updateSpecificSchemaEquipments(dataToSend).subscribe({
        next: (response) => {
          // Recalculer les listes après la mise à jour
          this.getAvailableDesignationNumbers(cellule, schema);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du numéro TI', error);
        }
      });
    } else if (type === 'EquipCode') {
      equip.EquipCode = newValue;
      const segment = schema.SegmentStructure;
      const designation = equip.EquipCode;
      console.log(`Nouvelle paire : Segment - ${segment}, Designation - ${designation}`);

      // Appeler la fonction pour recalculer les numéros disponibles
      this.getAvailableEquipNumbers(cellule, schema);

      // Ajouter un délai pour s'assurer que les données asynchrones sont chargées
      setTimeout(() => {
        if (equip.AvailableEquipNumbers && equip.AvailableEquipNumbers.length > 0) {
          const firstAvailableNumber = equip.AvailableEquipNumbers[0]; // Premier numéro disponible
          equip.EquipNumero_Ti = firstAvailableNumber; // Mise à jour automatique
          console.log(`Premier numéro disponible attribué : ${firstAvailableNumber}`);

          const dataToSend = {
            PK_Schema: schema.SchemaId, // ID du schéma
            PK_Project: localStorage.getItem('param1'), // ID du projet depuis localStorage
            segmentName: schema.SegmentStructure,
            PK_Equipment: equip.EquipId, // ID de l'équipement
            Numero_Ti: firstAvailableNumber,
            Code_Equipment: equip.EquipCode
          };

          console.log("data to send: ", dataToSend);

          // Appeler le service Angular pour enregistrer le changement
          this.eplan_service.updateSpecificSchemaEquipments(dataToSend).subscribe({
            next: (response) => {
              this.getAvailableDesignationNumbers(cellule, schema);
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Erreur lors de la mise à jour du numéro TI', error);
            }
          });
        } else {
          console.error("Aucun numéro disponible à attribuer !");
        }
      }, 100);
    }
  }



  getAvailableDesignationNumbers(cellule: any, schema: any): void {
    const celluleId = cellule.CelluleId; // Utiliser CelluleId du schéma

    // Appel du service pour récupérer les numéros déjà utilisés pour cette cellule
    this.eplan_service.getUsedDesignationNumbersForCellule(celluleId, schema.SegmentStructure).subscribe({
      next: (usedNumbers: UsedDesignation[]) => {
        const allNumbers = Array.from({ length: 30 }, (_, i) => (i + 1).toString().padStart(2, '0')); // Numéros disponibles pour AvailableEquipNumbers

        // Création d'une structure pour suivre les combinaisons uniques (SegmentStructure + DesignationNumber)
        const uniqueAssignments: Record<string, string[]> = {};

        usedNumbers.forEach(numObj => {
          const pairKey = `${numObj.SegmentStructure}-${numObj.DesignationNumber}`;
          if (!uniqueAssignments[pairKey]) {
            uniqueAssignments[pairKey] = [];
          }
          uniqueAssignments[pairKey].push(numObj.Code_Equipment); // Ajouter le numéro utilisé
        });

        if (schema.equipments && Array.isArray(schema.equipments)) {
          schema.equipments.forEach((equip: any) => {
            const segment = schema.SegmentStructure;
            const designation = equip.DesignationNumber;

            // Créer une clé unique pour la paire (SegmentStructure, DesignationNumber)
            const pairKey = `${segment}-${designation}`;

            // Initialiser la liste des numéros déjà utilisés pour cette paire si elle n'existe pas
            if (!uniqueAssignments[pairKey]) {
              uniqueAssignments[pairKey] = [];
            }

            // Toujours inclure le numéro actuellement assigné dans la liste disponible
            const availableNumbers = allNumbers.filter(num => {
              return !uniqueAssignments[pairKey].includes(num) || equip.EquipCode === num;
            });

            // Ajouter le numéro actuel si non déjà présent
            if (equip.EquipCode && !availableNumbers.includes(equip.EquipCode)) {
              availableNumbers.push(equip.EquipCode);
            }

            // Assigner la liste de numéros disponibles
            equip.AvailableEquipDesignationNumbers = availableNumbers.sort(); // Tri pour plus de lisibilité

            // S'assurer que le numéro est formaté correctement
            if (equip.AvailableEquipNumber) {
              equip.AvailableEquipNumber = equip.AvailableEquipNumber.toString().padStart(2, '0');
            }
          });
        }

        // Forcer la mise à jour de la vue
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des numéros utilisés pour la cellule', error);
      }
    });
  }


  getSegments(): void {
    this.eplan_service.getAllSegmentsStructure().subscribe(
      (data: any[]) => {
        this.segments = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des segments', error);
      }
    );
  }

  getAllTypesMachine(): void {
    this.eplan_service.getAllTypesMachine().subscribe(
      (data: any[]) => {
        this.typesMachine = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des segments', error);
      }
    );
  }

  openDetailsModal(cellule: any, schema: any) {
    const dialogRef = this.dialog.open(EquipDetailComponent, {
      data: {
        CelluleDescription: cellule.CelluleDescription,
        CelluleDesignation: cellule.CelluleDesignation,
        CelluleId: cellule.CelluleId,
        schema: schema,
        projectId: this.partOfWorkId
      }
    });

    // Actions à exécuter après la fermeture du dialogue
    dialogRef.afterClosed().subscribe(result => {
      this.loadSchemasWithCellules();
    });
  }

  generateExcel() {
    this.eplan_service.generateExcelForSpecificPartOfWork(this.partOfWorkId).subscribe(
      (response) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.partOfWorkDesignation + '_' + this.partOfWorkTitre + '_liste_mesures.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Erreur lors de la génération du fichier Excel', error);
      }
    );
  }

}


interface UsedNumber {
  Numero_Ti: string; // Le numéro TI utilisé
  SegmentStructure: string; // Le segment auquel appartient l'équipement
  EquipDesignation: string; // La désignation de l'équipement
}


interface UsedDesignation {
  Code_Equipment: string; // Identifiant de l'équipement
  SegmentStructure: string; // Structure de segment
  DesignationNumber: string; // Numéro de désignation associé
  AvailableEquipNumber: string; // Numéro utilisé pour cette combinaison
}


