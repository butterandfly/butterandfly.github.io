(function() {
  suite('Level 01', function() {
    test('已使用"star-bar"元素', function() {
      assert.ok(document.querySelector('star-bar'));
    });

    test('"star-bar"是由polymer创建的自定义元素', function() {
      let el = document.querySelector('star-bar');
      assert.ok(el);
      assert.equal(el.is, 'star-bar');
    });
  });
})();
