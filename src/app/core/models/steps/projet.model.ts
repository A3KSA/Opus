export class Projet {

    constructor(public numProjet: number,
        public objet: string,
        public description: string,
        public date: string,
        public auteur: string,
        public suivi: string,
        public etatProjet: etatProjet){}
}

enum etatProjet {
    P = "EN PRÉPARATION",
    E = "ENVOYÉ",
    PR = "PAS RENDUE",
    NR = "NON RETENUE",
    C = "COMMANDÉ",
    CO = "COMMANDE ORALE",  
    EC = "EN COURS",
    T = "TERMINÉ",
    ER = "EN RÉVISION"
}