import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DatePipe } from '@angular/common'
import { AuthenticationService } from '../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform, LoadingController, ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { HelperService } from '../services/helper.service';
import { decode } from "base64-arraybuffer";
import * as moment from 'moment';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import { Chooser } from '@awesome-cordova-plugins/chooser/ngx';
import { ClaimImportsPage } from '../components/claim-imports/claim-imports.page';
@Component({
  selector: 'app-staff-add-claims',
  templateUrl: './staff-add-claims.page.html',
  styleUrls: ['./staff-add-claims.page.scss'],
})
export class StaffAddClaimsPage implements OnInit {

  policyFound = false;
  claim_types;
  ezcareStaff;
  claim;
  policy;
  staff;
  loading;
  ionicForm: FormGroup;
  reportImages = [];
  quotationImages = [];
  claimLetterImages = [];
  reportImagesUrl = [];
  importreportImages = [];
  quotationImagesUrl = [];
  claimLetterImagesUrl = [];
  // images: ApiImage[] = [];
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  // File upload task 
  fileUploadTask: AngularFireUploadTask;

  // Upload progress
  percentageVal: Observable<number>;

  // Track file uploading with snapshot
  trackSnapshot: Observable<any>;

  // Uploaded File URL
  UploadedImageURL: Observable<string>;

  isLoading = false;
  canDelete = false;

