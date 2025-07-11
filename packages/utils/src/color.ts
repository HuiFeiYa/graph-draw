function hexToRgb(hex: string): [number, number, number] {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map((x: string) => x + x).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
        return [0, 0, 0];
    }
    const num = parseInt(hex, 16);
    return [num >> 16, (num >> 8) & 255, num & 255];
  }
  
function rgbStringToArr(rgb: string) {
    const arr = rgb.match(/([0-9.]+)/g);
    return arr ? arr.map(Number) : [0,0,0];
  }
  
  export function getInvertColor(color: string) {
    let r, g, b, a = 1;
    if (!color) return '#fff';
    if (color.startsWith('#')) {
      [r, g, b] = hexToRgb(color);
    } else if (color.startsWith('rgb')) {
      const arr = rgbStringToArr(color);
      [r, g, b] = arr;
      if (arr.length === 4) a = arr[3];
    } else {
      // fallback
      return '#fff';
    }
    // 反色
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;
    if (a !== 1) {
      return `rgba(${r},${g},${b},${a})`;
    }
    return `rgb(${r},${g},${b})`;
  }

  export function getLighterColor(color: string, lightenRatio: number = 0.5, alphaDelta: number = -0.2) {
    let r, g, b, a = 1;
    if (!color) return 'rgba(255,255,255,1)';
    if (color.startsWith('#')) {
      [r, g, b] = hexToRgb(color);
    } else if (color.startsWith('rgb')) {
      const arr = rgbStringToArr(color);
      [r, g, b] = arr;
      if (arr.length === 4) a = arr[3];
    } else {
      // fallback
      return 'rgba(255,255,255,1)';
    }
    // 混合白色
    r = Math.round(r + (255 - r) * lightenRatio);
    g = Math.round(g + (255 - g) * lightenRatio);
    b = Math.round(b + (255 - b) * lightenRatio);
    // 透明度减少
    a = Math.max(0, Math.min(1, a + alphaDelta));
    return `rgba(${r},${g},${b},${a})`;
  }