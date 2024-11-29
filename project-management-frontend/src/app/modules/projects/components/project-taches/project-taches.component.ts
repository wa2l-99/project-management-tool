import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProjectService, TaskService } from '../../../../services/services';
import { formatDate } from '@angular/common';
import { CreateTask$Params } from '../../../../services/fn/task/create-task';
import {
  TaskRequest,
  TaskResponse,
  UserResponse,
} from '../../../../services/models';
import { FindAllTasksByProject$Params } from '../../../../services/fn/task/find-all-tasks-by-project';
import { DeleteTask$Params } from '../../../../services/fn/task/delete-task';
import * as bootstrap from 'bootstrap';
import { UpdateTask$Params } from '../../../../services/fn/task/update-task';
import { map, Observable, startWith } from 'rxjs';
import { GetProjectMembers$Params } from '../../../../services/fn/project/get-project-members';
import { AssignTaskToMember$Params } from '../../../../services/fn/task/assign-task-to-member';
import { StorageUserService } from '../../../../services/storageUser/storage-user.service';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-project-taches',
  templateUrl: './project-taches.component.html',
  styleUrl: './project-taches.component.scss',
})
export class ProjectTachesComponent implements OnInit {
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;

  taskForm!: FormGroup;
  minDate: string = '';
  projectId: number | null = null;
  tasksTodo: TaskResponse[] = [];
  tasksInProgress: TaskResponse[] = [];
  tasksDone: TaskResponse[] = [];
  editTaskForm!: FormGroup;
  selectedTask: TaskResponse | null = null;
  membersFormGroup!: FormGroup;
  selectedTaskId!: number | null;
  selectedTaskName!: string | null;
  ProjectMembers: UserResponse[] = [];
  filteredUsers!: Observable<UserResponse[]>;
  selectedMemberId!: number;

  countTodo: number = 0;
  countInProgress: number = 0;
  countDone: number = 0;

  priorities: SelectOption[] = [
    { label: 'Faible', value: 'LOW' },
    { label: 'Moyenne', value: 'MEDIUM' },
    { label: 'Haute', value: 'HIGH' },
  ];

  statuses: SelectOption[] = [
    { label: 'À faire', value: 'TODO' },
    { label: 'En cours', value: 'IN_PROGRESS' },
    { label: 'Terminé', value: 'DONE' },
  ];

  constructor(
    private _formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private taskService: TaskService,
    private router: Router,
    private projectService: ProjectService,
    private storageUserService: StorageUserService
  ) {}

