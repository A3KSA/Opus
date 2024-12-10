import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ListStepsComponent } from "./components/list-steps/list-steps.component";
import { CloseConnectionsGuard } from "../core/guards/closeConnections.guard";

const routes: Routes = [
    { path: 'steps', component: ListStepsComponent, canActivate: [CloseConnectionsGuard] },
  ];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class StepsRoutingModule{}