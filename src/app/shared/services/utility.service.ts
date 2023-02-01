import { Injectable } from '@angular/core';
import { KeyValue, Location } from '@angular/common';
import { AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NGX_SCROLLBAR_BUFFER_PX } from '../../constants';
import { HttpRequest } from '@angular/common/http';
import * as moment from 'moment-timezone';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  public static validHexCodePattern = /#(?:[0-9a-fA-F]{3}){1,2}/;

  constructor(private router: Router, private location: Location) {}

  /**
   * Convert a camelCase string to a space-separated string in title case.
   * @param str The string to convert
   * @returns The string with space separated words in title case
   */
  public static convertCamelToSpaces(str: string): string {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, function (str) {
        return str.toUpperCase();
      })
      .trim();
  }

  /**
   * Test if a hex color is light or dark.
   * @param color The hexcode to test
   * @returns If the color is light
   */
  public static isColorLight(color: string) {
    let c = color.replace('#', '');
    if (c.length === 3) {
      // convert hex code shorthand (#eee) to full length: #eeeeee
      c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    }
    const rgb = parseInt(c, 16);
    // eslint-disable-next-line: no-bitwise
    const r = (rgb >> 16) & 0xff;
    // eslint-disable-next-line: no-bitwise
    const g = (rgb >> 8) & 0xff;
    // eslint-disable-next-line: no-bitwise
    const b = (rgb >> 0) & 0xff;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125;
  }


  /**
   * Convert a string to title case: 'hello world' -> 'Hello World'
   * @param text The text to be converted
   * @returns The same text in title case
   */
  public static toTitleCase(text: string): string {
    return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  }

  /**
   * Validates all form controls in a form group by touching them
   * @param formGroup The group to check
   */
  public static validateAllFormFields(formGroup: UntypedFormGroup | UntypedFormArray) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup || control instanceof UntypedFormArray) {
        this.validateAllFormFields(control);
      }
    });
  }

  /**
   * Set the value of a cookie
   * @param name The name of the cookie
   * @param value The value of the cookie
   * @param days The number of days to keep the cookie
   */
  public static setCookie(name: string, value: string, days: number) {
    const expires = '; expires=' + new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  }


  /**
   * Avoid change detection error by executing code after the
   * current synchronous code has finished by using Promise.resolve
   * @param codeToExecute The code to execute after the current synchronous code has finished
   * @source https://tinyurl.com/yfb474cv
   */
  public static executeAfterSynchronousCode(codeToExecute: () => void) {
    Promise.resolve(null).then(() => {
      codeToExecute();
    });
  }

  /**
   * Update the current URL's `:id` from 0 after creating a new object
   * (visually and programatically so it works to route to children)
   * @param id id of the new object
   */
  public updateUrlId(id: string | number) {
    const url = this.router.url.replace('/0', '/' + id);
    this.location.replaceState(url);
    this.router.routerState.snapshot.url = url;
  }

  randomArrayValue<T>(array: Array<any>): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  trimAllSpaces(value: string): string {
    value = value.trim();
    value = value.replace(' ', '');
    value = value.replace('-', '');
    return value;
  }

  trimNonNumberChars(value: string) {
    return value ? value.replace(/\D/g, '') : null;
  }

  getCanadianTimezones(): KeyValue<string, string>[] {
    return moment.tz
      .names()
      .filter((tz) => tz.startsWith('Canada/'))
      .map((tz) => {
        return { key: tz, value: tz.split('/')[1] };
      });
  }

  stringToFont(str: string): string {
    const fonts = ['Helvetica'];
    return fonts[+this.randomSeed175(str) % fonts.length];
  }

  stringToBoolean(str: string): boolean {
    return !!((+this.randomSeed175(str) % 2) - 1);
  }

  stringToRGB(str: string): string {
    if (str.length > 5) {
      return (
        'rgb(' +
        [
          this.randomSeed175(str.substr(0, 2)),
          this.randomSeed175(str.substr(2, 2)),
          this.randomSeed175(str.substr(4, 2)),
        ].toString() +
        ')'
      );
    } else if (str.length > 3) {
      return (
        'rgb(' +
        [
          this.randomSeed175(str.substr(0, 2)),
          this.randomSeed175(str.substr(2, 1)),
          this.randomSeed175(str.substr(3, 1)),
        ].toString() +
        ')'
      );
    } else if (str.length === 3) {
      return (
        'rgb(' +
        [
          this.randomSeed175(str.substr(0, 1)),
          this.randomSeed175(str.substr(1, 1)),
          this.randomSeed175(str.substr(2, 1)),
        ].toString() +
        ')'
      );
    } else if (str.length < 3) {
      return (
        'rgb(' +
        [
          this.randomSeed175(str.substr(0, 1)),
          this.randomSeed175(str.substr(0, 1)),
          this.randomSeed175(str.substr(0, 1)),
        ].toString() +
        ')'
      );
    } else {
      return 'rgb(120,3,90)';
    }
  }

  randomSeed175(str: string): string {
    let seed = +Array.from(str)
      .map((char) => char.charCodeAt(0))
      .join('');
    const x = Math.sin(seed++) * 10000;
    return (Math.round((x - Math.floor(x)) * 1000) % 175).toString();
  }

  getTimezoneByPostalCode(postalCode: string): string | null {
    if (!postalCode) {
      return null;
    }
    switch (postalCode.charAt(0)) {
      case 'A':
        return 'Canada/Newfoundland';
      case 'B':
        return 'Canada/Atlantic';
      case 'C':
        return 'Canada/Atlantic';
      case 'E':
        return 'Canada/Atlantic';
      case 'G':
      case 'H':
      case 'J':
        return 'Canada/Eastern';
      case 'K':
      case 'L':
      case 'M':
      case 'N':
      case 'P':
        return 'Canada/Eastern';
      case 'R':
        return 'Canada/Central';
      case 'S':
        return 'Canada/Saskatchewan';
      case 'T':
        return 'Canada/Mountain';
      case 'V':
        return 'Canada/Pacific';
      case 'X':
        return 'Canada/Mountain';
      case 'Y':
        return 'Canada/Yukon';
      default:
        return null;
    }
  }
}
