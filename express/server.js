const express = require("express");
const bodyParser = require("body-parser");
const {
  getPrinterList,
  getPrinterByName,
  getPrinterQueue,
} = require("../printer");
const DB = require("../db");
const app = express();

const db = new DB("db.json");
const setting = new DB("setting.json");

const port = 5050;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send(`Server is running at ${port}`);
});

app.get("/printer", (req, res) => {
  const printers = getPrinterList();
  res.json(printers);
});

app.get("/printerdb", async (req, res) => {
  const printerDB = await db.read();
  res.json(printerDB.printers);
});

app.get("/printer/:name", (req, res) => {
  const name = req.params.name;
  const printer = getPrinterByName(name);
  res.json(printer);
});

app.get("/printer/queue/:name", (req, res) => {
  const name = req.params.name;
  const queue = getPrinterQueue(name);
  res.json(queue);
});

app.post("/printer", async (req, res) => {
  const { printer, printerName } = req.body;
  const response = await db.savePrinter(printer, printerName);
  res.json(response);
});

app.post("/allprinter", async (req, res) => {
  const printers = req.body;
  const response = await db.savePrinter(printers);
  res.json(response);
});

app.get("/record", async (req, res) => {
  const recordDB = await db.read();
  res.json(recordDB.record);
});

app.post("/record", async (req, res) => {
  const { printer, recordId, timestamp, name } = req.body;
  const response = await db.saveRecord(printer, recordId, timestamp, name);

  res.json(response);
});

app.delete("/record", async (req, res) => {
  const { printer, recordId } = req.body;
  const response = await db.clearRecord(printer, recordId);
  res.json(response);
});

app.get("/setting", async (req, res) => {
  const getSetting = await setting.read();
  res.json(getSetting);
});

app.post("/setting", async (req, res) => {
  const { name, value } = req.body;
  const response = await setting.saveSetting(name, value);
  res.json(response);
});

const run = () => {
  // new Promise((resolve, reject) => {
  //   let getSetting = {};
  //   getSetting = setting.read();
  //   setTimeout(() => {
  //     if (getSetting.port !== undefined) {
  //       resolve(getSetting.port);
  //     } else {
  //       resolve({ port: 5050 });
  //     }
  //   }, 100);
  // }).then((response) => {
  //   app.listen(response.port, () => {
  //     console.log(`Server listening on port ${response.port}`);
  //   });
  // });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

exports.run = run;
