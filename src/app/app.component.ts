import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
    this.getJourneyID();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  getJourneyID(){
    fetch('https://test-gist.herokuapp.com/api/okay/get-journey-id', {
      method : 'POST',
      body : JSON.stringify({
        username : "pnmb_test",
        password : "Pnmb123@"
      }),
      headers : {'Content-Type' : 'application/json'}
    }).then((res) => { return res.json() }).then((response) => {
      localStorage.setItem('journeyId', response.journeyId);
    }).catch((e) => {
        console.log(e);
    })
  }
}
