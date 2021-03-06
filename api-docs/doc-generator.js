// Generated by CoffeeScript 1.7.1
var DocGenerator, TEMPLATES,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

DocGenerator = (function() {
  function DocGenerator(opts) {
    if (opts == null) {
      opts = {};
    }
    this._apiCallSuccess = __bind(this._apiCallSuccess, this);
    this.title = opts.title;
    this.desc = opts.desc;
    this.params = opts.params;
    this.url = opts.url;
    this.type = opts.type || 'GET';
  }

  DocGenerator.prototype.generate = function(callback) {
    var operation;
    this.callback = callback;
    this.call = "$.ajax({\n  url: '" + this.url + "',\n  type: '" + this.type + "',\n  dataType: 'jsonp',\n  success: function(data) {\n    // code here\n  }\n})";
    return operation = $.ajax({
      url: this.url,
      type: this.type,
      dataType: 'jsonp',
      success: this._apiCallSuccess
    });
  };

  DocGenerator.prototype._apiCallSuccess = function(response) {
    this.response = JSON.stringify(response, void 0, 2);
    this._renderDoc();
    this._syntaxHighlight();
    return this.callback();
  };

  DocGenerator.prototype._renderDoc = function() {
    var html, template;
    template = _.template(TEMPLATES.api_call_doc_template);
    html = template({
      doc: this
    });
    return $('#main').append(html);
  };

  DocGenerator.prototype._syntaxHighlight = function() {
    var node;
    node = _.last($('#main .panel'));
    return $(node).find('pre code').each(function(i, block) {
      return hljs.highlightBlock(block);
    });
  };

  return DocGenerator;

})();

TEMPLATES = {
  api_call_doc_template: "<div class=\"panel panel-info\">\n\n  <div class=\"panel-heading\">\n    <h3 class=\"panel-title\"><strong><%= doc.type %></strong> <%= doc.title %></h3>\n  </div>\n\n  <div class=\"panel-body\">\n    <p><strong>url:</strong> <%= doc.url %></p>\n\n    <p><strong>description:</strong> <%= doc.desc %></p>\n\n    <strong>params:</strong>\n    <ul>\n      <% _.each(doc.params, function(param) { %>\n        <li><%= param %></li>\n      <% }) %>\n    </ul>\n\n    <pre>\n<strong>example:</strong>\n<code>\n<%= doc.call %>\n</code>\n    </pre>\n\n    <hr>\n\n    <div class=\"accordion\" id=\"<%= doc.title %>-accordion\">\n      <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#<%= doc.title %>-accordion\" href=\"#<%= doc.title %>-collapse\">\n        Show Response\n      </a>\n\n      <div id=\"<%= doc.title %>-collapse\" class=\"accordion-body collapse\">\n        <div class=\"accordion-inner\">\n          <pre style=\"margin-top: 10px\">\n<code>\n<%= doc.response %>\n</code>\n          </pre>\n        </div>\n      </div\n\n    </div>\n\n  </div>\n\n</div>"
};
