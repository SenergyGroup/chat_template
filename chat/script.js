// Please use event listeners to run functions.
document.addEventListener('DOMContentLoaded', () => {
  const log = document.getElementById('log');

  if (!log) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        node.classList.add('flash');
        setTimeout(() => node.classList.remove('flash'), 500);
      });
    });
  });

  observer.observe(log, { childList: true });
});

document.addEventListener('onLoad', function (obj) {
  // obj will be empty for chat widget
  // this will fire only once when the widget loads
});

document.addEventListener('onEventReceived', function (obj) {
  // obj will contain information about the event
});
