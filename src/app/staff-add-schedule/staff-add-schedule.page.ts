import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationService } from '../services/authentication.service';
import { HelperService } from '../services/helper.service';
import { Platform, LoadingController, ToastController, ActionSheetController, AlertController } from '@ionic/angular';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { NavController } from '@ionic/angular';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import * as moment from 'moment';

@Component({
  selector: 'app-staff-add-schedule',
  templateUrl: './staff-add-schedule.page.html',
  styleUrls: ['./staff-add-schedule.page.scss'],
})
export class StaffAddSchedulePage implements OnInit {

  numbering = [
    '1st',
    '2nd',
    '3rd'
  ];
  loading;
  loadingText = '';
  ionicForm: FormGroup;
  staff: any = {};
  staffs = [];
  inspectImages = [];
  inspectImagesUrl = [];
  // File upload task 
  fileUploadTask: AngularFireUploadTask;
  // Upload progress
  percentageVal: Observable<number>;
  // Track file uploading with snapshot
  trackSnapshot: Observable<any>;

  resizedBase64;

  inspection;
  inspection_id;

  remarks;
  warrantyPlans;
  periods;
  promos;
  inspection_types;
  editable = false;
  claimCase = false;
  dealers = [];
  dealer;

  inspectionsTemp;
  timevalid = true;

  loadingPolicy = false;
  policy;

  constructor(
    public formBuilder: FormBuilder,
    private firestore: AngularFirestore,
    private authService: AuthenticationService,
    public helper: HelperService,
    private actionSheetCtrl: ActionSheetController,
    public alertController: AlertController,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private photoViewer: PhotoViewer,
  ) {

  }

  ngOnInit() {

    this.ionicForm = this.formBuilder.group({
      reminder_date: ['', [Validators.required]],
      branch: ['', [Validators.required]],
      dealer: ['', [Validators.required]],
      inspection_type: ['', [Validators.required]],
      no_of_vehicle: ['', [Validators.required]],
      marketing_officer: ['', [Validators.required]],
      person_in_charge: ['', []],
      date: ['', []],
      remarks: ['', []],
      policy_no: ['', []],
      location: ['', []],
      policy_found: ['', []],
      warranty_plan: ['', [Validators.required]],
      period: ['', [Validators.required]],
      promo: ['', []],
    });

    this.getStaff();
    this.helper.getStaffs();

    this.route.queryParams.subscribe(params => {
      if (params && params.inspection_id) {
        this.inspection_id = params.inspection_id;
        console.log(this.inspection_id);

        // this.getStaffs();
        this.getInspection(this.inspection_id);

      } else {
        // this.getStaffs();
        this.getTasks();
      }
    });

  }

