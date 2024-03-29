import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController, ToastController, ActionSheetController, NavController } from '@ionic/angular';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { decode } from "base64-arraybuffer";
import * as moment from 'moment';
import { HelperService } from '../services/helper.service';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { Chooser } from '@awesome-cordova-plugins/chooser/ngx';

@Component({
  selector: 'app-staff-view-claims',
  templateUrl: './staff-view-claims.page.html',
  styleUrls: ['./staff-view-claims.page.scss'],
})
export class StaffViewClaimsPage implements OnInit {

  claim;
  claim_id;
  staff;
  remarks;
  loading;
  actionType;
  statusImages = [];
  statusImagesUrl = [];
  void_type;

  input_claim_date;
  input_remarks;
  input_workshop;
  input_status;
  input_type;
  input_mileage;
  input_amount;
  input_description1;
  input_description2;


  // File upload task 
  fileUploadTask: AngularFireUploadTask;

  // Upload progress
  percentageVal: Observable<number>;

  // Track file uploading with snapshot
  trackSnapshot: Observable<any>;

  // Uploaded File URL
  UploadedImageURL: Observable<string>;

  void_reasons = [];

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public toastController: ToastController,
    private photoViewer: PhotoViewer,
    private actionSheetCtrl: ActionSheetController,
    public helper: HelperService,
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage,
    private datePipe: DatePipe,
    private firestore: AngularFirestore,
    private navCtrl: NavController,
    private chooser: Chooser,
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params && params.claim_id) {
        this.claim_id = params.claim_id;
        console.log(this.claim_id);

        this.getClaim(this.claim_id);

      }
    });

    this.input_claim_date = new Date();
    this.input_claim_date = this.datePipe.transform(this.input_claim_date, 'yyyy-MM-dd');

    this.getStaff();

  }

  async getStaff() {
    let { value }: any = await Preferences.get({ key: 'staff' });
    this.staff = JSON.parse(value);
    console.log('staff', this.staff);
  }

  async getClaim(claim_id, event = null) {

    this.claim = null;

    this.authService.getClaim(claim_id).subscribe(
      data => {

        if (data && data.data) {

          if (event) {
            event.target.complete();
          }

          this.void_reasons = data.void_reasons;

          data.data.claim_status.forEach(status => {

            if (status.claim_status_code == 'pending') {
              status.color = 'light';
            } else if (status.claim_status_code == 'approved') {
              status.color = 'success';
            } else if (status.claim_status_code == 'paid') {
              status.color = 'warning';
            } else if (status.claim_status_code == 'void') {
              status.color = 'dark';
            } else if (status.claim_status_code == 'rejected') {
              status.color = 'danger';
            }
          });

          this.claim = data.data;

          console.log('claim', this.claim);
        }
      }, error => {

        console.log(error);
        if (event) {
          event.target.complete();
        }
      });
  }

  async action(type) {

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

            this.submit(type);

          }
        }
      ]
    });

    await alert.present();
  }

  submit(type) {

    this.presentLoading();

    let data: any = {};
    data.remarks = this.remarks;
    data.status = type;
    data.approve_reject_by = this.staff.user_id;

    this.authService.updateClaim(this.claim_id, data).subscribe(
      result => {

        this.dissmissLoading();
        this.presentToast('Claim ' + type);
        // this.isSubmitted = true;
        // this.navCtrl.back();
        console.log(result);
        this.getClaim(this.claim_id);

        // if (data && data) {
        // }
      }, error => {
        console.log(error);
        this.dissmissLoading();
        this.presentToast(error.error.message);
      });

  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await this.loading.present();
  }

  dissmissLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  imagePreview(src) {

    this.photoViewer.show(src);
    // let navigationExtras: NavigationExtras = {
    //   queryParams: {
    //     src: src
    //   }
    // };
    // this.router.navigate(['/image-preview'], navigationExtras);

  }

  async selectImageSource(type = null) {
    const buttons = [
      {
        text: 'Take Photo',
        icon: 'camera',
        handler: () => {
          this.takePicture(type);
        }
      },
      {
        text: 'Choose From Photos',
        icon: 'image',
        handler: () => {
          this.pickImage(type);
        }
      },
      {
        text: 'Files',
        icon: 'document',
        handler: () => {
          this.filePicker(type);
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

  async pickImage(type) {

    let images = await this.helper.imagePicker();

    let index = 1;
    images.forEach(image => {

      let data = {
        id: Date.now(),
        file: image.file.original,
        file_thumbnail: image.file.thumbnail,
        url: image.webPath,
        format: image.format,
        type: 'image',
        name: Date.now() + '_picker_' + index,
      }

      this.statusImages.push(data);

      index++;

    });
  }

  async takePicture(type) {
    let image = await this.helper.camera();

    let data = {
      id: Date.now(),
      file: image.file.original,
      file_thumbnail: image.file.thumbnail,
      url: image.webPath,
      format: image.format,
      type: 'image',
      name: Date.now() + '_camera',
    }

    this.statusImages.push(data);

  }

  async filePicker(type) {

    let file = await this.helper.filePicker();

    if (file) {
      let data = {
        id: Date.now(),
        file: file.file,
        type: 'file',
        name: file.name
      }

      this.statusImages.push(data);
    }

    return;

    await this.chooser.getFile()
      .then(async file => {
        console.log(file ? file.name : 'canceled');
        file.data = null;
        console.log(file ? JSON.stringify(file) : 'canceled');

        // let upload = await this.helper.uploadToFirebase(file, file.name);
        // console.log('finish... report', JSON.stringify(upload));

        let data = {
          id: Date.now(),
          file: file,
          type: 'file',
          name: file.name
        }

        this.statusImages.push(data);


      })
      .catch((error: any) => {
        console.error(error);
      });
  }

  async addImage(source: CameraSource, type) {

    console.log(source);
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source
    });
    console.log('after');


    const blob = new Blob([new Uint8Array(decode(image.base64String))], {
      type: `image/${image.format}`,
    });
    let filename: string = "" + moment().unix();

    const file = new File([blob], filename, {
      lastModified: moment().unix(),
      type: blob.type,
    });

    this.statusImages.push({
      id: Date.now(),
      base64: "data:image/jpeg;base64, " + image.base64String,
      file: file,
      format: image.format
    });
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  async uploadToFirebase(file, reg_no, type, isUpdate = false): Promise<any> {

    return new Promise(async (resolve, reject) => {

      console.log('uploading...');

      const filename = new Date().getTime() + '_' + reg_no;

      // Storage path
      const fileStoragePath = `claims/${new Date().getTime()}_${reg_no}`;

      // Image reference
      const imageRef = this.afStorage.ref(fileStoragePath);

      // File upload task
      this.fileUploadTask = this.afStorage.upload(fileStoragePath, file);
      // Show uploading progress
      this.percentageVal = this.fileUploadTask.percentageChanges();

      await this.fileUploadTask.snapshotChanges().pipe(
        finalize(async () => {
          console.log('finish fileUploadTask');

          await imageRef.getDownloadURL().subscribe(downloadURL => {

            resolve({
              name: filename,
              url: downloadURL,
            });

          });
        })
      ).toPromise();


    });

  }

  removeImage(index) {

    this.statusImages.splice(index, 1);

  }

  selectActionType(type) {

    if (type == 'approve') {
      this.input_status = 'approved';
    } else if (type == 'pay') {
      this.input_status = 'paid';
    } else if (type == 'void') {
      this.input_status = 'void';
    } else if (type == 'reject') {
      this.input_status = 'rejected';
    }

    this.actionType = type;

  }

  async confirmChangeStatus() {

    if (this.actionType == 'pay') {
      if (!this.input_type || !this.input_claim_date || !this.input_mileage || !this.input_amount) {

        this.helper.presentToast('Please fill all required input!');

        return;
      }
    }

    if (this.actionType == 'void' || this.actionType == 'reject' || this.actionType == 'pay') {
      if (!this.statusImages || this.statusImages.length <= 0) {

        this.helper.presentToast('Please provide atleast one attachment!');

        return;
      }
    }

    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Are you sure want to submit!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          id: 'confirm-button',
          handler: () => {
            console.log('Confirm Okay');
            this.updateClaimStatus();
          }
        }
      ]
    });

    await alert.present();
  }

  async updateClaimStatus() {

    this.helper.presentLoading();

    let data: any = {};
    data.claim_id = this.claim_id;

    if (this.input_remarks) {
      data.remarks = this.input_remarks;
    }
    if (this.input_claim_date) {
      data.date = this.input_claim_date;
    }
    if (this.input_status) {
      data.status = this.input_status;
    }
    if (this.input_workshop) {
      data.workshop = this.input_workshop;
    }

    data.created_by_staff = this.staff.user_id;
    data.policy_id = this.claim.policy_id;

    console.log('data', data);

    if (this.input_status == 'paid') {

      data.type = this.input_type;
      data.mileage = this.input_mileage;
      data.amount = this.input_amount;
      data.description1 = this.input_description1;
      data.description2 = this.input_description2;
    }

    if (this.input_status == 'void') {
      data.void_type = this.void_type;
      data.void_text = this.void_reasons.find(x => x.id == data.void_type);

      if (data.void_text) {
        data.void_text = data.void_text.name;
      }
    }

    if (this.claim && this.claim.policy && this.claim.policy.cust_policyno) {
      data.policy_no = this.claim.policy.cust_policyno;
    }
    if (this.claim && this.claim.policy && this.claim.policy.cust_vehicledesc) {
      data.vehicle = this.claim.policy.cust_vehicledesc;
    }
    if (this.claim && this.claim.policy && this.claim.policy.cust_vehicleregno) {
      data.reg_no = this.claim.policy.cust_vehicleregno;
    }

    if (this.statusImages) {

      for (const reportImage of this.statusImages) {
        let upload = await this.helper.uploadToFirebase(reportImage.file, data.reg_no);
        console.log('finish... report', upload.url);

        this.statusImagesUrl.push({
          name: reportImage.name,
          image_link: upload.url,
          type: reportImage.type,
        });
      }

      data.files = this.statusImagesUrl;
    }

    this.authService.updateClaimStatus(data).subscribe(
      data2 => {

        let tempData: any = {};
        if (this.claim.policy && this.claim.policy.cust_ic) {

          let ic = this.claim.policy.cust_ic.replace('-', '');
          tempData.customer_id = ic;

        }

        const voi_text = this.void_reasons.find(x => x.id == data.void_type);

        tempData.data = data;
        tempData.date = data.date;
        tempData.status = data.status;
        tempData.claim_id = data.claim_id;
        tempData.marketing_officer = this.claim.marketing_officer.id;
        tempData.policy_id = data.policy_id;

        console.log('tempData', tempData);

        this.firestore.collection('/claim_status_update/').add(tempData).then(() => {
          console.log('success');
        }).catch(error => {
          console.log(error);
        });

        // this.addNotification(data.status);

        console.log(data2);
        this.helper.dissmissLoading();
        this.helper.presentToast('Status updated');
        this.actionType = null;
        this.getClaim(this.claim_id);
        this.statusImages = [];
        this.statusImagesUrl = [];
      }, error => {
        console.log(error);
        this.helper.presentToast(error.error.message);
        this.helper.dissmissLoading();
      });

  }

  edit(reg_no) {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        reg_no: reg_no
      }
    };
    this.router.navigate(['/staff-tabs/staffClaims/staff-add-claim/'], navigationExtras);
  }

  addNotification(status) {

    console.log('this.claim', this.claim);

    let data = {
      title: 'Claim for reg no: ' + this.claim.policy.cust_vehicleregno + ' has been ' + status + '!',
      body: 'Tap here to check it out!',
      data: this.claim,
      user_id: 'staff_' + this.claim.marketing_officer.id,
      data_add: new Date(),
    };

    this.firestore.collection('/notifications/').add(data).then(() => {
      console.log('success');

    }).catch(error => {

      this.helper.presentToast(error);

    });

  }

  async deleteClaim() {

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

          this.presentLoading();

          this.authService.deleteClaim(this.claim_id).subscribe(
            result => {

              this.dissmissLoading();
              this.presentToast('Claim deleted.');
              let navigationExtras: NavigationExtras = {
                queryParams: {
                  refresh: 'yes'
                }
              };

              this.router.navigate(['/staff-tabs/staffClaims'], navigationExtras);

            }, error => {
              console.log(error);
              this.dissmissLoading();
              this.presentToast(error.error.message);
            });


        }
      }
      ]
    });

    await alert.present();
  }

  async deleteStatus(status_id) {

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

          this.helper.presentLoading();

          this.authService.deleteClaimStatus(status_id).subscribe(
            result => {

              this.helper.dissmissLoading();
              this.helper.presentToast('Status deleted.');
              this.getClaim(this.claim_id);

            }, error => {
              console.log(error);
              this.helper.dissmissLoading();
              this.helper.presentToast(error.error.message);
            });


        }
      }
      ]
    });

    await alert.present();
  }

}
