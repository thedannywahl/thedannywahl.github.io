!function(e){function t(e){this.size=0,this.limit=e,this._keymap={}}var i=function(e){var t,i,s={};if(""===e)return{};for(t=0;t<e.length;t+=1)i=e[t].split("="),2===i.length&&(s[i[0]]=decodeURIComponent(i[1].replace(/\+/g," ")));return s};e.queryParams=function(){return i(window.location.search.substr(1).split("&"))},e.hashParams=function(){return i(window.location.hash.substr(1).split("&"))};var s=0;window.Swiftype=window.Swiftype||{},Swiftype.root_url=Swiftype.root_url||"https://api.swiftype.com",Swiftype.pingUrl=function(e,t){var i=setTimeout(t,350),s=new Image;return s.onload=s.onerror=function(){clearTimeout(i),t()},s.src=e,!1},Swiftype.pingAutoSelection=function(t,i,s,n){var o={t:(new Date).getTime(),engine_key:t,doc_id:i,prefix:s},a=Swiftype.root_url+"/api/v1/public/analytics/pas?"+e.param(o);Swiftype.pingUrl(a,n)},Swiftype.findSelectedSection=function(){function t(e){var t=e.replace(/\s+/g,"");return t=t.toLowerCase()}var i=e.hashParams().sts;i&&(i=t(i),e("h1, h2, h3, h4, h5, h6").each(function(){return $this=e(this),t($this.text()).indexOf(i)>=0?(this.scrollIntoView(!0),!1):void 0}))},Swiftype.htmlEscape=Swiftype.htmlEscape||function(e){return String(e).replace(/&/g,"&").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")},e.fn.swiftype=function(i){Swiftype.findSelectedSection();var i=e.extend({},e.fn.swiftype.defaults,i);return this.each(function(){var o=e(this),a=e.meta?e.extend({},i,o.data()):i;o.attr("autocomplete","off"),o.data("swiftype-config-autocomplete",a),o.submitted=!1,o.cache=new t(10),o.emptyQueries=[],o.isEmpty=function(t){return e.inArray(n(t),this.emptyQueries)>=0},o.addEmpty=function(e){o.emptyQueries.unshift(n(e))};var l=a.dropdownStylesFunction(o),u=e('<div class="'+a.widgetContainerClass+'" />'),c=e("<div />").addClass(a.suggestionListClass).appendTo(u).css(l).hide();u.appendTo(a.autocompleteContainingElement);var d=e("<"+a.suggestionListType+" />").appendTo(c);o.data("swiftype-list",d),o.abortCurrent=function(){o.currentRequest&&o.currentRequest.abort()},o.showList=function(){p(a.disableAutocomplete)===!1&&c.show()},o.hideList=function(e){e?c.hide():setTimeout(function(){c.hide()},10)},o.focused=function(){return o.is(":focus")},o.submitting=function(){o.submitted=!0},o.listResults=function(){return e(a.resultListSelector,d)},o.activeResult=function(){return o.listResults().filter("."+a.activeItemClass).first()},o.prevResult=function(){var e=o.listResults(),t=e.index(o.activeResult()),i=t-1,s=e.eq(i);o.listResults().removeClass(a.activeItemClass),i>=0&&s.addClass(a.activeItemClass)},o.nextResult=function(){var e=o.listResults(),t=e.index(o.activeResult()),i=t+1,s=e.eq(i);o.listResults().removeClass(a.activeItemClass),i>=0&&s.addClass(a.activeItemClass)},o.selectedCallback=function(e){return function(){var t=o.val(),i=function(){a.onComplete(e,t)};Swiftype.pingAutoSelection(a.engineKey,e.id,t,i)}},o.registerResult=function(e,t){e.data("swiftype-item",t),e.click(o.selectedCallback(t)).mouseover(function(){o.listResults().removeClass(a.activeItemClass),e.addClass(a.activeItemClass)})},o.getContext=function(){return{config:a,list:d,registerResult:o.registerResult}};var f,h=!1;o.lastValue="",o.keyup(function(e){return h?void(h=!1):void(e.which>36&&e.which<41||16==e.which||(a.typingDelay>0?(clearTimeout(f),f=setTimeout(function(){r(o)},a.typingDelay)):r(o)))}),o.styleDropdown=function(){c.css(a.dropdownStylesFunction(o))},e(window).resize(function(){o.styleDropdown()}),o.keydown(function(e){o.styleDropdown();var t=o.activeResult();switch(e.which){case 13:0!==t.length&&d.is(":visible")?(e.preventDefault(),o.selectedCallback(t.data("swiftype-item"))()):o.currentRequest&&o.submitting(),o.hideList(),h=!0;break;case 38:e.preventDefault(),0===t.length?o.listResults().last().addClass(a.activeItemClass):o.prevResult();break;case 40:e.preventDefault(),0===t.length?o.listResults().first().addClass(a.activeItemClass):t!=o.listResults().last()&&o.nextResult();break;case 27:o.hideList(),h=!0;break;default:o.submitted=!1}}),o.keypress(function(e){13==e.which&&o.activeResult().length>0&&e.preventDefault()});var v=!1,y=!1;e(document).bind("mousedown.swiftype"+ ++s,function(){v=!0}),e(document).bind("mouseup.swiftype"+s,function(){v=!1,y&&(y=!1,o.hideList())}),o.blur(function(){v?y=!0:o.hideList()}),o.focus(function(){setTimeout(function(){o.select()},10),o.listResults().filter(":not(."+a.noResultsClass+")").length>0&&o.showList()})})};var n=function(t){return e.trim(t).toLowerCase()},o=function(t,i){t.abortCurrent();var s={},o=t.data("swiftype-config-autocomplete");s.q=i,s.engine_key=o.engineKey,s.search_fields=p(o.searchFields),s.fetch_fields=p(o.fetchFields),s.filters=p(o.filters),s.document_types=p(o.documentTypes),s.functional_boosts=p(o.functionalBoosts),s.sort_field=p(o.sortField),s.sort_direction=p(o.sortDirection),s.per_page=o.resultLimit;var a=Swiftype.root_url+"/api/v1/public/engines/suggest.json";t.currentRequest=e.ajax({type:"GET",dataType:"jsonp",url:a,data:s}).success(function(e){var s=n(i);return e.record_count>0?(t.cache.put(s,e.records),void l(t,e.records,i)):(t.addEmpty(s),t.data("swiftype-list").empty(),void t.hideList())})},a=function(e,t){var i=n(t);if(e.isEmpty(i))return e.data("swiftype-list").empty(),void e.hideList();var s=e.cache.get(i);s?l(e,s,t):o(e,t)},r=function(t){var i=t.val();if(i!==t.lastValue)return t.lastValue=i,""===e.trim(i)?(t.data("swiftype-list").empty(),void t.hideList()):void("undefined"!=typeof t.data("swiftype-config-autocomplete").engineKey&&a(t,i))},l=function(e,t){var i=e.data("swiftype-list"),s=e.data("swiftype-config-autocomplete");i.empty(),e.hideList(!0),s.resultRenderFunction(e.getContext(),t);var n=e.listResults().length;(n>0&&e.focused()||void 0!==s.noResultsMessage)&&(e.submitted?e.submitted=!1:e.showList())},u=function(t,i){var s=t.list,n=t.config;e.each(i,function(i,o){e.each(o,function(o,a){t.registerResult(e("<li>"+n.renderFunction(i,a)+"</li>").appendTo(s),a)})})},c=function(e,t){return'<p class="title">'+Swiftype.htmlEscape(t.title)+"</p>"},d=function(e){window.location=e.url},f=function(t){var i=t.data("swiftype-config-autocomplete"),s=i.attachTo?e(i.attachTo):t,n=s.offset(),o={position:"absolute","z-index":9999,top:n.top+s.outerHeight()+1,left:n.left};return i.setWidth&&(o.width=s.outerWidth()-2),o},p=function(e){if(void 0!==e){var t=e;return"function"==typeof t&&(t=t.call()),t}return void 0};t.prototype.put=function(e,t){var i={key:e,value:t};return this._keymap[e]=i,this.tail?(this.tail.newer=i,i.older=this.tail):this.head=i,this.tail=i,this.size===this.limit?this.shift():void this.size++},t.prototype.shift=function(){var e=this.head;return e&&(this.head.newer?(this.head=this.head.newer,this.head.older=void 0):this.head=void 0,e.newer=e.older=void 0,delete this._keymap[e.key]),e},t.prototype.get=function(e,t){var i=this._keymap[e];if(void 0!==i)return i===this.tail?i.value:(i.newer&&(i===this.head&&(this.head=i.newer),i.newer.older=i.older),i.older&&(i.older.newer=i.newer),i.newer=void 0,i.older=this.tail,this.tail&&(this.tail.newer=i),this.tail=i,t?i:i.value)},t.prototype.remove=function(e){var t=this._keymap[e];if(t)return delete this._keymap[t.key],t.newer&&t.older?(t.older.newer=t.newer,t.newer.older=t.older):t.newer?(t.newer.older=void 0,this.head=t.newer):t.older?(t.older.newer=void 0,this.tail=t.older):this.head=this.tail=void 0,this.size--,t.value},t.prototype.clear=function(){this.head=this.tail=void 0,this.size=0,this._keymap={}},t.prototype.keys="function"==typeof Object.keys?function(){return Object.keys(this._keymap)}:function(){var e=[];for(var t in this._keymap)e.push(t);return e},e.fn.swiftype.defaults={activeItemClass:"active",attachTo:void 0,documentTypes:void 0,filters:void 0,engineKey:void 0,searchFields:void 0,functionalBoosts:void 0,sortField:void 0,sortDirection:void 0,fetchFields:void 0,noResultsClass:"noResults",noResultsMessage:void 0,onComplete:d,resultRenderFunction:u,renderFunction:c,dropdownStylesFunction:f,resultLimit:void 0,suggestionListType:"ul",suggestionListClass:"autocomplete",resultListSelector:"li",setWidth:!0,typingDelay:80,disableAutocomplete:!1,autocompleteContainingElement:"body",widgetContainerClass:"swiftype-widget"}}(jQuery);
(function($,window,undefined){'$:nomunge';var str_hashchange='hashchange',doc=document,fake_onhashchange,special=$.event.special,doc_mode=doc.documentMode,supports_onhashchange='on'+str_hashchange in window&&(doc_mode===undefined||doc_mode>7);function get_fragment(url){url=url||location.href;var index=url.indexOf('#');return index===-1?'#':url.substr(index);};$.fn[str_hashchange]=function(fn){return fn?this.bind(str_hashchange,fn):this.trigger(str_hashchange);};$.fn[str_hashchange].delay=50;special[str_hashchange]=$.extend(special[str_hashchange],{setup:function(){if(supports_onhashchange){return false;}
$(fake_onhashchange.start);},teardown:function(){if(supports_onhashchange){return false;}
$(fake_onhashchange.stop);}});fake_onhashchange=(function(){var self={},timeout_id,last_hash=get_fragment(),fn_retval=function(val){return val;},history_set=fn_retval,history_get=fn_retval;self.start=function(){timeout_id||poll();};self.stop=function(){timeout_id&&clearTimeout(timeout_id);timeout_id=undefined;};function poll(){var hash=get_fragment(),history_hash=history_get(last_hash);if(hash!==last_hash){history_set(last_hash=hash,history_hash);$(window).trigger(str_hashchange);}else if(history_hash!==last_hash){location.href=location.href.replace(/#.*/,'')+history_hash;}
timeout_id=setTimeout(poll,$.fn[str_hashchange].delay);};window.attachEvent&&!window.addEventListener&&!supports_onhashchange&&(function(){var iframe,iframe_src;self.start=function(){if(!iframe){iframe_src=$.fn[str_hashchange].src;iframe_src=iframe_src&&iframe_src+get_fragment();iframe=$('<iframe tabindex="-1" title="empty"/>').hide().one('load',function(){iframe_src||history_set(get_fragment());poll();}).attr('src',iframe_src||'javascript:0').insertAfter('body')[0].contentWindow;doc.onpropertychange=function(){try{if(event.propertyName==='title'){iframe.document.title=doc.title;}}catch(e){}};}};self.stop=fn_retval;history_get=function(){return get_fragment(iframe.location.href);};history_set=function(hash,history_hash){var iframe_doc=iframe.document,domain=$.fn[str_hashchange].domain;if(hash!==history_hash){iframe_doc.title=doc.title;iframe_doc.open();domain&&iframe_doc.write('<script>document.domain="'+domain+'"</script>');iframe_doc.close();iframe.location.hash=hash;}};})();return self;})();})(jQuery,this);
!function(e){function t(e){return String(e).replace(/&/g,"&").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}var n=function(e){var t,n,i={};if(""===e)return{};for(t=0;t<e.length;t+=1)n=e[t].split("="),2===n.length&&(i[n[0]]=decodeURIComponent(n[1].replace(/\+/g," ")));return i};e.queryParams=function(){return n(window.location.search.substr(1).split("&"))},e.hashParams=function(){return n(window.location.hash.substr(1).split("&"))},window.Swiftype=window.Swiftype||{},Swiftype.root_url=Swiftype.root_url||"https://api.swiftype.com",Swiftype.pingUrl=function(e,t){var n=setTimeout(t,350),i=new Image;return i.onload=i.onerror=function(){clearTimeout(n),t()},i.src=e,!1},Swiftype.pingSearchResultClick=function(t,n,i){var a={t:(new Date).getTime(),engine_key:t,doc_id:n,q:Swiftype.currentQuery},r=Swiftype.root_url+"/api/v1/public/analytics/pc?"+e.param(a);Swiftype.pingUrl(r,i)},e.fn.swiftypeSearch=function(t){var t=e.extend({},e.fn.swiftypeSearch.defaults,t);return this.each(function(){var n=e(this),i=e.meta?e.extend({},t,n.data()):t;n.data("swiftype-config-search",i),n.selectedCallback=function(t){return function(n){var a=e(this);n.preventDefault(),Swiftype.pingSearchResultClick(i.engineKey,t.id,function(){window.location=a.attr("href")})}},n.registerResult=function(t,i){t.data("swiftype-item",i),e("a",t).click(n.selectedCallback(i))},n.getContentCache=function(){return e("#"+o)};var a=e(i.resultContainingElement),r=a.html(),o="st-content-cache",s=n.getContentCache(),c=function(e,t){location.hash="stq="+encodeURIComponent(e)+"&stp="+t},l=function(t,n){function c(e){if(void 0!==e){var t=e;return"function"==typeof t&&(t=t.call()),t}return void 0}n=e.extend({page:1},n);var l={};s.length||(a.after("<div id='"+o+"' style='display: none;'></div>"),s.html(r).hide()),i.loadingFunction(t,a),Swiftype.currentQuery=t,l.q=t,l.engine_key=i.engineKey,l.page=n.page,l.per_page=i.perPage,l.search_fields=c(i.searchFields),l.fetch_fields=c(i.fetchFields),l.facets=c(i.facets),l.filters=c(i.filters),l.document_types=c(i.documentTypes),l.functional_boosts=c(i.functionalBoosts),l.sort_field=c(i.sortField),l.sort_direction=c(i.sortDirection),l.spelling=c(i.spelling),e.getJSON(Swiftype.root_url+"/api/v1/public/engines/search.json?callback=?",l).success(d)};e(window).hashchange(function(){var t=e.hashParams();if(t.stq)l(t.stq,{page:t.stp});else{var i=n.getContentCache();i.length&&(a.html(i.html()),i.remove())}});var u=n.parents("form");u&&u.bind("submit",function(e){e.preventDefault();var t=n.val();c(t,1)}),e(document).on("click","[data-hash][data-page]",function(t){t.preventDefault();var n=e(this);c(e.hashParams().stq,n.data("page"))}),e(document).on("click","[data-hash][data-spelling-suggestion]",function(t){t.preventDefault();var n=e(this);c(n.data("spelling-suggestion"),1)});var d=function(e){"function"==typeof i.preRenderFunction&&i.preRenderFunction.call(n,e),i.renderResultsFunction(n.getContext(),e),"function"==typeof i.postRenderFunction&&i.postRenderFunction.call(n,e)};n.getContext=function(){return{config:i,resultContainer:a,registerResult:n.registerResult}},e(window).hashchange()})};var i=function(t,n){var i,a=-1,r=t.config;e.each(n,function(e,t){t.num_pages>a&&(i=e,a=t.num_pages)});var o=n[i].current_page,s=n[i].num_pages;e(r.renderPaginationForType(i,o,s)).appendTo(t.resultContainer)},a=function(t,n){var a=t.resultContainer,r=t.config;a.html(""),e.each(n.records,function(n,i){e.each(i,function(i,o){t.registerResult(e(r.renderFunction(n,o)).appendTo(a),o)})}),i(t,n.info)},r=function(e,n){return'<div class="st-result"><h3 class="title"><a href="'+n.url+'" class="st-search-result-link">'+t(n.title)+"</a></h3></div>"},o=function(e,t){t.html('<p class="st-loading-message">loading...</p>')},s=function(t){var n=0,i=this.getContext().resultContainer,a=null;t.info&&e.each(t.info,function(e,t){n+=t.total_result_count,t.spelling_suggestion&&(a=t.spelling_suggestion.text)}),0===n&&i.html("<div id='st-no-results' class='st-no-results'>No results found.</div>"),null!==a&&i.append('<div class="st-spelling-suggestion">Did you mean <a href="#" data-hash="true" data-spelling-suggestion="'+a+'">'+a+"</a>?</div>")},c=function(e,t,n){var i,a,r='<div class="st-page">';return 1!=t&&(i=t-1,r=r+'<a href="#" class="st-prev" data-hash="true" data-page="'+i+'">&laquo; previous</a>'),n>t&&(a=t+1,r=r+'<a href="#" class="st-next" data-hash="true" data-page="'+a+'">next &raquo;</a>'),r+="</div>"};e.fn.swiftypeSearch.defaults={attachTo:void 0,documentTypes:void 0,facets:void 0,filters:void 0,engineKey:void 0,searchFields:void 0,functionalBoosts:void 0,sortField:void 0,sortDirection:void 0,fetchFields:void 0,preRenderFunction:void 0,postRenderFunction:s,loadingFunction:o,renderResultsFunction:a,renderFunction:r,renderPaginationForType:c,perPage:10,spelling:"strict"}}(jQuery);
var stSearch = function() {var query=document.getElementById("st-search-input").value;window.location.href="/search/#stq="+query+"&stp=1";};
			var stRenderFunction = function(documentType, item) {
				var header = '<header><h2><a class="st-search-result-link" href="' + item['url'] + '">' + item['title'] + '</a></h2></header>'
				var body = '<div class="text"><p>' + item['body'] + '</p></div>';
				return '<article>' + header + body + '</article>';
			};
			$( '<li class="nav-search-form"><form action="#" onsubmit="stSearch();return false;" autocomplete="on"><label id="nav-search-label" for="st-search-input">Search:</label><input id="search_submit" value="Search" type="submit"><input id="st-search-input-nav" name="search" type="text" placeholder="search https://iyware.com"></form></li>' ).insertAfter( ".nav-search" );
			$("#st-search-input-nav").swiftype({
				engineKey: "sg3kn6rAnozjxvM4k8nk"
			});
			$("#st-search-input-nav").swiftypeSearch({
				renderFunction: stRenderFunction,
				perPage: 5,
				engineKey: "sg3kn6rAnozjxvM4k8nk",
				resultContainingElement: "#st-results-container"
			});
			$("#st-search-input2").swiftype({
				engineKey: "sg3kn6rAnozjxvM4k8nk"
			});
			$("#st-search-input2").swiftypeSearch({
				renderFunction: stRenderFunction,
				perPage: 5,
				engineKey: "sg3kn6rAnozjxvM4k8nk",
				resultContainingElement: "#st-results-container"
			});