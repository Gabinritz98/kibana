/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import metricAggTemplate from '../../controls/sub_agg.html';
import _ from 'lodash';
import { AggConfig } from '../../../vis/agg_config';
import { Schemas } from '../../../vis/editors/default/schemas';
import { parentPipelineAggController } from './parent_pipeline_agg_controller';
import { parentPipelineAggWritter } from './parent_pipeline_agg_writter';
import { forwardModifyAggConfigOnSearchRequestStart } from './nested_agg_helpers';


const metricAggFilter = ['!top_hits', '!percentiles', '!percentile_ranks', '!median', '!std_dev'];
const metricAggSchema = (new Schemas([
  {
    group: 'none',
    name: 'metricAgg',
    title: 'Metric Agg',
    hideCustomLabel: true,
    aggFilter: metricAggFilter
  }
])).all[0];

const parentPipelineAggHelper = {
  subtype: 'Parent Pipeline Aggregations',
  params: function () {
    return [
      {
        name: 'customMetric',
        type: AggConfig,
        default: null,
        serialize: function (customMetric) {
          return customMetric.toJSON();
        },
        deserialize: function (state, agg) {
          return this.makeAgg(agg, state);
        },
        makeAgg: function (termsAgg, state) {
          state = state || { type: 'count' };
          state.schema = metricAggSchema;
          const metricAgg = new AggConfig(termsAgg.vis, state);
          metricAgg.id = termsAgg.id + '-metric';
          return metricAgg;
        },
        modifyAggConfigOnSearchRequestStart: forwardModifyAggConfigOnSearchRequestStart('customMetric'),
        write: _.noop
      },
      {
        name: 'buckets_path',
        write: _.noop
      },
      {
        name: 'metricAgg',
        editor: metricAggTemplate,
        default: 'custom',
        controller: parentPipelineAggController,
        write: parentPipelineAggWritter
      }
    ];
  },
  getFormat: function (agg) {
    let subAgg;
    if (agg.params.customMetric) {
      subAgg = agg.params.customMetric;
    } else {
      subAgg = agg.vis.getAggConfig().byId[agg.params.metricAgg];
    }
    return subAgg.type.getFormat(subAgg);
  }
};
export { parentPipelineAggHelper };
