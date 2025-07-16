<script setup lang="ts">
import { defineProps, computed } from 'vue';
const props = defineProps<{
  config: {
    watermarkText: string;
    showWatermark: boolean;
    fontSize?: number;
    fill?: string;
    rotate?: number;
    gapX?: number;
    gapY?: number;
  }
  width: number;
  height: number;
}>();

const fontSize = computed(() => props.config.fontSize ?? 18);
const fill = computed(() => props.config.fill ?? 'rgba(0,0,0,0.08)');
const rotate = computed(() => props.config.rotate ?? -20);
const gapX = computed(() => props.config.gapX ?? 200);
const gapY = computed(() => props.config.gapY ?? 200);
</script>

<template>
  <g v-if="config.showWatermark">
    <defs>
      <pattern
        id="watermark-pattern"
        :patternUnits="'userSpaceOnUse'"
        :width="gapX"
        :height="gapY"
      >
        <text
          font-weight="bold"
          :x="gapX / 2"
          :y="gapY / 2"
          :text-anchor="'middle'"
          :fill="fill"
          :font-size="fontSize"
          :transform="`rotate(${rotate}, ${gapX / 2}, ${gapY / 2})`"
          dominant-baseline="middle"
        >
          {{ config.watermarkText }}
        </text>
      </pattern>
    </defs>
    <rect
      x="0"
      y="0"
      :width="width"
      :height="height"
      fill="url(#watermark-pattern)"
      pointer-events="none"
    />
  </g>
</template>