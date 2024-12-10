import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CDP_ProjetsService } from '../../services/projets/projet.service';

@Component({
  selector: 'app-filtre-lignes',
  templateUrl: './filtre-lignes.component.html',
  styleUrls: ['./filtre-lignes.component.scss']
})

export class FiltreLignesComponent {
  designationTermSearch: string = '';
  descriptifTermSearch: string = '';

  ngOnInit() {
    this.statusEntries = Object.entries(this.statusColorMap).map(([status, color]) => {
      this.statusFilters[status] = true;
      return { status, color };
    });

    console.log(this.statusEntries);
  }

  constructor(private projetService: CDP_ProjetsService) { }

  public initialCheckboxInstall: string[] = [];
  public initialCheckboxOuvrages: string[] = [];
  public initialCheckboxResp: string[] = [];
  public initialCheckboxEntites: string[] = [];

  // Utilisation de setters pour les @Input()
  @Input()
  set checkboxInstall(values: string[]) {
    if (!this.initialCheckboxInstall.length) {
      // Stocke les valeurs initiales lors de la première affectation
      this.initialCheckboxInstall = [...values];
    }
  }

  @Input()
  set checkboxOuvrages(values: string[]) {
    if (!this.initialCheckboxOuvrages.length) {
      // Stocke les valeurs initiales lors de la première affectation
      this.initialCheckboxOuvrages = [...values];
    }
  }

  @Input()
  set checkboxResp(values: string[]) {
    if (!this.initialCheckboxResp.length) {
      // Stocke les valeurs initiales lors de la première affectation
      this.initialCheckboxResp = [...values];
    }
  }

  @Input()
  set checkboxEntites(values: string[]) {
    if (!this.initialCheckboxEntites.length) {
      // Stocke les valeurs initiales lors de la première affectation
      this.initialCheckboxEntites = [...values];
    }
  }
  
  // Mappage des statuts aux couleurs
  statusColorMap = {
    'Info': '#0897B4',
    'À faire': '#E3C75F',
    'En cours': '#A0CD60',
    'Urgent': '#ED8B16',
    'En retard': '#E1523D',
    'En attente': '#747E7E',
    'Terminé': '#02A676'
  };
  statusEntries: { status: string, color: string }[] = [];

  //Permet de séparer chaque checkbox de statuts avec des propriétés indépendantes pour chaque.
  statusFilters: { [key: string]: boolean } = {};

  //Initialisation de la Liste des filtres sélectionnés
  selectedStatutsFilters: string[] = [];
  selectedInstallation: string ="";
  selectedOuvrage: string ="";
  selectedResponsable: string ="";
  selectedEntites: string ="";

  @Output() filterStatusChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  filterIsActiv: boolean = false;

  @Input() projectId!: number;


  onCategrorieValueChange() {
    // Envoie de la liste à la fonction de service
    this.sendFilteredListToService(this.projectId, this.selectedStatutsFilters, this.selectedInstallation, this.selectedOuvrage, this.selectedResponsable, this.selectedEntites);
    console.log("checkboxInstall: " + this.checkboxInstall);
  }

  // fonction appelée lors de changements de sélection de statut de ligne de projets
  onStatutChange(status: string) {
    // Inverser l'état du filtre pour le statut sélectionné
    this.statusFilters[status] = !this.statusFilters[status];
        // Filtrer les statuts sélectionnés
    this.selectedStatutsFilters = Object.keys(this.statusFilters).filter(status => this.statusFilters[status]);
    // Envoie de la liste à la fonction de service
    this.sendFilteredListToService(this.projectId, this.selectedStatutsFilters, this.selectedInstallation, this.selectedOuvrage, this.selectedResponsable, this.selectedEntites);
  }

  /**
   * Fonction générale qui est appelée dès le moment ou un filtre est modifié
   * @param projectId numéro du projet
   * @param selectedFilters liste des statuts sélectionnés
   * @param Installation Installation sélectionnée
   * @param Ouvrage Ouvrage sélectioné
   */
  sendFilteredListToService(projectId: number, selectedFilters: string[], Installation: string, Ouvrage: string, Responsable: string, Entite: string) {
    this.filterIsActiv = !!(selectedFilters && selectedFilters.length > 0 || Installation || Ouvrage || Responsable || Entite);
    this.filterStatusChanged.emit(this.filterIsActiv);
    this.projetService.getFilteredList(projectId, selectedFilters, Installation, Ouvrage, this.extractInitials(Responsable), Entite).subscribe();
  }

  onSearchTerm1Change(event: Event) {
    const input = event.target as HTMLInputElement;
    this.designationTermSearch = input.value ?? ''; // Utiliser '' si input.value est null ou undefined
    this.projetService.setSearchTerms(this.designationTermSearch, this.descriptifTermSearch);
  }

  onSearchTerm2Change(event: Event) {
    const input = event.target as HTMLInputElement;
    this.descriptifTermSearch = input.value ?? ''; // Utiliser '' si input.value est null ou undefined
    this.projetService.setSearchTerms(this.designationTermSearch, this.descriptifTermSearch);
  }

  resetFilters() {
    //RESET du filtre des catégories
    this.checkboxInstall = [];
    this.checkboxOuvrages = [];
    this.checkboxResp = [];
    this.checkboxEntites = [];

    this.selectedInstallation = '';
    this.selectedOuvrage = '';
    this.selectedResponsable='';
    this.selectedEntites = '';

    //RESET du filtre des statuts
    this.statusFilters = {};
    this.selectedStatutsFilters = Object.keys(this.statusFilters).filter(status => this.statusFilters[status]);

    // Envoie de la liste des filtres (vide) pour reset les lignes
    this.sendFilteredListToService(this.projectId, this.selectedStatutsFilters, this.selectedInstallation, this.selectedOuvrage, this.selectedResponsable, this.selectedEntites);
  }

  extractInitials(text: string): string {
    const match = text.match(/\(([^)]+)\)/);
    return match ? match[1] : "";
  }


}