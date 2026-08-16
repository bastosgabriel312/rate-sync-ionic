import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { LoginPage } from './login.page';
import { LoginRoutingModule } from './login-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from "src/app/components/components.module";


@NgModule({
  imports: [
    LoginRoutingModule,
    IonicModule,
    CommonModule,
    FormsModule,
    ComponentsModule
],
  declarations: [LoginPage]
})
export class LoginPageModule {}
