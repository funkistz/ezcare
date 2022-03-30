import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationService } from '../services/authentication.service';
import { HelperService } from '../services/helper.service';
import { Platform, LoadingController, ToastController, ActionSheetController, AlertController } from '@ionic/angular';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { Storage } from '@capacitor/storage';
import { NavController } from '@ionic/angular';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';

@Component({
  selector: 'app-staff-add-logs',
  templateUrl: './staff-add-logs.page.html',
  styleUrls: ['./staff-add-logs.page.scss'],
})
export class StaffAddLogsPage implements OnInit {

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

  constructor(
    public formBuilder: FormBuilder,
    private firestore: AngularFirestore,
    private authService: AuthenticationService,
    private helper: HelperService,
    private actionSheetCtrl: ActionSheetController,
    public alertController: AlertController,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private photoViewer: PhotoViewer,
  ) {

  }

  ngOnInit() {

    this.ionicForm = this.formBuilder.group({
      dealer: ['', []],
      vehicle: ['', []],
      mileage: ['', []],
      warranty_plan: ['', []],
      chassis: ['', []],
      remarks: ['', []],
      marketing_officer: ['', []],
      date: ['', []],
    })

    this.getStaff();

    this.route.queryParams.subscribe(params => {
      if (params && params.inspection_id) {
        this.inspection_id = params.inspection_id;
        console.log(this.inspection_id);

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

    return this.firestore.collection('inspections').doc(id).valueChanges().subscribe((data: any) => {

      this.inspection = data;
      if (data) {
        this.ionicForm.controls['dealer'].setValue(data.dealer);
        this.ionicForm.controls['vehicle'].setValue(data.vehicle);
        this.ionicForm.controls['mileage'].setValue(data.mileage);
        this.ionicForm.controls['warranty_plan'].setValue(data.warranty_plan);
        this.ionicForm.controls['chassis'].setValue(data.chassis);
        this.ionicForm.controls['remarks'].setValue(data.remarks);
        this.ionicForm.controls['marketing_officer'].setValue(data.marketing_officer.id);
        // this.ionicForm.value.dealer = data.dealer;
      }

      this.loading = false;
      console.log(this.inspection);
    });
  }

  getStaffs() {

    this.helper.presentLoading();

    this.authService.getStaffs().subscribe(
      (data: any) => {
        this.helper.dissmissLoading();

        if (data && data.data) {

          console.log('data', data);
          this.staffs = data.data;
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

    if (this.ionicForm.value.marketing_officer && this.ionicForm.value.marketing_officer.id) {
      data.marketing_officer = {
        id: this.ionicForm.value.marketing_officer.id,
        name: this.ionicForm.value.marketing_officer.name,
      };
    }
    data.date = new Date();
    data.images = [];
    data.created_by = this.staff.user_id;
    data.created_by_name = this.staff.user_fullname;
    data.status = 'pending';

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

    this.firestore.collection('/inspections/').add(data).then(() => {
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
  }

  updateInspectionStatus(status) {

    this.loading = true;
    this.loadingText = 'Please wait ';

    this.firestore.doc<any>('inspections/' + this.inspection_id).update({
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

    this.photoViewer.show(src);

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

          this.firestore.doc<any>('inspections/' + this.inspection_id).delete().then(() => {
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
}