  ngOnInit(): void {
    const today = this.getCurrentDate();
    this.minDate = today;

    this.membersFormGroup = this._formBuilder.group({
      memberEmail: new FormControl(null, [Validators.required]),
    });

    // Récupérer l'ID du projet à partir de l'URL
    this.route.paramMap.subscribe((params) => {
      const projectIdParam = params.get('id');
      this.projectId = projectIdParam ? Number(projectIdParam) : null;

      if (!this.projectId) {
        this.toastr.error("ID du projet non trouvé dans l'URL");
      }

      if (this.projectId) {
        this.loadTasks();
      } else {
        this.toastr.error('ID du projet non trouvé');
      }

      this.loadMembers();
    });

    // Initialiser le formulaire avec la date actuelle
    this.taskForm = this._formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      startDate: [{ value: today, disabled: true }],
      dueDate: ['', Validators.required],
      priority: ['MEDIUM', Validators.required],
      status: [{ value: 'TODO', disabled: true }],
    });

    // Initialiser le formulaire pour l'édition
    this.editTaskForm = this._formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      startDate: [{ value: today, disabled: true }],
      priority: ['', Validators.required],
      status: ['', Validators.required],
      dueDate: ['', Validators.required],
    });
  }

  loadTasks(): void {
    if (this.projectId) {
      const params: FindAllTasksByProject$Params = {
        projectId: this.projectId,
      };
      this.taskService.findAllTasksByProject(params).subscribe({
        next: (tasks) => {
          // Filtrer les tâches par statut
          this.tasksTodo = tasks.filter((task) => task.status === 'TODO');

          this.tasksInProgress = tasks.filter(
            (task) => task.status === 'IN_PROGRESS'
          );
          this.tasksDone = tasks.filter((task) => task.status === 'DONE');

          // Mettre à jour le compteur pour chaque statut
          this.countTodo = this.tasksTodo.length;
          this.countInProgress = this.tasksInProgress.length;
          this.countDone = this.tasksDone.length;
        },
        error: (err) => {
          this.toastr.error('Erreur lors du chargement des tâches');
          console.error(err);
        },
      });
    }
  }
  // Méthode pour obtenir la date actuelle au format 'YYYY-MM-DD'
  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /*************  ✨ Codeium Command ⭐  *************/
  /**
   * Adds a new task to the project.
   *
   * This method first validates the task form and checks if the project ID is set.
   * If the form is valid, it constructs a `TaskRequest` object using the form values
   * and sends it to the `TaskService` to create the task.
   *
   * If the task creation is successful, a success message is displayed and the form is reset.
   * If there is an error, an error message is shown.
   *
   * Preconditions:
   * - `taskForm` should be initialized and contain the necessary form controls.
   * - `projectId` should be set to a valid project ID.
   *
   * Side Effects:
   * - Displays a success or error message using `ToastrService`.
   * - Resets the task form upon successful creation.
   */

  /******  27c0f1b6-2a1d-4966-b986-a8033c937203  *******/
  addTask(): void {
    if (this.taskForm.invalid || !this.projectId) {
      this.toastr.error('Veuillez remplir tous les champs obligatoires');
      console.log(this.projectId);
      return;
    }

    // Construire l'objet TaskRequest
    const newTask: TaskRequest = {
      name: this.taskForm.value.name,
      description: this.taskForm.value.description,
      dueDate: formatDate(this.taskForm.value.dueDate, 'yyyy-MM-dd', 'en-US'),
      priority: this.taskForm.value.priority,
      status: this.taskForm.value.status,
    };
    const params: CreateTask$Params = {
      projectId: this.projectId,
      body: newTask,
    };

    this.taskService.createTask(params).subscribe({
      next: (response) => {
        this.toastr.success('Tâche créée avec succès');
        console.log('Tâche créée :', response);
        this.resetForm();
        this.closeModalButton.nativeElement.click();
        this.loadTasks();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la création de la tâche');
        console.error(err);
      },
    });
  }

  loadMembers() {
    const params: GetProjectMembers$Params = {
      projectId: Number(this.route.snapshot.paramMap.get('id')),
    };
    this.projectService.getProjectMembers(params).subscribe((members) => {
      this.ProjectMembers = members;
      this.filteredUsers = this.membersFormGroup.controls[
        'memberEmail'
      ].valueChanges.pipe(
        startWith(''),
        map((value) => this.filterUsers(value || ''))
      );
    });
  }

  filterUsers(value: string): UserResponse[] {
    if (typeof value !== 'string') {
      return this.ProjectMembers; // Retourner tous les utilisateurs si la valeur n'est pas une chaîne
    }
    const filterValue = value.toLowerCase();
    return this.ProjectMembers.filter((member) =>
      member.email!.toLowerCase().includes(filterValue)
    );
  }
  onMemberSelect(selectedEmail: string): void {
    // Rechercher l'utilisateur correspondant par email pour obtenir l'ID
    const selectedMember = this.ProjectMembers.find(
      (user) => user.email === selectedEmail
    );
    if (selectedMember) {
      this.selectedMemberId != selectedMember.id;
      console.log('ID du membre sélectionné:', this.selectedMemberId);
    }
  }

  // Méthode pour affecter un membre à une tâche
  assignTask(): void {
    const selectedEmail = this.membersFormGroup.get('memberEmail')?.value;

    const selectedUser = this.ProjectMembers.find(
      (member) => member.email === selectedEmail
    );

    if (selectedUser && selectedUser.id && this.selectedTaskId) {
      const params: AssignTaskToMember$Params = {
        taskId: this.selectedTaskId,
        memberId: selectedUser.id,
      };

      this.taskService.assignTaskToMember$Response(params).subscribe({
        next: () => {
          this.toastr.success('Tâche assignée avec succès');
          // Fermer le modal en utilisant l'API Bootstrap via window.bootstrap
          const modalElement = document.getElementById('assignTaskModal');
          if (modalElement) {
            const modalInstance = (window as any).bootstrap.Modal.getInstance(
              modalElement
            );
            modalInstance?.hide();
          }

          this.removeModalBackdrop();
          this.loadTasks(); // Rafraîchir la liste des tâches
        },
        error: (err) => {
          this.toastr.error("Erreur lors de l'assignation de la tâche");
          console.error(err);
        },
      });
    }
  }

  closeModalAndReset(): void {
    this.resetForm();
    this.closeModalButton.nativeElement.click();
  }
  resetForm(): void {
    const today = this.getCurrentDate();
    this.taskForm.reset({ startDate: today });
    this.taskForm.get('startDate')?.disable();
  }

  viewtaskDetails(taskId: number) {
    this.router.navigate([
      '/projets',
      this.projectId,
      'tasks',
      taskId,
      'details',
    ]);
  }

  // Méthode pour supprimer l'overlay du modal
  private removeModalBackdrop(): void {
    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops.length > 0) {
      backdrops[0].parentNode?.removeChild(backdrops[0]);
    }
  }

  /*************  ✨ Codeium Command ⭐  *************/
  /**
   * Confirms and deletes the specified task by taskId. If the deletion is
   * successful, the modal is closed, a success message is displayed, and the
   * user is redirected to the project details. Handles any errors during the
   * deletion process by displaying an error message.
   *
   * @param taskId - The unique identifier of the task to be deleted.
   */

  /******  83c5e112-98f5-4322-9433-0359cf442097  *******/
  ConfirmDeleteTask(): void {
    if (this.selectedTaskId) {
      const params: DeleteTask$Params = {
        taskId: this.selectedTaskId,
      };

      this.taskService.deleteTask(params).subscribe({
        next: () => {
          this.toastr.success('Tâche supprimée avec succès');

          // Fermer le modal en utilisant l'API Bootstrap via window.bootstrap
          const modalElement = document.getElementById('deleteTaskModal');
          if (modalElement) {
            const modalInstance = (window as any).bootstrap.Modal.getInstance(
              modalElement
            );
            modalInstance?.hide();
          }

          this.removeModalBackdrop();
          this.loadTasks();
          this.selectedTaskId = null;
          this.selectedTaskName = null;
        },
        error: (err) => {
          this.toastr.error(err.error.error, 'Erreur');
        },
      });
    }
  }

  setTask(taskId: number, taskName: string): void {
    this.selectedTaskId = taskId;
    this.selectedTaskName = taskName;
  }

  openEditModal(task: TaskResponse): void {
    // Charger les données de la tâche sélectionnée dans le formulaire
    this.selectedTask = task;
    this.editTaskForm.patchValue({
      name: task.name,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
    });
  }
  updateTask(): void {
    if (this.editTaskForm.invalid || !this.selectedTask) return;

    const updatedTask: TaskRequest = {
      name: this.editTaskForm.value.name,
      description: this.editTaskForm.value.description,
      priority: this.editTaskForm.value.priority,
      status: this.editTaskForm.value.status,
      dueDate: this.editTaskForm.value.dueDate,
    };

    const params: UpdateTask$Params = {
      taskId: this.selectedTask.id!,
      body: updatedTask,
    };

    this.taskService.updateTask(params).subscribe({
      next: () => {
        this.toastr.success('Tâche mise à jour avec succès');
        // Fermer le modal en utilisant l'API Bootstrap via window.bootstrap
        const modalElement = document.getElementById('updateTaskModal');
        if (modalElement) {
          const modalInstance = (window as any).bootstrap.Modal.getInstance(
            modalElement
          );
          modalInstance?.hide();
        }

        this.removeModalBackdrop();
        this.loadTasks(); // Rafraîchir la liste des tâches
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la mise à jour de la tâche');
        console.error(err);
      },
    });
  }

  isMember(): boolean {
    return this.storageUserService.hasRole('MEMBER');
  }

  isobserver(): boolean {
    return this.storageUserService.hasRole('OBSERVER');
  }
  isAdmin(): boolean {
    return this.storageUserService.hasRole('ADMIN');
  }
}
