import { SafeUrl } from "@angular/platform-browser";

export class Projet {

    constructor(
        public pk_projet: number,
        public numero: number,
        public projet: string,
        public localite: string,
        public description: string,
        //public icone: SafeUrl,
        public icone: string,
        public dateCreation: string,
        public dateModification: string
    ){}
}