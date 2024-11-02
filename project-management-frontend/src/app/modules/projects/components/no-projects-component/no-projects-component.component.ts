import { Component } from '@angular/core';
import { StorageUserService } from '../../../../services/storageUser/storage-user.service';

@Component({
  selector: 'app-no-projects-component',
  templateUrl: './no-projects-component.component.html',
  styleUrl: './no-projects-component.component.scss',
})
export class NoProjectsComponentComponent {
  constructor(private storageUserService: StorageUserService) {}

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
}
