import Joi from 'joi';
import * as ingestProcessorSchemas from './resources/ingest_processor_schemas';
import _ from 'lodash';

export default Joi.object({
  processors: Joi.array().items(_.values(ingestProcessorSchemas)).required().min(1),
  input: Joi.object().required(),
  dirty_processor_id: Joi.string()
});
