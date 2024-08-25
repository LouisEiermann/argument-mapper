<template>
	<UContainer>
		<footer>
			<h1>Reason App</h1>
			<div>
				<h2>Support</h2>
				<NuxtLink to="/support">Submit a Bug</NuxtLink>
				<NuxtLink to="/">test</NuxtLink>
				<NuxtLink to="/">test</NuxtLink>
			</div>
			<UDivider />
			<p>Made with ❤️ by Louis Eiermann</p>
		</footer>
	</UContainer>
</template>
<style lang="scss" scoped>
	footer {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}
</style>
