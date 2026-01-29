import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-upload-design',
  templateUrl: './upload-design.component.html',
  styleUrls: ['./upload-design.component.scss'],
})
export class UploadDesignComponent implements OnInit, AfterViewInit, OnDestroy {
  thumbnails = [{
        src: 'assets/images/2. 300 ML Can Renders/300 ML CAN 1.png',
        label: 'Can 300ml',
        modelPath: 'assets/images/can300ml.glb'
    },
    {
        src: 'assets/images/5. 16oz Can Renders/16oz Can 1.png',
        label: 'Can 16oz',
        modelPath: 'assets/images/can16oz.glb'
    },
    {
        src: 'assets/images/3. Slim Can Renders/Slim Can 1.png',
        label: 'Slim Can',
        modelPath: 'assets/images/Slimcan.glb'
    },
    {
        src: 'assets/images/6. Pint Glass Renders/Pint Glass 1.png',
        label: 'Pint Glass',
        modelPath: 'assets/images/Pintglass.glb'
    },
    {
        src: 'assets/images/7. Wine Cooler Renders/Wine Cooler 1.png',
        label: 'Wine Cooler',
        modelPath: 'assets/images/Winecooler.glb'
    },
    {
        src: 'assets/images/4. Bottle Renders/Bottle 1.png',
        label: 'Bottle',
        modelPath: 'assets/images/Bottle.glb'
    }
  ];
  leftThumbnails: any[] = [];
  rightThumbnails: any[] = [];

  mainImage: string = this.thumbnails[0].src;
  uploadedLogo: string | null = null;
  currentStep: number = 4;
  logoColor: string = '#000000';
  selectedSize: string = 'M';
  commonColor: string = '#ffffff';
  overlayText = '';
  fontSize = -20; // Negative value for larger text
  fontColor = '#FFFFFF';

  // Properties for user-controlled text position
  overlayTextOffsetX: number = 1.07;
  overlayTextOffsetY: number = -0.05;
  overlayTextOffsetZ: number = 0;

  // New properties for user-controlled text rotation
  overlayTextRotationX: number = 2;
  overlayTextRotationY: number = 94;
  overlayTextRotationZ: number = 359;

  // Properties for logo dimensions
  logoRadius: number = 1.55;
  logoHeight: number = 2.32;

  // Properties for logo decal
  loading: boolean = true;
  loadingProgress: number = 0;
  @ViewChild('designAreaRef') designAreaRef?: ElementRef;
  @ViewChild('mainViewerCanvas', {
    static: true
  }) mainCanvasRef !: ElementRef<HTMLCanvasElement>;
  private scene !: THREE.Scene;
  private camera !: THREE.PerspectiveCamera;
  private renderer !: THREE.WebGLRenderer;
  private controls !: OrbitControls;
  private productMesh: THREE.Group | null = null;
  private logoDecal: THREE.Mesh | null = null;
  private textureLoader = new THREE.TextureLoader();
  private gltfLoader = new GLTFLoader();
  private logoTexture: THREE.Texture | null = null;
  private overlayTextTexture: THREE.Texture | null = null;
  private overlayTextMaterial: THREE.MeshBasicMaterial | null = null;
  private overlayTextMesh: THREE.Mesh | null = null;
  private productBaseMaterial: THREE.MeshStandardMaterial | null = null;
  private originalLogoMesh: THREE.Mesh | null = null;

  logoMaterialColors: {
    [model: string]: number
  } = {
      'can300ml.glb': 0xb8b8b8,
      'can16oz.glb': 0xb8b8b8,
      'Slimcan.glb': 0xb8b8b8,
      'Pintglass.glb': 0xb8b8b8,
      'Winecooler.glb': 0xb8b8b8,
      'Bottle.glb': 0xb8b8b8,
    };
  productMaterials: {
    [model: string]: string[]
  } = {
      'can300ml.glb': ['BACK.001', 'FRONT.001', 'SIDES.001', 'Material'],
      'can16oz.glb': ['BACK.002', 'FRONT.002', 'SIDES.002', 'Material'],
      'Slimcan.glb': ['BACK.001', 'FRONT.001', 'SIDES.001', 'Material'],
      'Pintglass.glb': ['FRONT.001', 'Material'],
      'Winecooler.glb': ['BACK.001', 'FRONT.001', 'SIDES.001', 'Material', 'Material.008'],
      'Bottle.glb': ['BACK.002', 'FRONT.001', 'SIDES.001', 'Material'],
    };
  constructor(private router: Router, private cdr: ChangeDetectorRef , private http : HttpClient) { }

