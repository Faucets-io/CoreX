declare module 'vanta/dist/vanta.globe.min' {
  import * as THREE from 'three';
  
  export interface VantaEffect {
    destroy(): void;
    resize?(): void;
    setOptions?(options: any): void;
  }
  
  export interface VantaGlobeOptions {
    el: string | HTMLElement;
    THREE?: typeof THREE;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    color2?: number;
    backgroundColor?: number;
    size?: number;
    [key: string]: any;
  }
  
  export default function(options: VantaGlobeOptions): VantaEffect;
}
