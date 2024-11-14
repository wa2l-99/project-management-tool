import { Component } from '@angular/core';
import { SidebarService } from '../../../../services/sidebarService/sidebar.service';
import { StorageUserService } from '../../../../services/storageUser/storage-user.service';
import { UserResponse } from '../../../../services/models/user-response';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  private _connectedUser: UserResponse = {};

  constructor(
    private sidebarService: SidebarService,
    private storageUserService: StorageUserService
  ) {}

  // Méthode pour basculer la sidebar via le service
  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authenticated-user');
    window.location.reload();
  }
  getConnectedUserName() {
    const savedUser = this.storageUserService.getSavedUser();
    if (savedUser) {
      return `${savedUser.nom || ''} ${savedUser.prenom || ''}`.trim();
    }
    return '';
  }

  getInitials(): string {
    const savedUser = this.storageUserService.getSavedUser();
    if (savedUser) {
      const nomInitial = savedUser.nom
        ? savedUser.nom.charAt(0).toUpperCase()
        : '';
      const prenomInitial = savedUser.prenom
        ? savedUser.prenom.charAt(0).toUpperCase()
        : '';
      return `${nomInitial}${prenomInitial}`;
    }
    return '';
  }
}
