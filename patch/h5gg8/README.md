# H5GG 8.0 build for the slither.io 2.0.2 IPA

Source: https://github.com/Mods-Center-iOS/H5GG-Revamped (H5GG 8.0, WKWebView instead of UIWebView).
`h5gg8-xentd.patch` is applied on top of it:

1. Load `H5Menu.html` from the .app when present, as H5GG 7 did (8.0 dropped this).
2. Native `freezeValue` rewrites frozen values once per screen frame (CADisplayLink) instead of every 100 ms.

Build (Linux): Theos + kabiroberai swift-toolchain-linux v2.3.0 + iPhoneOS16.5.sdk, `make package FINALPACKAGE=1`.

`../H5Menu.h5gg8.html` is Tabemaru's menu with an adapter that turns its 1 ms `setInterval` write loops
into native freezes, and an async Start (the 8.0 bridge returns Promises).
