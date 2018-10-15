require('../../../lib/stdlib.HTMLElement.js');
require('../../../lib/stdlib.HTMLFormElement.js');
var tools = {
		gchart:require('../gchart.js'),
		ajax:require('../../../lib/promise.request.js')
	},
	extend = require('util')._extend;
module.exports.tools = tools;
var search_form = function(sear_d,dom){
	var tag2dict = {
		ntspec:sear_d.species,
		ntsero:[],
		refsero:[],
		host:sear_d.host,
		continent:sear_d.continent,
		country:[],
		'year[]':sear_d.year
	};
	for(var i in tag2dict){
		var t_div = {name:'div',attr:{style:'display:inline-block'},
			child:[{name:'p',child:[i]},{name:'select',attr:{name:i,size:4},child:[
				{name:'option',attr:{value:0,selected:'selected'},child:['ALL']}
			]}]
		};
		var t_sel = t_div.child[1];
		// add options
		tag2dict[i].reduce(function(a,b){
			if(typeof b === "string"){b=[b,b]};
			t_sel.child.push({name:'option',attr:{value:b[0]},child:[b[1]]});
			return t_sel;
		},t_sel);
		dom.append_by_array([t_div]);
	}
	dom.append_by_array([{name:'input',attr:{type:'submit'}}]);
	// add auto_ch
	dom.ntspec.onchange = function(e){auto_ch(e.target,dom.ntsero);auto_ch(e.target,dom.refsero)};
	dom.continent.onchange = function(e){auto_ch(e.target,dom.country)};
	dom.onsubmit = function(e){
		e.preventDefault();
		var t_val = extend({s_type:'type',o_type:'search'},e.target.val());
		tools.ajax.get('/evidence/ncbi_search/',t_val).then(function(data){
			data = JSON.parse(data);
			return geo_d2plot(data2geo(data.data),tools.doms.plot);
		});
	};
	return sear_d;
};
var auto_ch = function(from_tgt,to_tgt){
	var n2key = {ntsero:'species2serotype',refsero:'species2refserotype',country:'continent2country'};
	var sel_ind = from_tgt.value;
	var t_n = to_tgt.getAttribute('name');
	var opts = sel_ind=='0' ? []:tools.sear_d[n2key[t_n]][sel_ind];
	to_tgt.innerHTML = '';
	to_tgt.append_by_array(opts.reduce(function(a,b){
		return a.concat([{name:'option',attr:{value:b[0]},child:[b[1]]}]);
	},[{name:'option',attr:{value:0,selected:'selected'},child:['ALL']}]));
}
/**
* input table table to get ctrys, locus and unassigned
* @constructs data2geo
* @param {object} data - 2 layer array
* @returns {Object} ctrys, locus, unassigned
*/
var data2geo = function(data){
	var ctrys=[], locus=[], unassigned=[],t_ctry,ind_ctry;
	data.map(function(v){
		t_ctry = v[5],ind_ctry = ctrys.indexOf(t_ctry);
		if(t_ctry=='unassigned'){
			unassigned.push(v[0]);
		}else{
			if(ind_ctry==-1){
				ctrys.push(t_ctry);
				locus.push([]);
				// re-index
				ind_ctry = ctrys.indexOf(t_ctry);
			}
			locus[ind_ctry].push(v[0]);
		}
	});
	return {ctrys:ctrys,locus:locus,unassigned:unassigned};
};
/**
* plot geochart by geo data
* @constructs geo_d2plot
* @param {object} geodata - ctrys, locus, unassigned
* @param {object} dom - dom of plot
* @returns {Object} geodata
*/
var geo_d2plot = function(geodata,dom){
	var plot_d = {
			data:[geodata.locus.map(function(v){return v.length})],
			colnames:['seq_num'],
			rownames:geodata.ctrys
		},
		dt = tools.gchart.data_transform('map',plot_d),
		dom_plot = document.body.querySelector('div[name=plot]'),
		chart = new google.visualization[dt.mode](dom_plot);
	chart.draw(dt.datatable,dt.options);
	// count info
	tools.doms.info.innerHTML = 'seq in unassigned country:'+geodata.unassigned.length;
	return geodata;
}

window.onload = function(){
	google.charts.load('current', {packages: ['corechart','treemap']});
	tools.doms = Array.prototype.slice.apply(document.body.querySelectorAll('[name]')).reduce(function(a,b){
		a[b.getAttribute('name')] = b;
		return a;
	},{});
	tools.ajax.get('/evidence/static/json/search.json').then(function(data){
		tools.sear_d = JSON.parse(data);
		search_form(tools.sear_d,tools.doms.form);
	});
	google.charts.setOnLoadCallback(function(){
		var ajax_str = '/evidence/ncbi_search/?s_type=type&o_type=search&des=&ntspec=4&ntsero=42&refsero=0&host=0&continent=0&country%5B%5D=0&year%5B%5D=0';
		tools.ajax.get(ajax_str).then(function(data){
			data = JSON.parse(data);
			return geo_d2plot(data2geo(data.data),tools.doms.plot);
		});
	});
};
