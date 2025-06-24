<template>
  <UContainer>
    <footer class="mt-10">
      <USeparator>
        Made with ❤️ by&nbsp;
        <ULink to="https://github.com/LouisEiermann" external>
          Louis Eiermann
        </ULink>
      </USeparator>

      <h1>Reason App</h1>
      <div>
        <h2>Support</h2>
        <ULink to="/contact">{{ $t("general.submitBug") }}</ULink>
      </div>
    </footer>
  </UContainer>
</template>
