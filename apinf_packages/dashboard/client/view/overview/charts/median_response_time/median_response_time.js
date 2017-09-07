/* Copyright 2017 Apinf Oy
 This file is covered by the EUPL license.
 You may obtain a copy of the licence at
 https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Template } from 'meteor/templating';

// Meteor contributed packages import
import { TAPi18n } from 'meteor/tap:i18n';

// Npm packages imports
import moment from 'moment';
import Chart from 'chart.js';

Template.medianResponseTime.onRendered(function () {
  const instance = this;

  // Get ElasticSearch aggregated data
  const elasticsearchData = Template.currentData().buckets;

  // Get Labels for chart
  const labels = elasticsearchData.map(value => {
    // TODO: internationalize date formatting
    return moment(value.key).format('MM/DD');
  });

  // Get data for bar chart
  const data = elasticsearchData.map(value => {
    return parseInt(value.percentiles_response_time.values['50.0'], 10);
  });

  const id = instance.data.proxyBackendId;
  // Get querySelector to related <canvas>
  const querySelector = `[data-overview-id="${id}"] .median-response-time`;

  // Realize chart
  const ctx = document.querySelector(querySelector).getContext('2d');
  instance.chart = new Chart(ctx, {
    // The type of chart
    type: 'bar',

    // Data for displaying chart
    data: {
      labels,
      datasets: [
        {
          label: TAPi18n.__('medianResponseTime_pointTitle_time'),
          backgroundColor: '#C6C5C5',
          borderColor: '#959595',
          borderWidth: 1,
          data,
        },
      ],
    },

    // Configuration options
    options: {
      legend: {
        display: false,
      },
      layout: {
        padding: {
          left: 10,
        },
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
          },
        }],
      },
    },
  });

  // Reactive update Chart Axis translation
  instance.autorun(() => {
    const datasets = instance.chart.data.datasets;

    // Update translation
    datasets[0].label = TAPi18n.__('medianResponseTime_pointTitle_time');

    // Update chart with new translation
    instance.chart.update();
  });
});