import { SnackbarService } from './../core/services/snackbar.service';
import { CustomValidators } from './../helper/custom-validators';
import { UserService } from './../core/services/user.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { LoaderService } from '../core/services/loader.service';

@Component({
  selector: 'ttd-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  public form: FormGroup;

  constructor(private fb: FormBuilder,
              private router: Router,
              private loader: LoaderService,
              private userService: UserService,
              private snackbarService: SnackbarService
              ) { }

  ngOnInit() {
      this.form = this.initForm();
  }

  private initForm(): FormGroup {
    return this.fb.group({
      fname: ['', [Validators.required, Validators.minLength(3)]],
      lname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), CustomValidators.passwordRules]],
      repeatPassword: ['', [Validators.required]],
      addressLine: ['', [Validators.required]],
      gender: ['', [Validators.required]]
    }, { validator: CustomValidators.passwordConfirming});
  }

  private validateAllFormFields(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  public register(): void {
    const data = this.form.value;
    if (!this.form.valid) {
      this.validateAllFormFields(this.form);
      this.handleFailedRegistration({message: 'Please fill out all of the required fields.'})
      return;
    }
    this.loader.show();
    this.userService.createUser(data).subscribe({
      next: this.handleSuccessRegistration.bind(this),
      error: this.handleFailedRegistration.bind(this)
    });
  }

  public getEmailErrorMessage(): string {
    if (this.emailControl.hasError('required')) {
      return 'You must enter an email address.';
    }
    if (this.emailControl.hasError('email')) {
      return 'You must enter a valid email address.';
    }
  }

  public getFullNameErrorMessage(): string {
    if (this.lnameControl.hasError('required') || this.fnameControl.hasError('required')) {
      return 'You must enter your firs and last name.';
    }
  }

  public getAddressLineErrorMessage(): string {
    if (this.addressLineControl.hasError('required')) {
      return 'You must enter your address.';
    }
  }

  public getGenderErrorMessage(): string {
    if (this.genderControl.hasError('required') && this.genderControl.dirty) {
      return 'You must enter your gender or select other if you don\'t want to declare yourself.';
    }
  }

  public getPasswordErrorMessage(): string {
    if (this.passwordControl.hasError('required')) {
      return 'You must enter your password data.';
    }
    if (this.passwordControl?.errors && this.passwordControl?.errors?.actualLength < 8) {
      return 'Password must contain at least 8 characters.';
    }
    if (this.passwordControl.errors?.pwdRules) {
      return 'Password must have at least one capital letter, one number and at least 8 characters.';
    }
  }

  getRepeatPasswordErrorMessage(): string {
    if (this.repeatPasswordControl.hasError('required')) {
      return 'You must enter your repeat password.';
    }
    if (this.form.hasError('matchPassword')) {
      this.repeatPasswordControl.setErrors({invalid: true});
      return 'Repeat password doesn\'t match your password.';
    }
  }

  private handleSuccessRegistration(value: any): void {
    this.snackbarService.notify('Successfully registered to use FatCatCoders Application');
    this.router.navigateByUrl('/login');
    this.loader.hide();
  }

  private handleFailedRegistration(err: any): void {
    this.snackbarService.notify(err.message);
    this.loader.hide();
    console.error('Failed registration', err);
  }

  get emailControl(): AbstractControl {
    return this.form.controls.email;
  }

  get repeatPasswordControl(): AbstractControl {
    return this.form.controls.repeatPassword;
  }

  get passwordControl(): AbstractControl {
    return this.form.controls.password;
  }

  get addressLineControl(): AbstractControl {
    return this.form.controls.addressLine;
  }

  get lnameControl(): AbstractControl {
    return this.form.controls.lname;
  }

  get fnameControl(): AbstractControl {
    return this.form.controls.fname;
  }

  get genderControl(): AbstractControl {
    return this.form.controls.gender;
  }

  get formErrors(): ValidationErrors {
    return this.form.errors;
  }

}
