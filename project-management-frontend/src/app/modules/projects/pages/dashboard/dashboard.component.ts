import { Component, OnInit } from '@angular/core';
import { StorageUserService } from '../../../../services/storageUser/storage-user.service';
import { ProjectService, TaskService } from '../../../../services/services';
import { TaskResponse } from '../../../../services/models';
import {
  ChartData,
  ChartType,
  Chart,
  registerables,
  ChartOptions,
} from 'chart.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  totalProjects: number = 0;
  totalTodoTasks: number = 0;
  totalInProgressTasks: number = 0;
  totalDoneTasks: number = 0;
  totalTasks: number = 0;

  todoPercentage: number = 0;
  inProgressPercentage: number = 0;
  donePercentage: number = 0;

  public pieChartOptions: ChartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function () {
            return '';
          },
        },
      },
    },
  };

  // Données pour le diagramme
  public pieChartLabels: string[] = ['À faire', 'En cours', 'Terminé'];
  public pieChartData: ChartData<'doughnut'> = {
    labels: this.pieChartLabels,
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#f87171', '#fbbf24', '#34d399'],
        hoverBackgroundColor: ['#ff4d4d', '#ffcc00', '#22c55e'], // Couleurs au survol
      },
    ],
  };
  public pieChartType: ChartType = 'doughnut';
  tasks: TaskResponse[] = [];

  constructor(
    private storageUserService: StorageUserService,
    private projectService: ProjectService,
    private taskService: TaskService,
    private router: Router
  ) {
    Chart.register(...registerables);
  }
  ngOnInit(): void {
    this.loadProjects();
    this.loadTasks();
  }

  getConnectedUserName() {
    const savedUser = this.storageUserService.getSavedUser();
    if (savedUser) {
      return `${savedUser.nom || ''}`.trim();
    }
    return '';
  }

  // Charger les projets
  loadProjects(): void {
    this.projectService.findAllProjects().subscribe({
      next: (response) => {
        // Vérifiez si les projets sont dans une propriété comme 'content'
        this.totalProjects = response.content?.length || 0;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des projets:', err);
      },
    });
  }

  // Charger les tâches
  loadTasks(): void {
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.totalTasks = tasks.length;

        this.totalTodoTasks = tasks.filter(
          (task: any) => task.status === 'TODO'
        ).length;
        this.totalInProgressTasks = tasks.filter(
          (task: any) => task.status === 'IN_PROGRESS'
        ).length;
        this.totalDoneTasks = tasks.filter(
          (task: any) => task.status === 'DONE'
        ).length;

        this.updatePieChartData();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tâches:', err);
      },
    });
  }

  /*************  ✨ Codeium Command ⭐  *************/
  /**
   * Met à jour les données du graphique en secteurs avec les nombres de tâches
   * à faire, en cours et terminées.
   *
   * @return {void} Rien
   */
  /******  ab31bab8-846c-403d-9fc8-fb16620cd8a1  *******/
  updatePieChartData(): void {
    // Calculate percentages
    const todoPercentage = this.calculatePercentage(
      this.totalTodoTasks,
      this.totalTasks
    );
    const inProgressPercentage = this.calculatePercentage(
      this.totalInProgressTasks,
      this.totalTasks
    );
    const donePercentage = this.calculatePercentage(
      this.totalDoneTasks,
      this.totalTasks
    );

    this.pieChartData = {
      labels: [
        `À faire (${todoPercentage}%)`,
        `En cours (${inProgressPercentage}%)`,
        `Terminé (${donePercentage}%)`,
      ],
      datasets: [
        {
          data: [todoPercentage, inProgressPercentage, donePercentage],
          backgroundColor: ['#f87171', '#fbbf24', '#34d399'],
          hoverBackgroundColor: ['#ff4d4d', '#ffcc00', '#22c55e'],
        },
      ],
    };
  }

  calculatePercentage(count: number, total: number): number {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Vérifie si toutes les données du graphique sont nulles ou à zéro
  isDataEmpty(): boolean {
    return this.pieChartData.datasets[0].data.every((value) => value === 0);
  }

  noRole(): boolean {
    return this.storageUserService.noRole();
  }
  createProject() {
    this.router.navigate(['/', 'nouveau-projet']);
  }
}
