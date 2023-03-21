import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  slideOpts = {
    initialSlide: 1,
    speed: 400
  };

  user;
  staff;

  constructor(private router: Router) {

    // console.log('hello');

    this.checkLogged();

  }

  async checkLogged() {

    // console.log('hello cc');

    let { value }: any = await Preferences.get({ key: 'user' });
    let user = value;

    if (!user) {

      let { value }: any = await Preferences.get({ key: 'staff' });
      let staff = value;

      if (!staff) {
        this.router.navigate(['/login']);
      } else {
        this.staff = staff;
      }

    } else {
      this.user = user;
    }

    // if (!user) {
    //   this.router.navigate(['/login']);
    // }

  }

}
