import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../core/guards/auth.guard";
import { DocumentationComponent } from "./components/documentation/documentation.component";

const routes: Routes = [
    { path: '', component: DocumentationComponent, canActivate: [AuthGuard] },
  ];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class DocumentationRoutingModule{}