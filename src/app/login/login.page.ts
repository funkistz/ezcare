/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';
import { HelperService } from '../services/helper.service';
import { Preferences } from '@capacitor/preferences';
import { ConfirmedValidator } from '../validators/confirmed.validator';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';

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
  customerRegisterForm: FormGroup = new FormGroup({});
  registerSuccess = false;
  needVerify = false;

  error_messages = {
    'registration_number': [
      { type: 'required', message: 'Registration number is required.' },
    ],

    'policy_number': [
      { type: 'required', message: 'Policy Number is required.' }
    ],

    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'minlength', message: 'Email length.' },
      { type: 'maxlength', message: 'Email length.' },
      { type: 'pattern', message: 'please enter a valid email address.' }
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
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthenticationService,
    private helper: HelperService,
  ) {

    // this.customerRegisterForm = fb.group({
    //   registration_number: new FormControl('QCL9193', Validators.compose([
    //     Validators.required
    //   ])),
    //   policy_number: new FormControl('PW003402', Validators.compose([
    //     Validators.required
    //   ])),
    //   email: new FormControl('funkistz@getnada.com', Validators.compose([
    //     Validators.required,
    //     Validators.minLength(6),
    //     Validators.maxLength(30)
    //   ])),
    //   confirm_email: new FormControl('funkistz@getnada.com', Validators.compose([
    //     Validators.required,
    //     Validators.minLength(6),
    //     Validators.maxLength(30)
    //   ])),
    //   password: new FormControl('123456', Validators.compose([
    //     Validators.required,
    //     Validators.minLength(6),
    //     Validators.maxLength(30)
    //   ])),
    //   confirm_password: new FormControl('123456', Validators.compose([
    //     Validators.required,
    //     Validators.minLength(6),
    //     Validators.maxLength(30)
    //   ])),
    // }, {
    //   validators: [
    //     this.password.bind(this),
    //     this.confirmEmail.bind(this),
    //   ]
    // });

    this.customerForm = this.fb.group({
      registration_number: ['', [Validators.required]],
      policy_number: ['', [Validators.required]],
    });

    // this.customerForm = this.fb.group({
    //   email: ['', [
    //     Validators.required,
    //     Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
    //   ]],
    //   password: ['', [Validators.required]],
    // });
  }

  ngOnInit() {

    Preferences.remove({
      key: 'is_indonesia',
    });


    // this.customerRegisterForm2 = this.fb.group({
    //   registration_number: ['', [Validators.required]],
    //   policy_number: ['', [Validators.required]],
    //   email: ['', [Validators.required]],
    //   password: ['', [
    //     Validators.required,
    //     Validators.pattern(
    //       /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/
    //     )
    //   ]],
    //   confirm_password: ['', [
    //     Validators.required,
    //     Validators.pattern(
    //       /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/
    //     )
    //   ]],
    // }, {
    //   validator: ConfirmedValidator('password', 'confirm_password')
    // });

    this.staffForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  password(formGroup: FormGroup) {
    const { value: password } = formGroup.get('password');
    const { value: confirm_password } = formGroup.get('confirm_password');
    return password === confirm_password ? null : { passwordNotMatch: true };
  }

  confirmEmail(formGroup: FormGroup) {
    const { value: email } = formGroup.get('email');
    const { value: confirm_email } = formGroup.get('confirm_email');
    return email === confirm_email ? null : { emailNotMatch: true };
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    console.log('Segment changed', ev);
  }

  customerSegment(ev: any) {
    this.segment = 'customer';
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
        Preferences.set({
          key: 'logged_in',
          value: moment().toISOString(),
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

  async customer_login_email() {

    console.log('this.customerForm', this.customerForm);

    this.error = '';
    this.helper.presentLoading();

    console.log(this.customerForm.value);

    this.authService.loginCustomerEmail(this.customerForm.value).subscribe(
      data => {
        console.log(data);
        this.helper.dissmissLoading();

        Preferences.set({
          key: 'user',
          value: JSON.stringify(data.policy),
        });
        Preferences.set({
          key: 'logged_in',
          value: moment().toISOString(),
        });
        Preferences.set({
          key: 'user_real',
          value: JSON.stringify(data.data),
        });

        this.helper.presentToast('Login successful');
        this.router.navigateByUrl('/');
      }, error => {

        if (error.error.verify) {
          this.needVerify = true;
          this.verifyEmail();
        }

        this.error = error.error.message;
        console.log('error', error.error);
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

  register(ev: any) {
    this.segment = 'register';
  }

  customer_register() {
    console.log(this.customerRegisterForm);

    this.error = '';
    this.helper.presentLoading();
    console.log(this.staffForm.value);

    this.authService.registerCustomer(this.customerRegisterForm.value).subscribe(
      data => {
        console.log('register data', data);
        this.segment = 'customer';
        this.registerSuccess = true;

        this.helper.dissmissLoading();

        // this.router.navigateByUrl('/');

      }, error => {
        this.error = error.error.message;
        console.log('login error', error);
        this.helper.presentToast(error.error.message);

        this.helper.dissmissLoading();
      });
  }

  get f() {
    return this.customerRegisterForm.controls;
  }

  async verifyEmail() {
    const alert = await this.alertController.create({
      header: 'Verify Your Email?',
      message: 'Please verify your email address before login!',
      inputs: [
        {
          placeholder: 'Email',
          value: this.customerForm.value.email
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            // this.handlerMessage = 'Alert canceled';
          },
        },
        {
          text: 'send verification',
          role: 'confirm',
          handler: (e) => {
            console.log('verify', e);

            if (e[0]) {

              this.authService.sendVerificationEmail({ email: e[0] }).subscribe(
                data => {
                  console.log('data', data);
                  this.helper.dissmissLoading();

                  // this.helper.presentToast('Login successful');
                }, error => {

                  this.error = error.error.message;
                  console.log('error', error.error);
                  this.helper.presentToast(error.error.message);

                  this.helper.dissmissLoading();
                });

            } else {
              this.verifyEmail();
            }

            // this.handlerMessage = 'Alert confirmed';


          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
  }

  goToIndonesiaPage() {
    this.router.navigateByUrl('/loginv2');
  }
}
