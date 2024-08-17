<template>
	<UModal v-model="open">
		<UCard
			:ui="{
				ring: '',
				divide: 'divide-y divide-gray-100 dark:divide-gray-800',
			}"
		>
			<template #header>
				<div class="header">
					<h1>Freunde hinzufügen</h1>
					<UButton
						color="gray"
						variant="ghost"
						icon="i-heroicons-x-mark-20-solid"
						class="-my-1"
						@click="$emit('update:isOpen')"
					/>
				</div>
			</template>

			<h2>Freunde:</h2>
			<UCard v-for="friend in data?.currentUser.friends">
				<div class="container">
					{{ friend.username }}
					<UButton @click="visitProfile(friend.id)">Nutzerprofil</UButton>
				</div>
			</UCard>

			<h2>Freundesvorschläge:</h2>
			<UCard v-for="suggestedFriend in data.suggestedFriends">
				<div class="container">
					{{ suggestedFriend.username }}
					<UButton @click="visitProfile(suggestedFriend.id)"
						>Nutzerprofil</UButton
					>
					<UButton
						v-if="
							!data.sentFriendRequests.find((e) => {
								return e.attributes.receiver.data.id === suggestedFriend.id;
							}) &&
							!data?.receivedFriendRequests.find((e) => {
								return e.attributes.sender.data.id === suggestedFriend.id;
							})
						"
						@click="sendFriendRequest(suggestedFriend.id)"
						>Freundschaftsanfrage</UButton
					>
					<div
						v-else-if="
							data?.receivedFriendRequests.find((e) => {
								return e.attributes.sender.data.id === suggestedFriend.id;
							})
						"
					>
						<UButton
							@click="
								acceptFriendRequest(
									data.receivedFriendRequests.find((e) => {
										return e.attributes.sender.data.id === suggestedFriend.id;
									})?.id
								)
							"
							>Freundschaftsanfrage annehmen</UButton
						>
						<UButton
							color="red"
							@click="rejectFriendRequest(receivedFriendRequests.id)"
							>Freundschaftsanfrage ablehnen</UButton
						>
					</div>
					<UChip
						class="withdraw"
						v-else
						text="Withdraw"
						size="2xl"
						@click="
							withdrawFriendRequest(
								data?.sentFriendRequests.find((e) => {
									return e.attributes.receiver.data.id === suggestedFriend.id;
								})?.id
							)
						"
					>
						<UButton disabled>Pending...</UButton>
					</UChip>
				</div>
			</UCard>
			<h2>Freundschaftsanfragen:</h2>
			<UCard v-for="receivedFriendRequest in data.receivedFriendRequests">
				{{ receivedFriendRequest.attributes.sender.data.attributes.username }}
				<UButton @click="visitProfile(receivedFriendRequest.id)"
					>Nutzerprofil</UButton
				>
				<UButton @click="acceptFriendRequest(receivedFriendRequest.id)"
					>Freundschaftsanfrage annehmen</UButton
				>
				<UButton
					color="red"
					@click="rejectFriendRequest(receivedFriendRequest.id)"
					>Freundschaftsanfrage ablehnen</UButton
				>
			</UCard>
			<h2>Freunde suchen:</h2>
			<UInput v-model="searchForFriendsSearchTerm"></UInput>
			<UButton @click="searchFriends">Suchen</UButton>
			<UCard v-for="foundUser in foundUsers">
				{{ foundUser.username }}
				<UButton @click="visitProfile(foundUser.id)">Nutzerprofil</UButton>
				<UButton
					v-if="
						!data.sentFriendRequests.find((e) => {
							return e.attributes.receiver.data.id === foundUser.id;
						})
					"
					@click="sendFriendRequest(foundUser.id)"
					>Freundschaftsanfrage</UButton
				>
				<UChip v-else text="Withdraw" size="2xl" @click="withdrawFriendRequest">
					<UButton disabled>Pending...</UButton>
				</UChip>
			</UCard>
		</UCard>
	</UModal>
</template>
<script lang="ts" setup>
	const emit = defineEmits(["refresh", "update:isOpen"]);
	const props = defineProps(["isFriendsManagementOpen"]);

	const { find, create, update, delete: _delete } = useStrapi();
	const userStore = useUserStore();
	const foundUsers = ref([]);
	const searchForFriendsSearchTerm = ref("");

	const open = computed({
		get() {
			return props.isFriendsManagementOpen;
		},
		set(value) {
			emit("update:isOpen", value);
		},
	});

	const { data, refresh } = useAsyncData("data", async () => {
		const currentUser = await find("users/me", {
			populate: ["friends", "created", "isOpponent", "avatar", "achievements"],
		});

		const currentUserId = currentUser.id;
		const friendIds = currentUser.friends.map(
			(friend: { id: any }) => friend.id
		);
		const excludeIds = [currentUserId, ...friendIds];

		// Fetch friend requests where the current user is either sender or receiver
		const friendRequests = await find("friend-requests", {
			populate: ["sender", "receiver"],
			filters: {
				$or: [
					{ sender: { id: { $eq: currentUserId } } },
					{ receiver: { id: { $eq: currentUserId } } },
				],
			},
		});

		const sentFriendRequests = friendRequests.data.filter(
			(e) => e.attributes.sender.data.id === currentUserId
		);

		const receivedFriendRequests = friendRequests.data.filter(
			(e) =>
				e.attributes.receiver.data.id === currentUserId &&
				e.attributes.status === "pending"
		);

		const suggestedFriends = await find("users", {
			filters: {
				id: {
					$notIn: excludeIds,
				},
			},
			pagination: {
				start: 1,
				limit: 5,
			},
		});

		return {
			sentFriendRequests,
			receivedFriendRequests,
			suggestedFriends,
			currentUser,
		};
	});

	const acceptFriendRequest = async (id: number) => {
		await update("friend-requests", id, { status: "accepted" });
		refresh();
	};

	const rejectFriendRequest = async (id: number) => {
		await update("friend-requests", id, { status: "rejected" });
		refresh();
	};

	const sendFriendRequest = async (receiverId: any) => {
		await create("friend-requests", {
			sender: data.value?.currentUser.id,
			receiver: receiverId,
		});
		refresh();
	};

	const searchFriends = async () => {
		foundUsers.value = [];
		const currentUserId = data.value.currentUser.id;
		const friendIds = data.value.currentUser.friends.map(
			(friend: { id: any }) => friend.id
		);
		const excludeIds = [currentUserId, ...friendIds];

		const result = await find("users", {
			filters: {
				id: {
					$notIn: excludeIds,
				},
				username: {
					$contains: searchForFriendsSearchTerm.value,
				},
			},
		});

		result.forEach((e: any) => {
			foundUsers.value.push(e);
		});
	};

	const withdrawFriendRequest = async (id: number) => {
		await _delete("friend-requests", id);
		refresh();
	};

	const visitProfile = (id: any) => {
		navigateTo(`/users/${id}`);
	};
</script>
<style lang="scss" scoped>
	.header {
		display: flex;
		justify-content: space-between;
	}

	.container {
		display: flex;
		gap: 1rem;
	}
</style>
