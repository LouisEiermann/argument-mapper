<template>
  <div class="h-[calc(100vh-140px)] mt-4 flex flex-col ring-1 ring-gray-200 dark:ring-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow">
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <ClientOnly>
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="flex flex-col"
        >
          <div class="mb-1 flex items-center gap-2 text-xs" :class="message.sender?.id == data?.currentUser?.id ? 'justify-end' : 'justify-start'">
            <span class="font-bold text-gray-700 dark:text-gray-300">
              {{ message.sender?.username || $t('general.unknown') }}
            </span>
            <span class="text-gray-400">
              {{ formatDate(message.createdAt || new Date().toISOString()) }}
            </span>
          </div>
          <UChatMessage
            :id="String(message.id)"
            role="user"
            :parts="[]"
            :content="message.content || ''"
            :avatar="{ src: message.sender?.avatar?.url ? useStrapiMedia(message.sender.avatar.url) : undefined, alt: message.sender?.username }"
            :side="message.sender?.id == data?.currentUser?.id ? 'right' : 'left'"
          />
        </div>
        <template #fallback>
          <div class="flex h-full items-center justify-center">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
          </div>
        </template>
      </ClientOnly>
    </div>

    <div class="p-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 shrink-0">
      <div class="flex gap-2">
          <UTextarea
            v-model="newMessage"
            :rows="1"
            autoresize
            class="flex-1 w-full"
            :placeholder="$t('general.newChatMessage')"
            @keydown.enter.prevent="sendMessage"
          />
          <UButton icon="i-heroicons-paper-airplane" @click="sendMessage">
              {{ $t("general.send") }}
          </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { io } from "socket.io-client";
import { useRoute } from "vue-router";

definePageMeta({
  middleware: "auth",
});

const messages = ref<any[]>([]);
const newMessage = ref("");
let socket: any = null;
const { create, find } = useStrapi();
const { params } = useRoute();

const { data } = useAsyncData("chat-user-data", async () => {
  try {
    const currentUser = await find("users/me", {
      populate: {
        chats: {
          populate: {
            participants: { populate: "avatar" },
            messages: { populate: { sender: { populate: "avatar" } } },
          },
        },
      },
    });
    return { currentUser };
  } catch (err) {
    console.error("Error fetching user data:", err);
    return { currentUser: null };
  }
}, { server: false, lazy: true });

const currentChat = computed(() => {
  const chats = data.value?.currentUser?.chats;
  if (!Array.isArray(chats)) return null;
  
  return chats.find((e: any) =>
    e.participants?.some((participant: any) => participant.id == params.user)
  );
});

watchEffect(() => {
  const msgs = currentChat.value?.messages;
  if (Array.isArray(msgs)) {
    messages.value = [...msgs].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else {
    // Keep existing messages or reset? 
    // If pulling fresh data, reset.
    if (data.value) messages.value = [];
  }
});

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentChat.value) return;

  try {
    await create("messages", {
      content: newMessage.value,
      sender: (data.value?.currentUser as any)?.id,
      chat: currentChat.value.id,
    });

    newMessage.value = "";
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

onMounted(() => {
  socket = io("http://localhost:1337");
  socket.on("test", (message: any) => {
    // Patch sender info if incomplete (e.g. missing avatar)
    const senderId = message.sender?.id || message.sender;
    
    let fullSender = null;
    if (currentChat.value?.participants) {
      fullSender = currentChat.value.participants.find((p: any) => String(p.id) === String(senderId));
    }

    if (fullSender) {
        if (typeof message.sender !== 'object' || message.sender === null) {
            message.sender = {};
        }
        // Ensure we have username and avatar
        message.sender.username = message.sender.username || fullSender.username;
        message.sender.avatar = message.sender.avatar || fullSender.avatar;
        message.sender.id = senderId;
    }

    messages.value.push(message);
    messages.value.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });
});

const formatDate = (date: string) => new Date(date).toLocaleTimeString();
</script>
