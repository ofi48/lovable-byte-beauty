import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export interface VideoProcessingParameters {
  videoQuality: number;
  videoBitrate: { enabled: boolean; min: number; max: number };
  audioBitrate: { enabled: boolean; min: number; max: number };
  framerate: { enabled: boolean; min: number; max: number };
  saturation: { enabled: boolean; min: number; max: number };
  contrast: { enabled: boolean; min: number; max: number };
  brightness: { enabled: boolean; min: number; max: number };
  gamma: { enabled: boolean; min: number; max: number };
  vignette: { enabled: boolean; min: number; max: number };
  noise: { enabled: boolean; min: number; max: number };
  waveformShift: { enabled: boolean; min: number; max: number };
  pixelShift: { enabled: boolean; min: number; max: number };
  speed: { enabled: boolean; min: number; max: number };
  zoom: { enabled: boolean; min: number; max: number };
  volume: { enabled: boolean; min: number; max: number };
  rotation: { enabled: boolean; min: number; max: number };
  flipHorizontally: { enabled: boolean };
  randomPixelSize: { enabled: boolean };
  trim: { enabled: boolean; min: number; max: number };
}

export class VideoProcessor {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;

  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    this.ffmpeg = new FFmpeg();
    
    // Load FFmpeg WebAssembly
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    this.ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });

    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
    });

    this.isLoaded = true;
  }

  private getRandomValue(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private buildFilterString(params: VideoProcessingParameters): string {
    const filters: string[] = [];

    // Color adjustments
    if (params.saturation.enabled) {
      const satValue = this.getRandomValue(params.saturation.min, params.saturation.max);
      filters.push(`eq=saturation=${satValue.toFixed(2)}`);
    }

    if (params.contrast.enabled) {
      const contrastValue = this.getRandomValue(params.contrast.min, params.contrast.max);
      filters.push(`eq=contrast=${contrastValue.toFixed(2)}`);
    }

    if (params.brightness.enabled) {
      const brightnessValue = this.getRandomValue(params.brightness.min, params.brightness.max);
      filters.push(`eq=brightness=${brightnessValue.toFixed(2)}`);
    }

    if (params.gamma.enabled) {
      const gammaValue = this.getRandomValue(params.gamma.min, params.gamma.max);
      filters.push(`eq=gamma=${gammaValue.toFixed(2)}`);
    }

    // Noise
    if (params.noise.enabled) {
      const noiseValue = this.getRandomValue(params.noise.min, params.noise.max);
      filters.push(`noise=alls=${Math.floor(noiseValue * 100)}:allf=t`);
    }

    // Rotation
    if (params.rotation.enabled) {
      const rotationValue = this.getRandomValue(params.rotation.min, params.rotation.max);
      const radians = (rotationValue * Math.PI) / 180;
      filters.push(`rotate=${radians.toFixed(4)}`);
    }

    // Flip
    if (params.flipHorizontally.enabled) {
      filters.push('hflip');
    }

    // Zoom/Scale
    if (params.zoom.enabled) {
      const zoomValue = this.getRandomValue(params.zoom.min, params.zoom.max);
      const scale = 1 + zoomValue;
      filters.push(`scale=iw*${scale.toFixed(2)}:ih*${scale.toFixed(2)}`);
    }

    // Pixel shift (subtle crop to simulate pixel shifting)
    if (params.pixelShift.enabled) {
      const shiftValue = this.getRandomValue(params.pixelShift.min, params.pixelShift.max);
      const cropPixels = Math.floor(shiftValue * 10);
      if (cropPixels > 0) {
        filters.push(`crop=iw-${cropPixels}:ih-${cropPixels}:${Math.floor(cropPixels/2)}:${Math.floor(cropPixels/2)}`);
      }
    }

    // Vignette effect
    if (params.vignette.enabled) {
      const vignetteValue = this.getRandomValue(params.vignette.min, params.vignette.max);
      filters.push(`vignette=PI/4+${vignetteValue.toFixed(2)}`);
    }

    return filters.length > 0 ? filters.join(',') : '';
  }

  async processVideo(
    inputFile: File, 
    params: VideoProcessingParameters, 
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';

    // Convert file to Uint8Array
    const arrayBuffer = await inputFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Write input file to FFmpeg FS
    await this.ffmpeg.writeFile(inputFileName, uint8Array);

    // Build FFmpeg command
    const args = ['-i', inputFileName];

    // Video filters
    const filterString = this.buildFilterString(params);
    if (filterString) {
      args.push('-vf', filterString);
    }

    // Video quality and bitrate
    args.push('-crf', (51 - Math.floor(params.videoQuality * 0.51)).toString());
    
    if (params.videoBitrate.enabled) {
      const bitrate = this.getRandomValue(params.videoBitrate.min, params.videoBitrate.max);
      args.push('-b:v', `${Math.floor(bitrate)}k`);
    }

    if (params.audioBitrate.enabled) {
      const audioBitrate = this.getRandomValue(params.audioBitrate.min, params.audioBitrate.max);
      args.push('-b:a', `${Math.floor(audioBitrate)}k`);
    }

    // Framerate
    if (params.framerate.enabled) {
      const fps = this.getRandomValue(params.framerate.min, params.framerate.max);
      args.push('-r', Math.floor(fps).toString());
    }

    // Speed
    if (params.speed.enabled) {
      const speedValue = this.getRandomValue(params.speed.min, params.speed.max);
      const filterPrefix = filterString ? ',' : '';
      const speedFilter = `${filterPrefix}setpts=${(1/speedValue).toFixed(3)}*PTS`;
      if (filterString) {
        args[args.indexOf(filterString) + 1] += speedFilter;
      } else {
        args.push('-vf', speedFilter.substring(1));
      }
    }

    // Volume
    if (params.volume.enabled) {
      const volumeValue = this.getRandomValue(params.volume.min, params.volume.max);
      args.push('-af', `volume=${volumeValue.toFixed(2)}`);
    }

    // Trim
    if (params.trim.enabled) {
      const trimValue = this.getRandomValue(params.trim.min, params.trim.max);
      args.push('-ss', trimValue.toFixed(2));
    }

    args.push(outputFileName);

    // Progress tracking
    if (onProgress) {
      let progressCounter = 0;
      this.ffmpeg.on('progress', ({ progress }) => {
        progressCounter++;
        if (progressCounter % 10 === 0) { // Throttle progress updates
          onProgress(progress * 100);
        }
      });
    }

    // Execute FFmpeg command
    await this.ffmpeg.exec(args);

    // Read output file
    const data = await this.ffmpeg.readFile(outputFileName) as Uint8Array;
    
    // Clean up files
    await this.ffmpeg.deleteFile(inputFileName);
    await this.ffmpeg.deleteFile(outputFileName);

    return new Blob([data], { type: 'video/mp4' });
  }

  async generateVariations(
    inputFile: File,
    params: VideoProcessingParameters,
    numberOfVariations: number,
    onProgress?: (variation: number, progress: number) => void
  ): Promise<Blob[]> {
    const variations: Blob[] = [];
    
    for (let i = 0; i < numberOfVariations; i++) {
      const variationBlob = await this.processVideo(
        inputFile,
        params,
        (progress) => onProgress?.(i + 1, progress)
      );
      variations.push(variationBlob);
    }

    return variations;
  }

  async downloadBlob(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async createZipWithVariations(variations: Blob[], baseFileName: string): Promise<void> {
    // For now, download individually
    // In a real implementation, you'd use a ZIP library like JSZip
    for (let i = 0; i < variations.length; i++) {
      const filename = `${baseFileName}_variation_${i + 1}.mp4`;
      await this.downloadBlob(variations[i], filename);
    }
  }
}

export const videoProcessor = new VideoProcessor();