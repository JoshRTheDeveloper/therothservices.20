import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Pick: a
    .model({
      season: a.integer().required(),
      seasonType: a.integer().required(),
      week: a.integer().required(),
      gameId: a.string().required(),
      pickedTeamAbbr: a.string().required(),
      pickerName: a.string().required(),
    })
    .secondaryIndexes((index) => [
      index("seasonType")
        .sortKeys(["season", "week"])
        .queryField("listPicksBySeasonType"),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
