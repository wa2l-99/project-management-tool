import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { ProjectsListComponent } from './pages/projects-list/projects-list.component';
import { CreateProjectComponent } from './pages/create-project/create-project.component';
import { ProjectDetailsComponent } from './pages/project-details/project-details.component';
import { TaskDetailsComponent } from './components/task-details/task-details.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TasksHistoryComponent } from './pages/tasks-history/tasks-history.component';

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
        path: 'historique-taches',
        component: TasksHistoryComponent,
      },
      {
        path: 'nouveau-projet',
        component: CreateProjectComponent,
      },
      {
        path: ':id/details',
        component: ProjectDetailsComponent,
      },

      {
        path: ':id/tasks/:taskId/details',
        component: TaskDetailsComponent,
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
