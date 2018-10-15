# gchartjs
wrapper of google chart api datatable

## Introduction
Wrap the datatable of google chart api to adapt multiple plot module

The [Demo][] page

## Requirements
Need load google chart api and load packages in window.onload before render by it.

And you need to require it when you use our script in browser
```html
	<script src="https://www.gstatic.com/charts/loader.js"></script>
	<script src="./gchart.min.js"></script>
	<script>
		google.charts.load('current', {packages: ['corechart','treemap']});
		google.charts.setOnLoadCallback(function(){plot();});
	</script>
```
## Usage
1. use gchart module to generate associated object
```js
	var tdata = [[1,2],[3,4]]; // 2 layer array
	var colnames = ['cond1','cond2']; // item tag
	var rownames = ['sample1','sample2'];// sample tag
	var t_dt = gchart.data_transform('line',{
		data:tdata,
		rownames:rownames,
		colnames:colnames
	});
	// t_dt wil be a object with 'mode','datatable','options'
```

2. render it by google chart api
```js
	var dom_chart = document.querySelector('#chart');
	var mchart = new google.visualization[t_dt.mode](dom_chart);
	mchart.draw(t_dt.datatable,t_dt.options);
```

[demo]:	http://wyubin.github.io/gchartjs/	"multiple plot theme for data"