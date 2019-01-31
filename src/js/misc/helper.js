export const Helper = {
    debounceTimeout: null,
    debounce(callback, wait) {
        return (...args) => {
            const context = this;
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => callback.apply(context, args), wait);
        }
    }
};