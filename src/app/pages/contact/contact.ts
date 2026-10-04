import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  submitted = signal(false);
  isSubmitting = signal(false);

  contactData = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  submitForm(form: NgForm): void {
    if (form.invalid) {
      Object.keys(form.controls).forEach((key) => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitted.set(true);
      form.resetForm();
    }, 500);
  }

  reset(form?: NgForm): void {
    this.submitted.set(false);
    if (form) {
      form.resetForm();
    }
  }
}
