declare module "plyr" {
  export default class Plyr {
    constructor(target: HTMLElement | string, options?: Record<string, unknown>);
    destroy(): void;
  }
}
declare module "plyr/dist/plyr.css";
