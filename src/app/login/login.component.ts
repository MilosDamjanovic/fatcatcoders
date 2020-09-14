import { SnackbarService } from './../core/services/snackbar.service';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { OAuthService } from './../core/services/oauth.service';
import { Component, OnInit } from '@angular/core';
import { UserReq } from '../core/models/user.model';
import { Router } from '@angular/router';
import { LoaderService } from '../core/services/loader.service';

@Component({
  selector: 'ttd-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public form: FormGroup;

  constructor(
    private oAuthService: OAuthService,
    private router: Router,
    private snackbarService: SnackbarService,
    private loader: LoaderService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  public register(): void {
    this.router.navigate(['/signup']);
  }

  public login() {
    const formData = this.form.value as UserReq;
    if (!this.form.valid) {
      return;
    }
    this.loader.show();
    this.oAuthService.login(formData)
      .subscribe({
        next: this.handleSuccessLogin.bind(this),
        error: this.handleFailedLogin.bind(this)
      });
  }

  private handleSuccessLogin(authenticated: boolean): void {
    if (authenticated) {
      this.oAuthService.setIsAuthenticated(true);
      this.router.navigateByUrl('/dashboard');
    } else {
      this.handleFailedLogin({ err: 'Login credentials not correct' });
    }
  }

  private handleFailedLogin(err: any): void {
    console.error(err);
    this.loader.hide();
    this.snackbarService.notify('INVALID LOGIN CREDENTIALS, PLEASE TRY AGAIN LATER');
  }

  public getEmailErrorMessage() {
    if (this.emailControl.hasError('required')) {
      return 'You must enter an email address.';
    }
    if (this.emailControl.hasError('email')) {
      return 'You must enter a valid email address.';
    }
  }

  public getPasswordErrorMessage() {
    if (this.passwordControl.hasError('required')) {
      return 'You must enter your password.';
    }
    if (this.passwordControl.errors && this.passwordControl.errors.actualLength < 8) {
      return 'Password must contain at least 8 characters.';
    }
  }

  get emailControl(): AbstractControl {
    return this.form.controls.email;
  }

  get passwordControl(): AbstractControl {
    return this.form.controls.password;
  }
}
