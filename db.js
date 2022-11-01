const e = require("express");
const fs = require("fs");

class DB {
  constructor(filename) {
    if (!filename)
      throw new Error("Filename is required to create a datastore!");
    this.filename = filename;
    try {
      fs.accessSync(this.filename);
    } catch (err) {
      const defaultDB = {
        printers: {
          printer1: "",
          printer2: "",
          printer3: "",
          printer4: "",
          printer5: "",
        },
        record: {
          printer1: [],
          printer2: [],
          printer3: [],
          printer4: [],
          printer5: [],
        },
      };
      const defaultSetting = {
        alertTime: 0,
        refreshTime: 0,
      };

      if (this.filename === "db.json") {
        fs.writeFileSync(this.filename, JSON.stringify(defaultDB));
      }

      if (this.filename === "setting.json") {
        fs.writeFileSync(this.filename, JSON.stringify(defaultSetting));
      }
    }
  }

  async saveRecord(printer, id, timestamp, name) {
    const jsonRecord = await fs.promises.readFile(this.filename, {
      encoding: "utf8",
    });
    const objRecord = JSON.parse(jsonRecord);

    const record = objRecord.record[printer] || [];
    record.push({ id, timestamp, name });

    objRecord.record[printer] = record;

    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(objRecord, null, 2)
    );

    return printer;
  }

  async clearRecord(printer, id = undefined) {
    if (!printer) return;
    const jsonRecord = await fs.promises.readFile(this.filename, {
      encoding: "utf8",
    });
    const objRecord = JSON.parse(jsonRecord);

    if (id !== undefined) {
      const records = objRecord.record[printer];
      const newRecords = records.filter((record) => record.id !== id);
      objRecord.record[printer] = newRecords;
    } else {
      objRecord.record[printer] = [];
    }

    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(objRecord, null, 2)
    );

    return printer;
  }

  async savePrinter(printers) {
    const jsonRecord = await fs.promises.readFile(this.filename, {
      encoding: "utf8",
    });

    const objRecord = JSON.parse(jsonRecord);

    objRecord.printers = printers;

    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(objRecord, null, 2)
    );

    return printers;
  }

  async saveSetting(name, value) {
    const jsonRecord = await fs.promises.readFile(this.filename, {
      encoding: "utf-8",
    });

    const objRecord = JSON.parse(jsonRecord);

    objRecord.setting[name] = value;
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(objRecord, null, 2)
    );

    return name;
  }

  async read() {
    const jsonRecord = await fs.promises.readFile(this.filename, {
      encoding: "utf8",
    });
    const objRecord = JSON.parse(jsonRecord);
    return objRecord;
  }
}

module.exports = DB;
