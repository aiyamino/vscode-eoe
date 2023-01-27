<div align="center">

<img src="https://raw.githubusercontents.com/AS042971/vscode-eoe/master/screenshot/logoHD.png" alt="EOE鼓励师" width="256"/>

# EOE 鼓励师

在 VS Code 中连续写代码一小时（时间可配置），会有EOE成员提醒你该休息啦~

[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/v/AS042971.eoe)](https://marketplace.visualstudio.com/items?itemName=AS042971.eoe)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/last-updated/AS042971.eoe)](https://marketplace.visualstudio.com/items?itemName=AS042971.eoe)
[![Preview in vscode.dev](https://img.shields.io/badge/preview%20in-vscode.dev-blue)](https://vscode.dev)

[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/d/AS042971.eoe)](https://marketplace.visualstudio.com/items?itemName=AS042971.eoe)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/AS042971.eoe)](https://marketplace.visualstudio.com/items?itemName=AS042971.eoe)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/AS042971.eoe)](https://marketplace.visualstudio.com/items?AS042971.eoe)

</div>

Fork 自 [超越鼓励师](https://github.com/formulahendry/vscode-ycy) 及 [A-Soul鼓励师](https://github.com/AS042971/vscode-asoul/vscode-ycy)

注意：本程序包已完美适配 https://vscode.dev/, 欢迎直接在线体验。

## 使用

除了每过一小时会自动弹出提醒页面，也可以按 `F1`, 然后输入 `eoe: 打开提醒页面`来打开提醒页面

## 配置

* `eoe.reminderViewIntervalInMinutes`: 展示提醒页面的时间间隔（分钟）。(默认值为**60**)
* `eoe.title`: 提示文字。 (默认值为**亲爱的EOES，代码写久了，该休息啦~**)
* `eoe.titleWanEr`, `eoe.titleLuZao`, `eoe.titleMiNuo`, `eoe.titleYuMo`, `eoe.titleYouEn`: 五位成员的专属提示文字。在图片的Tag唯一包含这位成员时，会优先显示这里设定的成员专属提示。
* `eoe.type`: 见下表所示

| 选项 | 名称 | 描述 |
| -- | -- | -- |
| url | 自定义图片 | 参见`eoe.customImages`的配置 |
| random | 二创 | 来自[这里](https://eoefanart.com/pic)的随机二创 |
| default | 官方图 | EOE成员的官方海报 |
| kuoyu | 蛞蝓鼓励师 | 扭！ |
| mix | 混合模式 | 90%概率弹出二创，10%概率弹出蛞蝓|

* `eoe.customImages`: 配置自定义网图对应的图片数组（需要搭配eoe.type为url，可使用[imgurl](https://imgurl.org/)等图床上传自定义图片）
* `eoe.notification`: 是否打开防社死模式。在防社死模式下，每到设定的时间后，不会直接弹出图片窗口，而是会在右下角显示消息提醒（数秒后消失），手动点击后才会打开页面。(默认值为**true**)

## 二创画廊

本插件展示的所有二创作品均来自 [EOE Fans](https://www.eoefans.com/) 的整理（同时，特别鸣谢网站方提供的API）。
所有图片的版权均归原作者所有。
可通过按 `F1`, 然后输入 `eoe: 打开二创画廊 (默认浏览器)`来打开此网站
