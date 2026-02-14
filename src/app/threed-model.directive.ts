import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  HostListener,
  Renderer2,
} from '@angular/core';

import * as THREE from 'three';
import { WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Directive({
  selector: '[appThreedModel]'
})
export class ThreedModelDirective implements OnInit, OnDestroy {
  @Input('appThreedModel') modelPath!: string;
  @Input() rotate: boolean = false; // ✅ new input


  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private model!: THREE.Group;
  private controls!: OrbitControls;

  private isHovering = false;
  private animationFrameId: number | null = null;

  constructor(private el: ElementRef, private renderer2: Renderer2) {}

  ngOnInit(): void {
    if (!this.modelPath) {
      console.error('Model path is not provided for the appThreedModel directive.');
      return;
    }

    this.initThree();
    this.loadModel();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) this.renderer.dispose();
  }

  private initThree(): void {
    const container = this.el.nativeElement;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 3);

    this.renderer = new WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer2.appendChild(container, this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.update();
  }

  private loadModel(): void {
    const loader = new GLTFLoader();

    loader.load(
      this.modelPath,
      (gltf) => {
        const loadedScene = gltf.scene;

        // Center the model around origin
        const box = new THREE.Box3().setFromObject(loadedScene);
        const center = box.getCenter(new THREE.Vector3());
        loadedScene.position.sub(center);

        // Wrap in pivot group
        const pivot = new THREE.Group();
        pivot.add(loadedScene);
        this.model = pivot;

        this.scene.add(pivot);
        this.startAnimationLoop();
      },
      undefined,
      (error) => {
        console.error(`Error loading model at ${this.modelPath}`, error);
      }
    );
  }

  private startAnimationLoop = (): void => {
    this.animationFrameId = requestAnimationFrame(this.startAnimationLoop);

    if (this.model && this.rotate) {
      if (!this.isHovering) {
        this.model.rotation.y += 0.01; // Rotate in place
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.isHovering = true;
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.isHovering = false;
  }
}
