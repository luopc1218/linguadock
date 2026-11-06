const { execFileSync } = require("node:child_process");
const path = require("node:path");

/**
 * macOS refuses to launch arm64 apps that are not code-signed at all and
 * reports the app as "damaged". CI has no Developer ID certificate, so we seal
 * the packed app with an ad-hoc signature. `codesign` accepts "-" as an
 * ad-hoc identity. Real signing (CSC_LINK / CSC_NAME) still runs afterwards in
 * electron-builder and replaces this signature.
 */
module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;
  if (process.env.CSC_LINK || process.env.CSC_NAME) return;

  const appPath = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`,
  );
  console.log(`[afterPack] ad-hoc signing ${appPath}`);
  execFileSync(
    "codesign",
    ["--force", "--deep", "--sign", "-", "--timestamp=none", appPath],
    { stdio: "inherit" },
  );
  execFileSync("codesign", ["--verify", "--deep", "--strict", appPath], {
    stdio: "inherit",
  });
  console.log("[afterPack] ad-hoc signature verified");
};
