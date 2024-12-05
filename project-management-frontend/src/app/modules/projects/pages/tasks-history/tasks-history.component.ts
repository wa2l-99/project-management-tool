import { Component, OnInit, ViewChild } from '@angular/core';
import { TaskService } from '../../../../services/services';

@Component({
  selector: 'app-tasks-history',
  templateUrl: './tasks-history.component.html',
  styleUrl: './tasks-history.component.scss',
})
export class TasksHistoryComponent implements OnInit {
  taskHistory: any[] = []; // Full list of task history
  paginatedTaskHistory: any[] = []; // Current page data
  currentPage: number = 1;
  itemsPerPage: number = 4;
  totalPages: number = 0;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTaskHistory();
  }

  loadTaskHistory(): void {
    this.taskService.getTaskModificationsForUserProjects().subscribe({
      next: (data) => {
        this.taskHistory = data
          .filter(
            (item) =>
              item.modificationDescription !==
              'Modifications apportées : Aucune modification détectée.'
          )
          .map((item) => ({
            ...item,
            modificationDescription: this.translateStatuses(
              item.modificationDescription!
            ),
          }))
          .sort((a, b) => {
            const dateA = a.lastModifiedDate
              ? new Date(a.lastModifiedDate).getTime()
              : 0;
            const dateB = b.lastModifiedDate
              ? new Date(b.lastModifiedDate).getTime()
              : 0;
            return dateB - dateA;
          });
        this.totalPages = Math.ceil(
          this.taskHistory.length / this.itemsPerPage
        );
        this.updatePaginatedTaskHistory();
      },
      error: (err) => {
        console.error(
          "Erreur lors du chargement de l'historique des tâches:",
          err
        );
      },
    });
  }

  translateStatuses(description: string): string {
    const statusMap: { [key: string]: string } = {
      TODO: 'À faire',
      IN_PROGRESS: 'En cours',
      DONE: 'Terminé',
      MEDIUM: 'Moyenne',
      LOW: 'Faible',
      HIGH: 'Haute',
    };

    // Replace English statuses with French equivalents
    Object.keys(statusMap).forEach((key) => {
      const regex = new RegExp(`'${key}'`, 'g');
      description = description.replace(regex, `'${statusMap[key]}'`);
    });

    return description;
  }

  updatePaginatedTaskHistory(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTaskHistory = this.taskHistory.slice(startIndex, endIndex);
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedTaskHistory();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedTaskHistory();
    }
  }
}
