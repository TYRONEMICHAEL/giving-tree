import { type ConditionType, type Filter, type RangeFilter, type SimpleFilter } from '@giving-tree/core';

function translateMatchFilter<M> (filter: SimpleFilter<M>): any {
  return Array.isArray(filter.value)
    ? { key: filter.field, match: { any: filter.value } }
    : { key: filter.field, match: { value: filter.value } };
}

function translateRangeFilter<M> (filter: RangeFilter<M>): any {
  const rangeQuery: any = { key: filter.field, range: {} };
  if (filter.gte !== undefined) rangeQuery.range.gte = filter.gte;
  if (filter.lte !== undefined) rangeQuery.range.lte = filter.lte;
  return rangeQuery;
}

const filterTypeToTranslator: { [K in ConditionType]: (filter: any) => any } = {
  Match: translateMatchFilter,
  Range: translateRangeFilter
  // Add other filter types here
};

export function translateFilterToQdrant<M> (filter: Filter<M>): any {
  if ('operator' in filter) {
    const operatorMapping = {
      AND: 'must',
      OR: 'should',
      NOT: 'must_not'
    };

    const translatedFilters = filter.filters.map(translateFilterToQdrant);
    return { [operatorMapping[filter.operator]]: translatedFilters };
  }

  const translator = filterTypeToTranslator[filter.type];
  return translator(filter);
}
