"use strict";

const { randomUUID } = require("crypto");

const FORMAL_FALLACY_TAGS = [
  {
    key: "four_terms",
    name: {
      en: "Four-term fallacy (quaternio terminorum)",
      de: "Vier-Terme-Fehlschluss (quaternio terminorum)",
    },
  },
  {
    key: "undistributed_middle",
    name: { en: "Undistributed middle", de: "Unverteiltes Mittel" },
  },
  { key: "illicit_major", name: { en: "Illicit major", de: "Unzulässiger Oberbegriff" } },
  { key: "illicit_minor", name: { en: "Illicit minor", de: "Unzulässiger Unterbegriff" } },
  {
    key: "exclusive_premises",
    name: { en: "Exclusive premises (two negative premises)", de: "Zwei negative Prämissen" },
  },
  {
    key: "illicit_negative",
    name: {
      en: "Affirmative conclusion from a negative premise",
      de: "Affirmative Konklusion aus negativer Prämisse",
    },
  },
  {
    key: "illicit_affirmative",
    name: {
      en: "Negative conclusion from affirmative premises",
      de: "Negative Konklusion aus affirmativen Prämissen",
    },
  },
  {
    key: "existential_fallacy",
    name: { en: "Existential fallacy", de: "Existenzfehlschluss" },
  },
];

async function mergePremiseGroupTagReferences(strapi, fromId, toId) {
  if (!fromId || !toId || fromId === toId) return;

  const linkTable = "premise_group_tags_premise_groups_lnk";

  const links = await strapi.db
    .connection(linkTable)
    .select(["id", "premise_group_id"])
    .where({ premise_group_tag_id: fromId });

  for (const link of links) {
    const alreadyLinked = await strapi.db
      .connection(linkTable)
      .select(["id"])
      .where({
        premise_group_tag_id: toId,
        premise_group_id: link.premise_group_id,
      })
      .first();

    if (alreadyLinked) {
      await strapi.db.connection(linkTable).where({ id: link.id }).delete();
    } else {
      await strapi.db
        .connection(linkTable)
        .where({ id: link.id })
        .update({ premise_group_tag_id: toId });
    }
  }
}

function isNumericDocumentId(value) {
  if (value === null || value === undefined) return false;
  const s = String(value).trim();
  if (!s) return false;
  return /^[0-9]+(\.[0-9]+)?$/.test(s);
}

async function ensureNonNumericDocumentIdsForFormalFallacies(strapi) {
  const table = "premise_group_tags";

  for (const tag of FORMAL_FALLACY_TAGS) {
    const rows = await strapi.db
      .connection(table)
      .select(["id", "document_id", "locale", "key", "type"])
      .where({ type: "formalFallacy", key: tag.key });

    if (!rows.length) continue;
    const currentDocumentId = rows[0].document_id;
    if (!isNumericDocumentId(currentDocumentId)) continue;

    const newDocumentId = randomUUID();
    await strapi.db
      .connection(table)
      .where({ type: "formalFallacy", key: tag.key })
      .update({ document_id: newDocumentId });
  }
}

