import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ViewChild } from '@angular/core';
import { IonSlides, LoadingController, AlertController, Platform, ActionSheetController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import * as $ from 'jquery';

const BASE_URL = "https://test-gist.herokuapp.com";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

@ViewChild('slides', {static : false}) slides : IonSlides;


  journeyID : string = null;
  frontImageURI : string = null;
  backImageURI : string = null;
  frontFaceImageURI : string = null;
  loading;
  scorecard : string = null;
  platforms : any;
  platformDevice: any = 'mobile';

  constructor(private camera: Camera, 
                public loadingController: LoadingController,
                private alertController : AlertController,
                private domSanitizer: DomSanitizer,
                private platform : Platform,
                public actionSheetController: ActionSheetController) {
    this.loadJourneyID();
    this.platforms = this.platform.platforms();
    if(this.platforms.includes('mobile')) this.platformDevice = 'mobile';
    else this.platformDevice = 'web';
  }

  loadJourneyID = () => {
      const journeyStorage = localStorage.getItem('journeyId');
    if( journeyStorage == undefined){
      this.loadAgain();
      return;
    }
    this.journeyID = journeyStorage;
  }
  
  loadAgain = () => {
    setTimeout(() => {
      this.loadJourneyID();
    }, 2000);
  }

promptUploadMedia = async(cameraType, imageType) => {
    const actionSheet = await this.actionSheetController.create({
        header: 'Select Upload Type',
        cssClass: 'my-custom-class',
        buttons: [{
          text: 'Using Camera',
          handler: () => {
            this.loadCamera(cameraType, imageType, this.camera.PictureSourceType.CAMERA);
          }
        }, {
          text: 'Upload from Gallery',
          handler: () => {
            this.loadCamera(cameraType, imageType, this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },{
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
      });
      await actionSheet.present();
  }

  loadCamera(cameraType, imageType, pictureSourceType){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      cameraDirection : cameraType === 'BACK' ? this.camera.Direction.BACK : this.camera.Direction.FRONT,
      sourceType : pictureSourceType
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = imageData;
      console.log(base64Image);
      if(cameraType === 'BACK' && imageType === 'IC_FRONT') this.frontImageURI = base64Image;
      if(cameraType === 'BACK' && imageType === 'IC_BACK') this.backImageURI = base64Image;
      if(cameraType === 'FRONT' && imageType === 'SELFIE') this.frontFaceImageURI = base64Image;
     }, (err) => {
      // Handle error
      console.log(err);
     });
  }

  callOkayIDCentralizedAPI = async() => {
    this.presentLoading();
    const response = await fetch(`${BASE_URL}/api/okay/id`, {
      method : 'POST',
      body : JSON.stringify(
        {
          "journeyId": this.journeyID,
          "base64ImageString": this.frontImageURI,
          "backImage": this.backImageURI,
          "imageEnabled":false,
          "faceImageEnabled":false,
          "cambodia":false
      }
      ),
      headers : {'Content-Type' : 'application/json'}
    }).then((res) => { return res.json() });
    if(response == undefined){this.dismissLoading();return;}
    this.dismissLoading();
    this.showResults('/api/okay/id', JSON.stringify(response));
    // if(response.status === 'success' && response.messageCode === 'api.success')
    // { this.slides.slideNext(); }
  }

  callOkayFaceCentralizedAPI = async() => {
    this.presentLoading();
    const response = await fetch(`${BASE_URL}/api/okay/face`, {
      method : 'POST',
      body : JSON.stringify(
        {
          "journeyId": this.journeyID,
          "livenessDetection" : "true",
          "imageBestBase64" : this.frontFaceImageURI,
          "imageIdCardBase64" : this.frontImageURI
      }
      ),
      headers : {'Content-Type' : 'application/json'}
    }).then((res) => { return res.json() });
    if(response == undefined){this.dismissLoading();return;}
    this.dismissLoading();
    this.showResults('/api/okay/face', JSON.stringify(response));
    // if(response.status === 'success' && response.messageCode === 'api.success')
    // { this.slides.slideNext(); }
  }

  callOkayDocCentralizedAPI = async() => {
    this.presentLoading();
    const response = await fetch(`${BASE_URL}/api/okay/doc`, {
      method : 'POST',
      body : JSON.stringify(
        {
          "journeyId":this.journeyID,
          "type":"nonpassport",
          "idImageBase64Image": this.frontImageURI,
          "version": "7",
          "docType":"mykad"
        }
      ),
      headers : {'Content-Type' : 'application/json'}
    }).then((res) => { return res.json() });
    if(response == undefined){this.dismissLoading();return;}
    this.dismissLoading();
    this.showResults('/api/okay/doc', JSON.stringify(response));
    // if(response.status === 'success' && response.messageCode === 'api.success')
    // { this.slides.slideNext(); }
  }

  getResultsScorecard = () => {
      this.presentLoading();
      this.callOkayScoreCardCentralizedAPI();
  }

  callOkayScoreCardCentralizedAPI = async() => {
    const response = await fetch(`${BASE_URL}/api/okay/scorecard`, {
      method : 'POST',
      body : JSON.stringify({
        journeyId : this.journeyID
      }),
      headers : {'Content-Type' : 'application/json'}
    }).then((res) => { return res.json() });
    if(response == undefined){this.dismissLoading();return;}
    this.scorecard = JSON.stringify(response);
    this.dismissLoading();
  }

   presentLoading = async() => {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Processing...'
    });
    await this.loading.present();
  }

dismissLoading = async() => {
      await this.loading.dismiss();
  }

showResults = async(api_name, json_message) => {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Results',
      subHeader: `Following is response from ${api_name}`,
      message: json_message,
      backdropDismiss : false,
      buttons: [{
        text: 'Next',
        handler: () => {
            this.slides.slideNext();
        }
      }]
    });

    await alert.present();
  }

