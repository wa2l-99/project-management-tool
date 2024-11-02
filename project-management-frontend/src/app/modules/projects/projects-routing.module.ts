import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { ProjectsListComponent } from './pages/projects-list/projects-list.component';
import { CreateProjectComponent } from './pages/create-project/create-project.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'mes-projets',
        component: ProjectsListComponent,
      },
      {
        path: 'new-projet',
        component: CreateProjectComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
