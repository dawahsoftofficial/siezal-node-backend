import { BRANCH_TIME_PATTERN, BRANCH_WEEK_DAYS } from "./branch.constants";
import type {
  IBranchDaySchedule,
  IBranchWeeklySchedule,
} from "./interface/branch.interface";

type BranchWeeklyScheduleInput = Partial<
  Record<keyof IBranchWeeklySchedule, Partial<IBranchDaySchedule> | undefined>
>;

const createDefaultDaySchedule = (): IBranchDaySchedule => ({
  isOpen: false,
  startTime: null,
  endTime: null,
});

const normalizeTimeValue = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!BRANCH_TIME_PATTERN.test(trimmedValue)) {
    return null;
  }

  return trimmedValue;
};

export const createDefaultBranchWeeklySchedule =
  (): IBranchWeeklySchedule => {
    return BRANCH_WEEK_DAYS.reduce(
      (accumulator, day) => {
        accumulator[day] = createDefaultDaySchedule();

        return accumulator;
      },
      {} as IBranchWeeklySchedule,
    );
  };

export const normalizeBranchWeeklySchedule = (
  schedule?: BranchWeeklyScheduleInput | null,
): IBranchWeeklySchedule => {
  const defaultSchedule = createDefaultBranchWeeklySchedule();

  return BRANCH_WEEK_DAYS.reduce(
    (accumulator, day) => {
      const daySchedule = schedule?.[day];
      const isOpen = Boolean(daySchedule?.isOpen);

      accumulator[day] = {
        isOpen,
        startTime: isOpen ? normalizeTimeValue(daySchedule?.startTime) : null,
        endTime: isOpen ? normalizeTimeValue(daySchedule?.endTime) : null,
      };

      return accumulator;
    },
    { ...defaultSchedule },
  );
};

export const normalizeBranchDeliveryAreas = (
  deliveryAreas?: string[] | null,
) => {
  return Array.from(
    new Set(
      (deliveryAreas || [])
        .map(area => area?.trim())
        .filter((area): area is string => Boolean(area)),
    ),
  );
};
