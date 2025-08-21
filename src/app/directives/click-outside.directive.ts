import { Directive, ElementRef, inject, output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class ClickOutsideDirective {
  private elementRef = inject(ElementRef);

  public appClickOutside = output<void>();

  onDocumentClick(event: Event) {
    const target = event.target as Node;
    const clickedInside = this.elementRef.nativeElement.contains(target);
    
    if (!clickedInside) {
      this.appClickOutside.emit();
    }
  }
}