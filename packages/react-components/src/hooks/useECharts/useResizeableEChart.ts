import { useEffect, useState, SyntheticEvent, useMemo, MutableRefObject } from 'react';
import type { ECharts } from 'echarts';
import {
  CHART_RESIZE_INITIAL_FACTOR,
  CHART_RESIZE_MAX_FACTOR,
  CHART_RESIZE_MIN_FACTOR,
} from '../../components/chart/eChartsConstants';
import { ResizeCallbackData } from 'react-resizable';
import { useMeasure } from 'react-use';
import { ChartLegend, ChartOptions } from '../../components/chart/types';

const getChartWidth = (width: number, staticWidth: number, legendWidth?: string, rightLegend?: boolean) => {
  if (rightLegend && legendWidth) {
    console.count();
    console.log('width', legendWidth);
    const legendWidthInNumber = +(width * +legendWidth.replace('%', ''));
    return width - staticWidth - legendWidthInNumber;
  }
  return width * CHART_RESIZE_INITIAL_FACTOR - staticWidth;
};

const getChartHeight = (height: number, legendHeight?: string, rightLegend?: boolean) => {
  if (rightLegend && legendHeight) {
    const legendHeightInNumber = +(height * +legendHeight.replace('%', ''));
    return height - legendHeightInNumber;
  }
  return height * CHART_RESIZE_INITIAL_FACTOR;
};

/**
 * hook to set up the size of an echarts instance within the base chart component
 * note: the chart sits along side a legend table which means that the
 * echart is actually smaller in width than the overall base chart component
 *
 * @param chartRef React ref to an initialized echarts object
 * @param size size of the chart
 * @returns
 *  - width: width of the component
 *  - height: height of the component
 *  - chartWidth: width of the chart minus the left legend
 *  - onResize: handler to react to resizing the chart size
 *  - minConstraints: min size of the chart within the component
 *  - maxConstraints: max size of the chart within the component
 */
export const useResizeableEChart = (
  chartRef: MutableRefObject<ECharts | null>,
  size: { width: number; height: number },
  onChartOptionsChange: (options: Omit<ChartOptions, 'queries'>) => void,
  legend?: ChartLegend,
  isBottomAligned?: boolean
) => {
  const { width, height } = size;
  const [leftLegendRef, { width: leftLegendWidth }] = useMeasure<HTMLDivElement>();
  const [chartWidth, setChartWidth] = useState(getChartWidth(width, leftLegendWidth, legend?.width));
  const [chartHeight, setChartHeight] = useState(getChartHeight(height, legend?.height));
  const rightLegendWidth = legend?.visible ? width - leftLegendWidth - chartWidth : 0;
  const rightLegendHeight = legend?.visible ? height - chartHeight : 0;

  const onResize = (_event: SyntheticEvent, data: ResizeCallbackData) => {
    _event.stopPropagation();

    if (!legend?.visible) {
      isBottomAligned ? setChartHeight(height) : setChartWidth(width - leftLegendWidth);
    } else {
      isBottomAligned ? setChartHeight(data.size.height) : setChartWidth(data.size.width);
    }
  };

  useEffect(() => {
    console.log('useeffect');
    onChartOptionsChange({
      legend: {
        height: ((rightLegendHeight / height) * 100).toFixed(2).toString() + '%',
        width: ((rightLegendWidth / width) * 100).toFixed(2).toString() + '%',
      },
    });
  }, [rightLegendWidth, rightLegendHeight]);

  useEffect(() => {
    setChartWidth(getChartWidth(width, leftLegendWidth, legend?.width, legend?.visible));
  }, [width, leftLegendWidth, legend?.visible]);

  useEffect(() => {
    setChartHeight(getChartHeight(height, legend?.height, legend?.visible));
  }, [height, legend?.visible]);

  useEffect(() => {
    const chart = chartRef.current;
    chart?.resize({ width: isBottomAligned ? width : chartWidth, height: isBottomAligned ? chartHeight : height });
  }, [chartRef, chartHeight, chartWidth, isBottomAligned, height, width]);

  const minConstraints: [number, number] = useMemo(() => {
    return [width * CHART_RESIZE_MIN_FACTOR, height * CHART_RESIZE_MIN_FACTOR];
  }, [width, height]);

  const maxConstraints: [number, number] = useMemo(() => {
    return [width * CHART_RESIZE_MAX_FACTOR, height * CHART_RESIZE_MAX_FACTOR];
  }, [width, height]);

  return {
    chartWidth: isBottomAligned ? width : chartWidth,
    chartHeight: isBottomAligned ? chartHeight : height,
    leftLegendWidth,
    rightLegendWidth: isBottomAligned ? width : rightLegendWidth,
    rightLegendHeight: isBottomAligned ? rightLegendHeight : height,
    onResize,
    minConstraints,
    maxConstraints,
    leftLegendRef,
  };
};
