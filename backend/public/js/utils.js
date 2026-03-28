const utils = {
  toast: (message, type = 'success', duration = 3500) => {
    let container = document.querySelector('.toast-container')
    if (!container) {
      container = document.createElement('div')
      container.className = 'toast-container'
      document.body.appendChild(container)
    }
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.textContent = message
    container.appendChild(toast)
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(20px)'
      toast.style.transition = 'all 0.3s ease'
      setTimeout(() => toast.remove(), 300)
    }, duration)
  },

  showLoading: () => {
    if (document.getElementById('mm-loading')) return
    const el = document.createElement('div')
    el.className = 'loading-overlay'
    el.id = 'mm-loading'
    el.innerHTML = '<div class="spinner"></div>'
    document.body.appendChild(el)
  },

  hideLoading: () => {
    const el = document.getElementById('mm-loading')
    if (el) el.remove()
  },

  formatDate: (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  },

  formatTime: (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  },

  formatCurrency: (amount) => {
    if (amount === null || amount === undefined) return '—'
    return `₹${Number(amount).toLocaleString('en-IN')}`
  },

  timeAgo: (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return utils.formatDate(date)
  },

  initials: (name = '') => {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
  },

  foodBadge: (category) => {
    const map = { VEG: 'tag-veg', NONVEG: 'tag-nonveg', EGG: 'tag-egg', VEGAN: 'tag-veg' }
    const label = { VEG: 'Veg', NONVEG: 'Non-veg', EGG: 'Egg', VEGAN: 'Vegan' }
    return `<span class="badge ${map[category] || 'badge-neutral'}">${label[category] || category}</span>`
  },

  statusBadge: (status) => {
    const map = {
      ACTIVE: 'badge-success', PENDING: 'badge-warning',
      CANCELLED: 'badge-danger', EXPIRED: 'badge-neutral',
      PAID: 'badge-success', UNPAID: 'badge-warning',
      DELIVERED: 'badge-success', ASSIGNED: 'badge-info',
      PICKED_UP: 'badge-warning', FAILED: 'badge-danger',
      PRESENT: 'badge-success', ABSENT: 'badge-danger',
      HOLIDAY: 'badge-neutral', PAUSED: 'badge-warning',
    }
    const label = status.replace(/_/g, ' ').charAt(0) + status.replace(/_/g, ' ').slice(1).toLowerCase()
    return `<span class="badge ${map[status] || 'badge-neutral'}">${label}</span>`
  },

  countUp: (el, target, prefix = '', suffix = '', duration = 1200) => {
    const start = Date.now()
    const startVal = 0
    const step = () => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(ease * target)
      el.textContent = prefix + current.toLocaleString('en-IN') + suffix
      if (progress < 1) requestAnimationFrame(step)
      else {
        el.textContent = prefix + target.toLocaleString('en-IN') + suffix
        el.style.animation = 'countPop 0.3s ease'
        setTimeout(() => el.style.animation = '', 300)
      }
    }
    requestAnimationFrame(step)
  },

  addRipple: (btn) => {
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const ripple = document.createElement('span')
      ripple.className = 'btn-ripple-effect'
      ripple.style.cssText = `left:${x}px;top:${y}px;width:16px;height:16px;margin-left:-8px;margin-top:-8px;`
      btn.appendChild(ripple)
      setTimeout(() => ripple.remove(), 700)
    })
  },

  initRipples: () => {
    document.querySelectorAll('.btn-primary, .btn-ripple').forEach(utils.addRipple)
  },

  staggerFadeUp: (selector, baseDelay = 0) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(18px)'
      el.style.transition = `opacity 0.45s ease ${baseDelay + i * 0.08}s, transform 0.45s ease ${baseDelay + i * 0.08}s`
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        })
      })
    })
  },

  setActiveSidebarItem: (href) => {
    document.querySelectorAll('.sidebar-item, .tab-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('href') === href)
    })
  },

  fillUserInfo: () => {
    const user = auth.getUser()
    if (!user) return
    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name)
    document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = user.role.toLowerCase())
    document.querySelectorAll('[data-user-initials]').forEach(el => el.textContent = utils.initials(user.name))
  },

  spawnFoodIcons: (containerId) => {
    const container = document.getElementById(containerId)
    if (!container) return
    const icons = ['🍱', '🍛', '🥘', '🍲', '🫕', '🍚', '🥗', '🫔', '🍜', '🥙', '🧆', '🥚']
    const count = 14
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div')
      el.className = 'food-icon'
      el.textContent = icons[Math.floor(Math.random() * icons.length)]
      el.style.cssText = `
        left: ${Math.random() * 95}%;
        top: ${Math.random() * 90}%;
        font-size: ${1.2 + Math.random() * 1.4}rem;
        animation-name: ${Math.random() > 0.5 ? 'float' : 'floatB'};
        animation-duration: ${4 + Math.random() * 5}s;
        animation-delay: ${Math.random() * 4}s;
        animation-iteration-count: infinite;
        opacity: ${0.1 + Math.random() * 0.15};
      `
      container.appendChild(el)
    }
  },

  skeleton: (count, height = 200) => {
    return Array(count).fill(`<div class="skeleton" style="height:${height}px;"></div>`).join('')
  },

  confirmDialog: (message) => window.confirm(message),

  debounce: (fn, delay = 300) => {
    let timer
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay) }
  },

  registerSW: () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => { })
    }
  },
}
