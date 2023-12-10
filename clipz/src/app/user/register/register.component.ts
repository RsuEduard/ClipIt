import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IUser from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl('', [Validators.required, Validators.email]);
  age = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(18),
    Validators.max(120),
  ]);
  password = new FormControl('', [
    Validators.required,
    Validators.pattern('^(?=.*d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$'),
  ]);
  confirmPassword = new FormControl('', [Validators.required]);
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(12),
    Validators.maxLength(12),
  ]);

  registerFrom = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirmPassword: this.confirmPassword,
    phoneNumber: this.phoneNumber,
  });

  inSubmission: boolean = false;
  showAlert: boolean = false;
  alertMsg = 'Please wait! Your account is being created.';
  alertColor = 'blue';

  constructor(private authService: AuthService) {}

  async register() {
    this.inSubmission = true;
    this.showRegistrationAlert();

    try {
      await this.authService.createUser(this.registerFrom.value as IUser);
    } catch (e) {
      this.alertMsg = 'An unexpected error occured. Please try again later';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }

    this.alertMsg = 'Success! Your account has been created.';
    this.alertColor = 'green';
  }

  private showRegistrationAlert(): void {
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your account is being created.';
    this.alertColor = 'blue';
  }
}
