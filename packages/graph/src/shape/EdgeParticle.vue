<script setup lang="ts">
// 导入Vue组合式API和类型定义
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { IPoint } from '@hfdraw/types';

// 定义组件props
const props = defineProps<{
  waypoint: IPoint[];       // 路径点数组，定义粒子移动路径
  duration?: number;        // 可选，粒子完成整个路径的耗时(ms)
  interval?: number;        // 可选，粒子发射间隔时间(ms)
}>();

// 设置默认值：粒子完成路径耗时1秒，发射间隔1秒
const duration = props.duration ?? 1000;
const interval = props.interval ?? 1000;

// 粒子数据存储，每个粒子包含：
// - t: 当前已进行的时间(ms)
// - key: 唯一标识符
const particles = ref<{ t: number, key: number }[]>([]);
let timer: any = null;       // 粒子发射定时器
let animFrame: any = null;   // 动画帧ID
let particleKey = 0;        // 粒子唯一key生成器

// 发射新粒子
function emitParticle() {
  particles.value.push({ 
    t: 0,                   // 初始时间为0
    key: particleKey++       // 分配唯一key并自增
  });
}

// 粒子动画更新函数
function animateParticles() {
  const dt = 16;            // 每帧时间增量(ms)，约60fps
  
  // 更新所有粒子的已进行时间
  particles.value.forEach(p => p.t += dt);
  
  // 过滤掉已完成动画的粒子(t >= duration)
  particles.value = particles.value.filter(p => p.t < duration);
  
  // 请求下一帧动画
  animFrame = requestAnimationFrame(animateParticles);
}

// 组件挂载时启动动画
onMounted(() => {
  emitParticle();                      // 立即发射第一个粒子
  timer = setInterval(emitParticle, interval); // 设置粒子发射定时器
  animFrame = requestAnimationFrame(animateParticles); // 启动动画循环
});

// 组件卸载时清理资源
onUnmounted(() => {
  clearInterval(timer);                // 清除发射定时器
  cancelAnimationFrame(animFrame);     // 停止动画循环
});

// 计算路径总长度（各线段长度之和）
function getTotalLength(points: IPoint[]) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i-1].x;
    const dy = points[i].y - points[i-1].y;
    len += Math.sqrt(dx*dx + dy*dy);  // 累加两点间距离
  }
  return len;
}

// 获取路径上指定距离处的坐标点
function getPointAtLength(points: IPoint[], dist: number): IPoint {
  let len = 0;  // 已遍历的长度
  
  // 遍历每条路径线段
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i-1], p1 = points[i];
    const segLen = Math.sqrt((p1.x-p0.x)**2 + (p1.y-p0.y)**2); // 当前线段长度
    
    // 如果目标距离在当前线段上
    if (len + segLen >= dist) {
      const ratio = (dist - len) / segLen; // 计算在线段上的比例
      return {
        // 根据比例计算插值点
        x: p0.x + (p1.x - p0.x) * ratio,
        y: p0.y + (p1.y - p0.y) * ratio
      };
    }
    len += segLen;  // 累加已遍历长度
  }
  
  // 超出路径长度则返回最后一个点
  return points[points.length-1];
}

// 计算粒子当前位置
function getParticlePos(t: number) {
  const totalLen = getTotalLength(props.waypoint);  // 获取路径总长
  const dist = (t / duration) * totalLen;           // 计算当前应移动的距离
  return getPointAtLength(props.waypoint, dist);    // 获取对应坐标
}
</script>

<template>
  <g>
    <!-- 渲染所有粒子 -->
    <circle
      v-for="p in particles"
      :key="p.key"
      v-if="waypoint.length > 1"  
      :cx="getParticlePos(p.t).x" 
      :cy="getParticlePos(p.t).y"
      r="4"                      
      fill="red"                  
      opacity="0.7"               
    />
  </g>
</template>