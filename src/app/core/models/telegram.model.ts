/*
 * Modèle de données pour un élément "store"
 * 
 * Création le 24.02.2023
*/
export class Telegram {    
    constructor(public address: string, public dpt: number, public devicename: string, public payload: number) {
    }
  }