async function ensureFormalFallacyTags(strapi) {
  const uid = "api::premise-group-tag.premise-group-tag";
  const table = "premise_group_tags";
  let locales = ["en", "de"];

  try {
    const configuredLocales = await strapi
      .plugin("i18n")
      .service("locales")
      .find();
    const configuredLocaleCodes = (configuredLocales || []).map((l) => l.code);
    locales = locales.filter((l) => configuredLocaleCodes.includes(l));
  } catch {
    locales = ["en"];
  }

  for (const tag of FORMAL_FALLACY_TAGS) {
    try {
      const rows = await strapi.db.connection(table)
        .select(["id", "document_id", "locale", "key", "name", "type"])
        .where({ type: "formalFallacy" })
        .andWhere((qb) => {
          qb.where("key", tag.key)
            .orWhere("name", tag.name.en)
            .orWhere("name", tag.name.de);
        });

      const enRow =
        rows.find((r) => r.name === tag.name.en) ||
        rows.find((r) => r.locale === "en" && r.key === tag.key) ||
        null;
      const deRow =
        rows.find((r) => r.name === tag.name.de) ||
        rows.find((r) => r.locale === "de" && r.key === tag.key) ||
        null;

      let documentId =
        enRow?.document_id || deRow?.document_id || randomUUID();
      if (isNumericDocumentId(documentId)) {
        documentId = randomUUID();
      }
      let ensuredEnId = enRow?.id || null;

      if (locales.includes("en")) {
        if (enRow?.id) {
          await strapi.db.connection(table)
            .where({ id: enRow.id })
            .update({
              key: tag.key,
              name: tag.name.en,
              type: "formalFallacy",
              locale: "en",
              document_id: documentId,
            });
        } else {
          const createdEn = await strapi.entityService.create(uid, {
            locale: "en",
            data: { key: tag.key, type: "formalFallacy", name: tag.name.en },
          });
          ensuredEnId = createdEn.id;
          const createdEnRow = await strapi.db.connection(table)
            .select(["document_id"])
            .where({ id: createdEn.id })
            .first();
          documentId = createdEnRow?.document_id || documentId;
        }
      }

      if (locales.includes("de")) {
        if (deRow?.id) {
          await strapi.db.connection(table)
            .where({ id: deRow.id })
            .update({
              key: tag.key,
              name: tag.name.de,
              type: "formalFallacy",
              locale: "de",
              document_id: documentId,
            });
        } else {
          // If a German-name row exists in the wrong locale, reuse it (name is unique).
          const existingByNameAnyLocale = await strapi.db.connection(table)
            .select(["id"])
            .where({ type: "formalFallacy", name: tag.name.de })
            .first();

          if (existingByNameAnyLocale?.id) {
            await strapi.db.connection(table)
              .where({ id: existingByNameAnyLocale.id })
              .update({
                key: tag.key,
                type: "formalFallacy",
                locale: "de",
                document_id: documentId,
              });
          } else {
            await strapi.entityService.create(uid, {
              locale: "de",
              data: {
                key: tag.key,
                type: "formalFallacy",
                name: tag.name.de,
                ...(ensuredEnId ? { localizations: [ensuredEnId] } : {}),
              },
            });
          }
        }
      }

      // Cleanup: if multiple rows still have the same key, keep the expected EN/DE ones.
      const after = await strapi.db
        .connection(table)
        .select(["id", "locale", "key", "name", "document_id"])
        .where({ type: "formalFallacy", key: tag.key });
      const canonicalDocumentId =
        after.find((r) => r.locale === "en" && r.name === tag.name.en)
          ?.document_id ||
        after.find((r) => r.locale === "en")?.document_id ||
        after[0]?.document_id;

      const keepByLocale = new Map();
      for (const row of after) {
        if (!canonicalDocumentId || row.document_id !== canonicalDocumentId) continue;
        if (!locales.includes(row.locale)) continue;
        if (!keepByLocale.has(row.locale)) {
          keepByLocale.set(row.locale, row);
          continue;
        }

        // Prefer the row whose name matches our expected translation.
        const expectedName = row.locale === "de" ? tag.name.de : tag.name.en;
        const currentKeep = keepByLocale.get(row.locale);
        if (currentKeep.name !== expectedName && row.name === expectedName) {
          keepByLocale.set(row.locale, row);
        }
      }

      const keepIds = new Set([...keepByLocale.values()].map((r) => r.id));

      // Merge & delete any duplicates (including older bad records that matched by name).
      const dupCandidates = await strapi.db
        .connection(table)
        .select(["id", "locale", "key", "name", "document_id"])
        .where({ type: "formalFallacy" })
        .andWhere((qb) => {
          qb.where("key", tag.key)
            .orWhere("name", tag.name.en)
            .orWhere("name", tag.name.de);
        });

      const keepEnId = keepByLocale.get("en")?.id;
      const keepDeId = keepByLocale.get("de")?.id;

      for (const row of dupCandidates) {
        const targetId = row.locale === "de" ? keepDeId : keepEnId;
        if (!targetId || row.id === targetId) continue;

        await mergePremiseGroupTagReferences(strapi, row.id, targetId);
        await strapi.db.connection(table).where({ id: row.id }).delete();
      }
    } catch (error) {
      strapi.log.error(
        `Error ensuring formal fallacy tag "${tag.key}"`,
        error,
      );
    }
  }
}

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // Override fetchAuthenticatedUser to always populate friends and role
    strapi.service("plugin::users-permissions.user").fetchAuthenticatedUser = (
      id,
    ) => {
      return strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { id }, populate: ["role", "friends"] });
    };
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Siehe: https://forum.strapi.io/t/how-can-i-create-user-lifecycle-hooks-in-v4/13144
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],

      async afterCreate(event) {
        const { result } = event;

        const userId = result.id;

        try {
          await strapi.entityService.create(
            "api::user-progress.user-progress",
            {
              data: {
                user: userId,
                stage: 0,
                level: 0,
                completed: false,
              },
            },
          );
        } catch (error) {
          console.error("Error creating userProgress:", error);
        }
      },
    });

    try {
      await ensureFormalFallacyTags(strapi);
      await ensureNonNumericDocumentIdsForFormalFallacies(strapi);
      strapi.log.info("Ensured formal fallacy premise-group-tags");
    } catch (error) {
      strapi.log.error("Error ensuring formal fallacy tags", error);
    }
  },
};
