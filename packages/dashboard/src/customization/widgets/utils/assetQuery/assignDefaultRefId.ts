import { v4 as uuid } from 'uuid';

import type { IoTSiteWiseDataStreamQuery } from '~/types';

export const assignDefaultRefId = (
  { assets = [], properties = [] }: IoTSiteWiseDataStreamQuery,
  getId: () => string = uuid
) => ({
  assets: assets.map(({ properties, ...others }) => ({
    ...others,
    properties: properties.map((propertyQuery) => ({
      ...propertyQuery,
      refId: propertyQuery.refId || getId(),
    })),
  })),
  properties: properties.map((propertyQuery) => ({
    ...propertyQuery,
    refId: propertyQuery.refId || getId(),
  })),
});
