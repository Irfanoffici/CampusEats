// Performance monitoring utility to help identify interface glitches
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private measurements: Map<string, number[]> = new Map()
  
  private constructor() {}
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  // Start timing a performance measurement
  start(name: string): string {
    const id = `${name}_${Date.now()}_${Math.random()}`
    performance.mark(`${id}_start`)
    return id
  }
  
  // End timing and record the measurement
  end(id: string): number {
    const name = id.split('_')[0]
    performance.mark(`${id}_end`)
    const measure = performance.measure(id, `${id}_start`, `${id}_end`)
    const duration = measure.duration
    
    // Store measurement
    if (!this.measurements.has(name)) {
      this.measurements.set(name, [])
    }
    this.measurements.get(name)!.push(duration)
    
    // Log if measurement is unusually slow
    if (duration > 100) {
      console.warn(`[Performance] Slow operation detected: ${name} took ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }
  
  // Get average duration for a measurement type
  getAverage(name: string): number {
    const measurements = this.measurements.get(name)
    if (!measurements || measurements.length === 0) return 0
    return measurements.reduce((a, b) => a + b, 0) / measurements.length
  }
  
  // Log performance summary
  logSummary(): void {
    console.log('[Performance] Summary:')
    this.measurements.forEach((measurements, name) => {
      const avg = this.getAverage(name)
      const min = Math.min(...measurements)
      const max = Math.max(...measurements)
      console.log(`  ${name}: avg=${avg.toFixed(2)}ms, min=${min.toFixed(2)}ms, max=${max.toFixed(2)}ms`)
    })
  }
}

// Hook for React components
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance()
  
  const startMeasurement = (name: string) => {
    return monitor.start(name)
  }
  
  const endMeasurement = (id: string) => {
    return monitor.end(id)
  }
  
  return { startMeasurement, endMeasurement, monitor }
}