(function() {
  suite('Level 04', function() {
    test('已使用"star-bar"元素', function() {
      let el = document.querySelector('star-bar');

      assert.ok(el);
      assert.equal(el.is, 'star-bar');
    });

    test('声明了"welcomeWords"', function() {
      let el = document.querySelector('star-bar');
      assert.ok(el.properties.welcomeWords);
    });

    test('"welcomeWords"的type为String', function() {
      let el = document.querySelector('star-bar');
      assert.equal(el.properties.welcomeWords.type, String);
    });

    test('"welcomeWords"的value为"Welcome to Star Bar!"', function() {
      let el = document.querySelector('star-bar');
      assert.equal(el.properties.welcomeWords.value, 'Welcome to Star Bar!');
    });
  });
})();
