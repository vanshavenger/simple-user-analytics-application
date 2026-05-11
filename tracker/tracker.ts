(function () {
  const API_URL = 'http://localhost:5000/api/events/track';

  function getSessionId(): string {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 14) + '_' + Date.now();
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  function sendEvent(eventData: Record<string, unknown>): void {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    }).catch(err => console.error('Analytics tracking error:', err));
  }

  function getPageUrl(): string {
    return window.location.href.split(/[?#]/)[0];
  }

  function commonFields(): Record<string, unknown> {
    return {
      session_id: getSessionId(),
      page_url: getPageUrl(),
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      referrer: document.referrer || null
    };
  }

  function trackPageView(): void {
    sendEvent({
      ...commonFields(),
      event_type: 'page_view'
    });
  }

  function trackClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    sendEvent({
      ...commonFields(),
      event_type: 'click',
      click_x: e.clientX,
      click_y: e.clientY,
      element_tag: target.tagName.toLowerCase(),
      element_text: (target.textContent || '').trim().substring(0, 100) || null
    });
  }

  document.addEventListener('DOMContentLoaded', trackPageView);
  document.addEventListener('click', trackClick);
})();
