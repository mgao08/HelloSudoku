const sleep = (delay) => {
   return new Promise((resolve, reject) => {
      setTimeout(() => {
         resolve("ok");
      }, delay);
   });
}

const retryablePromise = (func, maxRetries = 3, delay = 0, tries = 0) => func().catch(async e => {
   tries++;
   if (tries <= maxRetries) {
      if (delay) {
         await sleep(delay * tries);
      }
    
      return retryablePromise(func, maxRetries, delay, tries);
   } else {
      throw(e);
   }
});

module.exports = {
   sleep,
   retryablePromise,
};