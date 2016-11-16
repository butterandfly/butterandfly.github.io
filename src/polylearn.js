(function() {
  let testTemplate = `
  <head>
      <link rel="stylesheet" href="./bower_components/mocha/mocha.css" />
      <style>
        #mocha-stats {
          display: none;
        }

        #mocha {
          margin: 32px;
        }

        .test-title {
          border-top: 1px #3889ec solid;
          padding-top: 24px;
          margin-top: 48px;
          color: #333;
        }

        body {
          padding: 8px;
        }
      </style>
  </head>
  <body>
      {{{preview}}}
      <h2 class="test-title">测试结果</h2>
      <div id="mocha"></div> <!-- 1 -->
      <script src="./bower_components/mocha/mocha.js"></script>
      <script src="./bower_components/chai/chai.js"></script>
      <script>
          mocha.ui('tdd'); // 2
          mocha.reporter('html'); // 3
          window.assert = chai.assert; // 4
      </script>
      <script src="/levels/{{{level}}}/{{{level}}}_test.js"></script>
      <script>
        mocha.run(failures => {
          if (failures === 0) {
            window.parent.postMessage('test-success', '*');
            return;
          }

          window.parent.postMessage('test-failed', '*');
        });
      </script>
  </body>
  `;

  let previewTemplate = `
  <head>
  </head>
  <body>
      {{{preview}}}
  </body>
  `;

  /**
   * 创建预览并运行测试的iFrame。
   * @param {string} previewHtml 预览内容
   * @param {string} level 关卡
   * @return {IFrameElement} iframe
   */
  function createTestIframe(previewHtml, level) {
    let iframe = document.createElement('iframe');
    let html = testTemplate.replace('{{{preview}}}', previewHtml);
    html = html.replace(new RegExp('{{{level}}}', 'g'), level);
    iframe.src = 'blank.html';
    iframe.srcdoc = html;
    return iframe;
  }

  /**
   * 创建预览iFrame。
   * @param {string} previewHtml 预览内容
   * @return {IFrameElement} iframe
   */
  function createPreviewIframe(previewHtml) {
    let iframe = document.createElement('iframe');
    let html = previewTemplate.replace('{{{preview}}}', previewHtml);
    iframe.src = 'blank.html';
    iframe.srcdoc = html;
    return iframe;
  }

  window.Polylearn = {
    createTestIframe: createTestIframe,
    createPreviewIframe: createPreviewIframe
  };
})();
