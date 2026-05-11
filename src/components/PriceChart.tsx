import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import type { ChartDataPoint } from '../types';
import { usePreferences } from '../context/PreferencesContext';

interface PriceChartProps {
  data: ChartDataPoint[];
  color?: string;
}

export function PriceChart({ data, color = '#3b82f6' }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const { currency, exchangeRates } = usePreferences();
  const rate = exchangeRates[currency] || 1;

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'var(--chart-text, #94a3b8)',
      },
      grid: {
        vertLines: { color: 'var(--chart-grid, rgba(255, 255, 255, 0.05))' },
        horzLines: { color: 'var(--chart-grid, rgba(255, 255, 255, 0.05))' },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: 'rgba(255, 255, 255, 0.4)',
          style: 3,
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.4)',
          style: 3,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    };

    const chart = createChart(chartContainerRef.current, {
      ...chartOptions,
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });
    chartRef.current = chart;

    const areaSeries = chart.addAreaSeries({
      lineColor: color,
      topColor: color + '80', // Add opacity
      bottomColor: color + '00', // Transparent
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: currency === 'JPY' ? 0 : 2,
        minMove: currency === 'JPY' ? 1 : 0.01,
      },
    });
    seriesRef.current = areaSeries;

    if (data.length > 0) {
      // deduplicate data by time and apply exchange rate
      const uniqueData = Array.from(new Map(data.map(item => [item.time, item])).values());
      uniqueData.sort((a, b) => a.time - b.time);
      const convertedData = uniqueData.map(item => ({
        time: item.time,
        value: item.value * rate
      }));
      areaSeries.setData(convertedData as any);
      chart.timeScale().fitContent();
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [color, currency]);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      const lastPoint = data[data.length - 1];
      seriesRef.current.update({ time: lastPoint.time, value: lastPoint.value * rate } as any);
    }
  }, [data, rate]);

  return <div ref={chartContainerRef} style={{ width: '100%', height: '300px' }} />;
}
