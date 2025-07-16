<template>
  <div style="display: flex; flex-direction: column; height: 100%">
    <div style="display: flex; flex: 1">
      <Siderbar />
      <GraphView v-bind="uiStore.graphData" :style="{
        width: graphContainerWidth + 'px',
        height: graphContainerHeight + 'px',
      }"></GraphView>
    </div>
    <Footer 
      :scale="uiStore.graphData.graph.graphOption.scale" 
      @zoom-in="handleZoomIn" 
      @zoom-out="handleZoomOut" 
      @scale-change="handleScaleChange"
    />
    <!-- 模板卡片底部弹出 -->
    <transition name="slide-up">
      <div v-if="showTemplateBar" class="template-bar">
        <div class="template-bar-header">
          <span>选择模板应用到当前项目</span>
          <span class="close-btn" @click="closeTemplateBar">×</span>
        </div>
        <div class="template-bar-list">
          <div v-for="tpl in templateList" :key="tpl.id" class="template-bar-card" @click="handleApplyTemplate(tpl.id)">
            <h3>{{ tpl.name }}</h3>
            <p v-if="tpl.description">{{ tpl.description }}</p>
            <p class="template-date">创建时间：{{ formatDate(tpl.createdAt) }}</p>
          </div>
        </div>
      </div>
    </transition>
    <div class="floating-template-btn" @click="openTemplateBar">
      <img src="/statics/popover/apply-template.svg" class="template-icon" />
      <span class="template-label">模板</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { GraphView, GraphModel } from "@hfdraw/graph";
import { Change, Shape, StyleObject, SubShapeType } from "@hfdraw/types";
import Siderbar from "../editor/components/SiderBar.vue";
import Footer from "../components/Footer.vue";
import { BusEvent } from "../constants/config";
import { useEvents } from "../util/useEvents";
import { shapeService } from "../util/ShapeService";
import { GraphOption } from "../editor/graphOption";
import { HeaderDropdownEnum, StrokeColor } from "../types/enum";
import { useProjectStore } from '../stores/project';
import { useRoute } from 'vue-router';
import { socketService } from "../socket/SocketService";
import { modelService } from '../util/ModelService';
import { formatDate } from "../util/common";
import { useUiStore } from '../stores/ui';
import { ALL_HEADER, SIDEBAR } from "../constants/ui";

const uiStore = useUiStore();
const projectStore = useProjectStore();
const route = useRoute();
const projectId = String(route.query.projectId || '');
const graphContainerWidth = ref(window.innerWidth - SIDEBAR);
const graphContainerHeight = ref(window.innerHeight - ALL_HEADER);
if (route.query.projectName) {
  projectStore.setCurrentProjectName(route.query.projectName as string)
}
console.log('projectId: ', projectId)
const graphOption = new GraphOption(projectId);
const graph = new GraphModel(graphOption);
uiStore.setGraphData(graph);


