export const useArgumentTagsStore = defineStore('tags', {
    state: () => ({
        tags: []
    }),

    actions: {
        async fetchTags() {
            const { find } = useStrapi();

            if (this.tags.length === 0) {
                const tags = (await find("tags", {})).data.map((e) => {
                    return { id: e.id, name: e.attributes.name };
                });

                Array.prototype.push.apply(this.tags, tags);
            }
        },
    },

    getters: {
        getTags(state) {
            if (this.tags.length === 0) {
                this.fetchTags();
            }

            return state.tags;
        },
    }
})
