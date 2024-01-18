import { Component, OnInit } from '@angular/core';
import { Apiv2Service } from '../services/apiv2.service';
import { Preferences } from '@capacitor/preferences';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { HelperService } from '../services/helper.service';


@Component({
  selector: 'app-servicev2',
  templateUrl: './servicev2.page.html',
  styleUrls: ['./servicev2.page.scss'],
})
export class Servicev2Page implements OnInit {

  user;
  banners = [];
  settings: any = [];
  policies: any = [];
  mainPolicy;

  constructor(
    private apiv2: Apiv2Service,
    private callNumber: CallNumber,
    public helper: HelperService,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.checkUser();
  }

  async checkUser(event = null) {

    this.user = null;
    const { value }: any = await Preferences.get({ key: 'user' });
    let user = value;
    user = JSON.parse(user);
    this.user = user;

    console.log('this.user', this.user);
    this.getPolicyV2(user.customer.id);
  }

  async getPolicyV2(id) {
    this.apiv2.get('customers/' + id + '/policies', {}).subscribe(
      data => {
        console.log('policy', data);
        this.policies = data.data;

        if (data.data && data.data[0]) {
          this.mainPolicy = data.data[0];
        }
      }, error => {

      });
  }

}
