'use strict';

const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

if (window.location.protocol === 'http:' && !localHosts.has(window.location.hostname)) {
  window.location.replace(`https://${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`);
}
