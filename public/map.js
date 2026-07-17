/* ============================================================
   Caribbean Supply — HUD world map (D3 + world-atlas)
   ============================================================ */
(function () {
  "use strict";

  var W = 1200, H = 660;
  var DATA = (window.__resources && window.__resources.worldAtlas) ||
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  // ports (lon, lat)
  var GUANGZHOU = [113.26, 23.13];
  var MARTINIQUE = [-61.07, 14.6];
  var GUADELOUPE = [-61.53, 16.24];
  var GUYANE = [-52.33, 4.92];

  // decorative network hubs (lon, lat)
  var NODES = [
    [121.47, 31.23], [114.06, 22.54], [103.82, 1.35], [55.27, 25.2],
    [4.48, 51.92], [-0.13, 51.5], [-74.0, 40.71], [-58.38, -34.6]
  ];

  function svgEl(tag) { return document.createElementNS("http://www.w3.org/2000/svg", tag); }

  function startClock() {
    var clock = document.getElementById("hudClock");
    if (!clock) return;
    // count down from ~34d 12h 47m
    var end = Date.now() + ((34 * 24 + 12) * 3600 + 47 * 60 + 9) * 1000;
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var ms = Math.max(0, end - Date.now());
      var d = Math.floor(ms / 86400000);
      var h = Math.floor(ms / 3600000) % 24;
      var m = Math.floor(ms / 60000) % 60;
      var s = Math.floor(ms / 1000) % 60;
      clock.innerHTML = pad(d) + '<span class="sep">:</span>' + pad(h) +
        '<span class="sep">:</span>' + pad(m) + '<span class="sep">:</span>' + pad(s);
    }
    tick();
    setInterval(tick, 1000);
  }

  function fallback() {
    // minimal grid + route if data/d3 unavailable
    var g = document.getElementById("gGraticule");
    if (!g) return;
    for (var y = 110; y < H; y += 110) { var l = svgEl("line"); l.setAttribute("x1", 0); l.setAttribute("y1", y); l.setAttribute("x2", W); l.setAttribute("y2", y); l.setAttribute("class", "mp-graticule"); g.appendChild(l); }
    for (var x = 200; x < W; x += 200) { var v = svgEl("line"); v.setAttribute("x1", x); v.setAttribute("y1", 0); v.setAttribute("x2", x); v.setAttribute("y2", H); v.setAttribute("class", "mp-graticule"); g.appendChild(v); }
    buildRoute(function (ll) {
      // crude projection for fallback: lon -180..180 -> 0..W, lat 85..-85 -> 0..H
      var x = (ll[0] + 180) / 360 * W;
      var yy = (85 - ll[1]) / 170 * H;
      return [x, yy];
    });
  }

  var shipState = null;

  function buildRoute(project) {
    var gz = project(GUANGZHOU), mq = project(MARTINIQUE);
    var gp = project(GUADELOUPE), gy = project(GUYANE);

    // control point: bow the arc upward (north) between the two
    var mx = (gz[0] + mq[0]) / 2, my = (gz[1] + mq[1]) / 2;
    var dx = mq[0] - gz[0], dy = mq[1] - gz[1];
    var dist = Math.sqrt(dx * dx + dy * dy);
    // perpendicular upward (negative y), magnitude proportional to distance
    var cx = mx, cy = my - dist * 0.32;
    var d = "M" + gz[0] + " " + gz[1] + " Q " + cx + " " + cy + " " + mq[0] + " " + mq[1];

    var gRoute = document.getElementById("gRoute");
    gRoute.innerHTML = "";

    var base = svgEl("path"); base.setAttribute("d", d); base.setAttribute("class", "route-base"); gRoute.appendChild(base);
    var glow = svgEl("path"); glow.setAttribute("d", d); glow.setAttribute("class", "route-glow"); gRoute.appendChild(glow);
    var comet = svgEl("path"); comet.setAttribute("d", d); comet.setAttribute("class", "route-comet"); gRoute.appendChild(comet);

    var L = glow.getTotalLength();
    // draw-in animation for glow
    glow.style.strokeDasharray = L;
    glow.style.strokeDashoffset = L;
    glow.style.transition = "stroke-dashoffset 2.6s cubic-bezier(.4,0,.2,1)";
    requestAnimationFrame(function () { requestAnimationFrame(function () { glow.style.strokeDashoffset = 0; }); });

    // comet dash
    var COMET = 150;
    comet.style.strokeDasharray = COMET + " " + (L + COMET);

    // ports
    var gPorts = document.getElementById("gPorts");
    gPorts.innerHTML = "";
    addPort(gPorts, gz, "a", "#FFC36B", "GUANGZHOU · SHENZHEN", "end", -12, 5);
    addPort(gPorts, mq, "b", "#5fe6df", "MARTINIQUE", "start", 12, 4);
    addPort(gPorts, gp, "b delay1", "#5fe6df", "GUADELOUPE", "start", 11, -4, true);
    addPort(gPorts, gy, "b delay2", "#5fe6df", "GUYANE", "start", 11, 16, true);

    shipState = { path: comet, glowPath: glow, comet: comet, L: L, COMET: COMET, gz: gz, mq: mq };
    buildShip();
    runShip();
  }

  function addPort(parent, p, cls, color, label, anchor, lx, ly, small) {
    var g = svgEl("g"); g.setAttribute("class", "port-" + cls); g.setAttribute("transform", "translate(" + p[0] + " " + p[1] + ")");
    var ring = svgEl("circle"); ring.setAttribute("class", "port-ring"); ring.setAttribute("r", small ? 5 : 6.5); ring.setAttribute("stroke", color); g.appendChild(ring);
    var core = svgEl("circle"); core.setAttribute("class", "port-core"); core.setAttribute("r", small ? 3 : 4); core.setAttribute("fill", color); g.appendChild(core);
    // tick line + label
    var tick = svgEl("line"); tick.setAttribute("class", "port-tick");
    tick.setAttribute("x1", anchor === "end" ? -7 : 7); tick.setAttribute("y1", 0);
    tick.setAttribute("x2", anchor === "end" ? -7 + lx : 7 + (lx - 7)); tick.setAttribute("y2", ly - 4);
    g.appendChild(tick);
    var t = svgEl("text"); t.setAttribute("class", "port-label" + (small ? " sm" : "")); t.setAttribute("x", lx); t.setAttribute("y", ly); t.setAttribute("text-anchor", anchor); t.textContent = label;
    g.appendChild(t);
    parent.appendChild(g);
  }

  function buildShip() {
    var g = document.getElementById("gShip"); g.innerHTML = "";
    var glow = svgEl("circle"); glow.setAttribute("r", 26); glow.setAttribute("fill", "url(#shipGlow)"); g.appendChild(glow);
    // simple cargo ship (bow left), upright
    var hull = svgEl("path"); hull.setAttribute("d", "M16 0 L-14 0 L-22 7 L-18 13 L14 13 Z"); hull.setAttribute("fill", "#0e2a52"); hull.setAttribute("stroke", "#5fe6df"); hull.setAttribute("stroke-width", "1"); g.appendChild(hull);
    var deck = svgEl("rect"); deck.setAttribute("x", -14); deck.setAttribute("y", -2); deck.setAttribute("width", 30); deck.setAttribute("height", 3); deck.setAttribute("fill", "#071426"); g.appendChild(deck);
    var cs = [[-10, -9, "#FF7A3D"], [-2, -9, "#5fe6df"], [6, -9, "#E6EDF8"], [-6, -16, "#16C6C0"], [2, -16, "#FFC36B"]];
    cs.forEach(function (c) { var r = svgEl("rect"); r.setAttribute("x", c[0]); r.setAttribute("y", c[1]); r.setAttribute("width", 7); r.setAttribute("height", c[1] === -16 ? 6 : 7); r.setAttribute("rx", 1); r.setAttribute("fill", c[2]); g.appendChild(r); });
    var br = svgEl("rect"); br.setAttribute("x", 11); br.setAttribute("y", -8); br.setAttribute("width", 6); br.setAttribute("height", 9); br.setAttribute("rx", 1); br.setAttribute("fill", "#aee6ff"); g.appendChild(br);
    shipState.shipG = g;
  }

  function runShip() {
    var s = shipState;
    var DUR = 11000;
    var start = null;
    function frame(ts) {
      if (!start) start = ts + 1400; // wait for route draw-in
      var t = ((ts - start) % DUR) / DUR;
      if (t < 0) { requestAnimationFrame(frame); return; }
      var p = t * s.L;
      var pt = s.glowPath.getPointAtLength(p);
      // comet: visible segment ends at ship
      s.comet.style.strokeDashoffset = (s.COMET - p);
      // fade near loop ends
      var fade = 1;
      if (t < 0.05) fade = t / 0.05;
      else if (t > 0.95) fade = (1 - t) / 0.05;
      s.comet.style.opacity = fade;
      if (s.shipG) {
        s.shipG.setAttribute("transform", "translate(" + pt.x + " " + pt.y + ")");
        s.shipG.style.opacity = fade;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function render(topo) {
    var land = topo.objects.countries;
    var features = topojson.feature(topo, land).features.filter(function (f) { return f.id !== "010"; }); // drop Antarctica

    var projection = d3.geoEquirectangular()
      .scale(196)
      .translate([W / 2, 332]);
    var path = d3.geoPath(projection);
    var project = function (ll) { return projection(ll); };

    // graticule
    var grat = d3.geoGraticule().step([20, 20]);
    var gG = document.getElementById("gGraticule");
    var gp = svgEl("path"); gp.setAttribute("d", path(grat())); gp.setAttribute("class", "mp-graticule"); gG.appendChild(gp);

    // countries fill
    var gC = document.getElementById("gCountries");
    features.forEach(function (f) {
      var pth = svgEl("path"); pth.setAttribute("d", path(f));
      var hot = (f.id === "156"); // China highlighted
      pth.setAttribute("class", hot ? "mp-hot" : "mp-country");
      gC.appendChild(pth);
    });

    // interior borders
    var borders = topojson.mesh(topo, land, function (a, b) { return a !== b; });
    var gB = document.getElementById("gBorders");
    var bp = svgEl("path"); bp.setAttribute("d", path(borders)); bp.setAttribute("class", "mp-border"); gB.appendChild(bp);

    // coastline (exterior)
    var coast = topojson.mesh(topo, land, function (a, b) { return a === b; });
    var gCo = document.getElementById("gCoast");
    var cp = svgEl("path"); cp.setAttribute("d", path(coast)); cp.setAttribute("class", "mp-coast"); gCo.appendChild(cp);

    // network nodes
    var gN = document.getElementById("gNodes");
    NODES.forEach(function (ll, i) {
      var p = project(ll); if (!p) return;
      var dot = svgEl("circle"); dot.setAttribute("cx", p[0]); dot.setAttribute("cy", p[1]); dot.setAttribute("r", 1.8); dot.setAttribute("fill", "#7fe9ff"); dot.setAttribute("opacity", ".85"); gN.appendChild(dot);
      var ring = svgEl("circle"); ring.setAttribute("cx", p[0]); ring.setAttribute("cy", p[1]); ring.setAttribute("r", 4); ring.setAttribute("class", "node-dotpulse"); ring.style.animationDelay = (i * 0.4) + "s"; gN.appendChild(ring);
    });

    buildRoute(project);
  }

  function init() {
    startClock();
    if (typeof d3 === "undefined" || typeof topojson === "undefined") { fallback(); return; }
    fetch(DATA).then(function (r) { return r.json(); }).then(render).catch(function (e) {
      console.warn("map data failed, fallback", e); fallback();
    });
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
