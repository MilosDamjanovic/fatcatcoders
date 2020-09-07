import { AbstractControl } from '@angular/forms';

export class CustomValidators {

  public static passwordConfirming(c: AbstractControl): { matchPassword: boolean } {
    if (c.value && c.get('password').value !== c.get('repeatPassword').value) {
      return { matchPassword: true };
    }
  }

  /**
   * Password must have at least one big letter a number
   * @param c form control
   */
  public static passwordRules(c: AbstractControl): { pwdRules: boolean } {
    const pass = c.value || '';
    const variations = {
      digits: /\d/.test(pass),
      upper: /[A-Z]/.test(pass),
    };
    const result = variations.digits && variations.upper;
    if (!result) {
      return { pwdRules: true };
    }
  }
}
