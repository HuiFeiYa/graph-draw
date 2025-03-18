## 基本使用


### SVG 元素的渲染顺序
在 SVG 中，元素的渲染顺序非常重要，因为 SVG 遵循“后来居上”（Later On Top，LOT）的原则。这意味着在代码中后出现的元素会覆盖先前出现的元素。如果你有多个重叠的元素，后面的元素会显示在前面元素的上层

### 坐标定位

SVG 中的坐标系统使用一个二维平面，其中每个元素的位置可以通过 x 和 y 属性来指定。这些属性定义了元素的左上角点在 SVG 画布上的起始位置。
例如，下面的 SVG 代码定义了一个矩形：

```HTML
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="100" height="100" />
</svg>
```
![](./svg-1.png)
### SVG 样式
* 在未给 SVG 设置宽高样式时，SVG 默认宽高为 300x150
```HTML
<svg xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="100" height="100" fill="blue" />
</svg>
```
* 在SVG中，许多属性不仅可以直接在SVG元素上设置，还可以通过CSS来控制。例如: fill、stroke、stroke-width、width、height等等。
* 样式优先级问题。 style 中样式 > css 样式 > 属性样式



## SVG 根标签
常见属性如下：
* xmlns 命名空间
* viewBox
### viewBox
语法：viewBox="x y width height"

x, y：视口的左上角起点（通常为 0 0）。

width, height：视口的宽高（逻辑单位，非像素）。

#### 设置 viewBox
例如 iconFont 使用 SVG 时，实际代码如下：
```HTML
   <svg t="1742259158685" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2603" width="200" height="200">
    <path d="M198.920606 353.438906l294.89452 398.030819-141.866143 105.106304-294.89452-398.030819 141.866143-105.106304Z" fill="#7DAFDA" p-id="2604"></path>
    <path d="M292.668567 679.383279l612.100893-449.37515 104.488343 142.3252-612.100893 449.37515-104.488343-142.3252Z" fill="#7DAFDA" p-id="2605"></path>
</svg>
```

* viewBox="0 0 1024 1024"：定义了 SVG 的内部坐标系范围，表示 SVG 内容的逻辑尺寸是 1024x1024。这个坐标系是虚拟的，与实际的物理尺寸无关。
* width="200" height="200"：定义了 SVG 容器的实际物理尺寸，表示 SVG 在页面上显示的宽高是 200x200 像素。绘制的逻辑坐标会最终会按比例缩放到物理尺寸上。

上面的 SVG 中的 path 坐标是基于 viewBox 定义的逻辑坐标系（这里是 1024x1024），而最终的显示尺寸是通过 width 和 height（这里是 200x200）将逻辑坐标系的内容按比例`缩放`到物理尺寸上。

#### 不设置 viewBox
如果没有设置 viewBox，SVG 的绘制区域（即用户坐标系）会直接映射到 svg 元素的 width 和 height，SVG 的坐标系是 1 单位 = 1 像素。  
与设置 viewBox 的对比：如果设置了 viewBox，SVG 的绘制区域会根据 viewBox 的定义进行缩放和适配。