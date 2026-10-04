import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Help } from './help';

describe('Help', () => {
  let component: Help;
  let fixture: ComponentFixture<Help>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Help],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Help);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with every FAQ item collapsed', () => {
    const firstItem = component.sections[0].items[0];
    expect(component.isOpen(firstItem.id)).toBe(false);
  });

  it('should toggle a FAQ item open and closed', () => {
    const firstItem = component.sections[0].items[0];

    component.toggle(firstItem.id);
    expect(component.isOpen(firstItem.id)).toBe(true);

    component.toggle(firstItem.id);
    expect(component.isOpen(firstItem.id)).toBe(false);
  });
});
