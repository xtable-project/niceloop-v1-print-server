const printer = require("@grandchef/node-printer");

const getPrinterList = () => {
  const printers = printer.getPrinters();
  return printers;
};

const getPrinterByName = (printerName) => {
  const result = printer.getPrinter(printerName);
  return result;
};

const getPrinterQueue = (printerName) => {
  
  const result = printer.getPrinter(printerName);
  if (result.jobs === undefined) {
    return { name: printerName, queue: 0 };
  }
  return { name: printerName, queue: result.jobs.length };
};

exports.getPrinterList = getPrinterList;
exports.getPrinterByName = getPrinterByName;
exports.getPrinterQueue = getPrinterQueue;
