function sendMessageToAllIframes(message) {
  const iframes = document.getElementsByTagName("iframe");
  for (let i = 0; i < iframes.length; i++) {
    iframes[i].contentWindow.postMessage(message, "*");
  }
}

function checkFileExistsOrCreate(directory, fileName, fullDirPath) {
  if (directory.hasOwnProperty(fileName)) {
    window.top.postMessage("ALERT:[A file with that name already exists!");
  } else {
    directory[fileName] = fullDirPath;
    saveRecord(fullDirPath, "", "rwd");
    return true;
  }
  return false;
}

function makeFile(directoryPath, fileTree, fileName, fullDirPath) {
  const directories = directoryPath.split("/");
  const currentDirectory = directories.shift();

  // If file to be created is in root dir
  if (directoryPath === "") {
    return checkFileExistsOrCreate(fileTree, fileName, fullDirPath);
  } else if (currentDirectory && fileTree.hasOwnProperty(currentDirectory)) {
    if (directories.length === 0) {
      return checkFileExistsOrCreate(
        fileTree[currentDirectory],
        fileName,
        fullDirPath
      );
    } else {
      // Continue recursively for nested directories
      const nestedDirectoryPath = directories.join("/");
      return makeFile(
        nestedDirectoryPath,
        fileTree[currentDirectory],
        fileName,
        fullDirPath
      );
    }
  } else {
    window.top.postMessage("ALERT:[Could not create new file here.");
    return false;
  }
}

const FILE_STATUSES = {
  processing: "p",
  success: "s",
  fail: "f",
};

let fileCreationQueue = [];

function waitForFileCreation(fileName) {
  return new Promise((resolve) => {
    const checkFileStatus = () => {
      const fileEntry = fileCreationQueue.find(
        (entry) => entry.path === fileName
      );
      if (fileEntry) {
        if (fileEntry.status === FILE_STATUSES.success) {
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        // If the file entry doesn't exist yet, keep checking
        requestAnimationFrame(checkFileStatus);
      }
    };

    // Start the first check
    requestAnimationFrame(checkFileStatus);
  });
}

function handleMakeFile(filePath) {
  const fileEntry = {
    path: filePath,
    status: FILE_STATUSES.processing,
  };
  fileCreationQueue.push(fileEntry);

  const directories = filePath.split("/");
  const fileName = directories.pop();
  if (fileName === "") {
    fileEntry.status = FILE_STATUSES.fail;
    return;
  }
  const directoryPath = directories.join("/");

  if (makeFile(directoryPath, fileTree, fileName, filePath)) {
    fileEntry.status = FILE_STATUSES.success;
    sendMessageToAllIframes("AF:" + JSON.stringify(fileTree), "*");
  } else {
    fileEntry.status = FILE_STATUSES.fail;
  }
}

function makeFolder(
  directoryPath,
  fileTree,
  folderName,
  folderContents = null
) {
  const directories = directoryPath.split("/");
  const currentDirectory = directories.shift();

  // If folder to be created is in root dir
  if (directoryPath === "") {
    if (!fileTree.hasOwnProperty(folderName)) {
      if (folderContents !== null) {
        fileTree[folderName] = folderContents;
      } else {
        fileTree[folderName] = {};
      }
    }
  } else if (
    currentDirectory &&
    fileTree.hasOwnProperty(currentDirectory)
  ) {
    if (directories.length === 0) {
      if (!fileTree[currentDirectory].hasOwnProperty(folderName)) {
        if (folderContents !== null) {
          fileTree[folderName] = folderContents;
        } else {
          fileTree[folderName] = {};
        }
      }
    } else {
      // Continue recursively for nested directories
      const nestedDirectoryPath = directories.join("/");
      makeFolder(
        nestedDirectoryPath,
        fileTree[currentDirectory],
        folderName
      );
    }
  } else {
    window.top.postMessage("ALERT:[Could not create new folder here.");
    return;
  }
}

function handleMakeFolder(folderPath) {
  const directories = folderPath.split("/");
  const folderName = directories.pop();

  if (folderName === "") {
    return;
  }

  const directoryPath = directories.join("/");
  makeFolder(directoryPath, fileTree, folderName);
  sendMessageToAllIframes("AF:" + JSON.stringify(fileTree), "*");
}

async function loadTests() {
  let testScript = document.createElement("script");
  testScript.type = "text/javascript";
  const time = new Date().getTime();
  try {
    const response = await fetch(`/os/system/__tests__.js?t=${time}`);
    if (response.ok) {
      const content = await response.text();
      testScript.textContent = content;
      document.body.appendChild(testScript);
    } else {
      console.error(`Error fetching file HTTP status ${response.status}`);
    }
  } catch (err) {
    console.error(`Error fetching file : ${err}`);
  }
}

window.onmessage = async function (e) {
  if (e.origin !== window.origin || typeof e.data !== "string") {
    return;
  }

  switch (true) {
    case e.data.startsWith("ALERT:["):
      createAlert(e.data.slice(7));
      break;

    case e.data.startsWith("MK:D["):
      handleMakeFolder(e.data.slice(5));
      break;

    case e.data.startsWith("MK:F["):
      handleMakeFile(e.data.slice(5));
      break;

    case e.data.startsWith("OP:"):
      openProgram(e.data.slice(3));
      break;

    case e.data === "REQ:AF":
      sendMessageToAllIframes("AF:" + JSON.stringify(fileTree), "*");
      break;

    case e.data === "REQ:ICONS[files":
      const fileIcons = await getFileFromDB("system/icons/files.json");
      e.source.postMessage("ICONS:FILES>" + fileIcons, "*");

    case e.data === "REQ:OSV":
      e.source.postMessage("OSV:1.7", "*");
      break;

    case e.data === "REQ:SS":
      const systemStyleSheet = await getFileFromDB("system/gui.css");
      e.source.postMessage("SS:" + systemStyleSheet, "*");
      break;

    case e.data === "RUNTESTS":
      await loadTests();
      await runTests();
      break;

    default:
      console.warn("Unknown request: " + e.data);
  }
};
