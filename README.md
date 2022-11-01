
# Printer Queue Checker



## Pre Installation

Install node-pre-gyp

```bash
  npm install -g node-pre-gyp
```

Install electron-builder

```bash
  npm i electron-builder
```

Install python

[Python Download Link](https://www.python.org/downloads/)


Install windows-build-tools in Visual Studio

[Visual Studio Download Link](https://visualstudio.microsoft.com/downloads/)

## Installation

1.Install project with npm

```bash
  npm install
```

2.Rebuild by electron-builder to match node ABI

```bash
  npx electron-builder install-app-deps
```

3.1 [FOR x64] Rebuild by electron-builder to match node ABI

```bash
  cd node_modules/@grandchef/node-printer
  node-pre-gyp configure --target=17.4.11 --arch=x64 --dist-url=https://electronjs.org/headers --module_name=node_printer
```

3.2 [FOR x32] Rebuild by electron-builder to match node ABI

```bash
  cd node_modules/@grandchef/node-printer
  node-pre-gyp rebuild --target_arch=ia32
  node-pre-gyp build package --runtime=electron --target=17.4.11 --target_arch=ia32 --build-from-source
```


    
## Usage

Run with development mode
```javascript
npm run dev
```

Run with production mode
```javascript
npm run start
```

Build application to installer file
```javascript
npm run make
```


## License

[MIT](https://choosealicense.com/licenses/mit/)


## Authors

- Niceloop

