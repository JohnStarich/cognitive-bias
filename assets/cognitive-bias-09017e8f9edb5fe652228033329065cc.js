"use strict"
define("cognitive-bias/app",["exports","cognitive-bias/resolver","ember-load-initializers","cognitive-bias/config/environment"],function(e,t,n,i){Object.defineProperty(e,"__esModule",{value:!0})
var a=Ember.Application.extend({modulePrefix:i.default.modulePrefix,podModulePrefix:i.default.podModulePrefix,Resolver:t.default,customEvents:{paste:"paste"}});(0,n.default)(a,i.default.modulePrefix),e.default=a}),define("cognitive-bias/components/flash-message",["exports","ember-cli-flash/components/flash-message"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t.default}})}),define("cognitive-bias/controllers/index",["exports","cognitive-bias/utils"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0})
e.default=Ember.Controller.extend({statements:Ember.inject.service(),flashMessages:Ember.inject.service(),win:!1,notWin:Ember.computed("win",function(){return!1!==this.get("win")}),init:function(){this._super.apply(this,arguments)
var e=this.get("store"),s=e.createRecord("person",{id:"person-0",name:"You"}),r=n.map(function(t,n){return e.createRecord("topic",Object.assign({id:n},t))}),o=t.default.chooseRandomElements(a,3),l=t.default.chooseRandomElements(i,3),d=t.default.generateRange(3).map(function(n){return e.createRecord("person",{id:"person-"+(n+1),name:o[n],beliefs:(i=n,t.default.chooseRandomElements(r,3).map(function(t,n){return e.createRecord("belief",{id:"person-"+i+"-belief-"+n,topic:t,agreement:Math.round(100*Math.random())})})),trustLevel:0,color:l[n]})
var i})
this.set("player",s),this.set("people",d)},updatePlayerBeliefs:function(e,t,n){var i=this.get("store"),a=this.get("player")
this.set("chat","")
var s=a.get("beliefs").toArray(),r=t.get("id"),o=s.find(function(e){return e.get("topic.id")===r})
if(void 0!==o)return o.set("agreement",n),void o.set("sentence",e)
var l=i.createRecord("belief",{id:(new Date).toString()+"-"+Math.random(),topic:t,agreement:n,sentence:e})
s.push(l),a.set("beliefs",s)},updateOtherPeopleBeliefs:function(e,t){var n=e.get("id")
this.get("people").forEach(function(e){var i=e.get("beliefs").find(function(e){return e.get("topic.id")===n})
if(void 0!==i){var a=e.get("trustLevel"),s=i.get("agreement"),r=(100-Math.abs(t-s))/100,o=.2*r+a/100,l=s*(o=t>50?1+o:1-o)
l=Math.min(100,Math.max(1,l)),i.set("agreement",l)
var d=a+10*r
d=Math.min(100,Math.max(1,d)),e.set("trustLevel",d)}}),100==this.get("averageTrust")&&this.set("win",!0)},averageTrust:Ember.computed("people.@each.trustLevel",function(){var e=this.get("people").reduce(function(e,t){var n=t.get("trustLevel")
return e.mean=(e.mean*e.count+n)/(e.count+1),e.count+=1,e},{count:0,mean:0}).mean
return Math.round(e)}),actions:{say:function(e){var t=this.get("statements").extractAgreement(e)
if(void 0!==t){var n=t.topic,i=t.agreement
this.updatePlayerBeliefs(e,n,i),this.updateOtherPeopleBeliefs(n,i)}else this.get("flashMessages").danger("Unrecognized topic. Try re-wording it to match someone's beliefs.")},paste:function(){return!1}}})
var n=[{description:["tomatoes are vegetables","tomatoes are fruits"],negatedDescription:["tomatoes are not vegetables","tomatoes are not fruits"]},{description:["sleep is optional","sleep is not important","sleep is bad"],negatedDescription:["sleep is not optional","sleep is important","sleep is good"]},{description:["we need fewer guns","guns are bad"],negatedDescription:["we need more guns","guns are good"]},{description:["war is good","war is peace"],negatedDescription:["war is wrong","war is bad"]},{description:["ignorance is strength","ignorance is good"],negatedDescription:["ignorance is weakness","ignorance is bad"]},{description:["universal healthcare is harmful","universal healthcare is bad"],negatedDescription:["universal healthcare is good","universal healthcare is helpful"]},{description:["weed should be legal","weed should not be illegal"],negatedDescription:["weed should be illegal","weed should not be legal"]},{description:["obedience is best","obedience is important","independence is bad"],negatedDescription:["independence is important","independence is good","obedience is bad"]},{description:["selfishness is useful","selfishness is good"],negatedDescription:["selfishness is harmful","selfishness is bad"]},{description:["freedom is good","slavery is bad"],negatedDescription:["freedom is slavery","freedom is bad","slavery is good"]}],i=["red","blue","green","purple","orange","teal"],a=["Alice","Bob","Candice","Daniel","Elise","Fred","Gloria"]}),define("cognitive-bias/flash/object",["exports","ember-cli-flash/flash/object"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t.default}})}),define("cognitive-bias/helpers/app-version",["exports","cognitive-bias/config/environment","ember-cli-app-version/utils/regexp"],function(e,t,n){function i(e){var i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},a=t.default.APP.version,s=i.versionOnly||i.hideSha,r=i.shaOnly||i.hideVersion,o=null
return s&&(i.showExtended&&(o=a.match(n.versionExtendedRegExp)),o||(o=a.match(n.versionRegExp))),r&&(o=a.match(n.shaRegExp)),o?o[0]:a}Object.defineProperty(e,"__esModule",{value:!0}),e.appVersion=i,e.default=Ember.Helper.helper(i)}),define("cognitive-bias/helpers/person-head",["exports"],function(e){function t(e){return void 0===e&&(e=""),Ember.String.htmlSafe('\n    <svg class="person-head" fill="'+e+'" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26" version="1.1" width="26px" height="26px">\n    <g id="surface1">\n    <path d="M 16.5625 15.898438 C 16.402344 15.847656 15.398438 15.394531 16.027344 13.484375 L 16.019531 13.484375 C 17.65625 11.800781 18.90625 9.085938 18.90625 6.414063 C 18.90625 2.308594 16.175781 0.15625 13 0.15625 C 9.824219 0.15625 7.109375 2.308594 7.109375 6.414063 C 7.109375 9.097656 8.351563 11.820313 10 13.503906 C 10.640625 15.1875 9.492188 15.8125 9.253906 15.898438 C 5.929688 17.101563 2.03125 19.292969 2.03125 21.457031 C 2.03125 22.039063 2.03125 21.6875 2.03125 22.269531 C 2.03125 25.214844 7.742188 25.886719 13.03125 25.886719 C 18.328125 25.886719 23.96875 25.214844 23.96875 22.269531 C 23.96875 21.6875 23.96875 22.039063 23.96875 21.457031 C 23.96875 19.230469 20.050781 17.054688 16.5625 15.898438 Z "/>\n    </g>\n    </svg>\n  ')}Object.defineProperty(e,"__esModule",{value:!0}),e.personHead=t,e.default=Ember.Helper.helper(t)}),define("cognitive-bias/helpers/pluralize",["exports","ember-inflector/lib/helpers/pluralize"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=t.default}),define("cognitive-bias/helpers/singularize",["exports","ember-inflector/lib/helpers/singularize"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=t.default}),define("cognitive-bias/initializers/app-version",["exports","ember-cli-app-version/initializer-factory","cognitive-bias/config/environment"],function(e,t,n){Object.defineProperty(e,"__esModule",{value:!0})
var i=void 0,a=void 0
n.default.APP&&(i=n.default.APP.name,a=n.default.APP.version),e.default={name:"App Version",initialize:(0,t.default)(i,a)}}),define("cognitive-bias/initializers/container-debug-adapter",["exports","ember-resolver/resolvers/classic/container-debug-adapter"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"container-debug-adapter",initialize:function(){var e=arguments[1]||arguments[0]
e.register("container-debug-adapter:main",t.default),e.inject("container-debug-adapter:main","namespace","application:main")}}}),define("cognitive-bias/initializers/ember-data",["exports","ember-data/setup-container","ember-data"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"ember-data",initialize:t.default}}),define("cognitive-bias/initializers/export-application-global",["exports","cognitive-bias/config/environment"],function(e,t){function n(){var e=arguments[1]||arguments[0]
if(!1!==t.default.exportApplicationGlobal){var n
if("undefined"!=typeof window)n=window
else if("undefined"!=typeof global)n=global
else{if("undefined"==typeof self)return
n=self}var i,a=t.default.exportApplicationGlobal
i="string"==typeof a?a:Ember.String.classify(t.default.modulePrefix),n[i]||(n[i]=e,e.reopen({willDestroy:function(){this._super.apply(this,arguments),delete n[i]}}))}}Object.defineProperty(e,"__esModule",{value:!0}),e.initialize=n,e.default={name:"export-application-global",initialize:n}}),define("cognitive-bias/initializers/flash-messages",["exports","cognitive-bias/config/environment"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.initialize=r
var n=Ember.deprecate,i=Ember.assign||Ember.merge,a="[ember-cli-flash] Future versions of ember-cli-flash will no longer inject the service automatically. Instead, you should explicitly inject it into your Route, Controller or Component with `Ember.inject.service`.",s={timeout:3e3,extendedTimeout:0,priority:100,sticky:!1,showProgress:!1,type:"info",types:["success","info","warning","danger","alert","secondary"],injectionFactories:["route","controller","view","component"],preventDuplicates:!1}
function r(){var e=arguments[1]||arguments[0],r=(t.default||{}).flashMessageDefaults,o=(r||[]).injectionFactories,l=i(s,r),d=!(o&&o.length)
e.register("config:flash-messages",l,{instantiate:!1}),e.inject("service:flash-messages","flashMessageDefaults","config:flash-messages"),n(a,d,{id:"ember-cli-flash.deprecate-injection-factories",until:"2.0.0"}),l.injectionFactories.forEach(function(t){e.inject(t,"flashMessages","service:flash-messages")})}e.default={name:"flash-messages",initialize:r}}),define("cognitive-bias/instance-initializers/ember-data",["exports","ember-data/initialize-store-service"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"ember-data",initialize:t.default}}),define("cognitive-bias/models/belief",["exports","ember-data"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=t.default.Model.extend({statements:Ember.inject.service(),topic:t.default.belongsTo("topic"),agreement:t.default.attr(),sentence:Ember.computed("topic","agreement",function(){var e=this.get("topic"),t=this.get("agreement")
return this.get("statements").generateSentence(e,t)})})}),define("cognitive-bias/models/person",["exports","ember-data"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=t.default.Model.extend({name:t.default.attr(),beliefs:t.default.hasMany("belief"),trustLevel:t.default.attr(),color:t.default.attr(),believesAnything:Ember.computed("trustLevel",function(){return 100==this.get("trustLevel")})})}),define("cognitive-bias/models/topic",["exports","ember-data"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=t.default.Model.extend({description:t.default.attr(),negatedDescription:t.default.attr()})}),define("cognitive-bias/resolver",["exports","ember-resolver"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=t.default}),define("cognitive-bias/router",["exports","cognitive-bias/config/environment"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0})
var n=Ember.Router.extend({location:t.default.locationType,rootURL:t.default.rootURL})
n.map(function(){}),e.default=n}),define("cognitive-bias/services/ajax",["exports","ember-ajax/services/ajax"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t.default}})}),define("cognitive-bias/services/flash-messages",["exports","ember-cli-flash/services/flash-messages"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t.default}})}),define("cognitive-bias/services/statements",["exports","cognitive-bias/utils"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.Service.extend({store:Ember.inject.service(),generateSentence:function(e,a){var s=void 0,r=void 0
a>50?(s=(a-50)/50,r=t.default.randomElement(e.get("description"))):(s=(50-a)/50,r=t.default.randomElement(e.get("negatedDescription")))
var o=Math.floor(s*(n.length-1))
0===o&&(r=t.default.randomElement(e.get("description")))
var l=n[o]
return""+l[t.default.randomInt(l.length)]+r+i[t.default.randomInt(i.length)]},extractAgreement:function(e){var t=this.get("store"),i=e.toLowerCase(),a=n.findIndex(function(e){return void 0!==e.find(function(e){return i.startsWith(e.toLowerCase())})});-1===a&&(a=n.length-1)
var s=a/n.length,r=t.peekAll("topic").toArray(),o=r.find(function(e){return e.get("description").find(function(e){return i.includes(e)})})
if(void 0!==o)return{agreement:50+50*s,topic:o}
var l=r.find(function(e){return e.get("negatedDescription").find(function(e){return i.includes(e)})})
return void 0!==l?{agreement:50-50*s,topic:l}:void 0}})
var n=[["I don't know whether or not ","I don't know if ","I am not sure if ","I'm not sure if "],["Rumor has it that ","I am told ","I'm told "],["I have heard ","I've heard ","I have read ","I've read "],["I think ","I believe "],["I am pretty sure ","I'm pretty sure ","I am sure ","I'm sure "],["I am certain ","I'm certain "],["Obviously ","I know for a fact ","Clearly "]],i="........!"}),define("cognitive-bias/templates/application",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.HTMLBars.template({id:"Dl1dHRbo",block:'{"symbols":["flash"],"statements":[[6,"header"],[10,"class","site-header"],[8],[0,"\\n\\t"],[6,"h1"],[10,"class","site-title"],[8],[0,"Cognitive Bias"],[9],[0,"\\n\\t"],[6,"h2"],[10,"class","site-tagline"],[8],[0,"A game to explore cognitive biases we experience in our daily lives"],[9],[0,"\\n"],[9],[0,"\\n\\n"],[6,"div"],[10,"class","alerts-container"],[8],[0,"\\n\\t"],[6,"div"],[10,"class","alerts"],[8],[0,"\\n"],[4,"each",[[22,["flashMessages","queue"]]],null,{"statements":[[0,"\\t\\t"],[1,[26,"flash-message",null,[["flash"],[[21,1,[]]]]],false],[0,"\\n"]],"parameters":[1]},null],[0,"\\t"],[9],[0,"\\n"],[9],[0,"\\n\\n"],[1,[20,"outlet"],false],[0,"\\n\\n"],[6,"footer"],[10,"class","site-footer"],[8],[0,"\\n\\t© 2018 John Starich\\n"],[9],[0,"\\n"]],"hasEval":false}',meta:{moduleName:"cognitive-bias/templates/application.hbs"}})}),define("cognitive-bias/templates/index",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.HTMLBars.template({id:"tP4fBHyp",block:'{"symbols":["person","belief","belief"],"statements":[[6,"div"],[11,"class",[26,"if",[[22,["win"]],"win-status win","win-status"],null],null],[8],[0,"\\n"],[4,"if",[[22,["win"]]],null,{"statements":[[0,"\\t\\t"],[6,"div"],[10,"class","win-description"],[8],[0,"\\n\\t\\t\\t"],[6,"h2"],[8],[0,"Congratulations, you won!"],[9],[0,"\\n\\t\\t\\t"],[6,"p"],[8],[0,"In this game, you may have noticed how easy it is for people to change their minds and agree with you — even if you only state your beliefs. "],[9],[0,"\\n\\t\\t\\t"],[6,"p"],[8],[6,"em"],[8],[0,"If a statement feels familiar or is repeated often enough, you are more likely to believe it is true."],[9],[9],[0,"\\n\\t\\t\\t"],[6,"p"],[8],[0,"This is a form of cognitive bias called “the illusory truth effect.” You can read more about the effect through its research"],[6,"a"],[10,"class","source"],[10,"target","_blank"],[10,"href","https://doi.org/10.5964%2Fejop.v8i2.456"],[8],[0,"1"],[9],[6,"a"],[10,"class","source"],[10,"target","_blank"],[10,"href","https://doi.org/10.1037%2Fa0021323"],[8],[0,"2"],[9],[0," or on "],[6,"a"],[10,"target","_blank"],[10,"href","https://en.wikipedia.org/wiki/Illusory_truth_effect"],[8],[0,"Wikipedia"],[9],[0,". Thanks for playing!"],[9],[0,"\\n\\t\\t"],[9],[0,"\\n"]],"parameters":[]},null],[9],[0,"\\n\\n"],[6,"div"],[10,"class","person player"],[8],[0,"\\n\\t"],[6,"div"],[10,"class","person-identity"],[8],[0,"\\n\\t\\t"],[1,[26,"person-head",[[22,["player","color"]]],null],false],[0,"\\n\\t\\t"],[6,"div"],[10,"class","person-name"],[8],[1,[22,["player","name"]],false],[9],[0,"\\n\\t"],[9],[0,"\\n\\t"],[6,"div"],[10,"class","person-beliefs"],[8],[0,"\\n\\t\\t"],[6,"ul"],[8],[0,"\\n"],[4,"each",[[22,["player","beliefs"]]],null,{"statements":[[0,"\\t\\t\\t"],[6,"li"],[10,"class","person-belief"],[8],[1,[21,3,["sentence"]],false],[9],[0,"\\n"]],"parameters":[3]},null],[0,"\\t\\t"],[9],[0,"\\n\\t\\t"],[1,[26,"input",null,[["type","placeholder","autofocus","autocomplete","class","enter","value","disabled","paste"],["text","Say something...",true,"off","player-chat",[26,"action",[[21,0,[]],"say"],null],[22,["chat"]],[22,["notWin"]],[26,"action",[[21,0,[]],"paste"],null]]]],false],[0,"\\n\\t"],[9],[0,"\\n\\t"],[6,"div"],[10,"class","trust"],[8],[0,"Average trust: "],[1,[20,"averageTrust"],false],[0,"%"],[9],[0,"\\n"],[9],[0,"\\n\\n"],[6,"ul"],[10,"class","person-list"],[8],[0,"\\n"],[4,"each",[[22,["people"]]],null,{"statements":[[0,"\\t"],[6,"li"],[10,"class","person"],[8],[0,"\\n\\t\\t"],[6,"div"],[10,"class","person-identity"],[8],[0,"\\n\\t\\t\\t"],[1,[26,"person-head",[[21,1,["color"]]],null],false],[0,"\\n\\t\\t\\t"],[6,"div"],[10,"class","person-name"],[8],[1,[21,1,["name"]],false],[9],[0,"\\n\\t\\t"],[9],[0,"\\n\\t\\t"],[6,"ul"],[10,"class","person-beliefs"],[8],[0,"\\n"],[4,"if",[[21,1,["believesAnything"]]],null,{"statements":[[0,"\\t\\t\\t"],[6,"li"],[10,"class","person-belief"],[8],[1,[26,"if",[[22,["chat"]],[22,["chat"]],"..."],null],false],[9],[0,"\\n"]],"parameters":[]},{"statements":[[4,"each",[[21,1,["beliefs"]]],null,{"statements":[[0,"\\t\\t\\t\\t"],[6,"li"],[10,"class","person-belief"],[8],[1,[21,2,["sentence"]],false],[9],[0,"\\n"]],"parameters":[2]},null]],"parameters":[]}],[0,"\\t\\t"],[9],[0,"\\n\\t"],[9],[0,"\\n"]],"parameters":[1]},null],[9],[0,"\\n\\n"]],"hasEval":false}',meta:{moduleName:"cognitive-bias/templates/index.hbs"}})}),define("cognitive-bias/utils",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0})
var t={generateRange:function(e){return Array.from({length:e},function(e,t){return t})},randomInt:function(e){return Math.floor(Math.random()*e)},randomElement:function(e){return e[t.randomInt(e.length)]},chooseRandomElements:function(e,n){for(var i=new Set,a=[];a.length<n||e.length<n;){var s=t.randomInt(e.length)
i.has(s)||(i.add(s),a.push(e[s]))}return a}}
e.default=t}),define("cognitive-bias/config/environment",[],function(){try{var e="cognitive-bias/config/environment",t=document.querySelector('meta[name="'+e+'"]').getAttribute("content"),n={default:JSON.parse(unescape(t))}
return Object.defineProperty(n,"__esModule",{value:!0}),n}catch(t){throw new Error('Could not read config from meta tag with name "'+e+'".')}}),runningTests||require("cognitive-bias/app").default.create({name:"cognitive-bias",version:"0.0.0+b2fb0870"})
