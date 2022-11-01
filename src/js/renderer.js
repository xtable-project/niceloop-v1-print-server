const printers = ["printer1", "printer2", "printer3", "printer4", "printer5"];

const onSelectedPrinter = async (event) => {
  const printer = event.target.name;
  const name = event.target.value;

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

  await fetch("http://localhost:5050/printer", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ printers: printerDB }),
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
  const watchList = await fetchWatchList();
  watchList.forEach(async (watch) => {
    const printerInfo = await fectchPrinterInfo(watch.name);
    updatePritnerInfo(watch.printer, printerInfo, alertTime);
    await updateRecord(watch.printer, printerInfo.jobs, printerInfo.name);
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

  const totalJobs = info.jobs ? info.jobs.length : 0;

  if (info !== undefined) {
    status.innerHTML = isOffline(info.attributes) ? "Offline" : "Online";
    jobs.innerHTML = totalJobs;
    lastUpdate.innerHTML = Date.now();
    // error.innerHTML = checkQueueError(
    //   oldDate,
    //   Date.now(),
    //   totalJobs,
    //   info.name,
    //   alertTime
    // )
    //   ? "ERROR"
    //   : "";
  } else {
    status.innerHTML = "-";
    jobs.innerHTML = "-";
    lastUpdate.innerHTML = "-";
    error.innerHTML = "";
  }
};

const checkRecord = async (alertTime) => {
  const records = await fetchRecord();
  for (let i = 0; i < printers.length; i++) {
    if (records[printers[i]].length === 0) continue;
    records[printers[i]].forEach((record) => {
      if (isOverTime(record.timestamp, alertTime) === true) {
        showNotification(`Printer ${record.name} is error!`);
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
  const isOffline = attributes.includes("OFFLINE");
  return isOffline;
};

function showNotification(message) {
  const NOTIFICATION_TITLE = "Niceloop Printer";
  new Notification(NOTIFICATION_TITLE, { body: message });
}

window.addEventListener("load", async () => {
  const settings = await fetchSetting();
  const milliseconds = settings.alertTime * 1000;
  setInterval(() => {
    watchPrinter(settings.alertTime);
  }, milliseconds);
});
