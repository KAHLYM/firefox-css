module.exports = Object.freeze({
    command: {
        LAUNCH: "firefox-css.launch",
        OPEN: "firefox-css.open",
    },
    configuration: {
        SECTION: "firefoxCSS",
        launchCloseExisting: {
            KEY: "launch.closeExisting"
        },
        launchOnSave: {
            KEY: "launch.onSave"
        },
        launchPath: {
            KEY: "launch.path"
        },
        source: {
            KEY: "source",
            enum: {
                BETA: "beta",
                MASTER: "master",
                RELEASE: "release"
            }
        },
        targetPlatform: {
            KEY: "targetPlatform",
            enum: {
                ALL: "All",
                LINUX: "Linux",
                MACOS: "macOS",
                WINDOWS: "Windows",
            }
        }
    },
    extension: {
        NAME: "Firefox CSS",
    },
    platform: {
        DARWIN: "darwin",
        FREEBSD: "freebsd",
        LINUX: "linux",
        SUNOS: "sunos",
        WIN32: "win32",
    },
    firefox: {
        file: {
            EXECUTABLE: "firefox.exe",
            USERCHROME: "userChrome.css"
        }
    },
    strings: {
        message: {
            getCompletions: {
                USE_CACHE: "Use cache",
                TRY_AGAIN: "Try again"
            },
            open: {
                CREATE: "Create",
                DISMISS: "Dismiss"
            }
        }
    }
});
