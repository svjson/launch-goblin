
# Launch Goblin

[![npm version](https://img.shields.io/npm/v/launch-goblin.svg)](https://www.npmjs.com/package/launch-goblin)
[![GitHub](https://img.shields.io/badge/GitHub-svjson%2Flaunch--goblin-blue?logo=github)](https://github.com/svjson/launch-goblin)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/node/v/duck-decoy)](https://www.npmjs.com/package/duck-decoy)

> A terminal-based launcher for multimodule projects.  
> Granular control over what you start, how you start it, and when.

Launch Goblin is a TUI (text-based user interface) tool for developers working in monorepos or other multi-service environments.  
Instead of juggling `turbo run` and `pnpm dev` with endless `--filter` sequences, shell scripts, or custom launchers, you get a single interface where you can:

- Inspect available modules
- Select what to launch
- Run targets interactively
- Keep visibility into what’s running



## Features (0.1.0)

- **Turborepo integration** – browse and run `turbo run` targets per module.  
- **pnpm integration** – run `pnpm` scripts directly from the interface.  
- **Interactive TUI** – keyboard-driven, curses-style UI with focus and navigation.  
- **Granularity** – pick specific modules or run multiple together.  


## Installation

### System-wide

To install `launch-goblin` as a global command on your system, you typically use a package manager. 

```bash
npm install -g launch-goblin
```

### NodeJS project

To use launch-goblin in a NodeJS project, add it as a devDependency and create a package.json script:

```sh
$ npm add -D launch-goblin
```

**package.json**
```json
{
  "scripts": {
    "dev": "launch-goblin"
  }
}
```

## Configuration and Project Discovery

Launch Goblin aims to be zero- or low-conf, and will automatically discover facets of projects - to a point.  
In the early version that it is currently in, there is no way to configure Launch Goblin or provide hints.

The aim will always be to not force the user to configure or specify what could or should be inferred, 
[dwim](https://en.wikipedia.org/wiki/DWIM)-style there may still be plenty of cases where one might tweak
or inform the project setup, and this will be enabled as the project matures.

## Roadmap

### Short-term (0.1.x - 0.2.0)
- Config management: create, rename, and edit launch configs.
- Auto-keep “last launched” setup, even if not saved as config.
- CLI mode: run configs directly without opening the TUI.
- Allow different modules to be launched with different launch scripts.
- More control over process lifecycle for launcher strategies where it makes sense (restart/stop).
- Additional backends: Docker Compose, tmux, and more.
- Configurable keymaps and themes.
- Persisted state across sessions.
- Support for parallel vs sequential launch strategies.




## License

© 2025 Sven Johansson. [MIT Licensed](./LICENSE)
