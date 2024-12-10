
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ProjetsRoutingModule } from './projets/projets-routing.module';
import { StepsRoutingModule } from './steps/steps-routing.module';
import { EplanRoutingModule } from './eplan/eplan-routing.module';
import { WikiRoutingModule } from './wiki/wiki-routing.module';
import { LoginComponent } from './core/components/login/login.component';

const routes: Routes = [
    { path: 'documentation', loadChildren: () => import('./documentation/documentation.module').then(m => m.DocumentationModule) },
    { path: '', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
    { path: 'steps', loadChildren: () => import('./steps/steps.module').then(m => m.StepsModule) },
    { path: 'projets', loadChildren: () => import('./projets/projets.module').then(m => m.ProjetsModule) },
    { path: 'wiki', loadChildren: () => import('./wiki/wiki.module').then(m => m.WikiModule) },
    { path: 'eplan', loadChildren: () => import('./eplan/eplan.module').then(m => m.EplanModule) },
    { path: 'login', component: LoginComponent},
  ];

@NgModule({
    imports: [
      RouterModule.forRoot(routes),
      ProjetsRoutingModule,
      StepsRoutingModule,
      EplanRoutingModule,
      WikiRoutingModule
    ],
    exports: [
      RouterModule
    ]
  })
export class AppRoutingModule {}