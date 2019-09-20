// Stop node from complaining about fake memory leaks at higher concurrency
require("events").defaultMaxListeners = 20;
require("dotenv").config();

const path = require("path");
const uuid = require("uuid/v4");
const localIdentifier = uuid();

const screenResolution = "1920x1080";
const browserstack = require("browserstack-local");

const defaultCapabilities = {
  "browserstack.debug": true,
  "browserstack.local": true,
  "browserstack.networkLogs": true,
  "browserstack.localIdentifier": localIdentifier
};

const desktopCapabilities = {
  ...defaultCapabilities,
  os: "windows",
  os_version: "10",
  resolution: screenResolution
};
const windows7Capabilities = {
  ...defaultCapabilities,
  os: "windows",
  os_version: "7",
  resolution: screenResolution
};

const mobileCapabilities = {
  ...defaultCapabilities,
  real_mobile: true,
  "browserstack.appium_version": "1.14.0"
};

let capabilities = [
  {
    ...desktopCapabilities,
    browserName: 'Google Chrome',
    browser: "chrome",
    browser_version: "76",
    "browserstack.console": "info"
  },
  // TODO mobile browsers are having trouble with browser.keys
  //{
  //  ...mobileCapabilities,
  //  browserName: 'iPhone XS Safari',
  //  device: "iPhone XS",
  //  os_version: "13"
  //},
  //{
  //  ...mobileCapabilities,
  //  browserName: 'Google Pixel 3 Chrome',
  //  device: "Google Pixel 3",
  //  os_version: "9.0",
  //  chromeOptions: {
  //    prefs: {
  //      // disable chrome's annoying password manager, may be unnec
  //      "profile.password_manager_enabled": false,
  //      credentials_enable_service: false,
  //      password_manager_enabled: false
  //    }
  //  }
  //},
  {
    ...desktopCapabilities,
    browser: "IE",
    browserName: 'IE 11',
    browser_version: "11.0",
    'browserstack.selenium_version' : '3.5.2'
  },
  {
    ...desktopCapabilities,
    browserName: 'Microsoft Edge',
    browser: "edge",
    browser_version: "18.0"
  },
  {
    ...desktopCapabilities,
    browserName: 'Firefox',
    browser: "firefox",
    browser_version: "69.0",
    "browserstack.console": "info"
  },
  {
    ...desktopCapabilities,
    browserName: 'Desktop Safari',
    browser: "safari",
    browser_version: "12.1",
    os: "OS X",
    os_version: "Mojave"
  }
];

if (process.env.ONLY_BROWSER) {
  capabilities = [
    capabilities.find(config => config.browser === process.env.ONLY_BROWSER)
  ]

  if (!capabilities[0]) {
    throw new Error(`Could not find browser ${process.env.ONLY_BROWSER} in config`);
  }
}

exports.config = {
  runner: "local",
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,
  browserstackLocal: true,
  specs: require("fs")
    .readdirSync("./test/integration")
    .map(f => `./test/integration/${f}`),
  exclude: [
    // 'path/to/excluded/files'
  ],
  maxInstances: 6,
  capabilities,
  sync: true,
  logLevel: "error",
  deprecationWarnings: true,
  bail: 0,
  baseUrl: process.env.HOST,
  waitforTimeout: 20000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 1,
  services: ["browserstack"],
  framework: "mocha",
  mochaOpts: {
    timeout: 60000
  },
  reporters: ["spec"],
  reportOptions: {
    outputDir: "./"
  },
  onPrepare() {
    /* eslint-disable no-console */
    console.log("Connecting local");
    return new Promise((resolve, reject) => {
      exports.bs_local = new browserstack.Local();
      exports.bs_local.start(
        {
          key: process.env.BROWSERSTACK_ACCESS_KEY,
          localIdentifier
        },
        error => {
          if (error) return reject(error);
          console.log(`Connected with localIdentifier=${localIdentifier}`);
          console.log(
            "Testing in the following browsers:",
            capabilities
              .map(
                browser =>
                  browser.real_mobile
                    ? `${browser.device}@${browser.os_version}`
                    : `${browser.browser}@${browser.browser_version}`
              )
              .join(", ")
          );

          return resolve();
        }
      );
    });
    /* eslint-enable no-console */
  },
  before(capabilities) {
    // Mobile devices/selenium don't support the following APIs yet
    if (!capabilities.real_mobile) {
      browser.maximizeWindow();
      browser.setTimeout({
        pageLoad: 10000,
        script: 5 * 60 * 1000
      });
    }
  },
  onComplete() {
    exports.bs_local.stop(() => {});
  }
};
