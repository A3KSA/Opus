import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EplanRoutingModule } from './eplan-routing.module';
import { ProjectsListComponent } from './components/projects-list/projects-list.component';
import { CoreModule } from '../core/core.module';
import { FormsModule } from '@angular/forms';
import { ProjectDetailsComponent } from './components/project-details/project-details.component';
import { TableGeneratorComponent } from './components/table-generator/table-generator.component';
import { EquipDetailComponent } from './components/equip-detail/equip-detail.component';
import { ModalSegmentsComponent } from './components/modals/modal-segments/modal-segments.component';
import { ModalProjectComponent } from './components/modals/modal-project/modal-project.component';


@NgModule({
  declarations: [
    ProjectsListComponent,
    ProjectDetailsComponent,
    TableGeneratorComponent,
    EquipDetailComponent,
    ModalSegmentsComponent,
    ModalProjectComponent
  ],
  imports: [
    CommonModule,
    EplanRoutingModule,
    CoreModule,
    FormsModule
  ],  
  exports:[
    ProjectsListComponent,
  ]
})
export class EplanModule { }
