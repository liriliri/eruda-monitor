const LunaPerformanceMonitor = require('luna-performance-monitor')
const raf = require('licia/raf')
const now = require('licia/now')

module.exports = function(eruda) {
  let { evalCss } = eruda.util

  class Monitor extends eruda.Tool {
    constructor() {
      super()
      this.name = 'monitor'
      this._style = evalCss(require('./style.scss') + require('luna-performance-monitor/luna-performance-monitor.css')) 
    }
    init($el, container) {
      super.init($el, container)
      $el.html('<div class="eruda-fps"></div>')
      
      this._initFps($el.find('.eruda-fps').get(0))
    }
    show() {
      super.show()

      this._fpsMonitor.start()
    }
    hide() {
      super.hide()

      this._fpsMonitor.stop()
    }
    destroy() {
      super.destroy()
      evalCss.remove(this._style)
    }
    _initFps(el) {
      let frames = 0
      let prevTime = 0
      let fps = 0
      let fpsId
      function updateFPS() {
        frames++
        const time = now()
        if (time > prevTime + 1000) {
          fps = Math.round((frames * 1000) / (time - prevTime))
          prevTime = time
          frames = 0
        }
        fpsId = raf(updateFPS)
      }
      updateFPS()
      const fpsMonitor = new LunaPerformanceMonitor(el, {
        title: 'FPS',
        color: '#00864B',
        smooth: false,
        data: () => fps,
      })
      fpsMonitor.on('destroy', () => raf.cancel.call(window, fpsId))
      this._fpsMonitor = fpsMonitor
    }
  }

  return new Monitor()
}
