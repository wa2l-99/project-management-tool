import { Component } from '@angular/core';
import { RegistrationRequest } from '../../services/models';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  errorMsg: string[] = [];
  registerRequest: RegistrationRequest = {
    email: '',
    nom: '',
    prenom: '',
    password: '',
  };

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private toastr: ToastrService
  ) {}

  login() {
    this.router.navigate(['login']);
  }
  register() {
    this.errorMsg = [];
    this.authService.register({ body: this.registerRequest }).subscribe({
      next: () => {
        this.toastr.success(
          'Votre inscription a été réussie ! Vous pouvez maintenant accéder à votre compte.',
          'Succès'
        );
        this.registerRequest = {
          email: '',
          nom: '',
          prenom: '',
          password: '',
        };
      },
      error: (err) => {
        if (err.error && Array.isArray(err.error.validationErrors)) {
          this.errorMsg = err.error.validationErrors;
          this.errorMsg.forEach((error: string) => {
            this.toastr.error(error, 'Erreur de validation');
          });
        } else if (err.error.error) {
          this.toastr.error(err.error.error, 'Erreur');
        } else {
          this.toastr.error("Une erreur inattendue s'est produite", 'Erreur');
        }
      },
    });
  }
}
