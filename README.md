
# Launch Goblin

> A terminal-based launcher for multimodule projects.  
> Granular control over what you start, how you start it, and when.

[![Build and Test](https://github.com/svjson/launch-goblin/actions/workflows/build-and-test.yaml/badge.svg)](https://github.com/svjson/launch-goblin/actions/workflows/build-and-test.yaml)
[![npm version](https://img.shields.io/npm/v/launch-goblin.svg)](https://www.npmjs.com/package/launch-goblin)
[![GitHub](https://img.shields.io/badge/GitHub-svjson%2Flaunch--goblin-blue?logo=github)](https://github.com/svjson/launch-goblin)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/node/v/launch-goblin)](https://www.npmjs.com/package/launch-goblin)

Launch Goblin is a TUI (text-based user interface) tool for developers working in monorepos or other multi-service environments.  
Instead of juggling `turbo run` and `pnpm dev` with endless `--filter` sequences, shell scripts, or custom launchers, you get a single interface where you can:

- Inspect available modules
- Select what to launch
- Run targets interactively
- Keep both shared and private launch configurations

## Features (0.1.4)

- **Turborepo integration** – browse and run `turbo run` targets per module.  
- **pnpm integration** – run `pnpm` scripts directly from the interface.  
- **docker compose** - run all or a selection of services from your `docker-compose.yaml`.  
- **Interactive TUI** – keyboard-driven, curses-style UI with focus and navigation.  
- **Granularity** – pick specific modules or run multiple together.  


## Installation

### System-wide

To install `launch-goblin` as a global command on your system, you typically use a package manager. 

```sh
$ pnpm install -g launch-goblin
```

Then run it from your repository/multi-module product root:

```sh
$ launch-goblin
```

### NodeJS project

To use launch-goblin in a NodeJS project, add it as a devDependency and create a package.json script:

```sh
$ pnpm add -D launch-goblin
```

**package.json**
```json
{
  "scripts": {
    "dev": "launch-goblin"
  }
}
```

## Running Launch Goblin

By default, Launch Goblin attempts to run the `dev` target/script of your project or turborepo configuration.

### Commands / Arguments

| Argument  | Command                                                                                                |
|-----------|--------------------------------------------------------------------------------------------------------|
| <no-args> | Open the Launch Goblin TUI                                                                             |
| last      | Bypasses the TUI component selection and immediately launches the most recently launched configuration |
| env       | Outputs the information about the terminal environment you are running in                              |

When running the Launch Goblin TUI, you can use `--color-mode <mode>` to force a specific color mode. 
This is helpful if the terminal misreports its capabilities, which can otherwise cause issues like 
black text on a black background.

Valid Color Modes are: `truecolor`, `16`, `8` and `monochrome`

## Configuration and Project Discovery

Launch Goblin aims to be zero- or low-conf, and will automatically discover facets of projects - to a point.  
In the early version that it is currently in, there is no way to configure Launch Goblin or provide hints.

The aim will always be to not force the user to configure or specify what could or should be inferred, 
[dwim](https://en.wikipedia.org/wiki/DWIM)-style there may still be plenty of cases where one might tweak
or inform the project setup, and this will be enabled as the project matures.

## Version History

### 0.1.4 - Grouped key legends + Docker Compose fix - 2025-11-19

- Fixed issue when docker compose failed to launch due to references to missing services in configs
- Grouped footer keyboard legend into categories

### 0.1.3 - Docker Compose + Transient Configs - 2025-10-03

- Support for launching docker-compose.yaml services
- Show target/package script name per component when relevant
- Select target/package script per component for capable launchers
- Show last launched configuration as "Last Launch" config option if not saved
- Show transient launch session as "New Config" config option 

### 0.1.2 - Stability - 2025-09-23

- Fixed crash when attempting to delete a launch configuration.
- Fixed crash when deleting the last launch configuration kept focus on destroyed UI component

### 0.1.1 - Windows support & Color Theme adjustment - 2025-09-20

- Proper/better resolution of executables
- Support for launching child process on Windows
- Query terminal environment for capabilities and adjustment of color theme / launch strategy
- Added `env` and `last` commands

### 0.1.0 - Initial Release - 2025-09-14

- Basic Project Discovery and launching capabilities for NodeJS projects
- Basic component selection and create/launch/delete launch configurations

## Roadmap

### Short-term (0.1.x - 0.2.0)
- Config management: 
  - ✅ Create 
  - rename
  - Edit
- ✅ Auto-keep “last launched” setup, even if not saved as config.
- CLI mode: run configs directly without opening the TUI.
- ✅ Allow different modules to be launched with different launch scripts.
- More control over process lifecycle for launcher strategies where it makes sense (restart/stop).
- Additional backends: Docker Compose, tmux, and more.
  - ✅ Docker Compose
- Configurable keymaps and themes.
- ✅ Persisted state across sessions.
- Support for parallel vs sequential launch strategies.

## License

© 2025 Sven Johansson. [MIT Licensed](./LICENSE)
