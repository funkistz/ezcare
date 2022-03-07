import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { Router } from '@angular/router';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HelperService } from '../services/helper.service';

@Component({
  selector: 'app-starter',
  templateUrl: './starter.page.html',
  styleUrls: ['./starter.page.scss'],
})
export class StarterPage implements OnInit {

  user;
  staff;

  constructor(
    private router: Router,
    private firestore: AngularFirestore,
    private helper: HelperService,
  ) { }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.checkUser();

    this.startPushNotification();
  }

  startPushNotification() {

    console.log('Initializing HomePage');

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: Token) => {
        // alert('Push registration success, token: ' + token.value);

        if (this.staff) {
          let data = this.staff;
          data.token = token.value;

          console.log('this.staff.staff_id', this.staff.staff_id);
          this.firestore.collection('/staffs/').doc('staff_' + this.staff.staff_id).set(data, { merge: true }).then(() => {
            console.log('success');
          }).catch(error => {

            this.helper.presentToast('Sorry, there is some error occured when assigning push notification.');

          });
        } else if (this.user) {

          let data = this.user;
          data.token = token.value;

          let id = this.user.cust_ic.replace(/[^0-9]/g, '');
          console.log('customers', id);

          this.firestore.collection('/customers/').doc(id).set(data, { merge: true }).then(() => {
            console.log('success');
          }).catch(error => {

            this.helper.presentToast('Sorry, there is some error occured when assigning push notification.');

          });
        }

      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        // alert('Error on registration: ' + JSON.stringify(error));
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        // alert('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        // alert('Push action performed: ' + JSON.stringify(notification));
      }
    );

  }

  async checkUser(event = null, policy_id = null) {

    let { value }: any = await Storage.get({ key: 'user' });
    this.user = JSON.parse(value);
    console.log('enter user', this.user);

    if (!this.user) {
      let { value }: any = await Storage.get({ key: 'staff' });
      this.staff = JSON.parse(value);

      if (this.staff) {
        console.log('enter staff');
        this.router.navigateByUrl('/staff-tabs/staff-home');
      } else {
        this.router.navigateByUrl('/login');
      }


    } else {
      this.router.navigateByUrl('/tabs');
    }
  }

}
