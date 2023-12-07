import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent {
  @Input() control: FormControl = new FormControl();
  @Input() inputType: string = 'text';
  @Input() placeholder: string = '';
  @Input() format = '';
}
