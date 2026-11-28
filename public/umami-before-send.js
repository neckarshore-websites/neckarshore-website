/*
 * Umami before-send hook (planning #4006 row 6, AD-65 layer 4).
 *
 * Umami's tracker (v3.4.1, src/tracker/index.ts) calls
 * window[data-before-send](type, payload) before every request and sends
 * nothing when the hook returns a falsy value. This file must load BEFORE the
 * tracker so the very first page view already goes through it.
 *
 * What it does (Founder decisions on planning #3208, 2026-11-03 and
 * 2026-11-08; Dr. Sommer, planning #4003 read 4):
 *   1. Sends nothing when the browser signals Global Privacy Control or
 *      Do Not Track. DNT is also honoured natively (data-do-not-track);
 *      GPC is not, so it lives here.
 *   2. Drops `screen` (screen resolution) from every payload.
 *   3. Keeps exactly five query keys on `url`: utm_source, utm_medium,
 *      utm_campaign, utm_content, utm_term. Every other key goes, including
 *      other utm_* keys such as utm_id: the filter is a list, not a prefix.
 *   4. Drops the WHOLE query of `referrer` (the server stores it separately
 *      as referrerQuery). utm values on a referrer belong to another site's
 *      links; the privacy text says "ohne deren Suchteil" (Dr. Sommer,
 *      2026-11-18, Art. 5(1)(c)).
 *   5. Drops the #fragment of both (also set natively via data-exclude-hash).
 *
 * Plain ES5 on purpose: no build step, served as a static file so
 * script-src 'self' covers it. scripts/umami-before-send.test.mjs is the spec.
 */
(function (w) {
  var KEEP = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];

  function keyOf(pair) {
    var k = pair.split("=")[0];
    try {
      return decodeURIComponent(k.replace(/\+/g, " "));
      // ES5 has no optional catch binding; the error itself is not needed.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return k;
    }
  }

  // String-based so it also handles the relative referrers Umami produces for
  // same-origin navigation ("/en?x=1").
  function clean(raw) {
    if (typeof raw !== "string" || raw === "") return raw;
    var hashAt = raw.indexOf("#");
    var noHash = hashAt === -1 ? raw : raw.slice(0, hashAt);
    var qAt = noHash.indexOf("?");
    if (qAt === -1) return noHash;
    var kept = noHash
      .slice(qAt + 1)
      .split("&")
      .filter(function (pair) {
        return pair !== "" && KEEP.indexOf(keyOf(pair)) !== -1;
      });
    return noHash.slice(0, qAt) + (kept.length ? "?" + kept.join("&") : "");
  }

  function stripQuery(raw) {
    if (typeof raw !== "string" || raw === "") return raw;
    return raw.split(/[?#]/)[0];
  }

  function optedOut() {
    var n = w.navigator || {};
    if (n.globalPrivacyControl === true) return true;
    // Each signal counts on its own: a "0" in one place must not hide a "1"
    // in another (a || chain would stop at the first non-empty value).
    var signals = [w.doNotTrack, n.doNotTrack, n.msDoNotTrack];
    for (var i = 0; i < signals.length; i++) {
      var dnt = signals[i];
      if (dnt === 1 || dnt === "1" || dnt === "yes") return true;
    }
    return false;
  }

  w.umamiBeforeSend = function (type, payload) {
    if (optedOut() || !payload) return null;
    var out = {};
    for (var k in payload) {
      if (Object.prototype.hasOwnProperty.call(payload, k) && k !== "screen") {
        out[k] = payload[k];
      }
    }
    if ("url" in out) out.url = clean(out.url);
    if ("referrer" in out) out.referrer = stripQuery(out.referrer);
    return out;
  };
})(window);
