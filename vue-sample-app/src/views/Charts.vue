<template>
  <div>
    <div class="text-h4 pb-2">Charts</div>
    <div class="charts-wrapper">
      <div class="chart" ref="firstChart"></div>
      <div class="chart" ref="secondChart"></div>
      <div class="chart" ref="thirdChart"></div>
    </div>

  </div>
</template>
<script>
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

export default {
  name: "Charts",
  mounted() {
    am4core.useTheme(am4themes_animated);
    this.createFirstChart()
    this.createSecondChart()
    this.createThirdChart()

  },
  methods: {
    createFirstChart() {
      let chart = am4core.create(this.$refs.firstChart, am4charts.PieChart);

      let title = chart.titles.create();
      title.text = "Chart #1 title";
      title.fontSize = 20;
      title.marginBottom = 30;

// Add data
      chart.data = [{
        "country": "Lithuania",
        "litres": 501.9
      }, {
        "country": "Czechia",
        "litres": 301.9
      }, {
        "country": "Ireland",
        "litres": 201.1
      }, {
        "country": "Germany",
        "litres": 165.8
      }, {
        "country": "Australia",
        "litres": 139.9
      }, {
        "country": "Austria",
        "litres": 128.3
      }, {
        "country": "UK",
        "litres": 99
      }, {
        "country": "Belgium",
        "litres": 60
      }, {
        "country": "The Netherlands",
        "litres": 50
      }];

// Add and configure Series
      let pieSeries = chart.series.push(new am4charts.PieSeries());
      pieSeries.dataFields.value = "litres";
      pieSeries.dataFields.category = "country";
      pieSeries.slices.template.stroke = am4core.color("#fff");
      pieSeries.slices.template.strokeWidth = 2;
      pieSeries.slices.template.strokeOpacity = 1;

// This creates initial animation
      pieSeries.hiddenState.properties.opacity = 1;
      pieSeries.hiddenState.properties.endAngle = -90;
      pieSeries.hiddenState.properties.startAngle = -90;
    },
    createSecondChart() {
      var chart = am4core.create(this.$refs.secondChart, am4charts.XYChart);

      let title = chart.titles.create();
      title.text = "Chart #2 title";
      title.fontSize = 20;
      title.marginBottom = 30;

      chart.data = [{
        "country": "USA",
        "visits": 2025
      }, {
        "country": "China",
        "visits": 1882
      }, {
        "country": "Japan",
        "visits": 1809
      }, {
        "country": "Germany",
        "visits": 1322
      }, {
        "country": "UK",
        "visits": 1122
      }, {
        "country": "France",
        "visits": 1114
      }, {
        "country": "India",
        "visits": 984
      }, {
        "country": "Spain",
        "visits": 711
      }, {
        "country": "Netherlands",
        "visits": 665
      }, {
        "country": "Russia",
        "visits": 580
      }, {
        "country": "South Korea",
        "visits": 443
      }, {
        "country": "Canada",
        "visits": 441
      }];

      chart.padding(40, 40, 40, 40);

      var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.dataFields.category = "country";
      categoryAxis.renderer.minGridDistance = 60;
      categoryAxis.renderer.inversed = true;
      categoryAxis.renderer.grid.template.disabled = true;

      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.extraMax = 0.1;
//valueAxis.rangeChangeEasing = am4core.ease.linear;
//valueAxis.rangeChangeDuration = 1500;

      var series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.categoryX = "country";
      series.dataFields.valueY = "visits";
      series.tooltipText = "{valueY.value}"
      series.columns.template.strokeOpacity = 0;
      series.columns.template.column.cornerRadiusTopRight = 10;
      series.columns.template.column.cornerRadiusTopLeft = 10;
//series.interpolationDuration = 1500;
//series.interpolationEasing = am4core.ease.linear;
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      labelBullet.label.verticalCenter = "bottom";
      labelBullet.label.dy = -10;
      labelBullet.label.text = "{values.valueY.workingValue.formatNumber('#.')}";

      chart.zoomOutButton.disabled = true;

// as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
      series.columns.template.adapter.add("fill", function (fill, target) {
        return chart.colors.getIndex(target.dataItem.index);
      });

      setInterval(function () {
        am4core.array.each(chart.data, function (item) {
          item.visits += Math.round(Math.random() * 200 - 100);
          item.visits = Math.abs(item.visits);
        })
        chart.invalidateRawData();
      }, 2000)

      categoryAxis.sortBySeries = series;
    },
    createThirdChart() {
      var chart = am4core.create(this.$refs.thirdChart, am4charts.XYChart);

      let title = chart.titles.create();
      title.text = "Chart #3 title";
      title.fontSize = 20;
      title.marginBottom = 30;

      var data = [];
      var value = 50;
      for(var i = 0; i < 300; i++){
        var date = new Date();
        date.setHours(0,0,0,0);
        date.setDate(i);
        value -= Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
        data.push({date:date, value: value});
      }

      chart.data = data;

// Create axes
      var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.minGridDistance = 60;

      chart.yAxes.push(new am4charts.ValueAxis());

// Create series
      var series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = "value";
      series.dataFields.dateX = "date";
      series.tooltipText = "{value}"

      series.tooltip.pointerOrientation = "vertical";

      chart.cursor = new am4charts.XYCursor();
      chart.cursor.snapToSeries = series;
      chart.cursor.xAxis = dateAxis;

//chart.scrollbarY = new am4core.Scrollbar();
      chart.scrollbarX = new am4core.Scrollbar();
    }
  }
};
</script>
<style scoped lang="scss">
.charts-wrapper {
  display: flex;
  flex-wrap: wrap;
}

.chart {
  height: 400px;
  margin: 24px;
  width: calc(50% - 48px);
}
</style>
