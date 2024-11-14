import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private isSidebarOpen = new BehaviorSubject<boolean>(false); // false = sidebar fermée
  isSidebarOpen$ = this.isSidebarOpen.asObservable();

  toggleSidebar() {
    this.isSidebarOpen.next(!this.isSidebarOpen.value);
  }

  getSidebarState(): boolean {
    return this.isSidebarOpen.value;
  }
}
