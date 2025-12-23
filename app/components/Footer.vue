<template>
  <UFooter>
    <template #left>
      <p class="text-sm text-muted">
        Made with ❤️ by&nbsp;
        <ULink to="https://github.com/LouisEiermann" external>
          Louis Eiermann
        </ULink>
      </p>
    </template>

    <UNavigationMenu
      :items="[
        {
          label: 'LogosMap',
          to: '/',
        },
        {
          label: 'Datenschutz',
          to: '/datenschutz',
        },
        {
          label: 'Impressum',
          to: '/impressum',
        },
        {
          label: $t('general.submitBug'),
          to: '/contact',
        },
      ]"
      variant="link"
    />
  </UFooter>
</template>
