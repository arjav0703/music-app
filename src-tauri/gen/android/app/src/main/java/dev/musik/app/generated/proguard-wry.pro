# THIS FILE IS AUTO-GENERATED. DO NOT MODIFY!!

# Copyright 2020-2023 Tauri Programme within The Commons Conservancy
# SPDX-License-Identifier: Apache-2.0
# SPDX-License-Identifier: MIT

-keep class dev.musik.app.* {
  native <methods>;
}

-keep class dev.musik.app.WryActivity {
  public <init>(...);

  void setWebView(dev.musik.app.RustWebView);
  java.lang.Class getAppClass(...);
  java.lang.String getVersion();
}

-keep class dev.musik.app.Ipc {
  public <init>(...);

  @android.webkit.JavascriptInterface public <methods>;
}

-keep class dev.musik.app.RustWebView {
  public <init>(...);

  void loadUrlMainThread(...);
  void loadHTMLMainThread(...);
  void evalScript(...);
}

-keep class dev.musik.app.RustWebChromeClient,dev.musik.app.RustWebViewClient {
  public <init>(...);
}
