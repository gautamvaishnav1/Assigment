import NodeCache from "node-cache";

const tempUserCache = new NodeCache({
  stdTTL: 300,
 checkperiod: 60})

export default tempUserCache;