# symlink-workspace

A utility tool for managing symlinks in a Lerna project with Yarn workspaces, designed to streamline local development by ensuring packages are properly linked. Specifically, links to the `dist/` folder so you can use `publishConfig.directory` set to `dist/` for advanced cjs/esm publishing, enabling tree-shaking ;) 

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Configuration](#configuration)
- [License](#license)

## Installation

```bash 
yarn add --dev symlink-workspace 
``` 

Will automatically read your Lerna configuration, identify package dependencies, and create symlinks from each package's `dist` directory to the corresponding `node_modules` directory.

## Features

- **Automated Symlink Creation:** Automatically creates symlinks for local dependencies in both individual packages and the root `node_modules` directory.
- **Support for Multiple Workspaces:** Seamlessly handles projects with multiple workspaces as defined in `lerna.json`.
- **Custom Configuration:** Allows customization of symlink paths based on specific project needs.


## License

Distributed under the MIT License. See `LICENSE` for more information.
