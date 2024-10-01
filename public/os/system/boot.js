const fileTreeStructure = {
  system: [
    "gui.css",
    "settings.json",
    "desktopBG.jpg",
    "menuShortcuts.json",
    "tests.html",
    {
      icons: ["files.json"],
    },
  ],
  programs: [
    {
      default: [
        "Files.html",
        "youTubeFilter.html",
        "notepad.html",
        "imageViewer.html",
        "Calculator.html",
        "tetrJS.html",
        "appStore.html",
        "browser.html",
        "settings.html",
      ],
    },
  ],
  documents: ["message.txt", "meme.png"],
};

async function fetchContent(fileURL) {
  try {
    let time = new Date().getTime();
    const response = await fetch(`${fileURL}?t=${time}`);

    if (response.ok) {
      const extension = fileURL.split(".").pop().toLowerCase();
      // Determine if the file is of a type that we handle as text
      if (["html", "css", "json", "js", "txt"].includes(extension)) {
        return await response.text();
      } else {
        const arrayBuffer = await response.arrayBuffer();
        const binaryContent = new Uint8Array(arrayBuffer);
        let base64String = "";
        for (let i = 0; i < binaryContent.length; i += 65535) {
          base64String += btoa(
            String.fromCharCode(...binaryContent.slice(i, i + 65535))
          );
        }

        return base64String;
      }
    } else {
      console.error(
        `Error fetching file ${fileURL}: HTTP status ${response.status}`
      );
    }
  } catch (err) {
    console.error(`Error fetching file ${fileURL}: ${err}`);
  }
}

async function installOS(fileTreeStructure, basePath = "os/") {
  let tempFileContent = {};
  let tempObjectContent = {};

  for (let key in fileTreeStructure) {
    if (Array.isArray(fileTreeStructure[key])) {
      tempFileContent[key] = {};
      for (let item of fileTreeStructure[key]) {
        if (typeof item === "string") {
          let fileURL = `${basePath}${key}/${item}`;
          let content = await fetchContent(fileURL);
          saveRecord(fileURL.substring(3), content, "r");
          tempFileContent[key][item] = fileURL;
        } else if (typeof item === "object") {
          for (let nestedKey in item) {
            tempObjectContent = tempFileContent;
            tempObjectContent[key][nestedKey] = await installOS(
              { [nestedKey]: item[nestedKey] },
              `${basePath}${key}/`
            );
            tempFileContent[key][nestedKey] =
              tempObjectContent[key][nestedKey][nestedKey];
          }
        }
      }
    }
  }

  return tempFileContent;
}

const dbName = "HardDrive";
const storeName = "FileData";
let db;

// Function to delete the existing database
function deleteDB() {
  return new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(dbName);

    deleteRequest.onsuccess = function () {
      console.log(`Database ${dbName} deleted successfully.`);
      resolve();
    };

    deleteRequest.onerror = function (event) {
      console.error(`Error deleting database: ${event.target.errorCode}`);
      reject(event.target.errorCode);
    };

    deleteRequest.onblocked = function () {
      console.warn(`Deletion of database ${dbName} is blocked.`);
      reject("Database deletion blocked");
    };
  });
}

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function (event) {
      db = event.target.result;

      if (!db.objectStoreNames.contains(storeName)) {
        const objectStore = db.createObjectStore(storeName, {
          keyPath: "id",
          autoIncrement: true,
        });

        objectStore.createIndex("path", "path", { unique: true });
        objectStore.createIndex("data", "data", { unique: false });
        objectStore.createIndex("access", "access", { unique: false });
      }
    };

    request.onsuccess = function (event) {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = function (event) {
      reject(`Database error: ${event.target.errorCode}`);
    };
  });
}

// Save a record to the database
function saveRecord(path, data, access) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite");
    const objectStore = transaction.objectStore(storeName);

    const record = {
      path: path,
      data: data,
      access: access,
    };

    const request = objectStore.add(record);

    request.onsuccess = function () {
      resolve("Record added successfully");
    };

    request.onerror = function (event) {
      reject(`Add failed: ${event.target.errorCode}`);
    };
  });
}

// Get a file from IndexedDB by path
function getFileFromDB(path) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly");
    const objectStore = transaction.objectStore(storeName);
    const index = objectStore.index("path");
    const request = index.get(path);

    request.onsuccess = function (event) {
      if (event.target.result) {
        resolve(event.target.result.data);
      } else {
        reject(`File not found: ${path}`);
      }
    };

    request.onerror = function () {
      reject(`Error retrieving file: ${path}`);
    };
  });
}

// Boot from the files in IndexedDB
async function boot() {
  try {
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.innerText = await getFileFromDB("system/gui.css");
    document.head.appendChild(styleElement);

    guiStart();
  } catch (error) {
    console.error("Boot Error: ", error);
  }
}

var fileTree = {};
async function run() {
  try {
    const tonkenData = localStorage.getItem("authToken");
    if (!tonkenData) {
      window.location.href = "/login.html";
    }
    const token = JSON.parse(tonkenData).accesToken;

    const response = await fetch("/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("token ok.");
    } else {
      window.location.href = "/login.html";
    }
  } catch (error) {
    console.error("Network error:", error);
    
  }

  try {
    await deleteDB(); // Delete existing database before reinitializing
    await initDB();
    fileTree = await installOS(fileTreeStructure);
    await boot();
  } catch (error) {
    console.error(error);
  }
}

run();
