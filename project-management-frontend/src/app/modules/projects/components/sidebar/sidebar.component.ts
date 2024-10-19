import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../../../services/sidebarService/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  isToggled: boolean = false;
  isCollapsed: boolean = false;

  constructor(private sidebarService: SidebarService) {}

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
}
