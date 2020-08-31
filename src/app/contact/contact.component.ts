import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Feedback, ContactType } from '../shared/feedback';
import { FA_ICONS } from '../shared/fontawesome-const';

import { flyInOut, expand } from '../animations/app.animation';

import { FeedbackService } from '../services/feedback.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block'
  },
  animations: [
    flyInOut(),
    expand()
  ]
})
export class ContactComponent implements OnInit {

  FA_ICONS = FA_ICONS;

  feedbackForm: FormGroup;
  feedback: Feedback;
  feedbackCopy;
  contactType = ContactType;

  feedbackErrMess: string;

  displaySpinner = false;
  displayForm = true;
  displayFeedback = false;

  @ViewChild('fform') feedbackFormDirective;

  formErrors = {
    'firstname': '',
    'lastname': '',
    'telnum': '',
    'email': ''
  }

  validationMessages = {
    'firstname': {
      'required': 'First Name is required.',
      'minlength': 'First Name must be at least 2 characters long.',
      'maxlength': 'FirstName cannot be more than 25 characters long.'
    },
    'lastname': {
      'required': 'Last Name is required.',
      'minlength': 'Last Name must be at least 2 characters long.',
      'maxlength': 'Last cannot be more than 25 characters long.'
    },
    'telnum': {
      'required': 'Tel. number is required.',
      'pattern': 'Tel. number must contain only numbers.'
    },
    'email': {
      'required': 'Email is required.',
      'email': 'Email not in valid format.' 
    }
  }

  constructor(private fb: FormBuilder,
    private feedbackService: FeedbackService) {
    this.createForm();
  }

  ngOnInit(): void {
  }

  createForm() {
    this.feedbackForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      telnum: ['', [Validators.required, Validators.pattern]],
      email: ['', [Validators.required, Validators.email]],
      agree: false,
      contacttype: 'None',
      message: ''
    });

    this.feedbackForm.valueChanges.subscribe(data => this.onValueChanged(data));
  }

  onValueChanged(data?: any){
    if(!this.feedbackForm){ return; }
    const form = this.feedbackForm;
    for(const field in this.formErrors){
      if(this.formErrors.hasOwnProperty(field)){
        this.formErrors[field] = '';
        const control = form.get(field);
        if(control && control.dirty && !control.valid){
          const messages = this.validationMessages[field];
          for(const key in control.errors){
            if(control.errors.hasOwnProperty(key)){
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.feedback = this.feedbackForm.value;
    this.feedbackCopy = {id: '', ...this.feedback};
    this.displaySpinner = true;
    this.displayForm = false;
    this.feedbackService.submitFeedback(this.feedbackCopy).
      subscribe(feedback => { this.feedbackCopy = feedback, this.feedback = feedback, this.displaySpinner = false, this.displayFeedback = true, setTimeout(() => { this.displayForm = true; this.displayFeedback = false}, 5000);}, 
          feedbackErrMess => {this.feedback = null; this.feedbackCopy = null; this.displaySpinner = false; this.displayForm = true; this.feedbackErrMess = <any>feedbackErrMess});

    
    this.feedbackFormDirective.resetForm();

    this.feedbackForm.reset({
      firstname: '',
      lastname: '',
      telnum: '',
      email: '',
      agree: false,
      contacttype: 'None',
      message: ''
    });
  }
}
