import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, TaskService } from '../../../../services/services';
import { ToastrService } from 'ngx-toastr';
import {
  TaskRequest,
  TaskResponse,
  UserResponse,
} from '../../../../services/models';
import { GetTaskById$Params } from '../../../../services/fn/task/get-task-by-id';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { GetProjectMembers$Params } from '../../../../services/fn/project/get-project-members';
import { AssignTaskToMember$Params } from '../../../../services/fn/task/assign-task-to-member';
import { DeleteTask$Params } from '../../../../services/fn/task/delete-task';
import { UpdateTask$Params } from '../../../../services/fn/task/update-task';
import { StorageUserService } from '../../../../services/storageUser/storage-user.service';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.scss',
})
export class TaskDetailsComponent implements OnInit {
  taskId!: number;
  projectId!: number;
  membersFormGroup!: FormGroup;
  filteredUsers!: Observable<UserResponse[]>;
  task!: TaskResponse;
  daysLeft!: number;
  allUsers: UserResponse[] = [];
  selectedMemberId!: number;
  editTaskForm!: FormGroup;
  selectedTask: TaskResponse | null = null;
  minDate: string = '';

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
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;

  constructor(
    private _formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private toastr: ToastrService,
    private router: Router,
    private projectService: ProjectService,
    private storageUserService: StorageUserService
  ) {}

  ngOnInit(): void {
    const today = this.getCurrentDate();
    const projectId: number = Number(this.route.snapshot.paramMap.get('id'));
    const taskId: number = Number(this.route.snapshot.paramMap.get('taskId'));
    this.minDate = today;

    this.loadUsers();
    this.membersFormGroup = this._formBuilder.group({
      memberEmail: new FormControl(null, [Validators.required]),
    });

    // Récupérer l'ID à partir de l'URL
    this.taskId = taskId;
    this.projectId = projectId;

    if (this.taskId) {
      this.loadTaskDetails();
    } else {
      this.toastr.error('ID de la tâche non trouvé');
    }

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

  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  loadUsers() {
    const params: GetProjectMembers$Params = {
      projectId: Number(this.route.snapshot.paramMap.get('id')),
    };
    this.projectService.getProjectMembers(params).subscribe((users) => {
      this.allUsers = users;
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
      return this.allUsers; // Retourner tous les utilisateurs si la valeur n'est pas une chaîne
    }
    const filterValue = value.toLowerCase();
    return this.allUsers.filter((user) =>
      user.email!.toLowerCase().includes(filterValue)
    );
  }

  onMemberSelect(selectedEmail: string): void {
    // Rechercher l'utilisateur correspondant par email pour obtenir l'ID
    const selectedUser = this.allUsers.find(
      (user) => user.email === selectedEmail
    );
    if (selectedUser) {
      this.selectedMemberId != selectedUser.id;
      console.log('ID du membre sélectionné:', this.selectedMemberId);
    }
  }

  extractEmailFromAssignedTo(assignedTo: string): string | null {
    const regex = /\(([^)]+)\)/; // Extrait tout ce qui est entre parenthèses
    const match = assignedTo.match(regex);
    return match ? match[1] : null;
  }

  // Charger les détails de la tâche
  loadTaskDetails(): void {
    const params: GetTaskById$Params = {
      taskId: this.taskId,
    };
    this.taskService.getTaskById(params).subscribe({
      next: (task) => {
        this.task = task;
        this.daysLeft = this.calculateDaysLeft(task.dueDate);
        this.editTaskForm.patchValue({
          name: task.name,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
        });

        // Pré-remplir le membre assigné dans le formulaire d'affectation
        if (task.assignedTo) {
          const assignedMemberEmail = this.extractEmailFromAssignedTo(
            task.assignedTo
          );
          this.membersFormGroup.patchValue({
            memberEmail: assignedMemberEmail,
          });
        }
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement de la tâche');
        console.error(err);
      },
    });
  }

  retunrProjectDetails(projectId: number) {
    this.router.navigate(['/', projectId, 'details']);
  }

  // Calculer le nombre de jours restants jusqu'à la date d'échéance
  calculateDaysLeft(dueDate: string | undefined): number {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const timeDiff = due.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convertir en jours
  }

  // Méthode pour affecter un membre à une tâche
  assignTask(): void {
    const selectedEmail = this.membersFormGroup.get('memberEmail')?.value;

    const selectedUser = this.allUsers.find(
      (user) => user.email === selectedEmail
    );

    if (selectedUser && selectedUser.id && this.taskId) {
      const params: AssignTaskToMember$Params = {
        taskId: this.taskId,
        memberId: selectedUser.id,
      };

      this.taskService.assignTaskToMember$Response(params).subscribe({
        next: () => {
          this.toastr.success('Tâche assignée avec succès');
          this.loadTaskDetails(); // Mettre à jour les détails de la tâche
        },
        error: (err) => {
          this.toastr.error("Erreur lors de l'assignation de la tâche");
          console.error(err);
        },
      });
    }
  }

  extractNameAndEmail(assignedTo: string): { fullName: string; email: string } {
    const regex = /(.*)\((.*)\)/;
    const match = assignedTo.match(regex);

    if (match) {
      const fullName = match[1].trim(); // Extraire le nom complet
      const email = match[2].trim(); // Extraire l'email
      return { fullName, email };
    }

    return { fullName: assignedTo, email: '' }; // Si le format ne correspond pas
  }

  // Méthode pour supprimer l'overlay du modal
  private removeModalBackdrop(): void {
    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops.length > 0) {
      backdrops[0].parentNode?.removeChild(backdrops[0]);
    }
  }
  ConfirmDeleteTask(): void {
    if (this.taskId) {
      const params: DeleteTask$Params = {
        taskId: this.taskId,
      };

      this.taskService.deleteTask(params).subscribe({
        next: () => {
          this.closeModalButton.nativeElement.click();
          this.toastr.success('Tâche supprimée avec succès');
          this.retunrProjectDetails(this.projectId);
          this.removeModalBackdrop();
        },
        error: (err) => {
          this.toastr.error(err.error.error, 'Erreur');
        },
      });
    }
  }

