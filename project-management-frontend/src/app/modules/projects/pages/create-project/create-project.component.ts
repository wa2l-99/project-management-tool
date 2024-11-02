import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, Observable, of, startWith } from 'rxjs';
import { ProjectService } from '../../../../services/services/project.service';
import { AuthenticationService } from '../../../../services/services';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import {
  AssignRoleRequest,
  InviteMemberRequest,
  ProjectRequest,
  UserResponse,
} from '../../../../services/models';
import { InviteMemberToProject$Params } from '../../../../services/fn/project/invite-member-to-project';
import { AssignRoleToMember$Params } from '../../../../services/fn/project/assign-role-to-member';
import { formatDate } from '@angular/common';
import { MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { StorageUserService } from '../../../../services/storageUser/storage-user.service';
import { FindProjectById$Params } from '../../../../services/fn/project/find-project-by-id';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  projectFormCompleted = false;
  membersFormGroupCompleted = false;
  rolesFormGroupCompleted = false;
  today: Date = new Date(); 

  projectCreated = false;
  userAssigned = false;
  projectForm!: FormGroup;
  membersFormGroup!: FormGroup;
  rolesFormGroup!: FormGroup;
  filteredUsers!: Observable<UserResponse[]>;
  allUsers: UserResponse[] = [];
  selectedMembers: UserResponse[] = [];
  projectId: number | null = null;

  projectRoles: { nom: string; prenom: string; role: string }[] = [];
  projectCreatorId: number = 0;
  isSubmitting = false;
  completedSteps: number[] = []; // pour suivre les étapes validées
  existingMembers: UserResponse[] = [];
  projectRequest: ProjectRequest = {
    description: '',
    id: 0,
    name: '',
    startDate: '',
  };
  projectRecap: any = {};
  allStepsCompleted = false;

  constructor(
    private _formBuilder: FormBuilder,
    private projectService: ProjectService,
    private userService: AuthenticationService,
    private toastr: ToastrService,
    private router: Router,
    private storageUserService: StorageUserService
  ) {}

  ngOnInit() {
    this.projectForm = this._formBuilder.group({
      name: [this.projectRequest.name, Validators.required],
      description: [this.projectRequest.description, Validators.required],
      startDate: [this.projectRequest.startDate, Validators.required],
    });

    this.membersFormGroup = this._formBuilder.group({
      memberEmail: ['', Validators.required],
    });

    this.rolesFormGroup = this._formBuilder.group({
      member: ['', Validators.required],
      role: ['', Validators.required],
    });

    this.loadUsers();

    if (this.projectId) {
      this.loadProjectDetails(this.projectId);
    }
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

  filterUsers(value: string): UserResponse[] {
    const filterValue = value.toLowerCase();
    return this.allUsers.filter((user) =>
      user.email!.toLowerCase().includes(filterValue)
    );
  }

  // Étape 1 : Créer le projet
  createProject() {
    if (this.projectForm.valid) {
      const formattedProject = {
        ...this.projectForm.value,
        startDate: formatDate(
          this.projectForm.value.startDate,
          'yyyy-MM-dd',
          'en-US'
        ),
      };

      this.projectService.saveProject({ body: formattedProject }).subscribe({
        next: (projectId) => {
          this.projectId = projectId;
          this.loadProjectDetails(this.projectId); // Charger le projet créé
          this.projectCreatorId = this.getConnectedUserId();
          this.projectCreated = true;
          this.toastr.success('Projet créé avec succès !');
          this.projectFormCompleted = true;
          this.stepper.next();
          this.loadExistingMembers();
          this.projectForm.reset();
        },
        error: (err) => {
          if (err) {
            this.toastr.error(err.error.error, 'Erreur');
          } else {
            this.toastr.error('Erreur lors de la création du projet.');
          }
        },
      });
    }
  }

  // Étape 2 : Inviter un membre (optionnel)
  inviteMember() {
    if (this.membersFormGroup.valid && this.projectId) {
      const email = this.membersFormGroup.get('memberEmail')?.value;

      // Paramètres pour l'API d'invitation
      const params: InviteMemberToProject$Params = {
        projectId: this.projectId,
        body: {
          email: email,
        } as InviteMemberRequest,
      };

      // Envoie l'invitation par email
      this.projectService.inviteMemberToProject$Response(params).subscribe({
        next: () => {
          this.toastr.success(`Invitation envoyée à ${email} avec succès !`);
          this.membersFormGroupCompleted = true;
          this.loadExistingMembers(); // Charger les membres existants
          this.membersFormGroup.reset();
          // Ajouter le nouveau membre au récapitulatif directement
          const newMember = this.allUsers.find((user) => user.email === email);
          if (newMember) {
            this.projectRecap.members = [
              ...(this.projectRecap.members || []),
              { ...newMember, role: '' }, // Ajout avec rôle vide pour indiquer qu'il n'est pas encore attribué
            ];
          }
          this.membersFormGroup.reset();
        },
        error: (err) => {
          if (err) {
            this.toastr.error(err.error.error, 'Erreur');
          } else {
            this.toastr.error(`Erreur lors de l'invitation de ${email}.`);
          }
        },
      });
    }
  }

  loadExistingMembers() {
    if (this.projectId) {
      this.projectService
        .getProjectMembers({ projectId: this.projectId })
        .subscribe({
          next: (members) => {
            this.existingMembers = members;
          },
          error: () =>
            this.toastr.error(
              'Erreur lors du chargement des membres existants.'
            ),
        });
    }
  }

  // Étape 3 : Assigner un rôle (optionnel)
  assignRole() {
    if (this.rolesFormGroup.valid && this.projectId) {
      const selectedEmail = this.rolesFormGroup.get('member')?.value;
      const selectedRole = this.rolesFormGroup.get('role')?.value;

      const paramsRole: AssignRoleToMember$Params = {
        projectId: this.projectId,
        body: {
          email: selectedEmail,
          role: selectedRole,
        } as AssignRoleRequest,
      };

      this.projectService.assignRoleToMember(paramsRole).subscribe({
        next: (response: string) => {
          const role = this.rolesFormGroup.get('role')?.value;
          this.toastr.success(response);
          this.allStepsCompleted = true;
          // Mise à jour du rôle dans le récapitulatif
          const memberToUpdate = this.projectRecap.members?.find(
            (member: UserResponse) => member.email === selectedEmail
          );

          if (memberToUpdate) {
            memberToUpdate.role = selectedRole;
          }

          const member = this.existingMembers.find(
            (m) => m.email === selectedEmail
          );
          if (member) {
            this.projectRoles = [
              ...this.projectRoles,
              {
                nom: member.nom ?? '',
                prenom: member.prenom ?? '',
                role: selectedRole,
              },
            ];
          }
          this.rolesFormGroup.reset();
        },
        error: (err) => {
          this.toastr.error(err.error.error, 'Erreur');
          console.log(err.error.error);
        },
      });
    }
  }

  loadProjectDetails(projectId: number) {
    const paramsProject: FindProjectById$Params = {
      'project-id': projectId,
    };

    this.projectService.findProjectById(paramsProject).subscribe({
      next: (project) => {
        // Mettre à jour le projet en récapitulatif
        this.projectRecap = {
          name: project.name,
          description: project.description,
          startDate: project.startDate,
          owner: project.owner,
          members: project.members,
        };
        this.existingMembers = project.members ?? [];
        this.projectCreated = true;
        console.log('Project loaded:', project);
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des détails du projet.');
      },
    });
  }

  // Navigation for the stepper
  nextStep() {
    this.stepper.next();
  }

  perivousStep() {
    this.stepper.previous();
  }
  onStepChange(event: StepperSelectionEvent) {
    // Prevent moving back to previously completed steps
    if (
      event.selectedIndex < event.previouslySelectedIndex &&
      !(
        (event.previouslySelectedIndex === 0 && this.projectFormCompleted) ||
        (event.previouslySelectedIndex === 1 && this.membersFormGroupCompleted)
      )
    ) {
      this.stepper.selectedIndex = event.previouslySelectedIndex;
    }
  }

  getProjectStepLabel(): string {
    return this.projectFormCompleted
      ? 'Créer un projet (Terminé)'
      : 'Créer un projet';
  }

  isAdmin(): boolean {
    return this.storageUserService.hasRole('ADMIN');
  }
  getConnectedUserId(): number {
    const savedUser = this.storageUserService.getSavedUser();
    if (!savedUser || savedUser.id === undefined) {
      throw new Error('User ID is not available');
    }
    return savedUser.id;
  }

  // Finaliser le projet
  finalizeProject() {
    this.toastr.success('Le projet a été créé avec succès !');
    this.router.navigate(['/mes-projets']);
  }

  getRoleLabel(role: string): string {
    const roleMapping: { [key: string]: string } = {
      ADMIN: 'Administrateur',
      MEMBER: 'Membre',
      OBSERVER: 'Observateur',
    };
    return roleMapping[role] || role;
  }
}
