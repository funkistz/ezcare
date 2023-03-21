import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';
import { HelperService } from '../services/helper.service';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  segment = 'customer';
  customerForm: FormGroup;
  staffForm: FormGroup;
  error;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthenticationService,
    private helper: HelperService,
  ) { }

  ngOnInit() {
    this.customerForm = this.fb.group({
      registration_number: ['', [Validators.required]],
      policy_number: ['', [Validators.required]],
    });

    this.staffForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    console.log('Segment changed', ev);
  }

  async customer_login() {

    this.error = '';
    this.helper.presentLoading();

    console.log(this.customerForm.value);

    this.authService.login(this.customerForm.value).subscribe(
      data => {
        console.log(data);
        this.helper.dissmissLoading();

        Preferences.set({
          key: 'user',
          value: JSON.stringify(data.data),
        });

        this.helper.presentToast('Login successful');
        this.router.navigateByUrl('/');
      }, error => {
        this.error = error.error.data;
        console.log(error);
        this.helper.presentToast(error.error.message);

        this.helper.dissmissLoading();
      });

    // this.router.navigateByUrl('/');
  }

  async staff_login() {

    this.error = '';
    this.helper.presentLoading();
    console.log(this.staffForm.value);

    this.authService.loginStaff(this.staffForm.value).subscribe(
      data => {
        console.log('login data', data);
        this.helper.dissmissLoading();

        data.data.last_login = new Date();

        Preferences.set({
          key: 'staff',
          value: JSON.stringify(data.data),
        });

        this.helper.presentToast('Login successful');
        this.router.navigateByUrl('/');
      }, error => {
        this.error = error.error.message;
        console.log('login error', error);
        this.helper.presentToast(error.error.message);

        this.helper.dissmissLoading();
      });

    // this.router.navigateByUrl('/');
  }

}