getBase64ForWeb = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
}

fileOnChange = (event, type) => {
    const files = event.target.files;
    const file = files[0];
    this.getBase64ForWeb(file).then((base64 : string) => {
        const split = base64.split(",");
        base64 = split[1];
        switch(type){
            case "okayDocFrontImageURI":
            case "okayFaceFrontImageURI":
            case "okayIDFrontImageURI":
                this.frontImageURI = base64;
                break;
            case "okayIDBackImageURI":
                this.backImageURI = base64;
                break;
            case "okayFaceSelfieImageURI":
                this.frontFaceImageURI = base64;
                break;
            default:
                console.log('none');
        }
    })
}

  okayIDCentralizedAPISampleResponse = () => {
    return {
      "status": "success",
      "message": "",
      "result": [
          {
              "ListVerifiedFields": {
                  "pFieldMaps": [
                      {
                          "wLCID": 0,
                          "FieldType": 1,
                          "wFieldType": 1,
                          "Field_MRZ": null,
                          "Field_Visual": "MYS",
                          "Field_Barcode": null,
                          "Matrix": [
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0
                          ]
                      },
                      {
                          "wLCID": 0,
                          "FieldType": 2,
                          "wFieldType": 2,
                          "Field_MRZ": null,
                          "Field_Visual": "861200556488",
                          "Field_Barcode": null,
                          "Matrix": [
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0
                          ]
                      },
                      {
                          "wLCID": 1086,
                          "FieldType": 71172108,
                          "wFieldType": 12,
                          "Field_MRZ": null,
                          "Field_Visual": "PEREMPUAN",
                          "Field_Barcode": null,
                          "Matrix": [
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0
                          ]
                      },
                      {
                          "wLCID": 0,
                          "FieldType": 12,
                          "wFieldType": 12,
                          "Field_MRZ": null,
                          "Field_Visual": "F",
                          "Field_Barcode": null,
                          "Matrix": [
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0
                          ]
                      },
                      {
                          "wLCID": 0,
                          "FieldType": 17,
                          "wFieldType": 17,
                          "Field_MRZ": null,
                          "Field_Visual": "NO 22 JATAN BB 3/3^NANDAR RUDIT PUCHONG^47000 PUCHONG^SELANGOR",
                          "Field_Barcode": null,
                          "Matrix": [
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0
                          ]
                      },
                      {
                          "wLCID": 0,
                          "FieldType": 25,
                          "wFieldType": 25,
                          "Field_MRZ": null,
                          "Field_Visual": "LIEW HEY LEE",
                          "Field_Barcode": null,
                          "Matrix": [
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0
                          ]
                      },
                      {
                          "wLCID": 0,
                          "FieldType": 38,
                          "wFieldType": 38,
                          "Field_MRZ": null,
                          "Field_Visual": "Malaysia",
                          "Field_Barcode": null,
                          "Matrix": [
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0
                          ]
                      },
                      {
                          "wLCID": 0,
                          "FieldType": 57,
                          "wFieldType": 57,
                          "Field_MRZ": null,
                          "Field_Visual": "8612005564880202",
                          "Field_Barcode": null,
                          "Matrix": [
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0
                          ]
                      },
                      {
                          "wLCID": 0,
                          "FieldType": 433,
                          "wFieldType": 433,
                          "Field_MRZ": null,
                          "Field_Visual": "WARGANEGARA",
                          "Field_Barcode": null,
                          "Matrix": [
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0,
                              0
                          ]
                      }
                  ]
              }
          }
      ],
      "documentType": "Malaysia - Id Card #2"
  }
  }

  okayFaceCentralizedAPISampleResponse = () => {
    return {
      "status": "success",
      "messageCode": "api.success",
      "imageBestLiveness": {
          "probability": 0.9999331,
          "score": 9.612308,
          "quality": 0.6691686
      },
      "request_id": "1591169623008663I8E5268153513648",
      "result_idcard": {
          "confidence": 88.0169
      }
  }

}

  okayDocCentralizedAPISampleResponse = () => {
    return {
      "status": "success",
      "messageCode": "api.success",
      "message": "",
      "id": "848a9a59-3a20-4688-b560-c23f8da7caa7",
      "methodList": [
          {
              "method": "landmark",
              "label": "Landmark Analysis Result",
              "componentList": [
                  {
                      "code": "l-mykad-header",
                      "label": "Kad Pengenalan Header",
                      "value": "34.4195",
                      "imageUrl": "/public/image/v2/848a9a59-3a20-4688-b560-c23f8da7caa7?type=l-mykad-header",
                      "refImageUrl": null
                  },
                  {
                      "code": "l-mykad-logo",
                      "label": "MyKad Logo",
                      "value": "95.5827",
                      "imageUrl": "/public/image/v2/848a9a59-3a20-4688-b560-c23f8da7caa7?type=l-mykad-logo",
                      "refImageUrl": null
                  },
                  {
                      "code": "l-my-flag-logo",
                      "label": "Malaysia Flag",
                      "value": "96.8136",
                      "imageUrl": "/public/image/v2/848a9a59-3a20-4688-b560-c23f8da7caa7?type=l-my-flag-logo",
                      "refImageUrl": null
                  },
                  {
                      "code": "l-chip",
                      "label": "Chip",
                      "value": "75.511",
                      "imageUrl": "/public/image/v2/848a9a59-3a20-4688-b560-c23f8da7caa7?type=l-chip",
                      "refImageUrl": null
                  },
                  {
                      "code": "l-hibiscus",
                      "label": "Hibiscus",
                      "value": "68.65390000000001",
                      "imageUrl": "/public/image/v2/848a9a59-3a20-4688-b560-c23f8da7caa7?type=l-hibiscus",
                      "refImageUrl": null
                  },
                  {
                      "code": "l-msc",
                      "label": "MSC",
                      "value": "93.5061",
                      "imageUrl": "/public/image/v2/848a9a59-3a20-4688-b560-c23f8da7caa7?type=l-msc",
                      "refImageUrl": null
                  }
              ]
          },
          {
              "method": "font",
              "label": "MyKad Font Checking Result",
              "componentList": [
                  {
                      "code": "f-id-no",
                      "label": "ID No",
                      "value": "Pass",
                      "imageUrl": "/public/image/v2/848a9a59-3a20-4688-b560-c23f8da7caa7?type=f-id-no",
                      "refImageUrl": "/public/image/v2/848a9a59-3a20-4688-b560-c23f8da7caa7?type=f-id-no-ref"
                  }
              ]
          },
          {
              "method": "microprint",
              "label": "Microprint Score",
              "componentList": [
                  {
                      "code": "microprint",
                      "label": "Microprint",
                      "value": "12",
                      "imageUrl": "/public/image/v2/848a9a59-3a20-4688-b560-c23f8da7caa7?type=microprint",
                      "refImageUrl": null
                  }
              ]
          },
          {
              "method": "hologram",
              "label": "Hologram",
              "componentList": [
                  {
                      "code": "hologram",
                      "label": "Hologram",
                      "value": "Fail,Fail",
                      "imageUrl": "/public/image/v2/848a9a59-3a20-4688-b560-c23f8da7caa7?type=hologram",
                      "refImageUrl": null
                  }
              ]
          },
          {
              "method": "substitution",
              "label": "Ghost Photo Comparison",
              "componentList": [
                  {
                      "code": "substitution",
                      "label": "Substitution Score",
                      "value": "Pass",
                      "imageUrl": null,
                      "refImageUrl": null
                  }
              ]
          },
          {
              "method": "docType",
              "label": "MyKad Type",
              "componentList": [
                  {
                      "code": "docType",
                      "label": "IC Type",
                      "value": "New IC",
                      "imageUrl": null,
                      "refImageUrl": null
                  }
              ]
          },
          {
              "method": "colorMode",
              "label": "Color Mode",
              "componentList": [
                  {
                      "code": "colorMode",
                      "label": "Color",
                      "value": "Pass",
                      "imageUrl": null,
                      "refImageUrl": null
                  }
              ]
          },
          {
              "method": "screen",
              "label": "Screen Detection",
              "componentList": [
                  {
                      "code": "screen",
                      "label": "Screen Detection",
                      "value": "Pass",
                      "imageUrl": null,
                      "refImageUrl": null
                  }
              ]
          },
          {
              "method": "holocolor",
              "label": "Ghost Photo Color Detection",
              "componentList": [
                  {
                      "code": "holocolor",
                      "label": "Ghost Photo Color Detection",
                      "value": "Pass",
                      "imageUrl": null,
                      "refImageUrl": null
                  }
              ]
          },
          {
              "method": "idBlurDetection",
              "label": "ID Blur Detection",
              "componentList": [
                  {
                      "code": "idBlurDetection",
                      "label": "ID Blur Detection",
                      "value": "Pass",
                      "imageUrl": null,
                      "refImageUrl": null
                  }
              ]
          },
          {
              "method": "idBrightnessDetc",
              "label": "ID Brightness Detection",
              "componentList": [
                  {
                      "code": "idBrightnessDetc",
                      "label": "ID Brightness Detection",
                      "value": "Pass",
                      "imageUrl": null,
                      "refImageUrl": null
                  }
              ]
          },
          {
              "method": "faceBrightnessDetc",
              "label": "Face Brightness Detection",
              "componentList": [
                  {
                      "code": "faceBrightnessDetc",
                      "label": "Face Brightness Detection",
                      "value": "Pass",
                      "imageUrl": null,
                      "refImageUrl": null
                  }
              ]
          },
          {
              "method": "contentSubstitution",
              "label": "Content Substitution",
              "componentList": [
                  {
                      "code": "contentSubstitution",
                      "label": "Content Substitution",
                      "value": "Pass",
                      "imageUrl": "/public/image/v2/848a9a59-3a20-4688-b560-c23f8da7caa7?type=contentSubstitution",
                      "refImageUrl": null
                  }
              ]
          }
      ],
      "outputImageList": [
          {
              "tag": "holoFace",
              "imageUrl": "/public/image/v2/848a9a59-3a20-4688-b560-c23f8da7caa7?type=holoFace"
          },
          {
              "tag": "idFace",
              "imageUrl": "/public/image/v2/848a9a59-3a20-4688-b560-c23f8da7caa7?type=idFace"
          }
      ]
   }
  }

  okayScoreCardCentralizedSampleResponse = () => {
    return {
      "status": "success",
      "messageCode": null,
      "message": null,
      "scorecardResultList": [
          {
              "scorecardStatus": "clear",
              "docType": "mykad_back",
              "checkResultList": [
                  {
                      "checkType": "liveFaceCheck",
                      "checkStatus": "P" 
                  },
                  {
                      "checkType": "facialVerification",
                      "checkStatus": "P" 
                  },
                  {
                      "checkType": "landmark",
                      "checkStatus": "P" 
                  }
              ]
          },
          {
              "scorecardStatus": "cautious",
              "docType": "mykad_new",
              "checkResultList": [
                  {
                      "checkType": "liveFaceCheck",
                      "checkStatus": "P" 
                  },
                  {
                      "checkType": "facialVerification",
                      "checkStatus": "P" 
                  },
                  {
                      "checkType": "landmark",
                      "checkStatus": "P" 
                  },
                  {
                      "checkType": "colorDetection",
                      "checkStatus": "P" 
                  },
                  {
                      "checkType": "holographicPhotoQualityCheck",
                      "checkStatus": "P" 
                  },
                  {
                      "checkType": "screenDetection",
                      "checkStatus": "P" 
                  },
                  {
                      "checkType": "idNoFontCheck",
                      "checkStatus": "P" 
                  },
                  {
                      "checkType": "microprint",
                      "checkStatus": "C" 
                  },
                  {
                      "checkType": "hologram",
                      "checkStatus": "F" 
                  },
                  {
                      "checkType": "holographicPhotoComparision",
                      "checkStatus": "P" 
                  }
              ]
          }
      ]
  }
  }

}
