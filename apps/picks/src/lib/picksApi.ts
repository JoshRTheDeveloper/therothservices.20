import { getCurrentUserId, getPickerName } from "./auth";
import type { SeasonType } from "./espn";

export type PickMap = Record<string, string>;

export type CloudPick = {
  id: string;
  owner: string;
  season: number;
  seasonType: number;
  week: number;
  gameId: string;
  pickedTeamAbbr: string;
  pickerName: string;
};

type PickRecord = CloudPick & {
  id?: string | null;
  owner?: string | null;
};

type ListResult = {
  data: PickRecord[] | null;
  errors?: Array<{ message: string }> | null;
  nextToken?: string | null;
};

type MutationResult = {
  data: PickRecord | null;
  errors?: Array<{ message: string }> | null;
};

type PicksClient = {
  models: {
    Pick: {
      list: (args: unknown) => Promise<ListResult>;
      create: (input: {
        season: number;
        seasonType: number;
        week: number;
        gameId: string;
        pickedTeamAbbr: string;
        pickerName: string;
      }) => Promise<MutationResult>;
      update: (input: {
        id: string;
        pickedTeamAbbr?: string;
        pickerName?: string;
      }) => Promise<MutationResult>;
    };
  };
};

async function cloudClient(): Promise<PicksClient> {
  const { generateClient } = await import("aws-amplify/data");
  return generateClient() as unknown as PicksClient;
}

export function pickKey(
  season: number,
  week: number,
  gameId: string,
  seasonType: SeasonType = 1
) {
  return `${season}-t${seasonType}-w${week}-${gameId}`;
}

function toMap(records: PickRecord[]): {
  map: PickMap;
  ids: Record<string, string>;
} {
  const map: PickMap = {};
  const ids: Record<string, string> = {};

  for (const record of records) {
    if (!record.gameId || !record.pickedTeamAbbr || !record.id) continue;
    const key = pickKey(
      record.season,
      record.week,
      record.gameId,
      record.seasonType as SeasonType
    );
    map[key] = record.pickedTeamAbbr;
    ids[key] = record.id;
  }

  return { map, ids };
}

async function listAll(filter: Record<string, unknown>): Promise<PickRecord[]> {
  const client = await cloudClient();
  const records: PickRecord[] = [];
  let nextToken: string | undefined;

  do {
    const { data, errors, nextToken: token } = await client.models.Pick.list({
      filter,
      nextToken,
    });

    if (errors?.length) {
      throw new Error(
        errors.map((error) => error.message).join("; ") || "Failed to load picks"
      );
    }

    records.push(...(data ?? []));
    nextToken = token ?? undefined;
  } while (nextToken);

  return records;
}

export async function loadWeekPicks(
  season: number,
  week: number,
  seasonType: SeasonType = 1
) {
  const userId = await getCurrentUserId();
  const records = await listAll({
    and: [
      { season: { eq: season } },
      { week: { eq: week } },
      { seasonType: { eq: seasonType } },
    ],
  });

  const mine = records.filter((record) => record.owner === userId);
  return toMap(mine);
}

export async function listWeekCloudPicks(
  season: number,
  week: number,
  seasonType: SeasonType = 1
): Promise<CloudPick[]> {
  const records = await listAll({
    and: [
      { season: { eq: season } },
      { week: { eq: week } },
      { seasonType: { eq: seasonType } },
    ],
  });

  return records.flatMap((record) => {
    if (
      !record.id ||
      !record.owner ||
      !record.gameId ||
      !record.pickedTeamAbbr ||
      !record.pickerName
    ) {
      return [];
    }

    return [
      {
        id: record.id,
        owner: record.owner,
        season: record.season,
        seasonType: record.seasonType,
        week: record.week,
        gameId: record.gameId,
        pickedTeamAbbr: record.pickedTeamAbbr,
        pickerName: record.pickerName,
      },
    ];
  });
}

export async function listSeasonPicks(
  season: number,
  seasonType: SeasonType
): Promise<CloudPick[]> {
  const records = await listAll({
    and: [
      { season: { eq: season } },
      { seasonType: { eq: seasonType } },
    ],
  });

  return records.flatMap((record) => {
    if (
      !record.id ||
      !record.owner ||
      !record.gameId ||
      !record.pickedTeamAbbr ||
      !record.pickerName
    ) {
      return [];
    }

    return [
      {
        id: record.id,
        owner: record.owner,
        season: record.season,
        seasonType: record.seasonType,
        week: record.week,
        gameId: record.gameId,
        pickedTeamAbbr: record.pickedTeamAbbr,
        pickerName: record.pickerName,
      },
    ];
  });
}

export async function upsertPick(options: {
  season: number;
  week: number;
  gameId: string;
  abbr: string;
  seasonType?: SeasonType;
  existingId?: string;
}) {
  const { season, week, gameId, abbr, existingId, seasonType = 1 } = options;
  const client = await cloudClient();

  if (existingId) {
    const { data, errors } = await client.models.Pick.update({
      id: existingId,
      pickedTeamAbbr: abbr,
    });

    if (errors?.length) {
      throw new Error(
        errors.map((error) => error.message).join("; ") || "Failed to update pick"
      );
    }

    return data?.id ?? existingId;
  }

  const pickerName = await getPickerName();
  const { data, errors } = await client.models.Pick.create({
    season,
    seasonType,
    week,
    gameId,
    pickedTeamAbbr: abbr,
    pickerName,
  });

  if (errors?.length) {
    throw new Error(
      errors.map((error) => error.message).join("; ") || "Failed to save pick"
    );
  }

  if (!data?.id) {
    throw new Error("Pick saved but no id returned");
  }

  return data.id;
}

export async function renameMyPicks(pickerName: string) {
  const userId = await getCurrentUserId();
  const records = await listAll({});
  const client = await cloudClient();

  for (const record of records) {
    if (record.owner !== userId || !record.id) continue;
    if (record.pickerName === pickerName) continue;
    const { errors } = await client.models.Pick.update({
      id: record.id,
      pickerName,
    });
    if (errors?.length) {
      throw new Error(
        errors.map((error) => error.message).join("; ") || "Failed to rename picks"
      );
    }
  }
}
