import { Exploitant } from "./exploitant.model";
import { Intervention } from "./intervention.model";
import { Projet } from "./projet.model";

export class Step {

    constructor(
                public numero: number,
                public titre: string,
                public rue: string,
                public localite: string,
                public npa: number,
                public lat: number,
                public long: number,
                public email: string,
                public telephone: string,
                public imageUrl: string,
                public exploitant: Exploitant[],
                public remarque: string,
                public interventions: Intervention[],
                public projets: Projet[]
                ){}
}