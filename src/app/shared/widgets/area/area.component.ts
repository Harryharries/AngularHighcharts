import { Component, OnInit } from '@angular/core';
import * as HighCharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';

@Component({
  selector: 'app-widget-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.scss']
})
export class AreaComponent implements OnInit {

  chartOptions = {};
  Highcharts = HighCharts;

  constructor() { }

  ngOnInit(): void {
    Exporting(this.Highcharts);
      this.chartOptions = {
        chart: {
            type: 'area'
        },
        title: {
            text: 'Random DATA'
        },
        subtitle: {
            text: 'Demo',
        },
        tooltip: {
            shared: true,
            headerFormat: '<span style="font-size:12px"><b>{point.key}</b></span><br>'
        },
        credits: {
          enabled: false,
        },
        plotOptions: {
            series: {
                pointStart: 2012
            },
            area: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#666666'
                }
            }
        },
        series: [{
            name: 'Ocean transport',
            data: [13234, 12729, 11533, 17798, 10398, 12811, 15483, 16196, 16214]
        }, {
            name: 'Households',
            data: [6685, 6535, 6389, 6384, 6251, 5725, 5631, 5047, 5039]

        }, {
            name: 'Agriculture and hunting',
            data: [4752, 4820, 4877, 4925, 5006, 4976, 4946, 4911, 4913]
        }, {
            name: 'Air transport',
            data: [3164, 3541, 3898, 4115, 3388, 3569, 3887, 4593, 1550]

        }, {
            name: 'Construction',
            data: [2019, 2189, 2150, 2217, 2175, 2257, 2344, 2176, 2186]
        }]
    }

    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    })

  }

}
