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
  selector: 'app-add-non-inspect',
  templateUrl: './add-non-inspect.page.html',
  styleUrls: ['./add-non-inspect.page.scss'],
})
export class AddNonInspectPage implements OnInit {

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
      reminder_date: ['', []],
      dealer: ['', [Validators.required]],
      branch: ['', [Validators.required]],
      inspection_type: ['', [Validators.required]],
      warranty_plan: ['', [Validators.required]],
      remarks: ['', []],
      marketing_officer: ['', [Validators.required]],
      date: ['', []],
      period: ['', [Validators.required]],
      promo: ['', [Validators.required]],
      policy_no: ['', []],
      vehicle: ['', []],
      chassis: ['', []],
      mileage: ['', []],
      policy_found: ['', []],
    });

    this.getStaff();
    this.helper.getStaffs();
    this.staffs = this.helper.staffs;
    this.warrantyPlans = this.helper.warrantyPlans;
    this.periods = this.helper.periods;
    this.promos = this.helper.promos;
    this.inspection_types = this.helper.inspection_types;

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

    return this.firestore.collection('non_inspections', ref => ref.where('status', '==', 'booked').orderBy('date', 'desc')).snapshotChanges().subscribe((res) => {

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

    return this.firestore.collection('non_inspections').doc(id).valueChanges().subscribe((data: any) => {

      this.inspection = data;
      if (data) {

        if (data.dealer && data.dealer.name) {
          this.ionicForm.controls['dealer'].setValue(data.dealer.name);
        } else if (data.dealer) {
          this.ionicForm.controls['dealer'].setValue(data.dealer);
        }
        this.ionicForm.controls['branch'].setValue(data.branch ? data.branch.branch : '');
        this.ionicForm.controls['vehicle'].setValue(data.vehicle);
        this.ionicForm.controls['mileage'].setValue(data.mileage);
        this.ionicForm.controls['warranty_plan'].setValue(data.warranty_plan);
        this.ionicForm.controls['chassis'].setValue(data.chassis);
        this.ionicForm.controls['remarks'].setValue(data.remarks);
        this.ionicForm.controls['period'].setValue(data.period);
        this.ionicForm.controls['promo'].setValue(data.promo);
        this.ionicForm.controls['inspection_type'].setValue(data.inspection_type);

        this.ionicForm.controls['marketing_officer'].setValue(data.marketing_officer ? data.marketing_officer.name : '');

        if (data.policy_no) {
          this.ionicForm.controls['policy_no'].setValue(data.policy_no);
          this.checkPolicyNo(data.policy_no);
        }

        if (data.inspection_type == "Claim Case") {
          this.inspectionTypeChange(null, true);
        } else {
          this.inspectionTypeChange(null, false);
        }

        // this.ionicForm.controls['reminder_date'].setValue(data.reminder_date);

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
    this.ionicForm.controls['dealer'].setValue(this.inspection.dealer);
    this.ionicForm.controls['marketing_officer'].setValue(this.inspection.marketing_officer);
    this.ionicForm.controls['branch'].setValue(this.inspection.branch ? this.inspection.branch : '');
  }

  cancelUpdateInspection() {
    this.editable = false;
    this.ionicForm.controls['dealer'].setValue(this.inspection.dealer.name);
    this.ionicForm.controls['marketing_officer'].setValue(this.inspection.marketing_officer.id);

    if (this.inspection.dealer.name) {
      this.ionicForm.controls['dealer'].setValue(this.inspection.dealer.name);
    } else {
      this.ionicForm.controls['dealer'].setValue(this.inspection.dealer);
    }
  }

  inspectionTypeChange(event, isClaim = false) {
    // console.log('inspectionTypeChange', event.detail.value);

    if (event && event.detail && event.detail.value == 'Claim Case') {
      isClaim = true;
    }

    if (isClaim) {
      console.log('is Claim Case');
      this.claimCase = true;
      this.ionicForm.get('warranty_plan').setValidators([]);
      this.ionicForm.get('period').setValidators([]);
      this.ionicForm.get('policy_no').setValidators([Validators.required]);
      this.ionicForm.get('vehicle').setValidators([]);
      this.ionicForm.get('dealer').setValidators([]);
      this.ionicForm.get('policy_found').setValidators([Validators.required]);
      this.ionicForm.get('promo').setValidators([]);
    } else {

      this.claimCase = false;
      this.ionicForm.get('warranty_plan').setValidators([Validators.required]);
      this.ionicForm.get('period').setValidators([Validators.required]);
      this.ionicForm.get('policy_no').setValidators([]);
      this.ionicForm.get('vehicle').setValidators([Validators.required]);
      this.ionicForm.get('dealer').setValidators([Validators.required]);
      this.ionicForm.get('policy_found').setValidators([]);
      this.ionicForm.get('promo').setValidators([Validators.required]);
    }

    this.ionicForm.get('warranty_plan').updateValueAndValidity();
    this.ionicForm.get('period').updateValueAndValidity();
    this.ionicForm.get('policy_no').updateValueAndValidity();
    this.ionicForm.get('vehicle').updateValueAndValidity();
    this.ionicForm.get('dealer').updateValueAndValidity();
    this.ionicForm.get('policy_found').updateValueAndValidity();
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

  async selectImageSource() {
    const buttons = [
      {
        text: 'Take Photo',
        icon: 'camera',
        handler: () => {
          this.takePicture();
        }
      },
      {
        text: 'Choose From Photos',
        icon: 'image',
        handler: () => {
          this.pickImage();
        }
      }
    ];

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      mode: 'ios',
      buttons
    });
    await actionSheet.present();
  }

  async pickImage() {

    let images = await this.helper.imagePicker();
    console.log('pickImage', images);

    images.forEach(image => {
      this.inspectImages.push({
        id: Date.now(),
        file: image.file.original,
        file_thumbnail: image.file.thumbnail,
        url: image.webPath,
        format: image.format
      });

    });
  }

  async takePicture() {
    let image = await this.helper.camera();
    console.log('takePicture', image);

    this.inspectImages.push({
      id: Date.now(),
      file: image.file.original,
      file_thumbnail: image.file.thumbnail,
      url: image.webPath,
      format: image.format
    });
  }

  removeImage(index) {

    this.inspectImages.splice(index, 1);

  }

  async removeImageOri(index) {

    const alert = await this.alertController.create({
      header: 'Are you sure want to delete image!',
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

            this.removeImageFirebase(index);
          }
        }
      ]
    });

    alert.present();

  }

  async removeImageFirebase(index) {

    this.loading = true;
    this.loadingText = 'Please wait ';

    let images = this.inspection.images;

    images.splice(index, 1);

    this.firestore.doc<any>('non_inspections/' + this.inspection_id).update({
      images: images
    }).then(() => {
      console.log('success');
      this.loading = false;
      this.loadingText = '';
      this.helper.presentToast('Image successfully deleted.');

    }).catch(error => {

      this.helper.presentToast('Sorry, there is some error occured.');
      this.loading = false;
      this.loadingText = '';

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

    let choosedMO = this.helper.staffs.find(x => x.id == this.ionicForm.value.marketing_officer);

    if (choosedMO) {
      data.marketing_officer = {
        id: choosedMO.id,
        name: choosedMO.name,
      };
    }
    data.date = new Date();
    data.images = [];
    data.created_by = this.staff.user_id;
    data.created_by_staff_id = this.staff.staff_id;
    data.created_by_name = this.staff.user_fullname;


    let index = 1;
    for (const inspectImage of this.inspectImages) {

      if (index < 4) {
        this.loadingText = 'Uploading ' + this.numbering[index - 1] + ' image ';
      } else {
        this.loadingText = 'Uploading ' + index + 'th image ';
      }

      let upload = await this.helper.uploadToFirebase(inspectImage.file, data.reg_no);
      let uploadThumb = await this.helper.uploadToFirebase(inspectImage.file_thumbnail, data.reg_no);
      console.log('finish... report', upload.url);

      data.images.push({
        image_link: upload.url,
        image_thumb_link: uploadThumb.url,
      });

      index++;
    }

    console.log('finish upload', data);
    this.loadingText = 'Almost finish ';

    if (!isUpdate) {

      data.status = 'proceed';

      this.firestore.collection('/non_inspections/').add(data).then(() => {
        console.log('success');
        this.loading = false;
        this.loadingText = '';
        this.helper.presentToast('Inspection successfully added.');
        this.navCtrl.back();

        // this.addrecord = {type :'', description :'', amount: null} 
      }).catch(error => {

        this.helper.presentToast('Sorry, there is some error occured.');
        this.loading = false;
        this.loadingText = '';

      });
    } else {

      this.firestore.doc<any>('non_inspections/' + this.inspection_id).update(data).then(() => {
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

  }

  updateInspectionStatus(status) {

    this.loading = true;
    this.loadingText = 'Please wait ';

    this.firestore.doc<any>('non_inspections/' + this.inspection_id).update({
      status_changed_by: {
        id: this.staff.staff_id,
        name: this.staff.user_fullname,
        date: new Date(),
      },
      status: status,
      status_remarks: this.remarks,
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

  async action(status) {

    if (!this.remarks) {
      this.helper.presentToast('Please add remarks.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Are you sure want to submit!',
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

            this.updateInspectionStatus(status);

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

    this.firestore.doc<any>('non_inspections/' + this.inspection_id).update({
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

          this.firestore.doc<any>('non_inspections/' + this.inspection_id).delete().then(() => {
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

        if (hour < 1) {
          console.log('inspection - ' + hour, inspection.reminder_date.toDate());
          this.timevalid = false;
          break;
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

}
