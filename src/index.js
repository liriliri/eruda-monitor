const LunaPerformanceMonitor = require('luna-performance-monitor')
const raf = require('licia/raf')
const now = require('licia/now')
const contain = require('licia/contain')

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
      $el.html('<div class="eruda-fps"></div><div class="eruda-memory"></div>')
      
      this._initFps($el.find('.eruda-fps').get(0))
      if (performance.memory) {
        this._initMemory($el.find('.eruda-memory').get(0))
      }

      eruda.get().config.on('change', this._onThemeChange)
    }
    show() {
      super.show()

      this._fpsMonitor.start()
      if (this._memoryMonitor) {
        this._memoryMonitor.start()
      }
    }
    hide() {
      super.hide()

      this._fpsMonitor.stop()
      if (this._memoryMonitor) {
        this._memoryMonitor.stop()
      }
    }
    destroy() {
      eruda.get().config.off('change', this._onThemeChange)
      this._fpsMonitor.destroy()
      if (this._memoryMonitor) {
        this._memoryMonitor.destroy()
      }
      super.destroy()
      evalCss.remove(this._style)
    }
    _getColor() {
      return eruda.util.evalCss.getCurTheme().accent
    }
    _getTheme() {
      return isDarkTheme(eruda.get().config.get('theme')) ? 'dark' : 'light'
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
        color: this._getColor(),
        smooth: false,
        theme: this._getTheme(),
        data: () => fps,
      })
      fpsMonitor.on('destroy', () => raf.cancel.call(window, fpsId))
      this._fpsMonitor = fpsMonitor
    }
    _initMemory(el) {
      const memoryMonitor = new LunaPerformanceMonitor(el, {
        title: 'Used JS heap size',
        unit: 'MB',
        color: this._getColor(),
        smooth: false,
        theme: this._getTheme(),
        data() {
          return (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)
        },
      })
      this._memoryMonitor = memoryMonitor
    }
    _onThemeChange = (name, val) => {
      const fpsMonitor = this._fpsMonitor
      const memoryMonitor = this._memoryMonitor
      if (name === 'theme') {
        const theme = this._getTheme()
        fpsMonitor.setOption({
          color: this._getColor(),
          theme,
        })
        if (memoryMonitor) {
          memoryMonitor.setOption({
            color: this._getColor(),
            theme,
          })
        }
      }
    }
  }

  return new Monitor()
}

const darkThemes = [
  'Dark',
  'Material Oceanic',
  'Material Darker',
  'Material Palenight',
  'Material Deep Ocean',
  'Monokai Pro',
  'Dracula',
  'Arc Dark',
  'Atom One Dark',
  'Solarized Dark',
  'Night Owl',
]

function isDarkTheme(theme) {
  return contain(darkThemes, theme)
}