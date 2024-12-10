import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import jsPDF from 'jspdf';
import { EnteteRapport } from 'src/app/core/models/projets/enteteRapport.model';
import { Ligne } from 'src/app/core/models/projets/ligne.model';
import { LogService } from 'src/app/core/services/log.service';
import { CDP_RapportsService } from 'src/app/core/services/projets/rapport.service';
import { GenerateEmailComponent } from '../generate-email/generate-email.component';
import { forkJoin, map, switchMap } from 'rxjs';
import { CDP_ProjetsService } from 'src/app/core/services/projets/projet.service';
import { Complement } from 'src/app/core/models/projets/complement.model';

@Component({
  selector: 'app-generate-rapport',
  templateUrl: './generate-rapport.component.html',
  styleUrls: ['./generate-rapport.component.scss']
})
export class GenerateRapportComponent {
  popupRapportOrList: any;

  currentDate!: string;
  currentTime!: string;
  cfc: string = 'CFC INSTALLATIONS ELECTRIQUES';
  procesVerbal: string = 'Procès-verbal';
  numeroDocument: string = '';
  lieuSeance: string = '';
  prochaineSeance: string = '-';
  titreList: string = '';

  entitesOrganisees: any = {};
  lignesProject: any = {};

  statuses = [
    { status: "En cours", color: [160, 205, 96] },
    { status: "Terminé", color: [2, 116, 118] },
    { status: "En attente", color: [116, 126, 126] },
    { status: "En retard", color: [225, 82, 61] },
    { status: "À faire", color: [227, 199, 95] },
    { status: "Urgent", color: [237, 139, 22] },
    { status: "Info", color: [8, 151, 180] }
  ];

  titreProject: string = '';

