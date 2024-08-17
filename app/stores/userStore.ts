export const useUserStore = defineStore('user', {
    state: () => ({
        user: null
    }),

    actions: {
        async fetchUser() {
            const { fetchUser: fetchUserFromStrapi } = useStrapiAuth();

            if (!this.user) {
                this.user = await fetchUserFromStrapi();
            }
        },
    },

    getters: {
        getUser(state) {
            if (!state.user) {
                this.fetchUser();
            }

            return state.user;
        },
    },
});
