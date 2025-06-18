<template>
  <UContainer>
    <footer class="mt-10">
      <USeparator>
        Made with ❤️ by&nbsp;
        <NuxtLink to="https://github.com/LouisEiermann">
          Louis Eiermann</NuxtLink
        >
      </USeparator>

      <h1>Reason App</h1>
      <div>
        <h2>Support</h2>
        <NuxtLink to="/contact">{{ $t("general.submitBug") }}</NuxtLink>
      </div>
    </footer>
  </UContainer>
</template>
