import { Component } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AuthenticationService } from './services/authentication.service';
import { initializeApp } from 'firebase/app';
import { indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  user;
  staff;
  loggedIn;
  appVersion = 105000;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private alertController: AlertController
  ) {

    const app = initializeApp(environment.firebaseConfig);
    if (Capacitor.isNativePlatform) {
      initializeAuth(app, {
        persistence: indexedDBLocalPersistence
      });
    }

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // Show loading indicator
        // console.log(event.url);

        this.getGenerals();

        if (event.url != '/login') {
          this.checkUser();
        }

      }

      if (event instanceof NavigationEnd) {
        // Hide loading indicator
        // console.log(event);
      }

      if (event instanceof NavigationError) {
        // Hide loading indicator

        // Present error to user
        console.log(event.error);
      }
    });

  }

  async checkUser(event = null) {

    this.user = null;
    this.staff = null;
    this.loggedIn = null;

    const { value: loggedIn }: any = await Preferences.get({ key: 'logged_in' });
    const { value: staff }: any = await Preferences.get({ key: 'staff' });
    let { value: user }: any = await Preferences.get({ key: 'user' });

    console.log('loggedIn', loggedIn);

    if (!loggedIn && !staff) {
      this.logout();
    }

    if (user) {

      user = JSON.parse(user);
      this.user = user;
      console.log(this.user.cust_id);

      return 'user';

    } else if (staff) {

      this.staff = JSON.parse(staff);
      this.checkStaff(this.staff.user_name, this.staff.user_password, this.staff.last_login);

      return 'staff';

    } else {
      this.logout();
      return 'guest';
    }
  }

  checkStaff(username, password, last_login = null) {

    last_login = new Date(last_login);
    // console.log('last_login', last_login);
    let current: any = new Date();
    let diff: any = (current - last_login) / 1000;
    // console.log('diff', diff);

    // if (diff > 300) {
    //   this.logout();
    //   return;
    // }

    this.authService.loginStaff({
      username, password
    }).subscribe(
      data => {
        // console.log('login data', data);
        data.data.last_login = new Date();

        Preferences.set({
          key: 'staff',
          value: JSON.stringify(data.data),
        });

      }, error => {
        console.log('login error', error);
      });

  }

  logout() {
    Preferences.remove({ key: 'user' });
    Preferences.remove({ key: 'staff' });
    Preferences.remove({ key: 'logged_in' });
    this.router.navigate(['/login']);
  }


  async getGenerals() {

    this.authService.getSettings().subscribe(
      async data => {


        if (data && data.data) {
          console.log('getGenerals', data.data);

          let version = data.data.find((element) => element.name === 'app_version');

          if (version) {
            version = Number(version.value);
            console.log('current version', this.appVersion);
            console.log('version', version);

            if (version > this.appVersion) {
              console.log('please update');

              const alert = await this.alertController.create({
                header: 'Your application is out of date!',
                // subHeader: '',
                message: 'Please update your application to continue.',
                // buttons: ['OK'],
                backdropDismiss: false
              });

              await alert.present();
            }

          }


        }

        console.log(data);
      }, error => {
        console.log(error);
      });

  }
}
