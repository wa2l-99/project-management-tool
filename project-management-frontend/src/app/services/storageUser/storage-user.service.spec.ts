import { TestBed } from '@angular/core/testing';
import { StorageUserService } from './storage-user.service';
import { UserResponse } from '../models';

describe('StorageUserService', () => {
  let service: StorageUserService;
  let mockUser: UserResponse;

  beforeEach(() => {
    // Configuration du TestBed avant chaque test
    TestBed.configureTestingModule({
      providers: [StorageUserService],
    });

    // Réinitialisation du localStorage avant chaque test
    localStorage.clear();

    // Instance du service
    service = TestBed.inject(StorageUserService);

    // Création d'un utilisateur mock pour les tests
    mockUser = {
      id: 1,
      nom: 'Doe',
      prenom: 'John',
      email: 'test@example.com',
      role: 'ADMIN',
    };
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveUser', () => {
    it('should save user to localStorage', () => {
      service.saveUser(mockUser);

      const savedUser = JSON.parse(localStorage.getItem('authenticated-user')!);
      expect(savedUser).toEqual(mockUser);
    });

    it('should replace existing user in localStorage', () => {
      // Sauvegarde d'un premier utilisateur
      const firstUser = { ...mockUser, username: 'firstuser' };
      service.saveUser(firstUser);

      // Sauvegarde d'un second utilisateur
      service.saveUser(mockUser);

      const savedUser = JSON.parse(localStorage.getItem('authenticated-user')!);
      expect(savedUser).toEqual(mockUser);
    });
  });

  describe('getSavedUser', () => {
    it('should return saved user', () => {
      localStorage.setItem('authenticated-user', JSON.stringify(mockUser));

      const retrievedUser = service.getSavedUser();
      expect(retrievedUser).toEqual(mockUser);
    });

    it('should return null if no user is saved', () => {
      const retrievedUser = service.getSavedUser();
      expect(retrievedUser).toBeNull();
    });
  });

  describe('clean', () => {
    it('should clear localStorage', () => {
      localStorage.setItem('authenticated-user', JSON.stringify(mockUser));
      service.clean();

      expect(localStorage.getItem('authenticated-user')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is saved', () => {
      service.saveUser(mockUser);

      expect(service.isAuthenticated()).toBeTruthy();
    });

    it('should return false when no user is saved', () => {
      expect(service.isAuthenticated()).toBeFalsy();
    });
  });

  describe('hasRole', () => {
    it('should return true when user has specified role', () => {
      service.saveUser(mockUser);

      expect(service.hasRole('ADMIN')).toBeTruthy();
      expect(service.hasRole('USER')).toBeFalsy();
    });

    it('should return false when user has no role', () => {
      const userWithNoRole = { ...mockUser, role: '' };
      service.saveUser(userWithNoRole);

      expect(service.hasRole('ADMIN')).toBeFalsy();
    });

    it('should return false when no user is saved', () => {
      expect(service.hasRole('ADMIN')).toBeFalsy();
    });
  });

  describe('noRole', () => {
    it('should return true when user has no role', () => {
      const userWithNoRole = { ...mockUser, role: '' };
      service.saveUser(userWithNoRole);

      expect(service.noRole()).toBeTruthy();
    });

    it('should return false when user has roles', () => {
      service.saveUser(mockUser);

      expect(service.noRole()).toBeFalsy();
    });

    it('should return true when no user is saved', () => {
      expect(service.noRole()).toBeTruthy();
    });
  });
});
