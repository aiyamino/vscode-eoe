# A-SOUL鼓励师

在 VS Code 中连续写代码一小时（时间可配置），会有A-SOUL成员提醒你该休息啦~

Fork 自 [超越鼓励师](https://github.com/formulahendry/vscode-ycy)

## 使用

除了每过一小时会自动弹出提醒页面，也可以按 `F1`, 然后输入 `asoul: 打开提醒页面`来打开提醒页面

![usage](images/usage.png)

## 配置

* `asoul.reminderViewIntervalInMinutes`: 展示提醒页面的时间间隔（分钟）。(默认值为**60**)
* `asoul.title`: 提示文字。 (默认值为**亲爱的一个魂儿，代码写久了，该休息啦~**)
* `asoul.type`: url: 自定义网图; random: 来自[这里](https://asoul.cloud/pic)的随机二创; default: 内置图(A-SOUL成员的官方海报)。(默认值为**random**)
* `asoul.customImages`: 配置自定义网图对应的图片数组（需要搭配asoul.type为url）
* `asoul.notification`: 是否打开防社死模式。在防社死模式下，每到设定的时间后，不会直接弹出图片窗口，而是会在右下角显示消息提醒（数秒后消失），手动点击后才会打开页面。(默认值为**false**)
![usage](images/notification.png)

如下例子，使用自定义网图：

```json
"asoul.type": "url",
"asoul.customImages": [
    "http://XXX.jpg"
]
```

## 二创画廊

本插件展示的所有二创作品均来自 <https://asoul.cloud/pic> 的整理（同时，特别鸣谢网站方提供的API）

所有图片的版权均归原作者所有

可通过按 `F1`, 然后输入 `asoul: 打开二创画廊 (默认浏览器)`来打开此网站

## 使用自定义本地图片作为展示图片

* vscode不允许读取外部文件路径，所以只能自己去替换插件内的图片。替换步骤如下：

1、找到vscode插件安装的地方 (如mac 在~/.vscode/extensions/as042971.asoul-{version})

2、替换images/asoul内图片
