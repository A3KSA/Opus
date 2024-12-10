export class Intervention {

    constructor(
        public collaborateur: string,
        public nomCollaborateur: string,
        public prenomCollaborateur: string,
        public date: string,
        public temps: number,
        public donneurOrdre: string,
        public remarque: string){}
}