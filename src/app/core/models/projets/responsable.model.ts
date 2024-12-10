import { Entreprise } from "./entreprise.model";

export class Responsable {

    constructor(
        public pk_responsable: number,
        public nom: string,
        public prenom: string,
        public initiale: string,
        public email: string,
        public telephone: string,
        public poste: string,

        public fk_entreprise: Entreprise
        ){}

}