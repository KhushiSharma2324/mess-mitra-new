const TOKEN_KEY  = 'mm_token'
const USER_KEY   = 'mm_user'
const ROLE_DASHBOARDS = {
  STUDENT:  '/student/dashboard.html',
  OWNER:    '/owner/dashboard.html',
  DELIVERY: '/delivery/dashboard.html',
}

const auth = {
  getToken:    () => localStorage.getItem(TOKEN_KEY),
  getUser:     () => { try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null } },
  getRole:     () => { const u = auth.getUser(); return u ? u.role : null },
  save:        (token, user) => { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)) },
  clear:       () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY) },
  isLoggedIn:  () => !!auth.getToken() && !!auth.getUser(),
  logout:      () => { auth.clear(); window.location.replace('/login.html') },

  requireAuth: (allowedRoles = []) => {
    if (!auth.isLoggedIn()) {
      window.location.replace('/login.html')
      return false
    }
    const role = auth.getRole()
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      window.location.replace(ROLE_DASHBOARDS[role] || '/login.html')
      return false
    }
    return true
  },

  redirectIfLoggedIn: () => {
    if (auth.isLoggedIn()) {
      const role = auth.getRole()
      window.location.replace(ROLE_DASHBOARDS[role] || '/login.html')
    }
  },

  redirectToDashboard: () => {
    const role = auth.getRole()
    window.location.replace(ROLE_DASHBOARDS[role] || '/login.html')
  },

  showDashboardLink: () => {
    if (!auth.isLoggedIn()) return
    const role = auth.getRole()
    const navRight = document.querySelector('.public-nav-links') || document.querySelector('.public-nav > div:last-child')
    if (!navRight) return
    navRight.innerHTML = `
      <span style="font-size:.875rem;color:var(--color-text-secondary);">
        Hi, ${auth.getUser().name.split(' ')[0]}
      </span>
      <a href="${ROLE_DASHBOARDS[role]}" class="btn btn-primary btn-sm">My dashboard →</a>`
  },
}
