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
* viewBox
* xmlns 命名空间
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


### xmlns 命名空间

> <svg xmlns="http://www.w3.org/2000/svg"></svg>
xmlns全称是“XML Namespaces”，指“XML命名空间”。

不同元素的 XML 类型的渲染规则是不同的：
这些XML类型的渲染规则是有差异的，例如HTML中裸露的<circle>元素是不会表现为圆，而是一个普通的自定义元素。RSS中的XML浏览器会自动进行文章排版渲染等。

所以我们可以看到，指定命名空间可以让浏览器精准解析， 如果不指定 svg 的xmlns(命名空间)，浏览器无法正确解析我们的元素。


## 容器标签

### g 标签
<g> 标签将一个圆形和一个矩形组合在一起，并统一应用了填充颜色、边框颜色和边框宽度。
```HTML
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <g fill="red" stroke="black" stroke-width="2">
        <circle cx="50" cy="50" r="30" />
        <rect x="100" y="50" width="50" height="50" />
    </g>
</svg>
```

主要用途：
* 分组管理：将多个图形元素组合在一起，方便代码分组。
* 统一应用样式和变换：对组内的所有元素统一应用样式（如颜色、边框）或变换（如平移、旋转、缩放）。
* 事件监听：为整个组添加事件监听器，而不是单独为每个元素添加。
### defs 标签
<defs> 是一个定义区域，用于定义可复用的图形元素，这些元素**不会直接显示**，但可以通过引用（如 <use>、fill="url(#id)" 等）在 SVG 中使用。

```html
<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
      <!-- 定义复用图形元素 -->
      <defs>
          <!-- 定义一个图案 -->
          <pattern id="dotPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="2" fill="black" />
          </pattern>

          <!-- 定义一个图形模板 -->
          <symbol id="star" viewBox="0 0 10 10">
              <polygon points="5,0 6.2,3.2 9.3,3.5 6.6,5.6 7.5,8.7 5,6.5 2.5,8.7 3.4,5.6 0.7,3.5 3.8,3.2" fill="orange" />
          </symbol>

          <!-- 定义一个遮罩 -->
          <mask id="mask1">
              <rect x="150" y="200" width="200" height="200" fill="white" />
          </mask>
      </defs>

      <!-- 使用定义的图案填充矩形 -->
      <rect x="10" y="10" width="100" height="100" fill="url(#dotPattern)" />

      <!-- 使用定义的图形模板 -->
      <use href="#star" x="120" y="120" width="50" height="50" />
      <use href="#star" x="200" y="120" width="50" height="50" />

      <!-- 使用遮罩控制图形的显示区域 -->
      <rect x="150" y="200" width="200" height="200" fill="blue" mask="url(#mask1)" />

</svg>
```
1. 复用图形元素
将重复使用的图形（如箭头、图标、路径等）定义在 <defs> 中，通过 <use> 标签在画布中多次引用。
2. 定义资源
存放渐变（<linearGradient>、<radialGradient>）、重复（<pattern>）、滤镜（<filter>）、蒙版（<mask>）、标记（<marker>）等复杂资源，供其他元素使用。
3. 代码组织
将复杂的图形逻辑集中管理，提高代码可读性和维护性。

## path 路径

### 图形属性
* stroke
* stroke-width
* stroke-dasharray
* stroke-dashoffset
* fill

### 绘制曲线

## 图形复用

### 直接复用图形

### 复用图形组

### symbol 包裹复用图形

### 图形遮罩 mask

### 图形裁剪 clipPath

### 渐变

### foreignObject


## 动画

## SVG API 调用

## 功能
### SVG 导出图片

## 常用的第三方库