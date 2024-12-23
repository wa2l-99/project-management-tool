import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { ProjectsListComponent } from './pages/projects-list/projects-list.component';
import { CreateProjectComponent } from './pages/create-project/create-project.component';
import { ProjectDetailsComponent } from './pages/project-details/project-details.component';
import { TaskDetailsComponent } from './components/task-details/task-details.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TasksHistoryComponent } from './pages/tasks-history/tasks-history.component';
import { authGuard } from '../../services/services/guard/auth.guard';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [authGuard],

    children: [
      {
        path: 'mes-projets',
        component: ProjectsListComponent,
        canActivate: [authGuard],
      },
      {
        path: 'historique-taches',
        component: TasksHistoryComponent,
        canActivate: [authGuard],
      },
      {
        path: 'nouveau-projet',
        component: CreateProjectComponent,
        canActivate: [authGuard],
        data: { roles: ['ADMIN','No role'] },
        
      },
      {
        path: ':id/details',
        component: ProjectDetailsComponent,
        canActivate: [authGuard],
      },

      {
        path: ':id/tasks/:taskId/details',
        component: TaskDetailsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
      },
      {
        path: 'forbidden',
        component: ForbiddenComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
