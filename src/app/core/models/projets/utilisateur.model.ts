import { Projet } from "./projet.model";

export class Utilisateur {

    constructor(
    public pk_utilisateur: number,
    public nom: string,
    public prenom: string,
    public initiale: string,
    public derniere_connexion: Date,
    public fk_privilege_CDP: number,
    public fk_privilege_WIKI: number,
    public fk_privilege_EPLAN: number
    ){}
}