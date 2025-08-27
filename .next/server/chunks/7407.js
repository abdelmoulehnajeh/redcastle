"use strict";exports.id=7407,exports.ids=[7407],exports.modules={23870:(e,o,n)=>{n.d(o,{A:()=>d});var t=n(55511);let l={randomUUID:t.randomUUID},a=new Uint8Array(256),r=a.length,i=[];for(let e=0;e<256;++e)i.push((e+256).toString(16).slice(1));let d=function(e,o,n){if(l.randomUUID&&!o&&!e)return l.randomUUID();let d=(e=e||{}).random??e.rng?.()??(r>a.length-16&&((0,t.randomFillSync)(a),r=0),a.slice(r,r+=16));if(d.length<16)throw Error("Random bytes length must be >= 16");if(d[6]=15&d[6]|64,d[8]=63&d[8]|128,o){if((n=n||0)<0||n+16>o.length)throw RangeError(`UUID byte range ${n}:${n+15} is out of buffer bounds`);for(let e=0;e<16;++e)o[n+e]=d[e];return o}return function(e,o=0){return(i[e[o+0]]+i[e[o+1]]+i[e[o+2]]+i[e[o+3]]+"-"+i[e[o+4]]+i[e[o+5]]+"-"+i[e[o+6]]+i[e[o+7]]+"-"+i[e[o+8]]+i[e[o+9]]+"-"+i[e[o+10]]+i[e[o+11]]+i[e[o+12]]+i[e[o+13]]+i[e[o+14]]+i[e[o+15]]).toLowerCase()}(d)}},27130:(e,o,n)=>{n.d(o,{T:()=>t});let t="5.0.0"},37407:(e,o,n)=>{function t(e){return JSON.stringify(e).replace("<","\\u003c").replace(">","\\u003e").replace("&","\\u0026").replace("'","\\u0027")}n.d(o,{ApolloServerPluginLandingPageLocalDefault:()=>p,ApolloServerPluginLandingPageProductionDefault:()=>s});let l=(e,o,n,l)=>{let a={displayOptions:{},persistExplorerState:!1,runTelemetry:!0,..."boolean"==typeof o.embed?{}:o.embed},r={graphRef:o.graphRef,target:"#embeddableExplorer",initialState:{..."document"in o||"headers"in o||"variables"in o?{document:o.document,headers:o.headers,variables:o.variables}:{},..."collectionId"in o?{collectionId:o.collectionId,operationId:o.operationId}:{},displayOptions:{...a.displayOptions}},persistExplorerState:a.persistExplorerState,includeCookies:o.includeCookies,runtime:n,runTelemetry:a.runTelemetry,allowDynamicStyles:!1};return`
<div class="fallback">
  <h1>Welcome to Apollo Server</h1>
  <p>Apollo Explorer cannot be loaded; it appears that you might be offline.</p>
</div>
<style nonce=${l}>
  iframe {
    background-color: white;
    height: 100%;
    width: 100%;
    border: none;
  }
  #embeddableExplorer {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
  }
</style>
<div id="embeddableExplorer"></div>
<script nonce="${l}" src="https://embeddable-explorer.cdn.apollographql.com/${encodeURIComponent(e)}/embeddable-explorer.umd.production.min.js?runtime=${encodeURIComponent(n)}"></script>
<script nonce="${l}">
  var endpointUrl = window.location.href;
  var embeddedExplorerConfig = ${t(r)};
  new window.EmbeddedExplorer({
    ...embeddedExplorerConfig,
    endpointUrl,
  });
</script>
`},a=(e,o,n,l)=>{let a={runTelemetry:!0,endpointIsEditable:!1,initialState:{},..."boolean"==typeof o.embed?{}:o.embed??{}},r={target:"#embeddableSandbox",initialState:{..."document"in o||"headers"in o||"variables"in o?{document:o.document,variables:o.variables,headers:o.headers}:{},..."collectionId"in o?{collectionId:o.collectionId,operationId:o.operationId}:{},includeCookies:o.includeCookies,...a.initialState},hideCookieToggle:!1,endpointIsEditable:a.endpointIsEditable,runtime:n,runTelemetry:a.runTelemetry,allowDynamicStyles:!1};return`
<div class="fallback">
  <h1>Welcome to Apollo Server</h1>
  <p>Apollo Sandbox cannot be loaded; it appears that you might be offline.</p>
</div>
<style nonce=${l}>
  iframe {
    background-color: white;
    height: 100%;
    width: 100%;
    border: none;
  }
  #embeddableSandbox {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
  }
</style>
<div id="embeddableSandbox"></div>
<script nonce="${l}" src="https://embeddable-sandbox.cdn.apollographql.com/${encodeURIComponent(e)}/embeddable-sandbox.umd.production.min.js?runtime=${encodeURIComponent(n)}"></script>
<script nonce="${l}">
  var initialEndpoint = window.location.href;
  var embeddedSandboxConfig = ${t(r)};
  new window.EmbeddedSandbox(
    {
      ...embeddedSandboxConfig,
      initialEndpoint,
    }
  );
</script>
`};var r=n(27130),i=n(92742),d=n(23870);function p(e={}){let{version:o,__internal_apolloStudioEnv__:n,...t}={embed:!0,...e};return m(o,{isProd:!1,apolloStudioEnv:n,...t})}function s(e={}){let{version:o,__internal_apolloStudioEnv__:n,...t}=e;return m(o,{isProd:!0,apolloStudioEnv:n,...t})}let c=(e,o,n,t)=>{let l=JSON.stringify(encodeURIComponent(JSON.stringify(o)));return`
 <div class="fallback">
  <h1>Welcome to Apollo Server</h1>
  <p>The full landing page cannot be loaded; it appears that you might be offline.</p>
</div>
<script nonce="${t}">window.landingPage = ${l};</script>
<script nonce="${t}" src="https://apollo-server-landing-page.cdn.apollographql.com/${encodeURIComponent(e)}/static/js/main.js?runtime=${n}"></script>`};function m(e,o){let n=e??"v3",t=e??"v2",p=e??"_latest",s=`@apollo/server@${r.T}`;return{__internal_installed_implicitly__:!1,serverWillStart:async()=>({async renderLandingPage(){let e=encodeURIComponent(p);return{html:async function(){let r=(0,i.createHash)("sha256").update((0,d.A)()).digest("hex"),m=`script-src 'self' 'nonce-${r}' https://apollo-server-landing-page.cdn.apollographql.com https://embeddable-sandbox.cdn.apollographql.com https://embeddable-explorer.cdn.apollographql.com`,h=`style-src 'nonce-${r}' https://apollo-server-landing-page.cdn.apollographql.com https://embeddable-sandbox.cdn.apollographql.com https://embeddable-explorer.cdn.apollographql.com https://fonts.googleapis.com`;return`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${m}; ${h}; img-src https://apollo-server-landing-page.cdn.apollographql.com; manifest-src https://apollo-server-landing-page.cdn.apollographql.com; frame-src https://explorer.embed.apollographql.com https://sandbox.embed.apollographql.com https://embed.apollo.local:3000" />
    <link
      rel="icon"
      href="https://apollo-server-landing-page.cdn.apollographql.com/${e}/assets/favicon.png"
    />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro&display=swap"
      rel="stylesheet"
    />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Apollo server landing page" />
    <link
      rel="apple-touch-icon"
      href="https://apollo-server-landing-page.cdn.apollographql.com/${e}/assets/favicon.png"
    />
    <link
      rel="manifest"
      href="https://apollo-server-landing-page.cdn.apollographql.com/${e}/manifest.json"
    />
    <title>Apollo Server</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="react-root">
      <style nonce=${r}>
        body {
          margin: 0;
          overflow-x: hidden;
          overflow-y: hidden;
        }
        .fallback {
          opacity: 0;
          animation: fadeIn 1s 1s;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
          padding: 1em;
        }
        @keyframes fadeIn {
          0% {opacity:0;}
          100% {opacity:1; }
        }
      </style>
    ${o.embed?"graphRef"in o&&o.graphRef?l(n,o,s,r):"graphRef"in o?c(p,o,s,r):a(t,o,s,r):c(p,o,s,r)}
    </div>
  </body>
</html>
          `}}}})}}}};