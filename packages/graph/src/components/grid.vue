<template>
     <!-- 网格背景色 -->
     <g style="width: 100%; height: 100%; background-color: white">
        <defs>
          <pattern id="flow_canvas_grid_item" width="61" height="61" patternUnits="userSpaceOnUse">
            <path id="flow_canvas_grid_path1" stroke-width="1" fill="none"
              d="M0 15L60 15M15 0L15 60M0 30L60 30M30 0L30 60M0 45L60 45M45 0L45 60" stroke="rgb(242,242,242)"></path>
            <path id="flow_canvas_grid_path2" stroke-width="1" fill="none" d="M0 60L60 60M60 0L60 60"
              stroke="rgb(229,229,229)"></path>
          </pattern>
        </defs>
        <rect width="100%" height="100%" :x="0" :y="0"
          fill="url(#flow_canvas_grid_item)" style="pointer-events:none">
        </rect>
      </g>
</template>