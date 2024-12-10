import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectsListComponent } from './components/projects-list/projects-list.component';
import { ProjectDetailsComponent } from './components/project-details/project-details.component';
import { CloseConnectionsGuard } from '../core/guards/closeConnections.guard';
import { TableGeneratorComponent } from './components/table-generator/table-generator.component';

const routes: Routes = [
  { path: 'eplan', component: ProjectsListComponent, canActivate: [CloseConnectionsGuard] },
  { path: 'eplan/:id', component: ProjectDetailsComponent},
  { path: 'eplangenerator/:idPartOfWork', component: TableGeneratorComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EplanRoutingModule { }
