require('../../lib/stdlib.array.js');
var extend = require('util')._extend;

/**
* create a toolbox useful for input data into google datatable, and generate google.visualization by option and dom
* @constructor
* @version 0.0.1
*/
module.id='gchart';
/**
* input data into datatable
* @param {String} type - type name of this data that want to plot
* @param {Array} data - including three data, "data"(two layer array including values of each sample in every obs), "colnames"(sample names, single array), "rownames"(each obs points label)
* @returns {Object} this google datatable object and option
*/
module.exports.data_transform = function(type,data){
	var type2mod = {
		'line':'LineChart',
		'dist':'ComboChart',
		'pie':'PieChart',
		'bar':'BarChart',
		'column':'ColumnChart',
		'scatter':'ScatterChart',
		'treemap':'TreeMap',
		'map':'GeoChart',
		'bubble':'BubbleChart'
	}
	if(data.data.length != data.rownames.length){
		// check dimension
		console.log('please check array dimension');
	}else if(!(type in type2mod)){
		console.log('please check type need to in ['+Object.keys(type2mod).join(',')+']');
	}else{
		var attr = [];
		if(type=='dist'){
			attr.push('cumulate');
		}
		['SD','tree','annotation','tooltip_func','group'].map(function(v){
			if(v in data){
				attr.push(v);
			}
		});
		return {
			datatable:this.datatable(data,attr),
			mode:type2mod[type],
			options:this.set_options(data,attr)
		};
	}
}
/**
* set options by plot type and default type
* @param {Object} attr - attr including type and other options
* @returns {Object} this google chart option
*/
module.exports.set_options = function(data,attr){
	var options={
		series:{},
		vAxes:{}
	},
	d_count=0;
	// attr in each data item
	data.data.map(function(v,ind){
		if(attr.indexOf('cumulate')!=-1){
			options.series[d_count++]={type: "bars", targetAxisIndex: 0};
			options.series[d_count++]={type: "line", targetAxisIndex: 1};
		}
	}
	);
	// attr once
	if(attr.indexOf('cumulate')!=-1){
		options.vAxes[1] = {'title':'cumulative'};
	}
	return extend({chartArea:{width:"80%",height:"80%"}},options);
}
/**
* set options by plot type and default type
* @param {Object} args - args including type and other options
* @param {Array} attr - attribute of data or plot type
* @returns {Object} this google chart option
*/
module.exports.datatable = function(data,attr){
	// generate a new datatable to put info
	var dt = new google.visualization.DataTable();
	// set initial value
	var values=[data.colnames],
		t_data;
	dt.addColumn(typeof(data.colnames[0]), 'xlabel');
	// extra info before data
	if(attr.indexOf('tree')!=-1){
		dt.addColumn('string','Parent');
		values.push(data.colnames.map(function(v){
			return data.tree[v] || null;
		}));
	}
	data.data.map(function(v,ind){
		dt.addColumn('number', data.rownames[ind]);
		values.push(v);
		if(attr.indexOf('SD')!=-1){
			dt.addColumn({type:'number', role:'interval'});
			values.push(data.SD[ind].map(function(v_1,ind_1){return v[ind_1]+v_1}));
			dt.addColumn({type:'number', role:'interval'});
			values.push(data.SD[ind].map(function(v_1,ind_1){return v[ind_1]-v_1}));
		}
		if(attr.indexOf('cumulate')!=-1){
			dt.addColumn('number',data.rownames[ind]+'(cumulative)');
			t_data = v.reduce(function(a,b,ind_1){
				return a.concat(ind_1 && [a[ind_1-1]+b] || [b]);
			},[]);
			values.push(t_data);
		}
		if(attr.indexOf('annotation')!=-1){
			dt.addColumn({type:'string', role:'annotation'});
			values.push(data.annotation[ind]);
		}
		if(attr.indexOf('tooltip_func')!=-1){
			dt.addColumn({type:'string', role:'tooltip',p: {'html': true}});
			values.push(v.map(function(v_1,ind_1){
				return data.tooltip_func(v,v_1,[ind,ind_1])
			}));
		}
	});
	// extra info after data
	if(attr.indexOf('group')!=-1){
		dt.addColumn('string','Group');
		values.push(data.colnames.map(function(v,ind){
			return data.group[ind] || null;
		}));
	}
	dt.addRows(values.transpose());
	return dt;
}