  private imageUrl = '../../../../assets/img/JP_logo_ORG_2024_couleur_sans_texte.png'; // Remplacez par le chemin réel de votre image

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public logger: LogService, private rapportService: CDP_RapportsService, private projetService: CDP_ProjetsService, public dialog: MatDialog, private dialogRef: MatDialogRef<GenerateRapportComponent>) {
    // Créez un nouvel objet Date pour obtenir la date et l'heure actuelles
    const now = new Date();
    // Formattez la date au format YYYY-MM-DD pour l'input de type date
    this.currentDate = now.toISOString().substring(0, 10);
    // Formattez l'heure au format HH:MM pour l'input de type time
    this.currentTime = now.toTimeString().substring(0, 5);
    this.titreList = 'Export tâches ' + this.data.projectId + '_' + this.data.projectTitre;
    this.titreProject = data.projectId + '_' + data.projectTitre;
  }

  ngOnInit() {
    this.popupRapportOrList = this.data.popupRapportOrList;
    this.entitesOrganisees = this.organiserParEntites(this.data.listEntetes);

    if (this.popupRapportOrList) {
      // Permet de lancer la requête de récupération des lignes de projets du service
      this.loadLinesWithComplements(this.data.projectId);
    } else {
      // Récupère les lignes filtrées
      let filteredLines = this.data.listLines;
      if (!Array.isArray(filteredLines)) {
        filteredLines = [filteredLines]; // Convertit en tableau si nécessaire
      }
      this.loadComplementsForFilteredLines(filteredLines);
    }
  }

  loadLinesWithComplements(projectId: number): void {
    this.rapportService.getLinesForRapport(projectId).pipe(
      switchMap((data: Ligne[]) => {
        // Pour chaque ligne, récupérer les compléments
        console.log(data);
        const linesWithComplements$ = data.map(line =>
          this.projetService.getComplementFromSpecificLine(line.pk_ligne).pipe(
            map((complements: Complement[]) => {
              line.complements = complements;
              return line;
            })
          )
        );
        // Utiliser forkJoin pour attendre que toutes les requêtes soient terminées
        return forkJoin(linesWithComplements$);
      })
    ).subscribe(
      (linesWithComplements: Ligne[]) => {
        this.lignesProject = this.organiserParLibelle(linesWithComplements);
      },
      (error) => {
        this.logger.error('Erreur lors de la récupération des lignes de projet:', error);
      }
    );
  }

  loadComplementsForFilteredLines(filteredLines: Ligne[]): void {
    if (!Array.isArray(filteredLines)) {
      console.log('filteredLines is not an array');
      console.log(filteredLines);
      return;
    }
    const linesWithComplements$ = filteredLines.map(line =>
      this.projetService.getComplementFromSpecificLine(line.pk_ligne).pipe(
        map((complements: Complement[]) => {
          line.complements = complements;
          return line;
        })
      )
    );

    forkJoin(linesWithComplements$).subscribe(
      (linesWithComplements: Ligne[]) => {
        this.lignesProject = this.organiserParLibelle(linesWithComplements);
      },
      (error) => {
        this.logger.error('Erreur lors de la récupération des compléments des lignes:', error);
      }
    );
  }

  /**
   * Permet de réorganiser les entêtes par entitées.
   * @param personnes 
   * @returns 
   */
  organiserParEntites(personnes: any[]): any {
    return personnes.reduce((acc, personne) => {
      acc[personne.libelleEntite] = acc[personne.libelleEntite] || [];
      acc[personne.libelleEntite].push(personne);
      return acc;
    }, {});
  }

  /**
   * Permet de réorganiser les lignes de projets par entitées.
   * @param data 
   * @returns 
   */
  organiserParLibelle(data: any[]) {
    // Organiser les lignes par Libellé dans un objet
    const organiseParLibelle = data.reduce((acc: any, ligne: any) => {
      const libelle = ligne.entite; // Assurez-vous que la propriété est correctement nommée
      if (!acc[libelle]) {
        acc[libelle] = [];
      }
      acc[libelle].push(ligne);
      return acc;
    }, {});
    return organiseParLibelle;
  }

  /**
   * Fonction permettant de générer une liste avec toutes les lignes de projets par entitées.
   */
  generateList(): void {
    // Fermez d'abord le dialogue actuel
    this.dialogRef.close();

    var doc = new jsPDF();
    this.generateHeaderDoc(doc);
    this.generateDescriptifsPartDoc(doc, this.statuses);
    this.generateLegendesDoc(doc, this.statuses);
    this.generateFooterDoc(doc); // Utilisez la fonction addFooter que nous avons définie précédemment

    doc.save(this.titreList + '.pdf'); // Sauvegarder le PDF après avoir fini d'ajouter tout le contenu
  }

  /**
   * Fonction permettant de générer un rapport style procès-verbal pour envoye par email.
   */
  generateRapport(): void {
    // Fermez d'abord le dialogue actuel
    this.dialogRef.close();
    var doc = new jsPDF();
    this.generateHeaderDoc(doc);
    this.generateInfosDoc(doc);
    this.generateListEntitéesDoc(doc);

    doc.addPage(); // Ajouter un saut de page

    this.generateHeaderDoc(doc);
    this.generateDescriptifsPartDoc(doc, this.statuses);
    this.generateLegendesDoc(doc, this.statuses);
    this.generateFooterDoc(doc); // Utilisez la fonction addFooter que nous avons définie précédemment

    doc.save(this.data.projectId + '_' + this.data.projectTitre + '.pdf'); // Sauvegarder le PDF après avoir fini d'ajouter tout le contenu
    this.openGenerateEmail();
  }

  /**
   * Fonction permettant de générer les infos principales du document
   * @param doc 
   */
  generateInfosDoc(doc: any) {
    doc.setFillColor(230, 230, 230); // Gris clair pour le fond
    doc.rect(10, 35, 35, 6, 'F'); // 'F' pour le remplissage, 'D' pour le dessin
    doc.setFontSize(9);
    doc.text('Affaire', 12, 39);
    doc.text(this.data.projectId + "_" + this.data.projectTitre, 47, 39);

    doc.setFillColor(230, 230, 230); // Gris clair pour le fond
    doc.rect(120, 35, 35, 6, 'F'); // 'F' pour le remplissage, 'D' pour le dessin
    doc.setFontSize(9);
    doc.text('Localité affaire', 122, 39);
    doc.text('this.data.localite', 157, 39);

    doc.setLineWidth(0.2);
    doc.line(10, 41, 200, 41);

    doc.setFillColor(230, 230, 230); // Gris clair pour le fond
    doc.rect(10, 43, 35, 6, 'F'); // 'F' pour le remplissage, 'D' pour le dessin
    doc.setFontSize(9);
    doc.text('CFC', 12, 47);
    doc.text(this.cfc, 47, 47);

    doc.setFillColor(230, 230, 230); // Gris clair pour le fond
    doc.rect(120, 43, 35, 6, 'F'); // 'F' pour le remplissage, 'D' pour le dessin
    doc.setFontSize(9);
    doc.text('Lieu de la séance', 122, 47);
    doc.text(this.lieuSeance, 157, 47);

    doc.setLineWidth(0.2);
    doc.line(10, 49, 200, 49);

    doc.setFillColor(230, 230, 230); // Gris clair pour le fond
    doc.rect(10, 51, 35, 6, 'F'); // 'F' pour le remplissage, 'D' pour le dessin
    doc.setFontSize(9);
    doc.text('Date de la séance', 12, 55);
    doc.text(this.currentDate, 47, 55);

    doc.setFillColor(230, 230, 230); // Gris clair pour le fond
    doc.rect(120, 51, 35, 6, 'F'); // 'F' pour le remplissage, 'D' pour le dessin
    doc.setFontSize(9);
    doc.text('Heure de la séance', 122, 55);
    doc.text(this.currentTime, 157, 55);

    doc.setLineWidth(0.2);
    doc.line(10, 57, 200, 57);


    doc.setFillColor(230, 230, 230); // Gris clair pour le fond
    doc.rect(10, 59, 35, 6, 'F'); // 'F' pour le remplissage, 'D' pour le dessin
    doc.setFontSize(9);
    doc.text('Date de la publication', 12, 63);
    doc.text(this.currentDate, 47, 63);

    doc.setFillColor(230, 230, 230); // Gris clair pour le fond
    doc.rect(120, 59, 35, 6, 'F'); // 'F' pour le remplissage, 'D' pour le dessin
    doc.setFontSize(9);
    doc.text('N° document', 122, 63);
    doc.text(this.numeroDocument, 157, 63);

    doc.setLineWidth(0.2);
    doc.line(10, 65, 200, 65);

    doc.setFillColor(230, 230, 230); // Gris clair pour le fond
    doc.rect(10, 67, 35, 6, 'F'); // 'F' pour le remplissage, 'D' pour le dessin
    doc.setFontSize(9);
    doc.text('Prochaine séance', 12, 71);
    doc.text(this.prochaineSeance, 47, 71);

    doc.setLineWidth(0.2);
    doc.line(10, 73, 200, 73);

    doc.setFontSize(6);
    doc.text('P= Présent / A = Absent / E = Excusé / C = Convoqué / D = Distribution', 132, 71);
  }

  /**
   * Fonction permettant de générer l'entête du document
   * @param doc 
   */
  generateHeaderDoc(doc: any) {
    // Définir les couleurs, l'épaisseur de ligne et le remplissage du cadre
    doc.setDrawColor(0); // Noir pour le contour
    doc.setFillColor(230, 230, 230); // Gris clair pour le fond
    doc.setLineWidth(0.5);

    // Dessiner un cadre avec un fond coloré
    // Les coordonnées (x, y) du coin supérieur gauche, la largeur et la hauteur
    doc.rect(10, 10, 190, 11, 'FD'); // 'F' pour le remplissage, 'D' pour le dessin

    // Ajouter un logo (remplacer 'logoData' par les données de votre logo)
    doc.addImage(this.imageUrl, 'PNG', 175, 11, 20, 9);

    // Ajouter du texte dans l'en-tête
    doc.setFontSize(17);
    doc.text(this.data.projectId + "_" + this.data.projectTitre, 12, 18);

    doc.setFontSize(14);
    doc.text(this.procesVerbal, 10, 28);

    doc.setLineWidth(0.2);
    doc.line(10, 30, 200, 30);
  }

  /**
   * Fonction permettant de générer la liste des entêtes par entitées
   * @param doc 
   */
  generateListEntitéesDoc(doc: any) {

    const limitePage = 280; // Exemple, considérant une marge inférieure sur une page A4

    let startY = 76; // Position de départ en Y pour le premier tableau

    Object.entries(this.entitesOrganisees).forEach(([nomEntite, membres]) => {
      // Vérifiez si vous avez besoin d'une nouvelle page
      if (startY > limitePage) {
        doc.addPage();
        this.generateHeaderDoc(doc);
        startY = 10; // Réinitialisez la position y pour la nouvelle page
      }

      doc.setFillColor(230, 230, 230); // Gris clair pour le fond
      doc.setLineWidth(0.2);
      doc.line(10, startY, 200, startY);
      doc.rect(10, startY, 190, 8, 'F'); // 'F' pour le remplissage, 'D' pour le dessin
      doc.setLineWidth(0.2);
      doc.line(10, startY + 8, 200, startY + 8);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(nomEntite, 12, startY + 5);

      // Dimensions du tableau
      startY += 12; // Position de départ en Y

      // Dessiner l'en-tête du tableau
      let currentY = startY;
      doc.setFontSize(5);
      doc.text("Entreprise", 10, currentY);
      doc.text("Fonction", 40, currentY);
      doc.text("Nom", 75, currentY);
      doc.text("Prénom", 95, currentY);
      doc.text("Ab.", 120, currentY);
      doc.text("Courriel", 130, currentY);
      doc.text("Téléphone", 160, currentY);

      doc.text("P", 175, currentY);
      doc.text("A", 180, currentY);
      doc.text("E", 185, currentY);
      doc.text("C", 190, currentY);
      doc.text("D", 195, currentY);

      currentY += 2;
      doc.line(10, currentY, 200, currentY); // Ajuster selon la largeur totale

      (membres as EnteteRapport[]).forEach((membre: EnteteRapport) => {
        currentY += 4; // Passer à la ligne suivante
        // Exemple d'ajout de texte dans les premières colonnes
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");

        // Limiter le texte de l'entreprise
        const entrepriseText = membre.entreprise.length > 23
          ? membre.entreprise.substring(0, 23 - 3) + '...'
          : membre.entreprise;

        doc.text(entrepriseText, 10, currentY);

        doc.setFont("helvetica", "normal");

        if (membre.posteResponsable) {
          // Limiter le texte du poste
          const fonctionText = membre.posteResponsable.length > 28
            ? membre.posteResponsable.substring(0, 28 - 3) + '...'
            : membre.posteResponsable;
          doc.text(fonctionText, 40, currentY);
        }
        if (membre.nomResponsable) {
          doc.text(membre.nomResponsable, 75, currentY);
        }
        if (membre.prenomResponsable) {
          doc.text(membre.prenomResponsable, 95, currentY);
        }
        if (membre.initialeResponsable) {
          doc.text(membre.initialeResponsable, 120, currentY);
        }
        doc.setFontSize(4);
        if (membre.emailResponsable) {
           // Limiter le texte du poste
           const emailText = membre.emailResponsable.length > 36
           ? membre.emailResponsable.substring(0, 36 - 3) + '...'
           : membre.emailResponsable;
          doc.text(emailText, 130, currentY);
        }
        doc.setFontSize(5);
        if (membre.telResponsable) {
          doc.text(membre.telResponsable, 160, currentY);
        }

        // Dessiner un carré pour la condition "vu"
        // Supposons que cela concerne la 8ème colonne
        const squareStartX = 175; // Position X du carré, à ajuster
        doc.rect(squareStartX, currentY - 3, 3, 3); // Dessiner un carré
        doc.rect(squareStartX + 5, currentY - 3, 3, 3); // Dessiner un carré
        doc.rect(squareStartX + 10, currentY - 3, 3, 3); // Dessiner un carré
        doc.rect(squareStartX + 15, currentY - 3, 3, 3); // Dessiner un carré
        doc.rect(squareStartX + 20, currentY - 3, 3, 3); // Dessiner un carré

        // Si "vu", remplissez le carré ou ajoutez du texte
        if (membre.present) {
          doc.setFontSize(16);
          doc.text("x", squareStartX + 0.1, currentY + 0.2);
        }
        if (membre.absent) {
          doc.setFontSize(16);
          doc.text("x", squareStartX + 5.1, currentY + 0.2);
        }
        if (membre.excuse) {
          doc.setFontSize(16);
          doc.text("x", squareStartX + 10.1, currentY + 0.2);
        }
        if (membre.convoque) {
          doc.setFontSize(16);
          doc.text("x", squareStartX + 15.1, currentY + 0.2);
        }
        if (membre.distribution) {
          doc.setFontSize(16);
          doc.text("x", squareStartX + 20.1, currentY + 0.2);
        }
      });
      //Esapce entre les différnts tableaux
      startY = currentY + 4;
    });
  }

  /**
   * Fonction permettant de générer la liste des lignes de projets organisée par entitées
   * @param doc 
   * @param statuses 
   */
  generateDescriptifsPartDoc(doc: any, statuses: any[]) {

    const limitePage = 250; // Exemple, considérant une marge inférieure sur une page A4
    const startYLegend = 277; // Position de la légende
    const legendHeight = 10; // Hauteur approximative de la légende

    let startY = 33; // Position de départ en Y pour le premier tableau
    const colonnes = [
      { titre: "Date", x: 10, largeur: 20 },
      { titre: "Ouvrage", x: 30, largeur: 15 },
      { titre: "Installation", x: 45, largeur: 15 },
      { titre: "Descriptif", x: 60, largeur: 75 },
      { titre: "Statut", x: 135, largeur: 15 },
      { titre: "%", x: 150, largeur: 10 },
      { titre: "Responsable", x: 160, largeur: 20 },
      { titre: "Délai", x: 180, largeur: 20 },
    ];

    let entiteCourante = ''; // Variable pour stocker l'entité courante

    Object.entries(this.lignesProject).forEach(([entite, lignes]) => {
      entiteCourante = entite; // Mettez à jour l'entité courante
      // Vérifiez si vous avez besoin d'une nouvelle page
      if (startY > limitePage) {
        this.generateLegendesDoc(doc, statuses);
        doc.addPage();
        this.generateHeaderDoc(doc);
        startY = 33; // Réinitialisez la position y pour la nouvelle page
      }

      // Maintenant, vous pouvez commencer à ajouter du contenu pour la nouvelle section sur la nouvelle page
      doc.setFillColor(230, 230, 230); // Gris clair pour le fond
      doc.rect(10, startY, 190, 10, 'FD'); // 'F' pour le remplissage, 'D' pour le dessin
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(entite, 12, (startY + 7));

      const hauteurEnTete = 6; // Hauteur de l'en-tête des colonnes
      // Dimensions du tableau
      startY += 12; // Position de départ en Y
      let currentY = startY; // Position de départ en Y pour le premier en-tête de colonne

      colonnes.forEach(colonne => {
        doc.setFillColor(230, 230, 230); // Couleur de fond gris clair pour l'en-tête
        doc.rect(colonne.x, currentY, colonne.largeur, hauteurEnTete, 'FD'); // Dessiner le rectangle avec remplissage

        doc.setFontSize(10); // Taille de la police pour le texte de l'en-tête
        doc.setTextColor(0, 0, 0); // Couleur du texte noir
        doc.setFontSize(5);
        doc.text(colonne.titre, colonne.x + 2, currentY + 4); // Ajustez le positionnement du texte au besoin
      });

      // Ajustez currentY pour commencer les données en dessous des en-têtes
      currentY += hauteurEnTete + 1; // Ajoutez 2 pour un peu d'espace entre l'en-tête et les données

      // Continuez à partir de la position Y où vous avez fini avec les en-têtes
      let hauteurLigne = 6; // Hauteur pour chaque ligne de données

      (lignes as Ligne[]).forEach((donnee: any) => {
        let hauteurLigneBase = hauteurLigne; // Hauteur standard pour les lignes qui ne nécessitent pas de traitement spécial
        let hauteurMaxLigne = hauteurLigne; // Utilisé pour la colonne Descriptif si nécessaire
        // Tentez de trouver la colonne 'Descriptif'
        const colonneDescriptif = colonnes.find(col => col.titre === "Descriptif");

        // Assurez-vous que la colonne 'Descriptif' a été trouvée avant de continuer
        if (!colonneDescriptif) {
          throw new Error("Colonne 'Descriptif' introuvable");
        }

        // Calcul spécifique pour le descriptif
        const descriptifText = donnee.description;
        const largeurDescriptif = colonneDescriptif.largeur;
        doc.setFontSize(6); // Assurez-vous que la taille de police correspond à celle utilisée pour le calcul
        doc.setFont("helvetica", "normal");
        const lignesDescriptif = doc.splitTextToSize(descriptifText, largeurDescriptif - 3);
        let hauteurDescriptif = lignesDescriptif.length * 3; // Calculez la hauteur basée sur le nombre de lignes

        if (donnee.complements && donnee.complements.length > 0) {
          hauteurDescriptif += 7; // Pour le titre "Compléments"
          donnee.complements.forEach((complement: Complement) => {
            const lignesComplement = doc.splitTextToSize(complement.description, largeurDescriptif - 3);
            hauteurDescriptif += lignesComplement.length * 3;
            hauteurDescriptif += 3; // Pour la date et le responsable sur une nouvelle ligne
            hauteurDescriptif += 3; // Espace entre chaque complément
          });
        }

        hauteurMaxLigne = Math.max(hauteurLigneBase, hauteurDescriptif + 4); // Ajustez l'espace pour le texte du descriptif

        if (currentY + hauteurMaxLigne > startYLegend - legendHeight) {
          this.generateLegendesDoc(doc, statuses);
          doc.addPage();
          this.generateHeaderDoc(doc);
          currentY = 33; // Réinitialisez la position y pour la nouvelle page

          // Réafficher l'entité associée
          doc.setFillColor(230, 230, 230); // Gris clair pour le fond
          doc.rect(10, currentY, 190, 10, 'FD'); // 'F' pour le remplissage, 'D' pour le dessin
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(entiteCourante, 12, currentY + 7);
          currentY += 12; // Ajustez la position y pour la nouvelle page après avoir réaffiché l'entité

          // Redéfinir les paramètres de police après l'ajout d'une nouvelle page
          doc.setFont("helvetica", "normal");
          doc.setFontSize(6);
          doc.setTextColor(0, 0, 0); // Couleur du texte noir
        }

        doc.setDrawColor(0); // Noir pour le contour
        doc.setFillColor(255, 255, 255); // Fond blanc pour la cellule
        doc.rect(10, currentY, 20, hauteurLigneBase, 'FD'); // Dessiner avec remplissage et cadre
        const dateHumaine = this.formatDate(donnee.date);
        doc.text(dateHumaine, 10 + 2, currentY + 4);

        doc.setDrawColor(0); // Noir pour le contour
        doc.setFillColor(255, 255, 255); // Fond blanc pour la cellule
        doc.rect(30, currentY, 15, hauteurLigneBase, 'FD'); // Dessiner avec remplissage et cadre
        doc.text(donnee.ouvrage, 30 + 2, currentY + 4);

        doc.setDrawColor(0); // Noir pour le contour
        doc.setFillColor(255, 255, 255); // Fond blanc pour la cellule
        doc.rect(45, currentY, 15, hauteurLigneBase, 'FD'); // Dessiner avec remplissage et cadre
        doc.text(donnee.installation, 45 + 2, currentY + 4);

        // Vérifier si donnee.statut correspond à une entrée dans statuses
        let couleurStatus = [255, 255, 255]; // Couleur par défaut (blanc)
        statuses.forEach(status => {
          if (status.status === donnee.statut) {
            couleurStatus = status.color; // Utiliser la couleur correspondante à partir de statuses
          }
        });

        doc.setDrawColor(0); // Noir pour le contour
        doc.setFillColor(couleurStatus[0], couleurStatus[1], couleurStatus[2]); // Utiliser la couleur correspondante
        doc.rect(135, currentY, 15, hauteurLigneBase, 'FD'); // Dessiner avec remplissage et cadre
        doc.text(donnee.statut, 135 + 2, currentY + 4);

        doc.setDrawColor(0); // Noir pour le contour
        doc.setFillColor(255, 255, 255); // Fond blanc pour la cellule
        doc.rect(150, currentY, 10, hauteurLigneBase, 'FD'); // Dessiner avec remplissage et cadre
        doc.text((donnee.avancement.toString() * 100) + " %", 150 + 2, currentY + 4);

        doc.setDrawColor(0); // Noir pour le contour
        doc.setFillColor(255, 255, 255); // Fond blanc pour la cellule
        doc.rect(160, currentY, 20, hauteurLigneBase, 'FD'); // Dessiner avec remplissage et cadre
        doc.text(donnee.initiales_responsable, 160 + 2, currentY + 4);

        doc.setDrawColor(0); // Noir pour le contour
        doc.setFillColor(255, 255, 255); // Fond blanc pour la cellule
        doc.rect(180, currentY, 20, hauteurLigneBase, 'FD'); // Dessiner avec remplissage et cadre
        const dateHumaine2 = this.formatDate(donnee.dateFin);
        doc.text(dateHumaine2, 180 + 2, currentY + 4);

        // Ensuite, dessinez la cellule Descriptif avec sa hauteur spécifique
        doc.setFillColor(255, 255, 255); // Fond blanc pour la cellule Descriptif
        doc.rect(colonneDescriptif.x, currentY, largeurDescriptif, hauteurMaxLigne, 'F');
        let descriptifY = currentY + 4; // Ajustez la position verticale pour le texte du descriptif

        // Dessiner le titre du descriptif
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0); // Couleur du texte noir
        doc.text(donnee.designation, colonneDescriptif.x + 2, descriptifY); // Dessiner le titre
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");

        descriptifY += 4;
        hauteurMaxLigne += 4;

        lignesDescriptif.forEach((ligne: any) => {
          doc.text(ligne, colonneDescriptif.x + 2, descriptifY);
          descriptifY += 3; // Avancez pour la ligne suivante du descriptif
        });

        // Ajoutez les compléments
        if (donnee.complements && donnee.complements.length > 0) {
          descriptifY += 4; // Espace avant le titre des compléments
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.text("Compléments", colonneDescriptif.x + 2, descriptifY);
          descriptifY += 4;
          doc.setFontSize(6);
          doc.setFont("helvetica", "normal");

          donnee.complements.forEach((complement: Complement) => {
            const lignesComplement = doc.splitTextToSize(complement.description, largeurDescriptif - 3);
            lignesComplement.forEach((ligne: string) => {
              doc.text(ligne, colonneDescriptif.x + 2, descriptifY);
              descriptifY += 3;
            });
            doc.setFontSize(5);
            doc.text(`${complement.date} - RCH`, colonneDescriptif.x + 2, descriptifY);
            descriptifY += 3;
            descriptifY += 3; // Espace entre chaque complément
            doc.setFontSize(6); // Remettre la taille de police à 6 pour le prochain complément
          });
        }

        doc.setDrawColor(0); // Noir pour le cadre
        doc.rect(colonneDescriptif.x, currentY, largeurDescriptif, hauteurMaxLigne);

        // Ajustez currentY pour la prochaine ligne de données, en utilisant la hauteur maximale atteinte par Descriptif
        currentY += hauteurMaxLigne;
      });
      //Esapce entre les différnts tableaux
      startY = currentY + 4;
    });
  }

  /**
   * Fonction permettant de générer le pied de page du document.
   * @param doc 
   */
  generateFooterDoc(doc: any) {
    // Nombre total de pages (doit être appelé après la création de document)
    const pageCount = doc.internal.getNumberOfPages();

    // Parcourir toutes les pages pour ajouter le pied de page
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      // Ajouter une ligne
      doc.setDrawColor(0); // Couleur noire
      doc.setLineWidth(0.1); // Épaisseur de la ligne
      doc.line(10, 285, 200, 285); // Positionnez selon vos besoins

      // Ajouter le numéro de page
      doc.setFontSize(8); // Taille de la police
      const pageInfo = `${i}/${pageCount}`;
      doc.text(pageInfo, 195, 290); // Alignement à droite

      // Ajouter un texte sur la gauche
      doc.text("Josef Piller SA / Allée Paul-Cantonneau 1 - 1762 Givisiez / 026 469 72 72", 10, 290); // Alignement à gauche
    }
  }

  /**
   * Fonction permettant de générer la légende du document (légendes pour les statuts des lignes de projet)
   * @param doc 
   * @param statuses 
   */
  generateLegendesDoc(doc: any, statuses: any[]) {
    let startX = 10; // Position X de départ pour la légende
    const startY = 277; // Position Y de départ pour la légende (ajustez selon l'emplacement souhaité)
    const squareSize = 5; // Taille du carré de couleur
    const textOffsetX = 2; // Décalage horizontal du texte par rapport au carré
    const itemSpacing = 5; // Espacement entre les éléments de la légende

    statuses.forEach((item, index) => {
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);

      // Dessiner le carré de couleur
      doc.rect(startX, startY, squareSize, squareSize, 'F');

      // Ajouter le texte du statut à côté du carré
      doc.setTextColor(0, 0, 0); // Texte en noir
      doc.setFontSize(8); // Taille de la police
      doc.text(item.status, startX + squareSize + textOffsetX, startY + squareSize - 1);

      // Calculer la largeur du texte du statut pour ajuster l'espacement
      const statusTextWidth = doc.getTextWidth(item.status);

      // Passer à la position X suivante pour le prochain élément de la légende
      startX += squareSize + textOffsetX + statusTextWidth + itemSpacing; // Ajustez selon l'espacement souhaité entre les éléments
    });
  }

  /**
   * Fonction pour transformer une date format machine en un format plus lisible.
   * @param dateString 
   * @returns nouvelle date formattée.
   */
  formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', options);
  }

  openGenerateEmail(): void {
    // Fermez d'abord le dialogue actuel
    this.dialogRef.close();

    const dialogRef = this.dialog.open(GenerateEmailComponent, {
      data: {
        listEntetes: this.data.listEntetes,
        projectId: this.data.projectId,
        projectTitre: this.data.projectTitre,
        nomDocument: this.procesVerbal,
        dateSeance: this.currentDate
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      // Actions à réaliser après la fermeture du dialogue, si nécessaire
    });
  }
}
