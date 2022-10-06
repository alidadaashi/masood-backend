const detectClones = require("jscpd");

(async () => {
  try {
    const dir = `${__dirname}`.replace(/\\/g, "/");
    const clones = await detectClones.detectClones({
      path: [
        dir,
      ],
      silent: true,
    });
    clones.forEach((clone) => {
      console.log("\n");
      console.log("File Name ", "     ", clone.duplicationA.sourceId, " ",
        "[", clone.duplicationA.start.line, ":", clone.duplicationA.end.line, "]",
        "  ", "(Lines ", (clone.duplicationA.end.line - clone.duplicationA.start.line), ")");

      console.log("File Name ", "     ", clone.duplicationB.sourceId, " ",
        "[", clone.duplicationB.start.line, ":", clone.duplicationB.end.line, "]",
        "  ", "(Lines ", (clone.duplicationA.end.line - clone.duplicationA.start.line), ")", "\n",
        "Fragment ", "     ", clone.duplicationA.fragment, "\n");
    });

    if (clones.length) {
      process.exitCode = 1;
    }
  } catch (e) {
    console.log(e.toString());
  }
})();
