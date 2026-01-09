# Changelog

## [UNRELEASED]

### Added
- Keyboard shortcut: `C-l` - launch immediately
- Keyboard shortcut: `S-↑` / `S-↓` - Cycle through configurations regardless of focused component
- Priority-based culling of keyboard shortcut legend in footer


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

