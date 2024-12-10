import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepComponent } from './components/step/step.component';
import { StepsRoutingModule } from './steps-routing.module';
import { ListStepsComponent } from './components/list-steps/list-steps.component';
import { StepDetailsComponent } from './components/step-details/step-details.component';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { InterventionsSectionComponent } from './components/sections/interventions-section/interventions-section.component';
import { ProjetsSectionComponent } from './components/sections/projets-section/projets-section.component';
import { DocumentsSectionComponent } from './components/sections/documents-section/documents-section.component';
import { MapSectionComponent } from './components/sections/map-section/map-section.component';
import { ModalCreateInfoComponent } from './components/popups/modal-create-info/modal-create-info.component';
import { ModalCreateDocComponent } from './components/popups/modal-create-doc/modal-create-doc.component';
import { ModalUpdateStepComponent } from './components/popups/modal-update-step/modal-update-step.component';
import { ModalCreateExploitComponent } from './components/popups/modal-create-exploit/modal-create-exploit.component';
import { ModalUpdateExploitComponent } from './components/popups/modal-update-exploit/modal-update-exploit.component';
import { NoteItemComponent } from './components/notes/note-item/note-item.component';



@NgModule({
  declarations: [
    StepComponent,
    ListStepsComponent,
    StepDetailsComponent,
    MapSectionComponent,
    InterventionsSectionComponent,
    ProjetsSectionComponent,
    DocumentsSectionComponent,
    ModalCreateInfoComponent,
    ModalCreateDocComponent,
    ModalUpdateStepComponent,
    ModalCreateExploitComponent,
    ModalUpdateExploitComponent,
    NoteItemComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    StepsRoutingModule,
    MatTableModule,
  ],
  exports: [
    ListStepsComponent,
  ]
})
export class StepsModule { }
