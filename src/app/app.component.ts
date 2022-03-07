import { Component } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { AuthenticationService } from './services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  user;
  staff;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
  ) {

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // Show loading indicator
        console.log(event.url);

        if (event.url != '/login') {
          this.checkUser();
        }

      }

      if (event instanceof NavigationEnd) {
        // Hide loading indicator
        console.log(event);
      }

      if (event instanceof NavigationError) {
        // Hide loading indicator

        // Present error to user
        console.log(event.error);
      }
    });

  }

  async checkUser(event = null, policy_id = null) {

    this.user = null;
    this.staff = null;

    let { value }: any = await Storage.get({ key: 'user' });
    let user = value;

    if (!user) {
      let { value }: any = await Storage.get({ key: 'staff' });
      let staff = value;

      if (staff) {
        this.staff = JSON.parse(staff);
        console.log('staff', this.staff);

        this.checkStaff(this.staff.user_name, this.staff.user_password, this.staff.last_login);

        return 'staff';
      } else {
        this.logout();
        return 'guest';
      }

    } else {

      user = JSON.parse(user);
      this.user = user;
      console.log(this.user.cust_id);

      return 'user';
    }
  }

  checkStaff(username, password, last_login = null) {

    last_login = new Date(last_login);
    console.log('last_login', last_login);
    let current: any = new Date();
    let diff: any = (current - last_login) / 1000;
    console.log('diff', diff);

    // if (diff > 300) {
    //   this.logout();
    //   return;
    // }

    this.authService.loginStaff({
      username, password
    }).subscribe(
      data => {
        console.log('login data', data);
        data.data.last_login = new Date();

        Storage.set({
          key: 'staff',
          value: JSON.stringify(data.data),
        });

      }, error => {
        console.log('login error', error);
      });

  }

  logout() {
    Storage.remove({ key: 'user' });
    Storage.remove({ key: 'staff' });
    this.router.navigate(['/login']);
  }


}
