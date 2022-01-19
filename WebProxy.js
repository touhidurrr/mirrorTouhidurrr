addEventListener('fetch', event => {
  event.respondWith(
    handleRequest(event.request).catch(
      err => new Response(err.stack, { status: 500 })
    )
  );
});

async function handleRequest(req) {
  const { url, host, path } = (() => {
    const { host, pathname } = new URL(req.url);
    let slices = pathname.split('/');
    while (!slices[0] || slices[0] == host) slices.shift();
    const path = slices.join('/');
    return {
      path,
      host: slices.shift(),
      url: 'https://' + path,
    };
  })();

  if (host.length < 3)
    return new Response('Request too Short!', { status: 404 });

  fetch('https://web.archive.org/save/' + url);

  var reqObj = {
    headers: req.headers,
    method: req.method,
    redirect: 'follow',
  };

  if (req.cf) reqObj.cf = req.cf;
  if (req.body) reqObj.body = req.body;

  var data = await fetch(url, reqObj);

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
    function absolute(rel) {
      let st = path.split('/');
      let arr = rel.split('/');
      st.pop();
      for (let i = 0, l = arr.length; i < l; i++) {
        if (!arr[i] || arr[i] == '.') continue;
        if (arr[i] == '..') st.pop();
        else st.push(arr[i]);
      }
      return st.join('/');
    }

    await data
      .text()
      .then(txt => {
        var hostEnd = host.split('.').slice(-2).join('.');
        txt = txt.replace(
          /(?<=(href|src)="?)(?!https?:\\?\/\\?\/)[^: ">]+/g,
          m => {
            let hashPart = '';
            const hashIndex = m.indexOf('#');
            if (hashIndex > -1) {
              m = m.slice(0, hashIndex);
              hashPart = m.slice(hashIndex);
            }
            return `/${host}/${absolute(m)}${hashPart}`;
          }
        );
        txt = txt.replace(/https?:\\?\/\\?\/(\w(\.|-|))+/g, m => {
          if (m.includes(hostEnd)) {
            if (m.includes('\\/')) return '\\/' + m.split(/\\?\//).slice(-1);
            return '/' + m.split('/').slice(-1);
          } else return m;
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
