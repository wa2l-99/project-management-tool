import { Component, OnInit, ViewChild } from '@angular/core';
import { TaskService } from '../../../../services/services';
import { TaskResponse } from '../../../../services/models/task-response';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tasks-summary',
  templateUrl: './tasks-summary.component.html',
  styleUrl: './tasks-summary.component.scss',
})
export class TasksSummaryComponent implements OnInit {
  tasks: TaskResponse[] = [];
  displayedColumns: string[] = [
    'projectName',
    'name',
    'priority',
    'status',
    'dueDate',
    'progress',
  ];
  dataSource = new MatTableDataSource<TaskResponse>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator; // Correcte référence du MatPaginator
  filterStatus: string | null = null;

  constructor(private taskService: TaskService, private router: Router) {}

  ngOnInit(): void {
    this.loadTasks();
    this.dataSource.filterPredicate = (
      data: TaskResponse,
      filter: string
    ): boolean => {
      if (!filter) return true; // Si aucun filtre, afficher toutes les tâches
      return data.status === filter; // Filtrer par statut
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadTasks(): void {
    this.taskService.getAllTasks().subscribe({
      next: (data: TaskResponse[]) => {
        this.tasks = data;
        this.dataSource.data = this.tasks;

        // Reconfigurer le paginator si les données arrivent après la vue
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tâches:', err);
      },
    });
  }

  // Méthode pour appliquer le filtre
  applyFilter(): void {
    this.dataSource.filter = this.filterStatus || ''; // Appliquer le filtre sur le statut
  }

  // Méthode pour calculer le pourcentage de progression
  calculateProgress(status: string): number {
    if (status === 'TODO') return 25;
    if (status === 'IN_PROGRESS') return 50;
    if (status === 'DONE') return 100;
    return 0; // Si le statut est inconnu
  }

  // Méthode pour obtenir les styles dynamiques
  getProgressBarStyles(progress: number): { [key: string]: string } {
    return {
      '--progress': `${progress}`,
      '--progress-color': this.getProgressColor(progress),
    };
  }

  // Méthode pour déterminer la couleur selon le pourcentage
  getProgressColor(progress: number): string {
    if (progress < 50) {
      return '#f87171';
    } else if (progress < 75) {
      return '#fbbf24';
    } else {
      return '#34d399';
    }
  }

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'LOW':
        return 'Faible';
      case 'MEDIUM':
        return 'Moyenne';
      case 'HIGH':
        return 'Haute';
      default:
        return 'Inconnu';
    }
  }

  // Méthode pour traduire les statuts
  getStatusLabel(status: string): string {
    switch (status) {
      case 'TODO':
        return 'À faire';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'DONE':
        return 'Terminé';
      default:
        return 'Inconnu';
    }
  }
  translateStatus(status: string): string {
    const translations: { [key: string]: string } = {
      TODO: 'À faire',
      IN_PROGRESS: 'En cours',
      DONE: 'Terminé',
    };
    return translations[status] || status;
  }

  // Redirige vers la page Mes Projets
  navigateToProjects(): void {
    this.router.navigate(['/mes-projets']);
  }
}
