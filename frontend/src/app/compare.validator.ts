import { AbstractControl, ValidatorFn } from '@angular/forms';

export function compareValidator(controlNameToCompare: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const controlToCompare = control.root.get(controlNameToCompare);
      if (controlToCompare && controlToCompare.value !== control.value) {
        controlToCompare.setErrors({ 'compare': true });
        return { 'compare': true };
      } else {
        controlToCompare?.setErrors(null);
        return null;
      }
    };
  }