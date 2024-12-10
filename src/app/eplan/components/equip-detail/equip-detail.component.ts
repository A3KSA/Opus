import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EPLAN_ProjetctService } from 'src/app/core/services/eplan/project.service';

@Component({
  selector: 'app-equip-detail',
  templateUrl: './equip-detail.component.html',
  styleUrl: './equip-detail.component.scss'
})
export class EquipDetailComponent {
  selectedSegment: string | null = null;
  selectedEquipment: string | null = null;
  selectedMachineType: string | null = null;
  intensite: string | null = null;
  puissance: string | null = null;
  plageMesure: string | null = null;
  selectedCableType: string | null = null;
  selectedNbreConnCable: string | null = null;
  selectedCableSection: string | null = null;
  selectedDisjoncteur: string | null = null;
  selectedAuxiliaire1: string | null = null;
  selectedAuxiliaire2: string | null = null;
  selectedContacteur1: string | null = null;
  selectedContacteur2: string | null = null;

  typesMachine: any[] = [];
  typesCable: any[] = [];
  segmentsStructure: any[] = [];
  sectionsCable: any[] = [];
  disjArticles: any[] = [];
  contactArticles: any[] = [];
  auxArticles: any[] = [];
  nbreConnCable: number[] = [];

  constructor(public dialogRef: MatDialogRef<EquipDetailComponent>,@Inject(MAT_DIALOG_DATA) public data: any, private eplan_service: EPLAN_ProjetctService) {
    console.log("data: ",data);
    console.log(localStorage.getItem('param1'));
   }

   ngOnInit() {
     // Remplir le tableau avec les valeurs de 1 à 30
     this.nbreConnCable = Array.from({length: 11}, (v, k) => k);
     
     // Assigner les valeurs par défaut à partir des données récupérées
     this.selectedSegment = this.data.schema.SegmentStructure || null;
     this.selectedEquipment = this.data.schema.equipments[0]?.EquipDesignation || null;
     this.selectedMachineType = this.data.schema.equipments[0]?.TypeMachineDesignation || null;
     this.intensite = this.data.schema.equipments[0]?.EquipIntensite || null;
     this.puissance = this.data.schema.equipments[0]?.EquipPuissance || null;
     this.plageMesure = this.data.schema.equipments[0]?.EquipPlageMesure || null;
     this.selectedCableType = this.data.schema.equipments[0]?.TypeCableDesignation || null;
     this.selectedCableSection = this.data.schema.equipments[0]?.SectionCableValeur || null;
     this.selectedDisjoncteur = this.data.schema.equipments[0]?.Nom_Disjoncteur || null;
     this.selectedAuxiliaire1 = this.data.schema.equipments[0]?.Nom_Auxiliaire1 || null;
     this.selectedAuxiliaire2 = this.data.schema.equipments[0]?.Nom_Auxiliaire2 || null;
     this.selectedContacteur1 = this.data.schema.equipments[0]?.Nom_Contacteur1 || null;
     this.selectedContacteur2 = this.data.schema.equipments[0]?.Nom_Contacteur2 || null;

     this.selectedNbreConnCable = this.data.schema.equipments[0]?.NbreConnCable || 0;

    this.getAllTypesMachine();
    this.getAllSegments();
    this.getTypesCable();
    this.getSectionsCable();
    this.getAllDisjoncteurs();
    this.getAllContacteurs();
    this.getAllAuxiliaires();
   }

   sendData() {
    const dataToSend = {
      PK_Schema: this.data.schema.SchemaId, // Remplacez par l'ID réel du schéma
      PK_Project: localStorage.getItem('param1'), // Remplacez par l'ID réel du projet
      segmentName: this.selectedSegment,
      PK_Equipment: this.data.schema.equipments[0]?.EquipId, // Remplacez par l'ID réel de l'équipement
      Machine_Type: this.selectedMachineType,
      Intensite: this.intensite,
      Puissance: this.puissance,
      PlageMesure: this.plageMesure,
      Cable_Type: this.selectedCableType,
      Cable_Section: this.selectedCableSection,
      NbreConnCable: this.selectedNbreConnCable,
      Disjoncteur: this.selectedDisjoncteur,
      Auxiliaire1: this.selectedAuxiliaire1,
      Auxiliaire2: this.selectedAuxiliaire2,
      Contacteur1: this.selectedContacteur1,
      Contacteur2: this.selectedContacteur2
    };

    console.log(dataToSend);

    this.eplan_service.updateSpecificSchemaEquipments(dataToSend).subscribe();
    this.dialogRef.close();
   }

   getAllSegments(): void {
    this.eplan_service.getAllSegmentsStructure().subscribe(
      (data: any[]) => {
        this.segmentsStructure = data;
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

  getTypesCable(): void {
    this.eplan_service.getAllTypesCable().subscribe(
      (data: any[]) => {
        this.typesCable = data;
        
        // Vérification si le type de câble est null dans les équipements
        if (this.data.schema.equipments.some((equipment:any) => equipment.TypeCableDesignation === null)) {
          // Ajouter l'option "Aucune sélection" si null est trouvé
          this.typesCable.unshift({ TypeCableDesignation: 'pas défini' });
        }
      },
      (error) => {
        console.error('Erreur lors du chargement des types de câbles', error);
      }
    );
  }

  getSectionsCable(): void {
    this.eplan_service.getAllSectionsCable().subscribe(
      (data: any[]) => {
        this.sectionsCable = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des segments', error);
      }
    );
  }

  getAllDisjoncteurs(): void {
    this.eplan_service.getAllDisjoncteursArticles().subscribe(
      (data: any[]) => {
        this.disjArticles = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des segments', error);
      }
    );
  }

  getAllContacteurs(): void {
    console.log("coucou");
    this.eplan_service.getAllContacteursArticles().subscribe(
      (data: any[]) => {
        this.contactArticles = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des segments', error);
      }
    );
  }

  getAllAuxiliaires(): void {
    this.eplan_service.getAllAuxiliaireArticles().subscribe(
      (data: any[]) => {
        this.auxArticles = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des segments', error);
      }
    );
  }

  onAbbreviationChange(cellule: any, schema: any) {
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
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du numéro TI', error);
        }
      });
    });
  }

  /**
   * Fonction pour obtenir les numéros TI disponibles pour tous les équipements du schéma.
   * @param schema 
   */
  getAvailableEquipNumbers(cell: any, schema: any): void {
    //const celluleId = cell.CelluleId; // Utiliser CelluleId du schéma
    const segment = schema.SegmentStructure; // Structure de segment
    const designation = schema.equipments[0]?.EquipCode; // Désignation de l'équipement (par exemple)

    // Appel du service pour récupérer les numéros déjà utilisés pour cette cellule
    this.eplan_service.getUsedTiNumbersForCellule(cell, segment, designation).subscribe({
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
    //const celluleId = cellule.CelluleId; // Utiliser CelluleId du schéma

    // Appel du service pour récupérer les numéros déjà utilisés pour cette cellule
    this.eplan_service.getUsedDesignationNumbersForCellule(cellule, schema.SegmentStructure).subscribe({
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

      },
      error: (error) => {
        console.error('Erreur lors de la récupération des numéros utilisés pour la cellule', error);
      }
    });
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
