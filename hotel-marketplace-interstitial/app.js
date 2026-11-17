/* Hotel marketplace value interstitial: shared prototype engine.
   Each page sets <body data-concept="control|a|b|c|d"> and mounts into #app. Plain JS, no dependencies. */
(function () {
  var CONCEPT = document.body.dataset.concept;
  var KEY = "hmvi-state";
  var defaults = { load: 8, minDisplay: 0, view: "variant", viewport: "desktop", reduced: false, wording: "safe", repeat: false, fail: false, userType: "traveler", mobileKeep: true };
  var S = Object.assign({}, defaults);
  try { Object.assign(S, JSON.parse(sessionStorage.getItem(KEY) || "{}")); } catch (e) {}
  S.repeat = false; /* repeat exposure shows everything at once with no motion, so it never carries over between pages */
  S.viewport = "desktop"; /* desktop is the focus: every page opens in desktop, Mobile is a per-page preview only */
  var mq = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mq && mq.matches) S.reduced = true;
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  /* ---------- JS timeline ----------
     All motion runs from the same timer as the progress bar, so it never depends on the browser's CSS animation clock
     (which some preview panes freeze). CSS only holds each element's start and end state. */
  var TW = [];
  var EASE = {
    out: function (k) { return 1 - Math.pow(1 - k, 3); },
    back: function (k) { var c = 1.7, d = c + 1; return 1 + d * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
    backBig: function (k) { var c = 2.6, d = c + 1; return 1 + d * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }
  };
  function still() { return S.reduced || S.repeat; }
  function applyTW(t, k) {
    var e = t.ease(k), v = {}, key, st = t.el.style, f = t.from, o = t.to;
    for (key in o) v[key] = (key in f ? f[key] : o[key]) + (o[key] - (key in f ? f[key] : o[key])) * e;
    if ("o" in v) st.opacity = Math.max(0, Math.min(1, v.o));
    if ("x" in v || "y" in v || "s" in v || "sx" in v || "sy" in v) {
      var sx = "sx" in v ? v.sx : "s" in v ? v.s : 1, sy = "sy" in v ? v.sy : "s" in v ? v.s : 1;
      st.transform = "translate(" + (v.x || 0) + "px," + (v.y || 0) + "px) scale(" + sx + "," + sy + ")";
    }
    if ("w" in v) st.width = v.w + "px";
    if ("ring" in v) st.boxShadow = "0 0 0 " + (10 * v.ring) + "px rgba(0,111,207," + (0.35 * (1 - v.ring)) + ")";
    if ("dash" in v) st.strokeDashoffset = v.dash;
  }
  function clearTW(t) {
    var st = t.el.style, o = t.to;
    if ("o" in o) st.opacity = "";
    if ("x" in o || "y" in o || "s" in o || "sx" in o || "sy" in o) st.transform = "";
    if ("w" in o) st.width = "";
    if ("ring" in o) st.boxShadow = "";
    if ("dash" in o) st.strokeDashoffset = "";
  }
  function tween(el, from, to, dur, delay, ease, done) {
    if (!el) return;
    if (still()) { if (done) done(); return; }
    var t = { el: el, from: from, to: to, dur: dur * 1000, t0: performance.now() + (delay || 0) * 1000, ease: EASE[ease || "out"], done: done };
    TW.push(t);
    applyTW(t, 0);
  }
  function stepTW() {
    var now = performance.now(), cur = TW;
    TW = [];
    cur.forEach(function (t) {
      var k = (now - t.t0) / t.dur;
      if (k < 0) { applyTW(t, 0); TW.push(t); }
      else if (k >= 1) { clearTW(t); if (t.done) t.done(); }
      else { applyTW(t, k); TW.push(t); }
    });
  }
  /* turn a class on or off, and play a short entrance when it turns on */
  function flip(el, cls, on, from, dur) {
    if (!el || el.classList.contains(cls) === on) return;
    el.classList.toggle(cls, on);
    if (on) tween(el, from || { o: 0.25 }, { o: 1, x: 0, y: 0, s: 1 }, dur || 0.3, 0, "out");
  }

  var CHECK = "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z";
  var ICON = {
    plane: "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z",
    train: "M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
    car: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"
  };

  /* Claim wording. "safe" holds for every user. "strong" mirrors the PRD claims and needs substantiation before launch (R1). */
  var WORD = {
    safe: {
      inv: ["Inventory", "Hotel chains, independents and booking partners"],
      loy: ["Loyalty rates", "Loyalty rates, where your programs apply"],
      co: ["Company rates", "Negotiated rates, if your company has them"],
      pr: ["Prices", "Compared across every source we checked"],
      rot: ["Checking hotel chains, independents and booking partners", "Looking for your loyalty rates", "Including company rates, if your company has them", "Comparing prices across every source"],
      one: "Checking every source, including loyalty and company rates where they apply",
      csub: "Checking six source types",
      dsub: "Rates are marked on your results when they apply",
      leg: [["Egencia preferred", "Hotels Egencia recommends"], ["Negotiated", "Your company's rates, when available"], ["Loyalty rate", "Your loyalty pricing, when available"]]
    },
    strong: {
      inv: ["Inventory", "Every inventory source, in one search"],
      loy: ["Loyalty rates", "Your loyalty rates, applied for you"],
      co: ["Company rates", "Your company's negotiated rates, included"],
      pr: ["Best prices", "The best prices, across all sources"],
      rot: ["Searching all inventory sources", "Applying your loyalty rates", "Applying your company's negotiated rates", "Finding you the best prices"],
      one: "Checking all inventory sources, loyalty rates, company rates and best prices",
      csub: "Every source, one search",
      dsub: "Your best rates, marked on your results",
      leg: [["Egencia preferred", "Hotels Egencia recommends"], ["Negotiated", "Your company's negotiated rates"], ["Loyalty rate", "Your loyalty rates, applied"]]
    }
  };

  /* ---------- Concepts: each returns { visual, sub, desc, update(p) } ---------- */
  function routeSVG() {
    return '<img class="route" src="assets/route-illustration.png" width="873" height="788" alt="" aria-hidden="true">';
  }
  /* The live control cycles through a list of actions on a timer. The list below is a placeholder until the real one is confirmed. */
  var ACTIONS = ["Contacting hotels for rates", "Checking availability", "Gathering room types", "Sorting your results"];
  function cycle(modal, list, t, every, fade) {
    var i = Math.floor(t / every) % list.length, span = modal.querySelector(".rot span");
    if (!span || span.dataset.i === String(i)) return;
    span.dataset.i = i;
    if (!fade) { span.textContent = list[i]; return; }
    tween(span, { o: 1 }, { o: 0 }, 0.15, 0, "out", function () { span.textContent = list[i]; tween(span, { o: 0 }, { o: 1 }, 0.2); });
  }

  var CONCEPTS = {
    control: function (ctx) {
      return {
        visual: routeSVG(), sub: '<span class="rot"><span data-i="0">' + ACTIONS[0] + "</span></span>", desc: "Searching for hotels. Contacting hotels for rates.", subHidden: true,
        update: function (p, el, modal, t) { cycle(modal, ACTIONS, t, 2.2, !S.reduced); }
      };
    },
    a: function (ctx) {
      var w = WORD[S.wording], keys = ["inv", "loy", "co", "pr"], html = '<ul class="checks' + (S.repeat ? " compact" : "") + '">';
      keys.forEach(function (k) {
        html += '<li><span class="ck"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + CHECK + '"/></svg></span><span><span class="h">' + w[k][0] + '</span><br><span class="d">' + w[k][1] + '</span></span></li>';
      });
      html += "</ul>";
      return {
        visual: html, sub: "Contacting hotels for rates",
        desc: "Searching for hotels. Checking inventory, loyalty rates, company rates and prices.",
        update: function (p, el, modal, t) {
          if (S.repeat) return;
          el.querySelectorAll(".checks li").forEach(function (li, i) {
            var s = 0.04 + 0.23 * i, e = s + 0.23, st = p >= e ? "done" : p >= s ? "active" : "", ck = li.querySelector(".ck");
            if (li.dataset.st !== st) {
              li.dataset.st = st; li.className = st; ck.style.transform = "";
              if (st === "active") tween(li, { o: 0.45 }, { o: 1 }, 0.3);
              if (st === "done") tween(ck, { s: 0.6 }, { s: 1 }, 0.35, 0, "back");
            }
            if (st === "active" && !S.reduced) ck.style.transform = "rotate(" + Math.round((t * 400) % 360) + "deg)";
          });
        }
      };
    },
    b: function (ctx) {
      var w = WORD[S.wording], static_ = S.repeat || S.reduced;
      return {
        visual: routeSVG(), sub: '<span class="rot"><span data-i="0">' + (static_ ? w.one : w.rot[0]) + "</span></span>",
        subHidden: !static_,
        desc: "Searching for hotels. " + w.one + ".",
        update: function (p, el, modal, t) {
          if (static_) return;
          cycle(modal, w.rot, t, 2.4, true);
        }
      };
    },
    c: function (ctx) {
      var w = WORD[S.wording], labels = ["Hotel chains", "Independents", "Booking partners", "Loyalty programs", "Company rates", "Egencia preferred"], cx = 180, cy = 145, rx = 128, ry = 100, nodes = "", spokes = "";
      labels.forEach(function (l, k) {
        var a = (k * 60 - 90) * Math.PI / 180, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
        spokes += '<line class="spoke" data-k="' + k + '" x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '"/>';
        nodes += '<g class="node" data-k="' + k + '" transform="translate(' + x + " " + y + ')"><rect x="-66" y="-16" width="132" height="32" rx="16"/><circle class="tick" cx="-50" cy="0" r="4"/><text x="8" y="4">' + l + "</text></g>";
      });
      var svg = '<svg class="sources" viewBox="0 0 360 290" aria-hidden="true" focusable="false">' + spokes + '<circle class="core" cx="' + cx + '" cy="' + cy + '" r="40"/><text class="core-t" x="' + cx + '" y="' + (cy + 4) + '">Your search</text>' + nodes + "</svg>";
      var last = -1;
      return {
        visual: svg, sub: S.repeat ? w.csub : "0 of 6 source types checked",
        desc: "Searching for hotels. Checking six source types: hotel chains, independents, booking partners, loyalty programs, company rates and Egencia preferred.",
        update: function (p, el, modal) {
          var n = 0;
          el.querySelectorAll(".node").forEach(function (g, k) {
            var on = S.repeat || p >= 0.06 + 0.15 * k;
            var sp = el.querySelector('.spoke[data-k="' + k + '"]');
            if (on && !g.classList.contains("on")) { tween(g.querySelector("rect"), { o: 0.35 }, { o: 1 }, 0.4); if (sp) tween(sp, { o: 0.2 }, { o: 1 }, 0.4); }
            g.classList.toggle("on", on);
            if (sp) sp.classList.toggle("on", on);
            if (on) n++;
          });
          if (!S.repeat && n !== last) { last = n; var sub = modal.querySelector(".m-sub"); if (sub) sub.textContent = n === 6 && S.wording === "strong" ? w.csub : n + " of 6 source types checked"; }
        }
      };
    },
    d: function (ctx) {
      var w = WORD[S.wording], on = S.repeat ? " on" : "";
      var html = '<div class="prev"><div class="prev-card"><div class="prev-badges">' +
        '<span class="badge pref' + on + '">Egencia preferred</span><span class="badge' + on + '">Negotiated</span><span class="badge member' + on + '">Loyalty rate</span></div>' +
        '<div class="thumb"></div><div><div class="ln"></div><div class="ln w60"></div><div class="ln w40"></div></div><div class="px">$189</div></div><ul class="legend">';
      w.leg.forEach(function (l) { html += '<li class="' + on.trim() + '"><b>' + l[0] + "</b><span>" + l[1] + "</span></li>"; });
      html += "</ul></div>";
      return {
        visual: html, sub: w.dsub, desc: "Searching for hotels. " + w.dsub + ".",
        update: function (p, el) {
          if (S.repeat) return;
          var b = el.querySelectorAll(".badge"), l = el.querySelectorAll(".legend li");
          [0.12, 0.4, 0.68].forEach(function (t, i) { flip(b[i], "on", p >= t, { o: 0.25, y: 6, s: 0.92 }, 0.35); flip(l[i], "on", p >= t, { o: 0.25, x: -8 }, 0.35); });
        }
      };
    },
    d1: function (ctx) {
      var strong = S.wording === "strong", on = S.repeat ? " on" : "";
      var names = ["Expedia", "Booking.com", "Hotel chains direct", "And more"];
      var html = '<div class="prev"><div class="prev-card"><div class="prev-badges"><span class="badge' + on + '">Negotiated</span><span class="badge member' + on + '">Loyalty rate</span></div>' +
        '<div class="thumb"></div><div><div class="ln"></div><div class="ln w60"></div><div class="ln w40"></div></div><div class="px">$189</div></div>' +
        '<p class="prov-h">Rates from</p><div class="provs">' + names.map(function (n) { return '<span class="chip' + on + '">' + n + "</span>"; }).join("") + "</div>" +
        '<ul class="legend"><li class="' + on.trim() + '"><b>Negotiated</b><span>' + (strong ? "Your company's negotiated rates" : "Your company's rates, when available") + '</span></li><li class="' + on.trim() + '"><b>Loyalty rate</b><span>' + (strong ? "Your loyalty rates, applied" : "Your loyalty pricing, when available") + "</span></li></ul></div>";
      var sub = strong ? "Expedia, Booking.com and every direct source, in one search" : "Checking partners like Expedia and Booking.com, plus hotels directly";
      return {
        visual: html, sub: sub, desc: "Searching for hotels. " + sub + ". Company and loyalty rates are marked on your results when they apply.",
        update: function (p, el) {
          if (S.repeat) return;
          el.querySelectorAll(".chip").forEach(function (c, i) { flip(c, "on", p >= 0.08 + 0.12 * i, { o: 0.3, y: -8, s: 0.9 }, 0.35); });
          var b = el.querySelectorAll(".badge"), l = el.querySelectorAll(".legend li");
          [0.6, 0.78].forEach(function (t, i) { flip(b[i], "on", p >= t, { o: 0.25, y: 6, s: 0.92 }, 0.35); flip(l[i], "on", p >= t, { o: 0.25, x: -8 }, 0.35); });
        }
      };
    },
    d2: function (ctx) {
      var strong = S.wording === "strong";
      var sigs = [
        ["Egencia preferred", "Hotels Egencia recommends for business travel"],
        ["Negotiated", strong ? "Your company's negotiated rates" : "Your company's rates, when available"],
        ["Loyalty rate", strong ? "Your loyalty rates, applied" : "Your loyalty pricing, when available"],
        ["Coworker bookings", "How many colleagues booked this hotel"],
        ["Reviews", "Scores from people at your company"],
        ["Matches how you book", "Shaped by your past trips"],
        ["Breakfast included", "Whether breakfast is included in the rate"],
        ["Company policy", "Whether a hotel is in policy"]
      ];
      var on = S.repeat ? " on" : "";
      var html = '<div class="prev"><div class="prev-card"><div class="prev-badges">' +
        '<span class="badge pref sig' + on + '" data-s="0">Egencia preferred</span><span class="badge sig' + on + '" data-s="1">Negotiated</span><span class="badge member sig' + on + '" data-s="2">Loyalty rate</span></div>' +
        '<div class="thumb"></div><div><div class="ln"></div><div class="sigs"><span class="pill sig' + on + '" data-s="3">42% of coworker bookings</span><span class="pill sig' + on + '" data-s="4">Reviews 4.4</span><span class="pill sig' + on + '" data-s="5">Matches how you book</span><span class="pill sig' + on + '" data-s="6">Breakfast included</span><span class="pill sig' + on + '" data-s="7">Company policy</span></div></div><div class="px">$189</div></div>' +
        '<p class="cap" aria-hidden="true">' + (S.repeat ? "<b>Look for these signals on your results</b>" : "") + "</p></div>";
      var sub = strong ? "Everything that makes a hotel the best value for you, marked on your results" : "Signals that help you choose are marked on your results";
      var last = -1;
      return {
        visual: html, sub: sub,
        desc: "Searching for hotels. " + sub + ". Signals include Egencia preferred, negotiated rates, loyalty rates, coworker bookings, colleague reviews, a match to how you book, breakfast and company policy.",
        update: function (p, el) {
          if (S.repeat) return;
          var i = Math.min(7, Math.floor(p * 8.2));
          el.querySelectorAll(".sig").forEach(function (n) { flip(n, "on", +n.dataset.s <= i, { o: 0.25, y: 6, s: 0.88 }, 0.35); });
          if (i !== last) { last = i; var cap = el.querySelector(".cap"); if (cap) { cap.innerHTML = "<b>" + sigs[i][0] + ":</b> " + sigs[i][1]; tween(cap, { o: 0, y: 4 }, { o: 1, y: 0 }, 0.3); } }
        }
      };
    },
    d3: function (ctx) {
      var strong = S.wording === "strong", t = S.userType;
      var C = {
        traveler: ["For travelers", [["Your loyalty rates", strong ? "Applied for you, across every source" : "Loyalty rates, where your programs apply"], ["Coworker picks", "See what colleagues book, in the results"], ["Matches how you book", "Shaped by your past trips"]]],
        arranger: ["For arrangers", [["Company rates", strong ? "Your company's negotiated rates, included" : "Negotiated rates, if your company has them"], ["Policy at a glance", "In and out of policy, marked on every hotel"], ["Booking for others", "Traveler loyalty and preferences, where on file"]]],
        unknown: ["For your trip", [["Major partners and direct", "Expedia, Booking.com and hotels directly"], ["Company and loyalty rates", "Where they apply to you"], ["What colleagues book", "Shown in the results"]]]
      }[t];
      var on = S.repeat ? " on" : "";
      var html = '<div class="vals"><span class="who">' + C[0] + '</span><ul>' + C[1].map(function (r) {
        return '<li class="' + on.trim() + '"><span class="vi"></span><span><span class="h">' + r[0] + '</span><br><span class="d">' + r[1] + "</span></span></li>";
      }).join("") + "</ul></div>";
      var sub = "Rates and signals are marked on your results when they apply";
      return {
        visual: html, sub: sub, desc: "Searching for hotels. " + C[0] + ": " + C[1].map(function (r) { return r[0] + ", " + r[1]; }).join(". ") + ".",
        update: function (p, el) {
          if (S.repeat) return;
          el.querySelectorAll(".vals li").forEach(function (li, i) { flip(li, "on", p >= 0.1 + 0.28 * i, { o: 0.25, x: -10 }, 0.4); });
        }
      };
    }
  }

  /* ---------- Figma concepts: animated versions of the three static frames ---------- */
  var HEAD = ["Checking with hotels...", "Comparing rates...", "Almost there..."];
  function setHeading(modal, text) {
    var h = modal.querySelector(".m-title");
    if (!h || h.dataset.t === text) return;
    h.dataset.t = text;
    if (S.reduced || S.repeat) { h.textContent = text; return; }
    tween(h, { o: 1 }, { o: 0 }, 0.15, 0, "out", function () { h.textContent = text; tween(h, { o: 0 }, { o: 1 }, 0.2); });
  }
  function figBase(extra, cityOn) {
    return '<div class="fz' + (S.repeat ? " quiet" : "") + '">' +
      '<div class="win" style="left:80px;top:14px;width:319px;height:26px"><img class="drift" alt="" src="assets/clouds-below.svg" data-d="-318" style="left:-45px;width:703px;height:20px"></div>' +
      '<div class="win" style="left:80px;top:40px;width:319px;height:56px"><img class="drift" alt="" src="assets/clouds-above.svg" data-d="-318" style="left:-125px;top:4px;width:669px;height:52px"></div>' +
      (cityOn ? '<div class="win city" style="left:47px;top:188px;width:386px;height:84px"><img class="drift" alt="" src="assets/city.svg" data-d="-918" style="left:0;width:2359px;height:84px"></div>' : "") +
      extra + '<div class="tip" role="presentation"></div></div>';
  }
  function hotelImg(w, h, left, top) { return '<img class="hotel" alt="" src="assets/hotel-a.svg" style="left:' + left + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px">'; }
  function bindTips(modal, sel) {
    var fz = modal.querySelector(".fz"), tip = modal.querySelector(".tip");
    fz.addEventListener("mouseover", function (e) {
      var el = e.target.closest(sel);
      if (!el || !el.classList.contains("on")) { tip.classList.remove("show"); return; }
      var r = el.getBoundingClientRect(), z = fz.getBoundingClientRect(), k = z.width / fz.offsetWidth || 1;
      tip.textContent = el.dataset.tip;
      tip.style.left = Math.max(8, Math.min(fz.offsetWidth - 188, (r.left - z.left + r.width / 2) / k - 90)) + "px";
      tip.style.top = Math.max(2, (r.top - z.top) / k - 34) + "px";
      tip.classList.add("show");
    });
    fz.addEventListener("mouseleave", function () { tip.classList.remove("show"); });
  }
  function figHeading(p, modal) {
    setHeading(modal, S.repeat ? HEAD[0] : HEAD[p < 0.34 ? 0 : p < 0.67 ? 1 : 2]);
    if (!still()) modal.querySelectorAll(".drift").forEach(function (im) { im.style.transform = "translateX(" + (parseFloat(im.dataset.d) * p) + "px)"; });
  }

  CONCEPTS.f1 = function () {
    var pins = [["Expedia", 36, 30, "Partner inventory"], ["Booking.com", 176, 14, "Partner inventory"], ["Hotel chains direct", 300, 40, "Rates direct from hotel brands"], ["Loyalty programs", 70, 96, "Loyalty rates, where your programs apply"], ["Company rates", 322, 102, "Negotiated rates, if your company has them"]];
    var q = S.repeat ? " on" : "";
    var html = hotelImg(104, 126, 188, 128) + pins.map(function (p, i) {
      return '<div class="spin' + q + '" data-i="' + i + '" data-tip="' + p[3] + '" style="left:' + p[1] + "px;top:" + p[2] + 'px"><span class="chip"><i class="sd"></i>' + p[0] + '</span><span class="stem"></span><span class="dotp"></span></div>';
    }).join("");
    var count = S.repeat ? 5 : 0;
    return {
      fig: true, visual: figBase(html, true), meta: true,
      sub: '<b class="num">' + count + "</b> of 5 sources checked", subClass: "blue",
      desc: "Searching for hotels. Checking five source types: Expedia, Booking.com, hotel chains direct, loyalty programs and company rates.",
      bind: function (m) { bindTips(m, ".spin"); },
      update: function (p, el, modal) {
        figHeading(p, modal);
        if (S.repeat) return;
        var n = 0;
        el.querySelectorAll(".spin").forEach(function (pin, i) {
          if (p >= 0.08 + 0.18 * i) {
            n++;
            if (!pin.classList.contains("on")) {
              pin.classList.add("on");
              tween(pin, { o: 0, y: -16, s: 0.92 }, { o: 1, y: 0, s: 1 }, 0.42, 0, "back");
              tween(pin.querySelector(".chip"), { ring: 0 }, { ring: 1 }, 0.7);
              tween(pin.querySelector(".stem"), { sy: 0 }, { sy: 1 }, 0.22, 0.12);
              tween(pin.querySelector(".dotp"), { s: 0 }, { s: 1 }, 0.3, 0.28, "back");
            }
          }
        });
        var num = modal.querySelector(".num");
        if (num && num.textContent !== String(n)) { num.textContent = n; tween(num, { o: 0, y: 6 }, { o: 1, y: 0 }, 0.25); }
      }
    };
  };

  CONCEPTS.f2 = function () {
    var strong = S.wording === "strong", q = S.repeat ? " on" : "";
    /* order of reveal: Negotiated, Loyalty rate, Egencia preferred, Coworker picks */
    var defs = [
      ["Negotiated", strong ? "Your company's negotiated rates" : "Your company's rates, when available", "R", "up", ""],
      ["Loyalty rate", strong ? "Your loyalty rates, applied" : "Your loyalty pricing, when available", "L", "low", ""],
      ["Egencia preferred", "Hotels Egencia recommends", "L", "up", " gold"],
      ["Coworker picks", "See what colleagues book", "R", "low", ""]
    ];
    var html = '<span class="ring"></span>' + hotelImg(102, 123, 189, 131) + defs.map(function (d, i) {
      var left = d[2] === "L" ? 12 : 318, top = d[3] === "up" ? 22 : 112;
      var h = '<div class="co ' + d[2] + " " + d[3] + d[4] + q + '" data-i="' + i + '">';
      if (d[3] === "up") {
        var vx = d[2] === "L" ? 222 : 258, hx = d[2] === "L" ? 162 : 258, hw = 60;
        h += '<span class="lead v" style="left:' + (vx - 1) + 'px;top:55px;height:76px"></span><span class="lead h" style="left:' + hx + "px;top:54px;width:" + hw + 'px"></span>';
      } else {
        var lx = d[2] === "L" ? 162 : 290;
        h += '<span class="lead h" style="left:' + lx + 'px;top:144px;width:28px"></span>';
      }
      return h + '<div class="card" style="left:' + left + "px;top:" + top + 'px"><b>' + d[0] + "</b><span>" + d[1] + "</span></div></div>";
    }).join("");
    return {
      fig: true, visual: figBase(html, true), meta: true,
      sub: "Rates and signals are marked on your results",
      desc: "Searching for hotels. Rates and signals are marked on your results: negotiated rates, loyalty rates, Egencia preferred and coworker picks.",
      update: function (p, el, modal) {
        figHeading(p, modal);
        if (S.repeat) return;
        el.querySelectorAll(".co").forEach(function (co, i) {
          if (p >= 0.1 + 0.22 * i && !co.classList.contains("on")) {
            co.classList.add("on");
            var left = co.classList.contains("L"), up = co.classList.contains("up");
            tween(co.querySelector(".card"), { o: 0, x: left ? -14 : 14 }, { o: 1, x: 0 }, 0.36, 0.3);
            tween(co.querySelector(".lead.v"), { sy: 0 }, { sy: 1 }, 0.18);
            tween(co.querySelector(".lead.h"), { sx: 0 }, { sx: 1 }, 0.2, up ? 0.16 : 0);
            tween(el.querySelector(".ring"), { o: 0.55, s: 0.55 }, { o: 0, s: 1.7 }, 0.7);
            var h = el.querySelector(".hotel");
            tween(h, { s: 1 }, { s: 1.03 }, 0.1, 0, "out", function () { tween(h, { s: 1.03 }, { s: 1 }, 0.22); });
          }
        });
      }
    };
  };

  CONCEPTS.f3 = function () {
    var q = S.repeat ? " on" : "", inits = ["AK", "MR", "JT", "SP", "LW"], tints = ["t1", "t2", "t3", "t4", "t5"];
    var star = '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M12 2l3 7 7.4.6-5.6 4.9 1.7 7.3L12 18l-6.5 3.8 1.7-7.3L1.6 9.6 9 9z"/></svg>';
    var stars = star + star + star + star + star;
    var html = hotelImg(87, 105, 196, 10) + '<div class="fcap' + q + '">Colleagues who booked here</div>' +
      inits.map(function (n, i) { return '<span class="av ' + tints[i] + q + '" data-i="' + i + '" style="left:' + (166 + i * 28) + 'px;top:146px">' + n + "</span>"; }).join("") +
      '<div class="pills"><span class="pill p1' + q + '" data-tip="Sample: share of colleague bookings in this city at this hotel"><span><b class="cnt">' + (S.repeat ? 42 : 0) + '</b>% of coworker bookings</span></span>' +
      '<span class="pill p2' + q + '" data-tip="Sample: average score from colleagues at your company">Reviews <span class="stars"><span class="base">' + stars + '</span><span class="fill">' + stars + '</span></span> <b>4.4</b></span></div>' +
      '<div class="pills two"><span class="pill p3' + q + '" data-tip="Sample: within your company\'s travel policy"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path class="tickmark" d="M5 12.5l4.5 4.5L19 7"/></svg>In policy</span></div>';
    var counted = S.repeat;
    return {
      fig: true, visual: figBase(html, false), meta: true,
      sub: "Colleague bookings are shown on your results",
      desc: "Searching for hotels. Colleague bookings are shown on your results, along with colleague review scores and whether a hotel is in policy.",
      bind: function (m) { bindTips(m, ".pill"); },
      update: function (p, el, modal) {
        figHeading(p, modal);
        if (S.repeat) return;
        el.querySelectorAll(".av").forEach(function (a, i) {
          if (p >= 0.06 + 0.07 * i && !a.classList.contains("on")) { a.classList.add("on"); tween(a, { o: 0, s: 0 }, { o: 1, s: 1 }, 0.42, 0, "backBig"); }
        });
        var fc = el.querySelector(".fcap");
        if (p >= 0.06 && !fc.classList.contains("on")) { fc.classList.add("on"); tween(fc, { o: 0 }, { o: 1 }, 0.3); }
        [["p1", 0.5], ["p2", 0.68], ["p3", 0.84]].forEach(function (x) {
          var pl = el.querySelector("." + x[0]);
          if (p >= x[1] && !pl.classList.contains("on")) {
            pl.classList.add("on");
            tween(pl, { o: 0, y: 8 }, { o: 1, y: 0 }, 0.32);
            if (x[0] === "p2") tween(pl.querySelector(".stars .fill"), { w: 0 }, { w: 61.6 }, 0.8, 0.15);
            if (x[0] === "p3") tween(pl.querySelector(".tickmark"), { dash: 24 }, { dash: 0 }, 0.35, 0.2);
          }
        });
        if (p >= 0.5 && !counted) {
          counted = true;
          var c = el.querySelector(".cnt");
          if (S.reduced) { c.textContent = 42; return; }
          var t0 = performance.now();
          (function step() { var k = Math.min(1, (performance.now() - t0) / 700); c.textContent = Math.round(42 * (1 - Math.pow(1 - k, 3))); if (k < 1) setTimeout(step, 24); })();
        }
      }
    };
  };


  /* ---------- G variants: hotel stands on the skyline's baseline, skyline slower, in three parallax layers ---------- */
  function hotelG(w, h, left, top) { return '<img class="hotel g" alt="" src="assets/hotel-aligned.svg" style="left:' + left + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px">'; }
  function figBaseG(extra) {
    var layer = function (top, h, w, left, d, op) { return '<div class="win" style="left:30px;top:' + top + 'px;width:420px;height:' + h + 'px;opacity:' + op + '"><img class="drift" alt="" src="assets/city.svg" data-d="' + d + '" style="left:' + left + 'px;width:' + w + 'px;height:' + h + 'px"></div>'; };
    return '<div class="fz' + (S.repeat ? " quiet" : "") + '">' +
      '<div class="win" style="left:80px;top:14px;width:319px;height:26px"><img class="drift" alt="" src="assets/clouds-below.svg" data-d="-80" style="left:-45px;width:703px;height:20px"></div>' +
      '<div class="win" style="left:80px;top:40px;width:319px;height:56px"><img class="drift" alt="" src="assets/clouds-above.svg" data-d="-140" style="left:-125px;top:4px;width:669px;height:52px"></div>' +
      layer(220, 52, 1463, -420, -90, 0.4) + layer(205, 67, 1887, -900, -180, 0.65) + layer(188, 84, 2359, 0, -300, 1) +
      extra + '<div class="tip" role="presentation"></div></div>';
  }
  CONCEPTS.g1 = function () {
    var pins = [["Expedia", 44, 22, "Partner inventory"], ["Booking.com", 192, 34, "Partner inventory"], ["Hotel chains direct", 296, 22, "Rates direct from hotel brands"], ["Loyalty programs", 36, 92, "Loyalty rates, where your programs apply"], ["Company rates", 338, 92, "Negotiated rates, if your company has them"]];
    var q = S.repeat ? " on" : "";
    var html = hotelG(143, 172, 168, 100) + pins.map(function (p, i) {
      return '<div class="spin' + q + '" data-i="' + i + '" data-tip="' + p[3] + '" style="left:' + p[1] + "px;top:" + p[2] + 'px"><span class="chip"><i class="sd"></i>' + p[0] + '</span><span class="stem"></span><span class="dotp"></span></div>';
    }).join("");
    var count = S.repeat ? 5 : 0;
    return {
      fig: true, visual: figBaseG(html), meta: true,
      sub: '<b class="num">' + count + "</b> of 5 sources checked", subClass: "blue",
      desc: "Searching for hotels. Checking five source types: Expedia, Booking.com, hotel chains direct, loyalty programs and company rates.",
      bind: function (m) { bindTips(m, ".spin"); },
      update: function (p, el, modal) {
        figHeading(p, modal);
        if (S.repeat) return;
        var n = 0;
        el.querySelectorAll(".spin").forEach(function (pin, i) {
          if (p >= 0.08 + 0.18 * i) {
            n++;
            if (!pin.classList.contains("on")) {
              pin.classList.add("on");
              tween(pin, { o: 0, y: -16, s: 0.92 }, { o: 1, y: 0, s: 1 }, 0.42, 0, "back");
              tween(pin.querySelector(".chip"), { ring: 0 }, { ring: 1 }, 0.7);
              tween(pin.querySelector(".stem"), { sy: 0 }, { sy: 1 }, 0.22, 0.12);
              tween(pin.querySelector(".dotp"), { s: 0 }, { s: 1 }, 0.3, 0.28, "back");
            }
          }
        });
        var num = modal.querySelector(".num");
        if (num && num.textContent !== String(n)) { num.textContent = n; tween(num, { o: 0, y: 6 }, { o: 1, y: 0 }, 0.25); }
      }
    };
  };

  CONCEPTS.g2 = function () {
    var strong = S.wording === "strong", q = S.repeat ? " on" : "";
    /* order of reveal: Negotiated, Loyalty rate, Egencia preferred, Coworker picks */
    var defs = [
      ["Negotiated", strong ? "Your company's negotiated rates" : "Your company's rates, when available", "R", "up", ""],
      ["Loyalty rate", strong ? "Your loyalty rates, applied" : "Your loyalty pricing, when available", "L", "low", ""],
      ["Egencia preferred", "Hotels Egencia recommends", "L", "up", " gold"],
      ["Coworker picks", "See what colleagues book", "R", "low", ""]
    ];
    var html = '<span class="ring" style="left:180px;top:130px;width:120px;height:120px"></span>' + hotelG(143, 172, 168, 100) + defs.map(function (d, i) {
      var left = d[2] === "L" ? 12 : 318, top = d[3] === "up" ? 14 : 100;
      var h = '<div class="co ' + d[2] + " " + d[3] + d[4] + q + '" data-i="' + i + '">';
      if (d[3] === "up") {
        var vx = d[2] === "L" ? 214 : 266, hx = d[2] === "L" ? 162 : 266, hw = 52;
        h += '<span class="lead v" style="left:' + (vx - 1) + 'px;top:47px;height:53px"></span><span class="lead h" style="left:' + hx + "px;top:46px;width:" + hw + 'px"></span>';
      } else {
        var lx = d[2] === "L" ? 162 : 306;
        h += '<span class="lead h" style="left:' + lx + 'px;top:133px;width:12px"></span>';
      }
      return h + '<div class="card" style="left:' + left + "px;top:" + top + 'px"><b>' + d[0] + "</b><span>" + d[1] + "</span></div></div>";
    }).join("");
    return {
      fig: true, visual: figBaseG(html), meta: true,
      sub: "Rates and signals are marked on your results",
      desc: "Searching for hotels. Rates and signals are marked on your results: negotiated rates, loyalty rates, Egencia preferred and coworker picks.",
      update: function (p, el, modal) {
        figHeading(p, modal);
        if (S.repeat) return;
        el.querySelectorAll(".co").forEach(function (co, i) {
          if (p >= 0.1 + 0.22 * i && !co.classList.contains("on")) {
            co.classList.add("on");
            var left = co.classList.contains("L"), up = co.classList.contains("up");
            tween(co.querySelector(".card"), { o: 0, x: left ? -14 : 14 }, { o: 1, x: 0 }, 0.36, 0.3);
            tween(co.querySelector(".lead.v"), { sy: 0 }, { sy: 1 }, 0.18);
            tween(co.querySelector(".lead.h"), { sx: 0 }, { sx: 1 }, 0.2, up ? 0.16 : 0);
            tween(el.querySelector(".ring"), { o: 0.55, s: 0.55 }, { o: 0, s: 1.7 }, 0.7);
            var h = el.querySelector(".hotel");
            tween(h, { s: 1 }, { s: 1.03 }, 0.1, 0, "out", function () { tween(h, { s: 1.03 }, { s: 1 }, 0.22); });
          }
        });
      }
    };
  };

  CONCEPTS.g3 = function () {
    var q = S.repeat ? " on" : "";
    var LOYALTY = ["Earns Marriott Bonvoy points", "Earns Hilton Honors points", "Earns World of Hyatt points", "Earns IHG One Rewards points", "Earns Choice Privileges points"];
    var star = '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M12 2l3 7 7.4.6-5.6 4.9 1.7 7.3L12 18l-6.5 3.8 1.7-7.3L1.6 9.6 9 9z"/></svg>';
    var stars = star + star + star + star + star;
    var html = hotelG(98, 118, 191, 154) + '<div class="fcap rot' + q + '" style="top:12px"><span data-i="0">' + LOYALTY[0] + "</span></div>" +
      '<div class="pills" style="top:78px"><span class="pill p1' + q + '" data-tip="Sample: share of colleague bookings in this city at this hotel"><span><b class="cnt">' + (S.repeat ? 42 : 0) + '</b>% of coworker bookings</span></span>' +
      '<span class="pill p2' + q + '" data-tip="Sample: average score from colleagues at your company">Reviews <span class="stars"><span class="base">' + stars + '</span><span class="fill">' + stars + '</span></span> <b>4.4</b></span></div>' +
      '<div class="pills two" style="top:114px"><span class="pill p3' + q + '" data-tip="Sample: within your company\'s travel policy"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path class="tickmark" d="M5 12.5l4.5 4.5L19 7"/></svg>In policy</span></div>';
    var counted = S.repeat;
    return {
      fig: true, visual: figBaseG(html), meta: true,
      sub: "Top loyalty programs, coworker bookings and reviews are shown on your results",
      desc: "Searching for hotels. Top loyalty programs rotate at the top of the card, along with coworker bookings, review scores and whether a hotel is in policy.",
      bind: function (m) { bindTips(m, ".pill"); },
      update: function (p, el, modal, t) {
        figHeading(p, modal);
        if (S.repeat) return;
        var fc = el.querySelector(".fcap");
        if (p >= 0.06 && !fc.classList.contains("on")) { fc.classList.add("on"); tween(fc, { o: 0 }, { o: 1 }, 0.3); }
        if (p >= 0.06) cycle(modal, LOYALTY, t, 2.4, true);
        [["p1", 0.5], ["p2", 0.68], ["p3", 0.84]].forEach(function (x) {
          var pl = el.querySelector("." + x[0]);
          if (p >= x[1] && !pl.classList.contains("on")) {
            pl.classList.add("on");
            tween(pl, { o: 0, y: 8 }, { o: 1, y: 0 }, 0.32);
            if (x[0] === "p2") tween(pl.querySelector(".stars .fill"), { w: 0 }, { w: 61.6 }, 0.8, 0.15);
            if (x[0] === "p3") tween(pl.querySelector(".tickmark"), { dash: 24 }, { dash: 0 }, 0.35, 0.2);
          }
        });
        if (p >= 0.5 && !counted) {
          counted = true;
          var c = el.querySelector(".cnt");
          if (S.reduced) { c.textContent = 42; return; }
          var t0 = performance.now();
          (function step() { var k = Math.min(1, (performance.now() - t0) / 700); c.textContent = Math.round(42 * (1 - Math.pow(1 - k, 3))); if (k < 1) setTimeout(step, 24); })();
        }
      }
    };
  };

  /* ---------- Stage ---------- */
  var HOTELS = [
    ["Hyatt Regency Chicago", "4 stars, 0.3 mi from search", "$189", ["Egencia preferred", "Negotiated"]],
    ["Hilton Chicago", "4 stars, 0.6 mi from search", "$204", ["Loyalty rate"]],
    ["The Gwen, a Luxury Collection Hotel", "5 stars, 0.9 mi from search", "$276", []],
    ["Hotel Chicago Downtown", "3 stars, 1.1 mi from search", "$152", ["Negotiated"]]
  ];
  function stageHTML() {
    var skel = "";
    for (var i = 0; i < 4; i++) skel += '<div class="skel"><i></i><div><span style="width:70%"></span><span style="width:45%"></span><span style="width:30%"></span></div></div>';
    var pins = [["$189", 30, 40], ["$204", 52, 28], ["$276", 40, 62], ["$152", 62, 70], ["$231", 22, 78]].map(function (p) { return '<span class="pin" style="left:' + p[1] + '%;top:' + p[2] + '%">' + p[0] + "</span>"; }).join("");
    return '<div class="srp" id="srp"><div class="srp-header"><span class="srp-logo">Egencia</span><span class="srp-nav"><span>Flights</span><span>Hotels</span><span>Cars</span><span>Trips</span></span></div>' +
      '<div class="srp-hero"><div class="srp-search"><div class="s-where"><div class="s-name">Near Egencia Chicago</div><div class="s-addr">350 S Wacker Dr, Chicago, IL</div></div><div class="s-dates">Dec 14 to Dec 18<small>Monday to Friday</small></div><span class="pill-edit">Edit search</span></div></div>' +
      '<div class="srp-filters"><span class="fpill">Smart filter</span><span class="fpill">Hotel rating</span><span class="fpill">Hotel name</span><span class="fpill">Loyalty</span><span class="fpill">Price</span><span class="fpill sort">Recommended</span></div>' +
      '<div class="srp-body"><div><p class="srp-count" id="results-heading" tabindex="-1">Searching</p><div id="list">' + skel + '</div></div><div class="map"><div class="lake"></div>' + pins + "</div></div></div>" +
      '<div class="scrim"></div><div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="m-title" aria-describedby="m-desc" tabindex="-1"></div>';
  }
  function resultsHTML() {
    return HOTELS.map(function (h) {
      var badges = h[3].map(function (b) { return '<span class="fpill" style="padding:2px 8px;font-size:12px;line-height:16px">' + b + "</span>"; }).join(" ");
      return '<div class="hcard"><div class="thumb"></div><div><div class="nm">' + h[0] + '</div><div class="meta">' + h[1] + '</div><div style="margin-top:8px">' + badges + '</div></div><div class="pr">' + h[2] + "<small>per night</small></div></div>";
    }).join("");
  }

  /* ---------- Panel ---------- */
  function seg(id, opts, val) {
    return '<div class="seg" id="' + id + '" role="group">' + opts.map(function (o) { return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (String(o[0]) === String(val)) + '">' + o[1] + "</button>"; }).join("") + "</div>";
  }
  function panelHTML() {
    var showView = CONCEPT !== "control";
    return '<aside class="panel" aria-label="Prototype controls"><h2>Prototype controls</h2>' +
      '<div class="grp"><button class="btn" id="replay" type="button">Replay loading</button></div>' +
      (showView ? '<div class="grp"><span class="lbl">Show</span>' + seg("view", [["variant", "Variant"], ["control", "Control"]], S.view) + "</div>" : "") +
      '<div class="grp"><span class="lbl">Viewport</span>' + seg("viewport", [["desktop", "Desktop"], ["mobile", "Mobile"]], S.viewport) + "</div>" +
      (showView ? '<div class="grp" id="mobileGrp"><span class="lbl">Mobile web treatment</span>' + seg("mobileKeep", [["true", "Keep current"], ["false", "Preview variant"]], S.mobileKeep) + '<p class="hint">Desktop is the focus. Mobile web likely keeps today\'s modal.</p></div>' : "") +
      '<div class="grp"><span class="lbl">Results ready after</span>' + seg("load", [[2, "2s"], [6, "6s"], [8, "8s"], [10, "10s"]], S.load) + '<p class="hint">Live SRP wait is roughly 6 to 10 seconds. 2s tests a fast response.</p></div>' +
      '<div class="grp"><span class="lbl">Minimum display time</span>' + seg("minDisplay", [[0, "None"], [3, "3s"]], S.minDisplay) + '<p class="hint">Brief says the variant must not outlast the control.</p></div>' +
      (showView ? '<div class="grp"><span class="lbl">Claim wording</span>' + seg("wording", [["safe", "True for everyone"], ["strong", "PRD claims"]], S.wording) + '<p class="hint">PRD claims ("best prices", "negotiated rates") need substantiation before launch.</p></div>' : "") +
      (CONCEPT === "d3" ? '<div class="grp"><span class="lbl">Viewing as</span>' + seg("userType", [["traveler", "Traveler"], ["arranger", "Arranger"], ["unknown", "Unknown"]], S.userType) + '<p class="hint">Unknown shows generic wording. Role-based wording is a scope question.</p></div>' : "") +
      '<div class="grp"><span class="lbl">Exposure</span>' + seg("repeat", [["false", "First time"], ["true", "Repeat (arranger)"]], S.repeat) + "</div>" +
      '<div class="grp"><label class="chk"><input type="checkbox" id="reduced"' + (S.reduced ? " checked" : "") + '> Reduce motion</label>' +
      (showView ? '<label class="chk"><input type="checkbox" id="fail"' + (S.fail ? " checked" : "") + '> Simulate variant failure (falls back to control)</label>' : "") + "</div>" +
      '<div class="grp"><span class="lbl">Timing</span><div class="readout" id="readout"></div></div>' +
      '<div class="grp" id="motionNote" hidden><div class="readout"><span class="bad">Motion is off.</span> <span id="motionWhy"></span></div></div>' +
      '<div class="grp"><span class="lbl">Screen reader announcements</span><ol class="log" id="log"></ol></div></aside>';
  }

  /* ---------- Engine ---------- */
  var root = document.getElementById("app");
  root.innerHTML = '<div class="wf-layout"><div class="stage-wrap"><div class="stage" id="stage" data-viewport="' + S.viewport + '">' + stageHTML() + "</div></div>" + panelHTML() + "</div>";
  var stage = document.getElementById("stage"), modal = document.getElementById("modal"), list = document.getElementById("list"), heading = document.getElementById("results-heading"), logEl = document.getElementById("log"), readout = document.getElementById("readout");
  var raf = 0, t0 = 0, active = null, skelHTML = list.innerHTML;

  function log(msg) { var li = document.createElement("li"); li.textContent = msg; logEl.appendChild(li); logEl.scrollTop = logEl.scrollHeight; }
  function fmt(n) { return n.toFixed(1) + "s"; }

  function start() {
    clearTimeout(raf);
    logEl.innerHTML = "";
    stage.classList.toggle("rm", !!S.reduced);
    stage.dataset.viewport = S.viewport;
    var mobileCurrent = CONCEPT !== "control" && S.viewport === "mobile" && S.mobileKeep && S.view === "variant";
    var usingVariant = CONCEPT !== "control" && S.view === "variant" && !S.fail && !mobileCurrent;
    var fellBack = CONCEPT !== "control" && S.view === "variant" && S.fail && !mobileCurrent;
    var mn = document.getElementById("motionNote");
    if (mn) { mn.hidden = !still(); document.getElementById("motionWhy").textContent = S.repeat ? "Exposure is set to Repeat, so everything is shown at once. Choose First time to see the animation." : "Reduce motion is on (from your system setting or the checkbox). Untick it to see the animation."; }
    var mg = document.getElementById("mobileGrp"); if (mg) mg.hidden = S.viewport !== "mobile";
    var key = usingVariant ? CONCEPT : "control";
    active = CONCEPTS[key]({});
    var dur0 = Math.max(S.load, S.minDisplay);
    modal.className = "modal" + (active.fig ? " fig" : "");
    modal.style.setProperty("--dur", dur0 + "s");
    var tag = fellBack ? '<span class="m-fallback">Fallback: control shown</span>' : mobileCurrent ? '<span class="m-fallback">Mobile web: current modal kept</span>' : "";
    var barHTML = '<div class="m-bar" role="progressbar" aria-label="Search progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>';
    if (active.fig) {
      modal.innerHTML = tag + '<div class="m-visual">' + active.visual + "</div>" + barHTML +
        '<h2 class="m-title" id="m-title" data-t="' + HEAD[0] + '">' + HEAD[0] + '</h2><p class="m-meta"><b>Near Egencia Chicago</b><br>Mon, Dec 14 \u2013 Fri, Dec 18</p>' +
        '<p class="m-sub ' + (active.subClass || "") + '" aria-hidden="true">' + active.sub + '</p><p class="sr-only" id="m-desc">' + active.desc + "</p>";
      if (active.bind) active.bind(modal);
    } else {
      modal.innerHTML = tag + '<div class="m-visual">' + active.visual + "</div>" + barHTML +
        '<h2 class="m-title" id="m-title">Searching for hotels</h2><p class="m-sub" aria-hidden="' + (active.subHidden ? "true" : "false") + '">' + active.sub + '</p><p class="sr-only" id="m-desc">' + active.desc + "</p>";
    }
    TW = [];
    if (active.fig) tween(modal.querySelector(".hotel"), { o: 0, y: 14 }, { o: 1, y: 0 }, 0.7);
    list.innerHTML = skelHTML; heading.textContent = "Searching";
    stage.classList.add("is-loading");
    modal.focus();
    log("Dialog opened. Focus on dialog. \"Searching for hotels.\" " + active.desc.replace("Searching for hotels. ", ""));
    if (mobileCurrent) log("Mobile web keeps the current modal. Variant applies to desktop only.");
    if (fellBack) log("Variant failed to render. Control shown instead. User sees what they see today.");
    t0 = performance.now();
    raf = setTimeout(tick, 16);
  }
  function tick() {
    var el = (performance.now() - t0) / 1000, dur = Math.max(S.load, S.minDisplay), p = Math.min(el / dur, 1);
    var visual = modal.querySelector(".m-visual"), bar = modal.querySelector(".m-bar");
    stepTW();
    active.update(p, visual, modal, el);
    bar.firstChild.style.width = Math.max(8, p * 100) + "%";
    bar.setAttribute("aria-valuenow", Math.round(p * 100));
    readout.innerHTML = "Modal visible: <b>" + fmt(Math.min(el, dur)) + "</b> of <b>" + fmt(dur) + "</b>";
    if (p < 1) { raf = setTimeout(tick, 16); return; }
    finish(dur);
  }
  function finish(dur) {
    stage.classList.remove("is-loading");
    list.innerHTML = resultsHTML();
    heading.textContent = "Showing 128 hotels";
    heading.focus();
    var delta = dur - S.load;
    readout.innerHTML = "Results ready at <b>" + fmt(S.load) + "</b>. Modal closed at <b>" + fmt(dur) + "</b>. " +
      (delta > 0 ? '<span class="bad">+' + fmt(delta) + " longer than control</span>" : '<span class="ok">Same as control</span>');
    log("Dialog closed. Focus moved to results heading. \"Showing 128 hotels.\"");
  }

  /* wire controls */
  function bindSeg(id, key, parse) {
    var g = document.getElementById(id); if (!g) return;
    g.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      S[key] = parse(b.dataset.v); save();
      g.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      start();
    });
  }
  bindSeg("view", "view", String); bindSeg("viewport", "viewport", String); bindSeg("load", "load", Number);
  bindSeg("minDisplay", "minDisplay", Number); bindSeg("userType", "userType", String); bindSeg("mobileKeep", "mobileKeep", function (v) { return v === "true"; }); bindSeg("wording", "wording", String); bindSeg("repeat", "repeat", function (v) { return v === "true"; });
  document.getElementById("replay").addEventListener("click", start);
  document.getElementById("reduced").addEventListener("change", function (e) { S.reduced = e.target.checked; save(); start(); });
  var failEl = document.getElementById("fail");
  if (failEl) failEl.addEventListener("change", function (e) { S.fail = e.target.checked; save(); start(); });
  start();
})();
