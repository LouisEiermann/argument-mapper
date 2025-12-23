<template>
  <div class="py-10 space-y-6 max-w-3xl">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold tracking-tight">Datenschutzerklärung</h1>
      <p class="text-sm text-(--ui-text-muted)">
        Stand: {{ lastUpdated }}
      </p>
    </div>

    <UCard>
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">1. Verantwortlicher</h2>
        <div class="text-sm leading-6">
          <p><strong>Name:</strong> [Dein Name / Organisation]</p>
          <p><strong>Anschrift:</strong> [Straße, PLZ Ort, Land]</p>
          <p><strong>E-Mail:</strong> [Kontaktadresse]</p>
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">2. Überblick: Welche Daten verarbeiten wir?</h2>
        <ul class="list-disc pl-5 text-sm leading-6 space-y-1">
          <li><strong>Zugriffsdaten/Server-Logs:</strong> z.B. IP-Adresse, Zeitstempel, aufgerufene URL, User-Agent.</li>
          <li><strong>Account-Daten (falls Registrierung/Login):</strong> z.B. Benutzername, E-Mail (und weitere von dir abgefragte Felder).</li>
          <li><strong>Nutzungsinhalte:</strong> Inhalte, die du in der App erstellst (z.B. Argumente, Kommentare), inklusive Metadaten.</li>
          <li><strong>Cookies (technisch notwendig):</strong> siehe Abschnitt 6.</li>
        </ul>
      </div>
    </UCard>

    <UCard>
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">3. Zwecke und Rechtsgrundlagen</h2>
        <ul class="list-disc pl-5 text-sm leading-6 space-y-2">
          <li>
            <strong>Bereitstellung der Website/App, IT-Sicherheit, Fehleranalyse</strong><br />
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
          </li>
          <li>
            <strong>Registrierung, Login, Account-Verwaltung</strong><br />
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertrag/vertragsähnliche Nutzung).
          </li>
          <li>
            <strong>Bereitstellung von App-Funktionen (z.B. Speichern von Inhalten)</strong><br />
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
          </li>
          <li>
            <strong>Kommunikation bei Anfragen (z.B. Support/Kontakt)</strong><br />
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b oder lit. f DSGVO (je nach Kontext).
          </li>
        </ul>
        <p class="text-sm text-(--ui-text-muted)">
          Hinweis: Diese Vorlage ist keine Rechtsberatung. Bitte prüfe sie mit deinen tatsächlichen Verarbeitungen (Hosting, E-Mail, Datenbank, Drittanbieter).
        </p>
      </div>
    </UCard>

    <UCard>
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">4. Empfänger / Auftragsverarbeiter</h2>
        <p class="text-sm leading-6">
          Für Hosting und Betrieb können Dienstleister (Auftragsverarbeiter) eingesetzt werden.
          Trage hier deine Anbieter ein:
        </p>
        <div class="text-sm leading-6">
          <p><strong>Hosting:</strong> [Anbieter + Sitz/Land]</p>
          <p><strong>Datenbank/Storage:</strong> [Anbieter + Sitz/Land]</p>
          <p><strong>E-Mail (falls genutzt):</strong> [Anbieter + Sitz/Land]</p>
        </div>
        <p class="text-sm leading-6">
          Mit Auftragsverarbeitern werden i.d.R. Verträge zur Auftragsverarbeitung (AVV) geschlossen.
        </p>
      </div>
    </UCard>

    <UCard>
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">5. Speicherdauer</h2>
        <ul class="list-disc pl-5 text-sm leading-6 space-y-1">
          <li>Server-Logs: [z.B. 7–30 Tage] (abhängig von Hosting/IT-Sicherheitsbedarf).</li>
          <li>Account-Daten: bis zur Löschung des Accounts oder solange erforderlich.</li>
          <li>Inhalte/Nutzungsdaten: solange sie für die Nutzung benötigt werden oder bis zur Löschung.</li>
        </ul>
      </div>
    </UCard>

    <UCard>
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">6. Cookies</h2>
        <p class="text-sm leading-6">
          Wir verwenden derzeit nur technisch notwendige Cookies. Es findet kein Tracking/Analytics statt.
        </p>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left border-b border-(--ui-border)">
                <th class="py-2 pr-3">Name</th>
                <th class="py-2 pr-3">Zweck</th>
                <th class="py-2 pr-3">Typ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-(--ui-border)">
              <tr>
                <td class="py-2 pr-3 font-mono">ncc_c</td>
                <td class="py-2 pr-3">Speichert, ob eine Cookie-Entscheidung getroffen wurde.</td>
                <td class="py-2 pr-3">notwendig</td>
              </tr>
              <tr>
                <td class="py-2 pr-3 font-mono">ncc_e</td>
                <td class="py-2 pr-3">Speichert die aktivierten Cookie-Kategorien.</td>
                <td class="py-2 pr-3">notwendig</td>
              </tr>
              <tr>
                <td class="py-2 pr-3 font-mono">i18n_redirected</td>
                <td class="py-2 pr-3">Speichert die Spracheinstellung für Weiterleitungen.</td>
                <td class="py-2 pr-3">notwendig</td>
              </tr>
              <tr>
                <td class="py-2 pr-3 font-mono">redirect</td>
                <td class="py-2 pr-3">Speichert die Zielseite, um nach dem Login dorthin zurückzukehren.</td>
                <td class="py-2 pr-3">notwendig</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-sm leading-6">
          Rechtsgrundlage (Cookies): § 25 Abs. 2 TTDSG (technisch erforderlich) i.V.m. Art. 6 Abs. 1 lit. b/f DSGVO.
        </p>
      </div>
    </UCard>

    <UCard>
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">7. Deine Rechte</h2>
        <ul class="list-disc pl-5 text-sm leading-6 space-y-1">
          <li>Auskunft (Art. 15 DSGVO)</li>
          <li>Berichtigung (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch (Art. 21 DSGVO)</li>
          <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
        </ul>
        <p class="text-sm leading-6">
          Zur Ausübung deiner Rechte kontaktiere uns unter: <strong>[Kontaktadresse]</strong>
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const lastUpdated = "2025-12-23";

useHead({
  title: "Datenschutzerklärung",
});
</script>

