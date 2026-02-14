import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-signup-pending-dialog',
  templateUrl: './signup-pending-dialog.component.html',
  styleUrls: ['./signup-pending-dialog.component.scss']
})
export class SignupPendingDialogComponent {

  constructor(private dialogRef: MatDialogRef<SignupPendingDialogComponent>) {}

  onOk(): void {
    this.dialogRef.close(true);
  }
}
