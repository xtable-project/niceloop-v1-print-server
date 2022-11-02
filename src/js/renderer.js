const printers = ["printer1", "printer2", "printer3", "printer4", "printer5"];

const exitButton = document.getElementById("exit-button");
exitButton.addEventListener("click", () => {
  window.quit.exit();
});

const onSelectedPrinter = async (event) => {
  const printer = event.target.name;
  const name = event.target.value;

  const printers = await getCurrentPrinters(printer, name);
  await savePrinterDB(printers);
  await watchPrinter(15);
};

const getCurrentPrinters = async (printer, name) => {
  const printerDB = await fetchPrinterDB();
  const getKeysByDuplicateValue = Object.keys(printerDB).find(
    (key) => printerDB[key] === name
  );
  const isKeyDuplicate = getKeysByDuplicateValue !== undefined;

  if (isKeyDuplicate) {
    if (printerDB[getKeysByDuplicateValue] !== "") {
      printerDB[getKeysByDuplicateValue] = printerDB[printer];
      printerDB[printer] = name;
    } else {
      printerDB[getKeysByDuplicateValue] = "";
      printerDB[printer] = name;
    }
  } else {
    printerDB[printer] = name;
  }

  return printerDB;
};

const savePrinterDB = async (printers) => {
  await fetch("http://localhost:5050/printer", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ printers }),
  });
};

const fetchPrinterDB = async () => {
  const printers = await fetch(`http://localhost:5050/printerdb`)
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      return undefined;
    });
  return printers;
};

const fectchPrinterInfo = async (name) => {
  const printer = await fetch(`http://localhost:5050/printer/${name}`)
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      return undefined;
    });
  return printer;
};

const fetchWatchList = async () => {
  const printers = await fetch("http://localhost:5050/printerdb")
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      return undefined;
    });

  let watchList = []; // [{printer: 'printer1', name: 'Cannon'}]

  Object.keys(printers).forEach((p) => {
    if (printers[p] !== "") {
      watchList.push({ printer: p, name: printers[p] });
    }
  });

  return watchList;
};

const fetchSetting = async () => {
  const settings = await fetch("http://localhost:5050/setting")
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      return undefined;
    });
  return settings;
};

const watchPrinter = async (alertTime) => {
  console.log("Start watching printer.");
  const printerDB = await fetchPrinterDB();

  Object.keys(printerDB).forEach(async (printer) => {
    let printerInfo = {};
    if (printerDB[printer] !== "") {
      printerInfo = await fectchPrinterInfo(printerDB[printer]);
      updatePritnerInfo(printer, printerInfo);
      await updateRecord(printer, printerInfo.jobs, printerInfo.name);
    } else {
      updatePritnerInfo(printer, printerInfo);
      await updateRecord(printer, printerInfo.jobs, printerInfo.name);
    }
  });

  await checkRecord(alertTime);
};

const updateRecord = async (printer, jobs, name) => {
  const getRecord = await fetchRecord();
  if (jobs !== undefined) {
    for (let i = 0; i < jobs.length; i++) {
      const records = getRecord[printer] || [];
      const isHaveRecord = records.some((record) => record.id == jobs[i].id);
      if (!isHaveRecord || records.length === 0) {
        createRecord(printer, jobs[i].id, Date.now(), name);
      }
    }
  }

  if (jobs === undefined && getRecord[printer].length !== 0) {
    await deleteRecord(printer);
  }
};

const createRecord = async (printer, recordId, timestamp, name) => {
  await fetch("http://localhost:5050/record", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ printer, recordId, timestamp, name }),
  });
};

const deleteRecord = async (printer, recordId = undefined) => {
  await fetch("http://localhost:5050/record", {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ printer, recordId }),
  });
};

const updatePritnerInfo = (printer, info) => {
  const status = document.getElementById(`${printer}-status`);
  const jobs = document.getElementById(`${printer}-jobs`);
  const error = document.getElementById(`${printer}-error`);
  const lastUpdate = document.getElementById(`${printer}-lastUpdated`);

  if (Object.keys(info).length === 0) {
    status.innerHTML = "-";
    jobs.innerHTML = "-";
    lastUpdate.innerHTML = "-";
    error.style.visibility = "hidden";
  } else {
    status.innerHTML = isOffline(info.attributes) ? "Offline" : "Online";
    jobs.innerHTML = info.jobs ? info.jobs.length : 0;
    lastUpdate.innerHTML = Date.now();
  }
};

const checkRecord = async (alertTime) => {
  const records = await fetchRecord();
  for (let i = 0; i < printers.length; i++) {
    const error = document.getElementById(`${printers[i]}-error`);
    error.style.visibility = "hidden";
    if (records[printers[i]].length === 0) continue;
    records[printers[i]].forEach((record) => {
      if (isOverTime(record.timestamp, alertTime) === true) {
        showNotification(`Printer ${record.name} is error!`);
        error.style.visibility = "visible";
      } else {
        error.style.visibility = "hidden";
      }
    });
  }
};

const isOverTime = (time, alertTime) => {
  const startDate = new Date(parseInt(time));
  const endDate = new Date(Date.now());

  const diff = endDate.getTime() - startDate.getTime();
  const diffMinutes = diff / 600; // Convert to seconds

  const isError = diffMinutes >= alertTime;
  return isError;
};

const fetchRecord = async () => {
  const records = await fetch("http://localhost:5050/record")
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      return undefined;
    });
  return records;
};

const isOffline = (attributes) => {
  if (!attributes) return;
  const isOffline = attributes.includes("OFFLINE");
  return isOffline;
};

function showNotification(message) {
  const audio = document.getElementById("audio");
  const NOTIFICATION_TITLE = "Niceloop Printer";
  new Notification(NOTIFICATION_TITLE, { body: message });
  audio.play();
}

window.addEventListener("load", async () => {
  const settings = await fetchSetting();
  const milliseconds = settings.refreshTime * 1000;

  setInterval(async () => {
    await watchPrinter(15);
  }, 10000);
});
