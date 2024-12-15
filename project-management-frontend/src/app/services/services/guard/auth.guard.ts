import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../../token/token.service';
import { inject } from '@angular/core';
import { StorageUserService } from '../../storageUser/storage-user.service';

export const authGuard: CanActivateFn = (route) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const storageUserService = inject(StorageUserService);

  if (tokenService.isTokenNotValid()) {
    router.navigate(['login']);
    return false;
  }
  const userRole: string = storageUserService.getSavedUser()?.role || '';
  // eslint-disable-next-line @typescript-eslint/array-type
  const routeRoles = route.data['roles'] as string[];

  if (routeRoles && routeRoles.length > 0) {
    const hasRole = routeRoles.includes(userRole);
    if (!hasRole) {
      // Rediriger vers une page d'erreur ou la page d'accueil si l'utilisateur n'a pas les rôles requis
      router.navigate(['/forbidden']);
      return false;
    }
  }
  return true;
};
