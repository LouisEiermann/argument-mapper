import { ref } from "vue";
import type { Ref } from "vue";
const { find } = useStrapi();

export const useUserStore = defineStore("user", {
  state: () => ({
    user: ref(null) as Ref<any>,
  }),

  actions: {
    async fetchUser() {
      const user = await find("users/me", {
        populate: {
          friends: true,
        },
      });
      this.user.value = user;
    },
  },

  getters: {
    getUser(state) {
      return state.user?.value || null;
    },
  },
});
