import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { HTTP } from '@ionic-native/http/ngx';  

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private http: HTTP
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

    // fetch('http://www.pnmb.com.my/Kopten/Innovatif8/api/okay/getJourneyId',
    // {
    //   method : 'POST',
    //   body : JSON.stringify({
    //     username : "pnmb_test",
    //     password : "Pnmb123@"
    //   }),
    //   headers : {
    //     'Content-Type' : 'application/json'
    //   }
    // }).then((res) => res.json()).then((res) => {
    //   console.log('success');
    //   console.log(res);
    // }).catch((err) => {
    //   console.log('here is an error');
    //   console.log(err);
    // })

    this.http.setDataSerializer('json'); 
    this.http.post('http://www.pnmb.com.my/Kopten/Innovatif8/api/okay/getJourneyId',
    {
      username : "pnmb_test",
      password : "Pnmb123@"
    },{
      'Content-Type' : 'application/json',
      'Accept' : 'application/json'
    }).then((res) => {
      const json = JSON.parse(res.data);
      localStorage.setItem('journeyId', json.journeyId);
    }).catch((err) => {
      console.log('here is an error');
      console.log(err);
    });

    
  }
}
