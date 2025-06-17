import { defineStore } from "pinia";

interface Tag {
  id: number;
  name: string;
  defaultMood?: {
    url: string;
  };
}

export const useArgumentTagsStore = defineStore("tags", {
  state: () => ({
    tags: [] as Tag[],
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchTags() {
      if (this.tags.length > 0) return;

      this.isLoading = true;
      this.error = null;

      try {
        const { find } = useStrapi();
        const response = await find("tags", {
          populate: {
            localizations: true,
            defaultMood: true,
          },
        });

        if (response?.data) {
          this.tags = response.data.map((tag: any) => {
            return {
              id: tag.id,
              name: tag.name || "",
              defaultMood: tag.defaultMood,
            };
          });
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
        this.error = "Failed to fetch tags";
      } finally {
        this.isLoading = false;
      }
    },
  },

  getters: {
    getTags: (state) => state.tags,
    getTagById: (state) => (id: number) =>
      state.tags.find((tag) => tag.id === id),
  },
});
