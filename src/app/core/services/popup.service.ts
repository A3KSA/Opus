import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Step } from '../models/steps/step.model';

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  private dialogRef: any;

  private selectedStep: Step | null = null;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  setSelectedStep(step: Step) {
    this.selectedStep = step;
  }

  getSelectedStep(): Step | null {
    return this.selectedStep;
  }

  openPopup<T>(componentType: Type<T>): void {
    // Créez une instance du composant que vous souhaitez afficher
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    const componentRef = componentFactory.create(this.injector);

    // Ajoutez le composant au DOM
    this.appRef.attachView(componentRef.hostView);

    // Créez un élément HTML pour la popup
    const popupElement = document.createElement('div');
    popupElement.appendChild(componentRef.location.nativeElement);

    // Ajoutez la popup au DOM
    document.body.appendChild(popupElement);

    // Stockez une référence à la popup
    this.dialogRef = componentRef;
  }

  closePopup(): void {
    // Supprimez la popup du DOM
    this.appRef.detachView(this.dialogRef.hostView);
    this.dialogRef.destroy();
  }
}

