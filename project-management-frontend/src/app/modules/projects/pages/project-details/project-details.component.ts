import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  AssignRoleRequest,
  InviteMemberRequest,
  ProjectMemberResponse,
  ProjectResponse,
  UserResponse,
} from '../../../../services/models';
import {
  AuthenticationService,
  ProjectService,
} from '../../../../services/services';
import { ActivatedRoute, Router } from '@angular/router';
import { FindProjectById$Params } from '../../../../services/fn/project/find-project-by-id';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { InviteMemberToProject$Params } from '../../../../services/fn/project/invite-member-to-project';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { UpdateMemberRole$Params } from '../../../../services/fn/project/update-member-role';
import * as bootstrap from 'bootstrap';
import { AssignRoleToMember$Params } from '../../../../services/fn/project/assign-role-to-member';
import { StorageUserService } from '../../../../services/storageUser/storage-user.service';
import { DeleteProject$Params } from '../../../../services/fn/project/delete-project';

interface Role {
  label: string;
  value: string;
}
@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss',
})
export class ProjectDetailsComponent implements OnInit {
  roles: Role[] = [
    { label: 'Membre', value: 'MEMBER' },
    { label: 'Observateur', value: 'OBSERVER' },
  ];

  projectId: number | null = null;
  project: ProjectResponse | null = null;
  membersFormGroup!: FormGroup;
  rolesFormGroup!: FormGroup;
  filteredUsers!: Observable<UserResponse[]>;
  allUsers: UserResponse[] = [];
  projectRecap: any = {};
  displayedColumns: string[] = ['nom', 'prenom', 'email', 'role', 'action']; // Colonnes pour la mat-table
  dataSource = new MatTableDataSource<ProjectMemberResponse>();
  selectedUserEmail: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;

  constructor(
    private _formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private userService: AuthenticationService,
    private toastr: ToastrService,
    private storageUserService: StorageUserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();

    this.projectId = Number(this.route.snapshot.paramMap.get('id'));

    this.membersFormGroup = this._formBuilder.group({
      memberEmail: new FormControl(null, [Validators.required]),
    });

    this.rolesFormGroup = this._formBuilder.group({
      role: ['', Validators.required],
    });
    const paramsProject: FindProjectById$Params = {
      'project-id': this.projectId,
    };

    if (this.projectId) {
      this.projectService.findProjectById(paramsProject).subscribe({
        next: (project) => {
          this.project = project;
          this.dataSource.data = project.members ?? []; // Charger les membres du projet dans dataSource
          this.dataSource.paginator = this.paginator; // Lier paginator
        },
        error: () => {
          console.error('Erreur lors du chargement des détails du projet.');
        },
      });
    }
  }

  get safeMembers() {
    return this.project?.members ?? []; // Utilise un tableau vide par défaut
  }

  loadUsers() {
    this.userService.findAll().subscribe((users) => {
      this.allUsers = users;
      this.filteredUsers = this.membersFormGroup.controls[
        'memberEmail'
      ].valueChanges.pipe(
        startWith(''),
        map((value) => this.filterUsers(value || ''))
      );
    });
  }

  /*************  ✨ Codeium Command ⭐  *************/
  /**
   * Filters the list of all users to find those whose email address includes the given value.
   * If the value is not a string, returns the full list of users.
   *
   * @param value - The string to filter user emails by.
   * @returns An array of UserResponse objects whose emails contain the filter value.
   */

  /******  4aa3d938-9331-4fad-b429-9ef8715be8e8  *******/
  filterUsers(value: string): UserResponse[] {
    if (typeof value !== 'string') {
      return this.allUsers; // Retourner tous les utilisateurs si la valeur n'est pas une chaîne
    }
    const filterValue = value.toLowerCase();
    return this.allUsers.filter((user) =>
      user.email!.toLowerCase().includes(filterValue)
    );
  }

  inviteMember() {
    if (this.membersFormGroup.valid && this.projectId) {
      const user = this.membersFormGroup.get('memberEmail')?.value;

      // Paramètres pour l'API d'invitation
      const params: InviteMemberToProject$Params = {
        projectId: this.projectId,
        body: {
          email: user.email,
        } as InviteMemberRequest,
      };
      this.projectService.inviteMemberToProject$Response(params).subscribe({
        next: () => {
          this.toastr.success(
            `Invitation envoyée à ${user.email} avec succès !`
          );
          this.loadUsers();
          this.refreshMembersList();
          this.closeModalButton.nativeElement.click();
          this.membersFormGroup.reset();

          // Ajouter le nouveau membre au récapitulatif directement
          const newMember = this.allUsers.find(
            (user) => user.email === user.email
          );
          if (newMember) {
            this.projectRecap.members = [
              ...(this.projectRecap.members || []),
              { ...newMember, role: '' }, // Ajout avec rôle vide pour indiquer qu'il n'est pas encore attribué
            ];
          }
        },
        error: (err) => {
          if (err) {
            this.toastr.error(err.error.error, 'Erreur');
          } else {
            this.toastr.error(`Erreur lors de l'invitation de ${user.email}.`);
          }
        },
      });
    }
  }

