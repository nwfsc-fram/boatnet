# Boatnet - Style Guide

### Contents
  - [Navigation](#navigation)  
  - [Page Sections] (#sections)  
  - [Widgets](#widgets)
  - [Header](#header)
  - [Footer](#footer)
  - [Fonts](#fonts)
  - [Colors](#colors)
  - [Icons](#icons)
  - [Code](#code)
  - [Forms](#forms)
  - [Grid](#grid)


## Navigation
* Home Page - Direct links to pages/components (given appropriate state - eg. trip selected)
* Forward Navigation - Footer Bar
* Back Navigation - Upper left corner (home / breadcrumbs)


## Sections
 * Header - left side: home icon + breadcrumb, right side: elipsis / hamburger menu.
    - an independent component
 * Page
    - one or more components
 * Footer - new | edit | delete buttons, followed by navigation links.
    - part of each page.  **NOT** it's own component.
    - CSS Classes:
      - **footer** - Styles and positions the footer.  Apply to enclosing/footer div.
      - **footer-contents** - Vertically centers the footer contents.  Apply to a div inside the footer div.
      - **footer-button** - Sizes footer buttons and button text.  Horizontally spaces footer buttons.  Apply to each footer button.
      - **footer-link** - Sizes and spaces footer links.  Transforms link text to uppercase.  Apply to each footer link.  


## Widgets
The following components will be used.  These come from either [PrimeNG](https://www.primefaces.org/primeng/#/) or [material](https://material.angular.io) toolkits.

|Widget|Selected|Note       |
|------|--------|-----------|
|TextField|material||
<<<<<<< HEAD
|TextArea|[Material Form Field Textarea](https://material.angular.io/components/form-field/overview)|
|AutoComplete|[Material AutoComplete](https://material.angular.io/components/autocomplete/overview)|
|Button||
=======
|TextArea||
|Button|[PrimeNG Button](https://www.primefaces.org/primeng/#/button)|
>>>>>>> 65751c0bd4064bcc1dc2444cc1a18f738f252bfc
|Toggle Button||
|Table|[PrimeNG Table](https://www.primefaces.org/primeng/#/table)|
|TreeTable|[PrimeNG TreeTable](https://www.primefaces.org/primeng/#/treetable)|
|Popup message||
<<<<<<< HEAD
|SideNav|[Material SideNav](https://material.angular.io/components/sidenav/overview)|

## Header

## Footer
=======
|Dropdown|[PrimeNG Dropdown](https://www.primefaces.org/primeng/#/dropdown)|
|Select Button|[PrimeNG Select Button](https://www.primefaces.org/primeng/#/selectbutton)|
|Input Text|[PrimeNG Input Text](https://www.primefaces.org/primeng/#/inputtext)|
|Input Mask|[PrimeNG Masked Input](https://www.primefaces.org/primeng/#/inputmask)|
|Calendar (datetime picker)|[PrimeNG Calendar](https://www.primefaces.org/primeng/#/calendar)|


>>>>>>> 65751c0bd4064bcc1dc2444cc1a18f738f252bfc

## Fonts
* Font-family - sans-serif
* Fontsize - 24 pixel


## Colors
* header, footer, highlight, and active buttons are: #3F51B5  (royal blue?)
* text and buttons in header, footer, highlight, and active buttons is white.
* primeng table highlights are custom styled in **style.scss** per above.
* the **footer** css class is styled per above.
 

## Icons
|Icon|Purpose|Notes|
|-|-|-|
|chevron_right|forward navigation||
|chevron_left|backward navigation||

<<<<<<< HEAD
## Code
* Lines of Code per file - maximum = 300, preferred = 100
=======
[primeng icons](https://www.primefaces.org/primeng/#/icons) is imported.

primeicons can be used on their own like:
```
<i class="pi pi-check" style="font-size: 3em"></i>
```
or as part of a Prime NG component like:
```
<p-button label="OK" icon="pi pi-check" iconPos="left"></p-button>
```

some working conventions:  
* new/add icon: **pi-plus**  
* edit icon: **pi-pencil**  
* delete icon: **pi-times**  
* end icon: **pi-exclamation-triangle**  
* ok icon: **pi-check**  
 
## Forms

The app uses [Reactive Forms](https://angular.io/guide/reactive-forms)  

The following css classes are available for form styling:
* **form-field** - Spaces groups of label+input. Apply to **div** around label+input.
* **form-label** - Styes label text, positions label relative to input.  Apply to a label **span**.
* **form-text** - Styles input text.  Apply to most PrimeNG input components, including (but not limited to): select button, dropdown, input, input mask, calendar.

CSS class usage example:
```
<div class="form-field">
    <span class="form-label">Time:</span>
    <p-inputMask formControlName="time" id="time" mask="99:99" class="form-text"></p-inputMask>
</div>
```

## Grid

 * material does not have a built in css grid
 * a basic grid has been created in **style.scss**
   
    **To use:**
     - make a container row - a div with the **row** class.
     - make columns - divs with **row-(1-12)** class.
   
* a row does not need 12 columns.  
* greater than 12 columns in a row will produce undesired results.  
* grid does **NOT** have a minimum or maximum display size.
 
Grid usage example: (produces 2 columns side by side - a time input on the left, and a date input on the right.)
```
<div class="row">
    <div class="col-6">
        <div class="form-field">
            <span class="form-label">Time:</span>
            <p-inputMask formControlName="time" id="time" mask="99:99" class="form-text"></p-inputMask>
        </div>
    </div>
    <div class="col-6">
        <div class="form-field">
            <span class="form-label">Date:</span>
            <p-calendar formControlName="date_time" id="date_time" class="form-text"></p-calendar>
        </div
    </div>
</div>
    
```
>>>>>>> 65751c0bd4064bcc1dc2444cc1a18f738f252bfc

## MARKDOWN SNIPPETS

1. How to show some code in a markdown document:
```
npm install -g @angular/cli
cd <boatnet directory>/observer/obs-electron
```


