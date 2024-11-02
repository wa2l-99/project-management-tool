import { Component, OnInit } from '@angular/core';
import { StorageUserService } from '../../../../services/storageUser/storage-user.service';
import { Router } from '@angular/router';
import { PageResponseProjectResponse } from '../../../../services/models';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../../../services/services/project.service';

@Component({
  selector: 'app-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.scss',
})
export class ProjectsListComponent implements OnInit {
  projectResponse: PageResponseProjectResponse = {};
  loading: boolean = true;
  spinnerArray = [1, 2, 3];

  constructor(
    private router: Router,
    private projectsMemberSevice: ProjectService,
    private storageUserService: StorageUserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.findAllUserProjects();
    setTimeout(() => {
      this.loading = false;
    }, 2000);
  }

  private findAllUserProjects() {
    this.projectsMemberSevice.getMyProjects().subscribe({
      next: (myProjects) => {
        console.log(myProjects); // Pour vérifier la structure des données
        this.projectResponse = myProjects;
      },
      error: (err) => {
        if (err) {
          this.toastr.error(err.message, 'Erreur');
        } else {
          this.toastr.error(err, 'Error fetching projects');
        }
      },
    });
  }

  isAdmin(): boolean {
    return this.storageUserService.hasRole('ADMIN');
  }

  isMember(): boolean {
    return this.storageUserService.hasRole('MEMBER');
  }

  isobserver(): boolean {
    return this.storageUserService.hasRole('OBSERVER');
  }

  noRole(): boolean {
    return this.storageUserService.noRole();
  }

  createProject() {
    this.router.navigate(['new-projet']);
  }
}
