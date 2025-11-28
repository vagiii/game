import { B as BaseDriver, d as debug } from "./index-Kx0mckbv.js";
const log = debug("file");
class JetpackDriver extends BaseDriver {
  constructor(name, ext) {
    super();
    this.name = name;
    this.type = "jetpack";
    this.size = 50 * 1024 * 1024;
    this.sysName = name;
    if (window.electron.platform === "win32") {
      this.sysName = this.sysName.replace(":", "_");
    }
    this.dir = electron.jetpack.path(
      electron.home,
      "MorphosisGames",
      this.sysName
    );
    this.ext = ext;
    electron.jetpack.dir(this.dir);
    log("jetpack!", this.dir);
  }
  getFilePath(filename) {
    let path = electron.jetpack.path(this.dir, filename);
    if (this.ext) {
      if (!new RegExp(`.${this.ext}$`).test(filename)) {
        path += `.${this.ext}`;
      }
    }
    return path;
  }
  async listFilenames() {
    const opts = { files: true };
    if (this.ext) {
      opts.matching = `*.${this.ext}`;
    } else {
      opts.matching = "*";
    }
    return electron.jetpack.findAsync(
      this.dir,
      opts
    );
  }
  async list() {
    const filenames = await this.listFilenames();
    let retval = await Promise.all(filenames.forEach((filename) => {
    }));
    if (this.ext === "json") {
      retval = retval.map((item) => JSON.parse(item));
    }
    return retval;
  }
  async length() {
    return (await this.listFilenames()).length;
  }
  async iterate(predicate) {
    for (const path of await this.listFilenames()) {
      const parts = path.split(/\//);
      const filename = parts[parts.length - 1];
      const data = await this.getItem(filename);
      if (predicate(data, filename)) {
        return data;
      }
    }
    return null;
  }
  async setItem(filename, data) {
    let write = data;
    if (data instanceof Blob) {
      write = await electron.blob2buffer(data, "binary");
    }
    const result = await electron.jetpack.writeAsync(
      this.getFilePath(filename),
      write
    );
    return result;
  }
  async removeItem(filename, data) {
    log("removing", filename, data);
    return electron.jetpack.removeAsync(this.getFilePath(filename));
  }
  async getItem(filename, def) {
    let readAs = "buffer";
    if (this.ext === "json") {
      readAs = "json";
    }
    let data = await electron.jetpack.readAsync(
      this.getFilePath(filename),
      readAs
    );
    if (data && readAs === "buffer") {
      data = await electron.buffer2blob(data);
    }
    return data || def;
  }
}
export {
  JetpackDriver as default
};