  getTasks() {

    // this.helper.presentLoading();

    return this.firestore.collection('schedule_inspections', ref => ref.orderBy('date', 'desc')).snapshotChanges().subscribe((res) => {

      this.helper.dissmissLoading();

      this.inspectionsTemp = res.map((t) => {

        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as any
        };
      });

      console.log('inspectionsTemp', this.inspectionsTemp);

    }, err => {
      this.helper.dissmissLoading();
      console.log('inspections err', err);
    });
  }

  async getStaff() {
    let { value }: any = await Preferences.get({ key: 'staff' });
    this.staff = JSON.parse(value);
    console.log('staff', this.staff);
  }

  getInspection(id) {

    this.inspection = null;
    this.loading = true;
    this.loadingText = 'Please wait ';

    return this.firestore.collection('schedule_inspections').doc(id).valueChanges().subscribe((data: any) => {

      this.inspection = data;
      if (data) {

        if (data.inspection_type == 'Claim Case') {
          this.claimCase = true;
        }
        this.ionicForm.controls['inspection_type'].setValue(data.inspection_type);

        if (data.reminder_date) {
          let date = data.reminder_date.toDate();
          date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
          date = date.toISOString().slice(0, 16);
          console.log('date', date);
          this.ionicForm.controls["reminder_date"].setValue(date);
        }

        if (data.policy_no) {
          this.ionicForm.controls['policy_no'].setValue(data.policy_no);
          this.checkPolicyNo(data.policy_no);
        }

        if (data.branch) {
          this.ionicForm.controls['branch'].setValue(data.branch.branch);
        }

        if (data.marketing_officer) {
          this.ionicForm.controls['marketing_officer'].setValue(data.marketing_officer.name);
        }

        if (data.person_in_charge) {
          this.ionicForm.controls['person_in_charge'].setValue(data.person_in_charge.name);
        }

        if (data.dealer) {
          this.ionicForm.controls['dealer'].setValue(data.dealer.name);
        }

        if (data.no_of_vehicle) {
          this.ionicForm.controls['no_of_vehicle'].setValue(data.no_of_vehicle);
        }

        if (data.location) {
          this.ionicForm.controls['dealer'].setValue(data.location);
        }

        if (data.remarks) {
          this.ionicForm.controls['remarks'].setValue(data.remarks);
        }

        if (data.location) {
          this.ionicForm.controls['location'].setValue(data.location);
        }


        // this.ionicForm.controls['vehicle'].setValue(data.vehicle);
        // this.ionicForm.controls['mileage'].setValue(data.mileage);
        // this.ionicForm.controls['warranty_plan'].setValue(data.warranty_plan);
        // this.ionicForm.controls['chassis'].setValue(data.chassis);
        // this.ionicForm.controls['remarks'].setValue(data.remarks);
        // this.ionicForm.controls['person_in_charge'].setValue(data.person_in_charge);
        // this.ionicForm.controls['period'].setValue(data.period);
        // this.ionicForm.controls['promo'].setValue(data.promo);
        // this.ionicForm.controls['inspection_type'].setValue(data.inspection_type);

        // this.ionicForm.controls['policy_no'].setValue(data.policy_no);

        // if (data.inspection_type == "Claim Case") {
        //   this.inspectionTypeChange(null, true);
        // } else {
        //   this.inspectionTypeChange(null, false);
        // }

        // if (!this.inspection_id || this.editable) {
        //   this.ionicForm.controls['marketing_officer'].setValue(data.marketing_officer);
        // } else {
        //   this.ionicForm.controls['marketing_officer'].setValue(data.marketing_officer.id);
        // }

      }

      this.loading = false;

      if ((data.status == 'booked' || data.status == 'pending') && (this.staff.staff_id == data.marketing_officer.id || this.staff.user_id == data.created_by || this.staff.user_role == 6)) {
        // this.editable = true;
        // this.inspection_id = null;
      }

      console.log(this.inspection);
      this.getTasks();

      // console.log('data.marketing_officer', data.marketing_officer);
    });
  }

  updateInspection() {
    this.editable = true;
    this.ionicForm.controls['branch'].setValue(this.inspection.branch);
    this.ionicForm.controls['dealer'].setValue(this.inspection.dealer);
    this.ionicForm.controls['marketing_officer'].setValue(this.inspection.marketing_officer);
    this.ionicForm.controls['person_in_charge'].setValue(this.inspection.person_in_charge);
    this.ionicForm.controls['warranty_plan'].setValue(this.inspection.warranty_plan);
    this.ionicForm.controls['period'].setValue(this.inspection.period);
    this.ionicForm.controls['promo'].setValue(this.inspection.promo);
  }

  cancelUpdateInspection() {
    this.editable = false;
    this.ionicForm.controls['branch'].setValue(this.inspection.branch.branch);
    this.ionicForm.controls['dealer'].setValue(this.inspection.dealer.name);
    this.ionicForm.controls['marketing_officer'].setValue(this.inspection.marketing_officer.name);
    this.ionicForm.controls['person_in_charge'].setValue(this.inspection.person_in_charge.name);
  }

  inspectionTypeChange(event, isClaim = false) {
    // console.log('inspectionTypeChange', event.detail.value);

    if (event && event.detail && event.detail.value == 'Claim Case') {
      isClaim = true;
    }

    if (isClaim) {
      console.log('is Claim Case');
      this.claimCase = true;
      this.ionicForm.get('policy_no').setValidators([Validators.required]);
      this.ionicForm.get('location').setValidators([Validators.required]);
      this.ionicForm.get('policy_found').setValidators([Validators.required]);

      this.ionicForm.get('marketing_officer').setValidators([]);
      this.ionicForm.get('dealer').setValidators([]);
      this.ionicForm.get('no_of_vehicle').setValidators([]);
      this.ionicForm.get('warranty_plan').setValidators([]);
      this.ionicForm.get('period').setValidators([]);
      this.ionicForm.get('promo').setValidators([]);

    } else {

      this.claimCase = false;
      this.ionicForm.get('policy_no').setValidators([]);
      this.ionicForm.get('location').setValidators([]);
      this.ionicForm.get('policy_found').setValidators([]);

      this.ionicForm.get('marketing_officer').setValidators([Validators.required]);
      this.ionicForm.get('dealer').setValidators([Validators.required]);
      this.ionicForm.get('no_of_vehicle').setValidators([Validators.required]);
      this.ionicForm.get('warranty_plan').setValidators([Validators.required]);
      this.ionicForm.get('period').setValidators([Validators.required]);
      this.ionicForm.get('promo').setValidators([Validators.required]);

    }

    this.ionicForm.get('policy_no').updateValueAndValidity();
    this.ionicForm.get('location').updateValueAndValidity();
    this.ionicForm.get('policy_found').updateValueAndValidity();
    this.ionicForm.get('marketing_officer').updateValueAndValidity();
    this.ionicForm.get('dealer').updateValueAndValidity();
    this.ionicForm.get('no_of_vehicle').updateValueAndValidity();
    this.ionicForm.get('warranty_plan').updateValueAndValidity();
    this.ionicForm.get('period').updateValueAndValidity();
    this.ionicForm.get('promo').updateValueAndValidity();

  }

  getStaffs() {

    this.helper.presentLoading();

    this.authService.getStaffs().subscribe(
      (data: any) => {
        this.helper.dissmissLoading();
        console.log('getStaffs', data);

        if (data && data.data) {

          this.staffs = [];

          data.data.forEach(staff => {

            this.staffs.push({
              id: staff.id,
              name: staff.name,
            });

          });

          this.warrantyPlans = data.warranty_plan;
          this.periods = data.periods;
          this.promos = data.promos;

          this.dealers = [];
          data.dealers.forEach(dealer => {

            this.dealers.push({
              id: dealer.id,
              name: dealer.name,
            });

          });
        }
      }, error => {
        this.helper.dissmissLoading();
        this.helper.presentAlertDetails('Error', 'No staff found.');
        console.log(error);
      });

  }

  async addInspection(isUpdate = false) {

    if (!this.timevalid) {
      this.helper.presentAlertDetails('Inspection appointment not valid!', 'Time need to be more than one hour different between other appointment.');
      return;
    }

    this.loading = true;
    this.loadingText = 'Please wait ';

    let data: any = this.ionicForm.value;

    let choosedMO = this.staffs.find(x => x.id == this.ionicForm.value.marketing_officer);
    if (choosedMO) {
      data.marketing_officer = {
        id: choosedMO.id,
        name: choosedMO.name,
      };
    }
    data.reminder_date = moment(data.reminder_date, 'YYYY-MM-DD H:i').toDate();
    data.date = new Date();

    if (!isUpdate) {

      data.created_by = this.staff.user_id;
      data.created_by_staff_id = this.staff.staff_id;
      data.created_by_name = this.staff.user_fullname;
      data.status = 'pending';

      this.firestore.collection('/schedule_inspections/').add(data).then(() => {
        console.log('success');
        this.loading = false;
        this.loadingText = '';
        this.helper.presentToast('Schedule Inspection successfully added.');
        this.navCtrl.back();

        // this.addrecord = {type :'', description :'', amount: null} 
      }).catch(error => {

        this.helper.presentToast('Sorry, there is some error occured.');
        this.loading = false;
        this.loadingText = '';

      });
    } else {

      this.firestore.doc<any>('schedule_inspections/' + this.inspection_id).update(data).then(() => {
        console.log('success');
        this.loading = false;
        this.loadingText = '';
        this.helper.presentToast('Schedule Inspection successfully updated.');
        this.navCtrl.back();

      }).catch(error => {

        this.helper.presentToast('Sorry, there is some error occured.');
        this.loading = false;
        this.loadingText = '';

      });

    }

  }

  updateInspectionStatus(status) {

    this.helper.presentLoading();

    console.log({
      id: this.staff.staff_id,
      name: this.staff.user_fullname,
      date: new Date(),
    });

    console.log(status);

    let data: any = {
      status_changed_by: {
        id: this.staff.staff_id,
        name: this.staff.user_fullname,
        date: new Date(),
      },
      status: status,
    };

    if (this.remarks) {
      data.status_remarks = this.remarks;
    }

    this.firestore.doc<any>('schedule_inspections/' + this.inspection_id).update(
      data
    ).then(() => {
      this.helper.dissmissLoading();
      this.helper.presentToast('Inspection successfully updated.');
      this.navCtrl.back();

    }).catch(error => {

      this.helper.dissmissLoading();
      this.helper.presentToast('Sorry, there is some error occured.');
    });


  }

  unassignInspection() {

    this.helper.presentLoading();

    this.firestore.doc<any>('schedule_inspections/' + this.inspection_id).update({
      person_in_charge: null
    }).then(() => {
      this.helper.dissmissLoading();
      this.helper.presentToast('Inspection successfully unassign.');
      this.navCtrl.back();

    }).catch(error => {

      this.helper.dissmissLoading();
      this.helper.presentToast('Sorry, there is some error occured.');
    });


  }

  async action(status) {

    // if (!this.remarks) {
    //   this.helper.presentToast('Please add remarks.');
    //   return;
    // }

    let title = 'Are you sure want to submit!';

    if (status == 'unassign') {
      title = 'Are you sure want to unassign this!';
    }

    const alert = await this.alertController.create({
      header: title,
      // message: 'Are you sure want to submit!',
      // mode: 'ios',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm Okay');

            if (status == 'unassign') {
              this.unassignInspection();
            } else {
              this.updateInspectionStatus(status);
            }

          }
        }
      ]
    });

    await alert.present();
  }

  imagePreview(src) {

    var options = {
      share: true, // default is false
      closeButton: true, // default is true
      copyToReference: true, // default is false
      // headers: '',  // If this is not provided, an exception will be triggered
      // piccasoOptions: { } // If this is not provided, an exception will be triggered
    };

    // console.log('decodeURIComponent(src)', (this.file.applicationDirectory + src));
    this.photoViewer.show((src), 'Inspection', options);

  }

  updateInspectionTime() {

    this.loading = true;
    this.loadingText = 'Please wait ';

    let time = this.ionicForm.value.reminder_date;
    console.log('reminder_date', this.ionicForm.value.reminder_date);

    time = moment(time, 'YYYY-MM-DD H:mm').toDate();
    console.log(time);

    this.firestore.doc<any>('schedule_inspections/' + this.inspection_id).update({
      reminder_date: time
    }).then(() => {
      console.log('success');
      this.loading = false;
      this.loadingText = '';
      this.helper.presentToast('Inspection successfully updated.');
      this.navCtrl.back();

    }).catch(error => {

      this.helper.presentToast('Sorry, there is some error occured.');
      this.loading = false;
      this.loadingText = '';

    });

  }

  async deleteInspection() {

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Are you sure want to delete?',
      message: 'This action will permanently delete the data.',
      mode: 'ios',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Confirm Cancel');
        }
      }, {
        text: 'Okay',
        handler: () => {

          this.firestore.doc<any>('schedule_inspections/' + this.inspection_id).delete().then(() => {
            console.log('success');
            this.loading = false;
            this.loadingText = '';
            this.helper.presentToast('Inspection successfully deleted.');
            this.navCtrl.back();

          }).catch(error => {

            this.helper.presentToast('Sorry, there is some error occured.');
            this.loading = false;
            this.loadingText = '';

          });


        }
      }
      ]
    });

    await alert.present();
  }

  test() {
    let time = this.ionicForm.value.reminder_date;
    time = moment(time, 'YYYY-MM-DD H:mm').toDate().getTime();
    let currentdate = new Date().getTime();

    this.timevalid = true;

    for (let inspection of this.inspectionsTemp) {

      if (inspection.reminder_date) {
        const hour = Math.abs(time - inspection.reminder_date.toDate().getTime()) / 3600000;

        // if less than 30 minutes
        if (hour < 0.5) {
          console.log('inspection - ' + hour, inspection.reminder_date.toDate());
          this.timevalid = false;
          // this.helper.presentToast('Time not available!');
          break;
        } else {

        }
      }
    }

    // this.inspectionsTemp.forEach(inspection => {

    //   if (inspection.reminder_date) {
    //     const hour = Math.abs(time - inspection.reminder_date.toDate().getTime()) / 3600000;

    //     if(hour > 1){
    //       valid = false;
    //     }
    //   }

    // });
    console.log('valid', this.timevalid);
  }

  checkPolicyNoEvent(event) {
    this.checkPolicyNo(event.detail.value);
  }

  checkPolicyNo(value) {

    this.loadingPolicy = true;
    this.policy = null;
    this.ionicForm.controls['policy_found'].setValue(null);

    console.log('event', value);
    const search = value.toLowerCase();

    let data: any = {
      search: search,
      status: 'all',
    };
    data = JSON.stringify(data);

    this.authService.findClaimByPolicyNo(search).subscribe(
      data => {
        this.loadingPolicy = false;

        if (data && data.policy) {
          this.policy = data.policy;
          this.ionicForm.controls['policy_found'].setValue(1);
          console.log('this.policy', this.policy);
        }
      }, error => {
        this.loadingPolicy = false;
      });

  }

}
