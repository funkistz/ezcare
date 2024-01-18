/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { HelperService } from '../services/helper.service';
import { Apiv2Service } from '../services/apiv2.service';
import { Preferences } from '@capacitor/preferences';
import * as moment from 'moment';

@Component({
  selector: 'app-loginv2',
  templateUrl: './loginv2.page.html',
  styleUrls: ['./loginv2.page.scss'],
})
export class Loginv2Page implements OnInit {

  customerForm: FormGroup;
  error;
  error_messages = {
    'registration_number': [
      { type: 'required', message: 'Registration number is required.' },
    ],

    'policy_number': [
      { type: 'required', message: 'Policy Number is required.' }
    ],

    'username': [
      { type: 'required', message: 'Username is required.' },
      { type: 'minlength', message: 'Username length.' },
      { type: 'maxlength', message: 'Username length.' },
      // { type: 'pattern', message: 'please enter a valid email address.' }
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
    private helper: HelperService,
    private apiv2: Apiv2Service,
  ) {
    this.customerForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    Preferences.set({
      key: 'is_indonesia',
      value: moment().toISOString(),
    });
  }

  async customer_login() {

    console.log('this.customerForm', this.customerForm);

    this.error = '';
    this.helper.presentLoading();

    console.log(this.customerForm.value);

    this.apiv2.post('auth/login', this.customerForm.value).subscribe(
      data => {
        this.helper.dissmissLoading();

        if (data.status === 'error') {
          this.helper.presentToast(data.message);
        } else {
          Preferences.set({
            key: 'user',
            value: JSON.stringify(data.data),
          });
          // console.log('user', JSON.stringify(data.data));
          Preferences.set({
            key: 'logged_in',
            value: moment().toISOString(),
          });
          Preferences.set({
            key: 'is_indonesia',
            value: moment().toISOString(),
          });

          this.helper.presentToast('Login successful');
          this.router.navigateByUrl('/');
        }
      }, error => {
        this.helper.dissmissLoading();
        this.helper.presentToast('Some error occured.');
      });

  }

  goToMalaysiaPage() {
    this.router.navigateByUrl('/login');
  }
}
