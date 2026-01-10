# Changelog

## [UNRELEASED]

### Added
- A CLI arg can now be passed to center launch around a different target than 'dev'
- Keyboard shortcut: `C-l` - launch immediately
- Keyboard shortcut: `S-↑` / `S-↓` - Cycle through configurations regardless of focused component
- Trim footer legend to fit terminal width using priority-based culling of keyboard shortcut entries
- **npm**-launcher.
- Substitute modifier-prefixed key symbols when generating key legend

### Changed
- CLI arg for repeating last launch has been changed to `--repeat` / `-r`
- CLI arg for outputting terminal capabilities has been changed to `--term-info` / `-i`.

---


## [0.1.4] - 2025-11-19
Grouped key legends + Docker Compose fix

### Added
- Grouped footer keyboard legend into categories

### Fixed
- Fixed issue when docker compose failed to launch due to references to missing services in configs

---


## [0.1.3] - 2025-10-03
Docker Compose + Transient Configs

### Added
- Support for launching docker-compose.yaml services
- Show target/package script name per component when relevant
- Select target/package script per component for capable launchers
- Show last launched configuration as "Last Launch" config option if not saved
- Show transient launch session as "New Config" config option 

---


## [0.1.2] - 2025-09-23
Stability release

### Added
- a launch configuration.

### Fixed
- Fixed crash when attempting to delete 
- Fixed crash when deleting the last launch configuration kept focus on destroyed UI component

---


## [0.1.1] - 2025-09-20
Windows support & Color Theme adjustment

### Added
- Support for launching child process on Windows
- Query terminal environment for capabilities and adjustment of color theme / launch strategy
- CLI: Added `env` and `last` commands

### Changed
- Proper/better resolution of executables

---


## [0.1.0] - 2025-09-14
Initial Release

### Added

- Basic Project Discovery and launching capabilities for NodeJS projects
- Basic component selection and create/launch/delete launch configurations

