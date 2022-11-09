const { createApp } = Vue;

createApp({
  data() {
    return {
      listAllPrinters: [],
      myPrinters: ["", "", "", "", ""], //["canno01", "hp01"]
      lastUpdate: {}, //{ 0: 12232 },
      jobs: {}, // { 0: [{ id: 1111 }, {}],
      jobIdStartTime: {}, // "Canon G2010 series:21": 123312235,
      status: {}, // {0: "ok", // fail,}
      setting: { port: 5050 }, // {refreshTime: 0, alertTime: 0}
      version: "", //"1.0.0"
      lastJobTime: {}, //{0: 12346}
    };
  },
  methods: {
    delay(millisec) {
      return new Promise((resolve) => setTimeout(resolve, millisec));
    },
    async main() {
      const refreshTime = this.setting.refreshTime * 1000;
      while (refreshTime) {
        await this.getAllListPrinter();
        await this.restoreMyPrinter();
        this.loopPrinterApi();
        this.getLastJobTime();
        await this.delay(refreshTime);
      }

      // get all list
      // restore my printer
      // read settings
      // loop fetch printer api
    },
    async getAllListPrinter() {
      const printers = await this.fetch("printer");
      this.listAllPrinters = printers;
    },
    async restoreMyPrinter() {
      const printerDB = await this.fetch("printerdb");

      for (let index = 0; index < this.myPrinters.length; index++) {
        this.myPrinters[index] = printerDB[`printer${index + 1}`];
      }
    },

    async readSetting() {
      const settings = await this.fetch("setting");
      this.setting = settings;
    },

    loopPrinterApi() {
      console.log("Start updating...");
      for (let index = 0; index < this.myPrinters.length; index++) {
        const printerName = this.myPrinters[index];
        this.lastUpdate[index] = new Date().valueOf();

        if (printerName === "") continue;
        const printer = this.listAllPrinters.find(
          (printer) => printer.name === printerName
        );

        if (printer === undefined) continue;
        const jobs = printer.jobs ? printer.jobs : [];
        this.jobs[index] = jobs;

        this.registerJobTimestamp(printerName, jobs);
      }

      this.makeAlert();
    },

    registerJobTimestamp(printerName, jobs) {
      let errorFlag = false;

      if (jobs) {
        for (let index = 0; index < jobs.length; index++) {
          const keyId = `${printerName}:${jobs[index].id}`;
          if (this.jobIdStartTime[keyId] === undefined) {
            this.jobIdStartTime[keyId] = new Date().valueOf();
          }

          const now = new Date().valueOf();
          const start = this.jobIdStartTime[keyId];

          const elasp = now - start;
          const alertTime = this.setting.alertTime * 1000;

          if (elasp > alertTime) {
            errorFlag = true;
          }
        }
      }

      if (errorFlag) {
        this.status[printerName] = "fail";
      } else {
        this.status[printerName] = "ok";
      }
    },
    clearJob(jobKeyId) {
      delete this.jobIdStartTime[jobKeyId];
    },
    makeAlert() {
      const status = _.values(this.status); // [ 'ok', 'ok', 'fail']
      _.forEach(status, (element, index) => {
        if (element === "fail") {
          const message = `เครื่องพิมพ์ ${this.myPrinters[index]} มีไฟล์ค้างเกินเวลาที่กำหนด กรุณาตรวจสอบ`;
          this.showNotification(message);

          const audio = document.getElementById("audio");
          audio.play();
        }
      });
    },
    async fetch(name, requset = undefined) {
      let port = "5050";
      if (this.setting.port !== undefined) {
        port = this.setting.port;
      }
      const url =
        requset === undefined
          ? `http://localhost:${port}/${name}`
          : `http://localhost:${port}/${name}/${requset}`;
      const response = await fetch(url)
        .then((response) => {
          return response.json();
        })
        .catch((err) => {
          return err;
        });
      return response;
    },
    async post(name, body) {
      let port = "5050";
      if (this.setting.port !== undefined) {
        port = this.setting.port;
      }
      const url = `http://localhost:${port}/${name}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => {
          return response;
        })
        .catch((err) => {
          return err;
        });
      return response;
    },
    showNotification(message) {
      const icon = "./asset/icon/warning.png";
      const NOTIFICATION_TITLE = "";

      const notification = new Notification(NOTIFICATION_TITLE, {
        body: message,
        icon,
      });

      notification.addEventListener("click", () => {
        window.quit.open();
      });
    },
    async onSeletedPrinter() {
      const body = {};
      _.forEach(this.myPrinters, (printer, index) => {
        body[`printer${index + 1}`] = printer;
      });
      const post = await this.post("allprinter", body);
      return post;
    },

    getPrinterStatus(printerName) {
      const printer = this.listAllPrinters.find(
        (printer) => printer.name === printerName
      );
      if (printer === undefined) return;
      const isOffline = printer.attributes.includes("OFFLINE");
      return isOffline ? "Offline" : "Online";
    },
    getJobs(printerName) {
      const printer = this.listAllPrinters.find(
        (printer) => printer.name === printerName
      );
      if (printer === undefined) return;
      const jobs = printer.jobs !== undefined ? printer.jobs.length : 0;
      return jobs;
    },
    getLastJobTime() {
      for (let index = 0; index < this.myPrinters.length; index++) {
        const printerName = this.myPrinters[index];
        if (printerName === "") continue;
        const printer = this.listAllPrinters.find(
          (printer) => printer.name === printerName
        );

        if (
          printer.jobs !== undefined &&
          this.lastJobTime[printerName] === undefined
        ) {
          this.lastJobTime[printerName] = new Date(
            new Date().valueOf()
          ).toLocaleTimeString();
        }

        if (printer.jobs === undefined) {
          delete this.lastJobTime[printerName];
        }
      }
    },
    getLastUpdate() {
      const date = new Date(new Date().valueOf())
        .toLocaleTimeString()
        .toString();
      return date;
    },
    exit() {
      window.quit.exit();
    },
    async getVersion() {
      this.version = await window.quit.version();
    },
  },
  async mounted() {
    await this.readSetting();
    await this.getAllListPrinter();
    await this.restoreMyPrinter();
    await this.getVersion();
    await this.main();
  },
}).mount("#app");
