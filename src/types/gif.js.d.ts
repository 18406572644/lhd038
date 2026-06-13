declare module 'gif.js' {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    workerScript?: string;
    width?: number;
    height?: number;
    repeat?: number;
    background?: string;
    transparent?: string | null;
    dither?: boolean | string;
  }

  interface AddFrameOptions {
    delay?: number;
    copy?: boolean;
    dispose?: number;
  }

  interface GIF {
    constructor(options?: GIFOptions);
    addFrame(
      image: HTMLCanvasElement | HTMLImageElement | CanvasRenderingContext2D | ImageData,
      options?: AddFrameOptions
    ): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    on(event: 'start' | 'abort', callback: () => void): void;
    render(): void;
    abort(): void;
  }

  const GIF: {
    new (options?: GIFOptions): GIF;
  };

  export default GIF;
}
