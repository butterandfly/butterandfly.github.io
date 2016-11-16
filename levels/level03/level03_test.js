(function() {
  suite('Level 03', function() {
    test('已使用"star-bar"元素', function() {
      let el = document.querySelector('star-bar');

      assert.ok(el);
      assert.equal(el.is, 'star-bar');
    });

    test('span里的文字是"Star Bar"', function() {
      let el = document.querySelector('star-bar');
      assert.ok(el);

      let spanEl = el.$$('#header>span');
      assert.ok(spanEl);
      assert.equal(spanEl.textContent, 'Star Bar');
    });

    test('template里的span的内容不是"Star Bar"', () => {
      let templateEl = document.querySelector('#star-bar>template');
      let spanText = templateEl.content.querySelector('span').textContent.trim();
      assert.equal(spanText, '');
    });
  });
})();
