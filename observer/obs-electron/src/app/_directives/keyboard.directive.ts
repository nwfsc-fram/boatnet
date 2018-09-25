// Based on code from https://github.com/Tora-Bora/angular-kiosk

import {
  Directive,
  ElementRef,
  Input,
  AfterViewInit,
  HostListener,
  OnInit,
  SimpleChanges,
  OnChanges,
  EventEmitter,
  Output
} from '@angular/core';
import { KeyboardOptions, NavigateOptions } from 'virtual-keyboard';

import * as $ from 'jquery';
import 'virtual-keyboard';

@Directive({
  selector: '[appKeyboard]'
})
export class KeyboardDirective implements OnChanges, AfterViewInit {
  constructor(private el: ElementRef) {}

  @Input() appKeyboard: boolean;
  @Input() keyboardLayout: string;
  @Input() keyboardPosition: string; // "bottom" or "top"

  @Output() keyPress: EventEmitter <string> = new EventEmitter();

  public keyboard: any;
  kbOpts: KeyboardOptions;

  makeKeyboard(layout: string) {
    this.kbOpts = {
      type: 'input',
      display: {
        bksp: '\u2b05'
      },
      layout: layout,
      usePreview: false,
      autoAccept: true,
      tabNavigation: true,
      restrictInput: false
    };

    // if (this.keyboardPosition === 'top') {
    //   this.kbOpts = {
    //     ...this.kbOpts,
    //     class: 'ui-keyboard-top'
    //   }

    // }
    if (layout === 'username') {
      this.kbOpts = {
        ...this.kbOpts,
        layout: 'custom',
        customLayout: userNameLayout,
        maxLength: 16
      };
    } else if (layout === 'integer') {
      this.kbOpts = {
        ...this.kbOpts,
        layout: 'custom',
        customLayout: integerLayout,
        maxLength: 16
      };
    } else if (layout === 'decimal') {
      this.kbOpts = {
        ...this.kbOpts,
        layout: 'custom',
        customLayout: decimalLayout,
        maxLength: 16
      };
    }
    this.keyboard = $(this.el.nativeElement).keyboard(this.kbOpts);
    if (this.keyboardPosition === 'top') {
      const corn = $(window);
      const result = document.getElementsByClassName('ui-keyboard');
      // TODO - shift position
      // this.keyboard.css('padding-bottom', '700px');
    }

    this.keyboard.bind('keyboardChange', (e, keyboard, el) => {
      this.onKeypress(el.value);
    });

    // WS - doesn't seem to work
    // this.keyboard
    //   .find('.ui-keyboard-enter, .ui-keyboard-space')
    //   .toggleClass('disabled', true);
  }

  killKeyboard() {
    if (this.keyboard) {
      const kb = this.keyboard.getkeyboard();
      kb.destroy();
      this.keyboard = undefined;
    }
  }

  onKeypress(key) {
    this.keyPress.emit(key);
  }

  /**
   * Handle simplechanges to catch keyboard hide/show
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (!this.appKeyboard) {
      this.killKeyboard();
    } else {
      if (!this.keyboard) {
        this.makeKeyboard(this.keyboardLayout);
      }
    }
  }

  ngAfterViewInit() {
    // Layouts: https://github.com/Mottie/Keyboard/wiki/Layout
    const layout = this.keyboardLayout ? this.keyboardLayout : 'qwerty';

    $(this.el.nativeElement).on('keyboardChange', function(e, key, el) {
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
}

const userNameLayout = {
  normal: [
    `Q W E R T Y U I O P {sp:1} {bksp}`,
    `A S D F G H J K L {sp:4.5}`,
    `Z X C V B N M . {sp:4}`,
    `{accept} {sp:5} {cancel} {sp:4.5}`
  ]
};

const decimalLayout = {
  normal: [`7 8 9`, `4 5 6`, `1 2 3`, `{sp:1} 0 . {bksp}`, `{accept} {cancel}`]
};

const integerLayout = {
  normal: [`7 8 9`, `4 5 6`, `1 2 3`, `0 {bksp}`, `{accept} {cancel}`]
};

// Other example keyboard options
const kbOptions: KeyboardOptions = {
  display: {
    bksp: '\u2190',
    accept: `Next`,
    cancel: `Back`,
    normal: 'ABC',
    meta1: '#+-',
    space: 'Space',
    alt: `Alt`,
    s: `ABC`
  },
  acceptValid: true,
  type: 'input',
  layout: 'custom',
  customLayout: {
    normal: [
      `a b c d e f g h i j k l m`,
      `n o p q r s t u v x y z w`,
      `1 2 3 4 5 6 7 8 9 0 . _ @`,
      `{alt} {s} {space} {meta1} {s} {bksp} `,
      `{cancel}  {accept}`
    ],
    shift: [
      `A B C D E F G H I J K L M`,
      `N O P Q R S T U V X Y Z W`,
      `1 2 3 4 5 6 7 8 9 0 . _ @`,
      `{alt} {s} {space} {meta1} {s} {bksp} `,
      `{cancel}  {accept}`
    ],
    meta1: [
      `- / : ; ( ) \u20ac & \" ! ? ' \``,
      `[ ] { } # % ^ * + = ° ´ §`,
      ` \\ | ~ < > $ \u00a3 \u00a5 , ' ² ³`,
      `{space} {meta1} {bksp}`,
      `{cancel}  {accept}`
    ],
    'alt-shift': [
      `A B C D E F G H I J K L M N O`,
      `P Q R S T U V X Y Z W \u00df \u00dc \u00d6 \u00c4`,
      `1 2 3 4 5 6 7 8 9 0 . _ @ \u0301`,
      `{alt} {s} {space} {meta1} {s} {bksp} `,
      `{cancel}  {accept}`
    ],
    alt: [
      `a b c d e f g h i j k l m n o`,
      `p q r s t u v x y z w \u00df \u00fc \u00f6 \u00e4`,
      `1 2 3 4 5 6 7 8 9 0 . _ @ \u0301`,
      `{alt} {s} {space} {meta1} {s} {bksp} `,
      `{cancel}  {accept}`
    ]
  },
  lockInput: true,
  alwaysOpen: true,
  appendLocally: true,
  color: 'light',
  class: 'sxcycx',
  updateOnChange: true,
  usePreview: false,
  tabNavigation: false,
  canceled: () => {
    console.log('cancelled');
  }
};
