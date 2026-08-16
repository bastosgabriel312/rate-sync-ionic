import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['../../app.component.scss'],
})
export class ToolbarComponent implements OnInit {
  @Input() title: string = "RateSync";
  isAndroid: boolean = false;
  userPhoto: string | undefined | null;
  userName: string | undefined | null;
  currentUser: any;
  isLoginPage: boolean = false;

  constructor(private platform: Platform, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
    this.authService.userPhoto$.subscribe(url => this.userPhoto = url);
    this.authService.displayName$.subscribe(name => this.userName = name);
    this.isAndroid = this.platform.is('android');
    this.isLoginPage = this.router.url === '/login';
  }




}
