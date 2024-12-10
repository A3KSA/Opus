
export class EnteteRapport {

    constructor(
        public pk_entete: number,
        public present: boolean,
        public absent: boolean,
        public excuse: boolean,
        public convoque: boolean,
        public distribution: boolean,
        public nomResponsable: string,
        public prenomResponsable: string,
        public initialeResponsable: string,
        public emailResponsable: string,
        public telResponsable: string,
        public posteResponsable: string,
        public libelleEntite: string,
        public entreprise: string
        ){}
}