  constructor(
    public formBuilder: FormBuilder,
    public datepipe: DatePipe,
    private authService: AuthenticationService,
    private route: ActivatedRoute, private router: Router,
    public loadingController: LoadingController,
    public toastController: ToastController,
    private navCtrl: NavController,
    private plt: Platform,
    private actionSheetCtrl: ActionSheetController,
    public helper: HelperService,
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage,
    public alertController: AlertController,
    private chooser: Chooser,
    private firestore: AngularFirestore,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {

    this.getStaff();

    this.ionicForm = this.formBuilder.group({
      reg_no: ['', [Validators.required]],
      claim_type_id: ['', [Validators.required]],
      claim_date: ['', [Validators.required]],
      mileage: ['', [Validators.required]],
      home_or_workshop: ['', [Validators.required]],
      workshop_name: ['', []],
      marketing_officer: ['', [Validators.required]],
    });

    this.route.queryParams.subscribe(params => {
      if (params && params.reg_no) {
        this.ionicForm.controls["reg_no"].setValue(params.reg_no);

        this.searchCar();
      }
    });


    this.authService.getGenerals().subscribe(
      data => {

        if (data && data.data) {

          let temp = data.data;

          if (temp.claim_types) {
            this.claim_types = temp.claim_types;
          }

          if (temp.staffs) {
            this.ezcareStaff = temp.staffs;
          }

        }

      }, error => {
        console.log('wtf', error);

      });

  }

  async getStaff() {
    let { value }: any = await Preferences.get({ key: 'staff' });
    this.staff = JSON.parse(value);
    console.log(this.staff);
  }

  searchCar() {

    let search = this.ionicForm.value.reg_no;

    this.getClaims(search);

  }

  async getClaims(search, event = null) {

    this.policyFound = false;
    this.claim = null;
    this.reportImages = [];
    this.quotationImages = [];
    this.claimLetterImages = [];
    this.reportImagesUrl = [];
    this.quotationImagesUrl = [];
    this.claimLetterImagesUrl = [];

    this.isLoading = true;

    this.authService.findClaim(search).subscribe(
      data => {
        console.log('data', data);

        this.isLoading = false;
        this.policyFound = true;
        this.policy = data.policy;

        if (data && data.data) {

          if (event) {
            event.target.complete();
          }

          if (data.data) {
            this.claim = data.data;

            if (this.claim && this.claim.claim_type_id) {
              this.ionicForm.controls["claim_type_id"].setValue(Number(this.claim.claim_type_id));
            }
            if (this.claim && this.claim.claim_date) {
              let date = moment(this.claim.claim_date).format('YYYY-MM-DD');
              console.log('date', date);
              this.ionicForm.controls["claim_date"].setValue(date);
            }
            if (this.claim && this.claim.mileage) {
              this.ionicForm.controls["mileage"].setValue(this.claim.mileage);
            }
            if (this.claim && this.claim.home_or_workshop) {
              this.ionicForm.controls["home_or_workshop"].setValue(this.claim.home_or_workshop);
            }
            if (this.claim && this.claim.marketing_officer) {
              this.ionicForm.controls["marketing_officer"].setValue(this.claim.marketing_officer);
            }
          }

          if (this.staff.user_role == 1 || this.staff.user_role == 5 || this.staff.user_role == 6 || this.claim.created_by == this.staff.user_id) {
            this.canDelete = true;
          }

          console.log('claims', this.claim);
          console.log('claim_type_id', this.claim.claim_type_id);
        }
      }, error => {
        this.isLoading = false;
        this.helper.presentAlertDetails('Error', 'No car found.');
        console.log(error);
        if (event) {
          event.target.complete();
        }
      });
  }

  async removeImageOri(attachment_id, type) {

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

            this.removeImageFirebase(attachment_id, type);
          }
        }
      ]
    });

    alert.present();

  }

  async removeImageFirebase(attachment_id, type) {

    console.log(attachment_id, type);

    let data: any = {};

    if (type == 'report') {
      data.report_attachment_id = attachment_id;
    } else if (type == 'quotation') {
      data.quotation_attachment_id = attachment_id;
    }

    this.loading = true;

    this.authService.removeClaimAttachment(this.claim.id, data).subscribe(
      result => {

        this.helper.dissmissLoading();
        this.helper.presentToast('Image delete successfully');
        this.searchCar();
        console.log(result);

      }, error => {
        console.log(error);
        this.helper.dissmissLoading();
        this.helper.presentToast(error.error.message);
      });

  }

  async selectImageSource(type) {
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

      if (type == 'report') {
        this.reportImages.push(data);
      } else if (type == 'quotation') {
        this.quotationImages.push(data);
      } else if (type == 'claim_letter') {
        this.claimLetterImages.push(data);
      }

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

    if (type == 'report') {
      this.reportImages.push(data);
    } else if (type == 'quotation') {
      this.quotationImages.push(data);
    } else if (type == 'claim_letter') {
      this.claimLetterImages.push(data);
    }

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

      if (type == 'report') {
        this.reportImages.push(data);
      } else if (type == 'quotation') {
        this.quotationImages.push(data);
      } else if (type == 'claim_letter') {
        this.claimLetterImages.push(data);
      }
    }

    return;
  }

  async processUpload(file, reg_no, type) {
    this.helper.presentLoading();
    let downloadURL = await this.helper.uploadToFirebase(file, reg_no);

    if (type == 'report') {
      this.updateClaimAttachment(this.claim.id, downloadURL.url, 'storeReport');
    } else if (type == 'quotation') {
      this.updateClaimAttachment(this.claim.id, downloadURL.url, 'storeQuotation');
    } else if (type == 'claim_letter') {
      this.updateClaimAttachment(this.claim.id, downloadURL.url, 'storeClaimLetter');
    }
  }

  async addClaim() {

    console.log('add', this.ionicForm.value);
    this.helper.presentLoading();

    let data: any = {};
    data = this.ionicForm.value;
    data.status = 'pending';
    data.created_by = this.staff.user_id;
    data.created_by_staff_id = this.staff.staff_id;

    console.log('data', data);

    for (const reportImage of this.reportImages) {
      let upload = await this.helper.uploadToFirebase(reportImage.file, data.reg_no);
      console.log('finish... report', upload.url);
      this.reportImagesUrl.push({
        name: reportImage.name,
        image_link: upload.url,
        type: reportImage.type,
      });
    }

    for (const quotationImage of this.quotationImages) {
      let upload2 = await this.helper.uploadToFirebase(quotationImage.file, data.reg_no);
      console.log('finish... quotation', upload2.url2);
      this.quotationImagesUrl.push({
        name: quotationImage.name,
        image_link: upload2.url,
        type: quotationImage.type,
      });
    }

    for (const claimLetterImage of this.claimLetterImages) {
      let upload3 = await this.helper.uploadToFirebase(claimLetterImage.file, data.reg_no);
      console.log('finish... claim_letter', upload3.url2);
      this.claimLetterImagesUrl.push({
        name: claimLetterImage.name,
        image_link: upload3.url,
        type: claimLetterImage.type,
      });
    }

    data.reports = this.reportImagesUrl;
    data.quotations = this.quotationImagesUrl;
    data.claimLetters = this.claimLetterImagesUrl;

    //for import images
    if (this.importreportImages.length > 0) {
      for (const reportImage of this.importreportImages) {
        this.reportImagesUrl.push(reportImage);
      }
      this.importreportImages = [];
    }

    this.authService.addClaim(data).subscribe(
      result => {

        this.helper.dissmissLoading();
        this.helper.presentToast('Claim added successfully');

        data.customer_id = result.customer_id;

        this.firestore.collection('/claims/').add(data).then(() => {
          console.log('result', result);

          let tempData: any = {};

          if (data.quotations.length > 0) {

            console.log('data', data);

            tempData.customer_id = data.customer_id;
            tempData.data = data;
            tempData.policy_id = result.data.policy_id;
            tempData.date = new Date();
            tempData.status = 'quotation';
            tempData.claim_id = result.data.id;
            tempData.marketing_officer = result.data.marketing_officer;

            console.log('tempData', tempData);

            this.firestore.collection('/claim_status_update/').add(tempData).then(() => {
              console.log('success add quotation status');

              this.reportImagesUrl = [];
              this.quotationImagesUrl = [];
              this.claimLetterImagesUrl = [];
            }).catch(error => {
              console.log(error);
            });

          }

        }).catch(error => {
          console.log(error);
        });

        setTimeout(() => {
          this.searchCar();
        }, 500);

      }, error => {
        console.log(error);
        this.helper.dissmissLoading();
        this.helper.presentToast(error.error.message);
      });

  }

  async updateClaim() {

    this.helper.presentLoading();

    let data: any = {};
    data = this.ionicForm.value;

    console.log('updateClaim', data);

    for (const reportImage of this.reportImages) {
      let upload = await this.helper.uploadToFirebase(reportImage.file, data.reg_no);
      console.log('finish... report', upload.url);
      this.reportImagesUrl.push({
        name: reportImage.name,
        image_link: upload.url,
        type: reportImage.type,
      });
    }

    for (const quotationImage of this.quotationImages) {
      let upload2 = await this.helper.uploadToFirebase(quotationImage.file, data.reg_no);
      console.log('finish... quotation', upload2.url2);
      this.quotationImagesUrl.push({
        name: quotationImage.name,
        image_link: upload2.url,
        type: quotationImage.type,
      });
    }

    for (const claimLetterImage of this.claimLetterImages) {
      let upload3 = await this.helper.uploadToFirebase(claimLetterImage.file, data.reg_no);
      console.log('finish... claim_letter', upload3.url2);
      this.claimLetterImagesUrl.push({
        name: claimLetterImage.name,
        image_link: upload3.url,
        type: claimLetterImage.type,
      });
    }

    data.reports = this.reportImagesUrl;
    data.quotations = this.quotationImagesUrl;
    data.claimLetters = this.claimLetterImagesUrl;
    data.claim_id = this.claim.id;
    data.policy_id = this.claim.policy_id;

    //for import images
    if (this.importreportImages.length > 0) {
      for (const reportImage of this.importreportImages) {
        this.reportImagesUrl.push(reportImage);
      }
      this.importreportImages = [];
    }

    this.authService.updateClaimAttachments(this.claim.id, data, 'storeAttachments').subscribe(
      (result: any) => {

        let tempData: any = {};

        if (data.quotations.length > 0) {

          tempData.customer_id = result.customer_id;
          tempData.data = data;
          tempData.date = new Date();
          tempData.status = 'quotation';
          tempData.claim_id = data.claim_id;
          tempData.marketing_officer = this.claim.marketing_officer.id;
          tempData.policy_id = data.policy_id;

          console.log('data', data);
          console.log('updateClaimAttachments', tempData);

          this.firestore.collection('/claim_status_update/').add(tempData).then(() => {
            console.log('success add quotation status');

            this.reportImagesUrl = [];
            this.quotationImagesUrl = [];
            this.claimLetterImagesUrl = [];

          }).catch(error => {
            console.log(error);
          });

        }

        this.helper.dissmissLoading();
        this.helper.presentToast('Claim update successfully');
        this.searchCar();
        console.log(result);

      }, error => {
        console.log(error);
        this.helper.dissmissLoading();
        this.helper.presentToast(error.error.message);
      });

  }

  updateClaimAttachment(claim_id, image_link, type) {

    let data: any = {};
    data.claim_id = claim_id;
    data.image_link = image_link;

    this.authService.updateClaimAttachment(claim_id, data, type).subscribe(
      result => {

        this.helper.dissmissLoading();
        this.helper.presentToast('Claim update successfully');
        this.searchCar();
        console.log(result);

      }, error => {
        console.log(error);
        this.helper.dissmissLoading();
        this.helper.presentToast(error.error.message);
      });

  }

  removeImage(index, type) {

    if (type == 'report') {
      this.reportImages.splice(index, 1);
    } else if (type == 'quotation') {
      this.quotationImages.splice(index, 1);
    } else if (type == 'claim_letter') {
      this.claimLetterImages.splice(index, 1);
    }

  }

  async displayImportImage(): Promise<void> {

    const workshopModal = await this.modalCtrl.create({
      component: ClaimImportsPage,
      componentProps: { policy: this.policy },
      mode: 'ios',
      showBackdrop: false,
      swipeToClose: true,
      breakpoints: [1],
      initialBreakpoint: 1,
    });
    workshopModal.onDidDismiss().then((data: any) => {

      console.log('data', data);
      const images = data.data ? data.data.images : null;
      if (!images) return;

      images.forEach(image => {
        this.importreportImages.push({
          name: (Math.random() + 1).toString(36).substring(7),
          image_link: image,
          type: 'image'
        });
      });

    });
    return await workshopModal.present();
  }

  removeImportImage(index) {

    this.importreportImages.splice(index, 1);

  }

}
