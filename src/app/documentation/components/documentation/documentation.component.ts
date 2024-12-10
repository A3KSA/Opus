import { Component } from '@angular/core';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss']
})

export class DocumentationComponent {

  myScriptElement!: HTMLScriptElement;

  constructor() {
    //PERMET D'IMPORTER UN SCRIPT JS DIRECTEMENT DANS UN COMPOSANT
    this.myScriptElement = document.createElement("script");
    this.myScriptElement.src = "../assets/documentation.js";
    document.body.appendChild(this.myScriptElement);
  }


}
