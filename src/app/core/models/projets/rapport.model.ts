
export class Rapport {

    constructor(
        public pk_rapport: number,
        public titre: string,
        public intitule: string,
        public affaire: string,
        public localite: string,
        public cfc: string,
        public date: string,
        public heure: string,
        public lieu: string,

        public dateProchaineSeance: string,
        public heureProchaineSeance: string,
        public lieuProchaineSeance: string,
        
        public projet: string
        ){}
}