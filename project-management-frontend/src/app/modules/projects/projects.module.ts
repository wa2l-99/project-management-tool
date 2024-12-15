import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { MainComponent } from './pages/main/main.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectsListComponent } from './pages/projects-list/projects-list.component';
import { NoProjectsComponentComponent } from './components/no-projects-component/no-projects-component.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CreateProjectComponent } from './pages/create-project/create-project.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ProjectDetailsComponent } from './pages/project-details/project-details.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatSortModule } from '@angular/material/sort';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpTokenInterceptor } from '../../interceptors/http-token.interceptor';
import { BlobToJsonInterceptor } from '../../interceptors/blob-to-json.interceptor';
import { ProjectTachesComponent } from './components/project-taches/project-taches.component';
import { TaskDetailsComponent } from './components/task-details/task-details.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TasksSummaryComponent } from './components/tasks-summary/tasks-summary.component';
import { BaseChartDirective } from 'ng2-charts';
import { TasksHistoryComponent } from './pages/tasks-history/tasks-history.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';

@NgModule({
  declarations: [
    MainComponent,
    SidebarComponent,
    TopbarComponent,
    FooterComponent,
    ProjectsListComponent,
    NoProjectsComponentComponent,
    CreateProjectComponent,
    ProjectDetailsComponent,
    ProjectTachesComponent,
    TaskDetailsComponent,
    DashboardComponent,
    TasksSummaryComponent,
    TasksHistoryComponent,
    ForbiddenComponent,
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    NgbDropdownModule,
    NgxSpinnerModule.forRoot(), // Ajoutez NgxSpinnerModule
    MatStepperModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatPaginator,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatIconModule,
    NgSelectModule,
    MatSelectModule,
    FormsModule,
    BaseChartDirective,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BlobToJsonInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpTokenInterceptor,
      multi: true,
    },
    HttpClient,
    provideNativeDateAdapter(),
  ],
})
export class ProjectsModule {}
