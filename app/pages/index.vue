<template>
  <div class="py-10 sm:py-16">
    <section class="relative overflow-hidden rounded-3xl border border-(--ui-border) bg-(--ui-bg)">
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          class="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-(--ui-color-neutral-400)/20 blur-3xl"
        />
      </div>

      <div class="relative px-6 py-12 sm:px-10 sm:py-16">
        <div class="mx-auto max-w-3xl text-center">
          <h1 class="text-3xl sm:text-5xl font-semibold tracking-tight">
            {{ t("landing.headline") }}
          </h1>
          <p class="mt-4 text-base sm:text-lg text-(--ui-text-muted)">
            {{ t("landing.subheadline") }}
          </p>

          <figure class="mt-8 mx-auto max-w-2xl">
            <blockquote
              class="text-base sm:text-lg leading-relaxed text-(--ui-text)"
            >
              {{ t("landing.quote.text") }}
            </blockquote>
            <figcaption class="mt-3 text-sm text-(--ui-text-muted)">
              {{ t("landing.quote.citation") }}
            </figcaption>
          </figure>

          <div class="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <UButton to="/register" size="lg">
              {{ t("account.register") }}
            </UButton>
            <UButton to="/login" size="lg" color="neutral" variant="outline">
              {{ t("account.login") }}
            </UButton>
            <UButton to="/docs" size="lg" color="neutral" variant="ghost">
              {{ t("landing.readDocs") }}
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <section class="mt-10 sm:mt-14">
      <div class="flex items-end justify-between gap-6">
        <div>
          <h2 class="text-xl sm:text-2xl font-semibold">
            {{ t("landing.screenshotsTitle") }}
          </h2>
          <p class="mt-2 text-sm sm:text-base text-(--ui-text-muted)">
            {{ t("landing.screenshotsSubtitle") }}
          </p>
        </div>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <UCard class="overflow-hidden">
          <img
            src="/landing/argument_tree.png"
            :alt="t('landing.screenshot.treeAlt')"
            class="w-full h-auto"
            loading="lazy"
          />
          <div class="mt-4">
            <div class="font-medium">{{ t("landing.screenshot.treeTitle") }}</div>
            <div class="mt-1 text-sm text-(--ui-text-muted)">
              {{ t("landing.screenshot.treeText") }}
            </div>
          </div>
        </UCard>

        <UCard class="overflow-hidden">
          <img
            src="/landing/syllogism.png"
            :alt="t('landing.screenshot.tagsAlt')"
            class="w-full h-auto"
            loading="lazy"
          />
          <div class="mt-4">
            <div class="font-medium">{{ t("landing.screenshot.tagsTitle") }}</div>
            <div class="mt-1 text-sm text-(--ui-text-muted)">
              {{ t("landing.screenshot.tagsText") }}
            </div>
          </div>
        </UCard>

        <UCard class="overflow-hidden">
          <img
            src="/landing/tagging.png"
            :alt="t('landing.screenshot.minimapAlt')"
            class="w-full h-auto"
            loading="lazy"
          />
          <div class="mt-4">
            <div class="font-medium">
              {{ t("landing.screenshot.minimapTitle") }}
            </div>
            <div class="mt-1 text-sm text-(--ui-text-muted)">
              {{ t("landing.screenshot.minimapText") }}
            </div>
          </div>
        </UCard>
      </div>
    </section>

    <section class="mt-10 sm:mt-14">
      <h2 class="text-xl sm:text-2xl font-semibold">
        {{ t("landing.featuresTitle") }}
      </h2>
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard>
          <div class="flex items-start gap-3">
            <div class="mt-0.5">
              <UIcon name="i-heroicons-squares-2x2" class="h-5 w-5" />
            </div>
            <div>
              <div class="font-medium">{{ t("landing.features.mapTitle") }}</div>
              <div class="mt-1 text-sm text-(--ui-text-muted)">
                {{ t("landing.features.mapText") }}
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-start gap-3">
            <div class="mt-0.5">
              <UIcon name="i-heroicons-scale" class="h-5 w-5" />
            </div>
            <div>
              <div class="font-medium">
                {{ t("landing.features.twoPremisesTitle") }}
              </div>
              <div class="mt-1 text-sm text-(--ui-text-muted)">
                {{ t("landing.features.twoPremisesText") }}
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-start gap-3">
            <div class="mt-0.5">
              <UIcon name="i-heroicons-tag" class="h-5 w-5" />
            </div>
            <div>
              <div class="font-medium">{{ t("landing.features.tagsTitle") }}</div>
              <div class="mt-1 text-sm text-(--ui-text-muted)">
                {{ t("landing.features.tagsText") }}
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "redirect",
});

const { t } = useI18n();

useHead({
  title: t("landing.pageTitle"),
});
</script>
