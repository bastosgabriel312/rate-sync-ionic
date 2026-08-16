import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-popover',
  templateUrl: './user-popover.component.html',
  styleUrls: ['./user-popover.component.scss'],
})
export class UserPopoverComponent {
  @Input()
  userName = 'Nome do Usuário';
  @Input()
  userEmail = 'Email do Usuário';

  constructor(private authService: AuthService, private popoverController: PopoverController) { }

  goToProfile() {}

  logout() {
    this.popoverController.dismiss();
    this.authService.logout();
  }
}
