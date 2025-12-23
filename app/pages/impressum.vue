<template>
  <div class="py-10 space-y-6 max-w-3xl">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold tracking-tight">Impressum</h1>
      <p class="text-sm text-(--ui-text-muted)">
        Angaben gemäß § 5 TMG und Verantwortlicher i.S.d. § 18 Abs. 2 MStV (soweit anwendbar).
      </p>
    </div>

    <UCard>
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Diensteanbieter</h2>
        <div class="text-sm leading-6">
          <p><strong>Name:</strong> Louis Eiermann</p>
          <p><strong>Anschrift:</strong> Saliterstraße 2, 82299 Türkenfeld, Deutschland</p>
          <p>
            <strong>E-Mail:</strong>
            <a class="underline" href="mailto:louis.eiermann@gmail.com">louis.eiermann@gmail.com</a>
          </p>
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Kontakt</h2>
        <div class="text-sm leading-6">
          <p>
            <strong>E-Mail:</strong>
            <a class="underline" href="mailto:louis.eiermann@gmail.com">louis.eiermann@gmail.com</a>
          </p>
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Hinweis zur Tätigkeit</h2>
        <p class="text-sm leading-6">Dies ist ein privates, nicht-kommerzielles Hobbyprojekt.</p>
      </div>
    </UCard>

    <UCard>
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Inhaltliche Verantwortung</h2>
        <p class="text-sm leading-6">
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV (soweit anwendbar):<br />
          <strong>Louis Eiermann, Saliterstraße 2, 82299 Türkenfeld, Deutschland</strong>
        </p>
      </div>
    </UCard>

    <UCard>
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Hinweise</h2>
        <ul class="list-disc pl-5 text-sm leading-6 space-y-1">
          <li>
            <strong>Haftung für Inhalte:</strong> Inhalte werden mit Sorgfalt erstellt; eine Gewähr für Aktualität/Vollständigkeit kann nicht übernommen werden.
          </li>
          <li>
            <strong>Haftung für Links:</strong> Bei externen Links liegt die Verantwortung beim jeweiligen Anbieter.
          </li>
          <li>
            <strong>Urheberrecht:</strong> Inhalte unterliegen dem Urheberrecht, sofern nicht anders angegeben.
          </li>
        </ul>
        <p class="text-sm text-(--ui-text-muted)">
          Hinweis: Diese Vorlage ist keine Rechtsberatung. Passe Pflichtangaben an deine konkrete Rechtsform/Anbieter an.
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Impressum",
});
</script>
