addEventListener('fetch', event => {
  event.respondWith(
    handleRequest(event.request).catch(
      err => new Response(err.stack, { status: 500 })
    )
  );
});

async function handleRequest(req) {
  const url = (() => {
    const { host, pathname } = new URL(req.url);
    let slices = pathname.split('/');
    while (!slices[0] || slices[0] == host) slices.shift();
    return new URL('https://' + slices.join('/'));
  })();

  return new Response(JSON.stringify({url: url.href, host: url.host, path: url.pathname}, null, 2));

  if (url.host.length < 3)
    return new Response('Request too Short!', { status: 404 });

  const host = url.host;
  fetch('https://web.archive.org/save/' + url.href);

  var reqObj = {
    headers: req.headers,
    method: req.method,
    redirect: 'follow',
  };

  if (req.cf) reqObj.cf = req.cf;
  if (req.body) reqObj.body = req.body;

  var data = await fetch(url.href, reqObj);

  try {
    var ct = await data.headers.get('content-type');
    var b = ct.includes('html') || ct.includes('javascript');
    b &&= !(
      ct.includes('stylesheet') ||
      ct.includes('css') ||
      ct.includes('image')
    );
  } catch (e) {
    console.log(e);
  }

  if (b) {
    var pathSplit = url.pathname.split('/');

    function absolute(rel) {
      var st = pathSplit;
      var arr = rel.split('/');
      st.pop();
      for (var i = 0, l = arr.length; i < l; i++) {
        if (arr[i] == '.') continue;
        if (arr[i] == '..') st.pop();
        else st.push(arr[i]);
      }
      return st.filter(e => e).join('/');
    }

    await data
      .text()
      .then(txt => {
        var hostEnd = host.split('.').slice(-2).join('.');
        txt = txt.replace(/https?:\\?\/\\?\/(\w(\.|-|))+/g, m => {
          if (m.includes(hostEnd)) {
            if (m.includes('\\/'))
              '\\/' + m.split('/').slice(-1)[0];
            return '/' + m.split('/').slice(-1)[0];
          } else return m;
        });
        txt = txt.replace(/(href|src)="[^#][^":]*"/g, m => {
          const i = m.indexOf('"') + 1;
          if (m[i] == '/') return `${m.slice(0,i)}/${host}/${m.slice(i)}`;
          return `${m.slice(0,i)}/${host}/${absolute(m.slice(i))}`;
        });
        data = new Response(txt, {
          status: data.status,
          headers: data.headers,
        });
        data.headers.delete('cros');
      })
      .catch(e => console.log(e));
  }

  return data;
}
