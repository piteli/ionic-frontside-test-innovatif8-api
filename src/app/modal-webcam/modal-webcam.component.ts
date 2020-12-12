import { Component, EventEmitter, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-webcam',
  templateUrl: './modal-webcam.component.html',
  styleUrls: ['./modal-webcam.component.scss'],
})
export class ModalWebcamComponent implements OnInit {

  @Input() captureWebcam : any;

  constructor(public modalController : ModalController) { }

  ngOnInit() {}

  closeModal(){
    this.modalController.dismiss();
  }

  capture(){
    this.closeModal();
    this.captureWebcam();
  }

}
