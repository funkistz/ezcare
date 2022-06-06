import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LaunchNavigator, LaunchNavigatorOptions } from '@awesome-cordova-plugins/launch-navigator/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-workshop-details',
  templateUrl: './workshop-details.component.html',
  styleUrls: ['./workshop-details.component.scss'],
})
export class WorkshopDetailsComponent implements OnInit {

  @Input() public workshop;
  constructor(
    private modalCtrl: ModalController,
    private launchNavigator: LaunchNavigator,
    private callNumber: CallNumber,
  ) { }

  ngOnInit() {

    console.log(this.workshop);
  }

  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  navigate(workshop) {
    let destination = [workshop.latitude, workshop.longitude];
    this.launchNavigator.navigate(destination)
      .then(
        success => console.log('Launched navigator'),
        error => console.log('Error launching navigator', error)
      );
  }

  call(phone) {

    phone = phone.replace(/\D/g, '');
    console.log('calling...', phone);

    this.callNumber.callNumber(phone, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));

  }
}
