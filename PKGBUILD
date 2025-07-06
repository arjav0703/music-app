pkgname="musik"
pkgver=0.1.5
pkgrel=1
pkgdesc="A music player"
arch=('x86_64' 'aarch64')
url="https://github.com/arjav0703/music-app"
license=('MIT')
depends=('cairo' 'desktop-file-utils' 'gdk-pixbuf2' 'glib2' 'gtk3' 'hicolor-icon-theme' 'libsoup' 'pango' 'webkit2gtk-4.1')
options=('!strip' '!debug')
install=${pkgname}.install
source_x86_64=("${url}/releases/download/app-v${pkgver}/${pkgname}_${pkgver}_amd64.deb")
sha256sums_x86_64=('6a0d85e45cdfe55e194849a1d340578d1329b80791885d7986534dd5d383e8d6')
package() {
  tar -xvf data.tar.gz -C "${pkgdir}"
}
