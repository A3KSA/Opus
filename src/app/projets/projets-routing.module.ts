import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { GestionProjetsComponent } from "./components/gestion-projets/gestion-projets.component";
import { ProjetDetailComponent } from "./components/Projet/projet-detail/projet-detail.component";
import { AuthGuard } from "../core/guards/auth.guard";
import { CloseConnectionsGuard } from "../core/guards/closeConnections.guard";

const routes: Routes = [
    { path: 'projets', component: GestionProjetsComponent, canActivate: [AuthGuard, CloseConnectionsGuard] },
    { path: 'projets/:id', component: ProjetDetailComponent, canActivate: [AuthGuard, CloseConnectionsGuard]},
  ];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class ProjetsRoutingModule{}