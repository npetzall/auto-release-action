const core = require("@actions/core");

// most @actions toolkit packages have async methods
async function run() {
  try {
    core.info("Not yet implemented")
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