  // Méthode pour supprimer l'overlay du modal
  private removeModalBackdrop(): void {
    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops.length > 0) {
      backdrops[0].parentNode?.removeChild(backdrops[0]);
    }
  }
  setSelectedUserEmail(email: string): void {
    this.selectedUserEmail = email;
    const member = this.project?.members?.find(
      (member) => member.email === email
    );

    if (member) {
      this.rolesFormGroup.get('role')?.setValue(member.role);
    }
  }

  updateRole() {
    if (this.rolesFormGroup.invalid || !this.selectedUserEmail) return;
    else if (this.projectId) {
      const newRole = this.rolesFormGroup.value.role;
      const params: UpdateMemberRole$Params = {
        projectId: this.projectId,
        body: {
          email: this.selectedUserEmail,
          role: newRole,
        } as AssignRoleRequest,
      };

      this.projectService.updateMemberRole$Response(params).subscribe({
        next: () => {
          // Fermer automatiquement le modal en simulant un clic sur le bouton
          this.closeModalButton.nativeElement.click();
          this.refreshMembersList();
          // Fermer le modal en utilisant l'API Bootstrap via window.bootstrap
          const modalElement = document.getElementById('ModifyRoleModal');
          if (modalElement) {
            const modalInstance = (window as any).bootstrap.Modal.getInstance(
              modalElement
            );
            modalInstance?.hide();
          }

          this.removeModalBackdrop();
          this.toastr.success('Rôle mis à jour avec succès');
          this.rolesFormGroup.reset();
        },
        error: (err) => {
          this.toastr.error(err.error.error, 'Erreur');
        },
      });
    }
  }

  refreshMembersList(): void {
    if (this.projectId) {
      const paramsProject: FindProjectById$Params = {
        'project-id': this.projectId,
      };

      this.projectService.findProjectById(paramsProject).subscribe({
        next: (project) => {
          this.project = project;
          this.projectRecap.members = project.members;
          this.allUsers != project.members; // Met à jour la liste complète des utilisateurs
          this.dataSource.data = project.members ?? []; // Mettre à jour le dataSource
          this.dataSource.paginator = this.paginator; // Re-lier le paginator si nécessaire
        },
        error: () => {
          console.error('Erreur lors du rafraîchissement des membres.');
        },
      });
    }
  }

  addRole() {
    const user = this.storageUserService.getSavedUser();
    if (this.rolesFormGroup.invalid || !this.selectedUserEmail) return;
    else if (this.projectId && user && user.role === 'ADMIN') {
      const newRole = this.rolesFormGroup.value.role;
      const params: AssignRoleToMember$Params = {
        projectId: this.projectId,
        body: {
          email: this.selectedUserEmail,
          role: newRole,
        } as AssignRoleRequest,
      };

      this.projectService.assignRoleToMember(params).subscribe({
        next: () => {
          this.rolesFormGroup.reset();
          this.refreshMembersList();
          // Fermer le modal en utilisant l'API Bootstrap via window.bootstrap
          const modalElement = document.getElementById('addRoleModal');
          if (modalElement) {
            const modalInstance = (window as any).bootstrap.Modal.getInstance(
              modalElement
            );
            modalInstance?.hide();
          }

          this.removeModalBackdrop();
          this.toastr.success('Rôle ajouté avec succès');
        },
        error: (err) => {
          this.toastr.error(err.error.error, 'Erreur');
        },
      });
    }
  }
  confirmDeleteProject() {
    const user = this.storageUserService.getSavedUser();
    if (this.projectId && user && user.role === 'ADMIN') {
      const params: DeleteProject$Params = {
        'project-id': this.projectId,
      };
      this.projectService.deleteProject(params).subscribe({
        next: () => {
          this.toastr.success('Projet supprimé avec succès');
          this.removeModalBackdrop();
          this.router.navigate(['/mes-projets']);
        },

        error: (err) => {
          this.toastr.error(err.error.error, 'Erreur');
        },
      });
    }
  }

  closeModalAndResetForAddMemember(): void {
    this.membersFormGroup.reset();
    this.closeModalButton.nativeElement.click();
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
