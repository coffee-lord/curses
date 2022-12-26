import { WebviewWindow } from "@tauri-apps/api/window";
import Service_PubSub from "./pubsub";
import { BackendState } from "./schema";
import Service_Shortcuts from "./shortcuts";
import Service_State from "./state";
import Service_STT from "./stt";
import Service_TTS from "./tts";
import Service_Translation from "./translation";
import Service_VRC from "./vrc";
import Service_Twitch from "./twitch";
import { proxy } from "valtio";

export enum Services {
  vrc = "vrc",
  stt = "stt",
  tts = "tts",
  translation = "translation",
  twitch = "twitch",
}

class Backend {
  constructor() {}

  private readonly _state = new Service_State();
  public readonly stt = new Service_STT();
  public readonly tts = new Service_TTS();
  public readonly translation = new Service_Translation();
  public readonly twitch = new Service_Twitch();
  public readonly vrc = new Service_VRC();
  public readonly pubsub = new Service_PubSub();
  public readonly shortcuts = new Service_Shortcuts();

  get state() {
    return this._state.state;
  }

  ui = proxy({
    fullscreenInput: false
  });

  patchService<Key extends keyof BackendState["services"]>(
    service: Key,
    fn: (state: BackendState["services"][Key]) => void
  ) {
    fn(this.state.services[service]);
    // this.state.services[service] = produce(this.state.services[service], fn);
  }

  public changeTheme(value: string) {
    this.state.clientTheme = value;
    document.body.setAttribute("data-theme", value);
  }

  public changeScale(value: number) {
    this.state.uiScale = value;
    document.documentElement.style.setProperty("--uiscale", value.toString());
  }

  private inputWindow?: WebviewWindow;
  private initInputWIndow() {
    if (window.platform !== "app" || window.mode !== "host") return;
    this.inputWindow = new WebviewWindow("theUniqueLabel", {
      visible: false,
      transparent: true,
      skipTaskbar: true,
      fileDropEnabled: false,
      titleBarStyle: "overlay",
      decorations: false,
      alwaysOnTop: true,
      url: "inputfield.html",
    });
  }
  async switchInputWindow() {
    if (!this.inputWindow) return;
    const isVisible = await this.inputWindow.isVisible();
    isVisible ? this.inputWindow.hide() : this.inputWindow.show();
  }

  public async init() {
    this.initInputWIndow();
    await this._state.init();
    await this.pubsub.init();
    await this.twitch.init();
    await this.stt.init();
    await this.tts.init();
    await this.translation.init();
    await this.vrc.init();
    await this.shortcuts.init();
    window.mode === "host" && this.changeTheme(this.state.clientTheme);
    console.log("backend init");
  }
}

export default Backend;