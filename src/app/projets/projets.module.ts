import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GestionProjetsComponent } from './components/gestion-projets/gestion-projets.component';
import { ProjetDetailComponent } from './components/Projet/projet-detail/projet-detail.component';
import { ProjetsRoutingModule } from './projets-routing.module';
import { CoreModule } from '../core/core.module';
import { ItemModalComponent } from './components/item-modal/item-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NoteItemComponent } from './components/Notes/note-item/note-item.component';
import { GestionEntitesComponent } from './components/gestion-entites/gestion-entites.component';
import { FormsModule } from '@angular/forms';
import { GenerateRapportComponent } from './components/generate-rapport/generate-rapport.component';
import { GenerateEmailComponent } from './components/generate-email/generate-email.component';
import { ImageModalComponent } from './components/image-modal/image-modal.component';
import { ItemCreateModalComponent } from './components/item-create-modal/item-create-modal.component';
import { NoteCreateComponent } from './components/Notes/note-create/note-create.component';
import { EntiteCreateComponent } from './components/entite-create/entite-create.component';
import { SearchEnteteComponent } from './components/entite-create/search-fonction/search-entete/search-entete.component';
import { NoteModalComponent } from './components/Notes/note-modal/note-modal.component';
import { LigneItemComponent } from './components/Ligne/ligne-item/ligne-item.component';
import { ProjetItemComponent } from './components/Projet/projet-item/projet-item.component';
import { ProjetCreateComponent } from './components/Projet/projet-create/projet-create.component';
import { ComplementCreateComponent } from './components/Ligne/complement-create/complement-create.component';
import { ComplementsHistoriqueComponent } from './components/Ligne/complements-historique/complements-historique.component';
import { LoginComponent } from './components/login/login.component';
import { ProjetEditComponent } from './components/Projet/projet-edit/projet-edit.component';
import { GestionUsersComponent } from './components/Admin/gestion-users/gestion-users.component';
import { UserCreateComponent } from './components/Admin/user-create/user-create.component';


@NgModule({
  declarations: [
    GestionProjetsComponent,
    ProjetDetailComponent,
    ProjetItemComponent,
    ItemModalComponent,
    NoteItemComponent,
    GestionEntitesComponent,
    GenerateRapportComponent,
    GenerateEmailComponent,
    ImageModalComponent,
    ItemCreateModalComponent,
    NoteCreateComponent,
    EntiteCreateComponent,
    SearchEnteteComponent,
    ProjetCreateComponent,
    NoteModalComponent,
    LigneItemComponent,
    ComplementCreateComponent,
    ComplementsHistoriqueComponent,
    LoginComponent,
    ProjetEditComponent,
    GestionUsersComponent,
    UserCreateComponent
  ],
  imports: [
    CommonModule,
    ProjetsRoutingModule,
    CoreModule,
    MatDialogModule,
    FormsModule 
  ],
  exports:[
    GestionProjetsComponent,
    ProjetItemComponent,
    LoginComponent
  ]
})
export class ProjetsModule { }
