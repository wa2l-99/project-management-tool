import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  isToggled: boolean = false;
  isCollapsed: boolean = false;

  constructor() {}

  // Fonction pour basculer le collapse
  toggleCollapse(event: Event) {
    event.preventDefault();
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSidebar() {
    this.isToggled = !this.isToggled;

    // Si la sidebar est fermée et qu'un collapse est ouvert, ferme le collapse
    if (this.isToggled && this.isCollapsed) {
      this.isCollapsed = false;
    }
  }
}
