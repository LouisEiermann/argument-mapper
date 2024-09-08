<template>
	<UCard>
		<div v-if="messages.length">
			<div
				v-for="message in messages"
				:key="message.id"
				class="p-4"
				v-bind:class="{ 'text-right': message.sender.id == params.user }"
			>
				<p class="font-bold">{{ message.sender?.username || "Unknown" }}</p>
				<p>{{ message.content }}</p>
				<span class="text-xs">{{ formatDate(message.createdAt) }}</span>
				<p>{{ message.sender.id }}</p>
			</div>
		</div>

		<template #footer>
			<div class="flex">
				<UInput
					v-model="newMessage"
					type="text"
					placeholder="Neue Chatnachricht"
					variant="none"
				/>
				<UButton @click="sendMessage">Send</UButton>
			</div>
		</template>
	</UCard>
</template>

<script setup lang="ts">
	import { ref, computed, watchEffect, onMounted } from "vue";
	import { io } from "socket.io-client";
	import { useRoute } from "vue-router";

	definePageMeta({
		middleware: "auth",
	});

	const messages = ref([]);
	const newMessage = ref("");
	const socket = io("http://localhost:1337");
	const { create, find } = useStrapi();
	const { params } = useRoute();

	// Async data fetch with proper error handling
	const { data, refresh, pending, error } = useAsyncData("data", async () => {
		try {
			const currentUser = await find("users/me", {
				populate: {
					chats: {
						populate: {
							participants: true,
							messages: { populate: { sender: true } },
						},
					},
				},
			});
			return { currentUser };
		} catch (err) {
			console.error("Error fetching user data:", err);
			return { currentUser: null }; // Return a fallback object
		}
	});

	// Computed property with defensive coding to prevent errors
	const currentChat = computed(() => {
		if (!data.value?.currentUser) return null; // Ensure currentUser is loaded
		return data.value.currentUser.chats?.find((e) =>
			e.participants.some((participant) => participant.id == params.user)
		);
	});

	// Watch effect to update messages list when the current chat changes
	watchEffect(() => {
		if (currentChat.value && currentChat.value.messages) {
			messages.value = [...currentChat.value.messages].sort(
				(a, b) => new Date(a.createdAt) - new Date(b.createdAt) // Sort messages by timestamp
			);
		}
	});

	// Function to send a new message
	const sendMessage = async () => {
		if (!newMessage.value.trim() || !currentChat.value) return;

		try {
			const newMsg = await create("messages", {
				content: newMessage.value,
				sender: data.value?.currentUser.id,
				chat: currentChat.value.id,
			});

			// Directly add the sent message to the list (optimistic update)
			messages.value.push(newMsg);
			messages.value.sort(
				(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
			);

			newMessage.value = "";
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};

	onMounted(() => {
		socket.on("test", (message) => {
			if (currentChat.value && message.chatId === currentChat.value.id) {
				messages.value.push(message);
				messages.value.sort(
					(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
				);
			}
		});
	});

	// Utility to format message timestamps
	const formatDate = (date) => new Date(date).toLocaleTimeString();
</script>
