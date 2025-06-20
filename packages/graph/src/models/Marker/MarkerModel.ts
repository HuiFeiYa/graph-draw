import { Shape } from "@hfdraw/types";
import { GraphModel } from "../GraphModel";
import { Marker } from "./Marker";

/**
 * 管理所有标亮效果
 */
export class MarkerModel {

  markerMap = new Map<string, Marker>()
  /**
   * modelId=>marker[]
   */
  modelIdToMarkersMap = new Map<string, Marker[]>()
  /**
   * targetShape id => marker
   */
  targetShapeIdToMarkerMap = new Map<string, Marker>()

  constructor(public graph: GraphModel) {}

  addMarker(marker:Marker) {
	  if (this.markerMap.has(marker.id)) return;
	  this.markerMap.set(marker.id, marker);
    if (marker.targetShape) {
      this.targetShapeIdToMarkerMap.set(marker.targetShape.id, marker);
    }
    const modelId = marker.targetShape?.modelId;
    if (modelId) {
      let shapeMarkers = this.modelIdToMarkersMap.get(modelId);
      if (shapeMarkers) {
        shapeMarkers.push(marker);
      } else {
        shapeMarkers = [marker];
        this.modelIdToMarkersMap.set(modelId, shapeMarkers);
      }
    }
  }

  createMarker(shape:Shape, strokeColor:string, width = 2) {
    const m = new Marker(shape, strokeColor, width);
    this.addMarker(m);
    return m;
  }

  getMarker(id:string) {
	  return this.markerMap.get(id);
  }

  removeMarker(id:string) {
    const marker = this.markerMap.get(id);
    this.markerMap.delete(id);
    if (marker?.targetShape) {
      this.targetShapeIdToMarkerMap.delete(marker.targetShape.id);
    }
    const modelId = marker?.targetShape?.modelId;
    if (modelId) {
      let arr = this.modelIdToMarkersMap.get(modelId);
      if (arr) {
        arr = arr.filter(it => it.id !== id);

      }
    }

  }

  removeMarkerByType(type:string) {
    this.markerMap.forEach(marker => {
      if (marker.type === type) {
        this.removeMarker(marker.id);
      }
    });

  }
  removeMarkerByTargetShape(shapeId:string) {
    this.markerMap.forEach(marker => {
      if (marker.targetShape?.id === shapeId) {
        this.removeMarker(marker.id);
      }
    });
  }

  hasMarker(id: string) {
    return this.markerMap.has(id);
  }

  setTargetShape(marker:Marker, shape:Shape) {
    const oldShape = marker.targetShape;
    if (oldShape === shape) return;

    let modelId = oldShape?.modelId;
    if (modelId) {
      let arr = this.modelIdToMarkersMap.get(modelId);
      if (arr) {
        arr = arr.filter(it => it.id !== marker.id);
      }

    }

    marker.setTargetShape(shape);
    this.targetShapeIdToMarkerMap.set(shape.id, marker);

    const newModelId = shape.modelId;
    if (newModelId) {
      let shapeMarkers = this.modelIdToMarkersMap.get(newModelId);
      if (shapeMarkers) {
        shapeMarkers.push(marker);
      } else {
        shapeMarkers = [marker];
        this.modelIdToMarkersMap.set(newModelId, shapeMarkers);
      }
    }

  }

}