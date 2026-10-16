/* AgriNova account sync
 * ---------------------------------------------------------------------------
 * Makes the app behave like a real app: log in on ANY phone with the same email +
 * password and you get the same profile, notification choices, reminders, place...
 *
 *  - Settings live on the server (agri.user_settings). localStorage is only a cache.
 *  - Every request to the backend carries the Firebase login token, so the server
 *    knows it really is that farmer.
 *  - Only the keys that changed are sent, and a change made while offline is kept and
 *    sent later, so one phone never wipes out another phone's data.
 *
 * Add a new setting to sync: put its localStorage key in KEYS below AND in
 * SETTING_KEYS in hasura-handler.js. Nothing else to do.
 */
(function () {
  "use strict";

  var BACKEND = "https://disease-detector-e5du.onrender.com";
  var FB_CONFIG = {
    apiKey: "AIzaSyBfYF1nczkizmIP8sf7OQH8sjJj4N6eII4",
    authDomain: "editfarmer-e98f3.firebaseapp.com",
    projectId: "editfarmer-e98f3"
  };
  var FB_VERSION = "10.12.2";

  // localStorage keys that follow the farmer from phone to phone
  var KEYS = ["name", "dob", "age", "gender", "phone", "countryCode", "address", "farm", "soil", "crop",
    "irrigation", "profileImage", "agrinova_fert_reminder", "agrinova:notif", "agrinova:paused",
    "agrinova:place", "agrinova:email", "agrinova_lang"];
  // caches of server data; wiped when a different farmer logs in on this phone
  var CACHE_KEYS = ["agrinova_fert_history", "agriNovaHistory", "latestSoilReportId", "agrinovaSchemes"];

  var PENDING = "agrinova_sync_pending";   // changes not yet saved to the server
  var OWNER = "agrinova_sync_owner";       // whose data this phone currently holds
  var PULLED = "agrinova_pulled";          // sessionStorage: already synced in this tab session

  var ls = window.localStorage;
  var rawSet = Storage.prototype.setItem;
  var rawRemove = Storage.prototype.removeItem;
  var applying = false;
  var timer = null;

  function put(k, v) { rawSet.call(ls, k, v); }
  function del(k) { rawRemove.call(ls, k); }
  function cur() { return (ls.getItem("loggedInEmail") || "").trim().toLowerCase(); }
  function readPending() { try { return JSON.parse(ls.getItem(PENDING) || "{}") || {}; } catch (e) { return {}; } }
  function writePending(p) { if (Object.keys(p).length) put(PENDING, JSON.stringify(p)); else del(PENDING); }

  /* ---------- watch the synced keys ---------- */
  function queue(k, v) {
    if (!cur()) return;
    var p = readPending();
    p[k] = v;
    writePending(p);
    clearTimeout(timer);
    timer = setTimeout(flush, 700);
  }
  Storage.prototype.setItem = function (k, v) {
    rawSet.apply(this, arguments);
    if (this === ls && !applying && KEYS.indexOf(k) > -1) queue(k, String(v));
  };
  Storage.prototype.removeItem = function (k) {
    rawRemove.apply(this, arguments);
    if (this === ls && !applying && KEYS.indexOf(k) > -1) queue(k, null);
  };

  /* ---------- Firebase (loaded only if the page has not already) ---------- */
  var fbPromise = null, authPromise = null;
  function addScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }
  function loadFirebase() {
    if (fbPromise) return fbPromise;
    var base = "https://www.gstatic.com/firebasejs/" + FB_VERSION + "/";
    fbPromise = (window.firebase ? Promise.resolve() : addScript(base + "firebase-app-compat.js"))
      .then(function () { return window.firebase.auth ? null : addScript(base + "firebase-auth-compat.js"); })
      .then(function () {
        if (!window.firebase.apps.length) window.firebase.initializeApp(FB_CONFIG);
        return window.firebase;
      });
    return fbPromise;
  }
  // resolves with the signed-in Firebase user (or null) once Firebase has restored the session
  function authUser() {
    if (authPromise) return authPromise;
    authPromise = loadFirebase().then(function (fb) {
      return new Promise(function (res) {
        var done = false;
        var off = fb.auth().onAuthStateChanged(function (u) { if (!done) { done = true; off(); res(u); } });
        setTimeout(function () { if (!done) { done = true; res(fb.auth().currentUser); } }, 6000);
      });
    }).catch(function () { return null; });
    return authPromise;
  }
  function getToken() {
    return authUser().then(function (u) {
      var user = (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) || u;
      return user ? user.getIdToken() : null;
    }).catch(function () { return null; });
  }

  /* ---------- every call to our backend carries the login token ---------- */
  var rawFetch = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    if (url.indexOf(BACKEND) !== 0 || !cur()) return rawFetch.apply(this, arguments);
    var self = this, args = arguments;
    return getToken().then(function (tok) {
      if (!tok) return rawFetch.apply(self, args);
      var opts = Object.assign({}, init || {});
      var h = new Headers(opts.headers || (typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined));
      h.set("Authorization", "Bearer " + tok);
      opts.headers = h;
      return rawFetch.call(self, input, opts);
    });
  };

  function api(path, opts) {
    var email = cur();
    var url = BACKEND + path + (opts && opts.method === "POST" ? "" : "?owner=" + encodeURIComponent(email));
    if (opts && opts.method === "POST") opts.body = JSON.stringify(Object.assign({ owner: email }, opts.json));
    return window.fetch(url, opts && opts.method === "POST"
      ? { method: "POST", headers: { "Content-Type": "application/json" }, body: opts.body } : {});
  }

  /* ---------- save changes to the server ---------- */
  var flushing = false;
  function flush() {
    var email = cur();
    var p = readPending();
    var keys = Object.keys(p);
    if (!email || !keys.length || flushing || navigator.onLine === false) return Promise.resolve(false);
    flushing = true;
    return api("/api/user-settings", { method: "POST", json: { data: p } })
      .then(function (r) {
        if (!r.ok) return false;
        var now = readPending();                    // keep anything changed while we were sending
        keys.forEach(function (k) { if (now[k] === p[k]) delete now[k]; });
        writePending(now);
        return true;
      })
      .catch(function () { return false; })
      .then(function (ok) { flushing = false; return ok; });
  }

  /* ---------- bring the server's version onto this phone ---------- */
  // resolves true when something on this phone changed (the page should redraw)
  function pull() {
    var email = cur();
    if (!email) return Promise.resolve(false);
    return api("/api/user-settings").then(function (r) {
      if (r.status === 401) { var e = new Error("auth"); e.auth = true; throw e; }
      if (!r.ok) throw new Error("pull " + r.status);
      return r.json();
    }).then(function (j) {
      var server = j.data || {};
      var pend = readPending();
      var changed = false;
      applying = true;
      try {
        KEYS.forEach(function (k) {
          if (Object.prototype.hasOwnProperty.call(pend, k)) return;       // this phone's newer change wins
          var has = typeof server[k] === "string";
          if (has) {
            if (ls.getItem(k) !== server[k]) { put(k, server[k]); changed = true; }
          } else if (ls.getItem(k) !== null) {
            if (!j.exists) {                                                // brand-new account: upload what this phone has
              var up = readPending(); up[k] = ls.getItem(k); writePending(up);
            } else {                                                        // removed on another phone (or old leftover data)
              del(k); changed = true;
            }
          }
        });
        put(OWNER, email);
      } finally { applying = false; }
      if (Object.keys(readPending()).length) flush();
      return changed;
    });
  }

  /* ---------- page load: stay in sync automatically ---------- */
  function auto() {
    var email = cur();
    if (!email) return;
    if (sessionStorage.getItem(PULLED) === email) { flush(); return; }
    pull().then(function (changed) {
      sessionStorage.setItem(PULLED, email);
      if (changed) location.reload();            // redraw this page with the account's data
    }).catch(function (e) {
      if (e && e.auth && !/login\.html|index\.html|register|forgot|reset/.test(location.pathname)) {
        // login on this phone is no longer valid -> log in again (like a real app)
        clearLocal(); del("loggedInEmail"); location.href = "login.html";
      }
    });
  }
  window.addEventListener("online", function () { flush(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();

  /* ---------- login / logout ---------- */
  function clearLocal() {
    applying = true;
    try { KEYS.concat(CACHE_KEYS, [PENDING, OWNER]).forEach(del); } finally { applying = false; }
    sessionStorage.removeItem(PULLED);
  }

  // call right after a successful Firebase login, BEFORE redirecting
  function onLogin(email) {
    email = String(email || "").trim().toLowerCase();
    var prev = ls.getItem(OWNER);
    if (prev && prev !== email) clearLocal();             // different farmer on a shared phone
    put("loggedInEmail", email);
    sessionStorage.removeItem(PULLED);
    return pull().then(function () { sessionStorage.setItem(PULLED, email); }).catch(function () {});
  }

  function logout() {
    var wait = Promise.race([flush(), new Promise(function (r) { setTimeout(r, 2500); })]);
    return wait.then(function () {
      var fb = window.firebase && window.firebase.auth ? window.firebase.auth() : null;
      return fb && fb.currentUser ? fb.signOut().catch(function () {}) : null;
    }).then(function () {
      clearLocal();
      del("loggedInEmail");
    });
  }

  // real password reset: Firebase emails a link and changes the password for ALL phones
  function resetPassword(email) {
    return loadFirebase().then(function (fb) { return fb.auth().sendPasswordResetEmail(String(email).trim()); });
  }

  /* ---------- one language for the whole app (English / Tamil) ----------
   * Saved in localStorage key "agrinova_lang", which is in KEYS, so it also follows the farmer
   * to every phone. Every module reads it on load and writes it when the farmer switches. */
  window.AgriLang = {
    get: function () { return ls.getItem("agrinova_lang") === "ta" ? "ta" : "en"; },
    set: function (l) {
      l = l === "ta" ? "ta" : "en";
      if (ls.getItem("agrinova_lang") !== l) ls.setItem("agrinova_lang", l);
    }
  };

  // GET one of this farmer's saved lists from the server (null when logged out / offline)
  function mine(path) {
    var email = cur();
    if (!email) return Promise.resolve(null);
    return window.fetch(BACKEND + path + "?owner=" + encodeURIComponent(email))
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  window.AgriSync = { onLogin: onLogin, logout: logout, pull: pull, flush: flush, resetPassword: resetPassword, getToken: getToken, lang: window.AgriLang, mine: mine };
})();
