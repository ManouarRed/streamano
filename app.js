(function(){
'use strict';

var API      = 'https://streamano.manouar.eu/api/tv/home';
var API_BASE = API.replace(/\/home(?:\?.*)?$/,'');
var DEVICE_ID_KEY = 'streamano_device_id_v3';
var PLAYER_CHOICE_KEY = 'streamano_player_choice_v1';
var PLAYER_REMEMBER_KEY = 'streamano_player_choice_remember_v1';
var JWPLAYER_LIBRARY_URL = '';
var JWPLAYER_LICENSE_KEY = '';

function getDeviceId(){
  try{
    var s = localStorage.getItem(DEVICE_ID_KEY);
    if(s) return s;
    var c = 'tv-' + Math.random().toString(36).slice(2,10);
    localStorage.setItem(DEVICE_ID_KEY, c);
    return c;
  }catch(e){ return 'tv-guest'; }
}
var DEVICE_ID = getDeviceId();

function fitAppToScreen(){
  var app = document.getElementById('app');
  if(!app) return;
  var w = window.innerWidth || 1280;
  var h = window.innerHeight || 720;
  var scale = Math.min(w/1280, h/720);
  if(!scale || scale < 0.1) scale = 1;
  var left = Math.max(0,(w-1280*scale)/2);
  var top  = Math.max(0,(h-720*scale)/2);
  app.style.webkitTransformOrigin = '0 0';
  app.style.transformOrigin = '0 0';
  app.style.webkitTransform = 'scale('+scale+')';
  app.style.transform = 'scale('+scale+')';
  app.style.left = left+'px';
  app.style.top  = top+'px';
}
fitAppToScreen();
window.addEventListener('resize', fitAppToScreen, false);

var KEY = {
  OK:13, BACK:461, ESC:27,
  LEFT:37, UP:38, RIGHT:39, DOWN:40,
  PLAY:415, PAUSE:19, STOP:413,
  REW:412, FF:417,
  RED:403, GREEN:404, YELLOW:405, BLUE:406
};

var ICONS = {
  film:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="2" y1="17" x2="7" y2="17"/></svg>',
  tv:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>',
  live:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49"/><path d="M7.76 7.76a6 6 0 0 0 0 8.49"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>',
  grid:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  star:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  starFill:'<svg width="14" height="14" viewBox="0 0 24 24" fill="#ffd85a" stroke="#ffd85a" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  play:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>',
  plus:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  check:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  info:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  rew:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="19,20 9,12 19,4"/><line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
  ff:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,4 15,12 5,20"/><line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
  gear:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  search:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
};

var MENU = [
  {id:'home',      label:'Home',     icon:ICONS.grid},
  {id:'movies',    label:'Movies',   icon:ICONS.film},
  {id:'series',    label:'Series',   icon:ICONS.tv},
  {id:'tv',        label:'TV',       icon:ICONS.live},
  {id:'favorites', label:'My List',  icon:ICONS.star}
];

var LIVE_CATS = ['All','News','Sports','Movies','Kids','Entertainment'];

var state = {
  allRows:[], rows:[], cat:'home',
  menu:0, sidebar:true,
  row:0, col:0,
  heroFocused:false, heroAction:0,
  detail:false, item:null,
  detailMode:'default',
  detailFocus:'actions', detailAction:0,
  similar:[], similarIndex:0,
  seriesNav:null,
  player:false,
  live:false,
  liveItems:[], liveCatIndex:0, liveItemIndex:0,
  liveFocus:'channels',
  liveSelectedItem:null
};

var favs = {};
function isFav(item){ return !!favs[item._id]; }
function toggleFav(item){
  if(favs[item._id]) delete favs[item._id];
  else favs[item._id] = true;
}

function $(id){ return document.getElementById(id); }
var el = {
  rows:         $('rows'),
  hero:         $('hero'),
  heroBgA:      $('heroBgA'),
  heroBgB:      $('heroBgB'),
  heroTitle:    $('heroTitle'),
  heroMeta:     $('heroMeta'),
  heroDesc:     $('heroDesc'),
  heroBadge:    $('heroBadge'),
  heroActions:  $('heroActions'),
  hBtnPlay:     $('hBtnPlay'),
  hBtnList:     $('hBtnList'),
  hBtnInfo:     $('hBtnInfo'),
  detail:       $('detail'),
  detailBg:     $('detailBg'),
  detailBadge:  $('detailBadge'),
  detailTitle:  $('detailTitle'),
  detailMeta:   $('detailMeta'),
  detailDesc:   $('detailDesc'),
  detailActions:$('detailActions'),
  detailHint:   $('detailHint'),
  similarStrip: $('similarStrip'),
  similarTitle: $('similarTitle'),
  player:       $('player'),
  shakaUiContainer:$('shakaUiContainer'),
  video:        $('video'),
  playerUi:     $('playerUi'),
  playerTitle:  $('playerTitle'),
  playerTopTitle:$('playerTopTitle'),
  playerTime:   $('playerTime'),
  playerMsg:    $('playerMsg'),
  playerCenter: $('playerCenter'),
  playerLiveBadge:$('playerLiveBadge'),
  playerControls:$('playerControls'),
  progressBar:  $('playerProgressBar'),
  progressBuf:  $('playerProgressBuffered'),
  progressThumb:$('playerProgressThumb'),
  playerSettings:$('playerSettings'),
  settingsList: $('settingsList'),
  playerPicker:$('playerPicker'),
  playerPickerRemember:$('playerPickerRemember'),
  exitOverlay:  $('exitOverlay'),
  sidebar:      $('sidebar'),
  menuEl:       $('menu')
};

/* ── Helpers ── */
function txt(v){ return (v===undefined||v===null)?'':String(v); }
function first(obj,keys){
  obj=obj||{};
  for(var i=0;i<keys.length;i++){
    var v=obj[keys[i]];
    if(v!==undefined&&v!==null&&txt(v).trim()!=='') return txt(v);
  }
  return '';
}
function arr(v){ return Object.prototype.toString.call(v)==='[object Array]'?v:[]; }
function imageOf(i){ return first(i,['poster','poster_url','posterUrl','image','image_url','imageUrl','thumbnail','thumbnail_url','thumb','cover','coverUrl','backdrop','backdrop_url','backdropUrl','stream_icon','logo','icon','still_path','profile_path']); }
function normalizeUrlProtocol(url){
  url = txt(url).trim();
  if(!url) return '';
  if(url.indexOf('//')===0){
    var p = (window.location && window.location.protocol) ? window.location.protocol : 'https:';
    return p + url;
  }
  if(window.location && window.location.protocol==='https:' && url.indexOf('http://')===0){
    return 'https://' + url.slice(7);
  }
  return url;
}
function stripIptvHeaders(url){
  url = txt(url);
  if(!url) return '';
  var cut = url.indexOf('|');
  return cut>0 ? url.slice(0,cut) : url;
}
function splitAndCleanGenres(g){
  var inList = arr(g).length ? g : txt(g).split(',');
  var out = [];
  var seen = {};
  for(var i=0;i<inList.length;i++){
    var x = txt(inList[i]).trim();
    if(!x) continue;
    x = x.replace(/\s+/g,' ');
    var key = x.toLowerCase();
    if(seen[key]) continue;
    seen[key] = true;
    out.push(x);
  }
  return out;
}
function genresFromMeta(meta){
  meta = txt(meta);
  if(!meta) return [];
  var parts = meta.split('•');
  var out = [];
  for(var i=0;i<parts.length;i++){
    var p = txt(parts[i]).trim();
    if(!p) continue;
    if(/^\d{4}$/.test(p)) continue;
    if(/^\d+(\.\d+)?$/.test(p)) continue;
    if(/^(movie|series|tv|live|video|episode|season)$/i.test(p)) continue;
    if(/^\d+\s*(m|min|mins|h|hr|hrs)$/i.test(p)) continue;
    if(p.indexOf(',')>=0) out = out.concat(splitAndCleanGenres(p));
  }
  return out;
}
function isLikelyHls(url){
  return /\.m3u8(?:$|\?)/i.test(txt(url));
}
function proxyStreamUrl(url){
  if(!url) return '';
  return API_BASE + '/stream?url=' + encodeURIComponent(url);
}
function proxyImageUrl(url){
  if(!url) return '';
  return API_BASE + '/image?url=' + encodeURIComponent(url);
}

function tmdbSizedUrl(url,size){
  url=txt(url); if(!url) return '';
  return url.replace(/\/t\/p\/(?:original|w\d+)\//,'/t/p/'+size+'/');
}
function imageSized(url,kind){
  url=normalizeUrlProtocol(url); if(!url) return '';
  var size='w342';
  if(kind==='hero'||kind==='backdrop'||kind==='detail') size='w780';
  if(kind==='live'||kind==='logo') size='w185';
  if(kind==='poster') size='w342';
  if(kind==='continue') size='w500';
  if(url.indexOf('/api/tv/image?')>=0&&url.indexOf('url=')>=0){
    try{
      var q=url.split('?')[1]||'';
      var parts=q.split('&');
      for(var i=0;i<parts.length;i++){
        var eq=parts[i].indexOf('=');
        if(eq>0&&parts[i].slice(0,eq)==='url'){
          var decoded=decodeURIComponent(parts[i].slice(eq+1));
          decoded = normalizeUrlProtocol(decoded);
          if(decoded.indexOf('image.tmdb.org/t/p/')>=0) return tmdbSizedUrl(decoded,size);
          return decoded;
        }
      }
    }catch(e){}
  }
  if(url.indexOf('image.tmdb.org/t/p/')>=0) return tmdbSizedUrl(url,size);
  return url;
}

function streamOf(i){ return first(i,['stream','stream_url','streamUrl','video','video_url','videoUrl','url','play_url','playUrl','playback_url','playbackUrl','hls','m3u8','mp4','src','source','direct_source']); }
function titleOf(i){ return first(i,['title','name','label','original_title','originalTitle','stream_display_name','epg_channel_id'])||'Untitled'; }
function typeOf(i){ return first(i,['type','media_type','mediaType','kind','category','stream_type','category_name'])||'video'; }
function genreOf(i){
  var gs = genresOfItem(i);
  return gs.length ? gs[0] : '';
}
function genresOfItem(i){
  i = i || {};
  var out = [];
  out = out.concat(splitAndCleanGenres(i.genres || i.genre));
  if(!out.length) out = out.concat(genresFromMeta(metaOf(i)));
  if(!out.length) out = out.concat(splitAndCleanGenres(first(i,['category_name','category','group','group_title'])));
  return splitAndCleanGenres(out);
}
function descOf(i){ return first(i,['overview','description','desc','plot','summary','synopsis','content','body']); }
function metaOf(i){
  var out=[];
  var t=typeOf(i),y=first(i,['year','release_year','releaseYear','releaseDate','first_air_date','release_date']);
  var d=first(i,['duration','runtime']);
  var g=first(i,['genre','genres']);
  var r=first(i,['rating','vote_average','rating_5based']);
  if(t) out.push(t);
  if(y) out.push(y);
  if(d) out.push(d);
  if(g) out.push(arr(g).length?g.join(', '):g);
  if(r&&out.join(' ').indexOf(r)<0) out.push(r);
  return out.join(' \u2022 ');
}

function normalizeItem(raw){
  var it=raw||{};
  it._id    = first(it,['id','_id','tmdb_id','imdb_id','slug','stream_id','num','url','stream_url','streamUrl','playUrl','play_url','title','name'])||(Math.random().toString(36).slice(2));
  it._realId= first(it,['real_id','realId','series_id','seriesId']);
  it._title = titleOf(it);
  it._image = imageOf(it);
  it._type  = typeOf(it);
  it._genres= genresOfItem(it);
  it._genre = it._genres.length ? it._genres[0] : '';
  it._urlRaw= normalizeUrlProtocol(streamOf(it));
  it._url   = normalizeUrlProtocol(stripIptvHeaders(it._urlRaw));
  it._desc  = descOf(it);
  it._meta  = metaOf(it);
  return it;
}

function apiGet(path,onOk,onFail){
  var xhr=new XMLHttpRequest();
  xhr.open('GET',API_BASE+path,true);
  xhr.timeout=12000;
  xhr.setRequestHeader('Accept','application/json');
  xhr.onreadystatechange=function(){
    if(xhr.readyState!==4) return;
    if(xhr.status<200||xhr.status>=300){ if(onFail) onFail('HTTP '+xhr.status); return; }
    try{ onOk(JSON.parse(xhr.responseText)); }catch(e){ if(onFail) onFail('parse'); }
  };
  xhr.ontimeout=function(){ if(onFail) onFail('timeout'); };
  xhr.onerror=function(){ if(onFail) onFail('network'); };
  xhr.send();
}
function apiPost(path,payload,onOk,onFail){
  var xhr=new XMLHttpRequest();
  xhr.open('POST',API_BASE+path,true);
  xhr.timeout=12000;
  xhr.setRequestHeader('Accept','application/json');
  xhr.setRequestHeader('Content-Type','application/json');
  xhr.onreadystatechange=function(){
    if(xhr.readyState!==4) return;
    if(xhr.status<200||xhr.status>=300){ if(onFail) onFail('HTTP '+xhr.status); return; }
    try{ onOk&&onOk(JSON.parse(xhr.responseText)); }catch(e){ onOk&&onOk({}); }
  };
  xhr.ontimeout=function(){ if(onFail) onFail('timeout'); };
  xhr.onerror=function(){ if(onFail) onFail('network'); };
  xhr.send(JSON.stringify(payload||{}));
}

function realSeriesIdOf(item){
  var n=parseInt(first(item,['real_id','realId','series_id','seriesId','id','_id']),10);
  if(!isFinite(n)) return null;
  return n>=100000?(n-100000):n;
}
function firstStreamUrl(streams){
  streams=arr(streams);
  for(var i=0;i<streams.length;i++){
    var s=streams[i]||{};
    if((s.is_active===undefined||s.is_active)&&s.url) return txt(s.url);
  }
  return '';
}

function addRow(name,list){
  list=arr(list); if(!list.length) return;
  var clean=[];
  for(var i=0;i<list.length&&clean.length<120;i++){
    var it=normalizeItem(list[i]); if(it) clean.push(it);
  }
  if(clean.length) state.allRows.push({title:name||'Section',items:clean});
}
function normalizeHome(data){
  state.allRows=[];
  if(arr(data).length){ addRow('Items',data); return; }
  data=data||{};
  addRow('Featured',data.hero?[data.hero]:[]);
  var direct=[
    ['Continue Watching','continue_watching'],
    ['Trending Movies','trending_movies'],
    ['Popular Series','popular_series'],
    ['Live TV','live_tv'],
    ['Recently Added','recently_added'],
    ['Movies','movies'],
    ['Series','series'],
    ['Channels','channels'],
    ['Videos','videos'],
    ['Streams','streams'],
    ['Items','items']
  ];
  for(var i=0;i<direct.length;i++) addRow(direct[i][0],data[direct[i][1]]);
  var sections=arr(data.sections);
  for(var s=0;s<sections.length;s++){
    var sec=sections[s]||{};
    addRow(first(sec,['title','name','label','category_name'])||'Section',sec.items||sec.data||sec.videos||sec.movies||sec.series||sec.channels||sec.streams);
  }
  var rows=arr(data.rows||data.categories||data.data||data.result);
  for(var r=0;r<rows.length;r++){
    var row=rows[r]||{};
    addRow(first(row,['title','name','label','category_name'])||'Section',row.items||row.data||row.videos||row.movies||row.series||row.channels||row.streams);
  }
}

function allNormalizedItems(){
  var out=[],seen={};
  for(var r=0;r<state.allRows.length;r++){
    var items=state.allRows[r].items||[];
    for(var i=0;i<items.length;i++){
      var it=items[i];
      if(it&&!seen[it._id]){ seen[it._id]=true; out.push(it); }
    }
  }
  return out;
}

function dedupeItems(list){
  list = arr(list);
  var out = [];
  var seen = {};
  for(var i=0;i<list.length;i++){
    var it = list[i];
    if(!it || !it._id || seen[it._id]) continue;
    seen[it._id] = true;
    out.push(it);
  }
  return out;
}

function findRowsByTitle(parts){
  var out = [];
  parts = arr(parts);
  for(var r=0;r<state.allRows.length;r++){
    var row = state.allRows[r] || {};
    var t = txt(row.title).toLowerCase();
    for(var p=0;p<parts.length;p++){
      if(t.indexOf(txt(parts[p]).toLowerCase())>=0){
        out.push(row);
        break;
      }
    }
  }
  return out;
}

function buildGenreRowsFromMovies(maxGenres){
  var movies = [];
  var items = allNormalizedItems();
  for(var i=0;i<items.length;i++) if(catMatch(items[i],'movies')) movies.push(items[i]);
  var groups = {};
  var order = [];
  for(var m=0;m<movies.length;m++){
    var gs = arr(movies[m]._genres);
    if(!gs.length && movies[m]._genre) gs = [movies[m]._genre];
    for(var gi=0;gi<gs.length;gi++){
      var g = txt(gs[gi]).trim();
      if(!g) continue;
      if(!groups[g]){ groups[g] = []; order.push(g); }
      groups[g].push(movies[m]);
    }
  }
  var rows = [];
  var max = maxGenres || 12;
  for(var j=0;j<order.length && rows.length<max;j++){
    var name = order[j];
    var list = dedupeItems(groups[name]).slice(0,24);
    if(list.length) rows.push({title:'Genre: '+name, items:list});
  }
  return rows;
}

function buildHomeRows(){
  var out = [];

  var continueRows = findRowsByTitle(['continue watching','watch history']);
  if(continueRows.length && arr(continueRows[0].items).length){
    out.push({title:'Continue Watching', items:dedupeItems(continueRows[0].items).slice(0,20)});
  }

  var topWatchRows = findRowsByTitle(['top watch','trending','popular','top','featured']);
  var topPool = [];
  for(var t=0;t<topWatchRows.length;t++){
    topPool = topPool.concat(arr(topWatchRows[t].items));
  }
  topPool = dedupeItems(topPool);
  if(topPool.length) out.push({title:'Top Watch', items:topPool.slice(0,24)});

  var genres = buildGenreRowsFromMovies(16);
  for(var g=0;g<genres.length;g++) out.push(genres[g]);

  for(var r=0;r<state.allRows.length && out.length<12;r++){
    var row = state.allRows[r] || {};
    var title = txt(row.title);
    var t = title.toLowerCase();
    if(!arr(row.items).length) continue;
    if(t.indexOf('continue')>=0 || t.indexOf('watch history')>=0) continue;
    if(t.indexOf('top watch')>=0 || t.indexOf('trending')>=0 || t.indexOf('popular')>=0) continue;
    out.push({title:title||'Section',items:dedupeItems(arr(row.items)).slice(0,24)});
  }

  if(!out.length){
    out.push({title:'Top Watch',items:allNormalizedItems().slice(0,24)});
  }
  return out;
}

function buildMovieRows(){
  var out = [];
  var allMovieItems = [];
  var all = allNormalizedItems();
  for(var ai=0;ai<all.length;ai++) if(catMatch(all[ai],'movies')) allMovieItems.push(all[ai]);
  allMovieItems = dedupeItems(allMovieItems);

  var continueRows = findRowsByTitle(['continue watching','watch history']);
  if(continueRows.length){
    var cw = [];
    var raw = arr(continueRows[0].items);
    for(var i=0;i<raw.length;i++) if(catMatch(raw[i],'movies')) cw.push(raw[i]);
    cw = dedupeItems(cw);
    if(cw.length) out.push({title:'Continue Watching', items:cw.slice(0,20)});
  }

  var topRows = findRowsByTitle(['top watch','trending','popular']);
  var top = [];
  for(var t=0;t<topRows.length;t++){
    top = top.concat(arr(topRows[t].items));
  }
  var onlyMovies = [];
  top = dedupeItems(top);
  for(var j=0;j<top.length;j++) if(catMatch(top[j],'movies')) onlyMovies.push(top[j]);
  if(onlyMovies.length) out.push({title:'Top Watch', items:onlyMovies.slice(0,24)});

  var genres = buildGenreRowsFromMovies(20);
  for(var g=0;g<genres.length;g++) out.push(genres[g]);

  if(out.length < 8 && allMovieItems.length){
    var chunk = 24;
    var idx = 0;
    var n = 1;
    while(out.length < 10 && idx < allMovieItems.length){
      out.push({title:'More Movies '+n, items:allMovieItems.slice(idx, idx + chunk)});
      idx += chunk;
      n++;
    }
  }

  return out;
}

function liveGroupOf(item){
  var g=first(item,['group','group_title','groupTitle','category','category_name','categoryName','genre','genres','country','bouquet','tv_category','channel_group','playlist_group']);
  if(arr(g).length) g=g[0];
  g=txt(g).replace(/^live\s*tv$/i,'').replace(/^channels$/i,'').trim();
  if(g) return g;
  var name=titleOf(item).trim();
  var fc=name?name.charAt(0).toUpperCase():'#';
  if(fc>='A'&&fc<='F') return 'A - F';
  if(fc>='G'&&fc<='L') return 'G - L';
  if(fc>='M'&&fc<='R') return 'M - R';
  if(fc>='S'&&fc<='Z') return 'S - Z';
  return '0 - 9';
}

function catMatch(item,cat){
  var t=txt(item._type).toLowerCase();
  var m=txt(item._title).toLowerCase()+' '+t;
  if(cat==='tv' || cat==='live') return t.indexOf('live')>=0||t.indexOf('channel')>=0||m.indexOf('live')>=0||m.indexOf('channel')>=0;
  if(cat==='series')   return t.indexOf('series')>=0||t.indexOf('tv')>=0||m.indexOf('series')>=0;
  if(cat==='movies')   return !(catMatch(item,'live')||catMatch(item,'series'));
  if(cat==='favorites') return isFav(item);
  if(cat==='home') return true;
  return true;
}

function applyCategory(cat){
  state.cat=cat;
  state.rows=[];
  var allItems=allNormalizedItems();
  var live=[];
  for(var i=0;i<allItems.length;i++) if(catMatch(allItems[i],'live')) live.push(allItems[i]);
  state.liveItems=live;

  if(cat==='tv' || cat==='live') return;
  if(cat==='home'){
    state.rows = buildHomeRows();
    return;
  }
  if(cat==='movies'){
    state.rows = buildMovieRows();
    return;
  }

  for(var r=0;r<state.allRows.length;r++){
    var row=state.allRows[r];
    var items=[];
    for(var ii=0;ii<row.items.length;ii++){
      if(catMatch(row.items[ii],cat)) items.push(row.items[ii]);
    }
    if(items.length>0) state.rows.push({title:txt(row.title),items:items});
  }
}

/* ── Hero crossfade ── */
var heroBgActive = 'A';
var heroBgPending = null;
function updateHeroFromItem(item){
  if(!item) return;
  var url = item._image ? imageSized(item._image,'hero') : '';
  var next = heroBgActive==='A' ? el.heroBgB : el.heroBgA;
  var curr = heroBgActive==='A' ? el.heroBgA : el.heroBgB;
  if(url) next.style.backgroundImage='url("'+url+'")';
  else    next.style.backgroundImage='';
  next.classList.remove('inactive');
  next.classList.add('active');
  curr.classList.remove('active');
  curr.classList.add('inactive');
  heroBgActive = heroBgActive==='A'?'B':'A';

  el.heroTitle.textContent = item._title;
  el.heroMeta.textContent  = item._meta || item._type;
  el.heroDesc.textContent  = item._desc || '';
}

/* ── Sidebar ── */
function renderMenu(){
  el.menuEl.innerHTML='';
  for(var i=0;i<MENU.length;i++){
    var m=MENU[i];
    var active=(m.id===state.cat);
    var focus=(state.sidebar&&state.menu===i);
    var div=document.createElement('div');
    div.className='menuItem'+(active?' active':'')+(focus?' focus':'');
    div.innerHTML='<span class="menu-icon">'+m.icon+'</span><span class="menu-label">'+m.label+'</span>';
    el.menuEl.appendChild(div);
  }
}
function openSidebar(){
  state.sidebar=true;
  state.heroFocused=false;
  el.sidebar.classList.add('open');
  document.body.classList.add('sb-open');
  updateHeroFocus();
  renderMenu();
}
function closeSidebar(){
  state.sidebar=false;
  el.sidebar.classList.remove('open');
  document.body.classList.remove('sb-open');
  renderMenu();
}

/* ── Hero focus ── */
var heroBtns;
function getHeroBtns(){ return [el.hBtnPlay, el.hBtnList, el.hBtnInfo]; }
function updateHeroFocus(){
  var btns=getHeroBtns();
  for(var i=0;i<btns.length;i++){
    if(state.heroFocused&&i===state.heroAction) btns[i].classList.add('focus');
    else btns[i].classList.remove('focus');
  }
}

/* ── Live TV Screen ── */
var liveScreen=null;
function buildLiveScreen(){
  if(liveScreen){ liveScreen.parentNode.removeChild(liveScreen); liveScreen=null; }
  var div=document.createElement('div');
  div.id='liveScreen';
  div.innerHTML=
    '<div id="liveSidebar">'+
      '<div id="liveCatTabs"></div>'+
      '<div id="liveChannelList">'+
        '<div id="liveChannelViewport">'+
          '<div id="liveChannelInner"></div>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div id="livePreview">'+
      '<div id="livePreviewBg"></div>'+
      '<div id="livePreviewInfo">'+
        '<div id="livePreviewTitle"></div>'+
        '<div id="livePreviewMeta"></div>'+
        '<div id="livePlayBtn">'+ICONS.play+' Play</div>'+
      '</div>'+
      '<div id="liveHint">LEFT sidebar &bull; RIGHT channels &bull; OK play</div>'+
    '</div>';
  document.getElementById('app').appendChild(div);
  liveScreen=div;
  renderLiveCats();
  renderLiveChannels();
  updateLiveFocus();
}
function getLiveCatItems(){
  var cat=LIVE_CATS[state.liveCatIndex];
  if(cat==='All') return state.liveItems;
  var out=[];
  for(var i=0;i<state.liveItems.length;i++){
    var it=state.liveItems[i];
    var g=liveGroupOf(it).toLowerCase();
    var c=cat.toLowerCase();
    if(g.indexOf(c)>=0||txt(it._genre).toLowerCase().indexOf(c)>=0) out.push(it);
  }
  return out.length?out:state.liveItems;
}
function renderLiveCats(){
  var tabs=document.getElementById('liveCatTabs');
  if(!tabs) return;
  tabs.innerHTML='';
  for(var i=0;i<LIVE_CATS.length;i++){
    var d=document.createElement('div');
    d.className='liveCatTab'+(i===state.liveCatIndex?' active':'')+(state.liveFocus==='cats'&&i===state.liveCatIndex?' focus':'');
    d.textContent=LIVE_CATS[i];
    tabs.appendChild(d);
  }
}
var liveVisibleItems=[];
function renderLiveChannels(){
  var inner=document.getElementById('liveChannelInner');
  if(!inner) return;
  liveVisibleItems=getLiveCatItems();
  if(state.liveItemIndex>=liveVisibleItems.length) state.liveItemIndex=0;
  inner.innerHTML='';
  for(var i=0;i<liveVisibleItems.length;i++){
    var it=liveVisibleItems[i];
    var d=document.createElement('div');
    d.className='liveChannelRow'+(i===state.liveItemIndex?' focus':'');
    var logoUrl=it._image?imageSized(it._image,'live'):'';
    d.innerHTML=
      '<div class="lch-logo" style="'+(logoUrl?'background-image:url(\"'+logoUrl+'\");':'')+'"></div>'+
      '<div class="lch-info">'+
        '<div class="lch-name">'+it._title+'</div>'+
        '<div class="lch-group">'+liveGroupOf(it)+'</div>'+
      '</div>';
    inner.appendChild(d);
  }
  scrollLiveList();
  updateLivePreview();
}
function scrollLiveList(){
  var inner=document.getElementById('liveChannelInner');
  if(!inner) return;
  var rowH=72;
  var viewH=document.getElementById('liveChannelViewport')?document.getElementById('liveChannelViewport').offsetHeight:500;
  var offset=Math.max(0,state.liveItemIndex*rowH - viewH/2 + rowH/2);
  inner.style.webkitTransform='translateY(-'+offset+'px)';
  inner.style.transform='translateY(-'+offset+'px)';
}
function updateLivePreview(){
  var item=liveVisibleItems[state.liveItemIndex];
  if(!item) return;
  state.liveSelectedItem=item;
  var bg=document.getElementById('livePreviewBg');
  var ti=document.getElementById('livePreviewTitle');
  var me=document.getElementById('livePreviewMeta');
  if(bg) bg.style.backgroundImage=item._image?'url("'+imageSized(item._image,'hero')+'")':'';
  if(ti) ti.textContent=item._title;
  if(me) me.textContent=item._meta||item._type;
}
function updateLiveFocus(){
  renderLiveCats();
  var rows=document.querySelectorAll('#liveChannelInner .liveChannelRow');
  for(var i=0;i<rows.length;i++){
    if(state.liveFocus==='channels'&&i===state.liveItemIndex) rows[i].classList.add('focus');
    else rows[i].classList.remove('focus');
  }
  var pb=document.getElementById('livePlayBtn');
  if(pb){
    if(state.liveFocus==='play') pb.classList.add('focus');
    else pb.classList.remove('focus');
  }
}
function openLiveScreen(){
  state.live=true;
  state.liveFocus='channels';
  state.liveItemIndex=0;
  buildLiveScreen();
}
function closeLiveScreen(){
  state.live=false;
  if(liveScreen){ liveScreen.parentNode.removeChild(liveScreen); liveScreen=null; }
}

/* ── Row rendering ── */
function renderRows(){
  el.rows.innerHTML='';
  if(!state.rows.length){
    el.rows.innerHTML='<div class="error dim">No items found</div>';
    return;
  }
  for(var r=0;r<state.rows.length;r++){
    var rowData=state.rows[r];
    var rowTitle=txt(rowData.title).toLowerCase();
    var isContinue=rowTitle.indexOf('continue')!==-1;

    var rowEl=document.createElement('div');
    rowEl.className='row'+(isContinue?' continue':'');

    var titleDiv=document.createElement('div');
    titleDiv.className='rowTitle';
    titleDiv.textContent=txt(rowData.title);

    var strip=document.createElement('div');
    strip.className='strip';

    for(var c=0;c<rowData.items.length;c++){
      var it=rowData.items[c];
      strip.appendChild(buildCard(it,isContinue,r===state.row&&c===state.col));
    }
    rowEl.appendChild(titleDiv);
    rowEl.appendChild(strip);
    el.rows.appendChild(rowEl);
  }
  scrollRowsTo(state.row,true);
  scrollStrip(state.row,state.col,true);
  hydrateNearbyRows(state.row);
}

function buildCard(it,isContinue,focused){
  var card=document.createElement('div');
  card.className='card'+(isContinue?' is-continue':'')+(focused?' focus':'');

  var poster=document.createElement('div');
  poster.className='poster';
  poster.style.backgroundImage='none';
  if(it._image){
    poster.dataset.bg=imageSized(it._image,isContinue?'continue':'poster');
  }

  var placeholder=document.createElement('div');
  placeholder.className='poster-placeholder';
  placeholder.innerHTML='<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="9" y1="2" x2="9" y2="22"/><line x1="15" y1="2" x2="15" y2="22"/></svg>';
  poster.appendChild(placeholder);

  var grad=document.createElement('div');
  grad.className='card-grad';

  var titleSpan=document.createElement('div');
  titleSpan.className='cardTitle';
  titleSpan.textContent=it._title;

  var badge=document.createElement('div');
  badge.className='badge';
  badge.textContent=it._genre||it._type||'';
  if(!badge.textContent) badge.style.display='none';

  var fav=document.createElement('div');
  fav.className='fav';
  fav.innerHTML=isFav(it)?ICONS.starFill:'';

  card.appendChild(poster);
  card.appendChild(grad);
  card.appendChild(titleSpan);
  card.appendChild(badge);
  card.appendChild(fav);

  if(isContinue){
    var pw=document.createElement('div');
    pw.className='progress-wrap';
    var pf=document.createElement('div');
    pf.className='progress-fill';
    pf.style.width=(it._progress?Math.min(100,it._progress)+'%':'35%');
    pw.appendChild(pf);
    var rl=document.createElement('div');
    rl.className='resume-label';
    rl.textContent='RESUME';
    card.appendChild(pw);
    card.appendChild(rl);
  }
  return card;
}

/* ── Focus ── */
function focusAt(r,c,silent){
  if(!state.rows.length) return;
  r=Math.max(0,Math.min(r,state.rows.length-1));
  c=Math.max(0,Math.min(c,(state.rows[r].items.length-1)||0));
  state.row=r; state.col=c;
  state.heroFocused=false;
  updateHeroFocus();
  closeSidebar();

  var allCards=el.rows.querySelectorAll('.card');
  var idx=0;
  for(var rr=0;rr<state.rows.length;rr++){
    for(var cc=0;cc<state.rows[rr].items.length;cc++){
      if(allCards[idx]){
        if(rr===state.row&&cc===state.col) allCards[idx].classList.add('focus');
        else allCards[idx].classList.remove('focus');
      }
      idx++;
    }
  }
  scrollRowsTo(r,false);
  scrollStrip(r,c,false);
  hydrateNearbyRows(r);
  var focused = el.rows.querySelector('.card.focus');
  if(focused && focused.scrollIntoView){
    try{ focused.scrollIntoView({block:'nearest', inline:'nearest'}); }catch(e){}
  }

  if(!silent){
    var item=state.rows[r]&&state.rows[r].items[c];
    if(item) updateHeroFromItem(item);
  }
}

var rowsYTarget=0;
function scrollRowsTo(r,instant){
  var rowEls=el.rows.querySelectorAll('.row');
  if(!rowEls[r]){ rowsYTarget=0; applyRowsY(); return; }
  var offset=rowEls[r].offsetTop||0;
  var target=Math.max(0,offset-36);
  rowsYTarget=target;
  applyRowsY();
}
function applyRowsY(){
  try{
    el.rows.scrollTop = rowsYTarget;
  }catch(e){}
}

function scrollStrip(r,c,instant){
  var rowEls=el.rows.querySelectorAll('.row');
  if(!rowEls[r]) return;
  var strip=rowEls[r].querySelector('.strip');
  if(!strip) return;
  var cards=strip.querySelectorAll('.card');
  if(!cards[c]){ strip.style.webkitTransform='translateX(0)'; strip.style.transform='translateX(0)'; return; }
  var cardLeft=cards[c].offsetLeft||0;
  var offset=Math.max(0,cardLeft-96);
  strip.style.webkitTransform='translateX(-'+offset+'px)';
  strip.style.transform='translateX(-'+offset+'px)';
}

function hydrateNearbyRows(r){
  var rowEls=el.rows.querySelectorAll('.row');
  for(var i=0;i<rowEls.length;i++){
    var close=Math.abs(i-r)<=2;
    if(!close) continue;
    var posters=rowEls[i].querySelectorAll('.poster');
    for(var p=0;p<posters.length;p++){
      var node=posters[p];
      if(!node.dataset||!node.dataset.bg||node.dataset.loaded==='1') continue;
      (function(n,u){
        var candidates = [];
        var direct = normalizeUrlProtocol(u);
        if(direct) candidates.push(direct);
        if(direct.indexOf('/api/tv/image?')>=0){
          try{
            var q=direct.split('?')[1]||'';
            var parts=q.split('&');
            for(var x=0;x<parts.length;x++){
              var eq=parts[x].indexOf('=');
              if(eq>0&&parts[x].slice(0,eq)==='url'){
                var decoded=normalizeUrlProtocol(decodeURIComponent(parts[x].slice(eq+1)));
                if(decoded && candidates.indexOf(decoded)<0) candidates.push(decoded);
                if(decoded && candidates.indexOf(proxyImageUrl(decoded))<0) candidates.push(proxyImageUrl(decoded));
                break;
              }
            }
          }catch(e){}
        } else if(direct && candidates.indexOf(proxyImageUrl(direct))<0){
          candidates.push(proxyImageUrl(direct));
        }
        var idxTry = 0;
        function markSuccess(src){
          n.dataset.loaded='1';
          n.style.backgroundImage='url("'+src+'")';
          var ph=n.querySelector('.poster-placeholder');
          if(ph) ph.style.display='none';
        }
        function tryNext(){
          if(idxTry>=candidates.length) return;
          var src = candidates[idxTry++];
          if(!src) return tryNext();
          var img=new Image();
          img.onload=function(){ markSuccess(src); };
          img.onerror=function(){ tryNext(); };
          img.src=src;
        }
        tryNext();
      })(node,node.dataset.bg);
    }
  }
}

/* ── Detail ── */
function showDetail(item){
  state.detail=true;
  state.item=item;
  state.detailFocus='actions';
  state.detailAction=0;

  el.detailBg.style.backgroundImage=item._image?'url("'+imageSized(item._image,'detail')+'")':'';
  el.detailBadge.textContent=item._genre||item._type||'';
  el.detailTitle.textContent=item._title;
  el.detailMeta.textContent=(item._meta?item._meta+' \u2022 ':'')+item._type;
  el.detailDesc.textContent=item._desc||'';

  el.detailActions.innerHTML=
    '<div class="detailBtn">'+ICONS.play+' Play</div>'+
    '<div class="detailBtn">'+(isFav(item)?ICONS.check+' In My List':ICONS.plus+' My List')+'</div>'+
    '<div class="detailBtn">'+ICONS.info+' Info</div>';

  state.similar=[];
  for(var r=0;r<state.rows.length;r++){
    for(var c=0;c<state.rows[r].items.length;c++){
      var it=state.rows[r].items[c];
      if(it._id!==item._id&&it._type===item._type) state.similar.push(it);
    }
  }
  state.similar=state.similar.slice(0,12);
  state.similarIndex=0;

  el.similarStrip.innerHTML='';
  el.similarStrip.style.webkitTransform='translateX(0)';
  el.similarStrip.style.transform='translateX(0)';

  if(state.similar.length){
    el.similarTitle.textContent='More Like This';
    for(var i=0;i<state.similar.length;i++){
      var s=state.similar[i];
      var d=document.createElement('div');
      d.className='similarCard';
      var p=document.createElement('div');
      p.className='similarPoster';
      if(s._image) p.style.backgroundImage='url("'+imageSized(s._image,'poster')+'")';
      var n=document.createElement('div');
      n.className='similarName';
      n.textContent=s._title;
      d.appendChild(p); d.appendChild(n);
      el.similarStrip.appendChild(d);
    }
  } else { el.similarTitle.textContent=''; }

  el.detailHint.textContent='BACK to return';
  el.detail.classList.remove('hidden');
  updateDetailFocus();
}

function closeDetail(){
  state.detail=false;
  state.detailMode='default';
  state.seriesNav=null;
  el.detail.classList.add('hidden');
}

function openSeriesNavigator(item){
  var seriesId=realSeriesIdOf(item);
  if(!seriesId){ showDetail(item); return; }

  state.detail=true; state.item=item;
  state.detailMode='series';
  state.seriesNav={seriesId:seriesId,level:'seasons',seasonNumber:null};
  state.detailFocus='similar'; state.similar=[]; state.similarIndex=0;

  el.detailBg.style.backgroundImage=item._image?'url("'+imageSized(item._image,'detail')+'")':'';
  el.detailBadge.textContent='Series';
  el.detailTitle.textContent=item._title;
  el.detailMeta.textContent=(item._meta?item._meta+' \u2022 ':'')+' Series';
  el.detailDesc.textContent='Loading seasons...';
  el.detailActions.innerHTML='<div class="detailBtn">'+ICONS.info+' Select a season</div>';
  el.similarTitle.textContent='Available Seasons';
  el.similarStrip.innerHTML='';
  el.detailHint.textContent='OK open season \u00b7 BACK return';
  el.detail.classList.remove('hidden');

  apiGet('/series/'+seriesId+'/seasons',function(data){
    var seasons=arr(data);
    state.seriesNav.level='seasons'; state.seriesNav.seasonNumber=null;
    state.similar=[];
    for(var i=0;i<seasons.length;i++){
      var s=seasons[i]||{};
      var si=normalizeItem({
        id:'season_'+seriesId+'_'+txt(s.season_number||(i+1)),
        title:s.title||('Season '+txt(s.season_number||(i+1))),
        type:'season', poster:s.poster||item._image,
        description:'Episodes: '+arr(s.episodes).length
      });
      si._seasonNumber=parseInt(s.season_number,10)||(i+1);
      si._episodeCount=arr(s.episodes).length;
      state.similar.push(si);
    }
    state.similarIndex=0;
    el.detailDesc.textContent=state.similar.length?'Select a season to list episodes.':'No seasons found.';
    renderSeriesNavCards();
  },function(){
    el.detailDesc.textContent='Failed to load seasons.';
    state.similar=[]; renderSeriesNavCards();
  });
}

function renderSeriesNavCards(){
  el.similarStrip.innerHTML='';
  el.similarStrip.style.webkitTransform='translateX(0)';
  el.similarStrip.style.transform='translateX(0)';
  for(var i=0;i<state.similar.length;i++){
    var it=state.similar[i];
    var d=document.createElement('div'); d.className='similarCard';
    var p=document.createElement('div'); p.className='similarPoster';
    if(it._image) p.style.backgroundImage='url("'+imageSized(it._image,'poster')+'")';
    var n=document.createElement('div'); n.className='similarName'; n.textContent=it._title;
    d.appendChild(p); d.appendChild(n);
    el.similarStrip.appendChild(d);
  }
  updateDetailFocus();
}

function loadSeasonEpisodes(seasonNumber){
  if(!state.seriesNav) return;
  var seriesId=state.seriesNav.seriesId;
  el.detailDesc.textContent='Loading episodes...';
  apiGet('/series/'+seriesId+'/season/'+seasonNumber,function(seasonData){
    var episodes=arr(seasonData&&seasonData.episodes);
    state.seriesNav.level='episodes'; state.seriesNav.seasonNumber=seasonNumber;
    state.similar=[];
    for(var i=0;i<episodes.length;i++){
      var ep=episodes[i]||{};
      var ei=normalizeItem({
        id:ep.id||('ep_'+seasonNumber+'_'+(i+1)),
        title:'E'+txt(ep.episode_number||(i+1))+' \u00b7 '+titleOf(ep),
        type:'episode', poster:ep.poster||state.item._image,
        description:ep.description||''
      });
      ei._episodeId=parseInt(ep.id,10)||0;
      ei._url=firstStreamUrl(ep.streams);
      state.similar.push(ei);
    }
    state.similarIndex=0;
    el.similarTitle.textContent='Season '+seasonNumber+' Episodes';
    el.detailDesc.textContent=state.similar.length?'Select an episode to play.':'No episodes found.';
    el.detailActions.innerHTML='<div class="detailBtn">'+ICONS.info+' OK to play</div>';
    el.detailHint.textContent='BACK to seasons';
    renderSeriesNavCards();
  },function(){
    el.detailDesc.textContent='Failed to load episodes.';
    state.similar=[]; renderSeriesNavCards();
  });
}

function playEpisodeFromNavigator(episodeItem){
  if(!episodeItem) return;
  if(episodeItem._url){ Player.open(episodeItem); return; }
  var episodeId=parseInt(episodeItem._episodeId,10);
  if(!episodeId){ el.detailDesc.textContent='No stream URL found.'; return; }
  el.detailDesc.textContent='Opening episode stream...';
  apiGet('/title/episode/'+episodeId+'/play',function(playData){
    var url=first(playData,['url','stream','stream_url','playUrl','play_url']);
    if(!url){ el.detailDesc.textContent='No stream URL found.'; return; }
    var playable=normalizeItem({id:episodeItem._id,title:episodeItem._title,type:'episode',stream:url});
    playable._url=url;
    Player.open(playable);
  },function(){ el.detailDesc.textContent='Failed to open episode.'; });
}

function renderDetailFav(){
  var b=el.detailActions.children[1];
  if(b) b.innerHTML=(isFav(state.item)?ICONS.check+' In My List':ICONS.plus+' My List');
}

function updateDetailFocus(){
  var bs=el.detailActions.children;
  for(var i=0;i<bs.length;i++){
    if(state.detailFocus==='actions'&&i===state.detailAction) bs[i].classList.add('focus');
    else bs[i].classList.remove('focus');
  }
  var sc=el.similarStrip.children;
  for(var j=0;j<sc.length;j++){
    if(state.detailFocus==='similar'&&j===state.similarIndex) sc[j].classList.add('focus');
    else sc[j].classList.remove('focus');
  }
  if(state.detailFocus==='similar'&&state.similar.length){
    var offset=Math.max(0,state.similarIndex*148-160);
    el.similarStrip.style.webkitTransform='translateX(-'+offset+'px)';
    el.similarStrip.style.transform='translateX(-'+offset+'px)';
  }
}

/* ── Player ── */
var Player={
  uiTimer:null, currentItem:null, backPressCount:0, backResetTimer:null,
  lastProgressSentAt:0, lastProgressSentPosition:0,
  engine:'videojs',
  rememberChoice:false,
  pickerOpen:false,
  pickerFocus:'card',
  pickerIndex:0,
  pickerAction:0,
  pendingItem:null,
  videojsPlayer:null,
  jwPlayerInstance:null,
  shakaPlayer:null,
  shakaUi:null,
  shakaControls:null,
  shakaFilterBound:false,
  shakaTrackMap:null,
  shakaPolyfillsInstalled:false,
  usingShaka:false,
  shakaAudioMap:null,
  shakaQualityMap:null,
  shakaAttached:false,
  currentSource:'',
  currentSourceIsProxy:false,
  shakaLoadInProgress:false,
  shakaLoadWaiters:[],
  sourceQueue:[],
  sourceIndex:0,
  sourceSwapInProgress:false,

  loadPlayerChoice:function(){
    try{
      var remember = localStorage.getItem(PLAYER_REMEMBER_KEY)==='1';
      this.rememberChoice = remember;
      if(remember){
        var saved = txt(localStorage.getItem(PLAYER_CHOICE_KEY)).toLowerCase();
        if(saved==='videojs' || saved==='jwplayer') this.engine = saved;
      }
    }catch(e){}
  },
  persistPlayerChoice:function(){
    try{
      if(this.rememberChoice){
        localStorage.setItem(PLAYER_REMEMBER_KEY, '1');
        localStorage.setItem(PLAYER_CHOICE_KEY, this.engine);
      } else {
        localStorage.removeItem(PLAYER_REMEMBER_KEY);
        localStorage.removeItem(PLAYER_CHOICE_KEY);
      }
    }catch(e){}
  },
  showPlayerPicker:function(item){
    this.pendingItem=item;
    this.pickerOpen=true;
    this.pickerFocus='card';
    this.pickerIndex=(this.engine==='jwplayer')?1:0;
    this.pickerAction=0;
    if(el.playerPickerRemember) el.playerPickerRemember.checked=!!this.rememberChoice;
    el.playerPicker.classList.remove('hidden');
    this.renderPlayerPicker();
  },
  hidePlayerPicker:function(){
    this.pickerOpen=false;
    this.pendingItem=null;
    el.playerPicker.classList.add('hidden');
  },
  renderPlayerPicker:function(){
    var opts = el.playerPicker.querySelectorAll('.pickerOpt');
    for(var i=0;i<opts.length;i++){
      if(this.pickerFocus==='card' && i===this.pickerIndex) opts[i].classList.add('focus');
      else opts[i].classList.remove('focus');
    }
    var btns = el.playerPicker.querySelectorAll('.pickerBtn');
    for(var b=0;b<btns.length;b++){
      if(this.pickerFocus==='action' && b===this.pickerAction) btns[b].classList.add('focus');
      else btns[b].classList.remove('focus');
    }
  },
  confirmPlayerPicker:function(){
    this.engine = this.pickerIndex===1 ? 'jwplayer' : 'videojs';
    this.rememberChoice = !!(el.playerPickerRemember && el.playerPickerRemember.checked);
    this.persistPlayerChoice();
    var item=this.pendingItem;
    this.hidePlayerPicker();
    if(item) this.open(item,true);
  },
  cancelPlayerPicker:function(){
    this.hidePlayerPicker();
    this.close();
  },

  open:function(item,skipPicker){
    state.player=true;
    el.player.classList.remove('hidden');
    el.player.classList.add('using-shaka-ui');
    el.player.classList.remove('using-videojs','using-jw');
    el.player.classList.add('native-mode');
    el.player.classList.remove('rmp-mode');
    el.playerTitle.textContent=item._title;
    el.playerTopTitle.textContent=item._title;
    el.playerMsg.textContent='';
    this.currentItem=item;
    this.backPressCount=0;
    this.lastProgressSentAt=0;
    this.lastProgressSentPosition=0;

    var isLive=item._type&&item._type.toLowerCase().indexOf('live')>=0;
    if(isLive) el.playerLiveBadge.classList.remove('hidden');
    else       el.playerLiveBadge.classList.add('hidden');

    if(!skipPicker && !this.rememberChoice){
      this.showPlayerPicker(item);
      return;
    }

    el.playerControls.innerHTML=
      '<div class="playerChip main">'+ICONS.play+' Play / Pause</div>'+
      '<div class="playerChip">'+ICONS.rew+' \u221210s</div>'+
      '<div class="playerChip">'+ICONS.ff+' +10s</div>'+
      '<div class="playerChip">'+ICONS.gear+' Settings</div>';

    if(item._url){
      this.sourceQueue = this.buildSourceQueue(item._urlRaw || item._url);
      this.sourceIndex = 0;
      this.sourceSwapInProgress = false;
      this.playCurrentSource();
      this.pushProgress(false);
    } else {
      el.playerMsg.textContent='No stream URL';
    }
    el.playerCenter.style.opacity='0';
    this.showUi();
  },
  close:function(){
    this.pushProgress(true);
    state.player=false;
    try{ el.video.pause(); }catch(e){}
    try{ el.video.removeAttribute('src'); }catch(e){}
    try{ el.video.load(); }catch(e){}
    el.player.classList.remove('rmp-mode');
    el.player.classList.add('native-mode');
    el.player.classList.add('hidden');
    el.player.classList.remove('using-shaka-ui');
    el.player.classList.remove('using-videojs','using-jw');
    el.player.classList.remove('ui-hidden','ui-visible');
    el.playerSettings.classList.add('hidden');
    el.exitOverlay.classList.add('hidden');
    el.playerPicker.classList.add('hidden');
    this.pickerOpen=false;
    this.pendingItem=null;
    this.currentItem=null;
    this.usingShaka=false;
    this.destroyVideojs();
    this.destroyJw();
    this.destroyShakaUi();
    this.destroyShaka();
    this.shakaTrackMap=null;
    this.shakaAudioMap=null;
    this.shakaQualityMap=null;
    this.currentSource='';
    this.currentSourceIsProxy=false;
    this.sourceQueue=[];
    this.sourceIndex=0;
    this.sourceSwapInProgress=false;
    this.backPressCount=0;
    clearTimeout(this.uiTimer);
    clearTimeout(this.backResetTimer);
  },
  destroyShakaUi:function(){
    if(!this.shakaUi) return;
    try{ this.shakaUi.destroy(); }catch(e){}
    this.shakaUi=null;
    this.shakaControls=null;
  },
  destroyVideojs:function(){
    if(!this.videojsPlayer) return;
    try{ this.videojsPlayer.dispose(); }catch(e){}
    this.videojsPlayer=null;
  },
  destroyJw:function(){
    if(!this.jwPlayerInstance) return;
    try{
      if(this.jwPlayerInstance.remove) this.jwPlayerInstance.remove();
    }catch(e){}
    this.jwPlayerInstance=null;
  },
  destroyShaka:function(){
    this.destroyShakaUi();
    if(!this.shakaPlayer) return;
    try{ this.shakaPlayer.destroy(); }catch(e){}
    this.shakaPlayer=null;
    this.shakaAttached=false;
    this.shakaFilterBound=false;
  },
  unloadShaka:function(){
    if(!this.shakaPlayer) return;
    try{ this.shakaPlayer.unload(); }catch(e){}
  },
  resetMediaElement:function(){
    try{ el.video.pause(); }catch(e){}
    try{ el.video.removeAttribute('src'); }catch(e){}
    try{ el.video.load(); }catch(e){}
  },
  loadScriptOnce:function(src,onDone){
    var tags=document.getElementsByTagName('script');
    for(var i=0;i<tags.length;i++){
      if(tags[i]&&tags[i].src&&tags[i].src.indexOf(src)>=0){
        if(window.shaka&&window.shaka.Player){ onDone(true); return; }
      }
    }
    var s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=function(){ onDone(true); };
    s.onerror=function(){ onDone(false); };
    document.head.appendChild(s);
  },
  ensureShakaRuntime:function(onReady){
    if(window.shaka&&window.shaka.Player){ onReady(true); return; }
    this.shakaLoadWaiters.push(onReady);
    if(this.shakaLoadInProgress) return;
    this.shakaLoadInProgress=true;
    var self=this;
    function done(ok){
      self.shakaLoadInProgress=false;
      var cbs=self.shakaLoadWaiters.slice(0);
      self.shakaLoadWaiters.length=0;
      for(var i=0;i<cbs.length;i++){
        try{ cbs[i](ok&&!!(window.shaka&&window.shaka.Player)); }catch(e){}
      }
    }
    this.loadScriptOnce('vendor/shaka-player.compiled.min.js',function(ok1){
      if(!ok1){ done(false); return; }
      self.loadScriptOnce('vendor/shaka-player.ui.min.js',function(ok2){
        try{
          if(window.shaka&&window.shaka.log&&shaka.log.setLevel&&shaka.log.Level){
            shaka.log.setLevel(shaka.log.Level.ERROR);
          }
          if(window.shaka&&window.shaka.log){
            shaka.log.debug=function(){};
          }
        }catch(e){}
        done(!!ok2);
      });
    });
  },
  buildSourceQueue:function(url){
    var q = [];
    var raw = normalizeUrlProtocol(txt(url));
    var base = normalizeUrlProtocol(stripIptvHeaders(raw));
    function add(u,keepHeaders){
      u = normalizeUrlProtocol(txt(u));
      if(!keepHeaders) u = stripIptvHeaders(u);
      if(!u) return;
      if(q.indexOf(u)>=0) return;
      q.push(u);
    }
    var isHls = isLikelyHls(base) || isLikelyHls(raw);
    if(isHls){
      /* For HLS sources, start with backend proxy to avoid browser CORS blocks. */
      if(raw) add(proxyStreamUrl(raw), true);
      add(proxyStreamUrl(base), true);
    }
    add(base);
    if(raw && raw!==base){
      add(raw, false);
      add(proxyStreamUrl(raw), true);
    }
    if(base.indexOf('https://')===0){
      add('http://' + base.slice(8));
      add(proxyStreamUrl('http://' + base.slice(8)), true);
    }
    if(base.indexOf('http://')===0){
      add('https://' + base.slice(7));
      add(proxyStreamUrl('https://' + base.slice(7)), true);
    }
    return q;
  },
  ensureShaka:function(){
    if(!window.shaka||!window.shaka.Player) return false;
    try{
      if(window.shaka&&window.shaka.log&&shaka.log.setLevel&&shaka.log.Level){
        shaka.log.setLevel(shaka.log.Level.ERROR);
      }
    }catch(e){}
    if(this.shakaPlayer) return true;
    try{
      this.shakaPlayer = new shaka.Player();
      this.shakaAttached=false;
      this.bindShakaNetworking();
      var self=this;
      this.shakaPlayer.addEventListener('error', function(ev){
        self.handleShakaError(ev&&ev.detail?ev.detail:ev);
      });
      this.shakaPlayer.configure({
        drm:{
          servers:{},
          clearKeys:{},
          parseInbandPsshEnabled:false,
          delayLicenseRequestUntilPlayed:true,
          ignoreDuplicateInitData:true
        },
        abr:{ enabled:true, switchInterval:6 },
        mediaSource:{
          forceTransmux:true
        },
        streaming:{
          lowLatencyMode:false,
          bufferingGoal:16,
          rebufferingGoal:2,
          bufferBehind:30,
          retryParameters:{
            timeout:12000,
            stallTimeout:5000,
            connectionTimeout:12000,
            maxAttempts:3,
            baseDelay:400,
            backoffFactor:2,
            fuzzFactor:0.5
          }
        },
        manifest:{
          retryParameters:{
            timeout:10000,
            stallTimeout:5000,
            connectionTimeout:10000,
            maxAttempts:3,
            baseDelay:350,
            backoffFactor:2,
            fuzzFactor:0.5
          }
        }
      });
      this.ensureShakaUi();
      return true;
    }catch(e){
      this.shakaPlayer=null;
      return false;
    }
  },
  ensureShakaAttached:function(){
    if(!this.shakaPlayer || !el.video) return Promise.reject(new Error('shaka_no_player'));
    var attached = null;
    try{
      attached = this.shakaPlayer.getMediaElement ? this.shakaPlayer.getMediaElement() : null;
    }catch(e){}
    if(this.shakaAttached && attached===el.video) return Promise.resolve();
    var self=this;
    return this.shakaPlayer.attach(el.video, true).then(function(){
      self.shakaAttached = true;
    });
  },
  ensureShakaUi:function(){
    if(!this.shakaPlayer || !window.shaka || !window.shaka.ui || !window.shaka.ui.Overlay || !el.shakaUiContainer) return false;
    if(this.shakaUi) return true;
    try{
      this.shakaUi = new shaka.ui.Overlay(this.shakaPlayer, el.shakaUiContainer, el.video);
      this.shakaControls = this.shakaUi.getControls ? this.shakaUi.getControls() : null;
      this.shakaUi.configure({
        addBigPlayButton:true,
        addSeekBar:true,
        enableKeyboardPlaybackControls:false,
        fadeDelay:3,
        doubleClickForFullscreen:false,
        singleClickForPlayAndPause:false,
        controlPanelElements:[
          'play_pause',
          'rewind',
          'fast_forward',
          'time_and_duration',
          'spacer',
          'mute',
          'volume',
          'overflow_menu',
          'fullscreen'
        ],
        overflowMenuButtons:[
          'captions',
          'quality',
          'language',
          'playback_rate',
          'picture_in_picture'
        ]
      });
      return true;
    }catch(e){
      this.shakaUi=null;
      this.shakaControls=null;
      return false;
    }
  },
  bindShakaNetworking:function(){
    if(!this.shakaPlayer || this.shakaFilterBound) return;
    var self=this;
    var net = this.shakaPlayer.getNetworkingEngine();
    if(!net) return;
    net.registerRequestFilter(function(type,request){
      if(!request||!request.uris||!request.uris.length) return;
      request.uris=request.uris.map(function(uri){
        uri=normalizeUrlProtocol(txt(uri));
        if(!uri) return uri;
        if(uri.indexOf('data:')===0||uri.indexOf('blob:')===0||uri.indexOf('mediasource:')===0) return uri;
        if(uri.indexOf(API_BASE+'/stream?')===0) return uri;
        if(!self.currentSourceIsProxy) return uri;
        if(/^https?:\/\//i.test(uri)) return proxyStreamUrl(uri);
        return uri;
      });
    });
    this.shakaFilterBound=true;
  },
  guessMimeType:function(src){
    src = txt(src).toLowerCase();
    if(src.indexOf('.m3u8')>=0) return 'application/x-mpegurl';
    if(src.indexOf('.mpd')>=0) return 'application/dash+xml';
    if(src.indexOf('.mp4')>=0) return 'video/mp4';
    return null;
  },
  canUseShaka:function(src){
    if(!(window.shaka&&window.shaka.Player)) return false;
    if(!/^https?:\/\//i.test(txt(src))) return false;
    return true;
  },
  playCurrentSource:function(){
    if(!this.sourceQueue.length){
      el.playerMsg.textContent='No playable source';
      return;
    }
    var src = this.sourceQueue[this.sourceIndex] || this.sourceQueue[0];
    this.currentSource = src;
    this.currentSourceIsProxy = src.indexOf(API_BASE+'/stream?')===0;
    el.playerMsg.textContent='Loading stream...';
    this.destroyVideojs();
    this.destroyJw();
    try{ el.video.removeAttribute('crossorigin'); el.video.crossOrigin=null; }catch(e){}
    this.usingShaka=false;

    var self=this;
    if(this.engine==='videojs'){
      this.playWithVideoJs(src).catch(function(){
        self.tryNextSource('videojs_failed');
      });
      return;
    }
    if(this.engine==='jwplayer'){
      this.playWithJw(src).catch(function(){
        self.tryNextSource('jwplayer_failed');
      });
      return;
    }
    this.unloadShaka();
    this.resetMediaElement();
    this.ensureShakaRuntime(function(ready){
      if(!state.player) return;
      if(ready && self.canUseShaka(src) && self.ensureShaka()){
        self.loadShakaSource(src).then(function(){
          self.usingShaka=true;
        }).catch(function(){
          self.usingShaka=false;
          if(!self.currentSourceIsProxy && isLikelyHls(src)){
            self.tryNativeDirectSource(src).catch(function(){
              self.tryNextSource('shaka_load_failed');
            });
            return;
          }
          self.tryNextSource('shaka_load_failed');
        });
        return;
      }
      if(!self.currentSourceIsProxy && isLikelyHls(src)){
        self.tryNativeDirectSource(src).catch(function(){
          self.tryNextSource('player_unavailable');
        });
        return;
      }
      self.tryNextSource('player_unavailable');
    });
  },
  playWithVideoJs:function(src){
    var self=this;
    return new Promise(function(resolve,reject){
      if(!window.videojs){
        el.playerMsg.textContent='Video.js not loaded';
        reject(new Error('videojs_missing'));
        return;
      }
      el.player.classList.remove('using-shaka-ui','using-jw');
      el.player.classList.remove('rmp-mode');
      el.player.classList.add('using-videojs');
      el.player.classList.add('native-mode');
      self.unloadShaka();
      self.resetMediaElement();
      var type = isLikelyHls(src) ? 'application/x-mpegURL' : self.guessMimeType(src);
      self.videojsPlayer = videojs(el.video, {
        autoplay:true,
        controls:false,
        preload:'auto',
        fluid:false,
        responsive:false,
        liveui:true,
        userActions:{
          hotkeys:false,
          click:false,
          doubleClick:false
        },
        html5:{
          nativeAudioTracks:true,
          nativeVideoTracks:true,
          nativeTextTracks:true,
          vhs:{
            overrideNative:false,
            withCredentials:false
          }
        }
      });
      self.videojsPlayer.src({ src: src, type: type || 'video/mp4' });
      self.videojsPlayer.ready(function(){
        try{
          var p=self.videojsPlayer.play();
          if(p&&p.then){ p.then(function(){ resolve(); }).catch(function(){ resolve(); }); }
          else resolve();
        }catch(e){ resolve(); }
      });
      self.videojsPlayer.on('error', function(){ reject(new Error('videojs_error')); });
    });
  },
  ensureJwRuntime:function(onReady){
    if(window.jwplayer){ onReady(true); return; }
    var url = txt(JWPLAYER_LIBRARY_URL).trim();
    if(!url){ onReady(false); return; }
    var s=document.createElement('script');
    s.src=url;
    s.async=false;
    s.onload=function(){ onReady(!!window.jwplayer); };
    s.onerror=function(){ onReady(false); };
    document.head.appendChild(s);
  },
  playWithJw:function(src){
    var self=this;
    return new Promise(function(resolve,reject){
      self.ensureJwRuntime(function(ok){
        if(!ok){
          el.playerMsg.textContent='JW Player library is not configured';
          reject(new Error('jw_missing'));
          return;
        }
        el.player.classList.remove('using-shaka-ui','using-videojs');
        el.player.classList.add('using-jw');
        el.player.classList.add('rmp-mode');
        el.player.classList.remove('native-mode');
        self.unloadShaka();
        self.resetMediaElement();
        try{
          if(JWPLAYER_LICENSE_KEY && window.jwplayer){
            jwplayer.key = JWPLAYER_LICENSE_KEY;
          }
        }catch(e){}
        try{
          self.jwPlayerInstance = jwplayer('rmp').setup({
            width:'100%',
            height:'100%',
            autostart:true,
            controls:true,
            primary:'html5',
            file:src,
            type:isLikelyHls(src)?'hls':undefined
          });
          self.jwPlayerInstance.on('ready', function(){ resolve(); });
          self.jwPlayerInstance.on('play', function(){ resolve(); });
          self.jwPlayerInstance.on('error', function(){ reject(new Error('jw_error')); });
          self.jwPlayerInstance.on('setupError', function(){ reject(new Error('jw_setup_error')); });
        }catch(e){
          reject(e);
        }
      });
    });
  },
  tryNativeDirectSource:function(src){
    var self=this;
    return new Promise(function(resolve,reject){
      var done=false;
      var timer=null;
      function cleanup(){
        el.video.removeEventListener('canplay', onReady, false);
        el.video.removeEventListener('loadedmetadata', onReady, false);
        el.video.removeEventListener('error', onErr, false);
        clearTimeout(timer);
      }
      function finishOk(){
        if(done) return;
        done=true;
        cleanup();
        self.usingShaka=false;
        el.playerMsg.textContent='Streaming (direct)';
        self.refreshSettings();
        resolve();
      }
      function finishFail(){
        if(done) return;
        done=true;
        cleanup();
        reject(new Error('native_hls_failed'));
      }
      function onReady(){
        try{
          var p=el.video.play();
          if(p && p.then){
            p.then(finishOk).catch(function(){ finishOk(); });
          } else {
            finishOk();
          }
        }catch(e){ finishOk(); }
      }
      function onErr(){ finishFail(); }

      self.unloadShaka();
      self.resetMediaElement();
      try{ el.video.removeAttribute('crossorigin'); el.video.crossOrigin=null; }catch(e){}
      el.playerMsg.textContent='Trying direct stream...';

      el.video.addEventListener('canplay', onReady, false);
      el.video.addEventListener('loadedmetadata', onReady, false);
      el.video.addEventListener('error', onErr, false);
      timer=setTimeout(finishFail, 10000);
      el.video.src = src;
      try{ el.video.load(); }catch(e){}
    });
  },
  loadShakaSource:function(src){
    var self=this;
    if(!this.ensureShaka()) return Promise.reject(new Error('shaka_unavailable'));
    el.playerMsg.textContent='Loading stream with Shaka...';
    this.shakaTrackMap=null;
    this.shakaAudioMap=null;
    this.shakaQualityMap=null;
    var mime = this.guessMimeType(src);
    return this.ensureShakaAttached().then(function(){
      return self.shakaPlayer.load(src, null, mime);
    }).then(function(){
      el.playerMsg.textContent='Streaming';
      self.refreshSettings();
      var p = el.video.play();
      if(p&&p.catch){
        p.catch(function(){ el.playerMsg.textContent='Press OK to start playback'; });
      }
    });
  },
  handleShakaError:function(error){
    if(!state.player) return;
    var code = error&&error.code ? String(error.code) : 'shaka_error';
    var detail = '';
    try{
      detail = error && error.data && error.data.length ? (' ('+String(error.data[0])+')') : '';
    }catch(e){}
    try{ console.error('Shaka error', error); }catch(e){}
    if(this.sourceSwapInProgress) return;
    if(this.sourceIndex < this.sourceQueue.length - 1){
      this.tryNextSource('shaka_'+code);
      return;
    }
    el.playerMsg.textContent='Video error: '+code+detail;
  },
  tryNextSource:function(reason){
    if(this.sourceSwapInProgress) return;
    if(this.sourceIndex >= this.sourceQueue.length - 1){
      el.playerMsg.textContent = 'Video error: source blocked or unavailable';
      return;
    }
    this.unloadShaka();
    this.sourceSwapInProgress = true;
    this.sourceIndex++;
    el.playerMsg.textContent = 'Trying fallback source...';
    var self = this;
    setTimeout(function(){
      self.sourceSwapInProgress = false;
      self.playCurrentSource();
    }, 120);
  },
  showUi:function(){
    el.player.classList.remove('ui-hidden');
    el.player.classList.add('ui-visible');
    clearTimeout(this.uiTimer);
    var self=this;
    this.uiTimer=setTimeout(function(){ self.hideUi(); },4500);
  },
  hideUi:function(){
    el.player.classList.add('ui-hidden');
    el.player.classList.remove('ui-visible');
  },
  time:function(){
    var c=el.video.currentTime||0;
    var d=el.video.duration||0;
    el.playerTime.textContent=fmt(c)+(d?' / '+fmt(d):'');
    var pct=d>0?Math.max(0,Math.min(100,c*100/d)):0;
    el.progressBar.style.width=pct+'%';
    el.progressThumb.style.left=pct+'%';
    if(el.video.buffered&&el.video.buffered.length){
      try{
        var bEnd=el.video.buffered.end(el.video.buffered.length-1);
        var bPct=d>0?Math.min(100,bEnd*100/d):0;
        el.progressBuf.style.width=bPct+'%';
      }catch(e){}
    }
    this.pushProgress(false);
  },
  seek:function(delta){
    if(el.video.duration) el.video.currentTime=Math.max(0,Math.min(el.video.duration,el.video.currentTime+delta));
    this.showUi();
  },
  togglePlay:function(){
    if(el.video.paused) el.video.play();
    else el.video.pause();
    this.updateCenter();
    this.showUi();
  },
  updateCenter:function(){
    var sp=document.getElementById('svgPlay');
    var sa=document.getElementById('svgPause');
    if(el.video.paused){ if(sp) sp.style.display=''; if(sa) sa.style.display='none'; }
    else { if(sp) sp.style.display='none'; if(sa) sa.style.display=''; }
    el.playerCenter.style.opacity='1';
    var self=this;
    setTimeout(function(){ el.playerCenter.style.opacity='0'; },900);
  },

  settingRows:[], settingIndex:0,
  openSettings:function(){
    this.settingIndex=0;
    this.refreshSettings();
    el.playerSettings.classList.remove('hidden');
    this.showUi();
  },
  closeSettings:function(){ el.playerSettings.classList.add('hidden'); },
  settingsOpen:function(){ return !el.playerSettings.classList.contains('hidden'); },
  refreshSettings:function(){
    var rows=[{k:'head',l:'Subtitles'},{k:'textOff',l:'Off',a:true,id:-1}];
    this.shakaTrackMap=null;
    this.shakaAudioMap=null;
    this.shakaQualityMap=null;

    if(this.usingShaka && this.shakaPlayer){
      var textVisible=false;
      try{
        textVisible = !!(this.shakaPlayer.isTextTrackVisible && this.shakaPlayer.isTextTrackVisible());
      }catch(e){}
      var textRows=[{k:'textOff',l:'Off',a:!textVisible,id:-1}];
      var tt=arr(this.shakaPlayer.getTextTracks&&this.shakaPlayer.getTextTracks());
      for(var s=0;s<tt.length;s++){
        var t=tt[s]||{};
        var label=txt(t.label||t.language||('Sub '+(s+1)));
        textRows.push({k:'textShaka',l:label,id:s,a:!!t.active});
      }
      rows=[{k:'head',l:'Subtitles'}].concat(textRows);
      rows.push({k:'head',l:'Audio'});
      var at=arr(this.shakaPlayer.getVariantTracks&&this.shakaPlayer.getVariantTracks());
      var audioSeen={};
      var audioMap=[];
      for(var a=0;a<at.length;a++){
        var tr=at[a]||{};
        var key=(txt(tr.language)||'')+'|'+(txt(tr.audioId)||'')+'|'+(txt(tr.roles&&tr.roles.join(','))||'');
        if(audioSeen[key]) continue;
        audioSeen[key]=true;
        var aLabel = txt(tr.label||tr.language||'Audio '+(audioMap.length+1));
        rows.push({k:'audioShaka',l:aLabel,id:audioMap.length,a:!!tr.active});
        audioMap.push(tr);
      }
      this.shakaAudioMap=audioMap;
      rows.push({k:'head',l:'Quality'});
      rows.push({k:'qualityAuto',l:'Auto',a:!!(this.shakaPlayer.getConfiguration&&this.shakaPlayer.getConfiguration().abr&&this.shakaPlayer.getConfiguration().abr.enabled)});
      var qMap=[];
      var qSeen={};
      for(var q=0;q<at.length;q++){
        var v=at[q]||{};
        if(!v.height && !v.bandwidth) continue;
        var qKey=txt(v.height)+'|'+txt(v.bandwidth);
        if(qSeen[qKey]) continue;
        qSeen[qKey]=true;
        var qLabel=(v.height?(v.height+'p'):'Audio')+(v.bandwidth?(' • '+Math.round(v.bandwidth/1000)+'kbps'):'');
        rows.push({k:'qualityShaka',l:qLabel,id:qMap.length,a:!!v.active});
        qMap.push(v);
      }
      this.shakaQualityMap=qMap;
      rows.push({k:'head',l:'Playback'});
      var rates=[0.5,0.75,1,1.25,1.5,2];
      var nowRate=Number(el.video.playbackRate||1);
      for(var rr=0;rr<rates.length;rr++){
        var rv=rates[rr];
        rows.push({k:'rate',l:(rv===1?'Normal':(rv+'x')),id:rv,a:Math.abs(nowRate-rv)<0.01});
      }
      this.settingRows=rows;
      el.settingsList.innerHTML='';
      for(var sk=0;sk<rows.length;sk++){
        var srow=rows[sk];
        var divs=document.createElement('div');
        if(srow.k==='head'){ divs.className='settingsHead'; divs.textContent=srow.l; }
        else { divs.className='settingsRow'+(srow.a?' selected':''); divs.textContent=srow.l; }
        el.settingsList.appendChild(divs);
      }
      this.renderSettingFocus();
      return;
    }

    try{
      var tt=el.video.textTracks;
      for(var i=0;tt&&i<tt.length;i++) rows.push({k:'text',l:(tt[i].label||tt[i].language||'Track '+(i+1)),id:i});
    }catch(e){}
    rows.push({k:'head',l:'Audio'});
    try{
      var at=el.video.audioTracks;
      for(var j=0;at&&j<at.length;j++) rows.push({k:'audio',l:(at[j].label||at[j].language||'Track '+(j+1)),id:j,a:at[j].enabled});
    }catch(e){}
    this.settingRows=rows;
    el.settingsList.innerHTML='';
    for(var k=0;k<rows.length;k++){
      var row=rows[k];
      var div=document.createElement('div');
      if(row.k==='head'){ div.className='settingsHead'; div.textContent=row.l; }
      else { div.className='settingsRow'+(row.a?' selected':''); div.textContent=row.l; }
      el.settingsList.appendChild(div);
    }
    this.renderSettingFocus();
  },
  renderSettingFocus:function(){
    var divs=el.settingsList.children;
    for(var i=0;i<divs.length;i++){
      if(i===this.settingIndex) divs[i].classList.add('focus');
      else divs[i].classList.remove('focus');
    }
  },
  moveSetting:function(d){
    var i=this.settingIndex+d;
    while(i>=0&&i<this.settingRows.length&&this.settingRows[i].k==='head') i+=d;
    if(i>=0&&i<this.settingRows.length) this.settingIndex=i;
    this.renderSettingFocus();
  },
  selectSetting:function(){
    var row=this.settingRows[this.settingIndex];
    if(!row||row.k==='head') return;
    if(row.k==='textOff'){
      if(this.usingShaka&&this.shakaPlayer){
        try{
          this.shakaPlayer.setTextTrackVisibility(false);
          this.shakaPlayer.selectTextTrack(null);
        }catch(e){}
      } else {
        try{ var tt=el.video.textTracks; for(var i=0;tt&&i<tt.length;i++) tt[i].mode='hidden'; }catch(e){}
      }
    } else if(row.k==='text'){
      try{ var tt2=el.video.textTracks; for(var j=0;tt2&&j<tt2.length;j++) tt2[j].mode=(j===row.id?'showing':'hidden'); }catch(e){}
    } else if(row.k==='textShaka'){
      try{
        var tlist=arr(this.shakaPlayer.getTextTracks&&this.shakaPlayer.getTextTracks());
        var tr=tlist[row.id];
        if(tr){
          this.shakaPlayer.selectTextTrack(tr);
          this.shakaPlayer.setTextTrackVisibility(true);
        }
      }catch(e){}
    } else if(row.k==='audio'){
      try{ var at=el.video.audioTracks; for(var k=0;at&&k<at.length;k++) at[k].enabled=(k===row.id); }catch(e){}
    } else if(row.k==='audioShaka'){
      try{
        var am=arr(this.shakaAudioMap);
        if(am[row.id]){
          this.shakaPlayer.selectVariantTrack(am[row.id], true, 2);
        }
      }catch(e){}
    } else if(row.k==='qualityAuto'){
      try{ this.shakaPlayer.configure({abr:{enabled:true}}); }catch(e){}
    } else if(row.k==='qualityShaka'){
      try{
        var qm=arr(this.shakaQualityMap);
        if(qm[row.id]){
          this.shakaPlayer.configure({abr:{enabled:false}});
          this.shakaPlayer.selectVariantTrack(qm[row.id], true, 2);
        }
      }catch(e){}
    } else if(row.k==='rate'){
      try{ el.video.playbackRate=Number(row.id)||1; }catch(e){}
    }
    this.refreshSettings();
    this.showUi();
  },

  progressTypeOf:function(item){
    if(!item) return '';
    var t=txt(item._type).toLowerCase();
    if(t.indexOf('episode')>=0) return 'episode';
    if(t.indexOf('movie')>=0) return 'movie';
    return '';
  },
  progressIdOf:function(item){
    var id=parseInt(first(item,['real_id','id','_id']),10);
    return isFinite(id)?id:0;
  },
  pushProgress:function(force){
    var item=this.currentItem;
    var type=this.progressTypeOf(item);
    var id=this.progressIdOf(item);
    if(!type||!id) return;
    var position=Math.floor(el.video.currentTime||0);
    var duration=Math.floor(el.video.duration||0);
    if(position<=0&&!force) return;
    var now=Date.now();
    if(!force){
      if(now-this.lastProgressSentAt<12000&&Math.abs(position-this.lastProgressSentPosition)<10) return;
    }
    this.lastProgressSentAt=now; this.lastProgressSentPosition=position;
    apiPost('/progress',{device_id:DEVICE_ID,type:type,id:id,position_seconds:position,duration_seconds:duration>0?duration:null});
  },

  handleBack:function(){
    var self=this;
    if(this.backPressCount===0){
      this.backPressCount=1;
      this.close();
      this.backResetTimer=setTimeout(function(){ self.backPressCount=0; },1500);
    }
  },
  resumePlayback:function(){
    var p = el.video.play();
    if(p && p.catch){
      p.catch(function(){ el.playerMsg.textContent='Press PLAY to start'; });
    }
    this.showUi();
  }
};

function fmt(s){
  s=Math.floor(s||0);
  var h=Math.floor(s/3600); var m=Math.floor((s%3600)/60); var sec=s%60;
  if(h>0) return h+':'+(m<10?'0':'')+m+':'+(sec<10?'0':'')+sec;
  return m+':'+(sec<10?'0':'')+sec;
}

/* ── Key handler ── */
function handleKey(e){
  var k=e.keyCode;

  if(state.player){
    e.preventDefault();
    if(Player.pickerOpen){
      if(k===KEY.BACK||k===KEY.ESC){ Player.cancelPlayerPicker(); return; }
      if(Player.pickerFocus==='card'){
        if(k===KEY.LEFT) Player.pickerIndex=0;
        else if(k===KEY.RIGHT) Player.pickerIndex=1;
        else if(k===KEY.DOWN) Player.pickerFocus='action';
        else if(k===KEY.OK){ Player.confirmPlayerPicker(); return; }
      } else {
        if(k===KEY.LEFT) Player.pickerAction=0;
        else if(k===KEY.RIGHT) Player.pickerAction=1;
        else if(k===KEY.UP) Player.pickerFocus='card';
        else if(k===KEY.OK){
          if(Player.pickerAction===0) Player.confirmPlayerPicker();
          else Player.cancelPlayerPicker();
          return;
        }
      }
      Player.renderPlayerPicker();
      return;
    }
    if(el.exitOverlay&&!el.exitOverlay.classList.contains('hidden')){
      if(k===KEY.BACK||k===KEY.ESC)  el.exitOverlay.classList.add('hidden');
      if(k===KEY.OK)                 Player.close();
      return;
    }
    if(Player.settingsOpen()){
      if(k===KEY.UP)                       Player.moveSetting(-1);
      else if(k===KEY.DOWN)                Player.moveSetting(1);
      else if(k===KEY.OK)                  Player.selectSetting();
      else if(k===KEY.BACK||k===KEY.ESC||k===KEY.BLUE) Player.closeSettings();
      return;
    }
    if(k===KEY.BACK||k===KEY.ESC){ Player.handleBack(); return; }
    if(k===KEY.OK){
      if(Player.engine==='videojs'){
        Player.openSettings();
      } else {
        Player.resumePlayback();
      }
      return;
    }
    if(k===KEY.PLAY){
      if(el.video.paused) Player.togglePlay();
      else Player.showUi();
      return;
    }
    if(k===KEY.PAUSE){
      if(!el.video.paused) Player.togglePlay();
      else Player.showUi();
      return;
    }
    if(k===KEY.LEFT||k===KEY.REW)     Player.seek(-10);
    else if(k===KEY.RIGHT||k===KEY.FF)     Player.seek(10);
    else if(k===KEY.UP||k===KEY.BLUE||k===KEY.YELLOW) Player.openSettings();
    else                                   Player.showUi();
    return;
  }

  if(state.live){
    e.preventDefault();
    if(k===KEY.BACK||k===KEY.ESC){ closeLiveScreen(); return; }
    if(state.liveFocus==='cats'){
      if(k===KEY.LEFT||k===KEY.UP) state.liveCatIndex=Math.max(0,state.liveCatIndex-1);
      else if(k===KEY.RIGHT||k===KEY.DOWN) state.liveCatIndex=Math.min(LIVE_CATS.length-1,state.liveCatIndex+1);
      else if(k===KEY.OK){ state.liveFocus='channels'; state.liveItemIndex=0; renderLiveChannels(); }
      updateLiveFocus();
    } else if(state.liveFocus==='channels'){
      if(k===KEY.UP) state.liveItemIndex=Math.max(0,state.liveItemIndex-1);
      else if(k===KEY.DOWN) state.liveItemIndex=Math.min(liveVisibleItems.length-1,state.liveItemIndex+1);
      else if(k===KEY.LEFT){ state.liveFocus='cats'; updateLiveFocus(); return; }
      else if(k===KEY.RIGHT){ state.liveFocus='play'; updateLiveFocus(); return; }
      else if(k===KEY.OK){
        var it=liveVisibleItems[state.liveItemIndex];
        if(it){ closeLiveScreen(); Player.open(it); }
        return;
      }
      scrollLiveList();
      updateLivePreview();
      updateLiveFocus();
    } else if(state.liveFocus==='play'){
      if(k===KEY.LEFT){ state.liveFocus='channels'; updateLiveFocus(); return; }
      else if(k===KEY.OK){
        var it2=liveVisibleItems[state.liveItemIndex];
        if(it2){ closeLiveScreen(); Player.open(it2); }
      }
    }
    return;
  }

  if(state.detail){
    e.preventDefault();
    if(state.detailMode==='series'){
      if(k===KEY.BACK||k===KEY.ESC){
        if(state.seriesNav&&state.seriesNav.level==='episodes'){
          state.seriesNav.level='seasons';
          el.similarTitle.textContent='Available Seasons';
          el.detailActions.innerHTML='<div class="detailBtn">'+ICONS.info+' Select a season</div>';
          el.detailHint.textContent='OK open season \u00b7 BACK return';
          openSeriesNavigator(state.item);
        } else { closeDetail(); }
        return;
      }
      if(k===KEY.LEFT) state.similarIndex=Math.max(0,state.similarIndex-1);
      else if(k===KEY.RIGHT) state.similarIndex=Math.min(Math.max(0,state.similar.length-1),state.similarIndex+1);
      else if(k===KEY.OK){
        var pick=state.similar[state.similarIndex];
        if(!pick) return;
        if(state.seriesNav&&state.seriesNav.level==='seasons') loadSeasonEpisodes(pick._seasonNumber||1);
        else playEpisodeFromNavigator(pick);
      }
      updateDetailFocus(); return;
    }
    if(k===KEY.BACK||k===KEY.ESC){ closeDetail(); return; }
    if(state.detailFocus==='actions'){
      if(k===KEY.LEFT)  state.detailAction=Math.max(0,state.detailAction-1);
      else if(k===KEY.RIGHT) state.detailAction=Math.min(el.detailActions.children.length-1,state.detailAction+1);
      else if(k===KEY.DOWN&&state.similar.length){ state.detailFocus='similar'; state.similarIndex=0; }
      else if(k===KEY.OK){
        if(state.detailAction===0){ closeDetail(); Player.open(state.item); }
        else if(state.detailAction===1){ toggleFav(state.item); renderDetailFav(); }
      }
    } else {
      if(k===KEY.UP)    state.detailFocus='actions';
      else if(k===KEY.LEFT)  state.similarIndex=Math.max(0,state.similarIndex-1);
      else if(k===KEY.RIGHT) state.similarIndex=Math.min(state.similar.length-1,state.similarIndex+1);
      else if(k===KEY.OK)    showDetail(state.similar[state.similarIndex]);
    }
    updateDetailFocus(); return;
  }

  if(state.sidebar){
    e.preventDefault();
    if(k===KEY.UP)   state.menu=Math.max(0,state.menu-1);
    else if(k===KEY.DOWN) state.menu=Math.min(MENU.length-1,state.menu+1);
    else if(k===KEY.OK||k===KEY.RIGHT){
      var cat=MENU[state.menu].id;
      applyCategory(cat);
      state.row=0; state.col=0;
      if(cat==='tv' || cat==='live'){ closeSidebar(); openLiveScreen(); }
      else{ renderRows(); var heroItem=state.rows[0]&&state.rows[0].items[0]; updateHeroFromItem(heroItem); closeSidebar(); }
    }
    else if(k===KEY.BACK||k===KEY.ESC) closeSidebar();
    renderMenu(); return;
  }

  /* HERO FOCUS */
  if(state.heroFocused){
    e.preventDefault();
    if(k===KEY.LEFT)  state.heroAction=Math.max(0,state.heroAction-1);
    else if(k===KEY.RIGHT) state.heroAction=Math.min(2,state.heroAction+1);
    else if(k===KEY.DOWN){ state.heroFocused=false; updateHeroFocus(); focusAt(0,state.col); return; }
    else if(k===KEY.BACK||k===KEY.ESC){ state.heroFocused=false; updateHeroFocus(); openSidebar(); return; }
    else if(k===KEY.OK){
      var it3=state.rows[state.row]&&state.rows[state.row].items[state.col];
      if(!it3) return;
      if(state.heroAction===0){ Player.open(it3); }
      else if(state.heroAction===1){ toggleFav(it3); }
      else if(state.heroAction===2){ showDetail(it3); }
    }
    updateHeroFocus(); return;
  }

  /* MAIN GRID */
  e.preventDefault();
  if(k===KEY.LEFT){
    if(state.col<=0) openSidebar();
    else focusAt(state.row,state.col-1);
  } else if(k===KEY.RIGHT){
    var maxCol=(state.rows[state.row]?state.rows[state.row].items.length-1:0);
    focusAt(state.row,Math.min(maxCol,state.col+1));
  } else if(k===KEY.UP){
    if(state.row>0) focusAt(state.row-1,state.col);
    else{
      state.heroFocused=true; state.heroAction=0;
      updateHeroFocus();
      var fc=el.rows.querySelectorAll('.card');
      for(var ci=0;ci<fc.length;ci++) fc[ci].classList.remove('focus');
    }
  } else if(k===KEY.DOWN){
    if(state.row<state.rows.length-1) focusAt(state.row+1,state.col);
  } else if(k===KEY.OK){
    var it4=state.rows[state.row]&&state.rows[state.row].items[state.col];
    if(it4){
      if(txt(it4._type).toLowerCase().indexOf('series')>=0||txt(it4._type).toLowerCase()==='tv') openSeriesNavigator(it4);
      else Player.open(it4);
    }
  } else if(k===KEY.PLAY){
    var it5=state.rows[state.row]&&state.rows[state.row].items[state.col];
    if(it5) Player.open(it5);
  } else if(k===KEY.BACK||k===KEY.ESC){
    openSidebar();
  } else if(k===KEY.RED){
    var it6=state.rows[state.row]&&state.rows[state.row].items[state.col];
    if(it6){ toggleFav(it6); renderRows(); }
  }
}

/* ── Load ── */
function loadHome(){
  el.heroBgA.className='hero-bg active';
  el.heroBgB.className='hero-bg inactive';
  el.heroTitle.textContent='Loading...';
  el.heroMeta.textContent='';
  el.heroDesc.textContent='';

  var xhr=new XMLHttpRequest();
  var homeUrl=API+(API.indexOf('?')>=0?'&':'?')+'device='+encodeURIComponent(DEVICE_ID);
  xhr.open('GET',homeUrl,true);
  xhr.timeout=16000;
  xhr.setRequestHeader('Accept','application/json');
  xhr.onreadystatechange=function(){
    if(xhr.readyState!==4) return;
    if(xhr.status<200||xhr.status>=300){
      el.rows.innerHTML='<div class="error">HTTP '+xhr.status+' \u2014 cannot reach server</div>';
      return;
    }
    var data;
    try{ data=JSON.parse(xhr.responseText); }catch(e){
      el.rows.innerHTML='<div class="error">Response parse error</div>'; return;
    }
    normalizeHome(data);
    if(!state.allRows.length){
      el.rows.innerHTML='<div class="error dim">No content loaded</div>'; return;
    }
    applyCategory(state.cat);
    if(!state.rows.length){ state.cat='movies'; state.menu=1; applyCategory(state.cat); }
    state.row=0; state.col=0;
    renderMenu();
    openSidebar();
    renderRows();
    var heroItem=state.rows[0]&&state.rows[0].items[0];
    updateHeroFromItem(heroItem);
  };
  xhr.ontimeout=function(){ el.rows.innerHTML='<div class="error">Connection timeout</div>'; };
  xhr.onerror=function(){ el.rows.innerHTML='<div class="error">Cannot reach '+API+'</div>'; };
  xhr.send();
}

/* ── Video events ── */
el.video.addEventListener('timeupdate',    function(){ Player.time(); }, false);
el.video.addEventListener('durationchange',function(){ Player.time(); }, false);
el.video.addEventListener('loadedmetadata',function(){ Player.refreshSettings(); Player.time(); }, false);
el.video.addEventListener('play',          function(){ Player.updateCenter(); Player.showUi(); }, false);
el.video.addEventListener('pause',         function(){ Player.updateCenter(); Player.showUi(); }, false);
el.video.addEventListener('ended',         function(){ Player.close(); }, false);
el.video.addEventListener('error',         function(){
  if(state.player){
    Player.tryNextSource((el.video.error&&el.video.error.code)||'video_error');
  }
}, false);

document.addEventListener('keydown', handleKey, false);

function bindPointerSupport(){
  document.addEventListener('click',function(e){
    var t=e.target;
    while(
      t && t!==document &&
      !(t.classList && (
        t.classList.contains('card') ||
        t.classList.contains('menuItem') ||
        t.classList.contains('detailBtn') ||
        t.classList.contains('similarCard') ||
        t.classList.contains('playerChip') ||
        t.id==='playerBack' ||
        t.id==='livePlayBtn' ||
        t.classList.contains('liveCatTab') ||
        t.classList.contains('liveChannelRow') ||
        t.classList.contains('pickerOpt') ||
        t.classList.contains('pickerBtn') ||
        t.id==='playerPickerRemember'
      ))
    ) t=t.parentNode;
    if(!t||t===document) return;
    if(t.classList.contains('menuItem')){
      var mis=el.menuEl.children; for(var m=0;m<mis.length;m++) if(mis[m]===t){ state.menu=m; var cat=MENU[m].id; applyCategory(cat); state.row=0; state.col=0; if(cat==='tv'||cat==='live'){ closeSidebar(); openLiveScreen(); } else { renderRows(); updateHeroFromItem(state.rows[0]&&state.rows[0].items[0]); closeSidebar(); } return; }
    }
    if(t.classList.contains('card')){
      var rowEl=t.parentNode&&t.parentNode.parentNode;
      var rows=el.rows.querySelectorAll('.row');
      for(var r=0;r<rows.length;r++) if(rows[r]===rowEl){
        var cards=rows[r].querySelectorAll('.card');
        for(var c=0;c<cards.length;c++) if(cards[c]===t){ focusAt(r,c); var it=state.rows[r]&&state.rows[r].items[c]; if(it) showDetail(it); return; }
      }
    }
    if(t.classList.contains('detailBtn')){
      var bs=el.detailActions.children; for(var d=0;d<bs.length;d++) if(bs[d]===t){ state.detailAction=d; if(d===0){ closeDetail(); Player.open(state.item); } else if(d===1){ toggleFav(state.item); renderDetailFav(); } return; }
    }
    if(t.classList.contains('similarCard')){
      var sc=el.similarStrip.children; for(var s=0;s<sc.length;s++) if(sc[s]===t){ state.similarIndex=s; showDetail(state.similar[s]); return; }
    }
    if(t.classList.contains('playerChip')){
      var pcs=el.playerControls.children; for(var p=0;p<pcs.length;p++) if(pcs[p]===t){ if(p===0) Player.togglePlay(); else if(p===1) Player.seek(-10); else if(p===2) Player.seek(10); else if(p===3) Player.openSettings(); return; }
    }
    if(t.id==='playerBack'){ Player.close(); return; }
    if(t.id==='livePlayBtn'){ var li=liveVisibleItems[state.liveItemIndex]; if(li){ closeLiveScreen(); Player.open(li); } return; }
    if(t.classList.contains('liveCatTab')){ var tabs=document.getElementById('liveCatTabs').children; for(var lc=0;lc<tabs.length;lc++) if(tabs[lc]===t){ state.liveCatIndex=lc; state.liveItemIndex=0; renderLiveCats(); renderLiveChannels(); return; } }
    if(t.classList.contains('liveChannelRow')){ var ch=document.getElementById('liveChannelInner').children; for(var lr=0;lr<ch.length;lr++) if(ch[lr]===t){ state.liveItemIndex=lr; var item=liveVisibleItems[lr]; if(item){ closeLiveScreen(); Player.open(item); } return; } }
    if(t.classList.contains('pickerOpt')){
      var pid=t.getAttribute('data-player');
      Player.pickerFocus='card';
      Player.pickerIndex=(pid==='jwplayer')?1:0;
      Player.renderPlayerPicker();
      return;
    }
    if(t.classList.contains('pickerBtn')){
      if(t.id==='pickerConfirm') Player.confirmPlayerPicker();
      else Player.cancelPlayerPicker();
      return;
    }
    if(t.id==='playerPickerRemember'){
      Player.rememberChoice=!!t.checked;
      return;
    }
  },false);

  document.addEventListener('mouseover',function(e){
    var t=e.target;
    while(t&&t!==document&&!(t.classList&&(t.classList.contains('card')||t.classList.contains('menuItem')||t.classList.contains('detailBtn')||t.classList.contains('similarCard')||t.classList.contains('liveCatTab')||t.classList.contains('liveChannelRow')))) t=t.parentNode;
    if(!t||t===document) return;
    if(t.classList.contains('card')){
      var rowEl=t.parentNode&&t.parentNode.parentNode; var rows=el.rows.querySelectorAll('.row');
      for(var r=0;r<rows.length;r++) if(rows[r]===rowEl){ var cards=rows[r].querySelectorAll('.card'); for(var c=0;c<cards.length;c++) if(cards[c]===t){ focusAt(r,c,true); return; } }
    }
    if(t.classList.contains('menuItem')){ var mis=el.menuEl.children; for(var m=0;m<mis.length;m++) if(mis[m]===t){ state.menu=m; state.sidebar=true; renderMenu(); return; } }
  },false);
}
bindPointerSupport();

try{
  if(window.webOS&&webOS.service){
    var wkeys=[13,461,27,37,38,39,40,415,19,413,412,417,403,404,405,406];
    webOS.service.request('luna://com.webos.service.ime',{
      method:'registerRemoteKey',
      parameters:{keys:wkeys},
      onSuccess:function(){}, onFailure:function(){}
    });
  }
}catch(e){}

Player.loadPlayerChoice();
loadHome();
})();
