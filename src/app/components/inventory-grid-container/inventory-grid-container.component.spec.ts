import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { InventoryGridContainerComponent } from '@components/inventory-grid-container/inventory-grid-container.component';

describe('InventoryGridContainerComponent', () => {
  let component: InventoryGridContainerComponent;
  let fixture: ComponentFixture<InventoryGridContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryGridContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryGridContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset currentItemType when allowedItemTypes changes to exclude current type', () => {
    // Set initial allowed types and current type
    component.allowedItemTypes.set(['weapon', 'armor', 'accessory']);
    component.currentItemType.set('weapon');
    fixture.detectChanges();

    expect(component.currentItemType()).toBe('weapon');

    // Change allowed types to exclude the current type
    component.allowedItemTypes.set(['accessory', 'trinket']);
    fixture.detectChanges();

    // Current type should reset to first allowed type since 'weapon' is no longer allowed
    expect(component.currentItemType()).toBe('accessory');
  });

  it('should keep currentItemType when it is still in allowedItemTypes', () => {
    // Set initial allowed types and current type
    component.allowedItemTypes.set(['weapon', 'armor', 'accessory']);
    component.currentItemType.set('armor');
    fixture.detectChanges();

    expect(component.currentItemType()).toBe('armor');

    // Change allowed types but keep the current type included
    component.allowedItemTypes.set(['armor', 'trinket']);
    fixture.detectChanges();

    // Current type should remain unchanged since 'armor' is still allowed
    expect(component.currentItemType()).toBe('armor');
  });

  it('should set currentItemType to first visible type on init when not already set', () => {
    component.allowedItemTypes.set(['trinket', 'weapon']);
    component.currentItemType.set(undefined);
    
    component.ngOnInit();

    expect(component.currentItemType()).toBe('trinket');
  });
});