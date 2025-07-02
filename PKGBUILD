pkgname="musik"
pkgver=0.1.4
pkgrel=1
pkgdesc="A music player"
arch=('x86_64' 'aarch64')
url="https://github.com/arjav0703/music-app"
license=('MIT')
depends=('cairo' 'desktop-file-utils' 'gdk-pixbuf2' 'glib2' 'gtk3' 'hicolor-icon-theme' 'libsoup' 'pango' 'webkit2gtk-4.1')
options=('!strip' '!debug')
install=${pkgname}.install
source_x86_64=("${url}/releases/download/app-v${pkgver}/${pkgname}_${pkgver}_amd64.deb")
sha256sums_x86_64=('6fcee617c969828680ae54b8d9725ce9b491ec63ab31533686db4473d66b173f')
package() {
  tar -xvf data.tar.gz -C "${pkgdir}"
}
