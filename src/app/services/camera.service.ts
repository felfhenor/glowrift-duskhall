import type { OnDestroy } from '@angular/core';
import { Injectable, signal } from '@angular/core';
import { cameraPositionSet, gamestate } from '@helpers';

export interface Point {
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root',
})
export class CameraService implements OnDestroy {
  public isDragging = signal<boolean>(false);
  public lastPanPosition = signal<Point | null>(null);

  #boundOnMouseDown: (event: MouseEvent) => void;
  #boundOnMouseMove: (event: MouseEvent) => void;
  #boundOnMouseUp: () => void;
  #panSensitivity = 2;

  constructor() {
    this.#boundOnMouseDown = this.onMouseDown.bind(this);
    this.#boundOnMouseMove = this.onMouseMove.bind(this);
    this.#boundOnMouseUp = this.onMouseUp.bind(this);
  }

  public init(): void {
    this.setupMouseListeners();
  }

  ngOnDestroy(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('mousedown', this.#boundOnMouseDown);
    window.removeEventListener('mousemove', this.#boundOnMouseMove);
    window.removeEventListener('mouseup', this.#boundOnMouseUp);
  }

  private setupMouseListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('mousedown', this.#boundOnMouseDown);
    window.addEventListener('mousemove', this.#boundOnMouseMove);
    window.addEventListener('mouseup', this.#boundOnMouseUp);
  }

  private onMouseDown(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;

    if (targetElement && targetElement.closest('app-game-map-node')) {
      this.isDragging.set(true);
      this.lastPanPosition.set({ x: event.clientX, y: event.clientY });
      event.preventDefault();
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging() || !this.lastPanPosition()) {
      return;
    }

    const lastPos = this.lastPanPosition()!;
    const deltaX = event.clientX - lastPos.x;
    const deltaY = event.clientY - lastPos.y;

    const currentCameraPos = gamestate().camera;

    const newCameraX = currentCameraPos.x - deltaX / this.#panSensitivity;
    const newCameraY = currentCameraPos.y - deltaY / this.#panSensitivity;

    cameraPositionSet(newCameraX, newCameraY);

    this.lastPanPosition.set({ x: event.clientX, y: event.clientY });
  }

  private onMouseUp(): void {
    if (!this.isDragging()) return;

    this.isDragging.set(false);
    this.lastPanPosition.set(null);
  }
}
