/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { HelperService } from '../services/helper.service';
import { NavController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {

  user;
  passwordForm: FormGroup;
  error;

  error_messages = {
    'old_password': [
      { type: 'required', message: 'password is required.' },
      { type: 'minlength', message: 'password length.' },
      { type: 'maxlength', message: 'password length.' }
    ],
    'password': [
      { type: 'required', message: 'password is required.' },
      { type: 'minlength', message: 'password length.' },
      { type: 'maxlength', message: 'password length.' }
    ],
    'confirm_password': [
      { type: 'required', message: 'password is required.' },
      { type: 'minlength', message: 'password length.' },
      { type: 'maxlength', message: 'password length.' }
    ],
  };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private helper: HelperService,
    private navController: NavController
  ) {

    this.checkUser();
    this.passwordForm = fb.group({
      old_password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(30)
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(30)
      ])),
      confirm_password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(30)
      ])),
    }, {
      validators: [
        this.password.bind(this),
      ]
    });
  }

  password(formGroup: FormGroup) {
    const { value: password } = formGroup.get('password');
    const { value: confirm_password } = formGroup.get('confirm_password');
    return password === confirm_password ? null : { passwordNotMatch: true };
  }

  ngOnInit() {
  }

  async checkUser() {

    const { value: user }: any = await Preferences.get({ key: 'user_real' });
    this.user = JSON.parse(user);

    console.log('user', user);

  }

  changePassword() {
    this.error = '';
    this.helper.presentLoading();

    const params = this.passwordForm.value;
    params.user_id = this.user.id;
    console.log('params', this.user);

    this.authService.changePassword(params).subscribe(
      data => {

        console.log('data', data);
        this.helper.presentToast('Password Changed successfully');
        this.helper.dissmissLoading();

        this.navController.back();

      }, error => {
        this.error = error.error.message;
        console.log('login error', error);
        this.helper.presentToast(error.error.message);

        this.helper.dissmissLoading();
      });
  }

}
