import { Injectable } from '@angular/core';
import { UserResponse } from '../models';

const USER_KEY = 'authenticated-user';

@Injectable({
  providedIn: 'root'
})
export class StorageUserService {

  constructor() { }

  saveUser(user: UserResponse) {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  getSavedUser(): UserResponse | null {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  clean(): void {
    window.localStorage.clear();
  }

  isAuthenticated(): boolean {
    return this.getSavedUser() !== null;
  }

  hasRole(role: string): boolean {
    const user = this.getSavedUser();
    if (user && user.roles) {
      return user.roles.includes(role);
    }
    return false;
  }
}
