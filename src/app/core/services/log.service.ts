/**
 * Service de logs pour débug. 
 * source : https://www.codemag.com/article/1711021/Logging-in-Angular-Applications
 */

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, map, of, switchMap } from "rxjs";
import { LogItem } from '../models/log.model';
import { MatSnackBar } from '@angular/material/snack-bar';

//Enum contenant les différents types de log
export enum LogLevel {
    All = 0,
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
    Fatal = 5,
    Off = 6
}

@Injectable({
    providedIn: 'root'
})

/**
 * Classe principale contenant la logique afin de contrôler les messages à afficher dans la journalisation.
 */
export class LogService {

    level: LogLevel = LogLevel.All;
    logWithDate: boolean = true;

    private baseUrlAPI = '';
    //Chemin d'accès au fichier de config JSON.
    private _jsonURL = '../../../assets/CONFIG/serverAddress.json';

    constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

    /**
     * Fonction permettant de vérifier le niveau transmis par l'une des méthode par rapport à la valeur définie dans la propriété "level"
     * @param msg string à transmettre
     * @param level LogLevel niveau de log
     * @param params tout autre chose
     */
    private writeToLog(msg: string, level: LogLevel, params: any[]) {
        if (this.shouldLog(level)) {
            let entry: LogEntry = new LogEntry();
            entry.message = msg;
            entry.level = level;
            entry.extraInfo = params;
            entry.logWithDate = this.logWithDate;
            if(level == 4){
                this.displayOnApp(entry.buildLogString());
                this.writeIntoLogsFile(entry.buildLogString());
            } else {
                this.writeIntoLogsFile(entry.buildLogString());
            }
        }
    }
    /**
     * Fonction permettant de déterminer si l'on doit journaliser en fonction du level défini.
     * @param level  LogLevel niveau défini
     * @returns ret définissant un boolean = true si la journalisation active + level >= propriété level
     */
    private shouldLog(level: LogLevel): boolean {
        let ret: boolean = false;
        //Si le level en paramètre est supérieur ou égal à la propriété "level" et que la journalisation est active alors on renvoie true.
        if ((level >= this.level && level !== LogLevel.Off) || this.level === LogLevel.All) {
            ret = true;
        }
        return ret;
    }

    /**
     * Fonction qui permet de transférer un message avec le bon type de log (ici debug)
     * @param msg string définissant le message a transmettre
     * @param optionalParams n'importe quoi, on peut transmettre différentes choses en fonction des besoins
     */
    debug(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Debug, optionalParams);
    }

    /**
     * Fonction qui permet de transférer un message avec le bon type de log (ici info)
     * @param msg string définissant le message a transmettre
     * @param optionalParams n'importe quoi, on peut transmettre différentes choses en fonction des besoins
     */
    info(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Info, optionalParams);
    }

    /**
     * Fonction qui permet de transférer un message avec le bon type de log (ici warn)
     * @param msg string définissant le message a transmettre
     * @param optionalParams n'importe quoi, on peut transmettre différentes choses en fonction des besoins
     */
    warn(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Warn, optionalParams);
    }

    /**
     * Fonction qui permet de transférer un message avec le bon type de log (ici error)
     * @param msg string définissant le message a transmettre
     * @param optionalParams n'importe quoi, on peut transmettre différentes choses en fonction des besoins
     */
    error(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Error, optionalParams);
    }

    /**
     * Fonction qui permet de transférer un message avec le bon type de log (ici msg)
     * @param msg string définissant le message a transmettre
     * @param optionalParams n'importe quoi, on peut transmettre différentes choses en fonction des besoins
     */
    fatal(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Fatal, optionalParams);
    }

    /**
     * Fonction qui permet de transférer un message avec le bon type de log (ici log)
     * @param msg string définissant le message a transmettre
     * @param optionalParams n'importe quoi, on peut transmettre différentes choses en fonction des besoins
     */
    log(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.All, optionalParams);
    }

    /**
     * Fonction permettant d'envoyer un message logs à l'API qui va elle écrire dans un fichier texte.
     * @param content string message logs à journaliser.
     * @returns json de retour de la requête POST
     */
    writeIntoLogsFile(content: string): any {
        console.log(content);
    }

    displayOnApp(content: string): any {
        this.snackBar.open(content, 'Fermer', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['custom-snackbar'], // Classes CSS personnalisées
          });
    }
    /*writeIntoLogsFile(content: string): Observable<string> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;
                return this.http.post<string>(`${this.baseUrlAPI}/api/cdp/writeLog`, content).pipe(
                    catchError(() => {
                        this.error("Request to Node-REd KNX API to write new log failed");
                        this.info("check your Node-Red installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }*7

    /**
     * Fonction permettant de lisre le contenu du fichier de logs.
     * @returns list de strings (model LogItem)
     */
    readIntoLogsFile(): Observable<LogItem[]> {
        return this.readServeurAdress().pipe(
            switchMap((response) => {
                this.baseUrlAPI = response;

                return this.http.get<LogItem[]>(`${this.baseUrlAPI}/readLogs`).pipe(
                    catchError(() => {
                        this.error("Request to Node-RED KNX API to read logs file failed");
                        this.info("Check your Node-RED installation, maybe restart the service.");
                        return of(); // Retourne un tableau vide en cas d'erreur
                    })
                );
            })
        );
    }

    readServeurAdress(): Observable<string> {
        return this.http.get<string>(`${this._jsonURL}`).pipe(
            map((response: any) => response.serverAddress)
        );
    }
}

/**
 * Classe secondaire permettant de formater les informations (paramètres) et construire la chaîne à journaliser dans les logs
 */
export class LogEntry {
    entryDate: Date = new Date();
    message: string = "";
    level: LogLevel = LogLevel.Debug;
    extraInfo: any[] = [];
    logWithDate: boolean = true;

    /**
     * fonction permettant de générer la ligne qui sera journalisée dans les logs.
     * @returns ret le string contenant la ligne à journaliser.
     */
    buildLogString(): string {
        let ret: string = "";

        if (this.logWithDate) {
            ret = new Date() + " - ";
        }

        ret += "Type: " + LogLevel[this.level];
        ret += " - Message: " + this.message;
        if (this.extraInfo.length) {
            ret += " - Extra Info: " + this.formatParams(this.extraInfo);
        }

        return ret;
    }

    private formatParams(params: any[]): string {
        let ret: string = params.join(",");

        // Is there at least one object in the array?
        if (params.some(p => typeof p == "object")) {
            ret = "";

            // Build comma-delimited string
            for (let item of params) {
                ret += JSON.stringify(item) + ",";
            }
        }

        return ret;
    }
}
