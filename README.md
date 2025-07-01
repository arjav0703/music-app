# Musik: A music player
![banner.svg](/public/banner.svg)

This is a simple desktop application built with Tauri and React that allows users to play music files. It supports basic functionalities such as playing, pausing, and skipping tracks.

---
The current version is a work in progress, and more features will be added in the future. 


## Installation

Arch Linux users can use the provided PKGBUILD to install the application.
```bash
git clone https://github.com/arjav0703/music-app.git
cd music-app
makepkg -si
```

On other linux distros and windows, you can download the latest release from the [releases page](https://github.com/arjav0703/music-app/releases/latest). For macOS, you can build the app from source with the following steps:

```bash
git clone https://github.com/arjav0703/music-app.git
cd music-app
npm install
npx tauri build
```
You can then find the built application in the `src-tauri/target/release` directory.
