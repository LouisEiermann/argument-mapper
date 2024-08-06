<template>
	<UContainer>
		<UContainer class="avatar">
			<UAvatar
				v-if="socialData?.currentUser.avatar"
				:src="useStrapiMedia(socialData?.currentUser.avatar.url)"
				:alt="socialData?.currentUser.username"
				size="3xl"
			/>
		</UContainer>
		<UContainer>
			<h1 class="text-center mt-8">
				{{ socialData?.currentUser.username }}
			</h1>
			<p v-if="socialData">
				Beigetreten: {{ formatDate(socialData?.currentUser.createdAt, locale) }}
			</p>
		</UContainer>
		<UDivider class="my-8" />
		<h1 class="beliefs">Meine Überzeugungen</h1>
		<UModal v-model="isModalOpen">
			<UCard
				:ui="{
					ring: '',
					divide: 'divide-y divide-gray-100 dark:divide-gray-800',
				}"
			>
				<template #header>
					<div class="header">
						<h1>Neue Überzeugung</h1>
						<UButton
							color="gray"
							variant="ghost"
							icon="i-heroicons-x-mark-20-solid"
							class="-my-1"
							@click="isModalOpen = false"
						/>
					</div>
				</template>
				<div class="space-y-6">
					<UInput type="text" v-model="title" :placeholder="$t('Titel')" />
					<UInput type="text" v-model="premise" :placeholder="$t('Prämisse')" />
					<UInput
						type="text"
						v-model="node1"
						:placeholder="$t('Begründung 1')"
					/>
					<UInput
						type="text"
						v-model="node2"
						:placeholder="$t('Begründung 2')"
					/>
					<USelectMenu
						:options="socialData?.availableTags"
						multiple
						v-model="selectedTags"
						placeholder="Tags auswählen"
						value-attribute="id"
						option-attribute="name"
					>
						<UButton
							label="Tags"
							trailing-icon="i-heroicons-chevron-down-20-solid"
					/></USelectMenu>
				</div>

				<template #footer>
					<UButton @click="onNewThesis">Hinzufügen</UButton></template
				>
			</UCard>
		</UModal>
		<div class="grid-container">
			<UCard v-for="standpoint in socialData?.standpoints" class="grid-item">
				{{ standpoint.title }}
				<UButton :to="'/argument/' + standpoint.id">Zum Standpunkt</UButton>
			</UCard>
			<UCard class="grid-item"
				><UButton @click="isModalOpen = true">+</UButton></UCard
			>
		</div>
		<UDivider class="my-8" />
		<UButton label="Freunde" @click="isFriendsManagementOpen = true" />
		<UDivider class="my-8" />
		<UButton label="Open" @click="isSettingsOpen = true">
			{{ $t("account.settings") }}
		</UButton>
		<UModal v-model="isSettingsOpen">
			<UCard
				:ui="{
					ring: '',
					divide: 'divide-y divide-gray-100 dark:divide-gray-800',
				}"
			>
				<template #header>
					<h1>{{ $t("account.settings") }}</h1>
					<UButton
						color="gray"
						variant="ghost"
						icon="i-heroicons-x-mark-20-solid"
						class="-my-1"
						@click="isSettingsOpen = false"
					/>
				</template>
				<p>Avatar ändern:</p>
				<UInput
					type="file"
					@change="handleFileChange"
					icon="i-heroicons-folder"
					class="upload-avatar"
				/>

				<UDivider>Danger Zone</UDivider>
				<UButton color="red" @click="onDeleteUser">Konto löschen</UButton>
			</UCard>
		</UModal>
		<UModal v-model="isFriendsManagementOpen">
			<UCard
				:ui="{
					ring: '',
					divide: 'divide-y divide-gray-100 dark:divide-gray-800',
				}"
			>
				<template #header>
					<h1>Freunde hinzufügen</h1>
					<UButton
						color="gray"
						variant="ghost"
						icon="i-heroicons-x-mark-20-solid"
						class="-my-1"
						@click="isFriendsManagementOpen = false"
					/>
				</template>

				<h2>Freunde:</h2>
				<UCard v-for="friend in socialData?.currentUser.friends">
					{{ friend.username }}
					<UButton @click="visitProfile(friend.id)">Nutzerprofil</UButton>
				</UCard>

				<h2>Freundesvorschläge:</h2>
				<UCard v-for="suggestedFriend in socialData.suggestedFriends">
					{{ suggestedFriend.username }}
					<UButton @click="visitProfile(suggestedFriend.id)"
						>Nutzerprofil</UButton
					>
					<UButton
						v-if="
							!socialData.sentFriendRequests.find((e) => {
								return e.attributes.receiver.data.id === suggestedFriend.id;
							}) &&
							!socialData?.receivedFriendRequests.find((e) => {
								return e.attributes.sender.data.id === suggestedFriend.id;
							})
						"
						@click="sendFriendRequest(suggestedFriend.id)"
						>Freundschaftsanfrage</UButton
					>
					<div
						v-else-if="
							socialData?.receivedFriendRequests.find((e) => {
								return e.attributes.sender.data.id === suggestedFriend.id;
							})
						"
					>
						<UButton
							@click="
								acceptFriendRequest(
									socialData.receivedFriendRequests.find((e) => {
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
								socialData?.sentFriendRequests.find((e) => {
									return e.attributes.receiver.data.id === suggestedFriend.id;
								})?.id
							)
						"
					>
						<UButton disabled>Pending...</UButton>
					</UChip>
				</UCard>
				<h2>Freundschaftsanfragen:</h2>
				<UCard
					v-for="receivedFriendRequest in socialData.receivedFriendRequests"
				>
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
							!socialData.sentFriendRequests.find((e) => {
								return e.attributes.receiver.data.id === foundUser.id;
							})
						"
						@click="sendFriendRequest(foundUser.id)"
						>Freundschaftsanfrage</UButton
					>
					<UChip
						v-else
						text="Withdraw"
						size="2xl"
						@click="withdrawFriendRequest"
					>
						<UButton disabled>Pending...</UButton>
					</UChip>
				</UCard>
			</UCard>
		</UModal>
		<UDivider class="my-8" />
		<UButton to="/learn">Lernen</UButton>
		<UDivider class="my-8" />
		<div>Meine Argumente:</div>
		<UCard v-for="argument in socialData?.sentArgumentRequests">
			{{ argument.id }}
			<UButton :to="'/argument/' + argument.id" v-if="argument.opponentAccepted"
				>Zum Argument</UButton
			>
			<UChip
				class="withdraw"
				v-else
				text="Argumentanfrage zurückziehen"
				size="2xl"
				@click="withdrawArgumentRequest(argument.id)"
			>
				<UButton disabled>Pending...</UButton>
			</UChip>
		</UCard>
		<UCard v-for="argument in socialData?.receivedArgumentRequests">
			{{ argument.id }}
			<UButton :to="'/argument/' + argument.id" v-if="argument.opponentAccepted"
				>Zum Argument</UButton
			>
			<div v-else>
				<UButton @click="acceptArgumentRequest(argument.id)"
					>Argumentanfrage annehmen</UButton
				>
				<UButton color="red" @click="rejectArgumentRequest(argument.id)"
					>Argumentanfrage ablehnen</UButton
				>
			</div>
		</UCard>
		<UContainer>
			<div v-for="achievenment of socialData?.currentUser.achievements">
				{{ achievenment.name }}
			</div>
		</UContainer>
	</UContainer>
</template>
<script setup lang="ts">
	definePageMeta({
		middleware: "auth",
	});

	const { fetchUser } = useStrapiAuth();
	const { find, create, update, delete: _delete } = useStrapi();
	const client = useStrapiClient();
	const { formatDate } = useDateFormatter();
	const { locale } = useI18n();
	const ownUser = await fetchUser();

	const { data: socialData, refresh } = useAsyncData("socialData", async () => {
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

		const sentArgumentRequests = currentUser.created.filter((e) => {
			return !e.isUnilateral;
		});

		const receivedArgumentRequests = currentUser.isOpponent;

		const suggestedFriends = await find("users", {
			filters: {
				id: {
					$notIn: excludeIds,
				},
			},
			pagination: {
				start: 1,
				limit: 10,
			},
		});

		const standpoints = currentUser.created.filter(
			(e: { isUnilateral: boolean }) => {
				return e.isUnilateral;
			}
		);

		const availableTags = (await find("tags", {})).data.map((e) => {
			return { id: e.id, name: e.attributes.name };
		});

		return {
			sentFriendRequests,
			receivedFriendRequests,
			sentArgumentRequests,
			receivedArgumentRequests,
			suggestedFriends,
			currentUser,
			standpoints,
			availableTags,
		};
	});

	const isSettingsOpen = ref(false);
	const isFriendsManagementOpen = ref(false);
	const foundUsers = ref([]);
	const searchForFriendsSearchTerm = ref("");
	const isModalOpen = ref();
	const title = ref();
	const premise = ref();
	const node1 = ref();
	const node2 = ref();
	const selectedTags = ref([]);
	const response = ref();

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
			sender: socialData.value?.currentUser.id,
			receiver: receiverId,
		});
		refresh();
	};

	const searchFriends = async () => {
		foundUsers.value = [];
		const currentUserId = socialData.value.currentUser.id;
		const friendIds = socialData.value.currentUser.friends.map(
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

	const acceptArgumentRequest = async (id: number) => {
		await update("argument-trees", id, { opponentAccepted: true });
		refresh();
	};

	const rejectArgumentRequest = async (id: number) => {
		await _delete("argument-trees", id);
		refresh();
	};

	const withdrawArgumentRequest = async (id: number) => {
		await _delete("argument-trees", id);
		refresh();
	};

	const onDeleteUser = async () => {
		try {
			await client(`/users/${socialData.value?.currentUser.id}`, {
				method: "DELETE",
			});

			await navigateTo("/");
		} catch (e) {}
	};

	const visitProfile = (id: any) => {
		navigateTo(`/users/${id}`);
	};

	const handleFileChange = async (event: {
		target: { files: (string | Blob)[] };
	}) => {
		const formData = new FormData();

		formData.append("files", event.target.files[0]);
		formData.append("ref", "plugin::users-permissions.user");
		formData.append("refId", socialData.value.currentUser.id);
		formData.append("field", "avatar");

		await client("/upload", {
			method: "POST",
			body: formData,
		});
		refresh();
	};

	const onNewThesis = async () => {
		const thesis = (
			await create("nodes", {
				Title: premise.value,
				Thesis: true,
				owner: ownUser.value?.id,
			})
		).data;

		const newReasonId = await create("nodes", {
			Title: node1.value,
			parent: thesis.id,
			owner: ownUser.value?.id,
		});
		const newReason2Id = await create("nodes", {
			Title: node2.value,
			parent: thesis.id,
			owner: ownUser.value?.id,
		});

		response.value = { newReasonId: newReasonId, newReason2Id: newReason2Id };

		await update("nodes", response.value.newReasonId.data.id, {
			siblings: [response.value.newReason2Id.data.id],
		});
		await update("nodes", response.value.newReason2Id.data.id, {
			siblings: [response.value.newReasonId.data.id],
		});

		await create("argument-trees", {
			title: title.value,
			nodes: thesis.id,
			creator: ownUser.value?.id,
			isUnilateral: true,
			tags: selectedTags.value,
		});

		isModalOpen.value = false;
		refresh();
	};
</script>
<style lang="scss" scoped>
	.withdraw {
		cursor: pointer;
	}
	.grid-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr); /* 3 columns */
		grid-template-rows: repeat(3, 1fr); /* 3 rows */
		gap: 10px; /* Optional: space between grid items */
	}
	.grid-item {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px; /* Optional: padding for visual spacing */
		cursor: pointer;
	}

	.avatar {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 3rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
	}

	.beliefs {
		text-align: center;
		font-size: 2rem;
		margin: 2rem;
	}
</style>
