import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DatePipe } from '@angular/common'
import { AuthenticationService } from '../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform, LoadingController, ToastController, ActionSheetController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';
import { HelperService } from '../services/helper.service';
import { decode } from "base64-arraybuffer";
import * as moment from 'moment';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

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
  staff;
  loading;
  ionicForm: FormGroup;
  reportImages = [];
  quotationImages = [];
  reportImagesUrl = [];
  quotationImagesUrl = [];
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
    private helper: HelperService,
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage,
    public alertController: AlertController
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
      // engine_oil_type_id: ['', []],
      // invoice_no: ['', [Validators.required]],
      // invoice_date: [currentDate, [Validators.required]],
      // current_mileage: ['', [Validators.required]],

      // next_due_mileage: ['', []],
      // next_due_date: ['', []],
      // next_due_mileage_atf: ['', []],
      // next_due_date_atf: ['', []],

      // workshop_name: ['', [Validators.required]],
      // remarks: ['', []],
    });

    this.route.queryParams.subscribe(params => {
      if (params && params.reg_no) {
        this.ionicForm.controls["reg_no"].setValue(params.reg_no);

        this.searchCar();
      }
    });


    this.authService.getGenerals().subscribe(
      data => {
        console.log('wtf', data);

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
    let { value }: any = await Storage.get({ key: 'staff' });
    this.staff = JSON.parse(value);
    console.log(this.staff);
  }

  loadImages() {
    // this.api.getImages().subscribe(images => {
    //   this.images = images;
    // });
  }

  searchCar() {

    let search = this.ionicForm.value.reg_no;

    console.log(search);

    this.getClaims(search);

  }

  async getClaims(search, event = null) {

    this.policyFound = false;
    this.claim = null;
    this.reportImages = [];
    this.quotationImages = [];
    this.reportImagesUrl = [];
    this.quotationImagesUrl = [];

    this.isLoading = true;

    this.authService.findClaim(search).subscribe(
      data => {
        console.log('data', data);

        this.isLoading = false;
        this.policyFound = true;

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
              let date = moment(this.claim.claim_date).format('DD-MM-YYYY');
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

  async selectImageSource(type) {
    const buttons = [
      {
        text: 'Take Photo',
        icon: 'camera',
        handler: () => {
          this.addImage(CameraSource.Camera, type);
        }
      },
      {
        text: 'Choose From Photos',
        icon: 'image',
        handler: () => {
          this.addImage(CameraSource.Photos, type);
        }
      }
    ];

    // Only allow file selection inside a browser
    // if (!this.plt.is('hybrid')) {
    //   buttons.push({
    //     text: 'Choose a File',
    //     icon: 'attach',
    //     handler: () => {
    //       this.fileInput.nativeElement.click();
    //     }
    //   });
    // }

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      mode: 'ios',
      buttons
    });
    await actionSheet.present();
  }

  async addImage(source: CameraSource, type) {

    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source
    });

    // const base64Data = await this.readAsBase64(image);

    // const blobData = this.b64toBlob(image.base64String, `image/${image.format}`);

    const blob = new Blob([new Uint8Array(decode(image.base64String))], {
      type: `image/${image.format}`,
    });
    let filename: string = "" + moment().unix();

    const file = new File([blob], filename, {
      lastModified: moment().unix(),
      type: blob.type,
    });

    let data: any = {};
    data = this.ionicForm.value;
    this.reportImagesUrl = [];
    this.quotationImagesUrl = [];

    if (this.claim && this.claim.id) {
      const alert = await this.alertController.create({
        header: 'Claim Exist!',
        message: 'Are you sure want to upload the image?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
            }
          }, {
            text: 'Upload',
            handler: () => {
              this.processUpload(file, data.reg_no, type);
            }
          }
        ]
      });
      await alert.present();

    } else {
      if (type == 'report') {
        this.reportImages.push({
          id: Date.now(),
          base64: "data:image/jpeg;base64, " + image.base64String,
          file: file,
          format: image.format
        });
      } else if (type == 'quotation') {
        this.quotationImages.push({
          id: Date.now(),
          base64: "data:image/jpeg;base64, " + image.base64String,
          file: file,
          format: image.format
        });
      }
    }
  }

  async processUpload(file, reg_no, type) {
    this.helper.presentLoading();
    let downloadURL = await this.uploadToFirebase(file, reg_no, type, true);

    if (type == 'report') {
      this.updateClaimAttachment(this.claim.id, downloadURL.url, 'storeReport');
    } else if (type == 'quotation') {
      this.updateClaimAttachment(this.claim.id, downloadURL.url, 'storeQuotation');
    }
  }

  private async readAsBase64(photo: Photo) {
    if (this.plt.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path
      });

      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  // Used for browser direct file upload
  // uploadFile(event: EventTarget) {
  //   const eventObj: MSInputMethodContext = event as MSInputMethodContext;
  //   const target: HTMLInputElement = eventObj.target as HTMLInputElement;
  //   const file: File = target.files[0];
  //   this.api.uploadImageFile(file).subscribe((newImage: ApiImage) => {
  //     this.images.push(newImage);
  //   });
  // }

  // deleteImage(image: ApiImage, index) {
  //   this.api.deleteImage(image._id).subscribe(res => {
  //     this.images.splice(index, 1);
  //   });
  // }

  // Helper function
  // https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
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

  async addClaim() {

    console.log('add');
    this.helper.presentLoading();

    let data: any = {};
    data = this.ionicForm.value;
    data.status = 'pending';
    data.created_by = this.staff.user_id;

    console.log('data', data);

    for (const reportImage of this.reportImages) {
      let upload = await this.uploadToFirebase(reportImage.file, data.reg_no, 'report');
      console.log('finish... report', upload.url);
      this.reportImagesUrl.push({
        name: upload.filename,
        image_link: upload.url,
      });
    }

    for (const quotationImage of this.quotationImages) {
      let upload2 = await this.uploadToFirebase(quotationImage.file, data.reg_no, 'quotation');
      console.log('finish... quotation', upload2.url2);
      this.quotationImagesUrl.push({
        name: upload2.filename,
        image_link: upload2.url,
      });
    }

    console.log('finish... all');
    console.log('reports', this.reportImagesUrl);
    console.log('quotations', this.quotationImagesUrl);

    data.reports = this.reportImagesUrl;
    data.quotations = this.quotationImagesUrl;

    this.authService.addClaim(data).subscribe(
      result => {

        this.helper.dissmissLoading();
        this.helper.presentToast('Claim added successfully');
        // this.isSubmitted = true;
        // this.navCtrl.back();
        console.log(result);

        setTimeout(() => {
          this.searchCar();
        }, 500);

        // if (data && data) {
        // }
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


    // await this.fileUploadTask.snapshotChanges().pipe(
    //   finalize(async () => {
    //     console.log('finish fileUploadTask');

    //     await imageRef.getDownloadURL().subscribe(downloadURL => {
    //       console.log('downloadURL', downloadURL);
    //       downloadURLlink = downloadURLlink;

    //       if (type == 'report') {

    //         if (isUpdate) {
    //           this.updateClaimAttachment(this.claim.id, downloadURL, 'storeReport');
    //         } else {
    //           this.reportImagesUrl.push({
    //             name: filename,
    //             image_link: downloadURL,
    //           });
    //         }

    //       } else if (type == 'quotation') {

    //         if (isUpdate) {
    //           this.updateClaimAttachment(this.claim.id, downloadURL, 'storeQuotation');
    //         } else {
    //           this.quotationImagesUrl.push({
    //             name: filename,
    //             image_link: downloadURL,
    //           });
    //         }

    //       }

    //     });
    //   })
    // ).toPromise();

    // return downloadURLlink;

    // this.trackSnapshot = this.fileUploadTask.snapshotChanges().pipe(

    //   finalize(() => {
    //     console.log('finalize');

    //     // Retreive uploaded image storage path
    //     this.UploadedImageURL = imageRef.getDownloadURL();
    //     this.UploadedImageURL.subscribe(resp => {

    //       // resp; this is image path 

    //       console.log('image path', resp);

    //     }, error => {
    //       console.log(error);
    //     })
    //   }),
    //   tap(snap => {
    //     console.log('trackSnapshot');
    //     // this.imgSize = snap.totalBytes;
    //   })
    // )

  }

}
