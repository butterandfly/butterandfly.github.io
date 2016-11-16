(function() {
  suite('Level 05', function() {
    test('已使用"star-bar"元素', function() {
      let el = document.querySelector('star-bar');

      assert.ok(el);
      assert.equal(el.is, 'star-bar');
    });

    test('导入了emoji-rain组件', () => {
      let selector = 'link[href="/bower_components/emoji-rain/emoji-rain.html"]';
      let importEl = document.querySelector(selector);
      assert.ok(importEl);
    });

    test('在"#rain-container"里使用了`<emoji-rain>`', function() {
      let el = document.querySelector('star-bar');
      assert.ok(el.$$('emoji-rain'));
    });

    test('emoji-rain的active是true', () => {
      let el = document.querySelector('star-bar');
      assert.ok(el.$$('emoji-rain').active);
    });
  });
})();
