<template>
	<UContainer>
		<UContainer class="avatar">
			<UAvatar
				v-if="socialData?.currentUser?.avatar"
				:src="useStrapiMedia(socialData?.currentUser?.avatar?.url)"
				:alt="socialData?.currentUser?.username"
				size="3xl"
				class="shadow-2xl relative"
			>
				<UButton
					icon="heroicons:cog"
					@click="isSettingsOpen = true"
					class="absolute -top-2 -right-2 z-10"
				/>
			</UAvatar>
		</UContainer>
		<UContainer>
			<h1 class="text-center mt-8 text-2xl">
				{{ socialData?.currentUser?.username }}
			</h1>
			<p v-if="socialData?.currentUser?.createdAt" class="text-center text-sm">
				{{ $t("account.joined") }} :
				{{ formatDate(socialData.currentUser.createdAt, locale) }}
			</p>
		</UContainer>
		<UDivider
			class="my-8"
			label="Meine Überzeugungen"
			:ui="{ label: 'text-4xl' }"
		/>
		<NewArgumentModal
			:is-open="isModalOpen"
			@refresh="refresh"
			@update:isOpen="isModalOpen = $event"
		/>
		<div class="grid-container">
			<UCard
				v-for="standpoint in standpoints"
				:key="standpoint.id"
				class="grid-item"
			>
				{{ standpoint.title }}
				<UButton :to="'/argument/' + standpoint.id">Zum Standpunkt</UButton>
			</UCard>
			<UCard class="grid-item">
				<UButton @click="isModalOpen = true">+</UButton>
			</UCard>
		</div>
		<UDivider
			class="my-8"
			label="Meine Argumente"
			:ui="{ label: 'text-4xl' }"
		/>
		<div
			v-if="sentArgumentRequests?.length || receivedArgumentRequests?.length"
			class="grid-container"
		>
			<UCard
				v-for="argument in sentArgumentRequests"
				:key="argument.id"
				class="grid-item"
			>
				{{ argument.id }}
				<UButton
					:to="'/argument/' + argument.id"
					v-if="argument.opponentAccepted"
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
			<UCard
				v-for="argument in receivedArgumentRequests"
				:key="argument.id"
				class="grid-item"
			>
				{{ argument.id }}
				<UButton
					:to="'/argument/' + argument.id"
					v-if="argument.opponentAccepted"
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
		</div>
		<div v-else>
			<UCard class="text-center">
				<UAlert type="warning" title="Nothing Here!" />
			</UCard>
		</div>
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
			@refresh="refresh"
			@update:isOpen="isFriendsManagementOpen = $event"
		/>
		<div class="flex items-start gap-4 mt-20">
			<div class="flex-1">
				<UDivider label="Freunde" :ui="{ label: 'text-4xl' }" class="mb-4" />
				<UContainer>
					<div
						v-for="friend in socialData?.currentUser?.friends"
						:key="friend.id"
					>
						<div class="container">
							{{ friend.username }}
							<UButton @click="navigateTo(`/users/${friend.id}`)"
								>Nutzerprofil</UButton
							>
							<UButton @click="navigateTo(`/users/${friend.id}/chat`)"
								>Chat</UButton
							>
						</div>
					</div>
				</UContainer>
			</div>
			<UButton
				color="blue"
				class="basis-1/2 ml-4 h-14 px-6 text-lg font-semibold flex items-center justify-center"
				@click="isFriendsManagementOpen = true"
			>
				Freunde hinzufügen
			</UButton>
		</div>
		<div class="flex items-start gap-4">
			<div class="flex-1">
				<UDivider
					label="Achievements"
					:ui="{ label: 'text-4xl' }"
					class="mb-4"
				/>
				<UContainer>
					<div
						v-for="achievement in socialData?.currentUser?.achievements"
						:key="achievement.id"
					>
						{{ achievement.name }}
					</div>
				</UContainer>
			</div>
			<UButton
				color="blue"
				to="/learn"
				class="basis-1/2 ml-4 h-14 px-6 text-lg font-semibold flex items-center justify-center"
			>
				Lernen
			</UButton>
		</div>
	</UContainer>
</template>

<script setup lang="ts">
	definePageMeta({
		middleware: "auth",
	});

	const { find, update, delete: _delete } = useStrapi();
	const client = useStrapiClient();
	const { formatDate } = useDateFormatter();
	const { locale } = useI18n();

	const { data: socialData, refresh } = useAsyncData("socialData", async () => {
		const currentUser = await find("users/me", {
			populate: {
				friends: true,
				created: { populate: { opponent: true, tags: true } },
				isOpponent: true,
				avatar: true,
				achievements: true,
			},
		});

		const currentUserId = currentUser?.data?.id;

		const friendIds =
			currentUser?.data?.friends?.map((friend) => friend.id) || [];

		const excludeIds = [currentUserId, ...friendIds];

		const friendRequests = await find("friend-requests", {
			populate: ["sender", "receiver"],
			filters: {
				$or: [
					{ sender: { id: { $eq: currentUserId } } },
					{ receiver: { id: { $eq: currentUserId } } },
				],
			},
		});

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
			currentUserId,
			friendRequests,
			suggestedFriends,
			currentUser,
		};
	});

	const sentArgumentRequests = computed(() => {
		return (
			socialData.value?.currentUser?.created?.filter((e) => e.opponent) || []
		);
	});

	const receivedArgumentRequests = computed(() => {
		return socialData.value?.currentUser?.isOpponent || [];
	});

	const standpoints = computed(() => {
		return (
			socialData.value?.currentUser?.created?.filter((e) => !e.opponent) || []
		);
	});

	const isSettingsOpen = ref(false);
	const isFriendsManagementOpen = ref(false);
	const isModalOpen = ref(false);

	const acceptArgumentRequest = async (id) => {
		await update("argument-trees", id, { opponentAccepted: true });
		refresh();
	};

	const rejectArgumentRequest = async (id) => {
		await _delete("argument-trees", id);
		refresh();
	};

	const withdrawArgumentRequest = async (id) => {
		await _delete("argument-trees", id);
		refresh();
	};

	const onDeleteUser = async () => {
		try {
			await client(`/users/${socialData.value?.currentUser.id}`, {
				method: "DELETE",
			});

			await navigateTo("/");
		} catch (e) {
			console.error(e);
		}
	};

	const handleFileChange = async (event) => {
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
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
	}
	.grid-item {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
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
</style>
