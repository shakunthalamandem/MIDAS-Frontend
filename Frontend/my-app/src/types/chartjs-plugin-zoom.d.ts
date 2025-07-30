// src/types/chartjs-plugin-zoom.d.ts
import 'chart.js';

declare module 'chart.js' {
  interface PluginOptionsByType<TType extends import('chart.js').ChartType> {
    zoom?: {
      pan?: {
        enabled: boolean;
        mode: 'x' | 'y' | 'xy';
      };
      zoom?: {
        wheel?: { enabled: boolean };
        pinch?: { enabled: boolean };
        mode: 'x' | 'y' | 'xy';
      };
    };
  }
}


declare module 'chartjs-plugin-zoom' {
  import { Plugin } from 'chart.js';
  const zoomPlugin: Plugin;
  export default zoomPlugin;
}
