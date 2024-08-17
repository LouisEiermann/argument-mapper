<template>
	<UContainer v-if="socialData">
		<UContainer class="avatar">
			<UAvatar
				v-if="socialData.currentUser.avatar"
				:src="useStrapiMedia(socialData?.currentUser.avatar.url)"
				:alt="socialData?.currentUser.username"
				size="3xl"
			/>
		</UContainer>
		<UContainer>
			<h1 class="text-center mt-8">
				{{ socialData.currentUser.username }}
			</h1>
			<p v-if="socialData">
				Beigetreten: {{ formatDate(socialData?.currentUser.createdAt, locale) }}
			</p>
		</UContainer>
		<UDivider class="my-8" />
		<h1 class="beliefs">Meine Überzeugungen</h1>
		<NewArgumentModal
			:is-open="isModalOpen"
			@refresh="refresh()"
			@update:isOpen="isModalOpen = $event"
		/>
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
					<div class="header">
						<h1>{{ $t("account.settings") }}</h1>
						<UButton
							color="gray"
							variant="ghost"
							icon="i-heroicons-x-mark-20-solid"
							class="-my-1"
							@click="isSettingsOpen = false"
						/>
					</div>
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
		<FriendManagement
			:is-friends-management-open="isFriendsManagementOpen"
			@refresh="refresh()"
			@update:isOpen="isFriendsManagementOpen = $event"
		/>
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

	const { find, create, update, delete: _delete } = useStrapi();
	const client = useStrapiClient();
	const { formatDate } = useDateFormatter();
	const { locale } = useI18n();
	const userStore = useUserStore();
	const ownUser = await userStore.getUser;

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
			return e.opponentAccepted;
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
				limit: 5,
			},
		});

		const standpoints = currentUser.created.filter((e) => {
			return !e.opponentAccepted;
		});

		return {
			sentFriendRequests,
			receivedFriendRequests,
			sentArgumentRequests,
			receivedArgumentRequests,
			suggestedFriends,
			currentUser,
			standpoints,
		};
	});

	const isSettingsOpen = ref(false);
	const isFriendsManagementOpen = ref(false);
	const isModalOpen = ref();

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

	const handleFileChange = async (event: {
		target: { files: (string | Blob)[] };
	}) => {
		const formData = new FormData();

		formData.append("files", event.target.files[0]);
		formData.append("ref", "plugin::users-permissions.user");
		formData.append("refId", socialData.value?.currentUser.id);
		formData.append("field", "avatar");

		await client("/upload", {
			method: "POST",
			body: formData,
		});
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
