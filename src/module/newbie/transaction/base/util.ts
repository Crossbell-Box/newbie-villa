import deepMerge_ from '@fastify/deepmerge';

export const deepMerge: ReturnType<typeof deepMerge_> = deepMerge_({
  // https://github.com/fastify/deepmerge#mergearray
  mergeArray: function replaceByClonedSource(options) {
    const clone = options.clone;
    return function (target, source) {
      return clone(source);
    };
  },
});
