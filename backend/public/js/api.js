const BASE_URL = window.location.origin

const getToken = () => localStorage.getItem('mm_token')

const headers = (isFormData = false) => {
  const h = { Authorization: `Bearer ${getToken()}` }
  if (!isFormData) h['Content-Type'] = 'application/json'
  return h
}

const handle = async (res) => {
  if (res.status === 401) {
    auth.clear()
    window.location.replace('/login.html')
    throw new Error('Session expired. Please login again.')
  }
  const data = await res.json().catch(() => ({ success: false, message: 'Invalid server response' }))
  if (!data.success) throw new Error(data.message || 'Request failed')
  return data.data
}

const safeFetch = async (url, options) => {
  try {
    const res = await fetch(url, options)
    return handle(res)
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Check your internet connection.')
    }
    throw err
  }
}

const api = {
  auth: {
    register: (body) => safeFetch(`${BASE_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    login:    (body) => safeFetch(`${BASE_URL}/api/auth/login`,    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    me:       ()     => safeFetch(`${BASE_URL}/api/auth/me`,       { headers: headers() }),
    update:   (body) => safeFetch(`${BASE_URL}/api/auth/me`,       { method: 'PUT',  headers: headers(), body: JSON.stringify(body) }),
    password: (body) => safeFetch(`${BASE_URL}/api/auth/me/password`, { method: 'PATCH', headers: headers(), body: JSON.stringify(body) }),
  },

  mess: {
    list:    (q = '') => safeFetch(`${BASE_URL}/api/mess?${q}`),
    get:     (id)     => safeFetch(`${BASE_URL}/api/mess/${id}`),
    my:      ()       => safeFetch(`${BASE_URL}/api/mess/my`, { headers: headers() }),
    create:  (body)   => safeFetch(`${BASE_URL}/api/mess`,    { method: 'POST',  headers: headers(), body: JSON.stringify(body) }),
    update:  (body)   => safeFetch(`${BASE_URL}/api/mess/my`, { method: 'PUT',   headers: headers(), body: JSON.stringify(body) }),
    toggle:  ()       => safeFetch(`${BASE_URL}/api/mess/my/toggle`, { method: 'PATCH', headers: headers() }),
  },

  plans: {
    byMess: (messId) => safeFetch(`${BASE_URL}/api/plans/mess/${messId}`),
    my:     ()       => safeFetch(`${BASE_URL}/api/plans/my`, { headers: headers() }),
    create: (body)   => safeFetch(`${BASE_URL}/api/plans`,    { method: 'POST',   headers: headers(), body: JSON.stringify(body) }),
    update: (id, body) => safeFetch(`${BASE_URL}/api/plans/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }),
    toggle: (id)     => safeFetch(`${BASE_URL}/api/plans/${id}/toggle`, { method: 'PATCH', headers: headers() }),
    delete: (id)     => safeFetch(`${BASE_URL}/api/plans/${id}`, { method: 'DELETE', headers: headers() }),
  },

  subscriptions: {
    request: (body)  => safeFetch(`${BASE_URL}/api/subscriptions`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
    me:      ()      => safeFetch(`${BASE_URL}/api/subscriptions/me`, { headers: headers() }),
    history: ()      => safeFetch(`${BASE_URL}/api/subscriptions/me/history`, { headers: headers() }),
    cancel:  (id)    => safeFetch(`${BASE_URL}/api/subscriptions/${id}/cancel`, { method: 'PATCH', headers: headers() }),
    mess:    (q='')  => safeFetch(`${BASE_URL}/api/subscriptions/mess?${q}`, { headers: headers() }),
    approve: (id)    => safeFetch(`${BASE_URL}/api/subscriptions/${id}/approve`, { method: 'PATCH', headers: headers() }),
    payment: (id)    => safeFetch(`${BASE_URL}/api/subscriptions/${id}/payment`, { method: 'PATCH', headers: headers() }),
    reject:  (id)    => safeFetch(`${BASE_URL}/api/subscriptions/${id}/reject`,  { method: 'PATCH', headers: headers() }),
  },

  attendance: {
    mark:    (body)  => safeFetch(`${BASE_URL}/api/attendance/mark`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
    me:      (q='')  => safeFetch(`${BASE_URL}/api/attendance/me?${q}`, { headers: headers() }),
    today:   ()      => safeFetch(`${BASE_URL}/api/attendance/me/today`, { headers: headers() }),
    messToday:   ()  => safeFetch(`${BASE_URL}/api/attendance/mess/today`,   { headers: headers() }),
    messSummary: (q='') => safeFetch(`${BASE_URL}/api/attendance/mess/summary?${q}`, { headers: headers() }),
  },

  menu: {
    byMess:  (messId, q='') => safeFetch(`${BASE_URL}/api/menu/mess/${messId}?${q}`),
    my:      (q='')  => safeFetch(`${BASE_URL}/api/menu/my?${q}`, { headers: headers() }),
    create:  (body)  => safeFetch(`${BASE_URL}/api/menu`,         { method: 'POST',   headers: headers(), body: JSON.stringify(body) }),
    bulk:    (body)  => safeFetch(`${BASE_URL}/api/menu/bulk`,    { method: 'POST',   headers: headers(), body: JSON.stringify(body) }),
    update:  (id, body) => safeFetch(`${BASE_URL}/api/menu/${id}`, { method: 'PUT',  headers: headers(), body: JSON.stringify(body) }),
    toggle:  (id)    => safeFetch(`${BASE_URL}/api/menu/${id}/toggle`, { method: 'PATCH', headers: headers() }),
    delete:  (id)    => safeFetch(`${BASE_URL}/api/menu/${id}`,   { method: 'DELETE', headers: headers() }),
  },

  holidays: {
    byMess:  (messId) => safeFetch(`${BASE_URL}/api/holidays/mess/${messId}`),
    my:      ()       => safeFetch(`${BASE_URL}/api/holidays/my`, { headers: headers() }),
    declare: (body)   => safeFetch(`${BASE_URL}/api/holidays`,    { method: 'POST',   headers: headers(), body: JSON.stringify(body) }),
    delete:  (id)     => safeFetch(`${BASE_URL}/api/holidays/${id}`, { method: 'DELETE', headers: headers() }),
  },

  delivery: {
    generate:    ()       => safeFetch(`${BASE_URL}/api/delivery/generate`,    { method: 'POST',  headers: headers() }),
    today:       ()       => safeFetch(`${BASE_URL}/api/delivery/today`,       { headers: headers() }),
    partners:    ()       => safeFetch(`${BASE_URL}/api/delivery/partners`,    { headers: headers() }),
    assign:      (id, body) => safeFetch(`${BASE_URL}/api/delivery/${id}/assign`, { method: 'PATCH', headers: headers(), body: JSON.stringify(body) }),
    bulkAssign:  (body)   => safeFetch(`${BASE_URL}/api/delivery/bulk-assign`, { method: 'POST',  headers: headers(), body: JSON.stringify(body) }),
    my:          ()       => safeFetch(`${BASE_URL}/api/delivery/my`,          { headers: headers() }),
    pickup:      (id)     => safeFetch(`${BASE_URL}/api/delivery/${id}/pickup`,  { method: 'PATCH', headers: headers() }),
    deliver:     (id)     => safeFetch(`${BASE_URL}/api/delivery/${id}/deliver`, { method: 'PATCH', headers: headers() }),
    fail:        (id, body) => safeFetch(`${BASE_URL}/api/delivery/${id}/fail`, { method: 'PATCH', headers: headers(), body: JSON.stringify(body) }),
  },

  reviews: {
    byMess:  (messId) => safeFetch(`${BASE_URL}/api/reviews/mess/${messId}`),
    my:      ()       => safeFetch(`${BASE_URL}/api/reviews/my`,    { headers: headers() }),
    owner:   ()       => safeFetch(`${BASE_URL}/api/reviews/owner`, { headers: headers() }),
    submit:  (body)   => safeFetch(`${BASE_URL}/api/reviews`,       { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  },

  upload: {
    profile: (formData) => safeFetch(`${BASE_URL}/api/upload/profile`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: formData }),
    mess:    (formData) => safeFetch(`${BASE_URL}/api/upload/mess`,    { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: formData }),
  },
}
