const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("quit", {
  exit: () => {
    ipcRenderer.invoke("quit-app");
  },
});

window.addEventListener("DOMContentLoaded", async () => {
  const printers = await fetch("http://localhost:5050/printer")
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      alert("Cannot get printers in this PC, please try again.");
    });

  const printerDB = await fetch("http://localhost:5050/printerdb")
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      alert("Cannot get printers in this PC, please try again.");
    });

  const options = printers.map((printer, idx) => ({
    id: idx,
    name: printer.name,
  }));

  for (const type of [
    "printer1",
    "printer2",
    "printer3",
    "printer4",
    "printer5",
  ]) {
    const printer = document.getElementById(`${type}`);
    printer.options[printer.options.length] = new Option(
      "Not selected",
      "",
      true
    );
    for (let i = 0; i < options.length; i++) {
      if (printerDB[type] === options[i].name) {
        printer.options[printer.options.length] = new Option(
          options[i].name,
          options[i].name,
          false,
          true
        );
      } else {
        printer.options[printer.options.length] = new Option(
          options[i].name,
          options[i].name,
          false,
          false
        );
      }
    }

    const info = printers.find((printer) => printer.name === printerDB[type]);
    updatePritnerInfo(type, info);
  }
});

const isOffline = (attributes) => {
  const isOffline = attributes.includes("OFFLINE");
  return isOffline;
};

const updatePritnerInfo = (printer, info) => {
  const status = document.getElementById(`${printer}-status`);
  const jobs = document.getElementById(`${printer}-jobs`);
  const error = document.getElementById(`${printer}-error`);
  const lastUpdate = document.getElementById(`${printer}-lastUpdated`);

  if (info !== undefined) {
    status.innerHTML = isOffline(info.attributes) ? "Offline" : "Online";
    jobs.innerHTML = info.jobs ? info.jobs.length : 0;
    lastUpdate.innerHTML = Date.now();
    error.innerHTML = "";
  } else {
    status.innerHTML = "-";
    jobs.innerHTML = "-";
    lastUpdate.innerHTML = "-";
    error.innerHTML = "";
  }
};

const checkQueueError = () => {};
