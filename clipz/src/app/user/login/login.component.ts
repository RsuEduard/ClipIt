import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  credentials = {
    email: '',
    password: '',
  };

  showAlert: boolean = false;
  alertMsg = 'Please wait! You are being logged in.';
  alertColor = 'blue';
  inSubmission: boolean = false;

  constructor(private auth: AngularFireAuth) {}

  async login() {
    this.alertMsg = 'Please wait! You are being logged in.';
    this.alertColor = 'blue';
    this.showAlert = true;

    this.inSubmission = true;
    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      );
    } catch (e) {
      this.alertMsg = 'Something went wrong. Please try again later';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }
    this.alertMsg = 'Log in successfull.';
    this.alertColor = 'green';
  }
}
