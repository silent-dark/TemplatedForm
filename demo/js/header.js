(function () {
  var headertpl = {
    div: {
      $: {
        text:"我是header"
      }
    }
  }

  window.headerInit = function (container) {
    var tplForm = new TemplatedForm.Template(container, headertpl);
    tplForm.init("isreset");
  }
})();
