import { B as BaseDriver, l as localForage } from "./index-S0JBva5K.js";
class LocalForageDriver extends BaseDriver {
  constructor(name) {
    super();
    this.db = localForage.createInstance({ name });
    this.name = name;
    this.type = "localforage";
  }
  async length() {
    return this.db.length();
  }
  async iterate(predicate) {
    return this.db.iterate(predicate);
  }
  async setItem(name, value) {
    try {
      if (value.__filepath) {
        delete value.__filepath;
      }
      return this.db.setItem(name, value);
    } catch (ex) {
      window.app.addAlert({
        title: "Failed to write to with localStorage driver",
        message: `${ex.message}`,
        ex
      });
    }
  }
  async getItem(name, def) {
    return this.db.getItem(name, def);
  }
  async removeItem(name) {
    return this.db.removeItem(name);
  }
}
export {
  LocalForageDriver as default
};