  ngOnInit(): void {
    const half = Math.ceil(this.thumbnails.length / 2);
    this.leftThumbnails = this.thumbnails.slice(0, half);
    this.rightThumbnails = this.thumbnails.slice(half);
    this.uploadedLogo = localStorage.getItem('step2Logo');
    this.logoColor = localStorage.getItem('logoColor') || this.logoColor;
    this.selectedSize = localStorage.getItem('selectedSize') || this.selectedSize;
    this.commonColor = localStorage.getItem('productCommonColor') || this.commonColor;
  }
  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    if (this.mainCanvasRef && this.mainCanvasRef.nativeElement.clientWidth > 0 && this.mainCanvasRef.nativeElement.clientHeight > 0) {
      this.initThreeJsScene(this.mainCanvasRef.nativeElement);
      this.loadInitialModel();
      this.startAnimationLoop();
      window.addEventListener('resize', this.onWindowResize.bind(this));
      this.onWindowResize();
    } else {
      setTimeout(() => this.ngAfterViewInit(), 50);
    }
  }
  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.disposeThreeJsScene(this.scene, this.renderer, this.controls);
    this.logoTexture?.dispose();
    this.overlayTextTexture?.dispose();
    this.overlayTextMaterial?.dispose();
    this.productBaseMaterial?.dispose();
    this.originalLogoMesh = null;
    this.logoDecal = null;
  }

  private initThreeJsScene(canvas: HTMLCanvasElement): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xAEB1B2);
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 3);
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    new RGBELoader()
      .setPath('assets/hdr/')
      .load('venice_sunset_1k.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.environment = texture;
        this.scene.background = texture;
      },
        undefined,
        (error) => {
          this.scene.background = new THREE.Color(0xAEB1B2);
        });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.right = 5;
    directionalLight.shadow.camera.top = 5;
    directionalLight.shadow.camera.bottom = -5;
    this.scene.add(directionalLight);
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.1,
      transparent: true,
      opacity: 0
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 1;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }
  private startAnimationLoop(): void {
    const animate = () => {
      requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }
  private onWindowResize(): void {
    const canvas = this.mainCanvasRef.nativeElement;
    const parent = canvas.parentElement;
    if (parent) {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }
  private disposeThreeJsScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer, controls: OrbitControls): void {
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }
    if (controls) {
      controls.dispose();
    }
    if (scene) {
      scene.traverse((obj: any) => {
        if (obj.isMesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((mat: any) => {
                mat.map?.dispose();
                mat.dispose();
              });
            } else {
              obj.material.map?.dispose();
              obj.material.dispose();
            }
          }
        }
      });
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
    }
  }
  private loadInitialModel(): void {
    this.loadProductModel(this.thumbnails[0].modelPath);
  }

  onSelectModel(model: {
    src: string,
    label: string,
    modelPath: string
  }): void {
    this.mainImage = model.src;
    this.loadProductModel(model.modelPath);
  }

  private async convertTextureToCircular(texture: THREE.Texture): Promise<THREE.Texture> {
    return new Promise((resolve) => {
      const image = texture.image;
      const size = Math.min(image.width, image.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, size, size);
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(
        image,
        (image.width - size) / 2,
        (image.height - size) / 2,
        size,
        size,
        0,
        0,
        size,
        size
      );

      const circularTexture = new THREE.CanvasTexture(canvas);
      circularTexture.colorSpace = THREE.SRGBColorSpace;
      circularTexture.needsUpdate = true;
      resolve(circularTexture);
    });
  }

  private async loadProductModel(modelPath: string): Promise<void> {
    this.loading = true;
    this.loadingProgress = 0;
    if (this.productMesh) {
      this.scene.remove(this.productMesh);
      this.productMesh.traverse((obj: any) => {
        if (obj.isMesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat: any) => {
              mat.map?.dispose();
              mat.dispose();
            });
          } else {
            obj.material.map?.dispose();
            obj.material.dispose();
          }
        }
      });
      this.productMesh = null;
    }

    if (this.logoDecal) {
      this.logoDecal.parent?.remove(this.logoDecal);
      this.logoDecal.geometry.dispose();
      (this.logoDecal.material as THREE.Material).dispose();
      this.logoDecal = null;
    }

    let loadedLogoTexture: THREE.Texture | null = null;
    if (this.uploadedLogo) {
      try {
        const originalTexture = await new Promise<THREE.Texture>((resolve, reject) => {
          this.textureLoader.load(this.uploadedLogo!, resolve, undefined, reject);
        });
        loadedLogoTexture = await this.convertTextureToCircular(originalTexture);
      } catch (error) {
        alert('Failed to load logo texture. Please ensure the file is a valid image type.');
        loadedLogoTexture = null;
      }
    }

    this.logoTexture = loadedLogoTexture;
    this.createProductMaterial();
    this.gltfLoader.load(
      modelPath,
      (gltf) => {
        this.productMesh = gltf.scene;
        const modelFileName = modelPath.split('/').pop() || '';
        const logoMaterialColor = this.logoMaterialColors[modelFileName];
        const commonColorMaterials = this.productMaterials[modelFileName] || [];
        this.productMesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.receiveShadow = true;
            child.castShadow = true;
            const material = child.material as THREE.Material;
            if (material instanceof THREE.MeshStandardMaterial && material.color.getHex() === logoMaterialColor) {
              this.originalLogoMesh = child;
              material.color.setHex(0x000000);
            } else if (commonColorMaterials.includes(material.name) && this.productBaseMaterial) {
              child.material = this.productBaseMaterial;
            }
          }
        });

        if (this.originalLogoMesh && this.logoTexture) {
          this.createLogoDecal();
        }
        this.scene.add(this.productMesh);
        const box = new THREE.Box3().setFromObject(this.productMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.8;
        const radius = cameraZ;
        const phi = Math.PI / 2 - Math.PI / 12;
        const theta = Math.PI / 4;
        this.camera.position.x = center.x + radius * Math.sin(phi) * Math.sin(theta);
        this.camera.position.y = center.y + radius * Math.cos(phi);
        this.camera.position.z = center.z + radius * Math.sin(phi) * Math.cos(theta);
        this.controls.target.copy(center);
        this.controls.update();
        this.updateOverlayTextInScene();
        this.loading = false;
      },
      (xhr) => {
        this.loadingProgress = (xhr.loaded / xhr.total) * 100;
        this.cdr.detectChanges();
      },
      (error) => {
        this.loading = false;
        const modelFileName = modelPath.split('/').pop() || '';
        alert(`Failed to load 3D model: ${modelFileName}. Please check the file path and format.`);
      }
    );
  }


  private createLogoDecal(): void {
    if (this.logoDecal) {
      this.logoDecal.parent?.remove(this.logoDecal);
      this.logoDecal.geometry.dispose();
      (this.logoDecal.material as THREE.Material).dispose();
      this.logoDecal = null;
    }
    if (!this.originalLogoMesh || !this.logoTexture) {
      return;
    }
    const arc = Math.PI * -0.5;
    const segments = 64;
    const geometry = new THREE.CylinderGeometry(
      this.logoRadius,
      this.logoRadius,
      this.logoHeight,
      segments,
      1,
      true,
      0,
      -arc
    );

    const material = new THREE.MeshBasicMaterial({
      map: this.logoTexture,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.logoDecal = new THREE.Mesh(geometry, material);
    this.logoDecal.renderOrder = 1;
    this.originalLogoMesh.add(this.logoDecal);
    this.updateLogoPosition();
  }
  onLogoRadiusChange(): void {
    this.updateLogoDimensions();
  }

  onLogoHeightChange(): void {
    this.updateLogoDimensions();
  }

  updateLogoDimensions(): void {
    if (this.originalLogoMesh && this.logoTexture) {
      this.createLogoDecal();
    }
  }


  private createProductMaterial(): void {
    if (this.productBaseMaterial) {
      this.productBaseMaterial.dispose();
    }

    this.productBaseMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.commonColor),
      roughness: 0.6,
      metalness: 0.1,
    });

    if (this.productMesh) {
      const modelFileName = this.mainImage.split('/').pop() || '';
      const commonColorMaterials = this.productMaterials[modelFileName] || [];
      const logoMaterialColor = this.logoMaterialColors[modelFileName];
      this.productMesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.Material;
          if (material instanceof THREE.MeshStandardMaterial) {
            if (material.color.getHex() === logoMaterialColor) {
              material.color.setHex(0x000000);
            } else if (commonColorMaterials.includes(material.name) && this.productBaseMaterial) {
              child.material = this.productBaseMaterial;
            }
          }
        }
      });
    }
  }



  onCommonColorChange(): void {
    localStorage.setItem('productCommonColor', this.commonColor);
    if (this.productBaseMaterial) {
      this.productBaseMaterial.color.set(this.commonColor);
    }
    this.renderer.render(this.scene, this.camera);
  }


  applyLogoTextureAndColor(): void {
    localStorage.setItem('logoColor', this.logoColor);
    const selectedModel = this.thumbnails.find(t => t.src === this.mainImage);
    if (selectedModel) {
      this.loadProductModel(selectedModel.modelPath);
    }
  }


  selectSize(size: string): void {
    this.selectedSize = size;
    localStorage.setItem('selectedSize', size);
  }


  updateLogoPosition(): void {
    if (this.logoDecal && this.originalLogoMesh) {
      this.logoDecal.position.set(0, 0, 0);
      this.logoDecal.rotation.set(
        THREE.MathUtils.degToRad(313),
        THREE.MathUtils.degToRad(360),
        THREE.MathUtils.degToRad(92)
      );


      this.logoDecal.position.x = 0.60 * 0.1;
      this.logoDecal.position.y = -13.86 * 0.1;
      this.logoDecal.position.z = 0.43 * 0.1;
      this.logoDecal.translateZ(0.01);
    }
  }


  onPositionChange(): void {
    this.updateOverlayTextInScene();
  }

  public updateOverlayTextInScene(): void {
    if (!this.scene) return;

    // Dispose of the old text mesh and its resources to prevent memory leaks
    if (this.overlayTextMesh) {
      this.scene.remove(this.overlayTextMesh);
      this.overlayTextTexture?.dispose();
      this.overlayTextMaterial?.dispose();
      this.overlayTextMesh = null;
    }

    if (!this.overlayText.trim()) {
      return;
    }

    // Define a resolution factor to increase the canvas size for sharper text
    const resolutionFactor = 16;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const scaledFontSize = this.fontSize * resolutionFactor * 10;
    const font = `bold ${scaledFontSize}px Arial`;
    ctx.font = font;
    const metrics = ctx.measureText(this.overlayText);
    const textWidth = metrics.width;
    const textHeight = scaledFontSize * 1.5;

    canvas.width = textWidth + 40 * resolutionFactor;
    canvas.height = textHeight + 40 * resolutionFactor;

    ctx.font = font;
    ctx.fillStyle = this.fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.overlayText, canvas.width / 2, canvas.height / 2);


    this.overlayTextTexture = new THREE.CanvasTexture(canvas);
    this.overlayTextTexture.colorSpace = THREE.SRGBColorSpace;
    this.overlayTextTexture.needsUpdate = true;
    this.overlayTextMaterial = new THREE.MeshBasicMaterial({
      map: this.overlayTextTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const radius = 1.0;
    const height = 0.5;
    const segments = 64;
    const thetaStart = Math.PI * 0.5;
    const thetaLength = Math.PI;

    const cylinderGeometry = new THREE.CylinderGeometry(
      radius, radius, height, segments, 1, true, thetaStart, thetaLength
    );

    this.overlayTextMesh = new THREE.Mesh(cylinderGeometry, this.overlayTextMaterial);
    this.overlayTextMesh.name = 'overlayTextMesh';


    if (this.productMesh) {
      const box = new THREE.Box3().setFromObject(this.productMesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      this.overlayTextMesh.position.set(
        center.x + this.overlayTextOffsetX,
        center.y + (size.y / 2) + this.overlayTextOffsetY,
        center.z + this.overlayTextOffsetZ
      );
      this.overlayTextMesh.rotation.set(
        THREE.MathUtils.degToRad(this.overlayTextRotationX),
        THREE.MathUtils.degToRad(this.overlayTextRotationY),
        THREE.MathUtils.degToRad(this.overlayTextRotationZ)
      );
    } else {
      this.overlayTextMesh.position.set(
        0 + this.overlayTextOffsetX,
        1 + this.overlayTextOffsetY,
        0 + this.overlayTextOffsetZ
      );
      this.overlayTextMesh.rotation.set(
        THREE.MathUtils.degToRad(this.overlayTextRotationX),
        THREE.MathUtils.degToRad(this.overlayTextRotationY),
        THREE.MathUtils.degToRad(this.overlayTextRotationZ)
      );
    }
    this.scene.add(this.overlayTextMesh);
  }

  async goToCustomize(): Promise<void> {
    const canvasElement = this.mainCanvasRef?.nativeElement;
    if (!canvasElement) {
      return;
    }
    try {
      const storedFormData = localStorage.getItem('enquiryFormData');
      if (!storedFormData) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No enquiry form data found. Please start again.'
        });
        return;
      }
      const enquiryData = JSON.parse(storedFormData);

      const imageDataURL = canvasElement.toDataURL('image/png');
      localStorage.setItem('finalMockup', imageDataURL);

      const res = await fetch(imageDataURL);
      const blob = await res.blob();

      const fileName = `mockup_${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      const formData = new FormData();
      formData.append('fullName', enquiryData.fullName);
      formData.append('email', enquiryData.email);
      formData.append('contact', enquiryData.contact);
      formData.append('companyName', enquiryData.companyName);
      formData.append('address', enquiryData.address);
      formData.append('description', enquiryData.description);

      formData.append('image', file);
      formData.append(
        'imageDetails',
        JSON.stringify({
          fileName: file.name,
          size: file.size,
          type: file.type
        })
      );

      this.http.post(`${environment.apiUrl}enquiry/`, formData).subscribe({
        next: (response: any) => {
          console.log('Enquiry for image is submitted:'+'Our Team will get in touch with you..', response);

          if (response && response.message) {
             Swal.fire({
              icon: 'success',
              title: 'Enquiry submitted successfully!',
              text: 'Our Team will get in touch with you soon.',
              showConfirmButton: false,
            });
          }

          localStorage.removeItem('enquiryFormData');
          localStorage.removeItem('step1Data');
          localStorage.removeItem('step2Logo');
          localStorage.removeItem('enquiryFormData');
          localStorage.removeItem('productCommonColor');
          localStorage.removeItem('logoColor');
          localStorage.removeItem('finalMockup');
          this.router.navigate(['/coinzee']);
        },
        error: (err: any) => {
          console.error('Error submitting enquiry with image:', err);

          let errorMsg = 'An unexpected error occurred while submitting your enquiry.';
          if (err.error && err.error.errors && err.error.errors.email) {
            errorMsg = err.error.errors.email[0];
          } else if (err.error && err.error.message) {
            errorMsg = err.error.message;
          }

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMsg
          });

          this.router.navigate(['/coinzee']);
        }
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Could not capture the product image. Please ensure your browser supports canvas operations.'
      });
      console.error(e);
    }
  }

  hexToRgb(hex: string): {
    r: number;
    g: number;
    b: number
  } | null {
    const match = hex.match(/^#?([a-f/d]{2})([a-f/d]{2})([a-f/d]{2})$/i);
    return match ? {
      r: parseInt(match[1], 16),
      g: parseInt(match[2], 16),
      b: parseInt(match[3], 16)
    } : null;
  }
}