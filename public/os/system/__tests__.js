async function runTests() {
  await fileCreation();
}

async function evaluateTest(testFunction, message, expectedBoolean) {
  if ((await testFunction) === expectedBoolean) {
    console.log("Passed: " + message);
  } else {
    console.warn("Failed: " + message);
  }
}

async function _createFile(filePath) {
  window.top.postMessage(`MK:F[${filePath}`);
  const isFileCreated = await waitForFileCreation(filePath);
  return isFileCreated;
}

async function fileCreation() {
  evaluateTest(
    _createFile("testfile.hml"),
    "Files can be created with a normal name.",
    true
  );

  evaluateTest(
    _createFile("testfile"),
    "Files can be created without an extension.",
    true
  );

  evaluateTest(
    _createFile(""),
    "Files cannot be created with an empty name.",
    false
  );
}