  updateTask(): void {
    if (this.editTaskForm.invalid || !this.taskId) return;
    console.log(this.taskId);

    const updatedTask: TaskRequest = {
      name: this.editTaskForm.value.name,
      description: this.editTaskForm.value.description,
      priority: this.editTaskForm.value.priority,
      status: this.editTaskForm.value.status,
      dueDate: this.editTaskForm.value.dueDate,
    };

    const params: UpdateTask$Params = {
      taskId: this.taskId,
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
        this.loadTaskDetails(); // Rafraîchir la liste des tâches
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la mise à jour de la tâche');
        console.error(err);
      },
    });
  }

  closeModalAndReset(): void {
    this.closeModalButton.nativeElement.click();
  }

  resetForm(): void {
    const today = this.getCurrentDate();
    this.editTaskForm.reset({ startDate: today });
    this.editTaskForm.get('startDate')?.disable();
  }

  isobserver(): boolean {
    return this.storageUserService.hasRole('OBSERVER');
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

  updateAssignTask(): void {
    if (this.membersFormGroup.invalid) {
      this.toastr.error('Veuillez sélectionner un membre valide.');
      return;
    }

    const selectedEmail = this.membersFormGroup.get('memberEmail')?.value;

    // Trouver l'utilisateur sélectionné à partir de son email
    const selectedUser = this.allUsers.find(
      (user) => user.email === selectedEmail
    );

    if (selectedUser && selectedUser.id && this.taskId) {
      const params: AssignTaskToMember$Params = {
        taskId: this.taskId,
        memberId: selectedUser.id,
      };

      this.taskService.assignTaskToMember(params).subscribe({
        next: () => {
          this.toastr.success('Tâche réaffectée avec succès.');
          // Fermer le modal après succès
          const modalElement = document.getElementById('upadteAssignTaskModal');
          if (modalElement) {
            const modalInstance = (window as any).bootstrap.Modal.getInstance(
              modalElement
            );
            modalInstance?.hide();
          }
          this.loadTaskDetails(); // Recharger les détails de la tâche
        },
        error: (err) => {
          this.toastr.error('Erreur lors de la réaffectation de la tâche.');
          console.error(err);
        },
      });
    } else {
      this.toastr.error('Utilisateur invalide ou non trouvé.');
    }
  }
}
