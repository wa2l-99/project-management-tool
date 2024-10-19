import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { MainComponent } from './pages/main/main.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { NgbActiveModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectCreationModalComponent } from './components/project-creation-modal/project-creation-modal.component';
import { ProjectsListComponent } from './pages/projects-list/projects-list.component';

@NgModule({
  declarations: [
    MainComponent,
    SidebarComponent,
    TopbarComponent,
    FooterComponent,
    ProjectCreationModalComponent,
    ProjectsListComponent,
  ],
  imports: [CommonModule, ProjectsRoutingModule, NgbDropdownModule],
})
export class ProjectsModule {}
