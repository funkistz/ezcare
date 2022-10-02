import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationService } from '../../services/authentication.service';
import { HelperService } from '../../services/helper.service';
import { Platform, LoadingController, ToastController, ActionSheetController, AlertController } from '@ionic/angular';
import * as moment from 'moment';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { Storage } from '@capacitor/storage';
import { NavController } from '@ionic/angular';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {

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
  dealers = [];

  constructor(
    public formBuilder: FormBuilder,
    private firestore: AngularFirestore,
    private authService: AuthenticationService,
    public helper: HelperService,
    private actionSheetCtrl: ActionSheetController,
    public alertController: AlertController,
    private afStorage: AngularFireStorage,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private photoViewer: PhotoViewer,
  ) {

  }

  ngOnInit() {

    this.ionicForm = this.formBuilder.group({
      marketing_officer: ['', [Validators.required]],
      dealer: ['', [Validators.required]],
      reasons: ['', [Validators.required]],
      amount: ['', []],
    })

    this.getStaff();

    this.route.queryParams.subscribe(params => {
      if (params && params.inspection_id) {
        this.inspection_id = params.inspection_id;

        this.getInspection(this.inspection_id);

      } else {
        this.getStaffs();
      }
    });

  }

  async getStaff() {
    let { value }: any = await Storage.get({ key: 'staff' });
    this.staff = JSON.parse(value);
    console.log('staff', this.staff);
  }

  getInspection(id) {

    this.inspection = null;
    this.loading = true;
    this.loadingText = 'Please wait ';

    return this.firestore.collection('sponsorship').doc(id).valueChanges().subscribe((data: any) => {

      this.inspection = data;
      if (data) {
        this.ionicForm.controls['amount'].setValue('RM ' + data.amount);

        if (data.dealer && data.dealer.name) {
          this.ionicForm.controls['dealer'].setValue(data.dealer.name);
        } else if (data.dealer) {
          this.ionicForm.controls['dealer'].setValue(data.dealer);
        }
        this.ionicForm.controls['marketing_officer'].setValue(data.warranty_plan);
        this.ionicForm.controls['reasons'].setValue(data.reasons);
      }

      console.log(data);
      this.loading = false;
    });
  }

  getStaffs() {

    this.helper.presentLoading();

    this.authService.getStaffs().subscribe(
      (data: any) => {
        this.helper.dissmissLoading();

        if (data && data.data) {

          // this.staffs = data.data;
          this.staffs = [];
          data.data.forEach(staff => {

            this.staffs.push({
              id: staff.id,
              name: staff.name,
            });

          });

          console.log(this.staffs);


          this.warrantyPlans = data.warranty_plan;

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

  async addInspection() {

    this.loading = true;
    this.loadingText = 'Please wait ';

    let data: any = this.ionicForm.value;

    // if (this.ionicForm.value.marketing_officer && this.ionicForm.value.marketing_officer.id) {
    //   data.marketing_officer = {
    //     id: this.ionicForm.value.marketing_officer.id,
    //     name: this.ionicForm.value.marketing_officer.name,
    //   };
    // }
    data.date = new Date();
    data.images = [];
    data.created_by = this.staff.user_id;
    data.created_by_staff_id = this.staff.staff_id;
    data.created_by_name = this.staff.user_fullname;
    data.status = 'pending';

    if (this.ionicForm.value.activated_date) {
      data.activated_date = moment(this.ionicForm.value.activated_date, 'YYYY-MM-DD').toDate();
    }

    if (this.ionicForm.value.expired_date) {
      data.expired_date = moment(this.ionicForm.value.expired_date, 'YYYY-MM-DD').toDate();
    }

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

    this.firestore.collection('/sponsorship/').add(data).then(() => {
      console.log('success');
      this.loading = false;
      this.loadingText = '';
      this.helper.presentToast('Sponsorship successfully added.');
      this.navCtrl.back();

      // this.addrecord = {type :'', description :'', amount: null} 
    }).catch(error => {

      this.helper.presentToast('Sorry, there is some error occured.');
      this.loading = false;
      this.loadingText = '';

    });
  }

  updateInspectionStatus(status) {

    this.loading = true;
    this.loadingText = 'Please wait ';

    this.firestore.doc<any>('sponsorship/' + this.inspection_id).update({
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
      this.helper.presentToast('Sponsorship successfully updated.');
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

    this.photoViewer.show(src, 'Endorsement', options);

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

          this.firestore.doc<any>('sponsorship/' + this.inspection_id).delete().then(() => {
            console.log('success');
            this.loading = false;
            this.loadingText = '';
            this.helper.presentToast('Sponsorship successfully deleted.');
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

}
