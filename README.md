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

On other linux distros and windows, you can download the latest release from the [releases page](https://github.com/arjav0703/music-app/releases/latest).

### Building from source

```bash
git clone https://github.com/arjav0703/music-app.git
cd music-app
npm install
npx tauri build
```
You can then find the built application in the `src-tauri/target/release` directory.

--- 
<div align="center">
  <a href="https://shipwrecked.hackclub.com/?t=ghrm" target="_blank">
    <img src="https://hc-cdn.hel1.your-objectstorage.com/s/v3/739361f1d440b17fc9e2f74e49fc185d86cbec14_badge.png" 
         alt="This project is part of Shipwrecked, the world's first hackathon on an island!" 
         style="width: 35%;">
  </a>
</div>
