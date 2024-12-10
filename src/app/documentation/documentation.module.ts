import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { DocumentationRoutingModule } from './documentation-routing.module';



@NgModule({
  declarations: [
    DocumentationComponent
  ],
  imports: [
    CommonModule,
    DocumentationRoutingModule
  ],
  exports: [
    DocumentationComponent
  ]

})
export class DocumentationModule { }
