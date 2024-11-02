import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../../../services/sidebarService/sidebar.service';
import { StorageUserService } from '../../../../services/storageUser/storage-user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  isToggled: boolean = false;
  isCollapsed: boolean = false;
  isActive: boolean = false;

  constructor(
    private sidebarService: SidebarService,
    private storageUserService: StorageUserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const linkColor = document.querySelectorAll('.nav-link');

    linkColor.forEach((link) => {
      if (window.location.href.endsWith(link.getAttribute('href') || '')) {
        link.classList.add('active');
      }
      link.addEventListener('click', () => {
        linkColor.forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
      });
    });

    this.sidebarService.isSidebarOpen$.subscribe((isOpen) => {
      this.isToggled = isOpen;

      // Fermer le collapse si la sidebar est fermée
      if (!this.isToggled && this.isCollapsed) {
        this.isCollapsed = false;
      }
    });
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  // Fonction pour basculer le collapse
  toggleCollapse(event: Event) {
    event.preventDefault();
    this.isCollapsed = !this.isCollapsed;
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
    this.router.navigate(['new-projet']).then(() => {
      document.querySelectorAll('.nav-link').forEach((link) => {
        link.classList.remove('active');
      });
    });
  }
}
