import { Complement } from "./complement.model";

export class Ligne {

    constructor(
        public pk_ligne: number,
        public date: string,
        public dateModification: string,
        public ouvrage: string,
        public installation: string,
        public designation: string,
        public description: string,
        public nom_responsable: string,
        public prenom_responsable: string,
        public initiales_responsable: string,
        public delai: string,
        public dateFin: string,
        public fk_projet: number,
        public impression: number,
        public fk_utilisateur: number,
        public fk_modifUser: number,
        public avancement: number,
        public statut: string,
        public color: string,
        public entite: string,
        public complements: Complement[]
    ){}
}