// 定义具名函数
const handleResize = () => {
  graphContainerWidth.value = window.innerWidth - SIDEBAR;
  graphContainerHeight.value = window.innerHeight - ALL_HEADER;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

// 移除监听器
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

const events = {
  [BusEvent.MOUSE_DOWN_OUT]: (event: MouseEvent) => {
    uiStore.graphData.graph.mouseDownOut(event)
  },
  [BusEvent.INSERT_SHAPE]: (change: Change) => {
    if (change.newValue) {
      const shape = change.newValue as Shape;
      uiStore.graphData.graph.symbols.push(shape)
      uiStore.graphData.graph.addShape(shape)
    }
  },
  [BusEvent.DELETE_SHAPE]: (change: Change) => {
    uiStore.graphData.graph.symbols = uiStore.graphData.graph.symbols.filter(s => s.id_ !== change.objectId)
  },
  [BusEvent.UPDATE_SHAPE]: async (change: Change) => {
    const newValue = change.newValue 
    const i = uiStore.graphData.graph.symbols.findIndex(s => s.id_ === change.objectId);
    if (i !== -1) {
      const shape = Object.assign(uiStore.graphData.graph.symbols[i],{...newValue})
      uiStore.graphData.graph.updateShape(shape)
    }
  },
  [BusEvent.CLEAR_STATUS]: async (change: Change) => {
    uiStore.graphData.graph.clear();
  },
  [BusEvent.REFRESH]: async ()=> {
    await fretchData()
  },
  [BusEvent.DROPDOWN_ITEM_CLICK]: async (item: {value: HeaderDropdownEnum}) => {
    const edgeShape = uiStore.graphData.graph.selectionModel.selectedShapes.find(s => s.subShapeType === SubShapeType.CommonEdge);
    if (!edgeShape) return 
    const newStyleObj: StyleObject = {

    }
    const originArrowStyle = edgeShape.style.arrowStyle || {}
    switch(item.value) {
      case HeaderDropdownEnum.leftLine: {
        newStyleObj.arrowStyle = {
          ...originArrowStyle,
          hasStart : false,
          fillStart: 'none'
        }
        break;
      }
      case HeaderDropdownEnum.leftSolidArrow: {
        newStyleObj.arrowStyle = {
          ...originArrowStyle,
          hasStart : true,
          fillStart: StrokeColor
        }
        break;
      }
      case HeaderDropdownEnum.lefthollowArrow: {
        newStyleObj.arrowStyle = {
          ...originArrowStyle,
          hasStart : true,
          fillStart: 'none'
        }
        break;
      }
      case HeaderDropdownEnum.rightLine: {
        newStyleObj.arrowStyle = {
          ...originArrowStyle,
          hasEnd : false,
          fillEnd: 'none'
        }
        break;
      }
      case HeaderDropdownEnum.rightSolidArrow: {
        newStyleObj.arrowStyle = {
          ...originArrowStyle,
          hasEnd : true,
          fillEnd: StrokeColor
        }
        break;
      }
      case HeaderDropdownEnum.righthollowArrow: {
        newStyleObj.arrowStyle = {
          ...originArrowStyle,
          hasEnd : true,
          fillEnd: 'none'
        }
        break;
      }
    }
    await shapeService.updateShapeStyle({styleObject: newStyleObj, projectId: 'p1', shapeId: edgeShape.id});
  }
};
async function fretchData() {
  await shapeService.getAllShapes(projectStore.projectId).then(data => {
    if (data) {
      uiStore.graphData.graph.symbols = data;
      data.forEach(shape => {
        uiStore.graphData.graph.addShape(shape)
      })
    }
  })
}
// 缩放控制函数
function handleZoomIn() {
  uiStore.graphData.graph.graphOption.zoomIn();
}

function handleZoomOut() {
  uiStore.graphData.graph.graphOption.zoomOut();
}

function handleScaleChange(scale: number) {
  uiStore.graphData.graph.graphOption.setScale(scale);
}

// 监听事件
useEvents(events)

const showTemplateBar = ref(false)
const templateList = ref<any[]>([])
function openTemplateBar() {
  showTemplateBar.value = true
  fetchTemplates()
}
function closeTemplateBar() {
  showTemplateBar.value = false
}
async function fetchTemplates() {
  templateList.value = (await modelService.getTemplateList())?.data || []
}
async function handleApplyTemplate(templateId: number) {
  await modelService.applyTemplate({ projectId, templateId })
  closeTemplateBar()
  await fretchData()
}

onMounted(()=> {
  console.log('projectId----: ', projectId,route.query);
  if (projectId) {
    projectStore.setCurrentProjectId(projectId);
    socketService.sendJSON({ type: 'subscribeProject', projectId });
  }
  fretchData()
})
</script>
<style scoped>
.template-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.12);
  padding: 16px 32px 24px 32px;
  z-index: 1000;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
.template-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}
.close-btn {
  font-size: 22px;
  cursor: pointer;
  color: #888;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #2196F3;
}
.template-bar-list {
  display: flex;
  gap: 16px;
}
.template-bar-card {
  background: #f7f8fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 16px 24px;
  min-width: 220px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.template-bar-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 24px rgba(33,150,243,0.18);
}
.open-template-bar-btn {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 1001;
  background: #2196F3;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 12px 28px;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(33,150,243,0.12);
  cursor: pointer;
  transition: background 0.2s;
}
.open-template-bar-btn:hover {
  background: #1769aa;
}
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s cubic-bezier(.25,.8,.25,1);
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.floating-template-btn {
  position: fixed;
  top: 40%;
  right: 32px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 12px 10px 8px 10px;
  cursor: pointer;
  transition: box-shadow 0.2s, background 0.2s;
  border: 1px solid #f0f0f0;
}
.floating-template-btn:hover {
  background: #f5f8ff;
  box-shadow: 0 4px 16px rgba(64,158,255,0.12);
}
.template-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
  display: block;
}
.template-label {
  font-size: 14px;
  color: #409EFF;
  font-weight: 500;
  letter-spacing: 1px;
  user-select: none;
}
</style>
